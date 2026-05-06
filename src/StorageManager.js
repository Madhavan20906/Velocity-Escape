export class StorageManager {
    static KEYS = {
        COINS: 'neon_rush_total_coins',
        UNLOCKED_AVATARS: 'neon_rush_unlocked_avatars',
        SELECTED_AVATAR: 'neon_rush_selected_avatar',
        UNLOCKED_SKATEBOARDS: 'neon_rush_unlocked_skateboards',
        SELECTED_SKATEBOARD: 'neon_rush_selected_skateboard',
        HIGH_SCORE: 'neon_rush_high_score',
        MAX_COINS: 'neon_rush_max_coins', // New: Max coins in one run
        AUTH_TOKEN: 'neon_rush_auth_token',
        USER_INFO: 'neon_rush_user_info'
    };

    static get API_URL() {
        // --- CONFIGURATION ---
        // Replace the string below with your Render/Cloud URL once deployed!
        const CLOUD_URL = 'https://velocity-escape.onrender.com';
        // ---------------------

        if (CLOUD_URL) return CLOUD_URL + '/api';

        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        if (isMobile && isLocalhost) return null; 
        
        return 'http://localhost:3001/api';
    }

    static async checkServer() {
        const url = this.API_URL;
        if (!url) return false;
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1000); // Super fast 1s check
            const res = await fetch(`${url}/health`, { signal: controller.signal });
            clearTimeout(timeoutId);
            return res.ok;
        } catch (e) {
            return false;
        }
    }

    // --- Auth Logic ---

    static async signup(username, email, password) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

            const res = await fetch(`${this.API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            const data = await res.json();
            
            if (res.ok) {
                this.saveAuth(data);
                return { success: true };
            }
            return { success: false, error: data.error || 'Signup failed' };
        } catch (err) {
            return { success: false, error: 'OFFLINE' };
        }
    }

    static async login(credential, password) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            const res = await fetch(`${this.API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential, password }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            const data = await res.json();

            if (res.ok) {
                this.saveAuth(data);
                this.importUserData(data.user.data);
                return { success: true };
            }
            return { success: false, error: data.error || 'Login failed' };
        } catch (err) {
            return { success: false, error: 'OFFLINE' };
        }
    }

    static saveAuth(data) {
        localStorage.setItem(this.KEYS.AUTH_TOKEN, data.token);
        localStorage.setItem(this.KEYS.USER_INFO, JSON.stringify(data.user));
    }

    static logout() {
        localStorage.removeItem(this.KEYS.AUTH_TOKEN);
        localStorage.removeItem(this.KEYS.USER_INFO);
    }

    static isLoggedIn() {
        return !!localStorage.getItem(this.KEYS.AUTH_TOKEN);
    }

    static getUser() {
        const info = localStorage.getItem(this.KEYS.USER_INFO);
        return info ? JSON.parse(info) : null;
    }

    static getAuthToken() {
        return localStorage.getItem(this.KEYS.AUTH_TOKEN);
    }

    static importUserData(data) {
        if (!data) return;
        localStorage.setItem(this.KEYS.COINS, data.coins || 0);
        localStorage.setItem(this.KEYS.HIGH_SCORE, data.highDistance || 0);
        localStorage.setItem(this.KEYS.MAX_COINS, data.highCoins || 0);
        localStorage.setItem(this.KEYS.UNLOCKED_AVATARS, JSON.stringify(data.unlockedAvatars || ['neon_core']));
        localStorage.setItem(this.KEYS.UNLOCKED_SKATEBOARDS, JSON.stringify(data.unlockedSkateboards || ['basic_board']));
    }

    // --- Data Logic ---

    static async syncData() {
        if (!this.isLoggedIn()) return;

        const data = {
            coins: this.getTotalCoins(),
            unlockedAvatars: this.getUnlockedAvatars(),
            unlockedSkateboards: this.getUnlockedSkateboards(),
            highDistance: this.getHighScore(),
            highCoins: this.getMaxCoinsInRun()
        };

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // Short 3s timeout for sync

            const res = await fetch(`${this.API_URL}/sync`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({ data }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
        } catch (err) {
            // Silently fail sync - just keep local data
            console.log('Sync skipped: Server offline');
        }
    }

    static async getLeaderboard(category = 'distance') {
        // Try global first
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            const res = await fetch(`${this.API_URL}/leaderboard/${category}`, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (res.ok) return await res.json();
        } catch (err) {
            console.log('Leaderboard: Using local scores (Server Offline)');
        }

        // Fallback to local leaderboard
        const localScores = JSON.parse(localStorage.getItem(`local_leaderboard_${category}`)) || [];
        return localScores.slice(0, 10);
    }

    static saveLocalScore(category, value) {
        const key = `local_leaderboard_${category}`;
        const scores = JSON.parse(localStorage.getItem(key)) || [];
        const user = this.getUser();
        const entry = {
            userId: user ? user.id : 'guest',
            username: user ? user.username : 'GUEST RUNNER',
            value: value,
            date: new Date().toISOString()
        };

        scores.push(entry);
        scores.sort((a, b) => b.value - a.value);
        localStorage.setItem(key, JSON.stringify(scores.slice(0, 50)));
    }

    static getTotalCoins() {
        return parseInt(localStorage.getItem(this.KEYS.COINS)) || 0;
    }

    static addCoins(amount) {
        const total = this.getTotalCoins() + amount;
        localStorage.setItem(this.KEYS.COINS, total);
        this.syncData();
        return total;
    }

    static deductCoins(amount) {
        const total = this.getTotalCoins() - amount;
        localStorage.setItem(this.KEYS.COINS, Math.max(0, total));
        this.syncData();
        return total;
    }

    static getUnlockedAvatars() {
        const data = localStorage.getItem(this.KEYS.UNLOCKED_AVATARS);
        return data ? JSON.parse(data) : ['neon_core'];
    }

    static unlockAvatar(id) {
        const unlocked = this.getUnlockedAvatars();
        if (!unlocked.includes(id)) {
            unlocked.push(id);
            localStorage.setItem(this.KEYS.UNLOCKED_AVATARS, JSON.stringify(unlocked));
            this.syncData();
        }
    }

    static getSelectedAvatar() {
        return localStorage.getItem(this.KEYS.SELECTED_AVATAR) || 'neon_core';
    }

    static setSelectedAvatar(id) {
        localStorage.setItem(this.KEYS.SELECTED_AVATAR, id);
    }

    static getUnlockedSkateboards() {
        const data = localStorage.getItem(this.KEYS.UNLOCKED_SKATEBOARDS);
        return data ? JSON.parse(data) : ['basic_board'];
    }

    static unlockSkateboard(id) {
        const unlocked = this.getUnlockedSkateboards();
        if (!unlocked.includes(id)) {
            unlocked.push(id);
            localStorage.setItem(this.KEYS.UNLOCKED_SKATEBOARDS, JSON.stringify(unlocked));
            this.syncData();
        }
    }

    static getSelectedSkateboard() {
        return localStorage.getItem(this.KEYS.SELECTED_SKATEBOARD) || 'basic_board';
    }

    static setSelectedSkateboard(id) {
        localStorage.setItem(this.KEYS.SELECTED_SKATEBOARD, id);
    }

    static getHighScore() {
        return parseInt(localStorage.getItem(this.KEYS.HIGH_SCORE)) || 0;
    }

    static getMaxCoinsInRun() {
        return parseInt(localStorage.getItem(this.KEYS.MAX_COINS)) || 0;
    }

    static updateSessionStats(distance, coins) {
        let changed = false;
        if (distance > this.getHighScore()) {
            localStorage.setItem(this.KEYS.HIGH_SCORE, Math.floor(distance));
            this.saveLocalScore('distance', Math.floor(distance));
            changed = true;
        }
        if (coins > this.getMaxCoinsInRun()) {
            localStorage.setItem(this.KEYS.MAX_COINS, coins);
            this.saveLocalScore('coins', coins);
            changed = true;
        }

        if (changed) {
            this.syncData();
        }
    }
}
