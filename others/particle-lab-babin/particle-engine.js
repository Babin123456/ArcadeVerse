/**
 * 2D Canvas Particle Engine
 * High-performance 60fps particle physics simulation.
 * Author: Babin Bid (@Babin123456)
 */

class Particle {
  constructor(x, y, vx, vy, life, size, color, decay) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.initialLife = life;
    this.life = life;
    this.size = size;
    this.color = color;
    this.decay = decay;
  }

  update(gravity, friction) {
    this.vx *= friction;
    this.vy *= friction;
    this.vy += gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.life -= this.decay;
  }

  isDead() {
    return this.life <= 0;
  }
}

class ParticleEmitter {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.particles = [];
    this.originX = canvas.width / 2;
    this.originY = canvas.height / 2;
    this.isRunning = true;
    this.params = {
      count: 60,
      speedMin: 2,
      speedMax: 8,
      angle: 0,
      spread: 360,
      gravity: 0.15,
      friction: 0.98,
      lifeMin: 30,
      lifeMax: 70,
      sizeMin: 2,
      sizeMax: 6,
      colors: ["#38bdf8", "#0284c7", "#f43f5e", "#fbbf24"],
      blendMode: "lighter",
      continuous: false
    };

    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  burst(x = this.originX, y = this.originY) {
    const p = this.params;
    for (let i = 0; i < p.count; i++) {
      const spreadRad = (p.spread * Math.PI) / 180;
      const baseRad = (p.angle * Math.PI) / 180;
      const angle = baseRad + (Math.random() - 0.5) * spreadRad;
      const speed = p.speedMin + Math.random() * (p.speedMax - p.speedMin);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const life = p.lifeMin + Math.random() * (p.lifeMax - p.lifeMin);
      const size = p.sizeMin + Math.random() * (p.sizeMax - p.sizeMin);
      const color = p.colors[Math.floor(Math.random() * p.colors.length)];
      const decay = 1;

      this.particles.push(new Particle(x, y, vx, vy, life, size, color, decay));
    }
  }

  update() {
    if (this.params.continuous && Math.random() > 0.4) {
      this.burst(this.originX, this.originY);
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const part = this.particles[i];
      part.update(this.params.gravity, this.params.friction);
      if (part.isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.fillStyle = "rgba(11, 15, 25, 0.25)";
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.globalCompositeOperation = this.params.blendMode || "lighter";

    for (const part of this.particles) {
      const alpha = Math.max(0, part.life / part.initialLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = part.color;

      ctx.beginPath();
      ctx.arc(part.x, part.y, Math.max(0.5, part.size * alpha), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  loop() {
    if (this.isRunning) {
      this.update();
      this.render();
    }
    requestAnimationFrame(this.loop);
  }
}

window.ParticleEmitter = ParticleEmitter;
