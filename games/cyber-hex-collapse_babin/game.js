/**
 * Cyber Hex Collapse
 * Hexagonal Perimeter Match-3 Arcade
 * Author: Babin Bid (@Babin123456)
 * Open Source for ArcadeVerse
 */

(() => {
  'use strict';

  // DOM Elements
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const levelDisplay = document.getElementById('level-display');
  const scoreDisplay = document.getElementById('score-display');
  const bestDisplay = document.getElementById('best-display');
  const comboDisplay = document.getElementById('combo-display');
  const startOverlay = document.getElementById('start-overlay');
  const gameoverOverlay = document.getElementById('gameover-overlay');
  const instructionsModal = document.getElementById('instructions-modal');
  const startBtn = document.getElementById('start-btn');
  const restartBtn = document.getElementById('restart-btn');
  const helpBtn = document.getElementById('help-btn');
  const closeHelpBtn = document.getElementById('close-help-btn');
  const soundBtn = document.getElementById('sound-btn');
  const soundIconOn = document.getElementById('sound-icon-on');
  const soundIconOff = document.getElementById('sound-icon-off');
  const rotLeftBtn = document.getElementById('rot-left-btn');
  const rotRightBtn = document.getElementById('rot-right-btn');
  const finalScore = document.getElementById('final-score');
  const finalLines = document.getElementById('final-lines');
  const finalCombo = document.getElementById('final-combo');

  // Audio Synthesizer via Web Audio API
  let audioCtx = null;
  let soundEnabled = localStorage.getItem('cyber-hex-sound') !== 'false';

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function updateSoundUI() {
    if (soundEnabled) {
      soundIconOn.classList.remove('hidden');
      soundIconOff.classList.add('hidden');
      soundBtn.setAttribute('aria-label', 'Mute Sound');
    } else {
      soundIconOn.classList.add('hidden');
      soundIconOff.classList.remove('hidden');
      soundBtn.setAttribute('aria-label', 'Unmute Sound');
    }
  }

  function playSound(type) {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const now = audioCtx.currentTime;

      if (type === 'rotate') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(560, now + 0.05);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'land') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.06);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'clear') {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);
          gain.gain.setValueAtTime(0.16, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.22);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.22);
        });
      } else if (type === 'gameover') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.45);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.48);
      }
    } catch (_) {}
  }

  // Hexagon Constants & Palette
  const CENTER_X = canvas.width / 2;
  const CENTER_Y = canvas.height / 2;
  const HEX_RADIUS = 50;
  const BLOCK_THICKNESS = 16;
  const MAX_STACK = 7;
  const SPAWN_RADIUS = 220;

  const COLORS = [
    { id: 0, name: 'cyan', fill: '#00f0ff', stroke: '#33f3ff' },
    { id: 1, name: 'magenta', fill: '#ff0077', stroke: '#ff3388' },
    { id: 2, name: 'yellow', fill: '#ffe600', stroke: '#ffea33' },
    { id: 3, name: 'green', fill: '#00ff88', stroke: '#33ffaa' }
  ];

  let gameState = 'ready'; // ready, playing, gameover
  let score = 0;
  let bestScore = parseInt(localStorage.getItem('cyber-hex-best') || '0', 10);
  let level = 1;
  let combo = 0;
  let maxCombo = 0;
  let linesCleared = 0;

  // Stacks on each of the 6 sides (0 to 5)
  // stacks[side] = [colorId, colorId, ...]
  let stacks = [[], [], [], [], [], []];

  // Incoming falling blocks
  let fallingBlocks = [];
  let hexRotation = 0; // Current rendered angle
  let targetRotation = 0; // Target snapped angle (steps of PI/3)
  let spawnTimer = 0;
  let particles = [];

  function resetGame() {
    score = 0;
    level = 1;
    combo = 0;
    maxCombo = 0;
    linesCleared = 0;
    stacks = [[], [], [], [], [], []];
    fallingBlocks = [];
    particles = [];
    hexRotation = 0;
    targetRotation = 0;
    spawnTimer = 0;

    gameState = 'playing';
    startOverlay.classList.add('hidden');
    gameoverOverlay.classList.add('hidden');
    updateHUD();
  }

  function rotateHex(direction) {
    if (gameState !== 'playing') return;
    targetRotation += direction * (Math.PI / 3);
    playSound('rotate');
  }

  function spawnBlock() {
    const side = Math.floor(Math.random() * 6);
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const speed = 1.35 + Math.min(2.2, level * 0.16);

    fallingBlocks.push({
      side,
      color,
      dist: SPAWN_RADIUS,
      speed
    });
  }

  function checkMatches() {
    let matchedAny = false;

    // Check vertical 3+ matches in each stack
    for (let s = 0; s < 6; s++) {
      const stack = stacks[s];
      if (stack.length < 3) continue;

      let runColor = stack[0];
      let runCount = 1;

      for (let i = 1; i < stack.length; i++) {
        if (stack[i] === runColor) {
          runCount++;
          if (runCount >= 3) {
            // Remove matched blocks
            const removeStart = i - runCount + 1;
            stack.splice(removeStart, runCount);
            matchedAny = true;
            linesCleared++;
            combo++;
            maxCombo = Math.max(maxCombo, combo);
            score += runCount * 50 * combo;
            playSound('clear');
            spawnExplosionSparks(s, removeStart);
            break;
          }
        } else {
          runColor = stack[i];
          runCount = 1;
        }
      }
    }

    // Check horizontal ring matches (adjacent facets with same color at same tier)
    for (let tier = 0; tier < MAX_STACK; tier++) {
      for (let s = 0; s < 6; s++) {
        const s1 = s;
        const s2 = (s + 1) % 6;
        const s3 = (s + 2) % 6;

        if (stacks[s1][tier] !== undefined &&
            stacks[s1][tier] === stacks[s2][tier] &&
            stacks[s2][tier] === stacks[s3][tier]) {

          delete stacks[s1][tier];
          delete stacks[s2][tier];
          delete stacks[s3][tier];

          // Compact stacks
          stacks[s1] = stacks[s1].filter(v => v !== undefined);
          stacks[s2] = stacks[s2].filter(v => v !== undefined);
          stacks[s3] = stacks[s3].filter(v => v !== undefined);

          matchedAny = true;
          linesCleared++;
          combo++;
          maxCombo = Math.max(maxCombo, combo);
          score += 180 * combo;
          playSound('clear');
          break;
        }
      }
    }

    if (matchedAny) {
      updateHUD();
      // Recurse to handle cascades
      setTimeout(checkMatches, 160);
    } else {
      combo = 0;
      updateHUD();
    }
  }

  function spawnExplosionSparks(side, tier) {
    const angle = hexRotation + side * (Math.PI / 3) + Math.PI / 6;
    const r = HEX_RADIUS + (tier + 0.5) * BLOCK_THICKNESS;
    const cx = CENTER_X + Math.cos(angle) * r;
    const cy = CENTER_Y + Math.sin(angle) * r;

    for (let i = 0; i < 20; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = Math.random() * 4 + 1.5;
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        color: '#00f0ff',
        alpha: 1,
        decay: Math.random() * 0.04 + 0.02
      });
    }
  }

  function triggerGameOver() {
    gameState = 'gameover';
    playSound('gameover');
    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem('cyber-hex-best', bestScore.toString());
    }
    updateHUD();

    finalScore.textContent = score;
    finalLines.textContent = linesCleared;
    finalCombo.textContent = `${maxCombo}x`;
    gameoverOverlay.classList.remove('hidden');
  }

  function update() {
    if (gameState !== 'playing') return;

    // Smooth hexagon rotation interpolation
    hexRotation += (targetRotation - hexRotation) * 0.28;

    // Level progression
    level = 1 + Math.floor(score / 500);

    // Spawn blocks
    spawnTimer++;
    const spawnRate = Math.max(45, 95 - level * 5);
    if (spawnTimer >= spawnRate) {
      spawnTimer = 0;
      spawnBlock();
    }

    // Update falling blocks
    for (let i = fallingBlocks.length - 1; i >= 0; i--) {
      const b = fallingBlocks[i];
      b.dist -= b.speed;

      // Find relative side taking hexagon rotation into account
      // Standardize angle
      let effectiveSide = Math.round((b.side - (targetRotation / (Math.PI / 3))) % 6);
      if (effectiveSide < 0) effectiveSide += 6;

      const currentStackHeight = stacks[effectiveSide].length;
      const landDistance = HEX_RADIUS + currentStackHeight * BLOCK_THICKNESS;

      if (b.dist <= landDistance) {
        // Block lands on the facet
        if (currentStackHeight >= MAX_STACK) {
          triggerGameOver();
          return;
        }

        stacks[effectiveSide].push(b.color.id);
        fallingBlocks.splice(i, 1);
        playSound('land');
        score += 10;
        updateHUD();
        checkMatches();
      }
    }

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      if (p.alpha <= 0) particles.splice(i, 1);
    }
  }

  function drawHexagon(x, y, radius, fillColor, strokeColor, lineWidth = 2) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = hexRotation + i * (Math.PI / 3);
      const px = x + Math.cos(a) * radius;
      const py = y + Math.sin(a) * radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    if (fillColor) {
      ctx.fillStyle = fillColor;
      ctx.fill();
    }
    if (strokeColor) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  }

  function drawFacetBlock(side, tier, colorId) {
    const color = COLORS[colorId] || COLORS[0];
    const a1 = hexRotation + side * (Math.PI / 3);
    const a2 = hexRotation + (side + 1) * (Math.PI / 3);

    const rInner = HEX_RADIUS + tier * BLOCK_THICKNESS;
    const rOuter = rInner + BLOCK_THICKNESS - 2;

    ctx.save();
    ctx.fillStyle = color.fill;
    ctx.strokeStyle = color.stroke;
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(CENTER_X + Math.cos(a1) * rInner, CENTER_Y + Math.sin(a1) * rInner);
    ctx.lineTo(CENTER_X + Math.cos(a2) * rInner, CENTER_Y + Math.sin(a2) * rInner);
    ctx.lineTo(CENTER_X + Math.cos(a2) * rOuter, CENTER_Y + Math.sin(a2) * rOuter);
    ctx.lineTo(CENTER_X + Math.cos(a1) * rOuter, CENTER_Y + Math.sin(a1) * rOuter);
    ctx.closePath();

    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Danger Zone Perimeter Ring (Grey dotted)
    const dangerRadius = HEX_RADIUS + MAX_STACK * BLOCK_THICKNESS;
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 0, 119, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.arc(CENTER_X, CENTER_Y, dangerRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Draw Stacks on Hexagon
    for (let s = 0; s < 6; s++) {
      for (let tier = 0; tier < stacks[s].length; tier++) {
        drawFacetBlock(s, tier, stacks[s][tier]);
      }
    }

    // Draw Central Hexagon Core
    drawHexagon(CENTER_X, CENTER_Y, HEX_RADIUS, '#081426', '#00f0ff', 2.5);

    // Inner Core Pulse
    drawHexagon(CENTER_X, CENTER_Y, HEX_RADIUS * 0.45, 'rgba(0, 240, 255, 0.25)', '#00f0ff', 1.5);

    // Draw Falling Blocks
    for (let b of fallingBlocks) {
      const a1 = b.side * (Math.PI / 3);
      const a2 = (b.side + 1) * (Math.PI / 3);
      const rInner = b.dist;
      const rOuter = rInner + BLOCK_THICKNESS - 2;

      ctx.save();
      ctx.fillStyle = b.color.fill;
      ctx.shadowColor = b.color.fill;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(CENTER_X + Math.cos(a1) * rInner, CENTER_Y + Math.sin(a1) * rInner);
      ctx.lineTo(CENTER_X + Math.cos(a2) * rInner, CENTER_Y + Math.sin(a2) * rInner);
      ctx.lineTo(CENTER_X + Math.cos(a2) * rOuter, CENTER_Y + Math.sin(a2) * rOuter);
      ctx.lineTo(CENTER_X + Math.cos(a1) * rOuter, CENTER_Y + Math.sin(a1) * rOuter);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Draw Particles
    for (let p of particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function updateHUD() {
    levelDisplay.textContent = level;
    scoreDisplay.textContent = score;
    bestDisplay.textContent = bestScore;
    comboDisplay.textContent = `${combo}x`;
    if (combo >= 2) {
      comboDisplay.style.color = '#ffe600';
    } else {
      comboDisplay.style.color = 'var(--cyan)';
    }
  }

  function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
  }

  // Keyboard controls
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      rotateHex(-1);
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      rotateHex(1);
    }
  });

  // Mobile Buttons
  rotLeftBtn.addEventListener('click', () => rotateHex(-1));
  rotRightBtn.addEventListener('click', () => rotateHex(1));

  // Canvas Swipe
  let touchStartX = 0;
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) touchStartX = e.touches[0].clientX;
  }, { passive: true });

  canvas.addEventListener('touchend', (e) => {
    if (e.changedTouches.length > 0) {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (dx > 30) rotateHex(1);
      else if (dx < -30) rotateHex(-1);
    }
  }, { passive: true });

  startBtn.addEventListener('click', () => {
    initAudio();
    resetGame();
  });

  restartBtn.addEventListener('click', () => {
    resetGame();
  });

  soundBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem('cyber-hex-sound', soundEnabled.toString());
    updateSoundUI();
    if (soundEnabled) playSound('rotate');
  });

  helpBtn.addEventListener('click', () => {
    instructionsModal.classList.remove('hidden');
  });

  closeHelpBtn.addEventListener('click', () => {
    instructionsModal.classList.add('hidden');
  });

  // Initialize
  updateSoundUI();
  updateHUD();
  gameLoop();
})();
