# Backend Integration Guide

I have created a fully functional Node.js/Express backend for Velocity Escape. Since you requested **no changes to the frontend**, I have kept the game files (`src/`) untouched. 

When you are ready to connect the game to the backend, follow these steps:

## 1. Running the Backend
1. Open a terminal in the `server` directory.
2. Run `npm start` to start the server at `http://localhost:3001`.

## 2. API Endpoints
- **Get Leaderboard**: `GET http://localhost:3001/api/leaderboard`
- **Submit Score**: `POST http://localhost:3001/api/scores` (Body: `{ name, score, userId }`)
- **Sync User Data**: `POST http://localhost:3001/api/sync` (Body: `{ userId, data: { coins, unlockedItems, ... } }`)

## 3. Implementation Example
You can update your `src/StorageManager.js` to include these calls. Here is a snippet of how you might implement the sync:

```javascript
// Add this to StorageManager.js
static async syncWithBackend(userId) {
    const data = {
        coins: this.getTotalCoins(),
        unlockedAvatars: this.getUnlockedAvatars(),
        highScore: this.getHighScore()
    };

    try {
        await fetch('http://localhost:3001/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, data })
        });
        console.log('Backend sync successful');
    } catch (err) {
        console.error('Backend sync failed', err);
    }
}
```

## 4. Verification
You can verify the backend is working by running the provided test script:
```bash
cd server
node test-api.js
```
This script will simulate submitting a score and syncing data.
