# Neon Gravity Rush

An intense 60 FPS sub-orbital vector runner featuring real-time gravity inversion, Web Audio API chiptune synthesis, and infinite procedural sector scaling.

---

## Game Overview

Piloting an advanced vector-craft along high-velocity orbital transit corridors, your objective is to invert gravitational orientation between floor and ceiling rails to dodge laser spikes, survive plasma barriers, and collect quantum energy cores.

---

## Architectural Specification

- **Category:** Action / Arcade
- **Runtime Model:** 60 FPS HTML5 Canvas loop
- **Audio Engine:** Pure client-side Web Audio API oscillator synthesis
- **File Structure:** 4-file isolated sandboxed architecture (`index.html`, `style.css`, `game.js`, `game.json`)
- **Accessibility:** Full keyboard controls (`Space`, `W`, `ArrowUp`, `Enter`, `Escape`, `M`) and responsive mobile touch triggers

---

## Flight Controls

| Action | Primary Key | Secondary Key | Touch / Mouse |
|---|---|---|---|
| Invert Gravity | `SPACE` | `W` / `UP ARROW` | Tap Screen / Click Canvas |
| Launch / Reboot | `ENTER` | `SPACE` | Click "Initialize Warp Engine" |
| Toggle Audio FX | `M` | - | Click Speaker Icon |
| Rules & Intel | `ESCAPE` | - | Click "How to Play" |

---

## Scoring & Infinite Progression

- **Traverse Distance:** Earn continuous points proportional to corridor velocity.
- **Quantum Energy Cores:** Collect floating golden nodes for +50 bonus points.
- **Sector Warp:** Every 300 meters traversed triggers a hyper-warp into the next Sector. Corridor velocity scales upward and score multipliers increase progressively (`1.0x`, `1.5x`, `2.0x`, etc.).
- **High Scores:** Local best records persist across sessions via client storage.
