/**
 * Cyber Brick Breaker - Modern Canvas Physics & Audio Synthesizer Engine
 * Author: Babin Bid (@Babin123456)
 * Open Source for ArcadeVerse - NSOC Winter Edition 2026
 */

(function () {
  'use strict';

  // DOM Bindings
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const scoreDisplay = document.getElementById('score-display');
  const livesDisplay = document.getElementById('lives-display');
  const comboDisplay = document.getElementById('combo-display');
  const bestDisplay = document.getElementById('best-display');
  const levelDisplay = document.getElementById('level-display');
  let level = 1;

  const startOverlay = document.getElementById('start-overlay');
  const gameOverOverlay = document.getElementById('game-over-overlay');
  const victoryOverlay = document.getElementById('victory-overlay');
  const finalScoreEl = document.getElementById('final-score');
  const victoryScoreEl = document.getElementById('victory-score');

  const btnStart = document.getElementById('btn-start');
  const btnRestart = document.getElementById('btn-restart');
  const btnNextLevel = document.getElementById('btn-next-level');
  const btnSound = document.getElementById('btn-sound');
  const iconSoundOn = document.getElementById('icon-sound-on');
  const iconSoundOff = document.getElementById('icon-sound-off');
  const btnHelp = document.getElementById('btn-help');
  const helpModal = document.getElementById('help-modal');
  const btnCloseHelp = document.getElementById('btn-close-help');

  // Game Dimensions
  const WIDTH = 600;
  const HEIGHT = 700;
  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  // Sound Engine (Web Audio API)
  let soundEnabled = true;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, type = 'sine', duration = 0.08, gainVal = 0.15) {
    if (!soundEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (_) {}
  }

  function soundHitPaddle() { playTone(280, 'triangle', 0.06, 0.2); }
  function soundHitBrick(hitLevel) { playTone(440 + hitLevel * 120, 'square', 0.08, 0.12); }
  function soundExplosion() { playTone(120, 'sawtooth', 0.25, 0.3); }
  function soundPowerup() { playTone(880, 'sine', 0.15, 0.2); }
  function soundLoseLife() { playTone(160, 'sawtooth', 0.35, 0.25); }

  // Game State
  let score = 0;
  let lives = 3;
  let combo = 1;
  let comboTimer = 0;
  let gameState = 'start'; // 'start', 'playing', 'gameover', 'victory'
  let bestScore = 0;

  // Storage
  const BEST_KEY = 'cbb_arcade_best_score';
  try {
    bestScore = parseInt(localStorage.getItem(BEST_KEY), 10) || 0;
  } catch (_) {
    bestScore = 0;
  }
  bestDisplay.textContent = bestScore;

  // Paddle
  const paddle = {
    x: WIDTH / 2 - 55,
    y: HEIGHT - 36,
    width: 110,
    height: 14,
    baseWidth: 110,
    speed: 520,
    laserEquipped: false,
    laserTimer: 0,
    safetyNet: false
  };

  // Ball
  class Ball {
    constructor(x, y, dx, dy) {
      this.x = x;
      this.y = y;
      this.dx = dx;
      this.dy = dy;
      this.radius = 7;
      this.speed = 420;
    }

    update(dt) {
      this.x += this.dx * dt;
      this.y += this.dy * dt;

      // Wall bounce
      if (this.x - this.radius <= 0) {
        this.x = this.radius;
        this.dx = Math.abs(this.dx);
        soundHitPaddle();
      } else if (this.x + this.radius >= WIDTH) {
        this.x = WIDTH - this.radius;
        this.dx = -Math.abs(this.dx);
        soundHitPaddle();
      }

      if (this.y - this.radius <= 0) {
        this.y = this.radius;
        this.dy = Math.abs(this.dy);
        soundHitPaddle();
      }
    }

    draw() {
      ctx.save();
      ctx.shadowColor = '#00f5ff';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();

      // Core aura
      ctx.fillStyle = '#00f5ff';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  let balls = [];

  // Particles
  class Particle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.radius = Math.random() * 3 + 1.5;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 160 + 40;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.alpha = 1;
      this.decay = Math.random() * 1.5 + 1.2;
    }

    update(dt) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.alpha -= this.decay * dt;
    }

    draw() {
      if (this.alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  let particles = [];

  // Powerups
  class PowerUp {
    constructor(x, y, type) {
      this.x = x;
      this.y = y;
      this.type = type; // 'laser', 'multiball', 'expand', 'shield'
      this.vy = 140;
      this.width = 28;
      this.height = 14;
    }

    update(dt) {
      this.y += this.vy * dt;
    }

    draw() {
      ctx.save();
      let color = '#00f5ff';
      let label = 'M';
      if (this.type === 'laser') { color = '#f43f5e'; label = 'L'; }
      if (this.type === 'expand') { color = '#38bdf8'; label = 'E'; }
      if (this.type === 'shield') { color = '#10b981'; label = 'S'; }

      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = color;
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, this.x, this.y);
      ctx.restore();
    }
  }

  let powerUps = [];

  // Lasers
  let lasers = [];

  // Bricks
  let bricks = [];
  const BRICK_ROWS = 6;
  const BRICK_COLS = 8;
  const BRICK_WIDTH = 64;
  const BRICK_HEIGHT = 22;
  const BRICK_GAP = 8;
  const BRICK_OFFSET_X = (WIDTH - (BRICK_COLS * BRICK_WIDTH + (BRICK_COLS - 1) * BRICK_GAP)) / 2;
  const BRICK_OFFSET_Y = 60;

    function initBricks() {
    bricks = [];
    const lvlMod = ((level - 1) % 5) + 1; // 1 to 5 level themes

    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        let shouldSpawn = true;
        let type = 'cyan';
        let hits = 1;
        let color = '#00f5ff';
        let points = 10;

        // Custom Layout Patterns per Level
        if (lvlMod === 2) {
          // Diamond / Fortress layout
          const distFromCenter = Math.abs(c - (BRICK_COLS - 1) / 2) + Math.abs(r - (BRICK_ROWS - 1) / 2);
          if (distFromCenter > 4) shouldSpawn = false;
        } else if (lvlMod === 3) {
          // Dual Column Towers
          if (c === 3 || c === 4) shouldSpawn = false;
        } else if (lvlMod === 4) {
          // Checkerboard Invader
          if ((r + c) % 2 === 1 && r > 0 && r < 5) shouldSpawn = false;
        }

        if (!shouldSpawn) continue;

        // Brick toughness scaling by row & level
        if (r === 0 || (r === 1 && lvlMod >= 2)) {
          type = 'gold';
          hits = Math.min(5, 3 + Math.floor(level / 3));
          color = '#fbbf24';
          points = 50 * level;
        } else if (r === 2 || r === 3) {
          type = 'magenta';
          hits = 2;
          color = '#ec4899';
          points = 25 * level;
        } else {
          points = 10 * level;
        }

        // Explosive chance increases on higher levels
        if (Math.random() < 0.08 + Math.min(0.08, level * 0.015)) {
          type = 'explosive';
          hits = 1;
          color = '#ef4444';
          points = 30 * level;
        }

        bricks.push({
          x: BRICK_OFFSET_X + c * (BRICK_WIDTH + BRICK_GAP),
          y: BRICK_OFFSET_Y + r * (BRICK_HEIGHT + BRICK_GAP),
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          type,
          hits,
          maxHits: hits,
          color,
          points,
          alive: true
        });
      }
    }
  }

  function spawnParticles(x, y, color, count = 12) {
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(x, y, color));
    }
  }

  function triggerExplosion(centerBrick) {
    soundExplosion();
    const cx = centerBrick.x + centerBrick.width / 2;
    const cy = centerBrick.y + centerBrick.height / 2;
    spawnParticles(cx, cy, '#ef4444', 28);

    // Hit nearby bricks
    bricks.forEach(b => {
      if (!b.alive) return;
      const dist = Math.hypot(b.x + b.width / 2 - cx, b.y + b.height / 2 - cy);
      if (dist < 90) {
        b.hits--;
        if (b.hits <= 0) {
          b.alive = false;
          score += b.points * combo;
          spawnParticles(b.x + b.width / 2, b.y + b.height / 2, b.color, 10);
        }
      }
    });
  }

  function dropPowerUp(x, y) {
    if (Math.random() > 0.28) return;
    const types = ['laser', 'multiball', 'expand', 'shield'];
    const selected = types[Math.floor(Math.random() * types.length)];
    powerUps.push(new PowerUp(x, y, selected));
  }

  function applyPowerUp(type) {
    soundPowerup();
    if (type === 'multiball') {
      const current = balls[0] || { x: paddle.x + paddle.width / 2, y: paddle.y - 10 };
      balls.push(new Ball(current.x, current.y, -260, -320));
      balls.push(new Ball(current.x, current.y, 260, -320));
    } else if (type === 'expand') {
      paddle.width = paddle.baseWidth * 1.45;
      setTimeout(() => { paddle.width = paddle.baseWidth; }, 9000);
    } else if (type === 'laser') {
      paddle.laserEquipped = true;
      paddle.laserTimer = 10;
    } else if (type === 'shield') {
      paddle.safetyNet = true;
    }
  }

  // Keyboard & Mouse Controls
  const keys = { left: false, right: false };

  window.addEventListener('keydown', (e) => {
    if (['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD', 'Space', 'Enter'].includes(e.code)) {
      e.preventDefault();
    }
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
    if (e.code === 'Space' || e.code === 'Enter') {
      if (gameState === 'start' || gameState === 'gameover') {
        startNewGame();
      } else if (gameState === 'victory') {
        advanceNextLevel();
      } else if (gameState === 'playing' && paddle.laserEquipped) {
        lasers.push({ x: paddle.x + 8, y: paddle.y - 8, vy: -580 });
        lasers.push({ x: paddle.x + paddle.width - 8, y: paddle.y - 8, vy: -580 });
        playTone(660, 'sawtooth', 0.05, 0.15);
      }
    }
    if (e.code === 'Escape') {
      if (helpModal && helpModal.classList.contains('active')) {
        helpModal.classList.remove('active');
      }
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
  });

  // Mouse / Pointer Move
  canvas.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = WIDTH / rect.width;
    const clientX = (e.clientX - rect.left) * scaleX;
    paddle.x = Math.max(0, Math.min(WIDTH - paddle.width, clientX - paddle.width / 2));
  });

  // Touch Drag
  canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = WIDTH / rect.width;
      const clientX = (e.touches[0].clientX - rect.left) * scaleX;
      paddle.x = Math.max(0, Math.min(WIDTH - paddle.width, clientX - paddle.width / 2));
    }
  }, { passive: false });

  function resetBallAndPaddle() {
    paddle.x = WIDTH / 2 - paddle.width / 2;
    const baseSpeed = Math.min(620, 380 + (level - 1) * 35);
    const angle = (Math.PI / 4) + (Math.random() * (Math.PI / 2));
    const dx = baseSpeed * Math.cos(angle) * (Math.random() > 0.5 ? 1 : -1);
    const dy = -baseSpeed * Math.sin(angle);
    const newBall = new Ball(WIDTH / 2, HEIGHT - 55, dx, dy);
    newBall.speed = baseSpeed;
    balls = [newBall];
  }

  function advanceNextLevel() {
    level++;
    victoryOverlay.classList.remove('active');
    gameOverOverlay.classList.remove('active');
    startOverlay.classList.remove('active');
    particles = [];
    powerUps = [];
    lasers = [];
    paddle.width = paddle.baseWidth;
    paddle.laserEquipped = false;
    paddle.safetyNet = false;
    initBricks();
    resetBallAndPaddle();
    gameState = 'playing';
    updateHUD();
  }

  function startNewGame() {
    initAudio();
    score = 0;
    level = 1;
    lives = 3;
    combo = 1;
    comboTimer = 0;
    particles = [];
    powerUps = [];
    lasers = [];
    paddle.width = paddle.baseWidth;
    paddle.laserEquipped = false;
    paddle.safetyNet = false;
    initBricks();
    resetBallAndPaddle();
    updateHUD();

    startOverlay.classList.remove('active');
    gameOverOverlay.classList.remove('active');
    victoryOverlay.classList.remove('active');
    gameState = 'playing';
  }

  function updateHUD() {
    scoreDisplay.textContent = score;
    if (levelDisplay) levelDisplay.textContent = level;
    comboDisplay.textContent = combo > 1 ? `${combo}x` : '1x';

    // Lives
    const hearts = livesDisplay.querySelectorAll('.heart-icon');
    hearts.forEach((h, i) => {
      if (i < lives) h.classList.add('active');
      else h.classList.remove('active');
    });

    if (score > bestScore) {
      bestScore = score;
      bestDisplay.textContent = bestScore;
      try {
        localStorage.setItem(BEST_KEY, bestScore);
      } catch (_) {}
    }
  }

  // Game Loop
  let lastTime = 0;

  function gameLoop(time) {
    if (!lastTime) lastTime = time;
    const dt = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;

    update(dt);
    draw();

    requestAnimationFrame(gameLoop);
  }

  function update(dt) {
    if (gameState !== 'playing') return;

    // Paddle key controls
    if (keys.left) paddle.x -= paddle.speed * dt;
    if (keys.right) paddle.x += paddle.speed * dt;
    paddle.x = Math.max(0, Math.min(WIDTH - paddle.width, paddle.x));

    // Combo timer
    if (combo > 1) {
      comboTimer -= dt;
      if (comboTimer <= 0) combo = 1;
      updateHUD();
    }

    // Laser timer
    if (paddle.laserEquipped) {
      paddle.laserTimer -= dt;
      if (paddle.laserTimer <= 0) paddle.laserEquipped = false;
    }

    // Update Lasers
    lasers.forEach(l => { l.y += l.vy * dt; });
    lasers = lasers.filter(l => l.y > -20);

    // Laser collisions
    lasers.forEach(l => {
      bricks.forEach(b => {
        if (!b.alive) return;
        if (l.x >= b.x && l.x <= b.x + b.width && l.y >= b.y && l.y <= b.y + b.height) {
          l.y = -999; // destroy laser
          b.hits--;
          soundHitBrick(b.hits);
          spawnParticles(l.x, b.y + b.height / 2, b.color, 6);
          if (b.hits <= 0) {
            b.alive = false;
            score += b.points * combo;
            if (b.type === 'explosive') triggerExplosion(b);
            else dropPowerUp(b.x + b.width / 2, b.y + b.height / 2);
          }
          updateHUD();
        }
      });
    });

    // Update Balls
    balls.forEach(ball => {
      ball.update(dt);

      // Paddle collision
      if (
        ball.y + ball.radius >= paddle.y &&
        ball.y - ball.radius <= paddle.y + paddle.height &&
        ball.x >= paddle.x &&
        ball.x <= paddle.x + paddle.width &&
        ball.dy > 0
      ) {
        soundHitPaddle();
        ball.y = paddle.y - ball.radius;

        // Angle deflection based on hit point on paddle
        const hitOffset = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
        const maxAngle = Math.PI * 0.42;
        const bounceAngle = hitOffset * maxAngle;
        const currentSpeed = Math.min(ball.speed * 1.02, 620);
        ball.speed = currentSpeed;
        ball.dx = currentSpeed * Math.sin(bounceAngle);
        ball.dy = -currentSpeed * Math.cos(bounceAngle);

        comboTimer = 2.4;
      }

      // Brick collisions
      bricks.forEach(b => {
        if (!b.alive) return;

        if (
          ball.x + ball.radius >= b.x &&
          ball.x - ball.radius <= b.x + b.width &&
          ball.y + ball.radius >= b.y &&
          ball.y - ball.radius <= b.y + b.height
        ) {
          // Determine collision face
          const prevX = ball.x - ball.dx * dt;
          const prevY = ball.y - ball.dy * dt;

          if (prevX + ball.radius <= b.x || prevX - ball.radius >= b.x + b.width) {
            ball.dx = -ball.dx;
          } else {
            ball.dy = -ball.dy;
          }

          b.hits--;
          soundHitBrick(b.hits);
          spawnParticles(ball.x, ball.y, b.color, 8);

          if (b.hits <= 0) {
            b.alive = false;
            combo = Math.min(combo + 1, 8);
            comboTimer = 2.4;
            score += b.points * combo;

            if (b.type === 'explosive') {
              triggerExplosion(b);
            } else {
              dropPowerUp(b.x + b.width / 2, b.y + b.height / 2);
            }
          }
          updateHUD();
        }
      });
    });

    // Check bottom boundary for lost balls
    for (let i = balls.length - 1; i >= 0; i--) {
      if (balls[i].y - balls[i].radius > HEIGHT) {
        if (paddle.safetyNet) {
          paddle.safetyNet = false;
          balls[i].dy = -Math.abs(balls[i].dy);
          balls[i].y = HEIGHT - 20;
          soundHitPaddle();
        } else {
          balls.splice(i, 1);
        }
      }
    }

    // All balls lost
    if (balls.length === 0) {
      lives--;
      soundLoseLife();
      updateHUD();

      if (lives <= 0) {
        gameState = 'gameover';
        finalScoreEl.textContent = score;
        gameOverOverlay.classList.add('active');
      } else {
        resetBallAndPaddle();
      }
    }

    // Update PowerUps
    powerUps.forEach(p => {
      p.update(dt);
      if (
        p.y + p.height / 2 >= paddle.y &&
        p.y - p.height / 2 <= paddle.y + paddle.height &&
        p.x >= paddle.x &&
        p.x <= paddle.x + paddle.width
      ) {
        applyPowerUp(p.type);
        p.y = HEIGHT + 200; // consumed
      }
    });
    powerUps = powerUps.filter(p => p.y < HEIGHT + 50);

    // Update Particles
    particles.forEach(pt => pt.update(dt));
    particles = particles.filter(pt => pt.alpha > 0);

    // Check Victory
    const aliveCount = bricks.filter(b => b.alive).length;
    if (aliveCount === 0 && bricks.length > 0 && gameState === 'playing') {
      gameState = 'victory';
      victoryScoreEl.textContent = score;
      btnNextLevel.textContent = `Advance to Level ${level + 1} →`;
      victoryOverlay.classList.add('active');
    }
  }

  function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Cyber Arena Background Grid Lines
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 245, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < WIDTH; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < HEIGHT; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(WIDTH, y);
      ctx.stroke();
    }
    ctx.restore();

    // Draw Safety Net Barrier
    if (paddle.safetyNet) {
      ctx.save();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(0, HEIGHT - 6);
      ctx.lineTo(WIDTH, HEIGHT - 6);
      ctx.stroke();
      ctx.restore();
    }

    // Draw Bricks
    bricks.forEach(b => {
      if (!b.alive) return;
      ctx.save();
      ctx.shadowColor = b.color;
      ctx.shadowBlur = b.hits === b.maxHits ? 10 : 4;
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, b.width, b.height, 5);
      ctx.fill();

      // Damaged overlay
      if (b.hits < b.maxHits) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fill();
      }

      // Border highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    });

    // Draw Paddle
    ctx.save();
    ctx.shadowColor = paddle.laserEquipped ? '#f43f5e' : '#00f5ff';
    ctx.shadowBlur = 16;
    const grad = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x + paddle.width, paddle.y);
    grad.addColorStop(0, '#00f5ff');
    grad.addColorStop(0.5, '#38bdf8');
    grad.addColorStop(1, paddle.laserEquipped ? '#f43f5e' : '#ec4899');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 7);
    ctx.fill();

    // Laser cannons indicator
    if (paddle.laserEquipped) {
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(paddle.x + 4, paddle.y - 5, 8, 6);
      ctx.fillRect(paddle.x + paddle.width - 12, paddle.y - 5, 8, 6);
    }
    ctx.restore();

    // Draw Lasers
    lasers.forEach(l => {
      ctx.save();
      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 10;
      ctx.fillRect(l.x - 2, l.y, 4, 14);
      ctx.restore();
    });

    // Draw Balls
    balls.forEach(ball => ball.draw());

    // Draw PowerUps
    powerUps.forEach(p => p.draw());

    // Draw Particles
    particles.forEach(pt => pt.draw());
  }

  // Button Listeners
  btnStart.addEventListener('click', startNewGame);
  btnRestart.addEventListener('click', startNewGame);
  btnNextLevel.addEventListener('click', advanceNextLevel);

  btnSound.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    iconSoundOn.classList.toggle('hidden', !soundEnabled);
    iconSoundOff.classList.toggle('hidden', soundEnabled);
    if (soundEnabled) initAudio();
  });

  btnHelp.addEventListener('click', () => {
    helpModal.classList.add('active');
  });

  btnCloseHelp.addEventListener('click', () => {
    helpModal.classList.remove('active');
  });

  helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) helpModal.classList.remove('active');
  });

  // Start Animation Loop
  requestAnimationFrame(gameLoop);
})();
