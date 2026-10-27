/**
 * Shader Filters Engine
 * Canvas 2D image post-processing for retro arcade aesthetic.
 * Author: Babin Bid (@Babin123456)
 */

class ShaderFiltersEngine {
  static applyScanlines(ctx, width, height, density = 4, opacity = 0.25) {
    ctx.save();
    ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
    for (let y = 0; y < height; y += density) {
      ctx.fillRect(0, y, width, 1.5);
    }
    ctx.restore();
  }

  static applyVignette(ctx, width, height, strength = 0.5) {
    ctx.save();
    const radius = Math.max(width, height) * 0.7;
    const gradient = ctx.createRadialGradient(
      width / 2, height / 2, radius * 0.4,
      width / 2, height / 2, radius
    );
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, `rgba(0,0,0,${strength})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  static applyChromaticAberration(ctx, width, height, offset = 3) {
    if (offset <= 0) return;
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    const copy = new Uint8ClampedArray(data);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const redX = Math.min(width - 1, x + offset);
        const redIdx = (y * width + redX) * 4;
        const blueX = Math.max(0, x - offset);
        const blueIdx = (y * width + blueX) * 4;

        data[idx] = copy[redIdx];         // Red channel offset
        data[idx + 2] = copy[blueIdx + 2]; // Blue channel offset
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  static applyPixelate(ctx, width, height, pixelSize = 4) {
    if (pixelSize <= 1) return;
    const offCanvas = document.createElement("canvas");
    offCanvas.width = Math.ceil(width / pixelSize);
    offCanvas.height = Math.ceil(height / pixelSize);
    const offCtx = offCanvas.getContext("2d");

    offCtx.imageSmoothingEnabled = false;
    offCtx.drawImage(ctx.canvas, 0, 0, offCanvas.width, offCanvas.height);

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(offCanvas, 0, 0, offCanvas.width, offCanvas.height, 0, 0, width, height);
    ctx.imageSmoothingEnabled = true;
  }
}

window.ShaderFiltersEngine = ShaderFiltersEngine;
