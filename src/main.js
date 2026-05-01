import './style.css';
import * as THREE from 'three';
import { Player } from './Player';
import { TrackManager } from './TrackManager';
import { UIManager } from './UIManager';
import { StorageManager } from './StorageManager';
import { CONFIG } from './Config';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';


class Game {
    constructor() {
        this.canvas = document.querySelector('#game-canvas');
        
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050505);
        this.scene.fog = new THREE.Fog(0x050505, 40, 120);

        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 6, 14); // Slightly higher for better view
        this.camera.lookAt(0, 2, -20);

        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        this.initPostProcessing();

        this.initLights();
        
        this.player = new Player(this.scene);
        this.track = new TrackManager(this.scene);
        this.ui = new UIManager(this);

        this.gameState = 'MENU';
        this.speed = CONFIG.INITIAL_SPEED;
        this.score = 0;
        this.coinsCollected = 0;
        this.lastTime = 0;
        this.speedBoostDisplay = null; // For showing speed change popup
        this.speedBoostTimer = 0;

        this.initEvents();
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
    }

    start() {
        this.gameState = 'RUNNING';
        this.resetState();
    }

    resetState() {
        this.speed = CONFIG.INITIAL_SPEED;
        this.score = 0;
        this.coinsCollected = 0;
        this.player.reset();
        this.track.reset();
    }

    animate(time) {
        const deltaTime = Math.min((time - this.lastTime) / 1000, 0.1);
        this.lastTime = time;

        if (this.gameState === 'RUNNING') {
            this.update(deltaTime);
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
        // Speed only changes by collecting diamonds — no auto increment
        
        // Countdown speed boost display
        if (this.speedBoostTimer > 0) {
            this.speedBoostTimer -= deltaTime;
            if (this.speedBoostTimer <= 0) {
                this.ui.hideSpeedBoost();
            }
        }
        
        this.ui.updateHUD(this.speed, this.score, this.coinsCollected);
        this.checkCollisions();
    }

    checkCollisions() {
        // --- FORGIVING HITBOX ---
        const playerBox = new THREE.Box3().setFromObject(this.player.container);
        playerBox.expandByScalar(-0.4); // Shrink by 40cm for fairness

        this.track.objects.forEach((obj, index) => {
            const objBox = new THREE.Box3().setFromObject(obj.mesh);
            
            // Shrink obstacle hitboxes slightly too
            if (obj.type.startsWith('obstacle')) {
                objBox.expandByScalar(-0.1);
            }

            if (playerBox.intersectsBox(objBox)) {
                this.handleCollision(obj, index);
            }
        });
    }

    handleCollision(obj, index) {
        if (obj.type.startsWith('obstacle')) {
            this.gameOver();
        } else if (obj.type === 'coin') {
            this.coinsCollected++;
            this.track.objects.splice(index, 1);
            this.scene.remove(obj.mesh);
        } else if (obj.type.startsWith('diamond_')) {
            // Diamond speed change: type = 'diamond_+5', 'diamond_-2', etc.
            const delta = parseInt(obj.type.split('_')[1]);
            const oldSpeed = this.speed;
            this.speed += delta;
            if (this.speed > 200) this.speed = 200;
            if (this.speed <= 0) {
                this.speed = 0;
                this.gameOver();
            }
            this.track.objects.splice(index, 1);
            this.scene.remove(obj.mesh);
            // Show speed change popup
            const change = Math.round(this.speed - oldSpeed);
            const label = (change >= 0 ? '+' : '') + change + ' KM/H';
            this.ui.showSpeedBoost(label, change >= 0);
            this.speedBoostTimer = 1.5;
        }
    }

    updatePlayerAvatar() {
        this.player.updateMesh();
        const avatar = CONFIG.AVATARS.find(a => a.id === StorageManager.getSelectedAvatar());
        const board = CONFIG.SKATEBOARDS.find(s => s.id === StorageManager.getSelectedSkateboard());
        
        if (avatar) {
            // Mix avatar color with board color for the light
            this.playerLight.color.setHex(avatar.color);
        }
    }

    revive() {
        this.gameState = 'RUNNING';
        const pauseBox = document.querySelector('#hud .pause-box');
        if (pauseBox) pauseBox.textContent = 'II';
        // Give invincibility - clear obstacles near player
        for (let i = this.track.objects.length - 1; i >= 0; i--) {
            const obj = this.track.objects[i];
            if (obj.mesh.position.z < 40 && obj.mesh.position.z > -40) {
                this.scene.remove(obj.mesh);
                this.track.objects.splice(i, 1);
            }
        }
        // Reposition player if they were in a bad spot
        this.player.velocityY = 0;
        this.player.isJumping = false;
    }

    gameOver() {
        if (this.gameState === 'GAMEOVER') return;
        this.gameState = 'GAMEOVER';
        StorageManager.addCoins(this.coinsCollected);
        StorageManager.updateHighScore(Math.floor(this.score));
        this.ui.showGameOver(this.score, this.coinsCollected);
    }

    reset() {
        this.gameState = 'RUNNING';
        this.resetState();
    }
}

new Game();
