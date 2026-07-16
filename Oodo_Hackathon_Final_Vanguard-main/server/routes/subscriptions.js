const express = require('express');
const db = require('../config/db');

const router = express.Router();

// Get All Subscriptions
router.get('/', async (req, res) => {
    try {
        // Fetch subscriptions with customer name
        const query = `
            SELECT s.*, u.name as customer_name
            FROM subscriptions s
            JOIN users u ON s.customer_id = u.id
            ORDER BY s.created_at DESC
        `;
        const [subscriptions] = await db.query(query);

        // Fetch lines and history for each subscription
        // This is inefficient (N+1), but simple for now. Optimize with JOINs if needed.
        for (let sub of subscriptions) {
            const [lines] = await db.query('SELECT sl.*, p.name as product_name FROM subscription_lines sl JOIN products p ON sl.product_id = p.id WHERE subscription_id = ?', [sub.id]);
            sub.orderLines = lines.map(line => ({
                product: line.product_name,
                productId: line.product_id,
                quantity: line.quantity,
                unitPrice: line.unit_price,
                subtotal: line.subtotal
            }));

            // Fetch Invoice History
            const [history] = await db.query('SELECT * FROM invoices WHERE subscription_id = ? ORDER BY created_at DESC', [sub.id]);
            sub.history = history.map(h => ({
                date: new Date(h.created_at).toISOString(),
                type: 'Invoice',
                reference: h.invoice_number,
                amount: h.amount,
                status: h.status
            }));

            // Format ID for frontend
            sub.id = `S${String(sub.id).padStart(4, '0')}`;
            sub.customer = sub.customer_name;
            sub.recurring = `$${sub.recurring_amount}`;
            sub.nextInvoice = sub.next_invoice_date ? new Date(sub.next_invoice_date).toLocaleDateString() : 'N/A';
        }

        res.json(subscriptions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get Single Subscription
router.get('/:id', async (req, res) => {
    const passedId = req.params.id;
    const dbId = passedId.startsWith('S') ? parseInt(passedId.replace('S', '')) : parseInt(passedId);

    try {
        const [subs] = await db.query('SELECT s.*, u.name as customer_name, u.email as customer_email, u.address as customer_address FROM subscriptions s JOIN users u ON s.customer_id = u.id WHERE s.id = ?', [dbId]);

        if (subs.length === 0) return res.status(404).json({ message: 'Subscription not found' });

        const sub = subs[0];

        // Fetch Lines
        const [lines] = await db.query('SELECT sl.*, p.name as product_name FROM subscription_lines sl JOIN products p ON sl.product_id = p.id WHERE subscription_id = ?', [dbId]);

        // Fetch Invoices
        const [invoices] = await db.query('SELECT * FROM invoices WHERE subscription_id = ? ORDER BY created_at DESC', [dbId]);

        const formatted = {
            id: `S${String(sub.id).padStart(4, '0')}`,
            status: sub.status,
            date: new Date(sub.created_at).toLocaleDateString(),
            recurring_amount: sub.recurring_amount,
            customer: {
                name: sub.customer_name,
                email: sub.customer_email,
                address: sub.customer_address
            },
            lines: lines.map(l => ({
                product: l.product_name,
                quantity: l.quantity,
                unitPrice: l.unit_price,
                subtotal: l.subtotal
            })),
            invoices: invoices.map(inv => ({
                id: inv.invoice_number,
                date: new Date(inv.date).toLocaleDateString(),
                status: inv.status,
                amount: inv.amount
            }))
        };

        res.json(formatted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Create Subscription
router.post('/', async (req, res) => {
    const { customer_id, plan, start_date, payment_term, sales_person, orderLines } = req.body;

    // Calculate recurring amount
    const recurring_amount = orderLines.reduce((acc, item) => acc + (parseFloat(item.subtotal) || 0), 0);

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Insert Subscription
        const [result] = await connection.query(
            'INSERT INTO subscriptions (customer_id, plan, start_date, recurring_amount, status, payment_term, sales_person) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [customer_id, plan, start_date, recurring_amount, 'Quotation', payment_term, sales_person]
        );
        const subscriptionId = result.insertId;

        // Insert Lines
        for (const line of orderLines) {
            // Find product ID by name if not provided (handling frontend string logic)
            // Ideally frontend sends IDs. For now assuming we might need to lookup or it's passed.
            // Let's assume frontend sends full objects, or we might need to handle new products.
            // For simplicity, strict assumption: line has productId or we skip.
            // Wait, existing frontend allows typing new products. We should handle that or map existing.

            let productId = line.productId;
            if (!productId) {
                // Try to find by name
                const [prods] = await connection.query('SELECT id FROM products WHERE name = ?', [line.product]);
                if (prods.length > 0) productId = prods[0].id;
                else {
                    // Create new product if not exists? Or default?
                    // Let's skip valid ID enforcement for this demo if needed, but schema requires it.
                    // Fallback to ID 1 (Basic) if not found is risky.
                    // Let's create a temporary product
                    const [newProd] = await connection.query('INSERT INTO products (name, price, type) VALUES (?, ?, ?)', [line.product, line.unitPrice, 'service']);
                    productId = newProd.insertId;
                }
            }

            await connection.query(
                'INSERT INTO subscription_lines (subscription_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)',
                [subscriptionId, productId, line.quantity, line.unitPrice, line.subtotal]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'Subscription Created', id: subscriptionId });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    } finally {
        connection.release();
    }
});

// Update Status / Confirm
router.patch('/:id/status', async (req, res) => {
    const { status } = req.body;
    // Strip "S" prefix from ID
    const dbId = parseInt(req.params.id.replace('S', ''));

    try {
        await db.query('UPDATE subscriptions SET status = ? WHERE id = ?', [status, dbId]);
        res.json({ message: 'Status updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Update Subscription (Full Update - mainly for Quotations)
router.put('/:id', async (req, res) => {
    const dbId = parseInt(req.params.id.replace('S', ''));
    const { customer_id, plan, start_date, payment_term, sales_person, orderLines } = req.body;

    // Calculate recurring amount
    const recurring_amount = orderLines.reduce((acc, item) => acc + (parseFloat(item.subtotal) || 0), 0);

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Update Subscription Details
        await connection.query(
            'UPDATE subscriptions SET customer_id=?, plan=?, start_date=?, recurring_amount=?, payment_term=?, sales_person=? WHERE id=?',
            [customer_id, plan, start_date, recurring_amount, payment_term, sales_person, dbId]
        );

        // Delete existing lines and re-insert (Simple approach)
        await connection.query('DELETE FROM subscription_lines WHERE subscription_id = ?', [dbId]);

        // Insert Lines
        for (const line of orderLines) {
            let productId = line.productId;
            if (!productId) {
                const [prods] = await connection.query('SELECT id FROM products WHERE name = ?', [line.product]);
                if (prods.length > 0) productId = prods[0].id;
                else {
                    const [newProd] = await connection.query('INSERT INTO products (name, price, type) VALUES (?, ?, ?)', [line.product, line.unitPrice, 'service']);
                    productId = newProd.insertId;
                }
            }

            await connection.query(
                'INSERT INTO subscription_lines (subscription_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)',
                [dbId, productId, line.quantity, line.unitPrice, line.subtotal]
            );
        }

        await connection.commit();
        res.json({ message: 'Subscription Updated' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    } finally {
        connection.release();
    }
});

// Delete Subscription
router.delete('/:id', async (req, res) => {
    const dbId = parseInt(req.params.id.replace('S', ''));
    try {
        await db.query('DELETE FROM subscriptions WHERE id = ?', [dbId]);
        res.json({ message: 'Subscription deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
