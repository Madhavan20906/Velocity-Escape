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

        // Soft fog to blend background
        // Far enough that the track ahead is always visible
        this.scene.fog = new THREE.Fog(0x1a1a2e, 80, 350);

        this.initTrack();
        this.createEnvironment();
    }

    createEnvironment() {
        const loader = new THREE.TextureLoader();
        const backgroundTexture = loader.load('/background.png');
        backgroundTexture.colorSpace = THREE.SRGBColorSpace;

        const skyGeo = new THREE.SphereGeometry(450, 64, 64);
        this.skyMat = new THREE.MeshBasicMaterial({ 
            map: backgroundTexture,
            side: THREE.BackSide,
            fog: false 
        });
        this.sky = new THREE.Mesh(skyGeo, this.skyMat);
        this.scene.add(this.sky);

        // Lights to pop the neon
        const hemiLight = new THREE.HemisphereLight(0x4433aa, 0x111122, 1.2);
        this.scene.add(hemiLight);

        this.sunGeo = new THREE.SphereGeometry(30, 32, 32);
        this.sunMat = new THREE.MeshBasicMaterial({ 
            color: 0xff00bb,
            fog: false,
            transparent: true,
            opacity: 0.3
        });
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
            positions[i * 3] = (Math.random() - 0.5) * 400;
            positions[i * 3 + 1] = (Math.random() - 0.2) * 200;
            positions[i * 3 + 2] = -Math.random() * 800;

            const color = new THREE.Color();
            color.setHSL(Math.random() * 0.2 + 0.5, 0.8, 0.8); // Blue/Cyan tint
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const mat = new THREE.PointsMaterial({ 
            size: 0.8, 
            vertexColors: true, 
            transparent: true, 
            opacity: 0.6,
            blending: THREE.AdditiveBlending 
        });
        this.particles = new THREE.Points(geo, mat);
        this.scene.add(this.particles);
    }

    initTrack() {
        for (let i = 0; i < CONFIG.TRACK_SEGMENT_COUNT; i++) {
            const z = i * CONFIG.TRACK_SEGMENT_LENGTH;
            this.createSegment(z);
            // Immediate spawns for excitement
            if (i >= 1) {
                this.spawnObjects(-z - CONFIG.TRACK_SEGMENT_LENGTH / 2, CONFIG.INITIAL_SPEED);
            }
        }
    }

    createSegment(z) {
        const group = new THREE.Group();
        
        // Transparent Neon Floor
        const geo = new THREE.PlaneGeometry(15, CONFIG.TRACK_SEGMENT_LENGTH);
        const mat = new THREE.MeshPhongMaterial({ 
            color: 0x050515, 
            transparent: true, 
            opacity: 0.8,
            shininess: 100 
        });
        const floor = new THREE.Mesh(geo, mat);
        floor.rotation.x = -Math.PI / 2;
        group.add(floor);

        // Tracks with Glow
        const railGeo = new THREE.BoxGeometry(0.12, 0.12, CONFIG.TRACK_SEGMENT_LENGTH);
        const railMat = new THREE.MeshPhongMaterial({ 
            color: 0x00f2ff, 
            emissive: 0x00f2ff, 
            emissiveIntensity: 0.2 
        });
        const sleeperGeo = new THREE.BoxGeometry(2, 0.05, 0.3);
        const sleeperMat = new THREE.MeshPhongMaterial({ color: 0x222222 });

        CONFIG.LANES.forEach(laneX => {
            const railL = new THREE.Mesh(railGeo, railMat);
            railL.position.set(laneX - 0.7, 0.1, 0);
            group.add(railL);
            
            const railR = new THREE.Mesh(railGeo, railMat);
            railR.position.set(laneX + 0.7, 0.1, 0);
            group.add(railR);

            for (let s = -CONFIG.TRACK_SEGMENT_LENGTH / 2; s < CONFIG.TRACK_SEGMENT_LENGTH / 2; s += 3) {
                const sleeper = new THREE.Mesh(sleeperGeo, sleeperMat);
                sleeper.position.set(laneX, 0.04, s);
                group.add(sleeper);
            }

            // Central Neon Line
            const neonGeo = new THREE.PlaneGeometry(0.05, CONFIG.TRACK_SEGMENT_LENGTH);
            const neonMat = new THREE.MeshBasicMaterial({ color: 0x00f2ff, transparent: true, opacity: 0.3 });
            const neon = new THREE.Mesh(neonGeo, neonMat);
            neon.rotation.x = -Math.PI / 2;
            neon.position.set(laneX, 0.02, 0);
            group.add(neon);
        });

        group.position.z = -z - CONFIG.TRACK_SEGMENT_LENGTH / 2;
        this.scene.add(group);
        this.segments.push(group);
    }

    update(speed, deltaTime) {
        const moveDist = (speed / 3.6) * deltaTime;
        
        // Slowly rotate background for liveliness
        if (this.sky) this.sky.rotation.y += 0.01 * deltaTime;
        if (this.sun) this.sun.position.y = 120 + Math.sin(Date.now() * 0.001) * 10;

        this.segments.forEach(seg => {
            seg.position.z += moveDist;
        });

        if (this.segments[0].position.z > CONFIG.TRACK_SEGMENT_LENGTH) {
            const first = this.segments.shift();
            const last = this.segments[this.segments.length - 1];
            const newZ = last.position.z - CONFIG.TRACK_SEGMENT_LENGTH;
            first.position.z = newZ;
            this.segments.push(first);
            // More spaced out spawns: Every 33% of the segment
            for (let d = 0; d < 1; d += 0.33) {
                this.spawnObjects(newZ + CONFIG.TRACK_SEGMENT_LENGTH * d, speed);
            }
        }

        for (let index = this.objects.length - 1; index >= 0; index--) {
            const obj = this.objects[index];
            obj.mesh.position.z += moveDist;

            if (obj.isMoving) {
                // Move forward/backward along track
                obj.mesh.position.z += (obj.moveSpeed / 3.6) * deltaTime;

                // Smooth lane switching for moving obstacles
                if (obj.type === 'obstacle' && obj.moveSpeed > 0) {
                    if (obj.laneSwitchTimer === undefined) obj.laneSwitchTimer = 0;
                    if (obj.targetLaneX === undefined) obj.targetLaneX = obj.mesh.position.x;
                    obj.laneSwitchTimer += deltaTime;
                    if (obj.laneSwitchTimer > 2.0) {
                        // Uni-directional cycle: Left (-3) -> Middle (0) -> Right (3) -> Left (-3)
                        const currentLaneIdx = CONFIG.LANES.indexOf(obj.targetLaneX);
                        const nextLaneIdx = (currentLaneIdx + 1) % CONFIG.LANES.length;
                        obj.targetLaneX = CONFIG.LANES[nextLaneIdx];
                        
                        // Teleport directly (no sliding through middle lanes)
                        obj.mesh.position.x = obj.targetLaneX;
                        obj.laneSwitchTimer = 0;
                    }
                }

                // Complex obstacle side-to-side sweep
                if (obj.type === 'obstacle_complex') {
                    if (obj.sweepOrigin === undefined) obj.sweepOrigin = obj.mesh.position.x;
                    obj.mesh.position.x = obj.sweepOrigin + Math.sin(Date.now() * 0.002) * 2.5;
                }
            }

            // Spin coins and diamonds
            if (obj.type === 'coin') obj.mesh.rotation.y += 3 * deltaTime;
            if (obj.type && obj.type.startsWith('diamond_')) {
                obj.mesh.rotation.y += 2 * deltaTime;
                obj.mesh.rotation.x += 1 * deltaTime;
            }

            if (obj.mesh.position.z > 30) {
                this.scene.remove(obj.mesh);
                this.objects.splice(index, 1);
            }
        }

        if (this.particles) {
            this.particles.position.z += moveDist * 0.5; // Parallax
            if (this.particles.position.z > 400) this.particles.position.z = 0;
        }
    }

    spawnObjects(zPos, speed) {
        // Diamond speed values
        const DIAMOND_DELTAS = [+5, +2, +1, +8, -1, -2, -5, -8];

        const allLanes = [...CONFIG.LANES]; // [−3, 0, 3]
        // Increase density: Decide how many lanes get an object (1, 2, or rarely 3 with a gap)
        // We'll allow 1-2 objects per row usually, but sometimes more
        const randCount = Math.random();
        // Balanced density: 1, 2, or rarely 3 objects
        const objectCount = randCount < 0.4 ? 1 : (randCount < 0.9 ? 2 : 3);
        
        const chosenLanes = [];
        const lanePool = [...allLanes];
        for (let i = 0; i < objectCount; i++) {
            if (lanePool.length === 0) break;
            const idx = Math.floor(Math.random() * lanePool.length);
            chosenLanes.push(lanePool.splice(idx, 1)[0]);
        }

        let blockingCount = 0;
        chosenLanes.forEach((x, i) => {
            const rand = Math.random();
            let type, mesh, isMoving = false, moveSpeed = 0;

            // Relaxed ratios for better flow:
            // Obstacles: 15% | Coins: 65% | Diamonds: 20%
            // Only 1 obstacle allowed per row now for maximum fairness
            const forceCollectible = (blockingCount >= 1);
            
            if (rand < 0.15 && !forceCollectible) {
                blockingCount++;
                // ─── OBSTACLE ───
                type = 'obstacle';
                const obsVar = Math.random();
                if (obsVar < 0.35) {
                    // Static barrier — kept narrower so adjacent lanes are passable
                    mesh = new THREE.Mesh(
                        new THREE.BoxGeometry(2.2, 5, 1.5),
                        new THREE.MeshPhongMaterial({ color: 0xff0055, emissive: 0xff0055, emissiveIntensity: 0.5 })
                    );
                    mesh.position.set(x, 2.5, zPos);
                } else if (obsVar < 0.65) {
                    // Moving train — starts in one lane, lerps around
                    mesh = new THREE.Mesh(
                        new THREE.BoxGeometry(2.6, 3.5, 22),
                        new THREE.MeshPhongMaterial({ color: 0x222222, emissive: 0x00f2ff, emissiveIntensity: 0.3 })
                    );
                    mesh.position.set(x, 1.75, zPos - 11);
                    isMoving = true;
                    moveSpeed = 35;
                } else {
                    // Sweeping obstacle
                    type = 'obstacle_complex';
                    mesh = new THREE.Mesh(
                        new THREE.BoxGeometry(1.8, 2, 1.8),
                        new THREE.MeshPhongMaterial({ color: 0xffaa00, emissive: 0xffaa00, emissiveIntensity: 0.6 })
                    );
                    mesh.position.set(x, 1, zPos);
                    isMoving = true;
                    moveSpeed = -8;
                }
            } else if (rand < 0.80) {
                // ─── COIN (65% chance) ───
                type = 'coin';
                mesh = new THREE.Mesh(
                    new THREE.TorusGeometry(0.5, 0.15, 8, 16),
                    new THREE.MeshPhongMaterial({ color: 0xffd700, emissive: 0xffd700, emissiveIntensity: 0.6 })
                );
                mesh.position.set(x, 1.2, zPos);
            } else {
                // ─── DIAMOND (20% chance) ───
                const delta = DIAMOND_DELTAS[Math.floor(Math.random() * DIAMOND_DELTAS.length)];
                type = 'diamond_' + (delta >= 0 ? '+' : '') + delta;
                const color = delta > 0 ? 0x00ffaa : 0xff4444;
                const emissive = delta > 0 ? 0x00ffaa : 0xff4444;
                mesh = new THREE.Mesh(
                    new THREE.OctahedronGeometry(0.55),
                    new THREE.MeshPhongMaterial({ color, emissive, emissiveIntensity: 1.8 })
                );
                mesh.position.set(x, 1.3, zPos);

                // Label using a sprite
                const canvas = document.createElement('canvas');
                canvas.width = 128; canvas.height = 64;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = delta > 0 ? '#00ffaa' : '#ff4444';
                ctx.font = 'bold 44px Arial'; // Larger font
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.strokeStyle = '#000'; // Add outline for better visibility
                ctx.lineWidth = 4;
                ctx.strokeText((delta > 0 ? '+' : '') + delta + 'KM/H', 64, 32);
                ctx.fillText((delta > 0 ? '+' : '') + delta + 'KM/H', 64, 32);
                const tex = new THREE.CanvasTexture(canvas);
                const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true });
                const sprite = new THREE.Sprite(spriteMat);
                sprite.scale.set(1.2, 0.6, 1);
                sprite.position.set(0, 1.2, 0);
                mesh.add(sprite);
            }

            this.scene.add(mesh);
            this.objects.push({ mesh, type, isMoving, moveSpeed });
        });
    }

    reset() {
        this.objects.forEach(obj => this.scene.remove(obj.mesh));
        this.objects = [];
        this.segments.forEach((seg, i) => {
            seg.position.z = -i * CONFIG.TRACK_SEGMENT_LENGTH - CONFIG.TRACK_SEGMENT_LENGTH / 2;
        });
        // Extreme initial density
        for (let i = 1; i < CONFIG.TRACK_SEGMENT_COUNT; i++) {
            const z = this.segments[i].position.z;
            for (let d = 0; d < 1; d += 0.33) {
                this.spawnObjects(z + CONFIG.TRACK_SEGMENT_LENGTH * d, CONFIG.INITIAL_SPEED);
            }
        }
    }
}
