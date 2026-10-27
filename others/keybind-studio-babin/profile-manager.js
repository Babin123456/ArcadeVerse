/**
 * Keybind Profile Manager
 * Manages custom arcade input configurations and conflict resolution.
 * Author: Babin Bid (@Babin123456)
 */

const KEYBIND_STORAGE_KEY = "arcadeverse_keybind_profile";

const KEYBIND_PRESETS = {
  wasd: {
    name: "WASD Modern",
    bindings: {
      UP: "KeyW",
      DOWN: "KeyS",
      LEFT: "KeyA",
      RIGHT: "KeyD",
      PRIMARY: "Space",
      SECONDARY: "KeyE",
      PAUSE: "Escape"
    }
  },
  arrows: {
    name: "Classic Arcade Arrows",
    bindings: {
      UP: "ArrowUp",
      DOWN: "ArrowDown",
      LEFT: "ArrowLeft",
      RIGHT: "ArrowRight",
      PRIMARY: "KeyZ",
      SECONDARY: "KeyX",
      PAUSE: "KeyP"
    }
  },
  numpad: {
    name: "Retro Numpad",
    bindings: {
      UP: "Numpad8",
      DOWN: "Numpad2",
      LEFT: "Numpad4",
      RIGHT: "Numpad6",
      PRIMARY: "Numpad0",
      SECONDARY: "NumpadEnter",
      PAUSE: "NumpadDecimal"
    }
  }
};

class KeybindProfileManager {
  static getActiveProfile() {
    try {
      const raw = localStorage.getItem(KEYBIND_STORAGE_KEY);
      if (!raw) {
        return JSON.parse(JSON.stringify(KEYBIND_PRESETS.wasd));
      }
      return JSON.parse(raw);
    } catch (err) {
      return JSON.parse(JSON.stringify(KEYBIND_PRESETS.wasd));
    }
  }

  static saveProfile(profile) {
    localStorage.setItem(KEYBIND_STORAGE_KEY, JSON.stringify(profile));
  }

  static detectConflicts(bindings) {
    const keyMap = {};
    const conflicts = [];

    Object.entries(bindings).forEach(([action, code]) => {
      if (keyMap[code]) {
        conflicts.push(`Both [${keyMap[code]}] and [${action}] share key "${code}"`);
      } else {
        keyMap[code] = action;
      }
    });

    return conflicts;
  }
}

window.KEYBIND_PRESETS = KEYBIND_PRESETS;
window.KeybindProfileManager = KeybindProfileManager;
