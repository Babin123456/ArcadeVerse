/**
 * ArcadeVerse Global Web Audio Sound Engine
 * Zero-asset synthesized UI interaction audio using native Web Audio API
 * Author: Babin Bid (@Babin123456)
 * Open Source for ArcadeVerse - NSOC Winter Edition 2026
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'arcadeverse_sound_settings';

  const SoundEngine = {
    ctx: null,
    enabled: true,
    volume: 0.25,

    init() {
      this.loadSettings();
      this.renderControls();
      this.bindDOMSounds();
    },

    getAudioContext() {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) this.ctx = new AudioContextClass();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    },

    loadSettings() {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (saved && typeof saved.enabled === 'boolean') {
          this.enabled = saved.enabled;
          this.volume = saved.volume || 0.25;
        }
      } catch (_) {}
    },

    saveSettings() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          enabled: this.enabled,
          volume: this.volume
        }));
      } catch (_) {}
    },

    playTone(freq, type = 'sine', duration = 0.08, gainRatio = 1) {
      if (!this.enabled) return;
      const ctx = this.getAudioContext();
      if (!ctx) return;

      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const currentGain = this.volume * gainRatio;
        gain.gain.setValueAtTime(currentGain, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch (_) {}
    },

    // Standardized UI Sound Effects
    playHover() {
      this.playTone(520, 'sine', 0.04, 0.4);
    },

    playClick() {
      this.playTone(840, 'triangle', 0.06, 0.7);
    },

    playFilterSelect() {
      this.playTone(420, 'sine', 0.05, 0.6);
      setTimeout(() => this.playTone(630, 'sine', 0.07, 0.8), 45);
    },

    playModalOpen() {
      this.playTone(330, 'sine', 0.08, 0.7);
      setTimeout(() => this.playTone(495, 'triangle', 0.1, 0.9), 60);
      setTimeout(() => this.playTone(660, 'sine', 0.14, 1.0), 120);
    },

    playModalClose() {
      this.playTone(600, 'triangle', 0.06, 0.6);
      setTimeout(() => this.playTone(380, 'sine', 0.08, 0.5), 50);
    },

    renderControls() {
      const container = document.querySelector('.nav-actions');
      if (!container || document.getElementById('global-sound-toggle-btn')) return;

      const btn = document.createElement('button');
      btn.id = 'global-sound-toggle-btn';
      btn.className = `sound-toggle-btn ${this.enabled ? 'sound-active' : 'sound-muted'}`;
      btn.type = 'button';
      btn.setAttribute('aria-label', this.enabled ? 'Mute arcade UI audio' : 'Unmute arcade UI audio');
      btn.title = 'Toggle Arcade UI Audio';
      btn.innerHTML = `
        <span class="eq-bars">
          <span class="eq-bar bar-1"></span>
          <span class="eq-bar bar-2"></span>
          <span class="eq-bar bar-3"></span>
        </span>
        <span class="sound-label">${this.enabled ? 'SFX ON' : 'SFX OFF'}</span>
      `;

      btn.addEventListener('click', () => {
        this.enabled = !this.enabled;
        this.saveSettings();
        btn.className = `sound-toggle-btn ${this.enabled ? 'sound-active' : 'sound-muted'}`;
        btn.querySelector('.sound-label').textContent = this.enabled ? 'SFX ON' : 'SFX OFF';
        btn.setAttribute('aria-label', this.enabled ? 'Mute arcade UI audio' : 'Unmute arcade UI audio');
        if (this.enabled) this.playClick();
      });

      container.prepend(btn);
    },

    bindDOMSounds() {
      document.addEventListener('mouseover', (e) => {
        if (e.target.closest('.game-card, .category-pill, .btn, .nav-links a')) {
          this.playHover();
        }
      });

      document.addEventListener('click', (e) => {
        if (e.target.closest('.category-pill')) {
          this.playFilterSelect();
        } else if (e.target.closest('.btn, .nav-links a')) {
          this.playClick();
        } else if (e.target.closest('[data-action="open-game-modal"]')) {
          this.playModalOpen();
        } else if (e.target.closest('#modal-close-btn, #modal-overlay')) {
          this.playModalClose();
        }
      });
    }
  };

  window.SoundEngine = SoundEngine;
  document.addEventListener('DOMContentLoaded', () => SoundEngine.init());
})();
