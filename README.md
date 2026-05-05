# Velocity Escape 🚀

[![Vite](https://img.shields.io/badge/Frontend-Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Three.js](https://img.shields.io/badge/Engine-Three.js-black?logo=three.dot.js&logoColor=white)](https://threejs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Capacitor](https://img.shields.io/badge/Mobile-Capacitor-119EFF?logo=capacitor&logoColor=white)](https://capacitorjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Velocity Escape** is a high-octane, visually stunning 3D endless runner set in a neon-drenched cyberpunk future. Built with **Three.js** and optimized for both web and mobile, it combines fast-paced reflexive gameplay with deep customization and global competition.

---

## 🎮 Gameplay Overview

Navigate a hazardous futuristic track where speed is your greatest asset—and your biggest threat.

-   **Dynamic Speed Scaling**: The game progressively accelerates, challenging your reflexes as you survive longer.
-   **Speed Management**: Collect **Green Diamonds** to boost your velocity and avoid **Red Diamonds** that slow you down. 
-   **The "Zero Point" Risk**: If your speed drops to **0 KM/H**, the engines fail and the run ends.
-   **Intelligent Obstacles**: Predictable yet challenging lane-switching mechanics ensure a fair but demanding experience.

---

## ✨ Key Features

### 🛒 Extensive Customization
-   **50+ Unique Collectibles**: Unlock a massive catalog of **25 Avatars** and **25 Skateboards**.
-   **Tiered Progression**: From standard gear to the ultimate "Zero Point" entity, featuring custom auras, capes, and particle effects.
-   **Currency System**: Earn coins during runs to purchase items in the integrated tabbed shop.

### 📱 Cross-Platform Performance
-   **Web & Mobile Ready**: Fully optimized for browsers via **Vite** and packaged for Android using **Capacitor**.
-   **Premium Dark-Mode UI**: A sleek, glassmorphic interface with intuitive sidebar navigation.

### 🏆 Competitive Edge
-   **Global Leaderboards**: A dedicated Node.js backend tracks the highest scores and speeds across the community.
-   **Live HUD**: Real-time tracking of score, speed, and coin collection with clear visual feedback.

---

## 🛠️ Technical Architecture

### Frontend
-   **Engine**: `Three.js` (WebGL) for high-performance 3D rendering.
-   **Build Tool**: `Vite` for lightning-fast development and optimized production bundles.
-   **State Management**: Modular ES6+ Javascript handling game loops, collision detection, and asset loading.

### Backend
-   **Runtime**: `Node.js` with `Express`.
-   **Storage**: Lightweight JSON-based persistence for leaderboard and user data.
-   **Integration**: Seamless API communication within the `StorageManager`.

### Mobile
-   **Framework**: `Capacitor` bridges the web codebase to native Android components, enabling a standalone app experience.

---

## 📁 Project Structure

```bash
Velocity Escape/
├── src/                  # Frontend Source Code
│   ├── Player.js         # Character logic & 3D rendering
│   ├── TrackManager.js   # Procedural world generation
│   ├── UIManager.js      # HUD, Shop, & Menu transitions
│   └── Config.js         # Global constants & item data
├── server/               # Node.js Backend
│   ├── index.js          # API Routes & Middleware
│   └── db.json           # Leaderboard data
├── android/              # Capacitor Android Project
├── public/               # Static assets (3D Models, Textures)
└── vite.config.js        # Build configuration
```

---

## 🚀 Getting Started

### Prerequisites
-   [Node.js](https://nodejs.org/) (v18+)
-   [Android Studio](https://developer.android.com/studio) (for mobile builds)

### Installation
1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/velocity-escape.git
    cd velocity-escape
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    cd server && npm install && cd ..
    ```

### Development
To run both the frontend and backend simultaneously:
```bash
npm run dev-all
```

### Mobile Build
To sync and run on an Android device:
```bash
npm run mobile:build
npm run mobile:run
```

---

## 🗺️ Roadmap
- [ ] **Multiplayer Ghost Mode**: Race against your previous best runs.
- [ ] **Power-up System**: Magnets, Shields, and Multipliers.
- [ ] **Dynamic Environments**: Procedural shifts from neon cities to orbital stations.
- [ ] **Advanced Sound Engine**: Procedural synth-wave music that reacts to game speed.

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Developed with ❤️ for the Neon Future.
</p>
