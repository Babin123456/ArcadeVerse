/**
 * Flappy Cyber Jet Game Engine
 * 100% Vanilla Canvas & Web Audio API
 * Author: Babin Bid (@Babin123456)
 * Event: Nexus Spring of Code – Winter Edition 2026
 */

(function () {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const currentScoreElem = document.getElementById("current-score");
  const highScoreElem = document.getElementById("high-score");
  const finalScoreElem = document.getElementById("final-score");
  const bestScoreElem = document.getElementById("best-score");
  const startOverlay = document.getElementById("start-overlay");
  const gameoverOverlay = document.getElementById("gameover-overlay");
  const startBtn = document.getElementById("start-btn");
  const restartBtn = document.getElementById("restart-btn");
  const soundToggleBtn = document.getElementById("sound-toggle-btn");

  let soundEnabled = true;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  }

  function playTone(freq, type, duration, endFreq) {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type || "sine";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      if (endFreq) {
        osc.frequency.exponentialRampToValueAtTime(endFreq, audioCtx.currentTime + duration);
      }
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  }

  function playThrustSound() {
    playTone(320, "sawtooth", 0.12, 180);
  }

  function playScoreSound() {
    playTone(587.33, "triangle", 0.15, 880);
  }

  function playCrashSound() {
    playTone(160, "sawtooth", 0.35, 40);
  }

  soundToggleBtn.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    soundToggleBtn.textContent = soundEnabled ? "🔊" : "🔇";
    soundToggleBtn.title = soundEnabled ? "Mute Sound" : "Enable Sound";
  });

  // High score in localStorage
  const STORAGE_KEY = "arcadeverse_flappy_jet_highscore";
  let highScore = parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
  highScoreElem.textContent = highScore;

  // Game state
  let state = "IDLE"; // IDLE, PLAYING, GAMEOVER
  let frames = 0;
  let score = 0;

  // Cyber Jet Object
  const jet = {
    x: 80,
    y: 280,
    w: 38,
    h: 22,
    gravity: 0.38,
    velocity: 0,
    jump: -6.8,
    rotation: 0,
    particles: [],

    draw() {
      // Draw exhaust particles
      this.particles.forEach((p) => {
        ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Jet rotation
      ctx.save();
      ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
      ctx.rotate(this.rotation);

      // Jet Body
      ctx.fillStyle = "#38bdf8";
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 12;

      // Fuselage polygon
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(-14, -10);
      ctx.lineTo(-8, 0);
      ctx.lineTo(-14, 10);
      ctx.closePath();
      ctx.fill();

      // Cockpit Glow
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(4, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Wing Accents
      ctx.strokeStyle = "#818cf8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-6, -10);
      ctx.lineTo(2, 0);
      ctx.lineTo(-6, 10);
      ctx.stroke();

      ctx.restore();
      ctx.shadowBlur = 0;
    },

    flap() {
      this.velocity = this.jump;
      playThrustSound();

      // Generate burst particles
      for (let i = 0; i < 6; i++) {
        this.particles.push({
          x: this.x - 10,
          y: this.y + this.h / 2 + (Math.random() * 8 - 4),
          vx: -(Math.random() * 3 + 2),
          vy: Math.random() * 2 - 1,
          size: Math.random() * 3.5 + 2,
          r: 56,
          g: 189,
          b: 248,
          alpha: 1,
          decay: 0.045
        });
      }
    },

    update() {
      this.velocity += this.gravity;
      this.y += this.velocity;

      // Rotation clamped
      if (this.velocity < 0) {
        this.rotation = Math.max(-0.4, this.velocity * 0.06);
      } else {
        this.rotation = Math.min(0.65, this.velocity * 0.05);
      }

      // Ceiling collision
      if (this.y < 0) {
        this.y = 0;
        this.velocity = 0;
      }

      // Floor collision
      if (this.y + this.h >= canvas.height - 30) {
        this.y = canvas.height - 30 - this.h;
        triggerGameOver();
      }

      // Update particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
        }
      }

      // Constant gentle exhaust
      if (frames % 3 === 0) {
        this.particles.push({
          x: this.x - 10,
          y: this.y + this.h / 2,
          vx: -(Math.random() * 2 + 1),
          vy: Math.random() * 1.5 - 0.75,
          size: Math.random() * 2.5 + 1.5,
          r: 244,
          g: 63,
          b: 94,
          alpha: 0.8,
          decay: 0.03
        });
      }
    },

    reset() {
      this.x = 80;
      this.y = 280;
      this.velocity = 0;
      this.rotation = 0;
      this.particles = [];
    }
  };

  // Obstacle Laser Conduits
  const conduits = {
    items: [],
    gap: 155,
    speed: 2.8,
    width: 58,

    draw() {
      this.items.forEach((c) => {
        // Top Conduit
        const gradTop = ctx.createLinearGradient(c.x, 0, c.x + this.width, 0);
        gradTop.addColorStop(0, "#0f172a");
        gradTop.addColorStop(0.5, "#1e293b");
        gradTop.addColorStop(1, "#0f172a");

        ctx.fillStyle = gradTop;
        ctx.fillRect(c.x, 0, this.width, c.top);
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(c.x, 0, this.width, c.top);

        // Top laser emitter rim
        ctx.fillStyle = "#38bdf8";
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 10;
        ctx.fillRect(c.x - 3, c.top - 8, this.width + 6, 8);

        // Bottom Conduit
        const bottomY = c.top + this.gap;
        const bottomHeight = canvas.height - bottomY;

        ctx.fillStyle = gradTop;
        ctx.fillRect(c.x, bottomY, this.width, bottomHeight);
        ctx.strokeRect(c.x, bottomY, this.width, bottomHeight);

        // Bottom laser emitter rim
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(c.x - 3, bottomY, this.width + 6, 8);

        // Conduit Pulsing Neon Core Line
        ctx.strokeStyle = "#818cf8";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(c.x + this.width / 2, 0);
        ctx.lineTo(c.x + this.width / 2, c.top - 8);
        ctx.moveTo(c.x + this.width / 2, bottomY + 8);
        ctx.lineTo(c.x + this.width / 2, canvas.height);
        ctx.stroke();

        ctx.shadowBlur = 0;
      });
    },

    update() {
      // Spawn new conduit
      if (frames % 110 === 0) {
        const minTop = 60;
        const maxTop = canvas.height - this.gap - 100;
        const top = Math.floor(Math.random() * (maxTop - minTop + 1)) + minTop;
        this.items.push({
          x: canvas.width,
          top: top,
          passed: false
        });
      }

      // Move conduits
      for (let i = this.items.length - 1; i >= 0; i--) {
        const c = this.items[i];
        c.x -= this.speed;

        // Collision detection
        const jetBox = {
          left: jet.x,
          right: jet.x + jet.w - 6,
          top: jet.y + 4,
          bottom: jet.y + jet.h - 4
        };

        const conduitBoxTop = {
          left: c.x,
          right: c.x + this.width,
          top: 0,
          bottom: c.top
        };

        const conduitBoxBottom = {
          left: c.x,
          right: c.x + this.width,
          top: c.top + this.gap,
          bottom: canvas.height
        };

        if (checkCollision(jetBox, conduitBoxTop) || checkCollision(jetBox, conduitBoxBottom)) {
          triggerGameOver();
          return;
        }

        // Score update
        if (!c.passed && c.x + this.width < jet.x) {
          c.passed = true;
          score++;
          currentScoreElem.textContent = score;
          playScoreSound();
        }

        // Remove offscreen
        if (c.x + this.width < -10) {
          this.items.splice(i, 1);
        }
      }
    },

    reset() {
      this.items = [];
    }
  };

  function checkCollision(r1, r2) {
    return (
      r1.left < r2.right &&
      r1.right > r2.left &&
      r1.top < r2.bottom &&
      r1.bottom > r2.top
    );
  }

  // Neon Grid Background
  function drawBackground() {
    ctx.fillStyle = "#080c14";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Scrolling cyber grid floor
    const floorY = canvas.height - 30;
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, floorY, canvas.width, 30);

    ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, floorY);
    ctx.lineTo(canvas.width, floorY);
    ctx.stroke();

    // Floor grid movement
    const offset = (frames * conduits.speed) % 24;
    ctx.strokeStyle = "rgba(56, 189, 248, 0.15)";
    for (let x = -offset; x < canvas.width; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, floorY);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Distant background horizon stars
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    for (let i = 0; i < 20; i++) {
      const starX = ((i * 73) - (frames * 0.4)) % canvas.width;
      const actualX = starX < 0 ? starX + canvas.width : starX;
      const starY = (i * 37) % (floorY - 40);
      ctx.fillRect(actualX, starY, 1.5, 1.5);
    }
  }

  function triggerGameOver() {
    state = "GAMEOVER";
    playCrashSound();

    if (score > highScore) {
      highScore = score;
      localStorage.setItem(STORAGE_KEY, highScore.toString());
      highScoreElem.textContent = highScore;
    }

    finalScoreElem.textContent = score;
    bestScoreElem.textContent = highScore;
    gameoverOverlay.classList.remove("hidden");
    gameoverOverlay.classList.add("active");
  }

  function startGame() {
    state = "PLAYING";
    score = 0;
    frames = 0;
    currentScoreElem.textContent = "0";
    jet.reset();
    conduits.reset();

    startOverlay.classList.remove("active");
    startOverlay.classList.add("hidden");
    gameoverOverlay.classList.remove("active");
    gameoverOverlay.classList.add("hidden");

    jet.flap();
  }

  // Main Loop
  function loop() {
    drawBackground();

    if (state === "PLAYING") {
      frames++;
      jet.update();
      conduits.update();
      conduits.draw();
      jet.draw();
    } else if (state === "IDLE") {
      jet.y = 280 + Math.sin(frames * 0.05) * 10;
      frames++;
      jet.draw();
    } else if (state === "GAMEOVER") {
      conduits.draw();
      jet.draw();
    }

    requestAnimationFrame(loop);
  }

  // Input Listeners
  function handleAction(e) {
    if (e) {
      if (e.type === "keydown" && e.code !== "Space" && e.key !== " ") return;
      if (e.target && (e.target.tagName === "BUTTON" || e.target.closest("button"))) return;
      e.preventDefault();
    }

    if (state === "IDLE") {
      startGame();
    } else if (state === "PLAYING") {
      jet.flap();
    }
  }

  window.addEventListener("keydown", handleAction);
  canvas.addEventListener("click", handleAction);
  canvas.addEventListener("touchstart", (e) => {
    handleAction(e);
  }, { passive: false });

  startBtn.addEventListener("click", startGame);
  restartBtn.addEventListener("click", startGame);

  // Initial draw loop
  requestAnimationFrame(loop);
})();
