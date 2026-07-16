const express = require('express');
const db = require('../config/db');

const router = express.Router();

// Get Dashboard Stats
router.get('/stats', async (req, res) => {
    try {
        // Active Subscriptions
        const [subs] = await db.query("SELECT COUNT(*) as count FROM subscriptions WHERE status IN ('In Progress', 'Confirmed')");

        // Pending Invoices
        const [invs] = await db.query("SELECT COUNT(*) as count FROM invoices WHERE status = 'Draft' OR status = 'Sent'");

        // Today's Collections (Payments)
        // Check `payments` table. Assuming it exists and has date.
        const today = new Date().toISOString().split('T')[0];
        const [payments] = await db.query("SELECT SUM(amount) as total FROM payments WHERE date = ?", [today]);

        res.json({
            activeSubscriptions: subs[0].count,
            pendingInvoices: invs[0].count,
            todaysCollections: payments[0].total || 0
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
