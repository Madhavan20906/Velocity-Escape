import './style.css';
import * as THREE from 'three';
import { Player } from './Player';
import { TrackManager } from './TrackManager';
import { UIManager } from './UIManager';
import { StorageManager } from './StorageManager';
import { CONFIG } from './Config';
import { AudioManager } from './AudioManager';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for PWA
registerSW({ immediate: true });



class Game {
    constructor() {
        this.canvas = document.querySelector('#game-canvas');
        
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050505);
        this.scene.fog = new THREE.Fog(0x050505, 40, 120);

        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 8, 20); // Zoomed out for better view
        this.camera.lookAt(0, 1, -30);

        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;

        this.initPostProcessing();

        this.initLights();
        
        this.player = new Player(this.scene);
        this.track = new TrackManager(this.scene);
        this.ui = new UIManager(this);
        this.audio = new AudioManager();

        this.gameState = 'MENU';
        this.speed = CONFIG.INITIAL_SPEED;
        this.score = 0;
        this.coinsCollected = 0;
        this.gemsCollected = 0;
        this.maxSpeedReached = CONFIG.INITIAL_SPEED;
        this.reviveCount = 0;
        this.lastTime = 0;
        this.speedBoostDisplay = null;
        this.speedBoostTimer = 0;

        this.initEvents();
        
        // Show auth modal on startup if not logged in and not in guest mode
        if (!StorageManager.isLoggedIn() && !localStorage.getItem('velocity_escape_guest_mode')) {
            setTimeout(() => this.ui.showAuthModal('welcome'), 1500);
        }

        requestAnimationFrame((t) => this.animate(t));
    }

    initPostProcessing() {
        this.renderScene = new RenderPass(this.scene, this.camera);

        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5, // Strength
            0.4, // Radius
            0.85 // Threshold
        );

        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(this.renderScene);
        this.composer.addPass(this.bloomPass);
    }

    initLights() {
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
        dirLight.position.set(5, 15, 5);
        this.scene.add(dirLight);

        this.playerLight = new THREE.PointLight(0x00f2ff, 4, 15);
        this.scene.add(this.playerLight);
    }

    initEvents() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
                if (this.gameState === 'RUNNING') this.pause();
                else if (this.gameState === 'PAUSED') this.resume();
                return;
            }
            if (this.gameState !== 'RUNNING') return;
            if (e.key === 'ArrowLeft' || e.key === 'a') this.player.moveLeft();
            if (e.key === 'ArrowRight' || e.key === 'd') this.player.moveRight();
            if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') this.player.jump();
        });

        // Pause button in HUD
        const pauseBox = document.querySelector('#hud .pause-box');
        if (pauseBox) {
            pauseBox.addEventListener('click', () => {
                if (this.gameState === 'RUNNING') this.pause();
                else if (this.gameState === 'PAUSED') this.resume();
            });
        }

        // Touch logic... (omitted for brevity, keeping existing)
        let touchStartX = 0;
        let touchStartY = 0;
        window.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        window.addEventListener('touchend', (e) => {
            if (this.gameState !== 'RUNNING') return;
            const diffX = e.changedTouches[0].clientX - touchStartX;
            const diffY = e.changedTouches[0].clientY - touchStartY;
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > 30) this.player.moveRight();
                else if (diffX < -30) this.player.moveLeft();
            } else {
                if (diffY < -30) this.player.jump();
            }
        });

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.composer.setSize(window.innerWidth, window.innerHeight);
        });

        // PWA Installation Logic
        let deferredPrompt;
        const installBtn = document.querySelector('#install-btn');

        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            deferredPrompt = e;
            // Update UI notify the user they can install the PWA
            if (installBtn) installBtn.classList.remove('hidden');
        });

        if (installBtn) {
            installBtn.addEventListener('click', async () => {
                if (!deferredPrompt) return;
                // Show the install prompt
                deferredPrompt.prompt();
                // Wait for the user to respond to the prompt
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                }
                deferredPrompt = null;
                installBtn.classList.add('hidden');
            });
        }
    }

    start() {
        this.gameState = 'RUNNING';
        this.score = 0;
        this.coinsCollected = 0;
        this.gemsCollected = 0;
        this.maxSpeedReached = CONFIG.INITIAL_SPEED;
        this.reviveCount = 0;
        
        const speedLevel = StorageManager.getUpgradeLevel('start_speed');
        this.speed = CONFIG.INITIAL_SPEED + (speedLevel * 5);
        
        this.track.reset();
        this.player.reset();
        this.audio.playMusic();
    }

    resetState() {
        this.speed = CONFIG.INITIAL_SPEED;
        this.score = 0;
        this.coinsCollected = 0;
        this.gemsCollected = 0;
        this.maxSpeedReached = CONFIG.INITIAL_SPEED;
        this.reviveCount = 0;
        this.magnetTimer = 0;
        this.shieldTimer = 0;
        this.ui.updatePowerupTimer('', 0);
        this.player.reset();
        this.track.reset();
    }

    animate(time) {
        const deltaTime = Math.min((time - this.lastTime) / 1000, 0.1);
        this.lastTime = time;

        if (this.gameState === 'RUNNING') {
            try {
                this.update(deltaTime);
            } catch (e) {
                console.error('Game update error:', e);
                // Never let an error kill the animation loop
            }
        }

        this.playerLight.position.copy(this.player.container.position);
        this.playerLight.position.y += 1.5;
        
        this.composer.render();
        requestAnimationFrame((t) => this.animate(t));
    }

    pause() {
        if (this.gameState !== 'RUNNING') return;
        this.gameState = 'PAUSED';
        const pauseBox = document.querySelector('#hud .pause-box');
        if (pauseBox) pauseBox.textContent = '▶';
        this.ui.showPauseOverlay();
    }

    resume() {
        if (this.gameState !== 'PAUSED') return;
        this.gameState = 'RUNNING';
        const pauseBox = document.querySelector('#hud .pause-box');
        if (pauseBox) pauseBox.textContent = 'II';
        this.ui.hidePauseOverlay();
    }

    update(deltaTime) {
        this.player.update(deltaTime);
        this.track.update(this.speed, deltaTime);

        this.score += this.speed * deltaTime * CONFIG.SCORE_MULTIPLIER;
        if (this.speed > this.maxSpeedReached) this.maxSpeedReached = this.speed;
        
        // --- Timers & Effects ---
        if (this.speedBoostTimer > 0) {
            this.speedBoostTimer -= deltaTime;
            if (this.speedBoostTimer <= 0) this.ui.hideSpeedBoost();
        }

        if (this.magnetTimer > 0) {
            this.magnetTimer -= deltaTime;
            if (this.magnetTimer <= 0) {
                this.magnetTimer = 0;
                this.player.setMagnet(false);
            }
            
            // Magnet logic: Pull nearby coins toward player
            const pPos = this.player.container.position;
            for (let i = this.track.objects.length - 1; i >= 0; i--) {
                const obj = this.track.objects[i];
                if (obj && obj.type === 'coin' && obj.mesh) {
                    const dist = obj.mesh.position.distanceTo(pPos);
                    if (dist < CONFIG.POWERUPS.MAGNET.radius) {
                        obj.mesh.position.lerp(pPos, 0.15);
                        // Auto-collect if very close
                        if (dist < 1.5) {
                            this.track.objects.splice(i, 1);
                            this.scene.remove(obj.mesh);
                            this.coinsCollected++;
                            this.audio.playSFX('coin');
                        }
                    }
                }
            }
        }

        if (this.shieldTimer > 0) {
            this.shieldTimer -= deltaTime;
            if (this.shieldTimer <= 0) {
                this.shieldTimer = 0;
                this.player.setShield(false);
            }
        }

        if (this.shakeTimer > 0) {
            this.shakeTimer -= deltaTime;
            const shakeX = (Math.random() - 0.5) * this.shakeIntensity;
            const shakeY = (Math.random() - 0.5) * this.shakeIntensity;
            this.camera.position.x += shakeX;
            this.camera.position.y += shakeY;
            if (this.shakeTimer <= 0) {
                this.camera.position.x = 0;
                this.camera.position.y = 8; // Match zoomed-out camera Y
            }
        }
        
        this.ui.updateHUD(this.speed, this.score, this.coinsCollected, this.gemsCollected);
        
        // --- Powerup UI Update ---
        if (this.magnetTimer > 0) {
            this.ui.updatePowerupTimer('magnet', this.magnetTimer);
        } else if (this.shieldTimer > 0) {
            this.ui.updatePowerupTimer('shield', this.shieldTimer);
        } else {
            this.ui.updatePowerupTimer('', 0);
        }
        
        this.checkCollisions();
    }

    triggerShake(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeTimer = duration;
    }

    triggerHaptic(pattern) {
        try {
            if (navigator.vibrate) navigator.vibrate(pattern);
        } catch (e) { /* vibration not supported, ignore */ }
    }

    checkCollisions() {
        // Guard: don't check collisions after game over
        if (this.gameState !== 'RUNNING') return;

        const pPos = this.player.container.position;
        
        for (let i = this.track.objects.length - 1; i >= 0; i--) {
            // Re-check state inside loop in case gameOver() was triggered
            if (this.gameState !== 'RUNNING') break;

            const obj = this.track.objects[i];
            if (!obj || !obj.mesh) continue;

            const oPos = obj.mesh.position;
            
            // Manual Box Collision - Precise Bounds
            const isObstacle = obj.type.startsWith('obstacle');
            const isLong = obj.mesh.geometry && obj.mesh.geometry.parameters && obj.mesh.geometry.parameters.depth > 10;
            
            const rangeX = isObstacle ? 1.8 : 1.0;
            const rangeZ = isLong ? 11.5 : (isObstacle ? 1.5 : 1.0);

            const diffX = Math.abs(pPos.x - oPos.x);
            const diffZ = Math.abs(pPos.z - oPos.z);

            if (diffX < rangeX && diffZ < rangeZ) {
                this.handleCollision(obj, i);
            }
        }
    }

    handleCollision(obj, index) {
        if (obj.type.startsWith('obstacle')) {
            if (this.shieldTimer > 0) {
                // Shield saves the day
                this.shieldTimer = 0;
                this.player.setShield(false);
                this.track.objects.splice(index, 1);
                this.scene.remove(obj.mesh);
                this.ui.showToast('SHIELD BROKEN!');
                this.triggerShake(0.5, 0.3);
                this.triggerHaptic(100);
                this.audio.playSFX('hit');
            } else {
                // NO SHIELD - GAME OVER immediately
                this.gameState = 'GAMEOVER'; // Set FIRST to stop further collision processing
                this.triggerShake(1.0, 0.5);
                this.triggerHaptic([200, 50, 200]);
                this.audio.playSFX('hit');
                this.gameOver();
            }
        } else if (obj.type === 'gem') {
            this.track.objects.splice(index, 1);
            this.scene.remove(obj.mesh);
            this.gemsCollected++;
            this.ui.showToast('💎 GEM COLLECTED!');
            this.triggerShake(0.15, 0.15);
            this.triggerHaptic(60);
            this.audio.playSFX('diamond');
        } else if (obj.type === 'coin') {
            this.track.objects.splice(index, 1);
            this.scene.remove(obj.mesh);
            this.coinsCollected++;
            this.audio.playSFX('coin');
        } else if (obj.type.startsWith('diamond_')) {
            this.track.objects.splice(index, 1);
            this.scene.remove(obj.mesh);


            const parts = obj.type.split('_');
            const delta = parts[1] ? parseInt(parts[1]) : 0;
            if (isNaN(delta)) return;
            
            const oldSpeed = this.speed;
            this.speed += delta;
            this.speed = Math.max(0, Math.min(200, this.speed));
            
            try {
                const change = Math.round(this.speed - oldSpeed);
                const label = (change >= 0 ? '+' : '') + change + ' KM/H';
                if (this.ui) this.ui.showSpeedBoost(label, change >= 0);
            } catch (e) {
                console.error("Speed boost UI error:", e);
            }

            this.speedBoostTimer = 1.5;
            this.triggerShake(0.2, 0.2);
            this.triggerHaptic(50);
            this.audio.playSFX('diamond');
            
            if (this.speed <= 0) this.gameOver();
        } else if (obj.type.startsWith('powerup_')) {
            this.track.objects.splice(index, 1);
            this.scene.remove(obj.mesh);


            const pType = obj.type.split('_')[1];
            if (pType === 'magnet') {
                const level = StorageManager.getUpgradeLevel('magnet_duration');
                this.magnetTimer = CONFIG.POWERUPS.MAGNET.duration + (level * 2);
                this.shieldTimer = 0;
                this.player.setShield(false);
                this.player.setMagnet(true);
                this.ui.showToast('MAGNET ACTIVE!');
            } else if (pType === 'shield') {
                const level = StorageManager.getUpgradeLevel('shield_duration');
                this.shieldTimer = CONFIG.POWERUPS.SHIELD.duration + (level * 3);
                this.magnetTimer = 0;
                this.player.setMagnet(false);
                this.player.setShield(true);
                this.ui.showToast('SHIELD ACTIVE!');
            }
            this.triggerShake(0.3, 0.2);
            this.triggerHaptic(80);
            this.audio.playSFX('powerup');
        }
    }

    updatePlayerAvatar() {
        this.player.updateMesh();
        const avatar = CONFIG.AVATARS.find(a => a.id === StorageManager.getSelectedAvatar());
        const board = CONFIG.SKATEBOARDS.find(s => s.id === StorageManager.getSelectedSkateboard());
        
        if (avatar) {
            // Mix avatar color with board color for the light
            this.playerLight.color.set(avatar.color);
        }
    }

    revive() {
        this.gameState = 'RUNNING';
        this.reviveCount++;
        // Clear obstacles near player
        const pPos = this.player.container.position;
        for (let i = this.track.objects.length - 1; i >= 0; i--) {
            const obj = this.track.objects[i];
            if (obj && obj.type.startsWith('obstacle')) {
                if (Math.abs(obj.mesh.position.z - pPos.z) < 40) {
                    this.scene.remove(obj.mesh);
                    this.track.objects.splice(i, 1);
                }
            }
        }
        this.player.velocityY = 0;
        this.player.isJumping = false;
        this.audio.playMusic();
    }

    gameOver() {
        // gameState must already be GAMEOVER (set in handleCollision) or we set it now
        this.gameState = 'GAMEOVER';
        
        try {
            // Visual bounce-back
            this.player.container.position.z += 2;
            this.player.container.rotation.x = -0.5;

            // Stop music immediately
            if (this.audio) this.audio.stopMusic();

            // --- SAVE DATA ---
            if (StorageManager) {
                StorageManager.addCoins(this.coinsCollected);
                StorageManager.addDiamonds(this.gemsCollected);
                StorageManager.updateSessionStats(this.score, this.coinsCollected, this.gemsCollected, this.maxSpeedReached);
            }

            // --- SHOW UI (after saving so coin count is correct) ---
            if (this.ui) this.ui.showGameOver(this.score, this.coinsCollected, this.gemsCollected);
        } catch (e) {
            console.error("Game Over sequence error:", e);
            // Fallback UI
            const el = document.getElementById('game-over');
            if (el) el.classList.remove('hidden');
        }
    }

    reset() {
        this.gameState = 'RUNNING';
        this.resetState();
    }
}

new Game();
