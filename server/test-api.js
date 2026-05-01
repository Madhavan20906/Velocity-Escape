import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001/api';

async function testAPI() {
    console.log('Testing Backend API...');

    try {
        // 1. Submit a score
        console.log('\nSubmitting score...');
        const scoreRes = await fetch(`${BASE_URL}/scores`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Player1', score: 1200, userId: 'user_123' })
        });
        console.log('Score Response:', await scoreRes.json());

        // 2. Get leaderboard
        console.log('\nFetching leaderboard...');
        const boardRes = await fetch(`${BASE_URL}/leaderboard`);
        console.log('Leaderboard:', await boardRes.json());

        // 3. Sync data
        console.log('\nSyncing user data...');
        const syncRes = await fetch(`${BASE_URL}/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: 'user_123',
                data: {
                    coins: 500,
                    unlockedAvatars: ['neon_core', 'gold_striker']
                }
            })
        });
        console.log('Sync Response:', await syncRes.json());

        // 4. Get user data
        console.log('\nFetching user data...');
        const userRes = await fetch(`${BASE_URL}/user/user_123`);
        console.log('User Data:', await userRes.json());

    } catch (err) {
        console.error('Test failed. Is the server running?', err.message);
    }
}

testAPI();
