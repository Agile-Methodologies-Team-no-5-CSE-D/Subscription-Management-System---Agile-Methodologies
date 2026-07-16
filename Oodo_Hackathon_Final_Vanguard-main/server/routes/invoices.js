const express = require('express');
const db = require('../config/db');

const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Get My Invoices
router.get('/my', protect, async (req, res) => {
    try {
        let query = `
            SELECT i.*, u.name as customer_name, s.plan
            FROM invoices i
            JOIN users u ON i.customer_id = u.id
            LEFT JOIN subscriptions s ON i.subscription_id = s.id
            WHERE i.customer_id = ?
            ORDER BY i.created_at DESC
        `;
        const [invoices] = await db.query(query, [req.user.id]);

        const formattedInvoices = invoices.map(inv => ({
            id: inv.invoice_number,
            customer: inv.customer_name,
            subscription: inv.subscription_id ? `S${String(inv.subscription_id).padStart(4, '0')}` : 'N/A',
            date: new Date(inv.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            dueDate: new Date(inv.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            amount: `$${inv.amount}`,
            status: inv.status,
            paymentHistory: []
        }));

        res.json(formattedInvoices);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get Invoices (All or by Subscription)
router.get('/', async (req, res) => {
    try {
        let query = `
            SELECT i.*, u.name as customer_name, s.plan
            FROM invoices i
            JOIN users u ON i.customer_id = u.id
            LEFT JOIN subscriptions s ON i.subscription_id = s.id
            ORDER BY i.created_at DESC
        `;
        const [invoices] = await db.query(query);

        const formattedInvoices = invoices.map(inv => ({
            id: inv.invoice_number,
            customer: inv.customer_name,
            subscription: inv.subscription_id ? `S${String(inv.subscription_id).padStart(4, '0')}` : 'N/A',
            date: new Date(inv.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            dueDate: new Date(inv.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            amount: `$${inv.amount}`,
            status: inv.status,
            paymentHistory: [] // Can fetch if needed
        }));

        res.json(formattedInvoices);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get Single Invoice
router.get('/:id', protect, async (req, res) => {
    try {
        const [invoices] = await db.query(
            `SELECT i.*, u.name as customer_name, u.email as customer_email, u.address as customer_address, u.phone as customer_phone, s.plan
             FROM invoices i
             JOIN users u ON i.customer_id = u.id
             LEFT JOIN subscriptions s ON i.subscription_id = s.id
             WHERE i.invoice_number = ?`,
            [req.params.id]
        );

        if (invoices.length === 0) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        const inv = invoices[0];
        // Security check
        if (req.user.role !== 'admin' && inv.customer_id !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Fetch lines if subscription exists
        let lines = [];
        if (inv.subscription_id) {
            const [subLines] = await db.query(
                `SELECT sl.*, p.name as product_name 
                  FROM subscription_lines sl
                  JOIN products p ON sl.product_id = p.id
                  WHERE sl.subscription_id = ?`,
                [inv.subscription_id]
            );
            lines = subLines;
        }

        // Fetch payments
        const [payments] = await db.query('SELECT * FROM payments WHERE invoice_id = ?', [inv.id]);

        const formattedInvoice = {
            id: inv.invoice_number,
            customer: {
                name: inv.customer_name,
                email: inv.customer_email,
                address: inv.customer_address,
                phone: inv.customer_phone
            },
            subscription: inv.subscription_id ? `S${String(inv.subscription_id).padStart(4, '0')}` : 'N/A',
            date: new Date(inv.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            dueDate: new Date(inv.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            amount: inv.amount,
            status: inv.status,
            lines: lines.map(l => ({
                product: l.product_name,
                quantity: l.quantity,
                price: l.unit_price,
                subtotal: l.subtotal
            })),
            paymentHistory: payments
        };

        res.json(formattedInvoice);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Create Invoice (From Subscription)
router.post('/', async (req, res) => {
    const { subscription_id, customer_id, amount, date, due_date } = req.body;

    // Generate Invoice Number (Simple logic)
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 900) + 100;
    const invoice_number = `INV/${year}/${random}`;

    try {
        const [result] = await db.query(
            'INSERT INTO invoices (invoice_number, subscription_id, customer_id, amount, date, due_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [invoice_number, subscription_id, customer_id, amount, date, due_date, 'Draft']
        );
        res.status(201).json({
            id: invoice_number,
            dbId: result.insertId,
            status: 'Draft'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Update Invoice Status
router.patch('/:id/status', async (req, res) => {
    const { status } = req.body;
    const invoiceId = req.params.id; // Expecting INV/2026/xxx format

    try {
        await db.query('UPDATE invoices SET status = ? WHERE invoice_number = ?', [status, invoiceId]);
        res.json({ message: 'Status updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Pay Invoice
router.post('/:id/pay', protect, async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Check if invoice exists
        const [invoices] = await connection.query('SELECT * FROM invoices WHERE invoice_number = ?', [req.params.id]);
        if (invoices.length === 0) {
            connection.release();
            return res.status(404).json({ message: 'Invoice not found' });
        }
        const invoice = invoices[0];

        // Security check
        if (req.user.role !== 'admin' && invoice.customer_id !== req.user.id) {
            connection.release();
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (invoice.status === 'Paid') {
            connection.release();
            return res.status(400).json({ message: 'Invoice already paid' });
        }

        // Update Invoice Status
        await connection.query('UPDATE invoices SET status = ? WHERE invoice_number = ?', ['Paid', req.params.id]);

        // Record Payment
        await connection.query(
            'INSERT INTO payments (invoice_id, date, amount, method, reference) VALUES (?, ?, ?, ?, ?)',
            [invoice.id, new Date(), invoice.amount, 'Credit Card', `PAY-${Date.now()}`]
        );

        await connection.commit();
        res.json({ message: 'Payment successful' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    } finally {
        connection.release();
    }
});

module.exports = router;
