export class StorageManager {
    static KEYS = {
        COINS: 'neon_rush_total_coins',
        UNLOCKED_AVATARS: 'neon_rush_unlocked_avatars',
        SELECTED_AVATAR: 'neon_rush_selected_avatar',
        UNLOCKED_SKATEBOARDS: 'neon_rush_unlocked_skateboards',
        SELECTED_SKATEBOARD: 'neon_rush_selected_skateboard',
        HIGH_SCORE: 'neon_rush_high_score',
        USER_ID: 'neon_rush_user_id',
        PLAYER_NAME: 'neon_rush_player_name'
    };

    static API_URL = 'http://localhost:3001/api';

    static getUserId() {
        let userId = localStorage.getItem(this.KEYS.USER_ID);
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem(this.KEYS.USER_ID, userId);
        }
        return userId;
    }

    static getPlayerName() {
        return localStorage.getItem(this.KEYS.PLAYER_NAME) || 'Neon Runner';
    }

    static setPlayerName(name) {
        localStorage.setItem(this.KEYS.PLAYER_NAME, name);
    }

    static async syncData() {
        const userId = this.getUserId();
        const data = {
            coins: this.getTotalCoins(),
            unlockedAvatars: this.getUnlockedAvatars(),
            unlockedSkateboards: this.getUnlockedSkateboards(),
            highScore: this.getHighScore(),
            playerName: this.getPlayerName()
        };

        try {
            await fetch(`${this.API_URL}/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, data })
            });
        } catch (err) {
            console.warn('Backend sync failed', err);
        }
    }

    static async submitScoreToLeaderboard(score) {
        const name = this.getPlayerName();
        try {
            await fetch(`${this.API_URL}/scores`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, score, userId: this.getUserId() })
            });
        } catch (err) {
            console.warn('Failed to submit score', err);
        }
    }

    static async getLeaderboard() {
        try {
            const res = await fetch(`${this.API_URL}/leaderboard`);
            return await res.json();
        } catch (err) {
            console.warn('Failed to fetch leaderboard', err);
            return [];
        }
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

    static updateHighScore(score) {
        const high = this.getHighScore();
        if (score > high) {
            localStorage.setItem(this.KEYS.HIGH_SCORE, score);
            this.submitScoreToLeaderboard(score);
            this.syncData();
            return true;
        }
        return false;
    }
}
