const express = require('express');
const db = require('../config/db');

const router = express.Router();

// Get All Products (Public - Active Only / Admin - All)
router.get('/', async (req, res) => {
    const isAdmin = req.query.admin === 'true'; // Simple check for now
    try {
        let query = 'SELECT * FROM products';
        if (!isAdmin) {
            query += ' WHERE is_active = TRUE';
        }
        query += ' ORDER BY created_at DESC';

        const [products] = await db.query(query);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get Single Product
router.get('/:id', async (req, res) => {
    try {
        const [products] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (products.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(products[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Create Product (Admin)
router.post('/', async (req, res) => {
    const { name, type, price, cost, description, is_active } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO products (name, type, price, cost, description, is_active) VALUES (?, ?, ?, ?, ?, ?)',
            [name, type, price, cost, description, is_active ? 1 : 0]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Update Product
router.put('/:id', async (req, res) => {
    const { name, type, price, cost, description, is_active } = req.body;
    try {
        await db.query(
            'UPDATE products SET name=?, type=?, price=?, cost=?, description=?, is_active=? WHERE id=?',
            [name, type, price, cost, description, is_active ? 1 : 0, req.params.id]
        );
        res.json({ message: 'Product updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Delete Product
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ message: 'Product removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
