const fetch = require('node-fetch');

const API_URL = 'http://localhost:5003/api';

const runTest = async () => {
    try {
        console.log('--- Starting Profile Verification ---');

        // 1. Register User
        const random = Math.floor(Math.random() * 10000);
        const userPayload = {
            name: `Profile Test ${random}`,
            email: `profile${random}@example.com`,
            password: 'password123',
            phone: '1234567890',
            address: 'Old Address'
        };
        console.log('1. Registering User:', userPayload.email);
        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userPayload)
        });
        const regData = await regRes.json();
        if (!regRes.ok) throw new Error(`Register failed: ${JSON.stringify(regData)}`);
        const token = regData.token;
        console.log('   -> Registered.');

        // 2. Update Profile
        console.log('2. Updating Profile...');
        const updatePayload = {
            name: `Updated Name ${random}`,
            email: userPayload.email,
            phone: '9876543210',
            company: 'New Company',
            address: 'New Address 123'
        };
        const updateRes = await fetch(`${API_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatePayload)
        });
        const updateData = await updateRes.json();
        if (!updateRes.ok) throw new Error(`Update failed: ${JSON.stringify(updateData)}`);

        if (updateData.name !== updatePayload.name) throw new Error('Name match failed');
        if (updateData.address !== updatePayload.address) throw new Error('Address match failed');
        console.log('   -> Profile Updated Successfully.');

        // 3. Verify Persistence
        console.log('3. Verifying Persistence...');
        const meRes = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const meData = await meRes.json();
        if (meData.company !== 'New Company') throw new Error('Company update not persisted');
        console.log('   -> Validated from /me endpoint.');

        console.log('--- Profile Verification Complete: SUCCESS ---');

    } catch (error) {
        console.error('--- Verification FAILED ---');
        console.error(error);
    }
};

runTest();
