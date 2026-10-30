/**
 * Cyber Neon Pong — Core Match Engine
 * Pure Vanilla JavaScript 60 FPS HTML5 Canvas Pong
 * Features: First-to-7 Match Rules, Dynamic AI Difficulties, Native Web Audio Synthesis & Pause
 * Author: Debasmita Bose & Babin Bid
 * NSOC Winter Edition 2026
 */

(() => {
  'use strict';

  const canvas = document.getElementById("pongCanvas");
  const ctx = canvas.getContext("2d");

  const playerScoreElem = document.getElementById("player-score");
  const aiScoreElem = document.getElementById("ai-score");
  const pauseBtn = document.getElementById("pause-btn");
  const soundBtn = document.getElementById("sound-btn");
  const restartBtn = document.getElementById("restart-btn");
  const pauseOverlay = document.getElementById("pause-overlay");
  const gameoverOverlay = document.getElementById("gameover-overlay");
  const resumeBtn = document.getElementById("resume-btn");
  const playAgainBtn = document.getElementById("play-again-btn");
  const winnerTitle = document.getElementById("winner-title");
  const winnerDesc = document.getElementById("winner-desc");
  const finalScoreDisplay = document.getElementById("final-score-display");
  const diffBtns = document.querySelectorAll(".diff-btn");

  const MATCH_TARGET = 7;
  const paddleWidth = 12;
  const paddleHeight = 70;
  const ballRadius = 8;

  let playerY = canvas.height / 2 - paddleHeight / 2;
  let aiY = canvas.height / 2 - paddleHeight / 2;

  let playerScore = 0;
  let aiScore = 0;

  let ballX = canvas.width / 2;
  let ballY = canvas.height / 2;
  let ballSpeedX = 4.5;
  let ballSpeedY = 2.5;

  let isPaused = false;
  let isGameOver = false;
  let currentDifficulty = "easy";
  let soundEnabled = true;
  let audioCtx = null;
  let animationId = null;

  // AI Tuning Matrix
  const AI_SETTINGS = {
    easy: { speed: 2.7, deadband: 16, errorProb: 0.15 },
    pro: { speed: 4.2, deadband: 8, errorProb: 0.05 },
    cyber: { speed: 5.6, deadband: 3, errorProb: 0.0 }
  };

  // Audio System
  function initAudio() {
    if (!audioCtx) {
      const AudioClass = window.AudioContext || window.webkitAudioContext;
      if (AudioClass) audioCtx = new AudioClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, type = 'sine', duration = 0.08, gainVal = 0.15) {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (_) {}
  }

  function playHitSound(isPlayer) {
    playTone(isPlayer ? 580 : 420, 'triangle', 0.07, 0.16);
  }

  function playWallSound() {
    playTone(260, 'sine', 0.05, 0.1);
  }

  function playScoreSound(isPlayer) {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      const startF = isPlayer ? 440 : 330;
      const endF = isPlayer ? 880 : 220;
      osc.frequency.setValueAtTime(startF, now);
      osc.frequency.exponentialRampToValueAtTime(endF, now + 0.18);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(now + 0.2);
    } catch (_) {}
  }

  function playMatchEndSound(isVictory) {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    const notes = isVictory ? [523, 659, 784, 1046] : [440, 370, 311, 220];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        playTone(freq, isVictory ? 'triangle' : 'sawtooth', 0.18, 0.2);
      }, idx * 120);
    });
  }

  // Paddle Positioning
  function setPlayerY(targetY) {
    playerY = Math.max(0, Math.min(canvas.height - paddleHeight, targetY));
  }

  // Input Listeners
  canvas.addEventListener("mousemove", (e) => {
    if (isPaused || isGameOver) return;
    const rect = canvas.getBoundingClientRect();
    const scaleY = canvas.height / (rect.height || canvas.height);
    const mouseY = (e.clientY - rect.top) * scaleY;
    setPlayerY(mouseY - paddleHeight / 2);
  });

  canvas.addEventListener("touchmove", (e) => {
    if (e.touches && e.touches[0]) {
      e.preventDefault();
      if (isPaused || isGameOver) return;
      const rect = canvas.getBoundingClientRect();
      const scaleY = canvas.height / (rect.height || canvas.height);
      const touchY = (e.touches[0].clientY - rect.top) * scaleY;
      setPlayerY(touchY - paddleHeight / 2);
    }
  }, { passive: false });

  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
      e.preventDefault();
      setPlayerY(playerY - 24);
    } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
      e.preventDefault();
      setPlayerY(playerY + 24);
    } else if (e.key === "p" || e.key === "P" || e.key === " ") {
      e.preventDefault();
      togglePause();
    }
  });

  function resetBall(servingToPlayer) {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    const baseSpeed = currentDifficulty === "cyber" ? 5.5 : (currentDifficulty === "pro" ? 4.8 : 4.0);
    ballSpeedX = servingToPlayer ? -baseSpeed : baseSpeed;
    ballSpeedY = (Math.random() - 0.5) * 5;
  }

  function resetMatch() {
    playerScore = 0;
    aiScore = 0;
    playerScoreElem.textContent = "0";
    aiScoreElem.textContent = "0";
    isPaused = false;
    isGameOver = false;
    pauseOverlay.classList.add("hidden");
    gameoverOverlay.classList.add("hidden");
    playerY = canvas.height / 2 - paddleHeight / 2;
    aiY = canvas.height / 2 - paddleHeight / 2;
    resetBall(Math.random() < 0.5);
  }

  function togglePause() {
    if (isGameOver) return;
    isPaused = !isPaused;
    pauseOverlay.classList.toggle("hidden", !isPaused);
    if (!isPaused && audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function checkMatchOver() {
    if (playerScore >= MATCH_TARGET || aiScore >= MATCH_TARGET) {
      isGameOver = true;
      const playerWon = playerScore >= MATCH_TARGET;
      playMatchEndSound(playerWon);

      winnerTitle.textContent = playerWon ? "Match Victory!" : "Match Defeat!";
      winnerTitle.style.color = playerWon ? "#38bdf8" : "#f43f5e";
      winnerDesc.textContent = playerWon
        ? `Incredible! You defeated ${currentDifficulty.toUpperCase()} AI to reach 7 points!`
        : `AI claimed victory in ${currentDifficulty.toUpperCase()} mode. Ready for a rematch?`;
      finalScoreDisplay.textContent = `${playerScore} - ${aiScore}`;
      gameoverOverlay.classList.remove("hidden");
    }
  }

  function update() {
    if (isPaused || isGameOver) return;

    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Bounce top & bottom walls
    if (ballY - ballRadius <= 0) {
      ballY = ballRadius;
      ballSpeedY = -ballSpeedY;
      playWallSound();
    } else if (ballY + ballRadius >= canvas.height) {
      ballY = canvas.height - ballRadius;
      ballSpeedY = -ballSpeedY;
      playWallSound();
    }

    // AI Tracking Logic
    const setting = AI_SETTINGS[currentDifficulty] || AI_SETTINGS.easy;
    const aiCenter = aiY + paddleHeight / 2;
    const diff = ballY - aiCenter;

    if (Math.abs(diff) > setting.deadband) {
      if (diff > 0) {
        aiY += setting.speed;
      } else {
        aiY -= setting.speed;
      }
    }
    aiY = Math.max(0, Math.min(canvas.height - paddleHeight, aiY));

    // Player Paddle Collision (Left side)
    const playerPaddleX = 15;
    if (
      ballX - ballRadius <= playerPaddleX + paddleWidth &&
      ballX + ballRadius >= playerPaddleX &&
      ballY >= playerY &&
      ballY <= playerY + paddleHeight &&
      ballSpeedX < 0
    ) {
      // Calculate impact point (-1 to 1 from paddle center) for spin angle
      const hitOffset = (ballY - (playerY + paddleHeight / 2)) / (paddleHeight / 2);
      ballSpeedX = -ballSpeedX * 1.05;
      ballSpeedY = hitOffset * 5.2;
      ballX = playerPaddleX + paddleWidth + ballRadius;
      playHitSound(true);
    }

    // AI Paddle Collision (Right side)
    const aiPaddleX = canvas.width - 15 - paddleWidth;
    if (
      ballX + ballRadius >= aiPaddleX &&
      ballX - ballRadius <= aiPaddleX + paddleWidth &&
      ballY >= aiY &&
      ballY <= aiY + paddleHeight &&
      ballSpeedX > 0
    ) {
      const hitOffset = (ballY - (aiY + paddleHeight / 2)) / (paddleHeight / 2);
      ballSpeedX = -ballSpeedX * 1.05;
      ballSpeedY = hitOffset * 5.2;
      ballX = aiPaddleX - ballRadius;
      playHitSound(false);
    }

    // Cap maximum ball speed
    const maxSpeed = 11.5;
    ballSpeedX = Math.max(-maxSpeed, Math.min(maxSpeed, ballSpeedX));
    ballSpeedY = Math.max(-maxSpeed, Math.min(maxSpeed, ballSpeedY));

    // Point scoring
    if (ballX < 0) {
      aiScore++;
      aiScoreElem.textContent = aiScore;
      playScoreSound(false);
      checkMatchOver();
      if (!isGameOver) resetBall(false);
    } else if (ballX > canvas.width) {
      playerScore++;
      playerScoreElem.textContent = playerScore;
      playScoreSound(true);
      checkMatchOver();
      if (!isGameOver) resetBall(true);
    }
  }

  function draw() {
    ctx.fillStyle = "#0d1322";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Center net dashed line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Player paddle (Neon Blue)
    ctx.fillStyle = "#38bdf8";
    ctx.shadowColor = "#38bdf8";
    ctx.shadowBlur = 12;
    ctx.fillRect(15, playerY, paddleWidth, paddleHeight);

    // AI paddle (Neon Red)
    ctx.fillStyle = "#f43f5e";
    ctx.shadowColor = "#f43f5e";
    ctx.shadowBlur = 12;
    ctx.fillRect(canvas.width - 15 - paddleWidth, aiY, paddleWidth, paddleHeight);

    // Energy Ball (Pure White with Glow)
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
  }

  function loop() {
    update();
    draw();
    animationId = requestAnimationFrame(loop);
  }

  // Button Listeners
  pauseBtn.addEventListener("click", togglePause);
  resumeBtn.addEventListener("click", togglePause);
  restartBtn.addEventListener("click", resetMatch);
  playAgainBtn.addEventListener("click", resetMatch);

  // Sound Toggle
  soundBtn.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    const soundIcon = document.getElementById("sound-icon");
    if (soundIcon) {
      soundIcon.setAttribute("data-lucide", soundEnabled ? "volume-2" : "volume-x");
      if (window.lucide) lucide.createIcons();
    }
    soundBtn.title = soundEnabled ? "Mute Sound" : "Enable Sound";
  });

  // Difficulty Switcher
  diffBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      diffBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentDifficulty = btn.getAttribute("data-difficulty") || "easy";
      resetMatch();
    });
  });

  // Start Loop
  resetBall(true);
  animationId = requestAnimationFrame(loop);
})();
