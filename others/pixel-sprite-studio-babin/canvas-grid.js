/**
 * Canvas Pixel Grid Engine
 * Interactive drawing grid with zoom, symmetry, and history stack.
 * Author: Babin Bid (@Babin123456)
 */

class CanvasGridEngine {
  constructor(canvas, size = 16) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.size = size;
    this.grid = Array(size).fill(null).map(() => Array(size).fill("transparent"));
    this.undoStack = [];
    this.redoStack = [];
    this.isDrawing = false;
    this.tool = "pencil"; // pencil, eraser, fill, eyedropper
    this.symmetryMode = false; // vertical mirror axis
  }

  setSize(newSize) {
    this.saveState();
    this.size = newSize;
    this.grid = Array(newSize).fill(null).map(() => Array(newSize).fill("transparent"));
    this.render();
  }

  saveState() {
    this.undoStack.push(JSON.stringify(this.grid));
    if (this.undoStack.length > 30) this.undoStack.shift();
    this.redoStack = [];
  }

  undo() {
    if (this.undoStack.length === 0) return;
    this.redoStack.push(JSON.stringify(this.grid));
    this.grid = JSON.parse(this.undoStack.pop());
    this.size = this.grid.length;
    this.render();
  }

  redo() {
    if (this.redoStack.length === 0) return;
    this.undoStack.push(JSON.stringify(this.grid));
    this.grid = JSON.parse(this.redoStack.pop());
    this.size = this.grid.length;
    this.render();
  }

  clear() {
    this.saveState();
    this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill("transparent"));
    this.render();
  }

  setCell(x, y, color) {
    if (x < 0 || x >= this.size || y < 0 || y >= this.size) return;
    this.grid[y][x] = color;
    if (this.symmetryMode) {
      const mirrorX = this.size - 1 - x;
      this.grid[y][mirrorX] = color;
    }
  }

  floodFill(startX, startY, targetColor, replacementColor) {
    if (targetColor === replacementColor) return;
    if (this.grid[startY][startX] !== targetColor) return;

    const queue = [[startX, startY]];
    while (queue.length > 0) {
      const [x, y] = queue.pop();
      if (x < 0 || x >= this.size || y < 0 || y >= this.size) continue;
      if (this.grid[y][x] === targetColor) {
        this.grid[y][x] = replacementColor;
        queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
      }
    }
  }

  render() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const cellSize = width / this.size;

    this.ctx.clearRect(0, 0, width, height);

    // Checkerboard for transparency
    const checkSize = cellSize / 2;
    for (let r = 0; r < this.size * 2; r++) {
      for (let c = 0; c < this.size * 2; c++) {
        this.ctx.fillStyle = (r + c) % 2 === 0 ? "#121826" : "#0d131f";
        this.ctx.fillRect(c * checkSize, r * checkSize, checkSize, checkSize);
      }
    }

    // Draw pixels
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const color = this.grid[y][x];
        if (color && color !== "transparent") {
          this.ctx.fillStyle = color;
          this.ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }

    // Grid lines
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    this.ctx.lineWidth = 1;
    for (let i = 0; i <= this.size; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * cellSize, 0);
      this.ctx.lineTo(i * cellSize, height);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(0, i * cellSize);
      this.ctx.lineTo(width, i * cellSize);
      this.ctx.stroke();
    }

    // Symmetry axis line
    if (this.symmetryMode) {
      this.ctx.strokeStyle = "rgba(56, 189, 248, 0.6)";
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([4, 4]);
      this.ctx.beginPath();
      this.ctx.moveTo(width / 2, 0);
      this.ctx.lineTo(width / 2, height);
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }
  }

  getCellFromPointer(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const x = Math.floor(((clientX - rect.left) / rect.width) * this.size);
    const y = Math.floor(((clientY - rect.top) / rect.height) * this.size);
    return { x, y };
  }
}

window.CanvasGridEngine = CanvasGridEngine;
