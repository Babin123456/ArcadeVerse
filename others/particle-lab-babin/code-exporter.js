/**
 * Particle Code Exporter
 * Generates lightweight, zero-dependency Vanilla JS Canvas particle loops.
 * Author: Babin Bid (@Babin123456)
 */

class ParticleCodeExporter {
  static toVanillaSnippet(params, functionName = "triggerParticleFX") {
    return `/**
 * Procedural Canvas 2D Particle FX: ${functionName}
 * Lightweight, zero external dependencies. Safe for ArcadeVerse games!
 */
const activeParticles = [];

function ${functionName}(originX, originY) {
  const count = ${params.count};
  const colors = ${JSON.stringify(params.colors)};
  const spreadRad = (${params.spread} * Math.PI) / 180;
  const baseRad = (${params.angle} * Math.PI) / 180;

  for (let i = 0; i < count; i++) {
    const angle = baseRad + (Math.random() - 0.5) * spreadRad;
    const speed = ${params.speedMin} + Math.random() * ${params.speedMax - params.speedMin};
    activeParticles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: ${params.lifeMin} + Math.random() * ${params.lifeMax - params.lifeMin},
      maxLife: ${params.lifeMax},
      size: ${params.sizeMin} + Math.random() * ${params.sizeMax - params.sizeMin},
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }
}

// Call inside your game's requestAnimationFrame render loop:
function renderParticles(ctx) {
  ctx.save();
  ctx.globalCompositeOperation = "${params.blendMode || "lighter"}";

  for (let i = activeParticles.length - 1; i >= 0; i--) {
    const p = activeParticles[i];
    p.vx *= ${params.friction};
    p.vy *= ${params.friction};
    p.vy += ${params.gravity};
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 1;

    if (p.life <= 0) {
      activeParticles.splice(i, 1);
      continue;
    }

    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(0.5, p.size * alpha), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}`;
  }
}

window.ParticleCodeExporter = ParticleCodeExporter;
