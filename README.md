# 🛺 CNG Rush - The Ultimate Dhaka Traffic Challenge

[![HTML5 Canvas](https://img.shields.io/badge/HTML5-Canvas-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
[![Vanilla JavaScript](https://img.shields.io/badge/Vanilla-JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Web Audio API](https://img.shields.io/badge/Web%20Audio-API-00B4D8)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**CNG Rush** is a high-octane 2D Canvas driving simulator that drops you directly into the driver's seat of an iconic green three-wheeled CNG auto-rickshaw navigating the bustling, vibrant streets of Dhaka, Bangladesh.

Built entirely with **Vanilla JavaScript, HTML5 Canvas, and CSS3**—zero external game engines, zero npm build steps, and zero asset download dependencies!

---

## 🎮 Gameplay & Highlights

### 🛺 Authentic Dhaka Driver Perspective
- **Cockpit View**: Dynamic steering tilt and roll, animated windshield wipers, rearview mirror reflecting your passenger, and low front cowling ensuring a clear view of the road ahead.
- **Chase View Option**: Press `C` to switch anytime to an exterior 3rd-person view of your green CNG.
- **Dhaka Soundscapes**: Procedural sound synthesizer using the Web Audio API—recreating 2-stroke engine revs, air horns, crash impacts, passenger reactions, and monsoon rain without audio files.

### 🚕 Vibrant Dhaka Traffic AI
- **Dhaka City Buses**: Multi-lane buses with authentic Dhaka transport slogans (*"আল্লাহ ভরসা"*, *"ঢাকা এক্সপ্রেস"*, *"মায়ের দোয়া"*).
- **Cycle Rickshaws**: Traditional pedicabs adorned with classic colorful artwork and reflective tin plates.
- **Rival AI CNGs**: Fast three-wheelers cutting through lanes.
- **Street Hazards & Events**: Potholes, water puddles with splash physics, jaywalking pedestrians, and political/cultural street rallies (*মিছিল*).

### 👥 Passengers & Fare System
- **Roadside Pickups**: Slow down near waiting passengers with pulsating beacon markers.
- **Passenger Archetypes**: Office workers, students, elderly folks, and families.
- **Dhaka Dialogues**: Authentic Bengali street dialogues reflecting passenger mood and patience.
- **Fare Meter**: Real-time Taka (৳) meter calculation with bonuses for prompt delivery and deductions for rough driving.

### 💔 Responsive Health & Accident Meter
- **Condition System**: 3-heart indicator that directly responds to collisions.
  - Full (`❤️ ❤️ ❤️`): Pristine CNG condition.
  - Cracked (`❤️ ❤️ 💔`): Immediate visual feedback upon minor collisions or rough pothole bumps.
  - Lost (`❤️ 💔 🖤` ➔ `🖤 🖤 🖤`): Severe damage leading to a totaled vehicle if not driven carefully.

---

## 🕹️ Controls

| Key | Action |
| --- | --- |
| <kbd>W</kbd> or <kbd>↑</kbd> | Accelerate / Drive Forward |
| <kbd>S</kbd> or <kbd>↓</kbd> | Brake / Reverse |
| <kbd>A</kbd> or <kbd>←</kbd> | Steer Left |
| <kbd>D</kbd> or <kbd>→</kbd> | Steer Right |
| <kbd>Space</kbd> | Blast Horn (alerts pedestrians and traffic) |
| <kbd>C</kbd> | Toggle Camera View (Driver Cockpit ↔ Chase View) |
| <kbd>P</kbd> | Pause / Resume Shift |
| **Exit Button** | Safely end shift and bank your earnings |

---

## 🚀 Getting Started

No installations or bundlers are required!

### Option 1: Direct in Browser
Simply double-click or open `index.html` in Google Chrome, Microsoft Edge, Firefox, or any modern web browser.

### Option 2: Local HTTP Server
If you prefer running via a local server:
```bash
# Start the built-in Node server
node server.js
```
Then navigate to `http://localhost:3000` in your web browser.

---

## 📁 Project Structure

```text
CNG rush/
├── index.html         # Main game canvas, left-panel HUD, and modal dialogs
├── style.css          # Retro Dhaka arcade aesthetic, HUD cards, and animations
├── server.js          # Lightweight Node.js static HTTP development server
├── README.md          # Project documentation
└── js/
    ├── audio.js       # Zero-dependency Web Audio API procedural sound engine
    ├── game.js        # Core game loop, collision detection, and physics engine
    ├── particles.js   # Exhaust smoke, sparks, water splashes, and floating text
    ├── passengers.js  # Passenger archetypes, dialogues, patience, and drop zones
    ├── road.js        # Perspective road scaling, lane dividers, and environment
    ├── sprites.js     # Procedural HTML5 Canvas rendering for vehicles and scenery
    └── traffic.js     # Dhaka traffic AI spawning, lane logic, and reactions
```

---

## 🛠️ Technology Stack
- **HTML5 Canvas API**: High-performance procedural 2D rendering at 60 FPS.
- **Vanilla JavaScript (ES6+)**: Modular object-oriented architecture without frameworks.
- **Web Audio API**: Real-time sound synthesis for engine frequencies, horns, and ambient effects.
- **CSS3 Grid & Flexbox**: Modern dark-mode HUD overlay positioned cleanly without obstructing road view.

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
