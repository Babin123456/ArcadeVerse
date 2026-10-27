/**
 * Retro SFX Preset Bank
 * Curated 8-bit sound presets and randomizers.
 * Author: Babin Bid (@Babin123456)
 */

const SFX_PRESETS = {
  laser: {
    name: "Plasma Laser",
    waveform: "sawtooth",
    startFreq: 880,
    endFreq: 110,
    slideType: "exponential",
    attack: 0.005,
    hold: 0.02,
    decay: 0.15,
    volume: 0.35,
    filterType: "lowpass",
    filterCutoff: 5000,
    filterResonance: 3.0,
    vibratoDepth: 0,
    vibratoSpeed: 10
  },
  jump: {
    name: "8-Bit Jump",
    waveform: "square",
    startFreq: 150,
    endFreq: 600,
    slideType: "exponential",
    attack: 0.01,
    hold: 0.04,
    decay: 0.18,
    volume: 0.3,
    filterType: "lowpass",
    filterCutoff: 6000,
    filterResonance: 1.0,
    vibratoDepth: 0,
    vibratoSpeed: 0
  },
  explosion: {
    name: "Retro Explosion",
    waveform: "noise",
    startFreq: 220,
    endFreq: 40,
    slideType: "linear",
    attack: 0.005,
    hold: 0.08,
    decay: 0.45,
    volume: 0.45,
    filterType: "lowpass",
    filterCutoff: 1800,
    filterResonance: 4.5,
    vibratoDepth: 0,
    vibratoSpeed: 0
  },
  coin: {
    name: "Golden Coin",
    waveform: "sine",
    startFreq: 987.77, // B5
    endFreq: 1318.51,  // E6
    slideType: "exponential",
    attack: 0.01,
    hold: 0.06,
    decay: 0.35,
    volume: 0.3,
    filterType: "highpass",
    filterCutoff: 400,
    filterResonance: 1.0,
    vibratoDepth: 0.15,
    vibratoSpeed: 12
  },
  powerup: {
    name: "Hyper Powerup",
    waveform: "triangle",
    startFreq: 261.63, // C4
    endFreq: 1046.50, // C6
    slideType: "exponential",
    attack: 0.02,
    hold: 0.15,
    decay: 0.35,
    volume: 0.35,
    filterType: "lowpass",
    filterCutoff: 7000,
    filterResonance: 2.0,
    vibratoDepth: 0.3,
    vibratoSpeed: 18
  },
  hurt: {
    name: "Player Damage",
    waveform: "square",
    startFreq: 320,
    endFreq: 65,
    slideType: "exponential",
    attack: 0.002,
    hold: 0.03,
    decay: 0.22,
    volume: 0.4,
    filterType: "bandpass",
    filterCutoff: 1200,
    filterResonance: 5.0,
    vibratoDepth: 0,
    vibratoSpeed: 0
  },
  click: {
    name: "UI Blip",
    waveform: "sine",
    startFreq: 1200,
    endFreq: 800,
    slideType: "exponential",
    attack: 0.002,
    hold: 0.01,
    decay: 0.05,
    volume: 0.2,
    filterType: "lowpass",
    filterCutoff: 8000,
    filterResonance: 1.0,
    vibratoDepth: 0,
    vibratoSpeed: 0
  }
};

class PresetManager {
  static getPreset(key) {
    if (SFX_PRESETS[key]) {
      return JSON.parse(JSON.stringify(SFX_PRESETS[key]));
    }
    return JSON.parse(JSON.stringify(SFX_PRESETS.laser));
  }

  static mutate(params, amount = 0.2) {
    const copy = JSON.parse(JSON.stringify(params));
    const delta = (val) => val * (1 + (Math.random() * 2 - 1) * amount);

    copy.startFreq = Math.round(Math.max(40, Math.min(2000, delta(copy.startFreq))));
    copy.endFreq = Math.round(Math.max(20, Math.min(2000, delta(copy.endFreq))));
    copy.decay = Number(Math.max(0.05, Math.min(1.0, delta(copy.decay))).toFixed(3));
    copy.filterCutoff = Math.round(Math.max(200, Math.min(8000, delta(copy.filterCutoff))));
    return copy;
  }

  static generateRandom() {
    const waveforms = ["square", "sawtooth", "triangle", "sine", "noise"];
    const wave = waveforms[Math.floor(Math.random() * waveforms.length)];
    const startFreq = Math.round(80 + Math.random() * 1200);
    const endFreq = Math.round(40 + Math.random() * 1200);
    const attack = Number((0.002 + Math.random() * 0.04).toFixed(3));
    const hold = Number((0.01 + Math.random() * 0.1).toFixed(3));
    const decay = Number((0.05 + Math.random() * 0.4).toFixed(3));

    return {
      name: "Random Arcade FX",
      waveform: wave,
      startFreq,
      endFreq,
      slideType: Math.random() > 0.5 ? "exponential" : "linear",
      attack,
      hold,
      decay,
      volume: 0.35,
      filterType: "lowpass",
      filterCutoff: Math.round(800 + Math.random() * 5000),
      filterResonance: Number((1 + Math.random() * 4).toFixed(1)),
      vibratoDepth: Math.random() > 0.7 ? Number((Math.random() * 0.4).toFixed(2)) : 0,
      vibratoSpeed: Math.round(5 + Math.random() * 20)
    };
  }
}

window.SFX_PRESETS = SFX_PRESETS;
window.PresetManager = PresetManager;
