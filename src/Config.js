export const CONFIG = {
    LANES: [-3, 0, 3],
    INITIAL_SPEED: 50,
    LANE_ANIMATION_SPEED: 0.25,
    JUMP_FORCE: 0.45,
    GRAVITY: 0.018,
    TRACK_SEGMENT_LENGTH: 60,
    TRACK_SEGMENT_COUNT: 6,
    SPAWN_INTERVAL: 0.5,
    MIN_SPAWN_Z: 20,
    MAX_SPAWN_Z: 250,
    SPEED_INCREMENT: 2,
    SPEED_DECREMENT: 8,
    SCORE_MULTIPLIER: 0.1,
    REVIVE_COST: 100,
    
    // Day/Night Cycle Themes
    THEMES: {
        MORNING: {
            SKY: 0x87ceeb,
            SUN: 0xffcc33,
            OBSTACLE: 0x2c3e50,
            FOG: 0x87ceeb
        },
        EVENING: {
            SKY: 0x2c3e50,
            SUN: 0xff4400,
            OBSTACLE: 0x1a1a1a,
            FOG: 0x2c3e50
        },
        NIGHT: {
            SKY: 0x050505,
            SUN: 0x111111,
            OBSTACLE: 0xff0055, // Scary glowing obstacles
            FOG: 0x050505
        }
    },

    AVATARS: [
        { id: 'knight', name: 'Noble Knight', color: 0x3498db, cost: 0, rarity: 'Hero' },
        { id: 'archer', name: 'Swift Archer', color: 0x2ecc71, cost: 2000, rarity: 'Hero' },
        { id: 'mage', name: 'Mystic Mage', color: 0x9b59b6, cost: 5000, rarity: 'Hero' },
        { id: 'dark_knight', name: 'Dark Overlord', color: 0xe74c3c, cost: 10000, rarity: 'Villain' },
        { id: 'assassin', name: 'Shadow Stalker', color: 0x8e44ad, cost: 15000, rarity: 'Villain' },
        { id: 'cyborg', name: 'Iron Titan', color: 0xf39c12, cost: 20000, rarity: 'Villain' },
        { id: 'samurai', name: 'Valiant Samurai', color: 0xd35400, cost: 25000, rarity: 'Hero' },
        { id: 'robot', name: 'Steel Robot', color: 0x7f8c8d, cost: 30000, rarity: 'Villain' },
        { id: 'ninja', name: 'Silent Ninja', color: 0x2c3e50, cost: 40000, rarity: 'Villain' },
        { id: 'pilot', name: 'Ace Pilot', color: 0x34495e, cost: 50000, rarity: 'Legend' },
        { id: 'ghost', name: 'Phantom Soul', color: 0xecf0f1, cost: 60000, rarity: 'Legend' },
        { id: 'pharaoh', name: 'Sun King', color: 0xf1c40f, cost: 75000, rarity: 'Legend' },
        { id: 'viking', name: 'North Raider', color: 0xe67e22, cost: 100000, rarity: 'Legend' },
        { id: 'reaper', name: 'Soul Taker', color: 0x111111, cost: 125000, rarity: 'Mythic' },
        { id: 'astronaut', name: 'Void Walker', color: 0xffffff, cost: 150000, rarity: 'Mythic' },
        { id: 'dragon_slayer', name: 'Dragon Slayer', color: 0xc0392b, cost: 200000, rarity: 'Epic' },
        { id: 'cyber_queen', name: 'Cyber Queen', color: 0xff00ff, cost: 250000, rarity: 'Epic' },
        { id: 'neon_god', name: 'Neon God', color: 0x00f2ff, cost: 300000, rarity: 'Godly' },
        { id: 'chrono', name: 'Time Weaver', color: 0x1abc9c, cost: 400000, rarity: 'Godly' },
        { id: 'void_stalker', name: 'Void Stalker', color: 0x2c3e50, cost: 500000, rarity: 'Godly' },
        { id: 'solar_empress', name: 'Solar Empress', color: 0xf39c12, cost: 600000, rarity: 'Celestial' },
        { id: 'lunar_guardian', name: 'Lunar Guardian', color: 0xbdc3c7, cost: 700000, rarity: 'Celestial' },
        { id: 'eternal_king', name: 'Eternal King', color: 0x9b59b6, cost: 800000, rarity: 'Divine' },
        { id: 'cosmic', name: 'Cosmic Entity', color: 0x34495e, cost: 900000, rarity: 'Divine' },
        { id: 'zero_point', name: 'Zero Point', color: 0xffffff, cost: 1000000, rarity: 'Ultimate' }
    ],

    SKATEBOARDS: [
        { id: 'basic_board', name: 'Neon Slider', color: 0x00f2ff, cost: 0, rarity: 'Common' },
        { id: 'flame_board', name: 'Fire Runner', color: 0xff4400, cost: 2000, rarity: 'Rare' },
        { id: 'plasma_board', name: 'Plasma Disk', color: 0x9b59b6, cost: 5000, rarity: 'Epic' },
        { id: 'gold_board', name: 'Golden Wing', color: 0xffd700, cost: 10000, rarity: 'Legendary' },
        { id: 'void_board', name: 'Void Shadow', color: 0x222222, cost: 15000, rarity: 'Mythic' },
        { id: 'cyber_rex', name: 'Cyber Rex', color: 0x2ecc71, cost: 20000, rarity: 'Legendary' },
        { id: 'ice_breaker', name: 'Ice Breaker', color: 0xa8dadc, cost: 25000, rarity: 'Legendary' },
        { id: 'solar_flare', name: 'Solar Flare', color: 0xe63946, cost: 30000, rarity: 'Mythic' },
        { id: 'galaxy_edge', name: 'Galaxy Edge', color: 0x457b9d, cost: 40000, rarity: 'Mythic' },
        { id: 'prism_shifter', name: 'Prism Shifter', color: 0xffffff, cost: 50000, rarity: 'Mythic' },
        { id: 'thunder_bolt', name: 'Thunder Bolt', color: 0xf1c40f, cost: 75000, rarity: 'Epic' },
        { id: 'emerald_glide', name: 'Emerald Glide', color: 0x27ae60, cost: 100000, rarity: 'Epic' },
        { id: 'ruby_spark', name: 'Ruby Spark', color: 0xe74c3c, cost: 125000, rarity: 'Epic' },
        { id: 'sapphire_flow', name: 'Sapphire Flow', color: 0x2980b9, cost: 150000, rarity: 'Legendary' },
        { id: 'obsidian_wing', name: 'Obsidian Wing', color: 0x111111, cost: 200000, rarity: 'Legendary' },
        { id: 'phoenix', name: 'Phoenix Rise', color: 0xd35400, cost: 250000, rarity: 'Legendary' },
        { id: 'kraken', name: 'Kraken Reach', color: 0x16a085, cost: 300000, rarity: 'Mythic' },
        { id: 'hydra', name: 'Hydra Split', color: 0x8e44ad, cost: 400000, rarity: 'Mythic' },
        { id: 'titan', name: 'Titan Core', color: 0x7f8c8d, cost: 500000, rarity: 'Mythic' },
        { id: 'nebula', name: 'Nebula Drift', color: 0x34495e, cost: 600000, rarity: 'Celestial' },
        { id: 'pulsar', name: 'Pulsar Wave', color: 0xecf0f1, cost: 700000, rarity: 'Celestial' },
        { id: 'quasar', name: 'Quasar Beam', color: 0xf1c40f, cost: 800000, rarity: 'Celestial' },
        { id: 'singularity', name: 'Singularity', color: 0x000000, cost: 900000, rarity: 'Divine' },
        { id: 'infinity', name: 'Infinity Loop', color: 0x00f2ff, cost: 950000, rarity: 'Divine' },
        { id: 'omega', name: 'Omega Board', color: 0xff0055, cost: 1000000, rarity: 'Ultimate' }
    ]
};
