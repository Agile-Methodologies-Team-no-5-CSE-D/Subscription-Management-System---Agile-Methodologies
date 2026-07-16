const express = require('express');
const db = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Get Cart Items
router.get('/', protect, async (req, res) => {
    try {
        const [items] = await db.query(
            `SELECT c.id, c.product_id, c.quantity, p.name, p.price, p.image_url 
             FROM cart c 
             JOIN products p ON c.product_id = p.id 
             WHERE c.user_id = ?`,
            [req.user.id]
        );
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Add to Cart
router.post('/', protect, async (req, res) => {
    const { productId, quantity } = req.body;
    try {
        // Check if item exists
        const [existing] = await db.query(
            'SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?',
            [req.user.id, productId]
        );

        if (existing.length > 0) {
            const newQty = existing[0].quantity + (quantity || 1);
            await db.query('UPDATE cart SET quantity = ? WHERE id = ?', [newQty, existing[0].id]);
        } else {
            await db.query(
                'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
                [req.user.id, productId, quantity || 1]
            );
        }
        res.json({ message: 'Item added to cart' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message, stack: error.stack });
    }
});

// Update Cart Item
router.put('/:id', protect, async (req, res) => {
    const { quantity } = req.body;
    try {
        await db.query('UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?', [quantity, req.params.id, req.user.id]);
        res.json({ message: 'Cart updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Remove Item
router.delete('/:id', protect, async (req, res) => {
    try {
        await db.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ message: 'Item removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
