import * as THREE from 'three';
import { CONFIG } from './Config';
import { StorageManager } from './StorageManager';

export class Player {
    constructor(scene) {
        this.scene = scene;
        this.laneIndex = 1;
        this.targetX = CONFIG.LANES[this.laneIndex];
        this.isJumping = false;
        this.velocityY = 0;
        
        this.container = new THREE.Group();
        this.scene.add(this.container);
        
        this.updateMesh();
    }

    updateMesh() {
        while(this.container.children.length > 0){ 
            this.container.remove(this.container.children[0]); 
        }

        const avatarId = StorageManager.getSelectedAvatar();
        const config = CONFIG.AVATARS.find(a => a.id === avatarId) || CONFIG.AVATARS[0];
        const color = config.color;

        const mainMat = new THREE.MeshPhongMaterial({ color: color });
        const secondaryMat = new THREE.MeshPhongMaterial({ color: 0x333333 });
        const accentMat = new THREE.MeshBasicMaterial({ color: color });
        const skinMat = new THREE.MeshPhongMaterial({ color: 0xffdbac }); // Skin tone

        // --- SKATEBOARD ---
        const boardId = StorageManager.getSelectedSkateboard();
        const boardConfig = CONFIG.SKATEBOARDS.find(s => s.id === boardId) || CONFIG.SKATEBOARDS[0];
        const boardColor = boardConfig.color;
        
        const boardMat = new THREE.MeshPhongMaterial({ color: boardColor });
        const boardGlowMat = new THREE.MeshBasicMaterial({ color: boardColor });

        const board = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.15, 1.8), secondaryMat);
        board.position.y = 0.07;
        this.container.add(board);
        
        const boardGlow = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.05, 1.9), boardGlowMat);
        boardGlow.position.y = 0.03;
        this.container.add(boardGlow);

        // Special board effects
        if (boardId === 'gold_board') {
            const wingGeo = new THREE.BoxGeometry(0.1, 0.5, 1.2);
            const lWing = new THREE.Mesh(wingGeo, boardGlowMat);
            lWing.position.set(-0.65, 0.3, 0);
            lWing.rotation.z = Math.PI / 4;
            this.container.add(lWing);
            const rWing = new THREE.Mesh(wingGeo, boardGlowMat);
            rWing.position.set(0.65, 0.3, 0);
            rWing.rotation.z = -Math.PI / 4;
            this.container.add(rWing);
        } else if (boardId === 'plasma_board' || boardId === 'titan' || boardId === 'nebula') {
            const ringGeo = new THREE.TorusGeometry(0.8, 0.05, 8, 24);
            const ring = new THREE.Mesh(ringGeo, boardGlowMat);
            ring.rotation.x = Math.PI / 2;
            ring.position.y = 0.05;
            this.container.add(ring);
            if (boardId === 'titan') ring.scale.set(1.2, 1.2, 1);
        } else if (boardId === 'solar_flare' || boardId === 'phoenix' || boardId === 'ruby_spark') {
            const fireGeo = new THREE.ConeGeometry(0.5, 1.5, 8);
            const fire = new THREE.Mesh(fireGeo, boardGlowMat);
            fire.position.set(0, -0.5, -0.8);
            fire.rotation.x = -Math.PI / 2;
            this.container.add(fire);
        } else if (boardId === 'singularity' || boardId === 'omega') {
            const sphereGeo = new THREE.SphereGeometry(0.6, 16, 16);
            const sphere = new THREE.Mesh(sphereGeo, boardGlowMat);
            sphere.position.y = -0.2;
            this.container.add(sphere);
        }

        // --- CHARACTER BODY (Shared basics) ---
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 0.15;
        this.container.add(bodyGroup);

        // Legs
        const legGeo = new THREE.BoxGeometry(0.3, 0.7, 0.3);
        const lLeg = new THREE.Mesh(legGeo, secondaryMat);
        lLeg.position.set(-0.25, 0.35, 0);
        bodyGroup.add(lLeg);
        const rLeg = new THREE.Mesh(legGeo, secondaryMat);
        rLeg.position.set(0.25, 0.35, 0);
        bodyGroup.add(rLeg);

        // Torso
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.4), mainMat);
        torso.position.y = 1.15;
        bodyGroup.add(torso);

        // Arms
        const armGeo = new THREE.BoxGeometry(0.2, 0.8, 0.2);
        const lArm = new THREE.Mesh(armGeo, secondaryMat);
        lArm.position.set(-0.45, 1.2, 0);
        bodyGroup.add(lArm);
        const rArm = new THREE.Mesh(armGeo, secondaryMat);
        rArm.position.set(0.45, 1.2, 0);
        bodyGroup.add(rArm);

        // Head
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.45), skinMat);
        head.position.y = 1.8;
        bodyGroup.add(head);

        // --- AVATAR SPECIFIC FEATURES ---
        if (avatarId === 'knight' || avatarId === 'dark_knight') {
            // Helmet
            const helmet = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), secondaryMat);
            helmet.position.y = 1.85;
            bodyGroup.add(helmet);
            // Visor
            const visor = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.15, 0.52), accentMat);
            visor.position.y = 1.9;
            bodyGroup.add(visor);
            // Plume
            const plume = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.2, 0.4), accentMat);
            plume.position.set(0, 2.2, -0.2);
            plume.rotation.x = Math.PI / 4;
            bodyGroup.add(plume);
        } else if (avatarId === 'archer') {
            // Hood
            const hood = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.6, 0.55), mainMat);
            hood.position.y = 1.85;
            bodyGroup.add(hood);
            // Bow on back
            const bow = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.05, 8, 16, Math.PI), accentMat);
            bow.position.set(0, 1.2, -0.3);
            bow.rotation.z = Math.PI / 4;
            bodyGroup.add(bow);
        } else if (avatarId === 'mage') {
            // Hat
            const hatBase = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.1), mainMat);
            hatBase.position.y = 2.05;
            bodyGroup.add(hatBase);
            const hatTop = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.8, 8), mainMat);
            hatTop.position.y = 2.4;
            bodyGroup.add(hatTop);
            // Staff in hand
            const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2), secondaryMat);
            staff.position.set(0.6, 1.1, 0.2);
            bodyGroup.add(staff);
            const gem = new THREE.Mesh(new THREE.SphereGeometry(0.15), accentMat);
            gem.position.set(0.6, 2.1, 0.2);
            bodyGroup.add(gem);
        } else if (avatarId === 'cyborg') {
            // Mechanical Eye
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.1), accentMat);
            eye.position.set(0.15, 1.9, 0.2);
            bodyGroup.add(eye);
            // Metallic shoulder pad
            const pad = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 0.4), mainMat);
            pad.position.set(-0.45, 1.6, 0);
            bodyGroup.add(pad);
        } else if (avatarId === 'dragon_slayer' || avatarId === 'eternal_king') {
            // Cape
            const cape = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.5, 0.1), mainMat);
            cape.position.set(0, 0.8, -0.25);
            cape.rotation.x = 0.1;
            bodyGroup.add(cape);
            // Crown for King
            if (avatarId === 'eternal_king') {
                const crown = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.05, 8, 16), accentMat);
                crown.position.y = 2.1;
                crown.rotation.x = Math.PI/2;
                bodyGroup.add(crown);
            }
        } else if (avatarId === 'neon_god' || avatarId === 'zero_point') {
            // Aura Ring
            const aura = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.02, 8, 32), accentMat);
            aura.position.y = 1.2;
            bodyGroup.add(aura);
        } else if (avatarId === 'solar_empress' || avatarId === 'lunar_guardian') {
            // Large Wings
            const wingGeo = new THREE.BoxGeometry(1.5, 0.1, 0.8);
            const lWing = new THREE.Mesh(wingGeo, mainMat);
            lWing.position.set(-0.8, 1.5, -0.2);
            lWing.rotation.z = Math.PI/4;
            bodyGroup.add(lWing);
            const rWing = new THREE.Mesh(wingGeo, mainMat);
            rWing.position.set(0.8, 1.5, -0.2);
            rWing.rotation.z = -Math.PI/4;
            bodyGroup.add(rWing);
        }

        this.container.position.y = 0;
    }

    update(deltaTime) {
        this.container.position.x += (this.targetX - this.container.position.x) * CONFIG.LANE_ANIMATION_SPEED;

        const time = Date.now() * 0.005;
        if (!this.isJumping) {
            // Smooth hover animation
            this.container.position.y = 0.2 + Math.sin(time) * 0.1;
            this.container.rotation.z = Math.sin(time * 0.5) * 0.05;
            this.container.rotation.x = Math.cos(time * 0.5) * 0.05;
        }

        if (this.isJumping) {
            this.velocityY -= CONFIG.GRAVITY;
            this.container.position.y += this.velocityY;

            if (this.container.position.y <= 0.2) {
                this.container.position.y = 0.2;
                this.isJumping = false;
                this.velocityY = 0;
            }
            this.container.rotation.x = -this.velocityY * 2;
        }
    }

    moveLeft() {
        if (this.laneIndex > 0) {
            this.laneIndex--;
            this.targetX = CONFIG.LANES[this.laneIndex];
        }
    }

    moveRight() {
        if (this.laneIndex < CONFIG.LANES.length - 1) {
            this.laneIndex++;
            this.targetX = CONFIG.LANES[this.laneIndex];
        }
    }

    jump() {
        if (!this.isJumping) {
            this.isJumping = true;
            this.velocityY = CONFIG.JUMP_FORCE;
        }
    }

    reset() {
        this.laneIndex = 1;
        this.targetX = CONFIG.LANES[this.laneIndex];
        this.container.position.x = this.targetX;
        this.container.position.y = 0.2;
        this.isJumping = false;
        this.velocityY = 0;
        this.container.rotation.set(0,0,0);
        this.updateMesh();
    }
}
