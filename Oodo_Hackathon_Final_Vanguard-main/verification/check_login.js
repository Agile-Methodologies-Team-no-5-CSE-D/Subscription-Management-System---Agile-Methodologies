const fetch = require('node-fetch');

const API_URL = 'http://localhost:5003/api';

const checkLogin = async () => {
    try {
        console.log('--- Checking Login Functionality ---');

        // 1. Register a test user (to ensure a user exists)
        const random = Math.floor(Math.random() * 10000);
        const email = `testlogin${random}@example.com`;
        const password = 'password123';

        console.log(`1. Registering user: ${email}`);
        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Login Tester',
                email,
                password
            })
        });

        if (!regRes.ok) {
            const err = await regRes.text();
            throw new Error(`Registration failed: ${err}`);
        }
        console.log('   -> Registration Successful');

        // 2. Attempt Login
        console.log('2. Attempting Login...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const loginData = await loginRes.json();

        if (!loginRes.ok) {
            console.error('   -> Login FAILED:', loginData);
        } else {
            console.log('   -> Login SUCCESS');
            console.log('   -> Token received:', !!loginData.token);
            console.log('   -> User Role:', loginData.role);
        }

    } catch (error) {
        console.error('--- Login Check Error ---');
        console.error(error);
    }
};

checkLogin();
