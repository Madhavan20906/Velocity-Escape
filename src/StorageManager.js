export class StorageManager {
    static KEYS = {
        COINS: 'neon_rush_total_coins',
        UNLOCKED_AVATARS: 'neon_rush_unlocked_avatars',
        SELECTED_AVATAR: 'neon_rush_selected_avatar',
        UNLOCKED_SKATEBOARDS: 'neon_rush_unlocked_skateboards',
        SELECTED_SKATEBOARD: 'neon_rush_selected_skateboard',
        HIGH_SCORE: 'neon_rush_high_score'
    };

    static getTotalCoins() {
        return parseInt(localStorage.getItem(this.KEYS.COINS)) || 0;
    }

    static addCoins(amount) {
        const total = this.getTotalCoins() + amount;
        localStorage.setItem(this.KEYS.COINS, total);
        return total;
    }

    static deductCoins(amount) {
        const total = this.getTotalCoins() - amount;
        localStorage.setItem(this.KEYS.COINS, Math.max(0, total));
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
            return true;
        }
        return false;
    }
}
