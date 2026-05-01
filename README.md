# Velocity Escape (Neon Runner)

Velocity Escape is a fast-paced, high-octane 3D endless runner built with **Three.js**. Navigate a neon-drenched futuristic track, collect coins, manage your speed with diamonds, and unlock a massive collection of avatars and skateboards.

## 🚀 Features

### 🏁 Core Gameplay
- **High-Speed Action**: Dynamic speed scaling that increases as you progress.
*   **Speed Management**: Collect Green diamonds to boost speed (+1 to +8 km/h) and avoid Red diamonds that slow you down.
*   **Game Over Condition**: If your speed drops to **0 km/h**, it's game over!
*   **Balanced Obstacles**: A fair spawning system that ensures at least one lane is always passable, even at high densities.
*   **Uni-directional Obstacles**: Big moving obstacles cycle predictably between lanes (Left → Middle → Right → Left) using instant teleportation for fair play.

### 🛒 Customization & Shop
*   **50 Unique Collectibles**:
    *   **25 Avatars**: From the Noble Knight to the Ultimate "Zero Point" entity. Higher tiers feature capes, crowns, and auras.
    *   **25 Skateboards**: Unique boards like the Solar Flare and Omega Board with visual thrusters, energy rings, and specialized glow effects.
*   **Dynamic Shop**: A tabbed shop interface accessible from the sidebar.
*   **Currency System**: Collect coins on the track to purchase new items.

### 📱 User Interface
*   **Sidebar Navigation**: A "Three-Dots" (⋮) menu on the home page for quick access to Avatar and Skateboard categories.
*   **Visual HUD**: Clear indicators for Speed, Score, and Coins.
*   **Speed Feedback**: Diamonds display their exact speed impact (+5 KM/H, etc.) with clear, outlined text.

## 🛠️ Tech Stack
- **Engine**: Three.js (WebGL)
- **Bundler**: Vite
- **Styling**: Vanilla CSS with a premium dark-mode aesthetic.
- **Logic**: Modular Javascript (ES6+).

## 🏃 How to Run

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Start Development Server**:
    ```bash
    npm run dev
    ```
3.  **Build for Production**:
    ```bash
    npm run build
    ```

## 🎮 Controls
- **Left/Right Arrows or A/D**: Switch lanes.
- **Up Arrow, W, or Space**: Jump.
- **P or Esc**: Pause/Resume.

## 📁 Project Structure
- `/src/Config.js`: Global game constants, item prices, and rarities.
- `/src/Player.js`: Character logic and 3D model rendering.
- `/src/TrackManager.js`: Procedural track generation and obstacle spawning.
- `/src/UIManager.js`: Menu transitions, shop logic, and HUD updates.
- `/src/StorageManager.js`: Local storage for unlocked items and high scores.
