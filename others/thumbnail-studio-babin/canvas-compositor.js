/**
 * Canvas Thumbnail Compositor
 * Layers game screenshots, aspect ratio frames, badges, and watermark stamps.
 * Author: Babin Bid (@Babin123456)
 */

class CanvasCompositor {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.baseImage = null;
    this.aspectRatio = "16:9"; // "16:9", "1:1", "4:3"
    this.options = {
      title: "Neon Cyber Runner",
      author: "@Babin123456",
      category: "Arcade",
      showScanlines: true,
      showVignette: true,
      showChromatic: true,
      showNsocBadge: true,
      showWatermark: true,
      stars: 5
    };
  }

  setImage(img) {
    this.baseImage = img;
    this.render();
  }

  setAspectRatio(ratio) {
    this.aspectRatio = ratio;
    if (ratio === "16:9") {
      this.canvas.width = 1280;
      this.canvas.height = 720;
    } else if (ratio === "1:1") {
      this.canvas.width = 800;
      this.canvas.height = 800;
    } else if (ratio === "4:3") {
      this.canvas.width = 960;
      this.canvas.height = 720;
    }
    this.render();
  }

  render() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, w, h);

    // 1. Draw base image or fallback gradient
    if (this.baseImage) {
      // Aspect fill crop
      const imgRatio = this.baseImage.width / this.baseImage.height;
      const targetRatio = w / h;
      let sw, sh, sx, sy;

      if (imgRatio > targetRatio) {
        sh = this.baseImage.height;
        sw = sh * targetRatio;
        sx = (this.baseImage.width - sw) / 2;
        sy = 0;
      } else {
        sw = this.baseImage.width;
        sh = sw / targetRatio;
        sx = 0;
        sy = (this.baseImage.height - sh) / 2;
      }
      ctx.drawImage(this.baseImage, sx, sy, sw, sh, 0, 0, w, h);
    } else {
      // Default arcade space gradient
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "#080c16");
      grad.addColorStop(0.5, "#0f172a");
      grad.addColorStop(1, "#030712");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Grid decoration
      ctx.strokeStyle = "rgba(56, 189, 248, 0.08)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    }

    // 2. Post-processing shaders
    if (this.options.showChromatic) {
      ShaderFiltersEngine.applyChromaticAberration(ctx, w, h, 2);
    }
    if (this.options.showVignette) {
      ShaderFiltersEngine.applyVignette(ctx, w, h, 0.6);
    }
    if (this.options.showScanlines) {
      ShaderFiltersEngine.applyScanlines(ctx, w, h, 4, 0.2);
    }

    // 3. Bottom HUD banner overlay
    ctx.save();
    const bannerHeight = h * 0.28;
    const bannerGrad = ctx.createLinearGradient(0, h - bannerHeight - 40, 0, h);
    bannerGrad.addColorStop(0, "rgba(11, 15, 25, 0)");
    bannerGrad.addColorStop(0.3, "rgba(11, 15, 25, 0.85)");
    bannerGrad.addColorStop(1, "rgba(11, 15, 25, 0.98)");
    ctx.fillStyle = bannerGrad;
    ctx.fillRect(0, h - bannerHeight - 40, w, bannerHeight + 40);

    // Neon accent bar
    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(40, h - bannerHeight - 10, w - 80, 2);

    // Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 36px 'Space Grotesk', sans-serif";
    ctx.fillText(this.options.title || "Arcade Game Title", 50, h - bannerHeight + 40);

    // Metadata details
    ctx.fillStyle = "#94a3b8";
    ctx.font = "600 18px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(`By ${this.options.author} • Category: ${this.options.category}`, 50, h - bannerHeight + 72);

    // Star rating
    ctx.fillStyle = "#f59e0b";
    let starsStr = "★".repeat(Math.max(1, Math.min(5, this.options.stars)));
    ctx.fillText(starsStr, 50, h - bannerHeight + 102);

    // 4. Badges (Top Right)
    if (this.options.showNsocBadge) {
      ctx.fillStyle = "rgba(14, 165, 233, 0.2)";
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 1.5;
      const badgeW = 200;
      const badgeH = 36;
      const bx = w - badgeW - 40;
      const by = 40;
      ctx.beginPath();
      ctx.roundRect(bx, by, badgeW, badgeH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 13px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("NSOC '26 WINTER EDITION", bx + (badgeW / 2), by + 23);
      ctx.textAlign = "left";
    }

    // 5. Watermark stamp (Top Left)
    if (this.options.showWatermark) {
      ctx.fillStyle = "#ffffff";
      ctx.font = "800 20px 'Space Grotesk', sans-serif";
      ctx.fillText("ARCADE", 40, 60);
      ctx.fillStyle = "#38bdf8";
      ctx.fillText("VERSE", 130, 60);
    }

    ctx.restore();
  }
}

window.CanvasCompositor = CanvasCompositor;
