/**
 * Quantum Memory Matrix - Logic & Audio Engine
 * Pure Vanilla JavaScript Memory Puzzle with Multi-Grid Difficulties & Procedural Web Audio
 * Author: Debasmita Bose & Babin Bid
 * NSOC Winter Edition 2026
 */

(() => {
  'use strict';

  const matrixGrid = document.getElementById("matrix-grid");
  const movesCountEl = document.getElementById("moves-count");
  const pairsCountEl = document.getElementById("pairs-count");
  const totalPairsCountEl = document.getElementById("total-pairs-count");
  const timerValEl = document.getElementById("timer-val");
  const bestRecordEl = document.getElementById("best-record-text");
  const restartBtn = document.getElementById("restart-btn");
  const winOverlay = document.getElementById("win-overlay");
  const winSummary = document.getElementById("win-summary");
  const newRecordBadge = document.getElementById("new-record-badge");
  const playAgainBtn = document.getElementById("play-again-btn");
  const soundToggleBtn = document.getElementById("sound-toggle-btn");
  const soundIcon = document.getElementById("sound-icon");
  const diffBtns = document.querySelectorAll(".diff-btn");

  const GLYPH_POOL = [
    "zap", "gem", "rocket", "bot",
    "sparkles", "dna", "flame", "globe",
    "shield", "cpu", "atom", "orbit"
  ];

  const DIFFICULTIES = {
    cadet: { pairs: 6, cols: 4, gridClass: "grid-3x4", label: "Cadet" },
    agent: { pairs: 8, cols: 4, gridClass: "grid-4x4", label: "Agent" },
    architect: { pairs: 10, cols: 5, gridClass: "grid-4x5", label: "Architect" }
  };

  let currentDiff = "agent";
  let cardsArray = [];
  let flippedCards = [];
  let matchedPairs = 0;
  let moves = 0;
  let timer = 0;
  let timerInterval = null;
  let isLockBoard = false;
  let soundEnabled = true;
  let audioCtx = null;

  // Web Audio Synthesizer
  function initAudio() {
    if (!audioCtx) {
      const AudioClass = window.AudioContext || window.webkitAudioContext;
      if (AudioClass) audioCtx = new AudioClass();
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  }

  function playTone(freq, type = "sine", duration = 0.1, gainVal = 0.14) {
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

  function playFlipSound() {
    playTone(480, "triangle", 0.05, 0.1);
  }

  function playMatchSound() {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;
    [659, 880, 1046].forEach((f, i) => {
      setTimeout(() => playTone(f, "sine", 0.12, 0.15), i * 65);
    });
  }

  function playMismatchSound() {
    playTone(180, "sawtooth", 0.12, 0.14);
  }

  function playWinSound() {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;
    [523, 659, 784, 1046, 1318].forEach((f, i) => {
      setTimeout(() => playTone(f, "triangle", 0.22, 0.18), i * 110);
    });
  }

  // Best Record Storage
  function getBestRecord(diff) {
    try {
      const raw = localStorage.getItem(`arcadeverse_memory_best_${diff}`);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function saveBestRecord(diff, movesVal, timeVal) {
    try {
      localStorage.setItem(`arcadeverse_memory_best_${diff}`, JSON.stringify({
        moves: movesVal,
        time: timeVal,
        date: new Date().toISOString().slice(0, 10)
      }));
    } catch (_) {}
  }

  function updateBestRecordDisplay() {
    const best = getBestRecord(currentDiff);
    if (best) {
      const mins = String(Math.floor(best.time / 60)).padStart(2, "0");
      const secs = String(best.time % 60).padStart(2, "0");
      bestRecordEl.textContent = `${best.moves} moves (${mins}:${secs})`;
    } else {
      bestRecordEl.textContent = "--";
    }
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function initGame() {
    clearInterval(timerInterval);
    timer = 0;
    moves = 0;
    matchedPairs = 0;
    flippedCards = [];
    isLockBoard = false;

    movesCountEl.textContent = "0";
    pairsCountEl.textContent = "0";
    timerValEl.textContent = "00:00";
    winOverlay.classList.add("hidden");
    newRecordBadge.classList.add("hidden");

    const cfg = DIFFICULTIES[currentDiff];
    totalPairsCountEl.textContent = cfg.pairs;
    updateBestRecordDisplay();

    // Prepare Cards: take required pair count from glyph pool and duplicate
    const activeGlyphs = GLYPH_POOL.slice(0, cfg.pairs);
    cardsArray = [...activeGlyphs, ...activeGlyphs];
    shuffle(cardsArray);

    renderBoard(cfg);
    startTimer();
  }

  function renderBoard(cfg) {
    matrixGrid.innerHTML = "";
    matrixGrid.className = `matrix-grid ${cfg.gridClass}`;

    cardsArray.forEach((glyph, index) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.dataset.glyph = glyph;
      card.dataset.index = index;
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-label", `Memory Card ${index + 1}`);

      card.innerHTML = `
        <div class="card-face card-front"><i data-lucide="atom"></i></div>
        <div class="card-face card-back"><i data-lucide="${glyph}"></i></div>
      `;

      card.addEventListener("click", () => handleCardClick(card));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick(card);
        }
      });

      matrixGrid.appendChild(card);
    });

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  function handleCardClick(card) {
    if (isLockBoard) return;
    if (card === flippedCards[0]) return;
    if (card.classList.contains("matched") || card.classList.contains("flipped")) return;

    playFlipSound();
    card.classList.add("flipped");
    flippedCards.push(card);

    if (flippedCards.length === 2) {
      moves++;
      movesCountEl.textContent = moves;
      checkForMatch();
    }
  }

  function checkForMatch() {
    const [first, second] = flippedCards;
    const isMatch = first.dataset.glyph === second.dataset.glyph;

    if (isMatch) {
      disableMatchedCards();
    } else {
      unflipCards();
    }
  }

  function disableMatchedCards() {
    playMatchSound();
    flippedCards.forEach((card) => {
      card.classList.add("matched");
    });
    matchedPairs++;
    pairsCountEl.textContent = matchedPairs;
    flippedCards = [];

    const cfg = DIFFICULTIES[currentDiff];
    if (matchedPairs === cfg.pairs) {
      endGame();
    }
  }

  function unflipCards() {
    isLockBoard = true;
    playMismatchSound();
    setTimeout(() => {
      flippedCards.forEach((card) => {
        card.classList.remove("flipped");
      });
      flippedCards = [];
      isLockBoard = false;
    }, 850);
  }

  function startTimer() {
    timerInterval = setInterval(() => {
      timer++;
      const mins = String(Math.floor(timer / 60)).padStart(2, "0");
      const secs = String(timer % 60).padStart(2, "0");
      timerValEl.textContent = `${mins}:${secs}`;
    }, 1000);
  }

  function endGame() {
    clearInterval(timerInterval);
    playWinSound();

    const mins = String(Math.floor(timer / 60)).padStart(2, "0");
    const secs = String(timer % 60).padStart(2, "0");
    winSummary.textContent = `You solved the ${DIFFICULTIES[currentDiff].label} matrix in ${moves} moves and ${mins}:${secs}!`;

    // Check Best Record
    const prevBest = getBestRecord(currentDiff);
    let isNewRecord = false;
    if (!prevBest || moves < prevBest.moves || (moves === prevBest.moves && timer < prevBest.time)) {
      saveBestRecord(currentDiff, moves, timer);
      isNewRecord = true;
      newRecordBadge.classList.remove("hidden");
      updateBestRecordDisplay();
    }

    winOverlay.classList.remove("hidden");
  }

  // Event Listeners
  restartBtn.addEventListener("click", initGame);
  playAgainBtn.addEventListener("click", initGame);

  // Sound Toggle
  soundToggleBtn.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    if (soundIcon) {
      soundIcon.setAttribute("data-lucide", soundEnabled ? "volume-2" : "volume-x");
      if (window.lucide) lucide.createIcons();
    }
    soundToggleBtn.title = soundEnabled ? "Mute Sound" : "Enable Sound";
  });

  // Difficulty Switcher
  diffBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      diffBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentDiff = btn.dataset.diff || "agent";
      initGame();
    });
  });

  // Start on load
  initGame();
})();
