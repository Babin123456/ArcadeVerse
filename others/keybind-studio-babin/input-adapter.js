/**
 * Arcade Input Adapter Code Generator
 * Generates drop-in Vanilla JS input translation adapters for arcade games.
 * Author: Babin Bid (@Babin123456)
 */

class ArcadeInputAdapterGenerator {
  static generateAdapterCode(profile) {
    return `/**
 * Universal ArcadeVerse Input Adapter
 * Automatically maps player-configured keybinds into unified action triggers.
 * Safe for zero-asset ArcadeVerse games!
 */
class ArcadeInputAdapter {
  constructor(customBindings = null) {
    this.bindings = customBindings || ${JSON.stringify(profile.bindings, null, 2)};
    this.keyStates = {};
    this.actionListeners = {};

    window.addEventListener("keydown", (e) => {
      this.keyStates[e.code] = true;
      const action = this.getActionForCode(e.code);
      if (action && this.actionListeners[action]) {
        this.actionListeners[action].forEach(cb => cb(e));
      }
    });

    window.addEventListener("keyup", (e) => {
      this.keyStates[e.code] = false;
    });
  }

  getActionForCode(code) {
    for (const [action, boundCode] of Object.entries(this.bindings)) {
      if (boundCode === code) return action;
    }
    return null;
  }

  isActionActive(action) {
    const code = this.bindings[action];
    return Boolean(this.keyStates[code]);
  }

  onAction(action, callback) {
    if (!this.actionListeners[action]) this.actionListeners[action] = [];
    this.actionListeners[action].push(callback);
  }
}

// Example Usage in game loop:
// const input = new ArcadeInputAdapter();
// if (input.isActionActive("UP")) player.moveUp();
// if (input.isActionActive("PRIMARY")) player.fireLaser();
`;
  }
}

window.ArcadeInputAdapterGenerator = ArcadeInputAdapterGenerator;
