/**
 * Halloween Escape: Witch's Crypt
 * Pure Vanilla JavaScript & HTML5 Canvas Escape Room Experience
 * Author: Debasmita Bose (DebasmitaBose0)
 */

(() => {
  'use strict';

  // --- SVG Icons Definition (Zero Unicode Emojis) ---
  const SVG_ICONS = {
    bone_key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-1-1l-3 3m2 8A6 6 0 1 1 5 8a6 6 0 0 1 12 6z"></path><circle cx="9" cy="14" r="1.5"></circle></svg>',
    dagger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"></polyline><line x1="13" y1="19" x2="19" y2="13"></line><line x1="16" y1="16" x2="20" y2="20"></line><line x1="19" y1="21" x2="21" y2="19"></line></svg>',
    venom: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path></svg>',
    root: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22v-9"></path><path d="M12 13c-3-2-6-1-7 2"></path><path d="M12 13c3-2 6-1 7 2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
    ash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2c1.5 3 4 5 4 8a4 4 0 0 1-8 0c0-3 2.5-5 4-8z"></path><line x1="8" y1="18" x2="16" y2="18"></line><line x1="9" y1="21" x2="15" y2="21"></line></svg>',
    acid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h12l-2 5a6 6 0 1 1-8 0L6 3z"></path><circle cx="12" cy="15" r="1"></circle></svg>',
    gilded_key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7.5" cy="15.5" r="5.5"></circle><path d="M11.5 11.5L22 1"></path><path d="M18 5l2 2"></path><path d="M15 8l2 2"></path></svg>',
    sigil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>'
  };

  const ITEM_NAMES = {
    bone_key: 'Bone Key',
    dagger: 'Silver Dagger',
    venom: 'Spider Venom',
    root: 'Mandrake Root',
    ash: 'Cursed Ash',
    acid: 'Acidic Elixir',
    gilded_key: 'Gilded Key',
    sigil: 'Eye Talisman'
  };

  // Dial symbols for Runic Pedestal
  const DIAL_SYMBOLS = [
    { id: 'skull', label: 'Skull' },
    { id: 'moon', label: 'Crescent Moon' },
    { id: 'pumpkin', label: 'Jack-o-Lantern' },
    { id: 'bat', label: 'Night Bat' }
  ];

  // Sound Engine using Web Audio API
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

    playClick() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    }

    playUnlock() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.12);
      osc.frequency.setValueAtTime(880, this.ctx.currentTime + 0.24);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.45);
    }

    playError() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, this.ctx.currentTime);
      osc.frequency.setValueAtTime(120, this.ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    }

    playBrew() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(300 + Math.random() * 200, this.ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(600 + Math.random() * 200, this.ctx.currentTime + 0.15);
          gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.15);
        }, i * 110);
      }
    }

    playVictory() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      const notes = [392, 440, 523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
          gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.5);
        }, idx * 160);
      });
    }
  }

  // --- Game State ---
  const state = {
    secondsElapsed: 0,
    timerActive: true,
    gameWon: false,
    selectedItem: null,
    inventory: [], // string keys

    // Puzzles status
    bookshelfSequence: [],
    bookshelfSolved: false,

    plantSearched: false,

    cauldron: {
      venom: false,
      root: false,
      ash: false,
      brewed: false
    },

    pedestalDials: [0, 0, 0], // indices into DIAL_SYMBOLS
    pedestalSolved: false,

    chestUnlocked: false,

    gateLocks: {
      chains: false,  // requires acid
      keyhole: false, // requires gilded_key
      sigil: false    // requires sigil
    }
  };

  const sound = new SoundEngine();

  // --- DOM Elements ---
  const canvas = document.getElementById('roomCanvas');
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  const timerBox = document.getElementById('timerBox');
  const cryptToast = document.getElementById('cryptToast');
  const escapeText = document.getElementById('escapeText');
  const inventorySlots = document.getElementById('inventorySlots');
  const invDetail = document.getElementById('invDetail');

  // Modals
  const modalBookshelf = document.getElementById('modalBookshelf');
  const modalCauldron = document.getElementById('modalCauldron');
  const modalPedestal = document.getElementById('modalPedestal');
  const modalTorches = document.getElementById('modalTorches');
  const modalChest = document.getElementById('modalChest');
  const modalGate = document.getElementById('modalGate');
  const modalHelp = document.getElementById('modalHelp');
  const modalVictory = document.getElementById('modalVictory');

  // Hotspots
  const hotspotGate = document.getElementById('hotspotGate');
  const hotspotBooks = document.getElementById('hotspotBooks');
  const hotspotCauldron = document.getElementById('hotspotCauldron');
  const hotspotPedestal = document.getElementById('hotspotPedestal');
  const hotspotChest = document.getElementById('hotspotChest');
  const hotspotTorches = document.getElementById('hotspotTorches');
  const hotspotPlant = document.getElementById('hotspotPlant');

  let toastTimeout = null;
  function showToast(msg) {
    if (toastTimeout) clearTimeout(toastTimeout);
    cryptToast.textContent = msg;
    cryptToast.classList.add('active');
    toastTimeout = setTimeout(() => {
      cryptToast.classList.remove('active');
    }, 3200);
  }

  
  // --- Smart Contextual Hint System ---
  document.getElementById('hintBtn').addEventListener('click', () => {
    sound.playClick();
    if (!state.bookshelfSolved) {
      showToast('Hint: Inspect Bookshelf. Pull: Blood (Red), Dusk (Blue), Vine (Green), Void (Purple).');
    } else if (!state.plantSearched) {
      showToast('Hint: Click the Dead Nightshade Pot on the bottom-left to dig up Mandrake Root.');
    } else if (!state.inventory.includes('ash') && !state.cauldron.ash) {
      showToast('Hint: Inspect the Wall Torches on the upper-right to scrape Cursed Ash with the Silver Dagger.');
    } else if (!state.cauldron.brewed) {
      showToast('Hint: Inspect the Cauldron and add Spider Venom, Mandrake Root, and Cursed Ash to brew Acidic Elixir.');
    } else if (!state.pedestalSolved) {
      showToast('Hint: Inspect Runic Pedestal on the right. Align symbols: Moon, Pumpkin, Skull.');
    } else if (!state.inventory.includes('gilded_key') && !state.gateLocks.keyhole) {
      showToast('Hint: Inspect the Bone Relic Chest on the far right using the Bone Key from the pedestal.');
    } else {
      showToast('Hint: Inspect the Iron Crypt Gate and use Acidic Elixir, Gilded Key, and Eye Talisman to escape!');
    }
  });

  // --- Particle & Canvas Graphic System ---
  const particles = [];
  for (let i = 0; i < 45; i++) {
    particles.push({
      x: Math.random() * 960,
      y: Math.random() * 540,
      size: 1 + Math.random() * 2.5,
      speedY: -0.2 - Math.random() * 0.4,
      speedX: (Math.random() - 0.5) * 0.3,
      alpha: 0.2 + Math.random() * 0.6,
      color: Math.random() > 0.4 ? 'rgba(157, 78, 221,' : 'rgba(255, 119, 0,'
    });
  }

  const VW = 960;
  const VH = 540;

  function renderRoom(time) {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.save();
    ctx.scale(w / VW, h / VH);

    // Stone background gradient
    const wallGrad = ctx.createLinearGradient(0, 0, 0, VH);
    wallGrad.addColorStop(0, '#0a0512');
    wallGrad.addColorStop(0.65, '#190e2b');
    wallGrad.addColorStop(1, '#0e0717');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, VW, VH);

    // Stone bricks pattern
    ctx.strokeStyle = 'rgba(78, 41, 116, 0.25)';
    ctx.lineWidth = 2;
    for (let y = 60; y < 340; y += 45) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(VW, y);
      ctx.stroke();
      const offset = (y / 45) % 2 === 0 ? 0 : 40;
      for (let x = offset; x < VW; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 45);
        ctx.stroke();
      }
    }

    // Cobblestone floor with perspective
    const horizon = 340;
    ctx.fillStyle = '#0f081c';
    ctx.fillRect(0, horizon, VW, VH - horizon);

    ctx.strokeStyle = 'rgba(110, 50, 160, 0.35)';
    for (let x = -100; x < VW + 100; x += 60) {
      ctx.beginPath();
      ctx.moveTo(VW / 2, horizon - 50);
      ctx.lineTo(x, VH);
      ctx.stroke();
    }
    for (let y = horizon; y < VH; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(VW, y);
      ctx.stroke();
    }

    // 1. Center Gothic Iron Crypt Gate
    ctx.fillStyle = '#05020a';
    ctx.beginPath();
    ctx.roundRect(390, 110, 180, 240, [90, 90, 0, 0]);
    ctx.fill();
    ctx.strokeStyle = '#58337a';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Moonbeam through gate
    const moonBeam = ctx.createLinearGradient(480, 110, 480, 450);
    moonBeam.addColorStop(0, 'rgba(0, 242, 254, 0.25)');
    moonBeam.addColorStop(1, 'rgba(0, 242, 254, 0)');
    ctx.fillStyle = moonBeam;
    ctx.beginPath();
    ctx.moveTo(480, 110);
    ctx.lineTo(340, 460);
    ctx.lineTo(620, 460);
    ctx.closePath();
    ctx.fill();

    // Gate vertical bars
    ctx.strokeStyle = state.gateLocks.chains && state.gateLocks.keyhole && state.gateLocks.sigil ? '#38ef7d' : '#443254';
    ctx.lineWidth = 5;
    for (let bx = 415; bx <= 545; bx += 26) {
      ctx.beginPath();
      ctx.moveTo(bx, 130);
      ctx.lineTo(bx, 350);
      ctx.stroke();
    }

    // 2. Grimoire Bookshelf (Left)
    ctx.fillStyle = '#221133';
    ctx.fillRect(110, 150, 100, 190);
    ctx.strokeStyle = '#58337a';
    ctx.lineWidth = 3;
    ctx.strokeRect(110, 150, 100, 190);
    ctx.fillStyle = '#3c1d5a';
    ctx.fillRect(112, 210, 96, 8);
    ctx.fillRect(112, 275, 96, 8);
    const bookColors = ['#ff3366', '#38ef7d', '#00f2fe', '#9d4edd', '#ff9800'];
    for (let bi = 0; bi < 5; bi++) {
      ctx.fillStyle = bookColors[bi];
      ctx.fillRect(122 + bi * 18, 168, 14, 42);
      ctx.fillRect(122 + bi * 18, 233, 14, 42);
    }

    // 3. Alchemical Cauldron (Center-Left)
    const cx = 240, cy = 345;
    const cGlow = ctx.createRadialGradient(cx, cy, 5, cx, cy, 60);
    cGlow.addColorStop(0, state.cauldron.brewed ? 'rgba(56, 239, 125, 0.45)' : 'rgba(157, 78, 221, 0.4)');
    cGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = cGlow;
    ctx.fillRect(cx - 70, cy - 50, 140, 120);

    ctx.fillStyle = '#1c102a';
    ctx.beginPath();
    ctx.arc(cx, cy + 15, 36, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#58337a';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = state.cauldron.brewed ? '#38ef7d' : '#9d4edd';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 15, 34, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4. Runic Pedestal (Center-Right)
    const px = 700, py = 360;
    ctx.fillStyle = '#24143a';
    ctx.beginPath();
    ctx.moveTo(px - 35, py + 35);
    ctx.lineTo(px + 35, py + 35);
    ctx.lineTo(px + 25, py - 20);
    ctx.lineTo(px - 25, py - 20);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#6e389e';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = state.pedestalSolved ? '#00f2fe' : '#ff7700';
    ctx.beginPath();
    ctx.ellipse(px, py - 20, 26, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // 5. Wall Braziers & Flickering Torches
    const flameFlicker = Math.sin(time * 0.01) * 3;
    const drawTorch = (tx, ty) => {
      ctx.fillStyle = '#2e1c42';
      ctx.fillRect(tx - 3, ty, 6, 26);
      const fGlow = ctx.createRadialGradient(tx, ty - 6, 2, tx, ty - 6, 32);
      fGlow.addColorStop(0, 'rgba(255, 170, 50, 0.6)');
      fGlow.addColorStop(1, 'rgba(255, 170, 50, 0)');
      ctx.fillStyle = fGlow;
      ctx.beginPath();
      ctx.arc(tx, ty - 6, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffaa32';
      ctx.beginPath();
      ctx.ellipse(tx, ty - 8 + flameFlicker * 0.4, 7, 14 + flameFlicker * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff4cc';
      ctx.beginPath();
      ctx.ellipse(tx, ty - 5, 3.5, 7, 0, 0, Math.PI * 2);
      ctx.fill();
    };
    drawTorch(280, 160);
    drawTorch(680, 160);

    // 6. Cobwebs in corners
    ctx.strokeStyle = 'rgba(200, 180, 230, 0.15)';
    ctx.lineWidth = 1;
    for (let r = 15; r < 90; r += 20) {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI / 2);
      ctx.stroke();
    }
    for (let r = 15; r < 90; r += 20) {
      ctx.beginPath();
      ctx.arc(VW, 0, r, Math.PI / 2, Math.PI);
      ctx.stroke();
    }

    ctx.restore();

    // 7. Atmospheric floating particles (in screen space)
    particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;
      if (p.y < 0) {
        p.y = h;
        p.x = Math.random() * w;
      }
      ctx.fillStyle = `${p.color} ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(renderRoom);
  }
  requestAnimationFrame(renderRoom);

  // --- Inventory Management ---
  function updateInventoryUI() {
    inventorySlots.innerHTML = '';
    for (let i = 0; i < 6; i++) {
      const slot = document.createElement('div');
      slot.className = 'inv-slot';
      const itemKey = state.inventory[i];
      if (itemKey) {
        slot.innerHTML = SVG_ICONS[itemKey] || '';
        slot.title = ITEM_NAMES[itemKey] || itemKey;
        if (state.selectedItem === itemKey) {
          slot.classList.add('selected');
        }
        slot.addEventListener('click', () => {
          sound.playClick();
          if (state.selectedItem === itemKey) {
            state.selectedItem = null;
            invDetail.textContent = 'Item deselected. Tap an object or item.';
          } else {
            state.selectedItem = itemKey;
            invDetail.textContent = `Selected: ${ITEM_NAMES[itemKey]}. Tap an object to use it.`;
          }
          updateInventoryUI();
        });
      } else {
        slot.title = 'Empty slot';
      }
      inventorySlots.appendChild(slot);
    }
  }

  
  function updateEscapeTracker() {
    if (!escapeText) return;
    if (!state.bookshelfSolved) {
      escapeText.textContent = 'Step 1: Inspect the Bookshelf on the left. Pull: Blood, Dusk, Vine, Void.';
    } else if (!state.plantSearched) {
      escapeText.textContent = 'Step 2: Inspect the Dead Nightshade Pot on the bottom left for Mandrake Root.';
    } else if (!state.inventory.includes('ash') && !state.cauldron.ash) {
      escapeText.textContent = 'Step 3: Inspect Wall Torches to gather Cursed Ash with the Silver Dagger.';
    } else if (!state.cauldron.brewed) {
      escapeText.textContent = 'Step 4: Combine Venom, Mandrake, and Ash in the Cauldron to brew Acid.';
    } else if (!state.pedestalSolved) {
      escapeText.textContent = 'Step 5: Inspect Runic Pedestal. Align symbols: Moon, Pumpkin, Skull.';
    } else if (!state.inventory.includes('gilded_key') && !state.gateLocks.keyhole) {
      escapeText.textContent = 'Step 6: Open the Bone Relic Chest with the Bone Key to get the Master Key.';
    } else {
      escapeText.textContent = 'Step 7: Click the Iron Crypt Gate and unlock the 3 seals to escape!';
    }
  }

  function addItem(itemKey) {
    if (!state.inventory.includes(itemKey)) {
      state.inventory.push(itemKey);
      sound.playUnlock();
      updateInventoryUI();
      showToast(`Obtained: ${ITEM_NAMES[itemKey]}!`);
    }
  }

  function removeItem(itemKey) {
    const idx = state.inventory.indexOf(itemKey);
    if (idx !== -1) {
      state.inventory.splice(idx, 1);
      if (state.selectedItem === itemKey) {
        state.selectedItem = null;
      }
      updateInventoryUI();
    }
  }

  // --- Modal Helpers ---
  function openModal(modal) {
    sound.playClick();
    modal.classList.add('open');
  }

  function closeModal(modal) {
    sound.playClick();
    modal.classList.remove('open');
  }

  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-close');
      const targetModal = document.getElementById(targetId);
      if (targetModal) closeModal(targetModal);
    });
  });

  // --- Puzzle 1: Bookshelf Logic ---
  const expectedBookSequence = ['red', 'blue', 'green', 'purple'];
  const booksRow = document.getElementById('booksRow');
  const bookshelfStatus = document.getElementById('bookshelfStatus');
  const resetBooksBtn = document.getElementById('resetBooksBtn');

  booksRow.querySelectorAll('.book').forEach(book => {
    book.addEventListener('click', () => {
      if (state.bookshelfSolved) {
        bookshelfStatus.textContent = 'The secret drawer has already opened.';
        return;
      }
      sound.playClick();
      const col = book.getAttribute('data-color');
      state.bookshelfSequence.push(col);

      // Check current sequence
      const idx = state.bookshelfSequence.length - 1;
      if (state.bookshelfSequence[idx] !== expectedBookSequence[idx]) {
        sound.playError();
        bookshelfStatus.textContent = 'The mechanism resets with a grinding thud...';
        state.bookshelfSequence = [];
        return;
      }

      if (state.bookshelfSequence.length === expectedBookSequence.length) {
        state.bookshelfSolved = true; updateEscapeTracker();
        sound.playUnlock();
        bookshelfStatus.textContent = 'A hidden drawer slides open! You found the Silver Dagger and Spider Venom!';
        addItem('dagger');
        addItem('venom');
      } else {
        bookshelfStatus.textContent = `A stone tumbler clicks... (${state.bookshelfSequence.length}/4)`;
      }
    });
  });

  resetBooksBtn.addEventListener('click', () => {
    sound.playClick();
    state.bookshelfSequence = [];
    bookshelfStatus.textContent = 'Sequence reset.';
  });

  // --- Puzzle 2: Dead Plant Pot (Mandrake Root) ---
  hotspotPlant.addEventListener('click', () => {
    if (!state.plantSearched) {
      state.plantSearched = true; updateEscapeTracker();
      addItem('root');
      showToast('You pulled a shriveled Mandrake Root from the dead soil.');
    } else {
      showToast('The urn is empty now.');
    }
  });

  // --- Puzzle 3: Wall Torches / Braziers ---
  const gatherAshBtn = document.getElementById('gatherAshBtn');
  const torchesStatus = document.getElementById('torchesStatus');

  gatherAshBtn.addEventListener('click', () => {
    if (state.inventory.includes('ash')) {
      torchesStatus.textContent = 'You already have enough cursed ash.';
      return;
    }
    if (state.selectedItem === 'dagger' || state.inventory.includes('dagger')) {
      addItem('ash');
      torchesStatus.textContent = 'Using the silver blade, you scooped smoldering Cursed Ash without burning yourself.';
      sound.playUnlock();
    } else {
      sound.playError();
      torchesStatus.textContent = 'The flames are too scorching to touch with bare hands. You need a cold silver blade!';
    }
  });

  // --- Puzzle 4: Witch's Cauldron ---
  const brewCauldronBtn = document.getElementById('brewCauldronBtn');
  const cauldronStatus = document.getElementById('cauldronStatus');
  const badgeVenom = document.getElementById('badgeVenom');
  const badgeRoot = document.getElementById('badgeRoot');
  const badgeAsh = document.getElementById('badgeAsh');

  brewCauldronBtn.addEventListener('click', () => {
    if (state.cauldron.brewed) {
      cauldronStatus.textContent = 'You have already brewed the Acidic Elixir.';
      return;
    }

    if (!state.selectedItem) {
      cauldronStatus.textContent = 'Select an ingredient from your inventory first.';
      return;
    }

    if (state.selectedItem === 'venom') {
      state.cauldron.venom = true;
      removeItem('venom');
      badgeVenom.classList.add('added');
      sound.playBrew();
      cauldronStatus.textContent = 'Added Spider Venom. The potion turns dark violet.';
    } else if (state.selectedItem === 'root') {
      state.cauldron.root = true;
      removeItem('root');
      badgeRoot.classList.add('added');
      sound.playBrew();
      cauldronStatus.textContent = 'Added Mandrake Root. The potion begins to foam.';
    } else if (state.selectedItem === 'ash') {
      state.cauldron.ash = true;
      removeItem('ash');
      badgeAsh.classList.add('added');
      sound.playBrew();
      cauldronStatus.textContent = 'Added Cursed Ash. Sparkles of green vapor erupt!';
    } else {
      sound.playError();
      cauldronStatus.textContent = 'That item does not belong in this alchemical formula.';
      return;
    }

    if (state.cauldron.venom && state.cauldron.root && state.cauldron.ash) {
      state.cauldron.brewed = true; updateEscapeTracker();
      sound.playBrew();
      sound.playUnlock();
      addItem('acid');
      cauldronStatus.textContent = 'SUCCESS! The brew turns into a glowing, corroding Acidic Elixir!';
    }
  });

  // --- Puzzle 5: Runic Pedestal ---
  // Expected dials: Moon (1), Pumpkin (2), Skull (0)
  const dialDisplay0 = document.getElementById('dialDisplay0');
  const dialDisplay1 = document.getElementById('dialDisplay1');
  const dialDisplay2 = document.getElementById('dialDisplay2');
  const checkPedestalBtn = document.getElementById('checkPedestalBtn');
  const pedestalStatus = document.getElementById('pedestalStatus');

  function renderDial(idx, el) {
    const sym = DIAL_SYMBOLS[state.pedestalDials[idx]];
    let iconSvg = '';
    if (sym.id === 'skull') {
      iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="10" r="7"></circle><circle cx="9" cy="10" r="1.5"></circle><circle cx="15" cy="10" r="1.5"></circle><path d="M9 17v4m6-4v4"></path></svg>';
    } else if (sym.id === 'moon') {
      iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
    } else if (sym.id === 'pumpkin') {
      iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"></circle><path d="M12 3v3m-4 6l2 2-2 2m8-4l-2 2 2 2"></path></svg>';
    } else { // bat
      iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12c4 0 6-6 10-6s6 6 10 6c-3 4-5 8-10 8s-7-4-10-8z"></path></svg>';
    }
    el.innerHTML = iconSvg;
    el.title = sym.label;
  }

  function updateAllDials() {
    renderDial(0, dialDisplay0);
    renderDial(1, dialDisplay1);
    renderDial(2, dialDisplay2);
  }
  updateAllDials();

  document.querySelectorAll('.dial-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sound.playClick();
      const dialIdx = parseInt(btn.getAttribute('data-dial'), 10);
      const dir = btn.getAttribute('data-dir');
      if (dir === 'up') {
        state.pedestalDials[dialIdx] = (state.pedestalDials[dialIdx] + 1) % DIAL_SYMBOLS.length;
      } else {
        state.pedestalDials[dialIdx] = (state.pedestalDials[dialIdx] - 1 + DIAL_SYMBOLS.length) % DIAL_SYMBOLS.length;
      }
      updateAllDials();
    });
  });

  checkPedestalBtn.addEventListener('click', () => {
    if (state.pedestalSolved) {
      pedestalStatus.textContent = 'The pedestal compartment is already open.';
      return;
    }
    // Expected: Moon (1), Pumpkin (2), Skull (0)
    if (state.pedestalDials[0] === 1 && state.pedestalDials[1] === 2 && state.pedestalDials[2] === 0) {
      state.pedestalSolved = true; updateEscapeTracker();
      sound.playUnlock();
      pedestalStatus.textContent = 'The celestial discs chime in harmony! The pedestal opens to reveal a Gilded Key and Bone Key!';
      addItem('gilded_key');
      addItem('bone_key');
    } else {
      sound.playError();
      pedestalStatus.textContent = 'The symbols do not align with the ancient verse.';
    }
  });

  // --- Puzzle 6: Relic Chest / Sarcophagus ---
  const unlockChestBtn = document.getElementById('unlockChestBtn');
  const chestStatus = document.getElementById('chestStatus');

  unlockChestBtn.addEventListener('click', () => {
    if (state.chestUnlocked) {
      chestStatus.textContent = 'The relic chest is already unlocked.';
      return;
    }
    if (state.selectedItem === 'bone_key' || state.inventory.includes('bone_key')) {
      state.chestUnlocked = true;
      removeItem('bone_key');
      sound.playUnlock();
      addItem('sigil');
      chestStatus.textContent = 'The bone key clicks in the lock! Inside lies the ancient Eye Talisman!';
    } else {
      sound.playError();
      chestStatus.textContent = 'You need a key crafted of bone to turn this lock.';
    }
  });

  // --- Final Escape: The Iron Crypt Gate ---
  const interactGateBtn = document.getElementById('interactGateBtn');
  const gateStatus = document.getElementById('gateStatus');
  const lockChains = document.getElementById('lockChains');
  const lockKeyhole = document.getElementById('lockKeyhole');
  const lockSigil = document.getElementById('lockSigil');

  function updateGateLocksUI() {
    if (state.gateLocks.chains) lockChains.classList.add('unlocked');
    if (state.gateLocks.keyhole) lockKeyhole.classList.add('unlocked');
    if (state.gateLocks.sigil) lockSigil.classList.add('unlocked');
  }

  interactGateBtn.addEventListener('click', () => {
    if (state.gameWon) return;

    if (!state.selectedItem) {
      gateStatus.textContent = 'Select an item from your inventory to use on the gate.';
      return;
    }

    if (state.selectedItem === 'acid' && !state.gateLocks.chains) {
      state.gateLocks.chains = true;
      removeItem('acid');
      sound.playUnlock();
      gateStatus.textContent = 'The acid dissolves the heavy corroded chains in a cloud of fizzing steam!';
      updateGateLocksUI();
    } else if (state.selectedItem === 'gilded_key' && !state.gateLocks.keyhole) {
      state.gateLocks.keyhole = true;
      removeItem('gilded_key');
      sound.playUnlock();
      gateStatus.textContent = 'The gilded key slides into the master lock and turns with a loud CLACK!';
      updateGateLocksUI();
    } else if (state.selectedItem === 'sigil' && !state.gateLocks.sigil) {
      state.gateLocks.sigil = true;
      removeItem('sigil');
      sound.playUnlock();
      gateStatus.textContent = 'The Eye Talisman fits into the socket, breaking the dark magical ward!';
      updateGateLocksUI();
    } else {
      sound.playError();
      gateStatus.textContent = 'That item does not affect the gate locks.';
    }

    // Check Victory Condition
    if (state.gateLocks.chains && state.gateLocks.keyhole && state.gateLocks.sigil) {
      state.gameWon = true;
      state.timerActive = false;
      sound.playVictory();
      setTimeout(() => {
        closeModal(modalGate);
        document.getElementById('vicTime').textContent = timerBox.textContent;
        const totalSec = state.secondsElapsed;
        let rank = 'Crypt Novice';
        if (totalSec < 120) rank = 'Archmage Master';
        else if (totalSec < 240) rank = 'Arcane Sleuth';
        else if (totalSec < 360) rank = 'Crypt Escapist';
        document.getElementById('vicRating').textContent = rank;
        openModal(modalVictory);
      }, 900);
    }
  });

  // --- Hotspots Click Bindings ---
  hotspotGate.addEventListener('click', () => openModal(modalGate));
  hotspotBooks.addEventListener('click', () => openModal(modalBookshelf));
  hotspotCauldron.addEventListener('click', () => openModal(modalCauldron));
  hotspotPedestal.addEventListener('click', () => openModal(modalPedestal));
  hotspotChest.addEventListener('click', () => openModal(modalChest));
  hotspotTorches.addEventListener('click', () => openModal(modalTorches));

  // --- Header Controls ---
  document.getElementById('helpBtn').addEventListener('click', () => openModal(modalHelp));

  const soundToggle = document.getElementById('soundToggle');
  const soundIcon = document.getElementById('soundIcon');
  soundToggle.addEventListener('click', () => {
    sound.muted = !sound.muted;
    if (sound.muted) {
      soundIcon.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>';
      showToast('Sound Muted');
    } else {
      sound.init();
      soundIcon.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>';
      showToast('Sound Enabled');
    }
  });

  const hintBtn = document.getElementById('hintBtn');
  hintBtn.addEventListener('click', () => {
    sound.playClick();
    if (!state.bookshelfSolved) {
      showToast('Hint: The riddle says "Blood precedes the Void; the Toxic Vine creeps after Dusk..."');
    } else if (!state.inventory.includes('ash') && !state.cauldron.ash) {
      showToast('Hint: Scrape the smoldering braziers using your silver dagger to gather ash.');
    } else if (!state.plantSearched) {
      showToast('Hint: Inspect the dead nightshade plant in the corner.');
    } else if (!state.cauldron.brewed) {
      showToast('Hint: Throw the Spider Venom, Mandrake Root, and Cursed Ash into the cauldron.');
    } else if (!state.pedestalSolved) {
      showToast('Hint: Rotate the altar discs: "Moon crowns Pumpkin, Death (Skull) sleeps".');
    } else if (!state.chestUnlocked) {
      showToast('Hint: Use the Bone Key to unlock the Sarcophagus Relic Chest.');
    } else {
      showToast('Hint: Apply the Acid, Gilded Key, and Eye Talisman to the Iron Gate!');
    }
  });

  document.getElementById('playAgainBtn').addEventListener('click', () => {
    window.location.reload();
  });

  // --- Timer Loop ---
  setInterval(() => {
    if (!state.timerActive) return;
    state.secondsElapsed++;
    const m = Math.floor(state.secondsElapsed / 60).toString().padStart(2, '0');
    const s = (state.secondsElapsed % 60).toString().padStart(2, '0');
    timerBox.textContent = `${m}:${s}`;
  }, 1000);

  // Initial inventory render
  updateInventoryUI();
})();

