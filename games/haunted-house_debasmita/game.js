/**
 * Haunted House: Phantom Manor - Core Game Engine
 * HTML5 Canvas 60fps Loop, Dynamic Shadow Lighting, Ghost AI & Web Audio
 * Author: Debasmita Bose (@DebasmitaBose0) | ArcadeVerse NSOC '26
 */

(function () {
  'use strict';

  // Constants
  const V_WIDTH = 960;
  const V_HEIGHT = 600;
  const STORAGE_HIGH = 'arcadeverse_haunted_house_best';
  const STORAGE_MUTED = 'arcadeverse_haunted_house_muted';

  // DOM Elements
  const canvas = document.getElementById('hh-canvas');
  const ctx = canvas.getContext('2d');
  const sanityFill = document.getElementById('hh-sanity-fill');
  const keysCountEl = document.getElementById('hh-keys-count');
  const scoreEl = document.getElementById('hh-score');
  const finalScoreEl = document.getElementById('hh-final-score');
  const modalInstructions = document.getElementById('hh-modal-instructions');
  const modalGameOver = document.getElementById('hh-modal-gameover');
  const goTitle = document.getElementById('hh-go-title');
  const goDesc = document.getElementById('hh-go-desc');
  const goBadge = document.getElementById('hh-go-badge');
  const btnStart = document.getElementById('hh-btn-start');
  const btnRestart = document.getElementById('hh-btn-restart');
  const btnSound = document.getElementById('hh-btn-sound');
  const btnHelp = document.getElementById('hh-btn-help');

  // Mobile Touch Controls
  const touchUp = document.getElementById('hh-touch-up');
  const touchDown = document.getElementById('hh-touch-down');
  const touchLeft = document.getElementById('hh-touch-left');
  const touchRight = document.getElementById('hh-touch-right');
  const touchBurst = document.getElementById('hh-touch-burst');

  // Web Audio Synthesizer
  class HauntedAudio {
    constructor() {
      this.ctx = null;
      this.isMuted = false;
      try {
        this.isMuted = localStorage.getItem(STORAGE_MUTED) === 'true';
      } catch (e) {
        this.isMuted = false;
      }
      this.updateButtonUI();
    }

    ensureContext() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }

    toggleMute() {
      this.isMuted = !this.isMuted;
      try {
        localStorage.setItem(STORAGE_MUTED, String(this.isMuted));
      } catch (e) {}
      this.updateButtonUI();
      return this.isMuted;
    }

    updateButtonUI() {
      if (!btnSound) return;
      btnSound.title = this.isMuted ? 'Sound: OFF' : 'Sound: ON';
      btnSound.style.opacity = this.isMuted ? '0.5' : '1';
    }

    playTone(freq, type = 'sine', duration = 0.2, gainVol = 0.1) {
      if (this.isMuted) return;
      this.ensureContext();
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(gainVol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {}
    }

    playGhostBanish() {
      if (this.isMuted) return;
      this.ensureContext();
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.35);
      } catch (e) {}
    }

    playKeyCollect() {
      this.playTone(587.33, 'triangle', 0.15, 0.1); // D5
      setTimeout(() => this.playTone(880, 'triangle', 0.25, 0.1), 100); // A5
    }

    playUVBurst() {
      this.playTone(300, 'square', 0.4, 0.12);
      this.playTone(600, 'sine', 0.4, 0.1);
    }

    playThunder() {
      if (this.isMuted) return;
      this.ensureContext();
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(80, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.8);
        gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.8);
      } catch (e) {}
    }

    playVictory() {
      const notes = [440, 554, 659, 880];
      notes.forEach((f, idx) => {
        setTimeout(() => this.playTone(f, 'sine', 0.3, 0.12), idx * 120);
      });
    }

    playGameOver() {
      const notes = [350, 310, 260, 180];
      notes.forEach((f, idx) => {
        setTimeout(() => this.playTone(f, 'sawtooth', 0.35, 0.09), idx * 140);
      });
    }
  }

  const audio = new HauntedAudio();

  // Mansion Architecture / Walls
  const WALLS = [
    // Outer boundary
    { x: 30, y: 30, w: 900, h: 18 },
    { x: 30, y: 552, w: 900, h: 18 },
    { x: 30, y: 30, w: 18, h: 540 },
    { x: 912, y: 30, w: 18, h: 540 },

    // Interior Manor Rooms
    { x: 260, y: 30, w: 18, h: 220 },
    { x: 260, y: 340, w: 18, h: 220 },
    { x: 600, y: 30, w: 18, h: 200 },
    { x: 600, y: 320, w: 18, h: 240 },
    { x: 30, y: 300, w: 150, h: 18 },
    { x: 260, y: 300, w: 200, h: 18 },
    { x: 600, y: 220, w: 180, h: 18 },
    { x: 700, y: 380, w: 220, h: 18 }
  ];

  // Game State
  let isRunning = false;
  let score = 0;
  let sanity = 100;
  let keysCollected = 0;
  const TOTAL_KEYS = 3;
  let uvBurstCharges = 2;
  let lightningTimer = 0;
  let isLightningActive = false;

  // Player
  const player = {
    x: 80,
    y: 80,
    radius: 14,
    speed: 3.6,
    angle: 0,
    vx: 0,
    vy: 0,
    burstActive: false,
    burstTimer: 0
  };

  // Entities
  let ghosts = [];
  let relicKeys = [];
  let jackOLanterns = [];
  let particles = [];
  let bats = [];

  // Keys Input
  const keys = {
    up: false,
    down: false,
    left: false,
    right: false
  };

  // Keyboard Event Listeners
  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'KeyW'].includes(e.code)) keys.up = true;
    if (['ArrowDown', 'KeyS'].includes(e.code)) keys.down = true;
    if (['ArrowLeft', 'KeyA'].includes(e.code)) keys.left = true;
    if (['ArrowRight', 'KeyD'].includes(e.code)) keys.right = true;
    if (e.code === 'Space') {
      triggerUVBurst();
      e.preventDefault();
    }
  });

  window.addEventListener('keyup', (e) => {
    if (['ArrowUp', 'KeyW'].includes(e.code)) keys.up = false;
    if (['ArrowDown', 'KeyS'].includes(e.code)) keys.down = false;
    if (['ArrowLeft', 'KeyA'].includes(e.code)) keys.left = false;
    if (['ArrowRight', 'KeyD'].includes(e.code)) keys.right = false;
  });

  // Touch Controller Binding
  const bindTouch = (el, prop) => {
    if (!el) return;
    const start = (e) => { e.preventDefault(); keys[prop] = true; };
    const end = (e) => { e.preventDefault(); keys[prop] = false; };
    el.addEventListener('touchstart', start, { passive: false });
    el.addEventListener('touchend', end, { passive: false });
    el.addEventListener('mousedown', start);
    el.addEventListener('mouseup', end);
    el.addEventListener('mouseleave', end);
  };

  bindTouch(touchUp, 'up');
  bindTouch(touchDown, 'down');
  bindTouch(touchLeft, 'left');
  bindTouch(touchRight, 'right');

  if (touchBurst) {
    touchBurst.addEventListener('click', (e) => {
      e.preventDefault();
      triggerUVBurst();
    });
  }

  // Trigger 360 UV Light Burst
  function triggerUVBurst() {
    if (!isRunning || uvBurstCharges <= 0) return;
    uvBurstCharges--;
    player.burstActive = true;
    player.burstTimer = 45; // 45 frames of high intensity
    audio.playUVBurst();

    // Banish all ghosts within 200px
    ghosts.forEach(g => {
      const dist = Math.hypot(g.x - player.x, g.y - player.y);
      if (dist < 220) {
        g.hp = 0;
        createParticles(g.x, g.y, '#f97316', 18);
        score += 150;
        audio.playGhostBanish();
      }
    });
    updateHUD();
  }

  // Setup entities for new round
  function setupGame() {
    score = 0;
    sanity = 100;
    keysCollected = 0;
    uvBurstCharges = 2;
    particles = [];
    lightningTimer = 300 + Math.random() * 400;

    player.x = 90;
    player.y = 90;
    player.angle = 0;

    // 3 Relic Keys hidden in distinct chambers
    relicKeys = [
      { x: 120, y: 480, collected: false, color: '#f59e0b', label: 'Bronze Key' },
      { x: 440, y: 110, collected: false, color: '#38bdf8', label: 'Silver Key' },
      { x: 800, y: 480, collected: false, color: '#eab308', label: 'Golden Skull Key' }
    ];

    // Jack-o'-Lanterns (provide UV burst charges & sanity)
    jackOLanterns = [
      { x: 460, y: 460, collected: false },
      { x: 740, y: 120, collected: false },
      { x: 150, y: 200, collected: false }
    ];

    // Spawn Ghosts
    ghosts = [];
    const ghostConfigs = [
      { x: 380, y: 180, speed: 1.6, type: 'poltergeist', color: '#34d399' },
      { x: 500, y: 400, speed: 1.8, type: 'banshee', color: '#c084fc' },
      { x: 750, y: 280, speed: 2.1, type: 'phantom', color: '#38bdf8' },
      { x: 200, y: 460, speed: 1.5, type: 'specter', color: '#a7f3d0' },
      { x: 840, y: 100, speed: 2.3, type: 'wraith', color: '#f43f5e' }
    ];

    ghosts = ghostConfigs.map(g => ({
      ...g,
      hp: 60,
      maxHp: 60,
      radius: 16,
      angle: Math.random() * Math.PI * 2,
      wobble: Math.random() * 10
    }));

    // Ambient flutter bats
    bats = Array.from({ length: 6 }, () => ({
      x: 100 + Math.random() * 700,
      y: 50 + Math.random() * 400,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 2,
      flap: 0
    }));

    updateHUD();
  }

  function updateHUD() {
    if (sanityFill) sanityFill.style.width = Math.max(0, sanity) + '%';
    if (keysCountEl) keysCountEl.textContent = keysCollected;
    if (scoreEl) scoreEl.textContent = score;
  }

  function createParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3.5;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 3,
        color,
        life: 30 + Math.random() * 20,
        maxLife: 50
      });
    }
  }

  // Bounding box collision checking
  function checkWallCollision(x, y, radius) {
    for (const w of WALLS) {
      const testX = Math.max(w.x, Math.min(x, w.x + w.w));
      const testY = Math.max(w.y, Math.min(y, w.y + w.h));
      const distX = x - testX;
      const distY = y - testY;
      if ((distX * distX + distY * distY) < (radius * radius)) {
        return true;
      }
    }
    return false;
  }

  // Game Loop Update
  function update() {
    if (!isRunning) return;

    // Movement
    let dx = 0;
    let dy = 0;
    if (keys.up) dy -= 1;
    if (keys.down) dy += 1;
    if (keys.left) dx -= 1;
    if (keys.right) dx += 1;

    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }

    if (dx !== 0 || dy !== 0) {
      player.angle = Math.atan2(dy, dx);
    }

    const nextX = player.x + dx * player.speed;
    const nextY = player.y + dy * player.speed;

    if (!checkWallCollision(nextX, player.y, player.radius)) {
      player.x = nextX;
    }
    if (!checkWallCollision(player.x, nextY, player.radius)) {
      player.y = nextY;
    }

    // UV Burst Decay
    if (player.burstActive) {
      player.burstTimer--;
      if (player.burstTimer <= 0) player.burstActive = false;
    }

    // Lightning Flash Timer
    lightningTimer--;
    if (lightningTimer <= 0) {
      isLightningActive = true;
      audio.playThunder();
      setTimeout(() => { isLightningActive = false; }, 140);
      lightningTimer = 350 + Math.random() * 500;
    }

    // Update Bats
    bats.forEach(b => {
      b.x += b.vx;
      b.y += b.vy;
      b.flap += 0.25;
      if (b.x < 50 || b.x > 880) b.vx *= -1;
      if (b.y < 50 || b.y > 520) b.vy *= -1;
    });

    // Update Particles
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
    });
    particles = particles.filter(p => p.life > 0);

    // Collect Relic Keys
    relicKeys.forEach(k => {
      if (!k.collected) {
        const d = Math.hypot(k.x - player.x, k.y - player.y);
        if (d < player.radius + 15) {
          k.collected = true;
          keysCollected++;
          score += 250;
          createParticles(k.x, k.y, k.color, 20);
          audio.playKeyCollect();
          updateHUD();
        }
      }
    });

    // Collect Jack-o'-Lanterns (Refill Sanity & UV charge)
    jackOLanterns.forEach(j => {
      if (!j.collected) {
        const d = Math.hypot(j.x - player.x, j.y - player.y);
        if (d < player.radius + 18) {
          j.collected = true;
          sanity = Math.min(100, sanity + 35);
          uvBurstCharges++;
          score += 100;
          createParticles(j.x, j.y, '#f97316', 15);
          audio.playTone(523.25, 'sine', 0.2, 0.1);
          updateHUD();
        }
      }
    });

    // Exit Gate Trigger (at x: 880, y: 280)
    if (keysCollected >= TOTAL_KEYS) {
      const exitDist = Math.hypot(880 - player.x, 280 - player.y);
      if (exitDist < 35) {
        gameVictory();
        return;
      }
    }

    // Ghost Mechanics & Light Banishment
    let nearGhost = false;

    ghosts.forEach(g => {
      if (g.hp <= 0) return;

      // Ghost Wobble Float
      g.wobble += 0.05;
      const angleToPlayer = Math.atan2(player.y - g.y, player.x - g.x);
      const distToPlayer = Math.hypot(player.x - g.x, player.y - g.y);

      // Follow player slowly
      g.x += Math.cos(angleToPlayer) * g.speed * 0.7;
      g.y += Math.sin(angleToPlayer) * g.speed * 0.7;

      if (distToPlayer < 90) nearGhost = true;

      // Check if Ghost is inside Player's Flashlight Cone
      // Flashlight cone is 60 degrees (PI/3) and 240px distance
      if (distToPlayer < 240) {
        const angleDiff = Math.abs(Math.atan2(g.y - player.y, g.x - player.x) - player.angle);
        const normAngleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));

        if (Math.abs(normAngleDiff) < Math.PI / 6) {
          // Inside light cone! Damage ghost
          g.hp -= 1.8;
          createParticles(g.x, g.y, g.color, 1);
          if (g.hp <= 0) {
            score += 100;
            createParticles(g.x, g.y, '#38bdf8', 25);
            audio.playGhostBanish();
          }
        }
      }

      // Ghost touches player directly
      if (distToPlayer < player.radius + g.radius) {
        sanity -= 0.6;
      }
    });

    // Sanity Drain if near ghosts
    if (nearGhost) {
      sanity -= 0.18;
    }

    // Slow ambient recovery if safe
    if (!nearGhost && sanity < 100) {
      sanity += 0.02;
    }

    updateHUD();

    // Check Sanity Game Over
    if (sanity <= 0) {
      gameOver();
    }
  }

  // Draw Scene
  function render() {
    ctx.clearRect(0, 0, V_WIDTH, V_HEIGHT);

    // Floor (Dark Victorian Floorboards)
    ctx.fillStyle = '#0f081d';
    ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

    // Floorboard lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
    ctx.lineWidth = 1;
    for (let y = 30; y < 570; y += 40) {
      ctx.beginPath();
      ctx.moveTo(30, y);
      ctx.lineTo(930, y);
      ctx.stroke();
    }

    // Walls
    ctx.fillStyle = '#26153d';
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 1.5;
    WALLS.forEach(w => {
      ctx.fillRect(w.x, w.y, w.w, w.h);
      ctx.strokeRect(w.x, w.y, w.w, w.h);
    });

    // Exit Gate (x: 870, y: 250, w: 40, h: 60)
    const gateUnlocked = keysCollected >= TOTAL_KEYS;
    ctx.fillStyle = gateUnlocked ? '#eab308' : '#475569';
    ctx.fillRect(875, 250, 36, 60);
    ctx.strokeStyle = gateUnlocked ? '#fef08a' : '#64748b';
    ctx.lineWidth = 2;
    ctx.strokeRect(875, 250, 36, 60);

    // Draw Gate Label
    ctx.font = 'bold 11px system-ui';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(gateUnlocked ? 'EXIT OPEN!' : 'LOCKED', 893, 285);

    // Draw Relic Keys
    relicKeys.forEach(k => {
      if (!k.collected) {
        ctx.save();
        ctx.translate(k.x, k.y);
        ctx.shadowColor = k.color;
        ctx.shadowBlur = 15;
        ctx.fillStyle = k.color;
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-2, 0, 4, 14);
        ctx.fillRect(0, 8, 5, 3);
        ctx.restore();
      }
    });

    // Draw Jack-o'-Lanterns
    jackOLanterns.forEach(j => {
      if (!j.collected) {
        ctx.save();
        ctx.translate(j.x, j.y);
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fill();

        // Pumpkin Face
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.moveTo(-4, -2); ctx.lineTo(-2, -5); ctx.lineTo(0, -2); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(1, -2); ctx.lineTo(3, -5); ctx.lineTo(5, -2); ctx.fill();
        ctx.fillRect(-4, 2, 8, 3);
        ctx.restore();
      }
    });

    // Draw Ghosts
    ghosts.forEach(g => {
      if (g.hp <= 0) return;
      ctx.save();
      ctx.translate(g.x, g.y + Math.sin(g.wobble) * 4);
      ctx.shadowColor = g.color;
      ctx.shadowBlur = 16;
      ctx.fillStyle = g.color;
      ctx.globalAlpha = 0.85;

      // Spooky Head & Flowing Tail
      ctx.beginPath();
      ctx.arc(0, -5, g.radius, Math.PI, 0, false);
      ctx.lineTo(g.radius, 12);
      ctx.lineTo(g.radius * 0.5, 7);
      ctx.lineTo(0, 14);
      ctx.lineTo(-g.radius * 0.5, 7);
      ctx.lineTo(-g.radius, 12);
      ctx.closePath();
      ctx.fill();

      // Glowing Eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-5, -5, 3, 0, Math.PI * 2);
      ctx.arc(5, -5, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(-5, -5, 1.5, 0, Math.PI * 2);
      ctx.arc(5, -5, 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    // Draw Bats Fluttering
    ctx.fillStyle = 'rgba(168, 85, 247, 0.45)';
    bats.forEach(b => {
      ctx.save();
      ctx.translate(b.x, b.y);
      const wing = Math.sin(b.flap) * 6;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-7, wing);
      ctx.lineTo(0, -3);
      ctx.lineTo(7, wing);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });

    // Draw Particles
    particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // Draw Player
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);

    // Player Body (Explorer)
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
    ctx.fill();

    // Flashlight casing held forward
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(8, -4, 10, 8);
    ctx.restore();

    // Darkness & Dynamic Flashlight Mask
    if (!isLightningActive) {
      renderLighting();
    }
  }

  // Dynamic Flashlight Lighting Cone
  function renderLighting() {
    ctx.save();

    // Create shadow overlay
    const lightCanvas = document.createElement('canvas');
    lightCanvas.width = V_WIDTH;
    lightCanvas.height = V_HEIGHT;
    const lCtx = lightCanvas.getContext('2d');

    // Fill entirely with shadowy darkness
    lCtx.fillStyle = 'rgba(5, 2, 12, 0.94)';
    lCtx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

    // Cutout Light Cone from Flashlight
    lCtx.globalCompositeOperation = 'destination-out';

    // 1. Ambient circle around player
    const ambientRad = player.burstActive ? 220 : 55;
    const radGrad = lCtx.createRadialGradient(player.x, player.y, 0, player.x, player.y, ambientRad);
    radGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
    radGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.8)');
    radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    lCtx.fillStyle = radGrad;
    lCtx.beginPath();
    lCtx.arc(player.x, player.y, ambientRad, 0, Math.PI * 2);
    lCtx.fill();

    // 2. Focused Flashlight Beam Cone
    const coneDist = 260;
    const coneAngle = Math.PI / 5.5; // ~33 degrees
    lCtx.beginPath();
    lCtx.moveTo(player.x, player.y);
    lCtx.arc(player.x, player.y, coneDist, player.angle - coneAngle, player.angle + coneAngle);
    lCtx.closePath();
    lCtx.fillStyle = 'rgba(0, 0, 0, 0.95)';
    lCtx.fill();

    // 3. Candle / Jack-o'-Lantern glows
    jackOLanterns.forEach(j => {
      if (!j.collected) {
        const jg = lCtx.createRadialGradient(j.x, j.y, 0, j.x, j.y, 45);
        jg.addColorStop(0, 'rgba(0,0,0,0.9)');
        jg.addColorStop(1, 'rgba(0,0,0,0)');
        lCtx.fillStyle = jg;
        lCtx.beginPath();
        lCtx.arc(j.x, j.y, 45, 0, Math.PI * 2);
        lCtx.fill();
      }
    });

    // Composite darkness layer back onto main canvas
    ctx.drawImage(lightCanvas, 0, 0);
    ctx.restore();
  }

  // Game Victory
  function gameVictory() {
    isRunning = false;
    audio.playVictory();
    score += Math.round(sanity * 10) + 1000;
    saveHighScore(score);

    if (goTitle) goTitle.textContent = 'MANOR ESCAPED!';
    if (goDesc) goDesc.textContent = `You found all 3 Relic Keys, banished the spirits, and survived with ${Math.round(sanity)}% sanity!`;
    if (goBadge) {
      goBadge.textContent = 'Victory Achieved';
      goBadge.style.color = '#10b981';
      goBadge.style.borderColor = '#10b981';
    }
    if (finalScoreEl) finalScoreEl.textContent = score;
    if (modalGameOver) modalGameOver.classList.remove('hidden');
  }

  // Game Over
  function gameOver() {
    isRunning = false;
    audio.playGameOver();
    saveHighScore(score);

    if (goTitle) goTitle.textContent = 'SANITY CONSUMED...';
    if (goDesc) goDesc.textContent = 'The malevolent spirits overwhelmed you in the darkness. The manor claimed another soul.';
    if (goBadge) {
      goBadge.textContent = 'Nightmare Defeat';
      goBadge.style.color = '#ef4444';
      goBadge.style.borderColor = '#ef4444';
    }
    if (finalScoreEl) finalScoreEl.textContent = score;
    if (modalGameOver) modalGameOver.classList.remove('hidden');
  }

  function saveHighScore(pts) {
    try {
      const best = parseInt(localStorage.getItem(STORAGE_HIGH) || '0', 10);
      if (pts > best) localStorage.setItem(STORAGE_HIGH, String(pts));
    } catch (e) {}
  }

  // Main 60fps Loop
  function loop() {
    update();
    render();
    requestAnimationFrame(loop);
  }

  // Canvas Resize Handler
  function resizeCanvas() {
    canvas.width = V_WIDTH;
    canvas.height = V_HEIGHT;
  }

  // Start & Restart Event Bindings
  if (btnStart) {
    btnStart.addEventListener('click', () => {
      audio.ensureContext();
      if (modalInstructions) modalInstructions.classList.add('hidden');
      setupGame();
      isRunning = true;
    });
  }

  if (btnRestart) {
    btnRestart.addEventListener('click', () => {
      audio.ensureContext();
      if (modalGameOver) modalGameOver.classList.add('hidden');
      setupGame();
      isRunning = true;
    });
  }

  if (btnHelp) {
    btnHelp.addEventListener('click', () => {
      isRunning = false;
      if (modalInstructions) modalInstructions.classList.remove('hidden');
    });
  }

  if (btnSound) {
    btnSound.addEventListener('click', () => {
      audio.toggleMute();
    });
  }

  // Initialize
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  requestAnimationFrame(loop);
})();
