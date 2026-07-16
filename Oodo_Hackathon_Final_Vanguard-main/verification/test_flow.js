const fs = require('fs');
const fetch = require('node-fetch');

const API_URL = 'http://localhost:5002/api';
const LOG_FILE = 'verification/test_result.txt';

function log(message) {
    console.log(message);
    fs.appendFileSync(LOG_FILE, message + '\n');
}

// Clear log file
if (fs.existsSync(LOG_FILE)) {
    fs.unlinkSync(LOG_FILE);
}

let token = '';
let userId = '';
let productId = '';
let invoiceId = '';

const runTest = async () => {
    try {
        log('--- Starting Verification ---');

        // 1. Register User
        const random = Math.floor(Math.random() * 1000);
        const userPayload = {
            name: `Test User ${random}`,
            email: `test${random}@example.com`,
            password: 'password123',
            phone: '1234567890',
            address: '123 Test St'
        };
        log(`1. Registering User: ${userPayload.email}`);
        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userPayload)
        });
        const regData = await regRes.json();
        if (!regRes.ok) throw new Error(`Register failed: ${JSON.stringify(regData)}`);
        userId = regData.id;
        log(`   -> User Registered with ID: ${userId}`);

        // 2. Login
        log('2. Logging In...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userPayload.email, password: userPayload.password })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
        token = loginData.token;
        log('   -> Login Successful. Token received.');

        // 3. Get Products
        log('3. Fetching Products...');
        const prodRes = await fetch(`${API_URL}/products`);
        const prodData = await prodRes.json();
        if (prodData.length === 0) throw new Error('No products found');
        productId = prodData[0].id; // Use first product
        log(`   -> Found product: ${prodData[0].name} ID: ${productId}`);

        // 4. Add to Cart
        log('4. Adding to Cart...');
        const cartRes = await fetch(`${API_URL}/cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId: productId, quantity: 2 })
        });
        if (!cartRes.ok) {
            const errBody = await cartRes.text();
            throw new Error(`Add to cart failed: ${errBody}`);
        }
        log('   -> Added to Cart.');

        // 5. Place Order (Checkout)
        log('5. Placing Order...');
        const orderRes = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({})
        });
        const orderData = await orderRes.json();
        if (!orderRes.ok) throw new Error(`Order failed: ${JSON.stringify(orderData)}`);
        log(`   -> Order Placed. Invoice: ${orderData.invoiceNumber}`);
        invoiceId = orderData.invoiceNumber;

        // 6. Get Invoice Details
        log('6. Fetching Invoice Details...');
        const invRes = await fetch(`${API_URL}/invoices/${invoiceId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const invData = await invRes.json();
        if (!invRes.ok) throw new Error('Get Invoice failed');
        log(`   -> Invoice Amount: ${invData.amount} Status: ${invData.status}`);
        if (invData.status !== 'Draft') throw new Error('Invoice should be Draft initially');

        // 7. Pay Invoice
        log('7. Paying Invoice...');
        const payRes = await fetch(`${API_URL}/invoices/${invoiceId}/pay`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!payRes.ok) throw new Error('Payment failed');
        log('   -> Payment Successful.');

        // 8. Verify Paid Status
        log('8. Verifying Status...');
        const invCheckRes = await fetch(`${API_URL}/invoices/${invoiceId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const invCheckData = await invCheckRes.json();
        if (invCheckData.status !== 'Paid') throw new Error('Invoice status should be Paid');
        log('   -> Invoice Status is PAID.');

        log('--- Verification Complete: SUCCESS ---');

    } catch (error) {
        log('--- Verification FAILED ---');
        log(error.toString());
    }
};

runTest();
