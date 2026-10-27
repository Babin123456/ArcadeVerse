/**
 * Particle Emitter Presets
 * Curated arcade particle configurations.
 * Author: Babin Bid (@Babin123456)
 */

const PARTICLE_PRESETS = {
  explosion: {
    name: "Supernova Explosion",
    count: 75,
    speedMin: 3,
    speedMax: 9,
    angle: 0,
    spread: 360,
    gravity: 0.12,
    friction: 0.96,
    lifeMin: 35,
    lifeMax: 65,
    sizeMin: 2,
    sizeMax: 6,
    colors: ["#fbbf24", "#f97316", "#ef4444", "#ffffff"],
    blendMode: "lighter",
    continuous: false
  },
  laserSpark: {
    name: "Laser Impact Sparks",
    count: 35,
    speedMin: 4,
    speedMax: 11,
    angle: 180,
    spread: 80,
    gravity: 0.2,
    friction: 0.94,
    lifeMin: 15,
    lifeMax: 35,
    sizeMin: 1.5,
    sizeMax: 4,
    colors: ["#38bdf8", "#0284c7", "#ffffff"],
    blendMode: "lighter",
    continuous: false
  },
  thruster: {
    name: "Rocket Jet Thruster",
    count: 12,
    speedMin: 4,
    speedMax: 8,
    angle: 90,
    spread: 25,
    gravity: -0.02,
    friction: 0.98,
    lifeMin: 20,
    lifeMax: 45,
    sizeMin: 2,
    sizeMax: 5,
    colors: ["#38bdf8", "#ec4899", "#a855f7", "#ffffff"],
    blendMode: "lighter",
    continuous: true
  },
  coinSparkle: {
    name: "Golden Coin Shimmer",
    count: 25,
    speedMin: 1,
    speedMax: 4,
    angle: 270,
    spread: 120,
    gravity: -0.05,
    friction: 0.97,
    lifeMin: 30,
    lifeMax: 60,
    sizeMin: 1.5,
    sizeMax: 4,
    colors: ["#fde047", "#eab308", "#ca8a04", "#ffffff"],
    blendMode: "lighter",
    continuous: false
  }
};

class ParticlePresetManager {
  static getPreset(key) {
    if (PARTICLE_PRESETS[key]) {
      return JSON.parse(JSON.stringify(PARTICLE_PRESETS[key]));
    }
    return JSON.parse(JSON.stringify(PARTICLE_PRESETS.explosion));
  }
}

window.PARTICLE_PRESETS = PARTICLE_PRESETS;
window.ParticlePresetManager = ParticlePresetManager;
