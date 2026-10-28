/**
 * ArcadeVerse Holographic Certificate & Trophy Generator Engine
 * Renders 1200x750 high-resolution verified open-source certificates using native Canvas API
 * Features original user profile avatar, official platform brand logo, and ornate credentials
 * Author: Babin Bid (@Babin123456)
 * Open Source for ArcadeVerse - NSOC Winter Edition 2026
 */

(function () {
  'use strict';

  function loadImage(src) {
    return new Promise((resolve) => {
      if (!src) return resolve(null);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  const TrophyCardEngine = {
    canvas: null,
    ctx: null,

    init() {
      this.canvas = document.createElement('canvas');
      this.canvas.width = 1200;
      this.canvas.height = 750;
      this.ctx = this.canvas.getContext('2d');
      this.bindEvents();
    },

    async generateCard(data = {}) {
      const {
        title = 'Open Source Contributor',
        playerName = 'Community Developer',
        handle = '',
        avatarUrl = '',
        score = '1,820 PTS',
        gameTitle = 'NSOC 2026 Hall of Fame',
        rank = '1st Champion',
        badge = 'NSOC 2026'
      } = data;

      const userHandle = handle ? (handle.startsWith('@') ? handle : `@${handle}`) : (playerName ? `@${playerName.toLowerCase().replace(/\s+/g, '')}` : '@contributor');
      const ctx = this.ctx;
      const W = 1200;
      const H = 750;

      // Reset
      ctx.clearRect(0, 0, W, H);

      // Preload Brand Logo and User Profile Avatar
      const [brandLogoImg, userAvatarImg] = await Promise.all([
        loadImage('assets/public/brand-logo.webp').then(res => res || loadImage('assets/public/brand-logo.png')),
        avatarUrl ? loadImage(avatarUrl) : loadImage(`https://github.com/${userHandle.replace('@', '')}.png`)
      ]);

      // 1. Deep Cyber Luxury Background
      const bgGrad = ctx.createLinearGradient(0, 0, W, H);
      bgGrad.addColorStop(0, '#030714');
      bgGrad.addColorStop(0.35, '#071126');
      bgGrad.addColorStop(0.7, '#0c1b3a');
      bgGrad.addColorStop(1, '#04091a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // 2. Ambient Cyber Matrix Grid
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 245, 255, 0.035)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 35) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += 35) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      ctx.restore();

      // 3. Ornate Double Certificate Borders with Gold & Cyan Gradients
      ctx.save();
      // Outer Gold/Cyan Frame
      const outerGrad = ctx.createLinearGradient(0, 0, W, H);
      outerGrad.addColorStop(0, '#00f5ff');
      outerGrad.addColorStop(0.3, '#38bdf8');
      outerGrad.addColorStop(0.7, '#f59e0b');
      outerGrad.addColorStop(1, '#fbbf24');
      ctx.strokeStyle = outerGrad;
      ctx.lineWidth = 3.5;
      ctx.shadowColor = 'rgba(0, 245, 255, 0.35)';
      ctx.shadowBlur = 18;
      ctx.strokeRect(26, 26, W - 52, H - 52);

      // Inner Hairline Ornate Border
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.strokeRect(36, 36, W - 72, H - 72);

      // Inner Thin Accent Line
      ctx.strokeStyle = 'rgba(0, 245, 255, 0.22)';
      ctx.strokeRect(40, 40, W - 80, H - 80);

      // Corner Ornaments (Filigree Certificate Brackets)
      const drawCorner = (cx, cy, flipX, flipY) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(flipX, flipY);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, 32);
        ctx.lineTo(0, 0);
        ctx.lineTo(32, 0);
        ctx.stroke();

        ctx.strokeStyle = '#00f5ff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(6, 24);
        ctx.lineTo(6, 6);
        ctx.lineTo(24, 6);
        ctx.stroke();
        ctx.restore();
      };
      drawCorner(46, 46, 1, 1);
      drawCorner(W - 46, 46, -1, 1);
      drawCorner(46, H - 46, 1, -1);
      drawCorner(W - 46, H - 46, -1, -1);
      ctx.restore();

      // 4. Header: Platform Brand Logo & Credential Banner
      if (brandLogoImg) {
        ctx.save();
        ctx.shadowColor = '#00f5ff';
        ctx.shadowBlur = 16;
        ctx.drawImage(brandLogoImg, (W - 68) / 2, 54, 68, 68);
        ctx.restore();
      }

      // Title & Subheading
      ctx.save();
      ctx.textAlign = 'center';

      ctx.fillStyle = '#38bdf8';
      ctx.font = '700 13px "JetBrains Mono", monospace';
      ctx.letterSpacing = '3px';
      ctx.fillText('NEXUS SPRING OF CODE 2026 • OFFICIAL OPEN SOURCE CREDENTIAL', W / 2, 148);

      // Main Certificate Title
      const titleGrad = ctx.createLinearGradient((W / 2) - 300, 0, (W / 2) + 300, 0);
      titleGrad.addColorStop(0, '#ffffff');
      titleGrad.addColorStop(0.5, '#00f5ff');
      titleGrad.addColorStop(1, '#ffffff');
      ctx.fillStyle = titleGrad;
      ctx.font = 'bold 36px "Space Grotesk", sans-serif';
      ctx.letterSpacing = '1px';
      ctx.fillText('CERTIFICATE OF ACHIEVEMENT', W / 2, 192);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 15px "Plus Jakarta Sans", sans-serif';
      ctx.letterSpacing = '0.5px';
      ctx.fillText('This credential certifies that the following developer has achieved exceptional distinction:', W / 2, 222);
      ctx.restore();

      // 5. User Profile: Original Avatar Image & Recipient Name
      const avatarY = 300;
      const avatarR = 48;

      ctx.save();
      if (userAvatarImg) {
        // Draw Circular Clipped User Avatar
        ctx.save();
        ctx.beginPath();
        ctx.arc(W / 2, avatarY, avatarR, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(userAvatarImg, (W / 2) - avatarR, avatarY - avatarR, avatarR * 2, avatarR * 2);
        ctx.restore();

        // Avatar Glowing Border Ring
        ctx.beginPath();
        ctx.arc(W / 2, avatarY, avatarR + 3, 0, Math.PI * 2);
        ctx.strokeStyle = outerGrad;
        ctx.lineWidth = 3.5;
        ctx.shadowColor = 'rgba(0, 245, 255, 0.5)';
        ctx.shadowBlur = 14;
        ctx.stroke();
      } else {
        // Fallback Initial Avatar
        const initial = (playerName || 'U').trim().charAt(0).toUpperCase();
        ctx.beginPath();
        ctx.arc(W / 2, avatarY, avatarR, 0, Math.PI * 2);
        ctx.fillStyle = 'linear-gradient(135deg, #00f5ff, #3b82f6)';
        ctx.fill();
        ctx.fillStyle = '#040b17';
        ctx.font = 'bold 44px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initial, W / 2, avatarY + 2);
      }
      ctx.restore();

      // Recipient Name
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 34px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(playerName, W / 2, 386);

      // GitHub Handle & Badge
      ctx.fillStyle = '#38bdf8';
      ctx.font = '600 17px "JetBrains Mono", monospace';
      ctx.fillText(userHandle, W / 2, 414);

      // Distinction / Rank Tier Pill
      const pillW = 460;
      const pillH = 38;
      const pillX = (W - pillW) / 2;
      const pillY = 436;

      ctx.fillStyle = 'rgba(0, 245, 255, 0.08)';
      ctx.strokeStyle = 'rgba(0, 245, 255, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, 19);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 15px "Space Grotesk", sans-serif';
      ctx.fillText(`${rank} • Total Arcade Score: ${score}`, W / 2, pillY + 24);

      // Certificate Citation Statement
      ctx.fillStyle = '#94a3b8';
      ctx.font = '400 14.5px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('In recognition of verified code contributions, game architecture, and open-source craftsmanship', W / 2, 510);
      ctx.fillText('for the ArcadeVerse platform during Nexus Spring of Code – Winter Edition 2026.', W / 2, 532);
      ctx.restore();

      // 6. Verification Seal & Signatures
      const bottomY = 625;

      // Left: Project Lead Signature Line
      ctx.save();
      ctx.textAlign = 'left';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(110, bottomY);
      ctx.lineTo(340, bottomY);
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'italic 20px "Permanent Marker", cursive, sans-serif';
      ctx.fillText('Debasmita Bose', 125, bottomY - 10);

      ctx.fillStyle = '#64748b';
      ctx.font = '600 12.5px "Space Grotesk", sans-serif';
      ctx.fillText('DEBASMITA BOSE', 110, bottomY + 20);
      ctx.font = '400 12px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Project Lead & Lead Architect', 110, bottomY + 38);
      ctx.restore();

      // Center: Official Gold Rosette Seal
      const sealX = W / 2;
      const sealY = bottomY + 8;
      const sealR = 40;

      ctx.save();
      // Outer Seal Ring
      ctx.beginPath();
      ctx.arc(sealX, sealY, sealR, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 10;
      ctx.stroke();

      // Inner Star Ring
      ctx.beginPath();
      ctx.arc(sealX, sealY, sealR - 6, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 245, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.fillText('VERIFIED', sealX, sealY - 7);
      ctx.fillStyle = '#00f5ff';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.fillText('NSOC 2026', sealX, sealY + 8);
      ctx.restore();

      // Right: Verification ID & Date Line
      ctx.save();
      ctx.textAlign = 'right';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(W - 340, bottomY);
      ctx.lineTo(W - 110, bottomY);
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 14px "JetBrains Mono", monospace';
      ctx.fillText('OCTOBER 2026', W - 110, bottomY - 10);

      ctx.fillStyle = '#64748b';
      ctx.font = '600 12.5px "Space Grotesk", sans-serif';
      ctx.fillText('OFFICIAL CREDENTIAL', W - 110, bottomY + 20);
      ctx.font = '400 12px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('verified.arcadeverse.dev', W - 110, bottomY + 38);
      ctx.restore();

      return this.canvas.toDataURL('image/png');
    },

    async downloadCard(data) {
      const dataUrl = await this.generateCard(data);
      const link = document.createElement('a');
      const filename = (data.playerName || 'contributor').toLowerCase().replace(/\s+/g, '_');
      link.download = `ArcadeVerse_Certificate_${filename}.png`;
      link.href = dataUrl;
      link.click();
    },

    bindEvents() {
      // Listen for open trophy / certificate card requests
      document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-action="open-trophy-card"]');
        if (trigger) {
          e.preventDefault();
          e.stopPropagation();
          const game = trigger.dataset.game || 'NSOC 2026 Hall of Fame';
          const score = trigger.dataset.score || '1,820 PTS';
          const player = trigger.dataset.player || 'ArcadePlayer';
          const handle = trigger.dataset.handle || '';
          const avatarUrl = trigger.dataset.avatar || '';
          const rank = trigger.dataset.rank || 'Verified Contributor';
          const badge = trigger.dataset.badge || 'NSOC 2026';
          this.showModal({ gameTitle: game, score, playerName: player, handle, avatarUrl, rank, badge });
        }
      });
    },

    async showModal(data) {
      let modal = document.getElementById('trophy-card-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'trophy-card-modal';
        modal.className = 'trophy-modal';
        modal.innerHTML = `
          <div class="trophy-modal-content">
            <div class="trophy-modal-header">
              <h3 class="trophy-modal-title">Verified Achievement Certificate</h3>
              <button class="trophy-modal-close" aria-label="Close Certificate Modal">&times;</button>
            </div>
            <div class="trophy-card-preview-wrap">
              <div id="trophy-loading-spinner" class="trophy-loading-spinner">
                <div class="spinner-ring"></div>
                <span>Rendering High-Resolution Certificate...</span>
              </div>
              <img id="trophy-preview-img" class="trophy-preview-img" style="display: none;" alt="ArcadeVerse Achievement Certificate" />
            </div>
            <div class="trophy-modal-actions">
              <button id="btn-download-trophy" class="btn-trophy primary">Download Certificate (PNG)</button>
              <button id="btn-copy-trophy" class="btn-trophy secondary">Copy Certificate</button>
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
      const spinner = modal.querySelector('#trophy-loading-spinner');
      if (spinner) spinner.style.display = 'flex';
      if (img) img.style.display = 'none';

      modal.classList.add('active');

      const dataUrl = await this.generateCard(data);

      if (img) {
        img.src = dataUrl;
        img.style.display = 'block';
      }
      if (spinner) spinner.style.display = 'none';

      const btnDownload = modal.querySelector('#btn-download-trophy');
      btnDownload.onclick = () => this.downloadCard(data);

      const btnCopy = modal.querySelector('#btn-copy-trophy');
      btnCopy.onclick = async () => {
        try {
          const blob = await (await fetch(dataUrl)).blob();
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          btnCopy.textContent = 'Certificate Copied to Clipboard!';
          setTimeout(() => { btnCopy.textContent = 'Copy Certificate'; }, 2000);
        } catch (_) {
          this.downloadCard(data);
        }
      };
    }
  };

  window.TrophyCardEngine = TrophyCardEngine;
  document.addEventListener('DOMContentLoaded', () => TrophyCardEngine.init());
})();
