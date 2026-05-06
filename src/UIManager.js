import { StorageManager } from './StorageManager';
import { CONFIG } from './Config';

export class UIManager {
    constructor(game) {
        this.game = game;
        
        // Screens
        this.loadingScreen = document.getElementById('loading-screen');
        this.mainMenu = document.getElementById('main-menu');
        this.shopMenu = document.getElementById('shop-menu');
        this.hud = document.getElementById('hud');
        this.gameOver = document.getElementById('game-over');
        this.leaderboardMenu = document.getElementById('leaderboard-menu');
        this.leaderboardList = document.getElementById('leaderboard-list');
        this.authModal = document.getElementById('auth-modal');

        // Leaderboard Tabs
        this.currentLeaderboardCategory = 'distance'; // 'distance' or 'coins'

        // Auth Forms
        this.signupForm = document.getElementById('signup-form');
        this.loginForm = document.getElementById('login-form');

        // Menu stats
        this.totalCoinsMenu = document.getElementById('total-coins-menu');
        this.totalCoinsShop = document.getElementById('total-coins-shop');
        this.highScoreMenu = document.getElementById('high-score-menu');
        this.avatarList = document.getElementById('avatar-list');

        // HUD
        this.coinsVal = document.getElementById('coins-val');
        this.scoreVal = document.getElementById('score-val');
        this.speedVal = document.getElementById('speed-val');

        // Sidebar and Tabs
        this.sidebar = document.getElementById('sidebar-menu');
        this.currentShopTab = 'AVATARS';

        // Results
        this.finalScore = document.getElementById('final-score');
        this.finalCoins = document.getElementById('final-coins');
        this.reviveBtn = document.getElementById('revive-btn');

        this.initEvents();
        this.updateMenuStats();
        this.updateAuthStateUI();
        
        if (this.loadingScreen) {
            setTimeout(() => this.loadingScreen.classList.add('hidden'), 800);
        }
    }

    initEvents() {
        document.getElementById('play-btn').onclick = () => this.startGame();
        document.getElementById('shop-btn').onclick = () => this.showShop();
        document.getElementById('back-to-menu-btn').onclick = () => this.showMenu();
        document.getElementById('restart-btn').onclick = () => this.restartGame();
        document.getElementById('menu-btn').onclick = () => this.showMenu();

        // Auth events
        document.getElementById('sidebar-login-btn').onclick = () => {
            this.hideSidebar();
            this.showAuthModal('welcome');
        };
        document.getElementById('sidebar-logout-btn').onclick = () => {
            StorageManager.logout();
            this.updateAuthStateUI();
            this.updateMenuStats();
            this.showToast('LOGGED OUT');
        };
        document.getElementById('close-auth-btn').onclick = () => this.hideAuthModal();
        
        document.getElementById('welcome-to-login').onclick = () => this.toggleAuthForm('login');
        document.getElementById('welcome-to-signup').onclick = () => this.toggleAuthForm('signup');
        document.getElementById('switch-to-login').onclick = () => this.toggleAuthForm('login');
        document.getElementById('switch-to-signup').onclick = () => this.toggleAuthForm('signup');
        document.getElementById('guest-play-btn').onclick = () => {
            localStorage.setItem('velocity_escape_guest_mode', 'true');
            this.hideAuthModal();
            this.updateAuthStateUI();
            this.showToast('PLAYING AS GUEST');
        };

        document.getElementById('signup-submit').onclick = () => this.handleSignup();
        document.getElementById('login-submit').onclick = () => this.handleLogin();

        // Leaderboard events
        document.getElementById('sidebar-leaderboard-btn').onclick = () => {
            this.hideSidebar();
            this.showLeaderboard();
        };
        document.getElementById('back-from-leaderboard-btn').onclick = () => this.showMenu();

        document.getElementById('leaderboard-dist-tab').onclick = () => {
            this.currentLeaderboardCategory = 'distance';
            this.updateLeaderboardTabs();
            this.showLeaderboard();
        };
        document.getElementById('leaderboard-coins-tab').onclick = () => {
            this.currentLeaderboardCategory = 'coins';
            this.updateLeaderboardTabs();
            this.showLeaderboard();
        };

        // Sidebar events
        const moreBtn = document.getElementById('more-btn');
        if (moreBtn) moreBtn.onclick = () => this.showSidebar();
        
        const closeSidebarBtn = document.getElementById('close-sidebar-btn');
        if (closeSidebarBtn) closeSidebarBtn.onclick = () => this.hideSidebar();

        document.getElementById('sidebar-avatar-btn').onclick = () => {
            this.hideSidebar();
            this.currentShopTab = 'AVATARS';
            this.showShop();
        };

        document.getElementById('sidebar-skateboard-btn').onclick = () => {
            this.hideSidebar();
            this.currentShopTab = 'SKATEBOARDS';
            this.showShop();
        };

        // Tab events
        document.getElementById('avatar-tab-btn').onclick = () => {
            this.currentShopTab = 'AVATARS';
            this.updateTabs();
            this.renderShop();
        };

        document.getElementById('skateboard-tab-btn').onclick = () => {
            this.currentShopTab = 'SKATEBOARDS';
            this.updateTabs();
            this.renderShop();
        };

        // Pause overlay resume / quit buttons
        const pauseResume = document.getElementById('pause-resume-btn');
        const pauseQuit = document.getElementById('pause-quit-btn');
        if (pauseResume) pauseResume.onclick = () => this.game.resume();
        if (pauseQuit) pauseQuit.onclick = () => {
            this.game.gameState = 'MENU';
            this.hidePauseOverlay();
            this.showMenu();
        };

        this.reviveBtn.onclick = () => {
            const total = StorageManager.getTotalCoins();
            if (total >= CONFIG.REVIVE_COST) {
                StorageManager.deductCoins(CONFIG.REVIVE_COST);
                this.updateMenuStats();
                this.game.revive();
                this.gameOver.classList.add('hidden');
                this.hud.classList.remove('hidden');
            } else {
                this.showToast(`NEED ${CONFIG.REVIVE_COST - total} MORE!`);
            }
        };
    }

    // --- Auth UI Logic ---

    showAuthModal(mode = 'welcome') {
        this.authModal.classList.remove('hidden');
        this.toggleAuthForm(mode);
    }

    hideAuthModal() {
        this.authModal.classList.add('hidden');
    }

    async toggleAuthForm(mode) {
        const welcome = document.getElementById('auth-welcome');
        const signup = document.getElementById('signup-form');
        const login = document.getElementById('login-form');
        const title = document.getElementById('auth-title');

        welcome.classList.add('hidden');
        signup.classList.add('hidden');
        login.classList.add('hidden');

        if (mode === 'signup') {
            signup.classList.remove('hidden');
            title.innerText = 'CREATE ACCOUNT';
        } else if (mode === 'login') {
            login.classList.remove('hidden');
            title.innerText = 'WELCOME BACK';
        } else {
            welcome.classList.remove('hidden');
            title.innerText = 'VELOCITY ESCAPE';
            
            // Health check for Welcome Screen
            const isOnline = await StorageManager.checkServer();
            const loginBtn = document.getElementById('welcome-to-login');
            const signupBtn = document.getElementById('welcome-to-signup');
            const guestBtn = document.getElementById('guest-play-btn');
            const welcomeText = welcome.querySelector('p');

            if (!isOnline) {
                loginBtn.classList.add('hidden');
                signupBtn.classList.add('hidden');
                guestBtn.innerText = 'PLAY OFFLINE';
                guestBtn.style.background = '#00f2ff';
                guestBtn.style.color = '#000';
                welcomeText.innerText = 'OFFLINE MODE: Global leaderboards are disabled. Your high scores will save locally!';
                welcomeText.style.color = '#ffaa00';
            } else {
                loginBtn.classList.remove('hidden');
                signupBtn.classList.remove('hidden');
                guestBtn.innerText = 'PLAY AS GUEST';
                guestBtn.style.background = '';
                guestBtn.style.color = '';
                welcomeText.innerText = 'Join the race and secure your spot on the global leaderboard!';
                welcomeText.style.color = '';
            }
        }
    }

    async handleSignup() {
        const username = document.getElementById('signup-username').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;

        if (!username || !email || !password) return this.showToast('PLEASE FILL ALL FIELDS');
        if (password.length < 6) return this.showToast('PASSWORD TOO SHORT (MIN 6)');

        this.showToast('CREATING ACCOUNT...');
        const res = await StorageManager.signup(username, email, password);
        if (res.success) {
            this.hideAuthModal();
            this.updateAuthStateUI();
            this.updateMenuStats();
            this.showToast('ACCOUNT READY! WELCOME');
        } else {
            this.showToast(res.error.toUpperCase());
        }
    }

    async handleLogin() {
        const credential = document.getElementById('login-credential').value.trim();
        const password = document.getElementById('login-password').value;

        if (!credential || !password) return this.showToast('CREDENTIALS REQUIRED');

        this.showToast('LOGGING IN...');
        const res = await StorageManager.login(credential, password);
        if (res.success) {
            this.hideAuthModal();
            this.updateAuthStateUI();
            this.updateMenuStats();
            this.showToast('SUCCESS! GAME SYNCED');
        } else {
            this.showToast(res.error.toUpperCase());
        }
    }

    updateAuthStateUI() {
        const isLoggedIn = StorageManager.isLoggedIn();
        const user = StorageManager.getUser();
        
        document.getElementById('sidebar-login-btn').classList.toggle('hidden', isLoggedIn);
        document.getElementById('sidebar-logout-btn').classList.toggle('hidden', !isLoggedIn);
        
        const label = document.getElementById('user-label');
        const name = document.getElementById('user-display-name');
        
        if (isLoggedIn && user) {
            label.innerText = 'LOGGED IN AS';
            label.style.color = '#00f2ff';
            name.innerText = user.username.toUpperCase();
        } else {
            label.innerText = 'GUEST RUNNER';
            label.style.color = '#888';
            name.innerText = 'NEON ESCAPE';
        }
    }

    // --- Leaderboard & Stats Logic ---

    updateLeaderboardTabs() {
        const distTab = document.getElementById('leaderboard-dist-tab');
        const coinTab = document.getElementById('leaderboard-coins-tab');
        distTab.classList.toggle('active', this.currentLeaderboardCategory === 'distance');
        coinTab.classList.toggle('active', this.currentLeaderboardCategory === 'coins');
    }

    async showLeaderboard() {
        this.mainMenu.classList.add('hidden');
        this.leaderboardMenu.classList.remove('hidden');
        this.leaderboardList.innerHTML = '<div style="text-align:center; padding:2rem; color:#888;">LOADING TOP RUNNERS...</div>';
        
        const scores = await StorageManager.getLeaderboard(this.currentLeaderboardCategory);
        this.renderLeaderboard(scores);
    }

    renderLeaderboard(scores) {
        this.leaderboardList.innerHTML = '';
        if (scores.length === 0) {
            this.leaderboardList.innerHTML = '<div style="text-align:center; padding:2rem; color:#888;">NO SCORES YET. CLIMB THE RANKS!</div>';
            return;
        }

        const user = StorageManager.getUser();
        const myId = user ? user.id : null;

        scores.forEach((item, index) => {
            const entry = document.createElement('div');
            const isMe = item.userId === myId;
            entry.style.cssText = `
                display: flex; align-items: center; gap: 1rem;
                background: ${isMe ? 'rgba(0,255,170,0.1)' : 'rgba(255,255,255,0.05)'};
                padding: 1rem; border-radius: 12px;
                border: 1px solid ${isMe ? '#00ffaa44' : 'rgba(255,255,255,0.1)'};
            `;

            const rankColor = index === 0 ? '#f1c40f' : (index === 1 ? '#bdc3c7' : (index === 2 ? '#cd7f32' : '#888'));
            const unit = this.currentLeaderboardCategory === 'distance' ? 'M' : '●';
            
            entry.innerHTML = `
                <div style="font-weight:900; color:${rankColor}; width:30px;">#${index + 1}</div>
                <div style="flex-grow:1;">
                    <div style="font-weight:700; font-size:1rem;">${item.username || 'Anonymous'} ${isMe ? '<span style="font-size:0.6rem; background:#00ffaa; color:#000; padding:2px 4px; border-radius:4px; vertical-align:middle; margin-left:5px;">YOU</span>' : ''}</div>
                    <div style="font-size:0.7rem; color:#666;">${new Date(item.date).toLocaleDateString()}</div>
                </div>
                <div style="font-weight:900; font-size:1.2rem; color:#00f2ff;">${Math.floor(item.value)}${unit}</div>
            `;
            this.leaderboardList.appendChild(entry);
        });
    }

    // --- Shop Logic ---

    showSidebar() { this.sidebar.classList.remove('hidden'); }
    hideSidebar() { this.sidebar.classList.add('hidden'); }

    updateTabs() {
        const avatarTab = document.getElementById('avatar-tab-btn');
        const boardTab = document.getElementById('skateboard-tab-btn');
        if (this.currentShopTab === 'AVATARS') {
            avatarTab.classList.add('active');
            boardTab.classList.remove('active');
        } else {
            avatarTab.classList.remove('active');
            boardTab.classList.add('active');
        }
    }

    updateMenuStats() {
        const coins = StorageManager.getTotalCoins();
        this.totalCoinsMenu.innerText = coins;
        this.totalCoinsShop.innerText = coins;
        this.highScoreMenu.innerText = StorageManager.getHighScore().toString().padStart(6, '0');
    }

    getAvatarPreviewSVG(avatarId, colorHex) {
        let innerSVG = '';
        const baseBody = `<rect x="30" y="45" width="40" height="50" fill="${colorHex}" rx="5" />`;
        const head = `<rect x="35" y="10" width="30" height="30" fill="#ffdbac" rx="5" />`;
        
        if (avatarId === 'knight') {
            innerSVG = `<rect x="30" y="5" width="40" height="40" fill="#aab7b8" rx="5" /><rect x="35" y="15" width="30" height="8" fill="#111" /><polygon points="50,5 45,-15 55,-15" fill="#e74c3c" />`;
        } else if (avatarId === 'archer') {
            innerSVG = `<rect x="30" y="5" width="40" height="40" fill="${colorHex}" rx="15" /><rect x="35" y="15" width="30" height="15" fill="#ffdbac" /><path d="M 15,30 Q 5,50 15,70" stroke="#8B4513" stroke-width="4" fill="none" /><line x1="15" y1="30" x2="15" y2="70" stroke="#ccc" stroke-width="1" />`;
        } else if (avatarId === 'mage') {
            innerSVG = `<polygon points="50,-5 25,20 75,20" fill="${colorHex}" /><rect x="20" y="20" width="60" height="6" fill="${colorHex}" /><circle cx="80" cy="30" r="6" fill="#f1c40f" /><rect x="78" y="36" width="4" height="60" fill="#8B4513" />`;
        } else if (avatarId === 'dark_knight') {
            innerSVG = `<rect x="30" y="5" width="40" height="40" fill="#111" rx="5" /><polygon points="30,10 15,-10 35,5" fill="#e74c3c" /><polygon points="70,10 85,-10 65,5" fill="#e74c3c" /><rect x="35" y="15" width="30" height="8" fill="${colorHex}" />`;
        } else if (avatarId === 'assassin') {
            innerSVG = `<rect x="30" y="5" width="40" height="40" fill="#2c3e50" rx="15" /><rect x="35" y="20" width="30" height="15" fill="#111" /><circle cx="42" cy="28" r="3" fill="${colorHex}" /><circle cx="58" cy="28" r="3" fill="${colorHex}" />`;
        } else if (avatarId === 'cyborg') {
            innerSVG = `<rect x="35" y="10" width="30" height="30" fill="#aab7b8" rx="5" /><circle cx="55" cy="25" r="7" fill="${colorHex}" /><rect x="25" y="45" width="20" height="30" fill="${colorHex}" />`;
        } else if (avatarId === 'samurai') {
            innerSVG = `<rect x="30" y="5" width="40" height="15" fill="#c0392b" rx="2" /><rect x="35" y="15" width="30" height="25" fill="#ffdbac" /><rect x="32" y="35" width="36" height="5" fill="#111" />`;
        } else if (avatarId === 'robot') {
            innerSVG = `<rect x="30" y="10" width="40" height="30" fill="#95a5a6" rx="2" /><rect x="40" y="20" width="20" height="5" fill="#00f2ff" />`;
        } else if (avatarId === 'ninja') {
            innerSVG = `<rect x="30" y="10" width="40" height="30" fill="#2c3e50" rx="10" /><rect x="35" y="20" width="30" height="6" fill="#ffdbac" />`;
        } else if (avatarId === 'pilot') {
            innerSVG = `<rect x="30" y="10" width="40" height="30" fill="#34495e" rx="5" /><rect x="35" y="18" width="30" height="12" fill="#2c3e50" rx="2" />`;
        } else if (avatarId === 'ghost') {
            innerSVG = `<path d="M 30,40 Q 50,10 70,40 L 70,80 Q 60,70 50,80 Q 40,70 30,80 Z" fill="white" opacity="0.8" /><circle cx="42" cy="35" r="3" fill="black" /><circle cx="58" cy="35" r="3" fill="black" />`;
        } else if (avatarId === 'pharaoh') {
            innerSVG = `<polygon points="30,40 50,5 70,40" fill="#f1c40f" /><rect x="35" y="15" width="30" height="25" fill="#ffdbac" /><rect x="42" y="40" width="16" height="15" fill="#f1c40f" />`;
        } else if (avatarId === 'viking') {
            innerSVG = `<rect x="30" y="10" width="40" height="25" fill="#7f8c8d" rx="2" /><path d="M 30,15 L 15,5 M 70,15 L 85,5" stroke="white" stroke-width="6" />`;
        } else if (avatarId === 'reaper') {
            innerSVG = `<path d="M 30,10 Q 50,-10 70,10 L 75,90 L 25,90 Z" fill="#111" /><circle cx="42" cy="30" r="3" fill="red" /><circle cx="58" cy="30" r="3" fill="red" />`;
        } else if (avatarId === 'astronaut') {
            innerSVG = `<rect x="30" y="10" width="40" height="35" fill="white" rx="10" /><rect x="35" y="15" width="30" height="20" fill="#2c3e50" rx="5" />`;
        } else if (avatarId === 'dragon_slayer') {
            innerSVG = `<rect x="30" y="5" width="40" height="40" fill="#222" rx="5" /><polygon points="50,0 35,15 65,15" fill="#e74c3c" /><path d="M 30,10 L 10,30" stroke="#f1c40f" stroke-width="4" />`;
        } else if (avatarId === 'cyber_queen') {
            innerSVG = `<rect x="30" y="5" width="40" height="40" fill="#111" rx="20" /><circle cx="50" cy="25" r="10" fill="none" stroke="${colorHex}" stroke-width="2" /><rect x="35" y="15" width="30" height="4" fill="${colorHex}" />`;
        } else if (avatarId === 'neon_god') {
            innerSVG = `<rect x="25" y="0" width="50" height="50" fill="none" stroke="${colorHex}" stroke-width="3" rx="10" /><circle cx="50" cy="25" r="15" fill="none" stroke="${colorHex}" stroke-width="1" /><path d="M 50,5 L 50,45 M 30,25 L 70,25" stroke="${colorHex}" stroke-width="2" />`;
        } else if (avatarId === 'chrono') {
            innerSVG = `<circle cx="50" cy="25" r="20" fill="none" stroke="${colorHex}" stroke-width="4" /><line x1="50" y1="25" x2="50" y2="10" stroke="${colorHex}" stroke-width="3" /><line x1="50" y1="25" x2="65" y2="25" stroke="${colorHex}" stroke-width="3" />`;
        } else if (avatarId === 'void_stalker') {
            innerSVG = `<rect x="30" y="5" width="40" height="40" fill="#000" rx="2" /><circle cx="42" cy="25" r="2" fill="${colorHex}" /><circle cx="58" cy="25" r="2" fill="${colorHex}" /><path d="M 35,40 Q 50,30 65,40" stroke="${colorHex}" fill="none" />`;
        } else if (avatarId === 'solar_empress' || avatarId === 'lunar_guardian') {
            const isSolar = avatarId === 'solar_empress';
            innerSVG = `<circle cx="50" cy="25" r="18" fill="${isSolar ? '#f1c40f' : '#bdc3c7'}" /><path d="M 30,5 L 70,45 M 70,5 L 30,45" stroke="white" stroke-width="2" />`;
        } else if (avatarId === 'eternal_king' || avatarId === 'cosmic') {
            innerSVG = `<polygon points="50,-10 20,40 80,40" fill="${colorHex}" /><circle cx="50" cy="20" r="8" fill="white" />`;
        } else if (avatarId === 'zero_point') {
            innerSVG = `<rect x="20" y="-10" width="60" height="60" fill="none" stroke="white" stroke-width="5" /><circle cx="50" cy="20" r="15" fill="white" />`;
        } else {
            innerSVG = baseBody;
        }
        
        return `<svg width="100%" height="100%" viewBox="0 -20 100 120">${head}${baseBody}${innerSVG}</svg>`;
    }

    getSkateboardPreviewSVG(boardId, colorHex) {
        let extra = '';
        if (boardId === 'gold_board' || boardId === 'obsidian_wing') {
            extra = `<path d="M 10,30 L 0,10 M 90,30 L 100,10" stroke="${colorHex}" stroke-width="4" fill="none" />`;
        } else if (boardId === 'plasma_board' || boardId === 'titan') {
            extra = `<circle cx="50" cy="30" r="15" fill="none" stroke="${colorHex}" stroke-width="2" stroke-dasharray="4,4" />`;
        } else if (boardId === 'solar_flare' || boardId === 'phoenix') {
            extra = `<path d="M 20,25 Q 50,0 80,25" fill="${colorHex}" opacity="0.5" />`;
        } else if (boardId === 'galaxy_edge' || boardId === 'nebula' || boardId === 'pulsar') {
            extra = `<circle cx="30" cy="20" r="2" fill="white" /><circle cx="70" cy="40" r="2" fill="white" /><circle cx="50" cy="30" r="3" fill="white" />`;
        } else if (boardId === 'singularity' || boardId === 'infinity' || boardId === 'omega') {
            extra = `<rect x="5" y="15" width="90" height="30" fill="none" stroke="${colorHex}" stroke-width="2" rx="15" /><circle cx="50" cy="30" r="10" fill="${colorHex}" opacity="0.3" />`;
        }
        return `<svg width="100%" height="100%" viewBox="0 0 100 60">${extra}<rect x="10" y="25" width="80" height="10" fill="${colorHex}" rx="5" /><rect x="15" y="20" width="70" height="4" fill="rgba(255,255,255,0.3)" rx="2" /><circle cx="25" cy="40" r="6" fill="#333" /><circle cx="75" cy="40" r="6" fill="#333" /></svg>`;
    }

    renderShop() {
        this.avatarList.innerHTML = '';
        const totalCoins = StorageManager.getTotalCoins();
        if (this.currentShopTab === 'AVATARS') {
            CONFIG.AVATARS.forEach(avatar => this.createShopCard(avatar, StorageManager.getUnlockedAvatars(), StorageManager.getSelectedAvatar(), 'AVATAR'));
        } else {
            CONFIG.SKATEBOARDS.forEach(board => this.createShopCard(board, StorageManager.getUnlockedSkateboards(), StorageManager.getSelectedSkateboard(), 'SKATEBOARD'));
        }
    }

    createShopCard(item, unlockedList, selectedId, type) {
        const isUnlocked = unlockedList.includes(item.id);
        const isSelected = selectedId === item.id;
        const card = document.createElement('div');
        card.className = `avatar-card ${isSelected ? 'selected' : ''}`;
        const colorHex = `#${item.color.toString(16).padStart(6, '0')}`;
        const svgContent = type === 'AVATAR' ? this.getAvatarPreviewSVG(item.id, colorHex) : this.getSkateboardPreviewSVG(item.id, colorHex);
        
        let btnLabel, btnBg, btnColor;
        if (isSelected) { btnLabel = 'ACTIVE'; btnBg = '#3498db'; btnColor = '#fff'; }
        else if (isUnlocked) { btnLabel = 'SELECT'; btnBg = '#2ecc71'; btnColor = '#000'; }
        else { btnLabel = item.cost + ' ●'; btnBg = '#f1c40f'; btnColor = '#000'; }

        card.innerHTML = `
            <div class="avatar-preview" style="background: ${colorHex}22; border-color: ${colorHex}44; display: flex; justify-content: center; align-items: center; padding: 10px; width: 100%; aspect-ratio: 1/1; border-radius: 12px; border: 2px solid rgba(255,255,255,0.1);">
                <div style="width: 80%; height: 80%; filter: drop-shadow(0 0 5px ${colorHex});">${svgContent}</div>
            </div>
            <div class="avatar-name" style="color: #fff; font-size: 0.8rem; height: 2.4rem; overflow: hidden">${item.name}</div>
            <div style="font-size: 0.7rem; color: #888; margin-top: -0.4rem">${item.rarity || ''}</div>
            <button class="primary-btn-pro" style="padding: 0.5rem; font-size: 0.7rem; width: 100%; border-radius: 8px; background: ${btnBg}; border: none; color: ${btnColor}; font-weight: bold; margin-top: auto;">${btnLabel}</button>
        `;
        card.onclick = () => {
            if (type === 'AVATAR') {
                if (isUnlocked) StorageManager.setSelectedAvatar(item.id);
                else if (StorageManager.getTotalCoins() >= item.cost) { StorageManager.deductCoins(item.cost); StorageManager.unlockAvatar(item.id); StorageManager.setSelectedAvatar(item.id); }
                else return this.showToast(`NEED ${item.cost - StorageManager.getTotalCoins()} MORE!`);
            } else {
                if (isUnlocked) StorageManager.setSelectedSkateboard(item.id);
                else if (StorageManager.getTotalCoins() >= item.cost) { StorageManager.deductCoins(item.cost); StorageManager.unlockSkateboard(item.id); StorageManager.setSelectedSkateboard(item.id); }
                else return this.showToast(`NEED ${item.cost - StorageManager.getTotalCoins()} MORE!`);
            }
            this.game.updatePlayerAvatar();
            this.updateMenuStats();
            this.renderShop();
        };
        this.avatarList.appendChild(card);
    }

    showShop() { this.renderShop(); this.mainMenu.classList.add('hidden'); this.shopMenu.classList.remove('hidden'); }
    showMenu() { this.updateMenuStats(); this.mainMenu.classList.remove('hidden'); this.shopMenu.classList.add('hidden'); this.leaderboardMenu.classList.add('hidden'); this.gameOver.classList.add('hidden'); this.hud.classList.add('hidden'); }
    startGame() { this.mainMenu.classList.add('hidden'); this.hud.classList.remove('hidden'); this.game.start(); }
    restartGame() { this.gameOver.classList.add('hidden'); this.hud.classList.remove('hidden'); this.game.reset(); }

    showGameOver(score, coins) {
        this.hud.classList.add('hidden');
        this.gameOver.classList.remove('hidden');
        this.finalScore.innerText = Math.floor(score).toString().padStart(6, '0');
        this.finalCoins.innerText = coins;
        this.updateMenuStats();
    }

    updateHUD(speed, score, coins) {
        this.scoreVal.innerText = Math.floor(score).toString().padStart(6, '0');
        this.coinsVal.innerText = coins;
        if (this.speedVal) this.speedVal.innerText = Math.floor(speed);
    }

    showPauseOverlay() { const el = document.getElementById('pause-overlay'); if (el) el.classList.remove('hidden'); }
    hidePauseOverlay() { const el = document.getElementById('pause-overlay'); if (el) el.classList.add('hidden'); }

    showSpeedBoost(label, isPositive) {
        let el = document.getElementById('speed-boost-popup');
        if (!el) { el = document.createElement('div'); el.id = 'speed-boost-popup'; document.getElementById('hud').appendChild(el); }
        el.textContent = label;
        el.style.cssText = `position: fixed; top: 25%; left: 50%; transform: translateX(-50%); font-family: 'Outfit', sans-serif; font-weight: 900; font-size: 2rem; color: ${isPositive ? '#00ffaa' : '#ff4444'}; text-shadow: 0 0 20px ${isPositive ? '#00ffaa88' : '#ff444488'}; pointer-events: none; z-index: 500; animation: boostPop 1.2s ease-out forwards;`;
        el.classList.remove('hidden');
    }
    hideSpeedBoost() { const el = document.getElementById('speed-boost-popup'); if (el) el.classList.add('hidden'); }

    showToast(msg) {
        let toast = document.getElementById('shop-toast');
        if (!toast) { toast = document.createElement('div'); toast.id = 'shop-toast'; document.body.appendChild(toast); }
        toast.textContent = msg;
        toast.style.cssText = `position: fixed; bottom: 12%; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.85); color: #00f2ff; border: 1px solid #00f2ff44; padding: 0.6rem 1.4rem; border-radius: 12px; font-family: 'Outfit', sans-serif; font-size: 0.85rem; font-weight: 700; z-index: 9999; pointer-events: none; animation: toastSlide 2.5s ease-out forwards;`;
        setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 2600);
    }
}
