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
    
    THEMES: {
        MORNING: { SKY: 0x87ceeb, SUN: 0xffcc33, OBSTACLE: 0x2c3e50, FOG: 0x87ceeb },
        EVENING: { SKY: 0x2c3e50, SUN: 0xff4400, OBSTACLE: 0x1a1a1a, FOG: 0x2c3e50 },
        NIGHT:   { SKY: 0x050505, SUN: 0x111111, OBSTACLE: 0xff0055, FOG: 0x050505 }
    },

    AVATARS: [
        { id: 'knight',        name: 'Noble Knight',    color: 0x3498db, cost: 0,       gemCost: 0,   rarity: 'Hero' },
        { id: 'archer',        name: 'Swift Archer',    color: 0x2ecc71, cost: 2000,    gemCost: 3,   rarity: 'Hero' },
        { id: 'mage',          name: 'Mystic Mage',     color: 0x9b59b6, cost: 5000,    gemCost: 6,   rarity: 'Hero' },
        { id: 'dark_knight',   name: 'Dark Overlord',   color: 0xe74c3c, cost: 10000,   gemCost: 10,  rarity: 'Villain' },
        { id: 'assassin',      name: 'Shadow Stalker',  color: 0x8e44ad, cost: 15000,   gemCost: 15,  rarity: 'Villain' },
        { id: 'cyborg',        name: 'Iron Titan',      color: 0xf39c12, cost: 20000,   gemCost: 18,  rarity: 'Villain' },
        { id: 'samurai',       name: 'Valiant Samurai', color: 0xd35400, cost: 25000,   gemCost: 22,  rarity: 'Hero' },
        { id: 'robot',         name: 'Steel Robot',     color: 0x7f8c8d, cost: 30000,   gemCost: 28,  rarity: 'Villain' },
        { id: 'ninja',         name: 'Silent Ninja',    color: 0x2c3e50, cost: 40000,   gemCost: 35,  rarity: 'Villain' },
        { id: 'pilot',         name: 'Ace Pilot',       color: 0x34495e, cost: 50000,   gemCost: 42,  rarity: 'Legend' },
        { id: 'ghost',         name: 'Phantom Soul',    color: 0xecf0f1, cost: 60000,   gemCost: 50,  rarity: 'Legend' },
        { id: 'pharaoh',       name: 'Sun King',        color: 0xf1c40f, cost: 75000,   gemCost: 60,  rarity: 'Legend' },
        { id: 'viking',        name: 'North Raider',    color: 0xe67e22, cost: 100000,  gemCost: 75,  rarity: 'Legend' },
        { id: 'reaper',        name: 'Soul Taker',      color: 0x111111, cost: 125000,  gemCost: 90,  rarity: 'Mythic' },
        { id: 'astronaut',     name: 'Void Walker',     color: 0xffffff, cost: 150000,  gemCost: 100, rarity: 'Mythic' },
        { id: 'dragon_slayer', name: 'Dragon Slayer',   color: 0xc0392b, cost: 200000,  gemCost: 120, rarity: 'Epic' },
        { id: 'cyber_queen',   name: 'Cyber Queen',     color: 0xff00ff, cost: 250000,  gemCost: 150, rarity: 'Epic' },
        { id: 'neon_god',      name: 'Neon God',        color: 0x00f2ff, cost: 300000,  gemCost: 180, rarity: 'Godly' },
        { id: 'chrono',        name: 'Time Weaver',     color: 0x1abc9c, cost: 400000,  gemCost: 220, rarity: 'Godly' },
        { id: 'void_stalker',  name: 'Void Stalker',    color: 0x2c3e50, cost: 500000,  gemCost: 260, rarity: 'Godly' },
        { id: 'solar_empress', name: 'Solar Empress',   color: 0xf39c12, cost: 600000,  gemCost: 300, rarity: 'Celestial' },
        { id: 'lunar_guardian',name: 'Lunar Guardian',  color: 0xbdc3c7, cost: 700000,  gemCost: 340, rarity: 'Celestial' },
        { id: 'eternal_king',  name: 'Eternal King',    color: 0x9b59b6, cost: 800000,  gemCost: 380, rarity: 'Divine' },
        { id: 'cosmic',        name: 'Cosmic Entity',   color: 0x34495e, cost: 900000,  gemCost: 420, rarity: 'Divine' },
        { id: 'zero_point',    name: 'Zero Point',      color: 0xffffff, cost: 1000000, gemCost: 500, rarity: 'Ultimate' }
    ],

    SKATEBOARDS: [
        { id: 'basic_board',    name: 'Neon Slider',    color: 0x00f2ff, cost: 0,       gemCost: 0,   rarity: 'Common' },
        { id: 'flame_board',    name: 'Fire Runner',    color: 0xff4400, cost: 2000,    gemCost: 3,   rarity: 'Rare' },
        { id: 'plasma_board',   name: 'Plasma Disk',    color: 0x9b59b6, cost: 5000,    gemCost: 6,   rarity: 'Epic' },
        { id: 'gold_board',     name: 'Golden Wing',    color: 0xffd700, cost: 10000,   gemCost: 10,  rarity: 'Legendary' },
        { id: 'void_board',     name: 'Void Shadow',    color: 0x222222, cost: 15000,   gemCost: 15,  rarity: 'Mythic' },
        { id: 'cyber_rex',      name: 'Cyber Rex',      color: 0x2ecc71, cost: 20000,   gemCost: 18,  rarity: 'Legendary' },
        { id: 'ice_breaker',    name: 'Ice Breaker',    color: 0xa8dadc, cost: 25000,   gemCost: 22,  rarity: 'Legendary' },
        { id: 'solar_flare',    name: 'Solar Flare',    color: 0xe63946, cost: 30000,   gemCost: 28,  rarity: 'Mythic' },
        { id: 'galaxy_edge',    name: 'Galaxy Edge',    color: 0x457b9d, cost: 40000,   gemCost: 35,  rarity: 'Mythic' },
        { id: 'prism_shifter',  name: 'Prism Shifter',  color: 0xffffff, cost: 50000,   gemCost: 42,  rarity: 'Mythic' },
        { id: 'thunder_bolt',   name: 'Thunder Bolt',   color: 0xf1c40f, cost: 75000,   gemCost: 55,  rarity: 'Epic' },
        { id: 'emerald_glide',  name: 'Emerald Glide',  color: 0x27ae60, cost: 100000,  gemCost: 70,  rarity: 'Epic' },
        { id: 'ruby_spark',     name: 'Ruby Spark',     color: 0xe74c3c, cost: 125000,  gemCost: 85,  rarity: 'Epic' },
        { id: 'sapphire_flow',  name: 'Sapphire Flow',  color: 0x2980b9, cost: 150000,  gemCost: 100, rarity: 'Legendary' },
        { id: 'obsidian_wing',  name: 'Obsidian Wing',  color: 0x111111, cost: 200000,  gemCost: 120, rarity: 'Legendary' },
        { id: 'phoenix',        name: 'Phoenix Rise',   color: 0xd35400, cost: 250000,  gemCost: 150, rarity: 'Legendary' },
        { id: 'kraken',         name: 'Kraken Reach',   color: 0x16a085, cost: 300000,  gemCost: 180, rarity: 'Mythic' },
        { id: 'hydra',          name: 'Hydra Split',    color: 0x8e44ad, cost: 400000,  gemCost: 220, rarity: 'Mythic' },
        { id: 'titan',          name: 'Titan Core',     color: 0x7f8c8d, cost: 500000,  gemCost: 260, rarity: 'Mythic' },
        { id: 'nebula',         name: 'Nebula Drift',   color: 0x34495e, cost: 600000,  gemCost: 300, rarity: 'Celestial' },
        { id: 'pulsar',         name: 'Pulsar Wave',    color: 0xecf0f1, cost: 700000,  gemCost: 340, rarity: 'Celestial' },
        { id: 'quasar',         name: 'Quasar Beam',    color: 0xf1c40f, cost: 800000,  gemCost: 380, rarity: 'Celestial' },
        { id: 'singularity',    name: 'Singularity',    color: 0x000000, cost: 900000,  gemCost: 420, rarity: 'Divine' },
        { id: 'infinity',       name: 'Infinity Loop',  color: 0x00f2ff, cost: 950000,  gemCost: 460, rarity: 'Divine' },
        { id: 'omega',          name: 'Omega Board',    color: 0xff0055, cost: 1000000, gemCost: 500, rarity: 'Ultimate' }
    ],

    POWERUPS: {
        MAGNET: { id: 'magnet', name: 'Magnet', duration: 20, radius: 12, color: 0x00f2ff },
        SHIELD: { id: 'shield', name: 'Shield', duration: 20, color: 0xff0055 }
    },

    UPGRADES: [
        { id: 'magnet_duration', name: 'Magnet Time',  cost: 1000, increment: 2, maxLevel: 5 },
        { id: 'shield_duration', name: 'Shield Time',  cost: 1200, increment: 3, maxLevel: 5 },
        { id: 'start_speed',     name: 'Boost Start',  cost: 1500, increment: 5, maxLevel: 5 }
    ],

    // Dynamic mission pool — 3 are active at any time, completed ones are replaced randomly
    MISSION_POOL: [
        { id: 'm_coins_50',    text: 'Collect 50 Coins',   type: 'coins',    goal: 50,    difficulty: 'Easy',    reward: 300,  gemReward: 0 },
        { id: 'm_coins_100',   text: 'Collect 100 Coins',  type: 'coins',    goal: 100,   difficulty: 'Easy',    reward: 500,  gemReward: 0 },
        { id: 'm_coins_150',   text: 'Collect 150 Coins',  type: 'coins',    goal: 150,   difficulty: 'Medium',  reward: 800,  gemReward: 1 },
        { id: 'm_coins_300',   text: 'Collect 300 Coins',  type: 'coins',    goal: 300,   difficulty: 'Hard',    reward: 2000, gemReward: 3 },
        { id: 'm_coins_500',   text: 'Collect 500 Coins',  type: 'coins',    goal: 500,   difficulty: 'Hard',    reward: 2200, gemReward: 4 },
        { id: 'm_coins_600',   text: 'Collect 600 Coins',  type: 'coins',    goal: 600,   difficulty: 'Extreme', reward: 5000, gemReward: 10 },
        { id: 'm_dist_500',    text: 'Run 500m',           type: 'distance', goal: 500,   difficulty: 'Easy',    reward: 400,  gemReward: 0 },
        { id: 'm_dist_1000',   text: 'Run 1,000m',         type: 'distance', goal: 1000,  difficulty: 'Easy',    reward: 600,  gemReward: 0 },
        { id: 'm_dist_2000',   text: 'Run 2,000m',         type: 'distance', goal: 2000,  difficulty: 'Medium',  reward: 1000, gemReward: 1 },
        { id: 'm_dist_3000',   text: 'Run 3,000m',         type: 'distance', goal: 3000,  difficulty: 'Medium',  reward: 1200, gemReward: 2 },
        { id: 'm_dist_5000',   text: 'Run 5,000m',         type: 'distance', goal: 5000,  difficulty: 'Hard',    reward: 2500, gemReward: 3 },
        { id: 'm_dist_10000',  text: 'Run 10,000m',        type: 'distance', goal: 10000, difficulty: 'Extreme', reward: 6000, gemReward: 10 },
        { id: 'm_gems_1',      text: 'Collect 1 Gem',      type: 'gems',     goal: 1,     difficulty: 'Easy',    reward: 250,  gemReward: 1 },
        { id: 'm_gems_3',      text: 'Collect 3 Gems',     type: 'gems',     goal: 3,     difficulty: 'Medium',  reward: 600,  gemReward: 2 },
        { id: 'm_gems_8',      text: 'Collect 8 Gems',     type: 'gems',     goal: 8,     difficulty: 'Hard',    reward: 1500, gemReward: 5 },
        { id: 'm_gems_15',     text: 'Collect 15 Gems',    type: 'gems',     goal: 15,    difficulty: 'Extreme', reward: 4000, gemReward: 15 },
        { id: 'm_speed_120',   text: 'Reach 120 KM/H',     type: 'speed',    goal: 120,   difficulty: 'Hard',    reward: 1800, gemReward: 4 },
        { id: 'm_speed_180',   text: 'Reach 180 KM/H',     type: 'speed',    goal: 180,   difficulty: 'Extreme', reward: 5000, gemReward: 12 }
    ]
};
