import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'db.json');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Initialize DB if not exists
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({
        leaderboard: [],
        users: {}
    }, null, 2));
}

// Helper to read DB
const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

// Helper to write DB
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// API Endpoints

// 1. Get Leaderboard
app.get('/api/leaderboard', (req, res) => {
    const db = readDB();
    const topScores = db.leaderboard
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
    res.json(topScores);
});

// 2. Submit Score
app.post('/api/scores', (req, res) => {
    const { name, score, userId } = req.body;
    if (!name || score === undefined) {
        return res.status(400).json({ error: 'Name and score are required' });
    }

    const db = readDB();
    db.leaderboard.push({ name, score, userId, date: new Date().toISOString() });
    
    // Sort and keep top 50 to prevent file bloat
    db.leaderboard.sort((a, b) => b.score - a.score);
    db.leaderboard = db.leaderboard.slice(0, 50);
    
    writeDB(db);
    res.status(201).json({ message: 'Score submitted successfully' });
});

// 3. Sync User Data
app.post('/api/sync', (req, res) => {
    const { userId, data } = req.body;
    if (!userId || !data) {
        return res.status(400).json({ error: 'userId and data are required' });
    }

    const db = readDB();
    db.users[userId] = {
        ...db.users[userId],
        ...data,
        lastUpdated: new Date().toISOString()
    };
    
    writeDB(db);
    res.json({ message: 'Data synced successfully' });
});

// 4. Get User Data
app.get('/api/user/:userId', (req, res) => {
    const { userId } = req.params;
    const db = readDB();
    const user = db.users[userId];
    
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
