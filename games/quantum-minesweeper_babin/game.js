/**
 * Quantum Minesweeper
 * Pure Vanilla JavaScript recursive flood-fill grid engine
 */

(() => {
  const minefieldEl = document.getElementById("minefield");
  const mineCountEl = document.getElementById("mine-count");
  const timerDisplayEl = document.getElementById("timer-display");
  const faceBtn = document.getElementById("face-btn");
  const flagToggleBtn = document.getElementById("flag-toggle-btn");
  const flagModeStateEl = document.getElementById("flag-mode-state");

  const diffBtns = document.querySelectorAll(".diff-btn");
  const resultModal = document.getElementById("result-modal");
  const resultTitle = document.getElementById("result-title");
  const resultIcon = document.getElementById("result-icon");
  const resultMessage = document.getElementById("result-message");
  const resultTime = document.getElementById("result-time");
  const resultDiff = document.getElementById("result-diff");
  const closeResultBtn = document.getElementById("close-result-btn");
  const modalRestartBtn = document.getElementById("modal-restart-btn");

  const rulesBtn = document.getElementById("rules-btn");
  const closeRulesBtn = document.getElementById("close-rules-btn");
  const rulesModal = document.getElementById("rules-modal");

  const CONFIGS = {
    easy: { rows: 9, cols: 9, mines: 10, label: "9x9" },
    medium: { rows: 12, cols: 12, mines: 20, label: "12x12" }
  };

  let currentDiff = "easy";
  let rows = 9;
  let cols = 9;
  let totalMines = 10;
  let grid = [];
  let isGameOver = false;
  let isGameStarted = false;
  let flagsLeft = 10;
  let flagMode = false;
  let timer = 0;
  let timerInterval = null;

  function setDifficulty(diff) {
    currentDiff = diff;
    rows = CONFIGS[diff].rows;
    cols = CONFIGS[diff].cols;
    totalMines = CONFIGS[diff].mines;

    diffBtns.forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-diff") === diff);
    });

    initGame();
  }

  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timer = 0;
    timerDisplayEl.textContent = "000";
    timerInterval = setInterval(() => {
      timer++;
      timerDisplayEl.textContent = String(Math.min(999, timer)).padStart(3, "0");
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  const SVG_FACE_SMILE = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>';
  const SVG_FACE_WIN = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2"/><path d="M6 9h4"/><path d="M14 9h4"/></svg>';
  const SVG_FACE_DEAD = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
  const SVG_FLAG = '<svg width="15" height="15" viewBox="0 0 24 24" fill="#f43f5e" stroke="#f43f5e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>';
  const SVG_MINE = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="6"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>';
  const SVG_TROPHY = '<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>';
  const SVG_ALERT = '<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';

  function initGame() {
    stopTimer();
    isGameOver = false;
    isGameStarted = false;
    flagsLeft = totalMines;
    mineCountEl.textContent = flagsLeft;
    timerDisplayEl.textContent = "000";
    faceBtn.innerHTML = SVG_FACE_SMILE;
    resultModal.classList.remove("active");

    grid = [];
    minefieldEl.innerHTML = "";
    minefieldEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    for (let r = 0; r < rows; r++) {
      grid[r] = [];
      for (let c = 0; c < cols; c++) {
        const cell = {
          r,
          c,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0,
          element: null
        };

        const cellEl = document.createElement("div");
        cellEl.className = "cell";
        cellEl.dataset.r = r;
        cellEl.dataset.c = c;

        cellEl.addEventListener("click", () => handleCellClick(r, c));
        cellEl.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          toggleFlag(r, c);
        });

        cellEl.setAttribute("role", "gridcell");
        cellEl.setAttribute("tabindex", "0");
        cellEl.setAttribute("aria-label", `Cell at row ${r + 1}, column ${c + 1}`);

        cellEl.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleCellClick(r, c);
          } else if (e.key === " " || e.key === "f" || e.key === "F") {
            e.preventDefault();
            toggleFlag(r, c);
          }
        });
        minefieldEl.appendChild(cellEl);
        cell.element = cellEl;
        grid[r][c] = cell;
      }
    }
  }

  function plantMines(firstR, firstC) {
    let planted = 0;
    while (planted < totalMines) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);

      // Safe zone around first click
      if (Math.abs(r - firstR) <= 1 && Math.abs(c - firstC) <= 1) continue;
      if (!grid[r][c].isMine) {
        grid[r][c].isMine = true;
        planted++;
      }
    }

    // Calculate neighbor mine counts
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!grid[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc].isMine) {
                count++;
              }
            }
          }
          grid[r][c].neighborMines = count;
        }
      }
    }
  }

  function toggleFlag(r, c) {
    if (isGameOver) return;
    const cell = grid[r][c];
    if (cell.isRevealed) return;

    if (cell.isFlagged) {
      cell.isFlagged = false;
      cell.element.classList.remove("flagged");
      cell.element.textContent = "";
      flagsLeft++;
    } else if (flagsLeft > 0) {
      cell.isFlagged = true;
      cell.element.classList.add("flagged");
      cell.element.innerHTML = SVG_FLAG;
      flagsLeft--;
    }

    mineCountEl.textContent = flagsLeft;
  }

  function handleCellClick(r, c) {
    if (isGameOver) return;
    if (flagMode) {
      toggleFlag(r, c);
      return;
    }

    const cell = grid[r][c];
    if (cell.isFlagged || cell.isRevealed) return;

    if (!isGameStarted) {
      isGameStarted = true;
      plantMines(r, c);
      startTimer();
    }

    if (cell.isMine) {
      // Detonation!
      revealMines();
      cell.element.style.background = "#ef4444";
      gameOver(false);
      return;
    }

    revealCell(r, c);
    checkVictory();
  }

  function revealCell(r, c) {
    const cell = grid[r][c];
    if (cell.isRevealed || cell.isFlagged || cell.isMine) return;

    cell.isRevealed = true;
    cell.element.classList.add("revealed");

    if (cell.neighborMines > 0) {
      cell.element.textContent = cell.neighborMines;
      cell.element.dataset.num = cell.neighborMines;
    } else {
      // Recursive flood-fill
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            revealCell(nr, nc);
          }
        }
      }
    }
  }

  function revealMines() {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = grid[r][c];
        if (cell.isMine) {
          cell.element.classList.add("mine");
          cell.element.innerHTML = SVG_MINE;
        }
      }
    }
  }

  function checkVictory() {
    let unrevealedSafeCells = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = grid[r][c];
        if (!cell.isMine && !cell.isRevealed) {
          unrevealedSafeCells++;
        }
      }
    }

    if (unrevealedSafeCells === 0) {
      gameOver(true);
    }
  }

  function gameOver(won) {
    isGameOver = true;
    stopTimer();

    faceBtn.innerHTML = won ? SVG_FACE_WIN : SVG_FACE_DEAD;

    resultTitle.textContent = won ? "Quantum Sector Secured!" : "Singularity Breach!";
    resultIcon.innerHTML = won ? SVG_TROPHY : SVG_ALERT;
    resultMessage.textContent = won 
      ? `All ${totalMines} subatomic quantum hazards have been safely neutralized!`
      : "A quantum mine was triggered, destabilizing the local field.";
    resultTime.textContent = `${timer}s`;
    resultDiff.textContent = CONFIGS[currentDiff].label;

    setTimeout(() => {
      resultModal.classList.add("active");
    }, 700);
  }

  // Event Listeners
  faceBtn.addEventListener("click", initGame);
  modalRestartBtn.addEventListener("click", initGame);
  closeResultBtn.addEventListener("click", () => resultModal.classList.remove("active"));

  diffBtns.forEach(btn => {
    btn.addEventListener("click", () => setDifficulty(btn.getAttribute("data-diff")));
  });

  flagToggleBtn.addEventListener("click", () => {
    flagMode = !flagMode;
    flagToggleBtn.classList.toggle("active", flagMode);
    flagModeStateEl.textContent = flagMode ? "ON" : "OFF";
  });

  rulesBtn.addEventListener("click", () => rulesModal.classList.add("active"));
  closeRulesBtn.addEventListener("click", () => rulesModal.classList.remove("active"));
  rulesModal.addEventListener("click", (e) => {
    if (e.target === rulesModal) rulesModal.classList.remove("active");
  });

  initGame();
})();
