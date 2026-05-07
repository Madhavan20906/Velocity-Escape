import { CONFIG } from './Config';

export class StorageManager {
    static KEYS = {
        COINS: 'neon_rush_total_coins',
        DIAMONDS: 'velocity_escape_diamonds',
        UNLOCKED_AVATARS: 'neon_rush_unlocked_avatars',
        SELECTED_AVATAR: 'neon_rush_selected_avatar',
        UNLOCKED_SKATEBOARDS: 'neon_rush_unlocked_skateboards',
        SELECTED_SKATEBOARD: 'neon_rush_selected_skateboard',
        HIGH_SCORE: 'neon_rush_high_score',
        MAX_COINS: 'neon_rush_max_coins',
        AUTH_TOKEN: 'neon_rush_auth_token',
        USER_INFO: 'neon_rush_user_info',
        UPGRADES: 'neon_rush_upgrades',
        ACTIVE_MISSIONS: 'velocity_escape_active_missions',
        MISSION_PROGRESS: 'velocity_escape_mission_progress'
    };

    static get API_URL() {
        const CLOUD_URL = 'https://velocity-escape.onrender.com';
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
            const timeoutId = setTimeout(() => controller.abort(), 1000);
            const res = await fetch(`${url}/health`, { signal: controller.signal });
            clearTimeout(timeoutId);
            return res.ok;
        } catch (e) { return false; }
    }

    // --- Auth ---
    static async signup(username, email, password) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);
            const res = await fetch(`${this.API_URL}/auth/signup`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }), signal: controller.signal
            });
            clearTimeout(timeoutId);
            const data = await res.json();
            if (res.ok) { this.saveAuth(data); return { success: true }; }
            return { success: false, error: data.error || 'Signup failed' };
        } catch (err) { return { success: false, error: 'OFFLINE' }; }
    }

    static async login(credential, password) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);
            const res = await fetch(`${this.API_URL}/auth/login`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential, password }), signal: controller.signal
            });
            clearTimeout(timeoutId);
            const data = await res.json();
            if (res.ok) { this.saveAuth(data); this.importUserData(data.user.data); return { success: true }; }
            return { success: false, error: data.error || 'Login failed' };
        } catch (err) { return { success: false, error: 'OFFLINE' }; }
    }

    static saveAuth(data) {
        localStorage.setItem(this.KEYS.AUTH_TOKEN, data.token);
        localStorage.setItem(this.KEYS.USER_INFO, JSON.stringify(data.user));
    }
    static logout() {
        localStorage.removeItem(this.KEYS.AUTH_TOKEN);
        localStorage.removeItem(this.KEYS.USER_INFO);
    }
    static isLoggedIn() { return !!localStorage.getItem(this.KEYS.AUTH_TOKEN); }
    static getUser() { const info = localStorage.getItem(this.KEYS.USER_INFO); return info ? JSON.parse(info) : null; }
    static getAuthToken() { return localStorage.getItem(this.KEYS.AUTH_TOKEN); }

    static importUserData(data) {
        if (!data) return;
        localStorage.setItem(this.KEYS.COINS, data.coins || 0);
        localStorage.setItem(this.KEYS.HIGH_SCORE, data.highDistance || 0);
        localStorage.setItem(this.KEYS.MAX_COINS, data.highCoins || 0);
        localStorage.setItem(this.KEYS.UNLOCKED_AVATARS, JSON.stringify(data.unlockedAvatars || ['knight']));
        localStorage.setItem(this.KEYS.UNLOCKED_SKATEBOARDS, JSON.stringify(data.unlockedSkateboards || ['basic_board']));
    }

    // --- Sync ---
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
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            await fetch(`${this.API_URL}/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.getAuthToken()}` },
                body: JSON.stringify({ data }), signal: controller.signal
            });
            clearTimeout(timeoutId);
        } catch (err) { console.log('Sync skipped: Server offline'); }
    }

    // --- Leaderboard ---
    static async getLeaderboard(category = 'distance') {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            const res = await fetch(`${this.API_URL}/leaderboard/${category}`, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (res.ok) return await res.json();
        } catch (err) { console.log('Leaderboard: Using local scores'); }
        const localScores = JSON.parse(localStorage.getItem(`local_leaderboard_${category}`)) || [];
        return localScores.slice(0, 10);
    }

    static saveLocalScore(category, value) {
        const key = `local_leaderboard_${category}`;
        const scores = JSON.parse(localStorage.getItem(key)) || [];
        const user = this.getUser();
        scores.push({ userId: user ? user.id : 'guest', username: user ? user.username : 'GUEST RUNNER', value, date: new Date().toISOString() });
        scores.sort((a, b) => b.value - a.value);
        localStorage.setItem(key, JSON.stringify(scores.slice(0, 50)));
    }

    // --- Coins ---
    static getTotalCoins() { return parseInt(localStorage.getItem(this.KEYS.COINS)) || 0; }
    static addCoins(amount) {
        const total = this.getTotalCoins() + amount;
        localStorage.setItem(this.KEYS.COINS, total);
        this.syncData();
        return total;
    }
    static deductCoins(amount) {
        const total = Math.max(0, this.getTotalCoins() - amount);
        localStorage.setItem(this.KEYS.COINS, total);
        this.syncData();
        return total;
    }

    // --- Gems (Diamonds) ---
    static getTotalDiamonds() { return parseInt(localStorage.getItem(this.KEYS.DIAMONDS)) || 0; }
    static addDiamonds(amount) {
        const total = this.getTotalDiamonds() + amount;
        localStorage.setItem(this.KEYS.DIAMONDS, total);
        return total;
    }
    static deductDiamonds(amount) {
        const total = Math.max(0, this.getTotalDiamonds() - amount);
        localStorage.setItem(this.KEYS.DIAMONDS, total);
        return total;
    }

    // --- Avatars ---
    static getUnlockedAvatars() {
        const data = localStorage.getItem(this.KEYS.UNLOCKED_AVATARS);
        return data ? JSON.parse(data) : ['knight'];
    }
    static unlockAvatar(id) {
        const unlocked = this.getUnlockedAvatars();
        if (!unlocked.includes(id)) { unlocked.push(id); localStorage.setItem(this.KEYS.UNLOCKED_AVATARS, JSON.stringify(unlocked)); this.syncData(); }
    }
    static getSelectedAvatar() { return localStorage.getItem(this.KEYS.SELECTED_AVATAR) || 'knight'; }
    static setSelectedAvatar(id) { localStorage.setItem(this.KEYS.SELECTED_AVATAR, id); }

    // --- Skateboards ---
    static getUnlockedSkateboards() {
        const data = localStorage.getItem(this.KEYS.UNLOCKED_SKATEBOARDS);
        return data ? JSON.parse(data) : ['basic_board'];
    }
    static unlockSkateboard(id) {
        const unlocked = this.getUnlockedSkateboards();
        if (!unlocked.includes(id)) { unlocked.push(id); localStorage.setItem(this.KEYS.UNLOCKED_SKATEBOARDS, JSON.stringify(unlocked)); this.syncData(); }
    }
    static getSelectedSkateboard() { return localStorage.getItem(this.KEYS.SELECTED_SKATEBOARD) || 'basic_board'; }
    static setSelectedSkateboard(id) { localStorage.setItem(this.KEYS.SELECTED_SKATEBOARD, id); }

    // --- Scores ---
    static getHighScore() { return parseInt(localStorage.getItem(this.KEYS.HIGH_SCORE)) || 0; }
    static getMaxCoinsInRun() { return parseInt(localStorage.getItem(this.KEYS.MAX_COINS)) || 0; }

    // --- Upgrades ---
    static getUpgradeLevel(id) {
        const data = localStorage.getItem(this.KEYS.UPGRADES);
        const upgrades = data ? JSON.parse(data) : {};
        return upgrades[id] || 0;
    }
    static setUpgradeLevel(id, level) {
        const data = localStorage.getItem(this.KEYS.UPGRADES);
        const upgrades = data ? JSON.parse(data) : {};
        upgrades[id] = level;
        localStorage.setItem(this.KEYS.UPGRADES, JSON.stringify(upgrades));
        this.syncData();
    }

    // --- Dynamic Missions ---
    static pickRandomMissions(count, excludeIds = []) {
        const pool = CONFIG.MISSION_POOL.filter(m => !excludeIds.includes(m.id));
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    static getActiveMissions() {
        const data = localStorage.getItem(this.KEYS.ACTIVE_MISSIONS);
        if (!data) {
            const initial = this.pickRandomMissions(3, []);
            this.setActiveMissions(initial);
            return initial;
        }
        // Validate all stored missions still exist in pool
        const stored = JSON.parse(data);
        const validIds = CONFIG.MISSION_POOL.map(m => m.id);
        const valid = stored.filter(m => validIds.includes(m.id));
        if (valid.length < 3) {
            const existingIds = valid.map(m => m.id);
            const extras = this.pickRandomMissions(3 - valid.length, existingIds);
            const full = [...valid, ...extras];
            this.setActiveMissions(full);
            return full;
        }
        return stored;
    }

    static setActiveMissions(missions) {
        localStorage.setItem(this.KEYS.ACTIVE_MISSIONS, JSON.stringify(missions));
    }

    static getMissionProgressById(id) {
        const data = localStorage.getItem(this.KEYS.MISSION_PROGRESS);
        const progress = data ? JSON.parse(data) : {};
        return progress[id] !== undefined ? progress[id] : 0;
    }

    static setMissionProgressById(id, value) {
        const data = localStorage.getItem(this.KEYS.MISSION_PROGRESS);
        const progress = data ? JSON.parse(data) : {};
        progress[id] = value;
        localStorage.setItem(this.KEYS.MISSION_PROGRESS, JSON.stringify(progress));
    }

    static clearMissionProgressById(id) {
        const data = localStorage.getItem(this.KEYS.MISSION_PROGRESS);
        const progress = data ? JSON.parse(data) : {};
        delete progress[id];
        localStorage.setItem(this.KEYS.MISSION_PROGRESS, JSON.stringify(progress));
    }

    // Update progress for all active missions matching this type
    static updateMissionProgress(type, amount) {
        const active = this.getActiveMissions();
        active.forEach(mission => {
            if (mission.type !== type) return;
            const current = this.getMissionProgressById(mission.id);
            const newVal = type === 'speed' ? Math.max(current, amount) : current + amount;
            this.setMissionProgressById(mission.id, newVal);
        });
    }

    // Check completed missions, award rewards, replace with new ones
    // Returns array of completed mission objects (for toasts)
    static processMissions() {
        const active = this.getActiveMissions();
        const completed = [];
        const newActive = [...active];

        for (let i = 0; i < newActive.length; i++) {
            const mission = newActive[i];
            const progress = this.getMissionProgressById(mission.id);
            if (progress >= mission.goal) {
                completed.push(mission);
                // Award rewards
                this.addCoins(mission.reward);
                if (mission.gemReward > 0) this.addDiamonds(mission.gemReward);
                // Clear old progress
                this.clearMissionProgressById(mission.id);
                // Pick replacement (exclude other currently active missions)
                const excludeIds = newActive.map(m => m.id).filter(id => id !== mission.id);
                const replacement = this.pickRandomMissions(1, excludeIds);
                if (replacement.length > 0) {
                    newActive[i] = replacement[0];
                    this.setMissionProgressById(replacement[0].id, 0);
                }
            }
        }

        if (completed.length > 0) {
            this.setActiveMissions(newActive);
        }
        return completed;
    }

    // --- Rank ---
    static getRank() {
        const score = this.getHighScore();
        if (score >= 50000) return 'LEGENDARY';
        if (score >= 25000) return 'DIAMOND';
        if (score >= 15000) return 'PLATINUM';
        if (score >= 10000) return 'GOLD';
        if (score >= 5000)  return 'SILVER';
        if (score >= 2000)  return 'BRONZE';
        return 'ROOKIE';
    }

    // --- Session Stats (called on game over) ---
    static updateSessionStats(distance, coins, gems = 0, maxSpeed = 0) {
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
        // Update mission progress
        this.updateMissionProgress('coins', coins);
        this.updateMissionProgress('distance', Math.floor(distance));
        if (gems > 0) this.updateMissionProgress('gems', gems);
        if (maxSpeed > 0) this.updateMissionProgress('speed', maxSpeed);

        if (changed) this.syncData();
    }
}
