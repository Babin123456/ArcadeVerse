/**
 * Cursed Island: Halloween Survival
 * Pure Vanilla JavaScript & HTML5 Canvas Top-Down Survival
 * Author: Debasmita Bose (DebasmitaBose0)
 */

(() => {
  'use strict';

  // --- Procedural Web Audio Sound Engine ---
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.muted = false;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playShoot() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(480, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    }

    playHit() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.18);
    }

    playPickup() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(783.99, this.ctx.currentTime + 0.14);
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.14);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.14);
    }

    playFuel() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(550, this.ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    }

    playBloodMoonAlarm() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.8);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.8);
    }

    playGameOver() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, this.ctx.currentTime + 1.2);
      gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 1.2);
    }
  }

  const sound = new SoundEngine();

  // --- Canvas & DOM Setup ---
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const hpBarFill = document.getElementById('hpBarFill');
  const bonfireBarFill = document.getElementById('bonfireBarFill');
  const resWood = document.getElementById('resWood');
  const resEmbers = document.getElementById('resEmbers');
  const waveCount = document.getElementById('waveCount');
  const cyclePhaseText = document.getElementById('cyclePhaseText');
  const cycleBarFill = document.getElementById('cycleBarFill');

  // Modals
  const modalHelp = document.getElementById('modalHelp');
  const modalGameOver = document.getElementById('modalGameOver');
  const statNights = document.getElementById('statNights');
  const statSlain = document.getElementById('statSlain');
  const statScore = document.getElementById('statScore');
  const goTitle = document.getElementById('goTitle');
  const goMessage = document.getElementById('goMessage');

  // Island Dimensions & Center Bonfire
  const ISLAND_CX = 480;
  const ISLAND_CY = 290;
  const ISLAND_RX = 420;
  const ISLAND_RY = 240;

  // --- Game State ---
  const state = {
    running: true,
    nightNumber: 1,
    cycleTimer: 0,
    cyclePhase: 'twilight', // 'twilight' or 'bloodmoon'
    phaseDuration: 28, // seconds per phase
    score: 0,
    slainCount: 0,

    player: {
      x: ISLAND_CX,
      y: ISLAND_CY + 80,
      vx: 0,
      vy: 0,
      speed: 3.4,
      radius: 16,
      hp: 100,
      maxHp: 100,
      angle: -Math.PI / 2,
      wood: 4,
      embers: 2
    },

    bonfire: {
      x: ISLAND_CX,
      y: ISLAND_CY,
      fuel: 100, // 0 to 100
      maxFuel: 100,
      radius: 22
    },

    resources: [], // { type: 'wood'|'ember', x, y, radius }
    projectiles: [], // { x, y, vx, vy, radius, life }
    enemies: [], // { type, x, y, hp, maxHp, speed, radius, attackCooldown }
    wards: [], // { x, y, radius, damage, life }
    particles: [], // visual sparks

    keys: {
      up: false,
      down: false,
      left: false,
      right: false
    }
  };

  // --- Input Listeners ---
  window.addEventListener('keydown', e => {
    sound.init();
    const k = e.key.toLowerCase();
    if (k === 'w' || k === 'arrowup') state.keys.up = true;
    if (k === 's' || k === 'arrowdown') state.keys.down = true;
    if (k === 'a' || k === 'arrowleft') state.keys.left = true;
    if (k === 'd' || k === 'arrowright') state.keys.right = true;
    if (e.code === 'Space') {
      e.preventDefault();
      fireProjectile();
    }
    if (k === 'f') {
      feedBonfire();
    }
    if (k === 'e') {
      placeWard();
    }
  });

  window.addEventListener('keyup', e => {
    const k = e.key.toLowerCase();
    if (k === 'w' || k === 'arrowup') state.keys.up = false;
    if (k === 's' || k === 'arrowdown') state.keys.down = false;
    if (k === 'a' || k === 'arrowleft') state.keys.left = false;
    if (k === 'd' || k === 'arrowright') state.keys.right = false;
  });

  // Mobile Touch Controls
  const bindTouch = (id, onDown, onUp) => {
    const el = document.getElementById(id);
    if (!el) return;
    const start = e => {
      e.preventDefault();
      sound.init();
      onDown();
    };
    const end = e => {
      e.preventDefault();
      if (onUp) onUp();
    };
    el.addEventListener('touchstart', start, { passive: false });
    el.addEventListener('touchend', end, { passive: false });
    el.addEventListener('mousedown', start);
    el.addEventListener('mouseup', end);
  };

  bindTouch('btnUp', () => { state.keys.up = true; }, () => { state.keys.up = false; });
  bindTouch('btnDown', () => { state.keys.down = true; }, () => { state.keys.down = false; });
  bindTouch('btnLeft', () => { state.keys.left = true; }, () => { state.keys.left = false; });
  bindTouch('btnRight', () => { state.keys.right = true; }, () => { state.keys.right = false; });
  bindTouch('btnAttack', () => { fireProjectile(); });
  bindTouch('btnFuel', () => { feedBonfire(); });
  bindTouch('btnWard', () => { placeWard(); });

  // Action: Fire projectile (Jack-o'-Lantern Fireball)
  function fireProjectile() {
    if (!state.running) return;
    const p = state.player;
    sound.playShoot();
    const speed = 7.5;
    state.projectiles.push({
      x: p.x + Math.cos(p.angle) * p.radius,
      y: p.y + Math.sin(p.angle) * p.radius,
      vx: Math.cos(p.angle) * speed,
      vy: Math.sin(p.angle) * speed,
      radius: 7,
      life: 65
    });
  }

  // Action: Feed Bonfire
  function feedBonfire() {
    if (!state.running) return;
    const p = state.player;
    const distToBonfire = Math.hypot(p.x - state.bonfire.x, p.y - state.bonfire.y);
    if (distToBonfire <= 110) {
      if (p.wood >= 2) {
        p.wood -= 2;
        state.bonfire.fuel = Math.min(100, state.bonfire.fuel + 35);
        state.score += 50;
        sound.playFuel();
        createSparkParticles(state.bonfire.x, state.bonfire.y, 25, '#ff9900');
      }
    }
  }

  // Action: Place Ward
  function placeWard() {
    if (!state.running) return;
    const p = state.player;
    if (p.embers >= 2) {
      p.embers -= 2;
      sound.playPickup();
      state.wards.push({
        x: p.x,
        y: p.y,
        radius: 20,
        damage: 80,
        life: 600
      });
      createSparkParticles(p.x, p.y, 15, '#00f2fe');
    }
  }

  // Spawn random resource
  function spawnResource() {
    if (state.resources.length >= 16) return;
    // Generate inside island bounds
    const angle = Math.random() * Math.PI * 2;
    const dist = 60 + Math.random() * (ISLAND_RY - 80);
    const rx = ISLAND_CX + Math.cos(angle) * (dist * (ISLAND_RX / ISLAND_RY));
    const ry = ISLAND_CY + Math.sin(angle) * dist;

    const type = Math.random() > 0.4 ? 'wood' : 'ember';
    state.resources.push({
      type,
      x: rx,
      y: ry,
      radius: 12
    });
  }

  // Spawn monster
  function spawnMonster() {
    if (!state.running || state.cyclePhase !== 'bloodmoon') return;
    // Spawn from perimeter water
    const angle = Math.random() * Math.PI * 2;
    const mx = ISLAND_CX + Math.cos(angle) * (ISLAND_RX + 20);
    const my = ISLAND_CY + Math.sin(angle) * (ISLAND_RY + 20);

    const typeRoll = Math.random();
    let type = 'scarecrow';
    let hp = 40 + state.nightNumber * 10;
    let speed = 1.2 + Math.random() * 0.4;
    let radius = 16;

    if (typeRoll > 0.65) {
      type = 'bat';
      hp = 25 + state.nightNumber * 6;
      speed = 2.4 + Math.random() * 0.5;
      radius = 12;
    } else if (typeRoll > 0.4) {
      type = 'phantom';
      hp = 35 + state.nightNumber * 8;
      speed = 1.6;
      radius = 14;
    }

    state.enemies.push({
      type,
      x: mx,
      y: my,
      hp,
      maxHp: hp,
      speed,
      radius,
      attackCooldown: 0
    });
  }

  function createSparkParticles(x, y, count, color) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 1 + Math.random() * 3;
      state.particles.push({
        x,
        y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        color,
        radius: 2 + Math.random() * 3,
        life: 25 + Math.random() * 15
      });
    }
  }

  // --- Initial Resource Fill ---
  for (let i = 0; i < 9; i++) spawnResource();

  // --- Main Game Update Loop (60 FPS) ---
  let lastTime = performance.now();

  function update(delta) {
    if (!state.running) return;

    // 1. Day / Night Cycle Timer
    state.cycleTimer += delta;
    if (state.cycleTimer >= state.phaseDuration) {
      state.cycleTimer = 0;
      if (state.cyclePhase === 'twilight') {
        state.cyclePhase = 'bloodmoon';
        sound.playBloodMoonAlarm();
        cyclePhaseText.textContent = `Night ${state.nightNumber} - Blood Moon Siege!`;
      } else {
        state.cyclePhase = 'twilight';
        state.nightNumber++;
        state.score += 200;
        waveCount.textContent = state.nightNumber;
        cyclePhaseText.textContent = `Twilight Phase (Gathering)`;
        // Replenish resources on new day
        for (let i = 0; i < 6; i++) spawnResource();
      }
    }

    const phasePct = Math.max(0, 100 - (state.cycleTimer / state.phaseDuration) * 100);
    cycleBarFill.style.width = `${phasePct}%`;

    // 2. Bonfire Fuel Decay
    const fuelDecayRate = state.cyclePhase === 'bloodmoon' ? 2.5 : 1.2;
    state.bonfire.fuel = Math.max(0, state.bonfire.fuel - fuelDecayRate * delta);
    bonfireBarFill.style.width = `${state.bonfire.fuel}%`;

    // If bonfire is dead, darkness damages player!
    if (state.bonfire.fuel <= 0) {
      state.player.hp -= 14 * delta;
    }

    // 3. Player Movement & Angle
    const p = state.player;
    let dx = 0;
    let dy = 0;
    if (state.keys.up) dy -= 1;
    if (state.keys.down) dy += 1;
    if (state.keys.left) dx -= 1;
    if (state.keys.right) dx += 1;

    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }

    if (dx !== 0 || dy !== 0) {
      p.angle = Math.atan2(dy, dx);
    }

    p.x += dx * p.speed;
    p.y += dy * p.speed;

    // Constrain player inside island ellipse
    const normX = (p.x - ISLAND_CX) / (ISLAND_RX - 25);
    const normY = (p.y - ISLAND_CY) / (ISLAND_RY - 25);
    if (normX * normX + normY * normY > 1) {
      const a = Math.atan2(p.y - ISLAND_CY, (p.x - ISLAND_CX) * (ISLAND_RY / ISLAND_RX));
      p.x = ISLAND_CX + Math.cos(a) * (ISLAND_RX - 25);
      p.y = ISLAND_CY + Math.sin(a) * (ISLAND_RY - 25);
    }

    // 4. Resource Pickups
    for (let i = state.resources.length - 1; i >= 0; i--) {
      const r = state.resources[i];
      if (Math.hypot(p.x - r.x, p.y - r.y) < p.radius + r.radius) {
        sound.playPickup();
        if (r.type === 'wood') {
          p.wood++;
          createSparkParticles(r.x, r.y, 8, '#cfa870');
        } else {
          p.embers++;
          createSparkParticles(r.x, r.y, 8, '#00f2fe');
        }
        state.score += 15;
        state.resources.splice(i, 1);
      }
    }

    // Periodic Resource Spawning during twilight
    if (state.cyclePhase === 'twilight' && Math.random() < 0.02) {
      spawnResource();
    }

    // 5. Monster Spawning during Blood Moon
    if (state.cyclePhase === 'bloodmoon') {
      const spawnRate = 0.035 + state.nightNumber * 0.008;
      if (Math.random() < spawnRate && state.enemies.length < 18 + state.nightNumber * 2) {
        spawnMonster();
      }
    }

    // 6. Update Projectiles
    for (let i = state.projectiles.length - 1; i >= 0; i--) {
      const proj = state.projectiles[i];
      proj.x += proj.vx;
      proj.y += proj.vy;
      proj.life--;

      // Check collision with enemies
      let hit = false;
      for (let j = state.enemies.length - 1; j >= 0; j--) {
        const en = state.enemies[j];
        if (Math.hypot(proj.x - en.x, proj.y - en.y) < proj.radius + en.radius) {
          en.hp -= 35;
          sound.playHit();
          createSparkParticles(proj.x, proj.y, 10, '#ff7700');
          hit = true;
          if (en.hp <= 0) {
            state.score += 40;
            state.slainCount++;
            createSparkParticles(en.x, en.y, 18, '#ff2a55');
            // Chance to drop soul ember
            if (Math.random() < 0.35) {
              state.resources.push({ type: 'ember', x: en.x, y: en.y, radius: 12 });
            }
            state.enemies.splice(j, 1);
          }
          break;
        }
      }

      if (hit || proj.life <= 0) {
        state.projectiles.splice(i, 1);
      }
    }

    // 7. Update Wards
    for (let i = state.wards.length - 1; i >= 0; i--) {
      const ward = state.wards[i];
      ward.life--;
      // Check if monster trips ward
      for (let j = state.enemies.length - 1; j >= 0; j--) {
        const en = state.enemies[j];
        if (Math.hypot(ward.x - en.x, ward.y - en.y) < ward.radius + en.radius) {
          sound.playHit();
          createSparkParticles(ward.x, ward.y, 30, '#00f2fe');
          // AoE Blast
          state.enemies.forEach(otherEn => {
            if (Math.hypot(ward.x - otherEn.x, ward.y - otherEn.y) < 70) {
              otherEn.hp -= ward.damage;
            }
          });
          ward.life = 0;
          break;
        }
      }
      if (ward.life <= 0) {
        state.wards.splice(i, 1);
      }
    }

    // 8. Update Enemies AI
    for (let i = state.enemies.length - 1; i >= 0; i--) {
      const en = state.enemies[i];
      en.attackCooldown = Math.max(0, en.attackCooldown - delta);

      // Target selection: player or bonfire (whichever is closer)
      const distToPlayer = Math.hypot(p.x - en.x, p.y - en.y);
      const distToBonfire = Math.hypot(state.bonfire.x - en.x, state.bonfire.y - en.y);

      let targetX = p.x;
      let targetY = p.y;
      if (distToBonfire < distToPlayer) {
        targetX = state.bonfire.x;
        targetY = state.bonfire.y;
      }

      const angle = Math.atan2(targetY - en.y, targetX - en.x);
      en.x += Math.cos(angle) * en.speed;
      en.y += Math.sin(angle) * en.speed;

      // Attack Player
      if (distToPlayer < p.radius + en.radius && en.attackCooldown <= 0) {
        p.hp -= 16;
        en.attackCooldown = 0.8;
        sound.playHit();
        createSparkParticles(p.x, p.y, 10, '#ff2a55');
      }

      // Attack Bonfire
      if (distToBonfire < state.bonfire.radius + en.radius && en.attackCooldown <= 0) {
        state.bonfire.fuel = Math.max(0, state.bonfire.fuel - 8);
        en.attackCooldown = 0.8;
        sound.playHit();
        createSparkParticles(state.bonfire.x, state.bonfire.y, 12, '#ffaa32');
      }
    }

    // 9. Update Particles
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const pt = state.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) {
        state.particles.splice(i, 1);
      }
    }

    // 10. Sync HUD UI
    hpBarFill.style.width = `${Math.max(0, p.hp)}%`;
    resWood.textContent = p.wood;
    resEmbers.textContent = p.embers;

    // Check Death / Game Over
    if (p.hp <= 0) {
      gameOver();
    }
  }

  function gameOver() {
    state.running = false;
    sound.playGameOver();
    statNights.textContent = state.nightNumber;
    statSlain.textContent = state.slainCount;
    statScore.textContent = state.score;
    if (state.bonfire.fuel <= 0) {
      goTitle.textContent = 'BONFIRE EXTINGUISHED';
      goMessage.textContent = 'Without the sacred pumpkin flame, the night mist consumed your soul.';
    } else {
      goTitle.textContent = 'FALLEN TO THE SWARM';
      goMessage.textContent = 'The blood moon horrors overwhelmed your defenses on Halloween night.';
    }
    modalGameOver.classList.add('open');
  }

  // --- Rendering Loop (Canvas) ---
  function render(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;

    // 1. Draw Surrounding Dark Ocean with Animated Mist & Waves
    const oceanGrad = ctx.createRadialGradient(ISLAND_CX, ISLAND_CY, 200, ISLAND_CX, ISLAND_CY, 550);
    if (state.cyclePhase === 'bloodmoon') {
      oceanGrad.addColorStop(0, '#2a0815');
      oceanGrad.addColorStop(1, '#080104');
    } else {
      oceanGrad.addColorStop(0, '#150926');
      oceanGrad.addColorStop(1, '#05020c');
    }
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, w, h);

    // Ocean ripples
    ctx.strokeStyle = state.cyclePhase === 'bloodmoon' ? 'rgba(255, 42, 85, 0.15)' : 'rgba(0, 242, 254, 0.12)';
    ctx.lineWidth = 1.5;
    for (let r = 240; r <= 520; r += 45) {
      ctx.beginPath();
      ctx.ellipse(ISLAND_CX, ISLAND_CY, r * (ISLAND_RX / ISLAND_RY), r, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 2. Draw Cursed Island Landmass
    ctx.fillStyle = state.cyclePhase === 'bloodmoon' ? '#24101c' : '#1c112b';
    ctx.beginPath();
    ctx.ellipse(ISLAND_CX, ISLAND_CY, ISLAND_RX, ISLAND_RY, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = state.cyclePhase === 'bloodmoon' ? '#5a1c2f' : '#4a256b';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Sandy Shoreline Ring
    ctx.strokeStyle = 'rgba(150, 100, 60, 0.25)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.ellipse(ISLAND_CX, ISLAND_CY, ISLAND_RX - 8, ISLAND_RY - 8, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 3. Draw Resources on Ground
    state.resources.forEach(res => {
      if (res.type === 'wood') {
        // Wood log
        ctx.fillStyle = '#9b7140';
        ctx.fillRect(res.x - 10, res.y - 4, 20, 8);
        ctx.fillStyle = '#5c3a16';
        ctx.fillRect(res.x - 7, res.y - 2, 14, 4);
      } else {
        // Soul Ember
        const eGlow = ctx.createRadialGradient(res.x, res.y, 2, res.x, res.y, 14);
        eGlow.addColorStop(0, '#00f2fe');
        eGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = eGlow;
        ctx.beginPath();
        ctx.arc(res.x, res.y, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#e0ffff';
        ctx.beginPath();
        ctx.arc(res.x, res.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 4. Draw Wards
    state.wards.forEach(w => {
      ctx.fillStyle = '#ff7700';
      ctx.beginPath();
      ctx.arc(w.x, w.y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // 5. Draw Central Hallowed Pumpkin Bonfire
    const bf = state.bonfire;
    const flameIntensity = bf.fuel / 100;
    const lightRadius = 120 + flameIntensity * 240;

    // Bonfire Radial Glow / Protective Light Area
    const bfGlow = ctx.createRadialGradient(bf.x, bf.y, 10, bf.x, bf.y, lightRadius);
    bfGlow.addColorStop(0, 'rgba(255, 140, 0, 0.45)');
    bfGlow.addColorStop(0.6, 'rgba(255, 80, 0, 0.15)');
    bfGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = bfGlow;
    ctx.beginPath();
    ctx.arc(bf.x, bf.y, lightRadius, 0, Math.PI * 2);
    ctx.fill();

    // Bonfire Pumpkin Altar Base
    ctx.fillStyle = '#1c0c28';
    ctx.beginPath();
    ctx.arc(bf.x, bf.y, bf.radius + 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#6e3599';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Great Carved Jack-o'-Lantern at Center
    ctx.fillStyle = '#ff7700';
    ctx.beginPath();
    ctx.arc(bf.x, bf.y, bf.radius, 0, Math.PI * 2);
    ctx.fill();

    // Jack-o-Lantern Carved Face
    ctx.fillStyle = '#fff4cc';
    // Eyes
    ctx.beginPath();
    ctx.moveTo(bf.x - 10, bf.y - 6);
    ctx.lineTo(bf.x - 4, bf.y - 2);
    ctx.lineTo(bf.x - 10, bf.y + 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(bf.x + 10, bf.y - 6);
    ctx.lineTo(bf.x + 4, bf.y - 2);
    ctx.lineTo(bf.x + 10, bf.y + 2);
    ctx.fill();
    // Jagged grin
    ctx.beginPath();
    ctx.arc(bf.x, bf.y + 6, 8, 0, Math.PI);
    ctx.fill();

    // Bonfire Flame Tongue
    const flameH = 14 + Math.sin(time / 100) * 6;
    ctx.fillStyle = '#ffbb00';
    ctx.beginPath();
    ctx.moveTo(bf.x - 8, bf.y - 12);
    ctx.quadraticCurveTo(bf.x, bf.y - 20 - flameH, bf.x + 8, bf.y - 12);
    ctx.fill();

    // 6. Draw Enemies
    state.enemies.forEach(en => {
      ctx.save();
      ctx.translate(en.x, en.y);

      if (en.type === 'scarecrow') {
        // Scarecrow
        ctx.fillStyle = '#5c4832';
        ctx.fillRect(-6, -14, 12, 28);
        ctx.fillStyle = '#9b8259';
        ctx.beginPath();
        ctx.arc(0, -14, 8, 0, Math.PI * 2);
        ctx.fill();
        // Glowing red eyes
        ctx.fillStyle = '#ff2a55';
        ctx.fillRect(-3, -16, 2, 2);
        ctx.fillRect(1, -16, 2, 2);
      } else if (en.type === 'bat') {
        // Shadow Bat
        ctx.fillStyle = '#220b33';
        const wingFlap = Math.sin(time / 80) * 10;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-14, wingFlap);
        ctx.lineTo(0, -6);
        ctx.lineTo(14, wingFlap);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ff2a55';
        ctx.beginPath();
        ctx.arc(0, -2, 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Phantom
        ctx.fillStyle = 'rgba(157, 78, 221, 0.75)';
        ctx.beginPath();
        ctx.arc(0, 0, en.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#00f2fe';
        ctx.beginPath();
        ctx.arc(-3, -2, 2, 0, Math.PI * 2);
        ctx.arc(3, -2, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // HP Bar above enemy
      if (en.hp < en.maxHp) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(-12, -26, 24, 4);
        ctx.fillStyle = '#ff2a55';
        ctx.fillRect(-12, -26, (en.hp / en.maxHp) * 24, 4);
      }

      ctx.restore();
    });

    // 7. Draw Player
    const p = state.player;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);

    // Player Cloak & Body
    ctx.fillStyle = '#6a1b9a';
    ctx.beginPath();
    ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#9d4edd';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Survivor Hat / Hood
    ctx.fillStyle = '#31144a';
    ctx.beginPath();
    ctx.arc(0, 0, p.radius * 0.65, 0, Math.PI * 2);
    ctx.fill();

    // Lantern in hand
    ctx.fillStyle = '#ffaa32';
    ctx.beginPath();
    ctx.arc(p.radius * 0.8, p.radius * 0.7, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // 8. Draw Projectiles
    state.projectiles.forEach(pr => {
      ctx.fillStyle = '#ffaa32';
      ctx.beginPath();
      ctx.arc(pr.x, pr.y, pr.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff3300';
      ctx.beginPath();
      ctx.arc(pr.x, pr.y, pr.radius * 0.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // 9. Draw Particles
    state.particles.forEach(pt => {
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // 10. Blood Moon Sky / Vignette Atmosphere
    if (state.cyclePhase === 'bloodmoon') {
      const moonVignette = ctx.createRadialGradient(ISLAND_CX, ISLAND_CY, 100, ISLAND_CX, ISLAND_CY, 500);
      moonVignette.addColorStop(0, 'rgba(255, 30, 60, 0.08)');
      moonVignette.addColorStop(1, 'rgba(120, 10, 30, 0.45)');
      ctx.fillStyle = moonVignette;
      ctx.fillRect(0, 0, w, h);
    }
  }

  // --- Main Animation Loop ---
  function loop(currentTime) {
    const delta = Math.min(0.1, (currentTime - lastTime) / 1000);
    lastTime = currentTime;

    update(delta);
    render(currentTime);

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // --- Header / Modal Control Handlers ---
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-close');
      const el = document.getElementById(id);
      if (el) el.classList.remove('open');
    });
  });

  document.getElementById('helpBtn').addEventListener('click', () => {
    sound.init();
    modalHelp.classList.add('open');
  });

  const soundToggle = document.getElementById('soundToggle');
  const soundIcon = document.getElementById('soundIcon');
  soundToggle.addEventListener('click', () => {
    sound.muted = !sound.muted;
    if (sound.muted) {
      soundIcon.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>';
    } else {
      sound.init();
      soundIcon.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>';
    }
  });

  document.getElementById('restartBtn').addEventListener('click', () => {
    window.location.reload();
  });
})();
