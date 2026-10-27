/**
 * Retro Palette Manager
 * Curated color palettes for pixel sprite art.
 * Author: Babin Bid (@Babin123456)
 */

const RETRO_PALETTES = {
  cyberpunk: {
    name: "Cyberpunk Neon",
    colors: [
      "transparent", "#0b0f19", "#38bdf8", "#0284c7", "#f43f5e",
      "#ec4899", "#a855f7", "#10b981", "#fbbf24", "#ffffff"
    ]
  },
  pico8: {
    name: "PICO-8 Classic",
    colors: [
      "transparent", "#000000", "#1D2B53", "#7E2553", "#008751",
      "#AB5236", "#5F574F", "#C2C3C7", "#FFF1E8", "#FF004D",
      "#FFA300", "#FFEC27", "#00E436", "#29ADFF", "#83769C", "#FF77A8"
    ]
  },
  gameboy: {
    name: "GameBoy DMG",
    colors: [
      "transparent", "#0f380f", "#306230", "#8bac0f", "#9bbc0f"
    ]
  },
  nes: {
    name: "NES 8-Bit",
    colors: [
      "transparent", "#000000", "#fc0000", "#bcbcbc", "#004058",
      "#0058f8", "#3cbcfc", "#00a800", "#58d854", "#e45c10", "#f8b800"
    ]
  }
};

class PaletteManager {
  constructor(paletteKey = "cyberpunk") {
    this.currentKey = paletteKey;
    this.currentColor = RETRO_PALETTES[paletteKey].colors[2] || "#38bdf8";
  }

  getColors() {
    return RETRO_PALETTES[this.currentKey].colors;
  }

  setPalette(key) {
    if (RETRO_PALETTES[key]) {
      this.currentKey = key;
      this.currentColor = RETRO_PALETTES[key].colors[1] || "#38bdf8";
    }
  }

  setColor(color) {
    this.currentColor = color;
  }

  getColor() {
    return this.currentColor;
  }
}

window.RETRO_PALETTES = RETRO_PALETTES;
window.PaletteManager = PaletteManager;
