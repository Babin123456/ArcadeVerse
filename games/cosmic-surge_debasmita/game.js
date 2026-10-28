/**
 * Cosmic Surge: Quantum Leap
 * Author: Debasmita Bose (@DebasmitaBose0)
 * ArcadeVerse - Nexus Spring of Code 2026
 * Pure Vanilla HTML5 Canvas, Web Audio API procedural synthesizer
 */

(function () {
  'use strict';

  // --- Audio Synthesizer (Web Audio API) ---
  const AudioEngine = {
    ctx: null,
    muted: false,

    init() {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      } catch (e) {
        // AudioContext not supported
      }
      this.muted = localStorage.getItem('cosmic_surge_muted') === 'true';
    },

    resume() {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    },

    playLeap() {
      if (this.muted || !this.ctx) return;
      this.resume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.12);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    },

    playCollect() {
      if (this.muted || !this.ctx) return;
      this.resume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.08); // A5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    },

    playCrash() {
      if (this.muted || !this.ctx) return;
      this.resume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.35);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    }
  };

  // --- Game Constants & State ---
  const CANVAS_WIDTH = 600;
  const CANVAS_HEIGHT = 450;
  const CENTER_X = CANVAS_WIDTH / 2;
  const CENTER_Y = CANVAS_HEIGHT / 2;

  const INNER_RADIUS = 85;
  const OUTER_RADIUS = 155;

  const State = {
    IDLE: 'idle',
    PLAYING: 'playing',
    GAMEOVER: 'gameover'
  };

  let gameState = State.IDLE;
  let score = 0;
  let bestScore = parseInt(localStorage.getItem('cosmic_surge_best') || '0', 10);
  let multiplier = 1;
  let streak = 0;

  // Player Core
  const player = {
    angle: 0,
    speed: 0.038,
    ring: 'inner', // 'inner' or 'outer'
    radius: INNER_RADIUS,
    targetRadius: INNER_RADIUS,
    size: 9,
    pulse: 0
  };

  // Game Entities
  let hazards = [];
  let orbs = [];
  let particles = [];
  let spawnTimer = 0;

  // DOM Elements
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const scoreDisplay = document.getElementById('score-display');
  const multiplierDisplay = document.getElementById('multiplier-display');
  const bestDisplay = document.getElementById('best-display');
  const startScreen = document.getElementById('start-screen');
  const gameoverScreen = document.getElementById('gameover-screen');
  const finalScoreDisplay = document.getElementById('final-score');
  const finalBestDisplay = document.getElementById('final-best');
  const btnStart = document.getElementById('btn-start');
  const btnRestart = document.getElementById('btn-restart');
  const btnSound = document.getElementById('btn-sound');
  const soundIcon = document.getElementById('sound-icon');
  const btnHelp = document.getElementById('btn-help');
  const btnCloseHelp = document.getElementById('btn-close-help');
  const btnGotIt = document.getElementById('btn-got-it');
  const helpModal = document.getElementById('help-modal');

  // --- Helper Functions ---
  function normalizeAngle(a) {
    while (a < 0) a += Math.PI * 2;
    while (a >= Math.PI * 2) a -= Math.PI * 2;
    return a;
  }

  function angleDiff(a, b) {
    const diff = Math.abs(normalizeAngle(a) - normalizeAngle(b));
    return Math.min(diff, Math.PI * 2 - diff);
  }

  function spawnOrb() {
    const ring = Math.random() < 0.5 ? 'inner' : 'outer';
    const angle = normalizeAngle(player.angle + Math.PI * (0.6 + Math.random() * 0.8));
    orbs.push({
      ring,
      radius: ring === 'inner' ? INNER_RADIUS : OUTER_RADIUS,
      angle,
      pulse: 0
    });
  }

  function spawnHazard() {
    const ring = Math.random() < 0.5 ? 'inner' : 'outer';
    const span = 0.38 + Math.min(0.25, score * 0.001); // Angular width
    const angle = normalizeAngle(player.angle + Math.PI * 1.2);
    const rotSpeed = (Math.random() < 0.5 ? 1 : -1) * (0.006 + Math.min(0.015, score * 0.0003));

    hazards.push({
      ring,
      radius: ring === 'inner' ? INNER_RADIUS : OUTER_RADIUS,
      angle,
      span,
      rotSpeed
    });
  }

  function createExplosion(x, y, color) {
    for (let i = 0; i < 28; i++) {
      const pAngle = Math.random() * Math.PI * 2;
      const pSpeed = 1.5 + Math.random() * 4.5;
      particles.push({
        x,
        y,
        vx: Math.cos(pAngle) * pSpeed,
        vy: Math.sin(pAngle) * pSpeed,
        color,
        life: 1.0,
        decay: 0.02 + Math.random() * 0.03,
        size: 2.5 + Math.random() * 3
      });
    }
  }

  // --- Core Game Actions ---
  function leap() {
    if (gameState !== State.PLAYING) return;

    if (player.ring === 'inner') {
      player.ring = 'outer';
      player.targetRadius = OUTER_RADIUS;
    } else {
      player.ring = 'inner';
      player.targetRadius = INNER_RADIUS;
    }

    AudioEngine.playLeap();

    // Spawn leap burst particles
    const px = CENTER_X + Math.cos(player.angle) * player.radius;
    const py = CENTER_Y + Math.sin(player.angle) * player.radius;
    for (let i = 0; i < 6; i++) {
      particles.push({
        x: px,
        y: py,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        color: '#38bdf8',
        life: 0.8,
        decay: 0.04,
        size: 3
      });
    }
  }

  function startGame() {
    gameState = State.PLAYING;
    score = 0;
    multiplier = 1;
    streak = 0;
    hazards = [];
    orbs = [];
    particles = [];
    spawnTimer = 0;

    player.angle = 0;
    player.speed = 0.038;
    player.ring = 'inner';
    player.radius = INNER_RADIUS;
    player.targetRadius = INNER_RADIUS;

    scoreDisplay.textContent = '0';
    multiplierDisplay.textContent = '1x';
    startScreen.classList.add('hidden');
    gameoverScreen.classList.add('hidden');

    spawnOrb();
    spawnOrb();
    spawnHazard();

    AudioEngine.init();
    canvas.focus();
  }

  function gameOver() {
    gameState = State.GAMEOVER;
    AudioEngine.playCrash();

    const px = CENTER_X + Math.cos(player.angle) * player.radius;
    const py = CENTER_Y + Math.sin(player.angle) * player.radius;
    createExplosion(px, py, '#f43f5e');

    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem('cosmic_surge_best', bestScore.toString());
      bestDisplay.textContent = bestScore.toString();
    }

    finalScoreDisplay.textContent = score.toString();
    finalBestDisplay.textContent = bestScore.toString();
    gameoverScreen.classList.remove('hidden');
  }

  // --- Game Loop ---
  function update() {
    if (gameState !== State.PLAYING) return;

    // Smooth radius transition
    player.radius += (player.targetRadius - player.radius) * 0.28;

    // Advance player angle
    player.speed = 0.038 + Math.min(0.03, score * 0.0005);
    player.angle = normalizeAngle(player.angle + player.speed);
    player.pulse += 0.08;

    // Player particle trail
    if (Math.random() < 0.6) {
      const px = CENTER_X + Math.cos(player.angle) * player.radius;
      const py = CENTER_Y + Math.sin(player.angle) * player.radius;
      particles.push({
        x: px,
        y: py,
        vx: -Math.cos(player.angle) * 0.8,
        vy: -Math.sin(player.angle) * 0.8,
        color: '#38bdf8',
        life: 0.6,
        decay: 0.04,
        size: 2
      });
    }

    // Spawn hazards & orbs
    spawnTimer++;
    if (spawnTimer % 90 === 0 && hazards.length < 5) {
      spawnHazard();
    }
    if (orbs.length < 3 && Math.random() < 0.04) {
      spawnOrb();
    }

    // Update hazards
    for (let i = 0; i < hazards.length; i++) {
      const h = hazards[i];
      h.angle = normalizeAngle(h.angle + h.rotSpeed);

      // Collision check with player
      if (h.ring === player.ring && Math.abs(player.radius - h.radius) < 18) {
        if (angleDiff(player.angle, h.angle) < h.span / 2) {
          gameOver();
          return;
        }
      }
    }

    // Update orbs
    for (let i = orbs.length - 1; i >= 0; i--) {
      const orb = orbs[i];
      orb.pulse += 0.06;

      // Check collection
      if (orb.ring === player.ring && Math.abs(player.radius - orb.radius) < 22) {
        if (angleDiff(player.angle, orb.angle) < 0.16) {
          streak++;
          if (streak >= 9) multiplier = 4;
          else if (streak >= 6) multiplier = 3;
          else if (streak >= 3) multiplier = 2;
          else multiplier = 1;

          score += 10 * multiplier;
          scoreDisplay.textContent = score.toString();
          multiplierDisplay.textContent = `${multiplier}x`;

          const ox = CENTER_X + Math.cos(orb.angle) * orb.radius;
          const oy = CENTER_Y + Math.sin(orb.angle) * orb.radius;
          createExplosion(ox, oy, '#facc15');
          AudioEngine.playCollect();

          orbs.splice(i, 1);
        }
      }
    }

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw central gravitational anomaly
    const grad = ctx.createRadialGradient(CENTER_X, CENTER_Y, 10, CENTER_X, CENTER_Y, 60);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
    grad.addColorStop(0.5, 'rgba(99, 102, 241, 0.2)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(CENTER_X, CENTER_Y, 60, 0, Math.PI * 2);
    ctx.fill();

    // Central core pulse
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(CENTER_X, CENTER_Y, 6 + Math.sin(Date.now() * 0.005) * 1.5, 0, Math.PI * 2);
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw Orbits
    [INNER_RADIUS, OUTER_RADIUS].forEach((r, idx) => {
      ctx.beginPath();
      ctx.arc(CENTER_X, CENTER_Y, r, 0, Math.PI * 2);
      ctx.strokeStyle = idx === 0 ? 'rgba(56, 189, 248, 0.18)' : 'rgba(99, 102, 241, 0.22)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Draw Hazards (Plasma Arc Gates)
    hazards.forEach(h => {
      const startAngle = h.angle - h.span / 2;
      const endAngle = h.angle + h.span / 2;

      ctx.beginPath();
      ctx.arc(CENTER_X, CENTER_Y, h.radius, startAngle, endAngle);
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 8;
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Gate emitters at endpoints
      [startAngle, endAngle].forEach(ang => {
        const ex = CENTER_X + Math.cos(ang) * h.radius;
        const ey = CENTER_Y + Math.sin(ang) * h.radius;
        ctx.fillStyle = '#ffe4e6';
        ctx.beginPath();
        ctx.arc(ex, ey, 4.5, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    // Draw Quantum Flux Orbs
    orbs.forEach(orb => {
      const ox = CENTER_X + Math.cos(orb.angle) * orb.radius;
      const oy = CENTER_Y + Math.sin(orb.angle) * orb.radius;
      const r = 5.5 + Math.sin(orb.pulse) * 1.2;

      ctx.beginPath();
      ctx.arc(ox, oy, r, 0, Math.PI * 2);
      ctx.fillStyle = '#facc15';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Draw Particles
    particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // Draw Player Energy Core (if active)
    if (gameState === State.PLAYING || gameState === State.IDLE) {
      const px = CENTER_X + Math.cos(player.angle) * player.radius;
      const py = CENTER_Y + Math.sin(player.angle) * player.radius;

      // Outer Glow
      ctx.beginPath();
      ctx.arc(px, py, player.size + 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.28)';
      ctx.fill();

      // Main Core
      ctx.beginPath();
      ctx.arc(px, py, player.size, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Inner Hotspot
      ctx.beginPath();
      ctx.arc(px, py, player.size * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  // --- Event Bindings ---
  function setupEvents() {
    // Leap triggers
    const triggerLeap = (e) => {
      if (gameState === State.PLAYING) {
        if (e) e.preventDefault();
        leap();
      }
    };

    canvas.addEventListener('pointerdown', triggerLeap);
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        if (gameState === State.PLAYING) {
          e.preventDefault();
          leap();
        } else if (gameState === State.IDLE) {
          e.preventDefault();
          startGame();
        } else if (gameState === State.GAMEOVER) {
          e.preventDefault();
          startGame();
        }
      } else if (e.code === 'KeyR' && gameState === State.GAMEOVER) {
        startGame();
      }
    });

    btnStart.addEventListener('click', startGame);
    btnRestart.addEventListener('click', startGame);

    // Sound Toggle
    btnSound.addEventListener('click', () => {
      AudioEngine.muted = !AudioEngine.muted;
      localStorage.setItem('cosmic_surge_muted', AudioEngine.muted ? 'true' : 'false');
      if (soundIcon) {
        soundIcon.setAttribute('data-lucide', AudioEngine.muted ? 'volume-x' : 'volume-2');
        if (window.lucide) lucide.createIcons();
      }
    });

    // How to Play Modal
    btnHelp.addEventListener('click', () => {
      helpModal.classList.remove('hidden');
    });

    const closeHelp = () => {
      helpModal.classList.add('hidden');
    };

    btnCloseHelp.addEventListener('click', closeHelp);
    btnGotIt.addEventListener('click', closeHelp);
    helpModal.addEventListener('click', (e) => {
      if (e.target === helpModal) closeHelp();
    });
  }

  // --- Initialization ---
  function init() {
    bestDisplay.textContent = bestScore.toString();
    setupEvents();
    requestAnimationFrame(loop);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
