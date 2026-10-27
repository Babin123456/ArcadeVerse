/**
 * Virtual Keyboard Heatmap Renderer
 * Visual interactive keyboard component showing key states and action mappings.
 * Author: Babin Bid (@Babin123456)
 */

const KEYBOARD_ROWS = [
  ["Escape", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12"],
  ["Backquote", "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0", "Minus", "Equal", "Backspace"],
  ["Tab", "KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP", "BracketLeft", "BracketRight", "Backslash"],
  ["CapsLock", "KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon", "Quote", "Enter"],
  ["ShiftLeft", "KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma", "Period", "Slash", "ShiftRight"],
  ["ControlLeft", "AltLeft", "Space", "AltRight", "ControlRight", "ArrowLeft", "ArrowUp", "ArrowDown", "ArrowRight"]
];

class VirtualKeyboard {
  constructor(containerElement, onKeySelected) {
    this.container = containerElement;
    this.onKeySelected = onKeySelected;
    this.activeBindings = {};
  }

  setBindings(bindings) {
    this.activeBindings = bindings;
    this.render();
  }

  render() {
    this.container.innerHTML = "";
    const kbWrapper = document.createElement("div");
    kbWrapper.className = "keyboard-wrapper";

    // Reverse map: code -> action label
    const reverseMap = {};
    Object.entries(this.activeBindings).forEach(([action, code]) => {
      reverseMap[code] = action;
    });

    KEYBOARD_ROWS.forEach(row => {
      const rowDiv = document.createElement("div");
      rowDiv.className = "kb-row";

      row.forEach(code => {
        const keyDiv = document.createElement("div");
        keyDiv.className = "kb-key";
        keyDiv.id = `key-${code}`;
        keyDiv.dataset.code = code;

        const actionMapped = reverseMap[code];
        if (actionMapped) {
          keyDiv.classList.add("mapped");
        }

        const label = code.replace("Key", "").replace("Digit", "").replace("Arrow", "↑ ");
        keyDiv.innerHTML = `
          <span class="key-label">${label}</span>
          ${actionMapped ? `<span class="action-tag">${actionMapped}</span>` : ""}
        `;

        keyDiv.addEventListener("click", () => {
          if (this.onKeySelected) this.onKeySelected(code);
        });

        rowDiv.appendChild(keyDiv);
      });

      kbWrapper.appendChild(rowDiv);
    });

    this.container.appendChild(kbWrapper);
  }

  highlightKey(code, isPressed) {
    const keyEl = document.getElementById(`key-${code}`);
    if (keyEl) {
      keyEl.classList.toggle("pressed", isPressed);
    }
  }
}

window.VirtualKeyboard = VirtualKeyboard;
