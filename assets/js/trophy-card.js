/**
 * ArcadeVerse Holographic Trophy & Share Card Generator Engine
 * Renders 1200x630 high-resolution social cards using native Canvas API
 * Author: Babin Bid (@Babin123456)
 * Open Source for ArcadeVerse - NSOC Winter Edition 2026
 */

(function () {
  'use strict';

  const TrophyCardEngine = {
    canvas: null,
    ctx: null,

    init() {
      this.canvas = document.createElement('canvas');
      this.canvas.width = 1200;
      this.canvas.height = 630;
      this.ctx = this.canvas.getContext('2d');
      this.bindEvents();
    },

    generateCard(data = {}) {
      const {
        title = 'Arcade Explorer',
        playerName = 'Community Gamer',
        score = '2,450',
        gameTitle = 'Whack-A-Bug Panic',
        rank = 'Gold Champion',
        badge = 'NSOC 2026'
      } = data;

      const ctx = this.ctx;
      const W = 1200;
      const H = 630;

      // 1. Cyber Dark Background
      const bgGrad = ctx.createLinearGradient(0, 0, W, H);
      bgGrad.addColorStop(0, '#040714');
      bgGrad.addColorStop(0.5, '#0a1128');
      bgGrad.addColorStop(1, '#05091a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // 2. Ambient Cyber Grid Pattern
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 245, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      ctx.restore();

      // 3. Holographic Border Glow
      ctx.save();
      const borderGrad = ctx.createLinearGradient(20, 20, W - 20, H - 20);
      borderGrad.addColorStop(0, '#00f5ff');
      borderGrad.addColorStop(0.3, '#38bdf8');
      borderGrad.addColorStop(0.7, '#ec4899');
      borderGrad.addColorStop(1, '#a855f7');
      ctx.strokeStyle = borderGrad;
      ctx.lineWidth = 4;
      ctx.shadowColor = '#00f5ff';
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.roundRect(24, 24, W - 48, H - 48, 24);
      ctx.stroke();
      ctx.restore();

      // 4. Header Bar: ArcadeVerse Brand & Tag
      ctx.save();
      ctx.fillStyle = '#00f5ff';
      ctx.font = 'bold 36px "Space Grotesk", sans-serif';
      ctx.fillText('Arcade', 70, 95);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Verse', 185, 95);

      // Event Badge
      ctx.fillStyle = 'rgba(0, 245, 255, 0.12)';
      ctx.strokeStyle = 'rgba(0, 245, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(W - 270, 60, 200, 44, 22);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#00f5ff';
      ctx.font = 'bold 18px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(badge, W - 170, 88);
      ctx.restore();

      // 5. Player Avatar Circle & Rank
      ctx.save();
      const avatarX = 130;
      const avatarY = 240;
      const avatarR = 55;

      const avatarGrad = ctx.createLinearGradient(avatarX - avatarR, avatarY - avatarR, avatarX + avatarR, avatarY + avatarR);
      avatarGrad.addColorStop(0, '#00f5ff');
      avatarGrad.addColorStop(1, '#ec4899');
      ctx.fillStyle = avatarGrad;
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2);
      ctx.fill();

      // Avatar Initial
      ctx.fillStyle = '#040b17';
      ctx.font = 'bold 52px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(playerName.charAt(0).toUpperCase(), avatarX, avatarY + 2);

      // Player Name
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 44px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(playerName, 215, 235);

      // Title & Rank
      ctx.fillStyle = '#38bdf8';
      ctx.font = '600 24px "Space Grotesk", sans-serif';
      ctx.fillText(`${rank} • ${title}`, 215, 275);
      ctx.restore();

      // 6. Center Stats Card
      ctx.save();
      const cardY = 340;
      const cardW = W - 140;
      const cardH = 180;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(70, cardY, cardW, cardH, 18);
      ctx.fill();
      ctx.stroke();

      // Stat Column 1: Game Title
      ctx.fillStyle = '#94a3b8';
      ctx.font = '700 16px "JetBrains Mono", monospace';
      ctx.fillText('FEATURED GAME', 110, cardY + 50);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 32px "Space Grotesk", sans-serif';
      ctx.fillText(gameTitle, 110, cardY + 100);

      // Stat Column 2: Score Record
      ctx.fillStyle = '#94a3b8';
      ctx.font = '700 16px "JetBrains Mono", monospace';
      ctx.fillText('RECORD SCORE', 620, cardY + 50);

      ctx.fillStyle = '#00f5ff';
      ctx.font = 'bold 50px "JetBrains Mono", monospace';
      ctx.shadowColor = '#00f5ff';
      ctx.shadowBlur = 16;
      ctx.fillText(score, 620, cardY + 115);
      ctx.restore();

      // 7. Footer Stamp & Watermark
      ctx.save();
      ctx.fillStyle = '#64748b';
      ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Verified Open-Source Community Achievement • arcadeverse.github.io', 70, H - 48);
      ctx.restore();

      return this.canvas.toDataURL('image/png');
    },

    downloadCard(data) {
      const dataUrl = this.generateCard(data);
      const link = document.createElement('a');
      link.download = `ArcadeVerse_Trophy_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    },

    bindEvents() {
      // Listen for open trophy card requests
      document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-action="open-trophy-card"]');
        if (trigger) {
          e.preventDefault();
          const game = trigger.dataset.game || 'Whack-A-Bug Panic';
          const score = trigger.dataset.score || '3,820';
          const player = trigger.dataset.player || 'ArcadePlayer';
          this.showModal({ gameTitle: game, score, playerName: player });
        }
      });
    },

    showModal(data) {
      let modal = document.getElementById('trophy-card-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'trophy-card-modal';
        modal.className = 'trophy-modal';
        modal.innerHTML = `
          <div class="trophy-modal-content">
            <div class="trophy-modal-header">
              <h3>Personalized Victory Trophy Card</h3>
              <button class="trophy-modal-close" aria-label="Close Trophy Modal">&times;</button>
            </div>
            <div class="trophy-card-preview-wrap">
              <img id="trophy-preview-img" class="trophy-preview-img" alt="Trophy Card Preview" />
            </div>
            <div class="trophy-modal-actions">
              <button id="btn-download-trophy" class="btn-trophy primary">Download Image (PNG)</button>
              <button id="btn-copy-trophy" class="btn-trophy secondary">Copy Card</button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.trophy-modal-close').addEventListener('click', () => {
          modal.classList.remove('active');
        });
        modal.addEventListener('click', (e) => {
          if (e.target === modal) modal.classList.remove('active');
        });
      }

      const img = modal.querySelector('#trophy-preview-img');
      const dataUrl = this.generateCard(data);
      img.src = dataUrl;

      const btnDownload = modal.querySelector('#btn-download-trophy');
      btnDownload.onclick = () => this.downloadCard(data);

      const btnCopy = modal.querySelector('#btn-copy-trophy');
      btnCopy.onclick = async () => {
        try {
          const blob = await (await fetch(dataUrl)).blob();
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          btnCopy.textContent = 'Copied to Clipboard!';
          setTimeout(() => { btnCopy.textContent = 'Copy Card'; }, 2000);
        } catch (_) {
          this.downloadCard(data);
        }
      };

      modal.classList.add('active');
    }
  };

  window.TrophyCardEngine = TrophyCardEngine;
  document.addEventListener('DOMContentLoaded', () => TrophyCardEngine.init());
})();
