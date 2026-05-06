import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'db.json');
const SECRET_KEY = 'neon-runner-super-secret';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Health check for frontend
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Initialize DB if not exists or corrupted
const initDB = () => {
    const defaultDB = {
        users: [],
        leaderboard: {
            distance: [],
            coins: []
        }
    };
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify(defaultDB, null, 2));
    }
};
initDB();

const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// --- Middleware ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: 'Forbidden' });
        req.user = user;
        next();
    });
};

// --- Auth Endpoints ---

// 1. Signup
app.post('/api/auth/signup', async (req, res) => {
    const { username, email, password } = req.body;
    
    // Basic validation
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    const db = readDB();
    
    // Check if email or username exists
    const existingEmail = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    const existingUser = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (existingEmail) {
        return res.status(400).json({ error: 'Email already registered' });
    }
    if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        username,
        email: email.toLowerCase(),
        password: hashedPassword,
        data: {
            coins: 0,
            highDistance: 0,
            highCoins: 0,
            unlockedAvatars: ['neon_core'],
            unlockedSkateboards: ['basic_board']
        },
        createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    writeDB(db);

    const token = jwt.sign({ id: newUser.id, username: newUser.username }, SECRET_KEY);
    res.status(201).json({ token, user: { id: newUser.id, username: newUser.username, email: newUser.email, data: newUser.data } });
});

// 2. Login
app.post('/api/auth/login', async (req, res) => {
    const { credential, password } = req.body; // credential can be email or username
    if (!credential || !password) {
        return res.status(400).json({ error: 'Credential and password required' });
    }

    const db = readDB();
    const user = db.users.find(u => u.email === credential || u.username === credential);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY);
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, data: user.data } });
});

// --- Data Endpoints ---

// 3. Sync Data
app.post('/api/sync', authenticateToken, (req, res) => {
    const { data } = req.body;
    const db = readDB();
    const userIndex = db.users.findIndex(u => u.id === req.user.id);

    if (userIndex === -1) return res.status(404).json({ error: 'User not found' });

    // Update user data
    db.users[userIndex].data = {
        ...db.users[userIndex].data,
        ...data,
        lastUpdated: new Date().toISOString()
    };

    // Update leaderboard entries if applicable
    const { highDistance, highCoins, username } = db.users[userIndex].data;
    const playerName = db.users[userIndex].username;

    // Helper to update specific leaderboard category
    const updateCategory = (category, value) => {
        const existingIndex = db.leaderboard[category].findIndex(entry => entry.userId === req.user.id);
        const entry = { userId: req.user.id, username: playerName, value, date: new Date().toISOString() };
        
        if (existingIndex !== -1) {
            if (value > db.leaderboard[category][existingIndex].value) {
                db.leaderboard[category][existingIndex] = entry;
            }
        } else {
            db.leaderboard[category].push(entry);
        }
        
        // Sort and slice
        db.leaderboard[category].sort((a, b) => b.value - a.value);
        db.leaderboard[category] = db.leaderboard[category].slice(0, 50);
    };

    if (data.highDistance) updateCategory('distance', data.highDistance);
    if (data.highCoins) updateCategory('coins', data.highCoins);

    writeDB(db);
    res.json({ message: 'Sync successful', userData: db.users[userIndex].data });
});

// 4. Get Leaderboard
app.get('/api/leaderboard/:category', (req, res) => {
    const { category } = req.params; // 'distance' or 'coins'
    const db = readDB();
    const list = db.leaderboard[category] || [];
    res.json(list.slice(0, 10));
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Velocity Escape Backend is live on port ${PORT}`);
});
