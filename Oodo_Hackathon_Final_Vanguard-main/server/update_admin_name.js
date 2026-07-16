const db = require('./config/db');

const updateName = async () => {
    try {
        console.log('Updating Admin User name to Mohan...');
        const [result] = await db.query('UPDATE users SET name = ? WHERE email = ?', ['Mohan', 'admin@example.com']);
        console.log('Update result:', result);

        const [users] = await db.query('SELECT id, name, email FROM users WHERE email = ?', ['admin@example.com']);
        console.log('Updated User:', users[0]);

        process.exit(0);
    } catch (error) {
        console.error('Error updating name:', error);
        process.exit(1);
    }
};

updateName();
