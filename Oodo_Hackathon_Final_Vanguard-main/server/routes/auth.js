const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');

const router = express.Router();

// Generate Token
const generateToken = (id, email, role) => {
    return jwt.sign({ id, email, role }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

// Register
router.post('/register', async (req, res) => {
    const { name, email, password, role, company, address } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    try {
        const [userExists] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (userExists.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const validRole = ['admin', 'user', 'internal_staff'].includes(role) ? role : 'user';

        const [result] = await db.query(
            'INSERT INTO users (name, email, password_hash, role, company, address) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword, validRole, company || '', address || '']
        );

        res.status(201).json({
            id: String(result.insertId),
            name,
            email,
            role: validRole,
            token: generateToken(result.insertId, email, validRole),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        // Check hashed password (new system) or plain text (legacy setup like admin123)
        let isMatch = false;
        if (user.password_hash) {
            isMatch = await bcrypt.compare(password, user.password_hash);
        } else if (user.password) {
            isMatch = user.password === password;
        }

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.json({
            id: String(user.id),
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id, user.email, user.role),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Request Password Reset (OTP)
router.post('/request-password-reset', async (req, res) => {
    const { email } = req.body;
    try {
        const [users] = await db.query('SELECT id, email FROM users WHERE email = ?', [email]);

        // Always respond with success to avoid user enumeration
        if (users.length === 0) {
            return res.json({ message: 'If the email exists, an OTP has been sent.' });
        }

        const user = users[0];
        const otp = crypto.randomInt(100000, 1000000).toString(); // 6-digit OTP
        const otpHash = await bcrypt.hash(otp, 10);

        // OTP expires in 10 minutes
        await db.query(
            'INSERT INTO password_resets (user_id, otp_hash, expires_at, used) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE), 0)',
            [user.id, otpHash]
        );

        // Replace this with email/SMS delivery in production
        console.log(`OTP for ${user.email}: ${otp}`);

        res.json({
            message: 'If the email exists, an OTP has been sent.',
            ...(process.env.SHOW_OTP === 'true' ? { otp } : { otp }) // For hackathon convenience, we might want to return it or check logs
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    try {
        const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(400).json({ message: 'Invalid OTP' });

        const userId = users[0].id;
        const [rows] = await db.query(
            'SELECT id, otp_hash, expires_at, used FROM password_resets WHERE user_id = ? ORDER BY id DESC LIMIT 1',
            [userId]
        );

        if (rows.length === 0) return res.status(400).json({ message: 'Invalid OTP' });

        const record = rows[0];
        if (record.used) return res.status(400).json({ message: 'OTP already used' });
        if (new Date(record.expires_at).getTime() < Date.now()) {
            return res.status(400).json({ message: 'OTP expired' });
        }

        const isMatch = await bcrypt.compare(otp, record.otp_hash);
        if (!isMatch) return res.status(400).json({ message: 'Invalid OTP' });

        res.json({ verified: true, message: 'OTP verified' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(400).json({ message: 'Invalid OTP' });

        const userId = users[0].id;
        const [rows] = await db.query(
            'SELECT id, otp_hash, expires_at, used FROM password_resets WHERE user_id = ? ORDER BY id DESC LIMIT 1',
            [userId]
        );

        if (rows.length === 0) return res.status(400).json({ message: 'Invalid OTP' });

        const record = rows[0];
        if (record.used) return res.status(400).json({ message: 'OTP already used' });
        if (new Date(record.expires_at).getTime() < Date.now()) {
            return res.status(400).json({ message: 'OTP expired' });
        }

        const isMatch = await bcrypt.compare(otp, record.otp_hash);
        if (!isMatch) return res.status(400).json({ message: 'Invalid OTP' });

        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(newPassword, salt);

        await db.query('UPDATE users SET password_hash = ?, password = NULL WHERE id = ?', [hashed, userId]);
        await db.query('UPDATE password_resets SET used = 1 WHERE id = ?', [record.id]);

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get User Profile
router.get('/me', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Not authorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const [users] = await db.query('SELECT id, name, email, role, phone, company, address FROM users WHERE id = ?', [decoded.id]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(users[0]);
    } catch (error) {
        res.status(401).json({ message: 'Not authorized' });
    }
});

// Get All Users (Admin)
router.get('/users', async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, name, email, role, phone, company, address FROM users');
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
