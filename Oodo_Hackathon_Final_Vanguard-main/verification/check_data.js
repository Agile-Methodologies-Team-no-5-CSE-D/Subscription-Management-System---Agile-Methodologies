const fetch = require('node-fetch');

const API_URL = 'http://localhost:5003/api';

const checkData = async () => {
    try {
        console.log('--- Checking Data Visibility ---');

        // 1. Fetch Products (Admin Mode)
        console.log('Fetching Products (Admin)...');
        const prodRes = await fetch(`${API_URL}/products?admin=true`);
        const products = await prodRes.json();
        console.log(`Products Found: ${products.length}`);
        if (products.length > 0) console.log('Sample Product:', JSON.stringify(products[0]));

        // 2. Fetch Users
        console.log('\nFetching Users...');
        const userRes = await fetch(`${API_URL}/auth/users`);
        const users = await userRes.json();
        console.log(`Users Found: ${users.length}`);
        if (users.length > 0) console.log('Sample User:', JSON.stringify(users[0]));

    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

checkData();
