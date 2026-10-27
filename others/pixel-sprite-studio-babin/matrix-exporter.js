/**
 * Sprite Matrix Code Exporter
 * Converts 2D pixel grid into Vanilla JS Canvas drawing functions and 2D matrices.
 * Author: Babin Bid (@Babin123456)
 */

class SpriteMatrixExporter {
  static to2DArray(grid) {
    return JSON.stringify(grid, null, 2);
  }

  static toCanvasFunction(grid, spriteName = "drawCustomSprite") {
    const size = grid.length;
    const pixels = [];

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const color = grid[y][x];
        if (color && color !== "transparent") {
          pixels.push({ x, y, color });
        }
      }
    }

    // Group adjacent pixels or group by color to optimize fillRect calls
    const colorGroups = {};
    pixels.forEach(p => {
      if (!colorGroups[p.color]) colorGroups[p.color] = [];
      colorGroups[p.color].push([p.x, p.y]);
    });

    let code = `/**
 * Procedural Zero-Asset Sprite: ${spriteName} (${size}x${size})
 * Pure Vanilla Canvas 2D render loop. Safe for ArcadeVerse games!
 */
function ${spriteName}(ctx, targetX, targetY, scale = 2) {
`;

    Object.entries(colorGroups).forEach(([color, points]) => {
      code += `  ctx.fillStyle = "${color}";\n`;
      points.forEach(([px, py]) => {
        code += `  ctx.fillRect(targetX + (${px} * scale), targetY + (${py} * scale), scale, scale);\n`;
      });
    });

    code += `}\n`;
    return code;
  }

  static toDataURL(grid) {
    const size = grid.length;
    const offCanvas = document.createElement("canvas");
    offCanvas.width = size;
    offCanvas.height = size;
    const ctx = offCanvas.getContext("2d");

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const color = grid[y][x];
        if (color && color !== "transparent") {
          ctx.fillStyle = color;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
    return offCanvas.toDataURL("image/png");
  }
}

window.SpriteMatrixExporter = SpriteMatrixExporter;
