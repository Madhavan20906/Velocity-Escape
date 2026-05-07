import * as THREE from 'three';
import { CONFIG } from './Config';

export class TrackManager {
    constructor(scene) {
        this.scene = scene;
        this.segments = [];
        this.objects = [];
        this.scenery = [];
        
        this.currentTheme = 'MORNING';
        this.themeTime = 0;
        this.distanceTravelled = 0;
        this.lastPowerupDist = 0;
        this.lastEventDist = 0; // For multi-lane events

        this.scene.fog = new THREE.Fog(0x1a1a2e, 80, 350);

        this.initTrack();
        this.createEnvironment();
    }

    createEnvironment() {
        const loader = new THREE.TextureLoader();
        const backgroundTexture = loader.load('/background.png');
        backgroundTexture.colorSpace = THREE.SRGBColorSpace;

        const skyGeo = new THREE.SphereGeometry(450, 64, 64);
        this.skyMat = new THREE.MeshBasicMaterial({ map: backgroundTexture, side: THREE.BackSide, fog: false });
        this.sky = new THREE.Mesh(skyGeo, this.skyMat);
        this.scene.add(this.sky);

        const hemiLight = new THREE.HemisphereLight(0x4433aa, 0x111122, 1.2);
        this.scene.add(hemiLight);

        this.sunGeo = new THREE.SphereGeometry(30, 32, 32);
        this.sunMat = new THREE.MeshBasicMaterial({ color: 0xff00bb, fog: false, transparent: true, opacity: 0.3 });
        this.sun = new THREE.Mesh(this.sunGeo, this.sunMat);
        this.sun.position.set(0, 120, -420);
        this.scene.add(this.sun);

        this.createParticles();
    }

    createParticles() {
        const geo = new THREE.BufferGeometry();
        const count = 2000;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            positions[i * 3]     = (Math.random() - 0.5) * 400;
            positions[i * 3 + 1] = (Math.random() - 0.2) * 200;
            positions[i * 3 + 2] = -Math.random() * 800;
            const color = new THREE.Color();
            color.setHSL(Math.random() * 0.2 + 0.5, 0.8, 0.8);
            colors[i * 3] = color.r; colors[i * 3 + 1] = color.g; colors[i * 3 + 2] = color.b;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        const mat = new THREE.PointsMaterial({ size: 0.8, vertexColors: true, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
        this.particles = new THREE.Points(geo, mat);
        this.scene.add(this.particles);
    }

    initTrack() {
        for (let i = 0; i < CONFIG.TRACK_SEGMENT_COUNT; i++) {
            const z = i * CONFIG.TRACK_SEGMENT_LENGTH;
            this.createSegment(z);
            if (i >= 1) this.spawnObjects(-z - CONFIG.TRACK_SEGMENT_LENGTH / 2, CONFIG.INITIAL_SPEED);
        }
    }

    createSegment(z) {
        const group = new THREE.Group();
        const geo = new THREE.PlaneGeometry(15, CONFIG.TRACK_SEGMENT_LENGTH);
        const mat = new THREE.MeshPhongMaterial({ color: 0x050515, transparent: true, opacity: 0.8, shininess: 100 });
        const floor = new THREE.Mesh(geo, mat);
        floor.rotation.x = -Math.PI / 2;
        group.add(floor);

        const railGeo = new THREE.BoxGeometry(0.12, 0.12, CONFIG.TRACK_SEGMENT_LENGTH);
        const railMat = new THREE.MeshPhongMaterial({ color: 0x00f2ff, emissive: 0x00f2ff, emissiveIntensity: 0.2 });
        const sleeperGeo = new THREE.BoxGeometry(2, 0.05, 0.3);
        const sleeperMat = new THREE.MeshPhongMaterial({ color: 0x222222 });

        CONFIG.LANES.forEach(laneX => {
            const railL = new THREE.Mesh(railGeo, railMat); railL.position.set(laneX - 0.7, 0.1, 0); group.add(railL);
            const railR = new THREE.Mesh(railGeo, railMat); railR.position.set(laneX + 0.7, 0.1, 0); group.add(railR);
            for (let s = -CONFIG.TRACK_SEGMENT_LENGTH / 2; s < CONFIG.TRACK_SEGMENT_LENGTH / 2; s += 3) {
                const sleeper = new THREE.Mesh(sleeperGeo, sleeperMat); sleeper.position.set(laneX, 0.04, s); group.add(sleeper);
            }
            const neonGeo = new THREE.PlaneGeometry(0.05, CONFIG.TRACK_SEGMENT_LENGTH);
            const neonMat = new THREE.MeshBasicMaterial({ color: 0x00f2ff, transparent: true, opacity: 0.3 });
            const neon = new THREE.Mesh(neonGeo, neonMat); neon.rotation.x = -Math.PI / 2; neon.position.set(laneX, 0.02, 0); group.add(neon);
        });

        group.position.z = -z - CONFIG.TRACK_SEGMENT_LENGTH / 2;
        this.scene.add(group);
        this.segments.push(group);
    }

    update(speed, deltaTime) {
        const moveDist = (speed / 3.6) * deltaTime;
        this.distanceTravelled += moveDist;
        
        this.themeTime += deltaTime;
        if (this.themeTime > 60) {
            const themes = Object.keys(CONFIG.THEMES);
            const currentIdx = themes.indexOf(this.currentTheme);
            this.currentTheme = themes[(currentIdx + 1) % themes.length];
            this.themeTime = 0;
            this.applyTheme(CONFIG.THEMES[this.currentTheme]);
        }

        if (this.sky) this.sky.rotation.y += 0.01 * deltaTime;
        this.segments.forEach(seg => { seg.position.z += moveDist; });

        if (this.segments[0].position.z > CONFIG.TRACK_SEGMENT_LENGTH) {
            const first = this.segments.shift();
            const last = this.segments[this.segments.length - 1];
            const newZ = last.position.z - CONFIG.TRACK_SEGMENT_LENGTH;
            first.position.z = newZ;
            this.segments.push(first);

            // Every ~400m spawn a multi-lane event, otherwise normal spawning
            if (this.distanceTravelled - this.lastEventDist > 400) {
                this.lastEventDist = this.distanceTravelled;
                this.spawnMultiLaneEvent(newZ + CONFIG.TRACK_SEGMENT_LENGTH * 0.5);
            } else {
                for (let d = 0; d < 1; d += 0.33) {
                    this.spawnObjects(newZ + CONFIG.TRACK_SEGMENT_LENGTH * d, speed);
                }
            }
        }

        // Move and animate objects
        for (let index = this.objects.length - 1; index >= 0; index--) {
            const obj = this.objects[index];
            if (!obj || !obj.mesh) { this.objects.splice(index, 1); continue; }

            obj.mesh.position.z += moveDist;

            if (obj.isMoving) {
                obj.mesh.position.z += (obj.moveSpeed / 3.6) * deltaTime;
                if (obj.type === 'obstacle' && obj.moveSpeed > 0) {
                    if (obj.laneSwitchTimer === undefined) obj.laneSwitchTimer = 0;
                    if (obj.targetLaneX === undefined) obj.targetLaneX = obj.mesh.position.x;
                    obj.laneSwitchTimer += deltaTime;
                    if (obj.laneSwitchTimer > 2.0) {
                        const currentLaneIdx = CONFIG.LANES.indexOf(obj.targetLaneX);
                        const nextLaneIdx = (currentLaneIdx + 1) % CONFIG.LANES.length;
                        obj.targetLaneX = CONFIG.LANES[nextLaneIdx];
                        obj.mesh.position.x = obj.targetLaneX;
                        obj.laneSwitchTimer = 0;
                    }
                }
                if (obj.type === 'obstacle_complex') {
                    if (obj.sweepOrigin === undefined) obj.sweepOrigin = obj.mesh.position.x;
                    obj.mesh.position.x = obj.sweepOrigin + Math.sin(Date.now() * 0.002) * 2.5;
                }
            }

            if (obj.type === 'coin') obj.mesh.rotation.y += 3 * deltaTime;
            if (obj.type && obj.type.startsWith('diamond_')) { obj.mesh.rotation.y += 2 * deltaTime; obj.mesh.rotation.x += 1 * deltaTime; }
            // Gem animation — pulsing rotation
            if (obj.type === 'gem') {
                obj.mesh.rotation.y += 2.5 * deltaTime;
                obj.mesh.rotation.x += 1.5 * deltaTime;
                obj.mesh.position.y = 1.5 + Math.sin(Date.now() * 0.003) * 0.2;
            }
            if (obj.type && obj.type.startsWith('powerup_')) {
                obj.mesh.rotation.y += 1.5 * deltaTime;
            }

            if (obj.mesh.position.z > 30) {
                this.scene.remove(obj.mesh);
                this.objects.splice(index, 1);
            }
        }

        if (this.particles) {
            this.particles.position.z += moveDist * 0.5;
            if (this.particles.position.z > 400) this.particles.position.z = 0;
        }
    }

    applyTheme(theme) {
        if (this.skyMat) this.skyMat.color.set(theme.SKY);
        if (this.sunMat) this.sunMat.color.set(theme.SUN);
        if (this.scene.fog) this.scene.fog.color.set(theme.FOG);
    }

    // Creates a gem mesh (rare magenta/purple glowing octahedron)
    _createGemMesh(x, zPos) {
        const gemColor = 0xcc00ff;
        const mesh = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.55, 0),
            new THREE.MeshPhongMaterial({ color: gemColor, emissive: gemColor, emissiveIntensity: 1.5, transparent: true, opacity: 0.95 })
        );
        mesh.position.set(x, 1.5, zPos);
        // Add inner glow sphere
        const glow = new THREE.Mesh(
            new THREE.SphereGeometry(0.7, 8, 8),
            new THREE.MeshBasicMaterial({ color: gemColor, transparent: true, opacity: 0.15 })
        );
        mesh.add(glow);
        return mesh;
    }

    _createCoinMesh(x, zPos) {
        const mesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16),
            new THREE.MeshPhongMaterial({ color: 0xf1c40f, emissive: 0xf1c40f, emissiveIntensity: 0.5 })
        );
        mesh.rotation.z = Math.PI / 2;
        mesh.position.set(x, 1.2, zPos);
        return mesh;
    }

    _createPowerupMesh(type, x, zPos) {
        const isMagnet = type === 'powerup_magnet';
        const color = isMagnet ? 0x00f2ff : 0xff0055;
        const mesh = new THREE.Mesh(
            isMagnet ? new THREE.TorusGeometry(0.6, 0.1, 8, 24) : new THREE.SphereGeometry(0.6, 16, 16),
            new THREE.MeshPhongMaterial({ color, emissive: color, emissiveIntensity: 2.0 })
        );
        mesh.position.set(x, 1.4, zPos);
        const inner = new THREE.Mesh(
            new THREE.SphereGeometry(0.3, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 })
        );
        mesh.add(inner);
        return mesh;
    }

    // ─── Multi-Lane Event (Subway Surfers style) ───
    // Spawns a different collectible in each of the 3 lanes
    spawnMultiLaneEvent(zPos) {
        const lanes = [...CONFIG.LANES]; // [-3, 0, 3]
        // Item pool for multi-lane events (no obstacles — all collectibles)
        const itemPool = ['coin', 'coin', 'powerup_magnet', 'powerup_shield', 'gem'];
        // Shuffle and pick 3 distinct types
        const shuffled = [...itemPool].sort(() => Math.random() - 0.5);
        const chosen = [];
        const used = new Set();
        for (const item of shuffled) {
            if (!used.has(item) || item === 'coin') { // allow coin in multiple lanes
                chosen.push(item);
                used.add(item);
                if (chosen.length === 3) break;
            }
        }
        // Fill if less than 3
        while (chosen.length < 3) chosen.push('coin');

        lanes.forEach((x, i) => {
            const type = chosen[i];
            let mesh;
            if (type === 'gem') {
                mesh = this._createGemMesh(x, zPos);
                this.scene.add(mesh);
                this.objects.push({ mesh, type: 'gem', isMoving: false, moveSpeed: 0 });
            } else if (type === 'coin') {
                mesh = this._createCoinMesh(x, zPos + (i * 2)); // slight z offset for visual variety
                this.scene.add(mesh);
                this.objects.push({ mesh, type: 'coin', isMoving: false, moveSpeed: 0 });
            } else {
                mesh = this._createPowerupMesh(type, x, zPos);
                this.scene.add(mesh);
                this.objects.push({ mesh, type, isMoving: false, moveSpeed: 0 });
            }
        });
    }

    spawnObjects(zPos, speed) {
        const DIAMOND_DELTAS = [+5, +2, +1, +8, -1, -2, -5, -8];
        const allLanes = [...CONFIG.LANES];
        const randCount = Math.random();
        const objectCount = randCount < 0.4 ? 1 : (randCount < 0.9 ? 2 : 3);
        
        const chosenLanes = [];
        const lanePool = [...allLanes];
        for (let i = 0; i < objectCount; i++) {
            if (lanePool.length === 0) break;
            const idx = Math.floor(Math.random() * lanePool.length);
            chosenLanes.push(lanePool.splice(idx, 1)[0]);
        }

        let blockingCount = 0;
        chosenLanes.forEach((x) => {
            const rand = Math.random();
            let type, mesh, isMoving = false, moveSpeed = 0;
            const forceCollectible = (blockingCount >= 1);

            if (rand < 0.15 && !forceCollectible) {
                // ─── OBSTACLE ───
                blockingCount++;
                type = 'obstacle';
                const obsVar = Math.random();
                if (obsVar < 0.35) {
                    mesh = new THREE.Mesh(
                        new THREE.BoxGeometry(2.2, 5, 1.5),
                        new THREE.MeshPhongMaterial({ color: 0xff0055, emissive: 0xff0055, emissiveIntensity: 0.5 })
                    );
                    mesh.position.set(x, 2.5, zPos);
                } else if (obsVar < 0.65) {
                    mesh = new THREE.Mesh(
                        new THREE.BoxGeometry(2.6, 3.5, 22),
                        new THREE.MeshPhongMaterial({ color: 0x222222, emissive: 0x00f2ff, emissiveIntensity: 0.3 })
                    );
                    mesh.position.set(x, 1.75, zPos - 11);
                    isMoving = true; moveSpeed = 35;
                } else {
                    type = 'obstacle_complex';
                    mesh = new THREE.Mesh(
                        new THREE.BoxGeometry(1.8, 2, 1.8),
                        new THREE.MeshPhongMaterial({ color: 0xffaa00, emissive: 0xffaa00, emissiveIntensity: 0.6 })
                    );
                    mesh.position.set(x, 1, zPos);
                    isMoving = true; moveSpeed = -8;
                }
            } else if (this.distanceTravelled > this.lastPowerupDist + 300) {
                // ─── POWERUP (Every 300m) ───
                this.lastPowerupDist = this.distanceTravelled;
                const isMagnet = Math.random() < 0.5;
                type = isMagnet ? 'powerup_magnet' : 'powerup_shield';
                mesh = this._createPowerupMesh(type, x, zPos);
            } else if (rand < 0.18) {
                // ─── GEM (rare ~3% of non-obstacle, non-powerup slots) ───
                type = 'gem';
                mesh = this._createGemMesh(x, zPos);
            } else if (rand < 0.84) {
                // ─── COIN ───
                type = 'coin';
                mesh = this._createCoinMesh(x, zPos);
            } else {
                // ─── SPEED DIAMOND ───
                const delta = DIAMOND_DELTAS[Math.floor(Math.random() * DIAMOND_DELTAS.length)];
                type = `diamond_${delta}`;
                const diamondColor = delta >= 0 ? 0x00f2ff : 0xff0055;
                mesh = new THREE.Mesh(
                    new THREE.OctahedronGeometry(0.6, 0),
                    new THREE.MeshPhongMaterial({ color: diamondColor, emissive: diamondColor, emissiveIntensity: 0.5 })
                );
                mesh.position.set(x, 1.2, zPos);
            }

            if (mesh) {
                this.scene.add(mesh);
                this.objects.push({ mesh, type, isMoving, moveSpeed });
            }
        });
    }

    reset() {
        this.objects.forEach(obj => { if (obj.mesh) this.scene.remove(obj.mesh); });
        this.objects = [];
        this.lastEventDist = 0;
        this.segments.forEach((seg, i) => {
            seg.position.z = -i * CONFIG.TRACK_SEGMENT_LENGTH - CONFIG.TRACK_SEGMENT_LENGTH / 2;
        });
        for (let i = 1; i < CONFIG.TRACK_SEGMENT_COUNT; i++) {
            const z = this.segments[i].position.z;
            for (let d = 0; d < 1; d += 0.33) {
                this.spawnObjects(z + CONFIG.TRACK_SEGMENT_LENGTH * d, CONFIG.INITIAL_SPEED);
            }
        }
    }
}
