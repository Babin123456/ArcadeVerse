/**
 * ArcadeVerse Speedrun Split Tracker & Precision HUD Overlay
 * Precision millisecond timer, lap split recorder, and Personal Best delta comparison
 * Author: Babin Bid (@Babin123456)
 * Open Source for ArcadeVerse - NSOC Winter Edition 2026
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'arcadeverse_speedrun_records';

  const SplitTimer = {
    running: false,
    startTime: 0,
    elapsedTime: 0,
    timerInterval: null,
    splits: [],
    currentSplitIdx: 0,
    activeGameId: 'arcade',

    init() {
      this.renderHUD();
      this.bindEvents();
    },

    formatTime(ms) {
      const minutes = Math.floor(ms / 60000);
      const seconds = Math.floor((ms % 60000) / 1000);
      const millis = Math.floor((ms % 1000) / 10);
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(2, '0')}`;
    },

    renderHUD() {
      if (document.getElementById('speedrun-hud-overlay')) return;

      const hud = document.createElement('div');
      hud.id = 'speedrun-hud-overlay';
      hud.className = 'speedrun-hud';
      hud.innerHTML = `
        <div class="speedrun-header">
          <span class="speedrun-title">SPEEDRUN SPLIT HUD</span>
          <button id="speedrun-close-btn" class="speedrun-btn-close" aria-label="Close Speedrun HUD">&times;</button>
        </div>
        <div class="speedrun-main-timer" id="speedrun-main-time">00:00.00</div>
        <div class="speedrun-splits-list" id="speedrun-splits-list">
          <div class="speedrun-split-row">
            <span>Segment 1</span>
            <span class="split-time">--:--.--</span>
          </div>
          <div class="speedrun-split-row">
            <span>Segment 2</span>
            <span class="split-time">--:--.--</span>
          </div>
          <div class="speedrun-split-row">
            <span>Final Run</span>
            <span class="split-time">--:--.--</span>
          </div>
        </div>
        <div class="speedrun-controls">
          <button id="speedrun-btn-start" class="btn-speedrun primary" type="button">Start</button>
          <button id="speedrun-btn-split" class="btn-speedrun secondary" type="button" disabled>Split</button>
          <button id="speedrun-btn-reset" class="btn-speedrun tertiary" type="button">Reset</button>
        </div>
        <div class="speedrun-hint">Hotkeys: <kbd>Alt</kbd>+<kbd>S</kbd> Start/Split • <kbd>Alt</kbd>+<kbd>R</kbd> Reset</div>
      `;
      document.body.appendChild(hud);
    },

    bindEvents() {
      document.addEventListener('click', (e) => {
        if (e.target.closest('#modal-speedrun-btn')) {
          this.toggleHUD();
        } else if (e.target.closest('#speedrun-close-btn')) {
          this.hideHUD();
        } else if (e.target.closest('#speedrun-btn-start')) {
          this.toggleTimer();
        } else if (e.target.closest('#speedrun-btn-split')) {
          this.recordSplit();
        } else if (e.target.closest('#speedrun-btn-reset')) {
          this.resetTimer();
        }
      });

      // Keyboard Hotkeys
      window.addEventListener('keydown', (e) => {
        if (e.altKey && (e.code === 'KeyS' || e.key === 's')) {
          e.preventDefault();
          if (!this.running) this.startTimer();
          else this.recordSplit();
        } else if (e.altKey && (e.code === 'KeyR' || e.key === 'r')) {
          e.preventDefault();
          this.resetTimer();
        }
      });
    },

    toggleHUD() {
      const hud = document.getElementById('speedrun-hud-overlay');
      if (hud) hud.classList.toggle('active');
    },

    hideHUD() {
      const hud = document.getElementById('speedrun-hud-overlay');
      if (hud) hud.classList.remove('active');
    },

    toggleTimer() {
      if (this.running) this.pauseTimer();
      else this.startTimer();
    },

    startTimer() {
      if (this.running) return;
      this.running = true;
      this.startTime = performance.now() - this.elapsedTime;
      const btnStart = document.getElementById('speedrun-btn-start');
      const btnSplit = document.getElementById('speedrun-btn-split');
      if (btnStart) btnStart.textContent = 'Pause';
      if (btnSplit) btnSplit.disabled = false;

      this.timerInterval = setInterval(() => {
        this.elapsedTime = performance.now() - this.startTime;
        const timeEl = document.getElementById('speedrun-main-time');
        if (timeEl) timeEl.textContent = this.formatTime(this.elapsedTime);
      }, 30);
    },

    pauseTimer() {
      this.running = false;
      clearInterval(this.timerInterval);
      const btnStart = document.getElementById('speedrun-btn-start');
      const btnSplit = document.getElementById('speedrun-btn-split');
      if (btnStart) btnStart.textContent = 'Resume';
      if (btnSplit) btnSplit.disabled = true;
    },

    resetTimer() {
      this.pauseTimer();
      this.elapsedTime = 0;
      this.splits = [];
      this.currentSplitIdx = 0;
      const timeEl = document.getElementById('speedrun-main-time');
      const btnStart = document.getElementById('speedrun-btn-start');
      const btnSplit = document.getElementById('speedrun-btn-split');
      if (timeEl) timeEl.textContent = '00:00.00';
      if (btnStart) btnStart.textContent = 'Start';
      if (btnSplit) btnSplit.disabled = true;

      const rows = document.querySelectorAll('.speedrun-split-row .split-time');
      rows.forEach(r => { r.textContent = '--:--.--'; r.className = 'split-time'; });
    },

    recordSplit() {
      if (!this.running) return;
      const rows = document.querySelectorAll('.speedrun-split-row .split-time');
      if (this.currentSplitIdx < rows.length) {
        rows[this.currentSplitIdx].textContent = this.formatTime(this.elapsedTime);
        rows[this.currentSplitIdx].classList.add('completed');
        this.currentSplitIdx++;
        if (this.currentSplitIdx >= rows.length) {
          this.pauseTimer();
        }
      }
    }
  };

  window.SplitTimer = SplitTimer;
  document.addEventListener('DOMContentLoaded', () => SplitTimer.init());
})();
