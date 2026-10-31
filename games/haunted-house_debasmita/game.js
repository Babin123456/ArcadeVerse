/**
 * Haunted House: The Curse Within
 * Professional First-Person Mystery Horror Experience
 * Author: Debasmita Bose (DebasmitaBose0)
 */

(() => {
  'use strict';

  // --- SVG Icons (Zero Unicode Emojis) ---
  const SVG_ICONS = {
    brass_key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-1-1l-3 3m2 8A6 6 0 1 1 5 8a6 6 0 0 1 12 6z"></path><circle cx="9" cy="14" r="1.5"></circle></svg>',
    silver_key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7.5" cy="15.5" r="5.5"></circle><path d="M11.5 11.5L22 1"></path><path d="M18 5l2 2"></path></svg>',
    basement_key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"></rect><circle cx="12" cy="16" r="2"></circle><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>',
    matches: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line><path d="M12 2c1.5 3 4 5 4 8a4 4 0 0 1-8 0c0-3 2.5-5 4-8z"></path></svg>',
    batteries: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="16" height="10" rx="2"></rect><line x1="22" y1="11" x2="22" y2="13"></line></svg>',
    tome: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>',
    locket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="14" r="6"></circle><path d="M12 2v6"></path><path d="M9 5h6"></path></svg>',
    salt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"></circle><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>'
  };

  const ITEM_NAMES = {
    brass_key: 'Rusty Brass Key',
    silver_key: 'Parlor Silver Key',
    basement_key: 'Iron Crypt Key',
    matches: 'Box of Matchsticks',
    batteries: 'Flashlight Batteries',
    tome: 'Tome of Shadows',
    locket: "Eleanor's Golden Locket",
    salt: 'Consecrated Holy Salt'
  };

  // --- Web Audio Procedural Horror Sound Engine ---
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.muted = false;
      this.heartbeatInterval = null;
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
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    }

    playCreak() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(90, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(160, this.ctx.currentTime + 0.35);
      osc.frequency.linearRampToValueAtTime(70, this.ctx.currentTime + 0.7);
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.7);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.7);
    }

    playThunder() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      // Low boom
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(80, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(25, this.ctx.currentTime + 1.4);
      gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 1.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 1.4);
    }

    playHeartbeat() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      // Thump-thump
      [0, 0.18].forEach(delay => {
        setTimeout(() => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(65, this.ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.12);
          gain.gain.setValueAtTime(0.28, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.12);
        }, delay * 1000);
      });
    }

    playWhisper() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(320, this.ctx.currentTime + 0.4);
      osc.frequency.linearRampToValueAtTime(220, this.ctx.currentTime + 0.9);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.9);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.9);
    }

    playMusicBox() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      // Haunting minor chime melody: E5, G5, B5, A5, G5, E5
      const notes = [659.25, 783.99, 987.77, 880.00, 783.99, 659.25];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
          gain.gain.setValueAtTime(0.22, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.55);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.55);
        }, idx * 280);
      });
    }

    playJumpscare() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(540, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(70, this.ctx.currentTime + 0.6);
      gain.gain.setValueAtTime(0.45, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.65);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.65);
    }
  }

  const sound = new SoundEngine();

  // --- Game State ---
  const state = {
    currentRoom: 'porch',
    unlockedRooms: ['porch'],
    inventory: [],
    selectedItem: null,
    sanity: 100,
    battery: 100,
    flashlightOn: true,
    isHiding: false,
    threatLevel: 'quiet', // 'quiet', 'whisper', 'danger'
    threatTimer: 0,
    dangerCountdown: 0,
    mousePos: { x: 480, y: 270 },

    // Journal Lore
    journal: [],

    // Puzzles & Story Flags
    porchKeyFound: false,
    foyerDoorUnlocked: false,
    gramophonePlayed: false,
    safeUnlocked: false,
    safeDigits: [1, 8, 9, 0], // expected: 1 8 9 8
    bookshelfOpened: false,
    breakerSwitches: [false, true, false, false], // expected: [true, false, true, true]
    breakerEngaged: false,
    musicBoxOpened: false,
    saltFound: false,
    altarCleansed: false,
    gameEnded: false
  };

  // --- DOM References ---
  const canvas = document.getElementById('mansionCanvas');
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  const sanityBar = document.getElementById('sanityBar');
  const batteryBar = document.getElementById('batteryBar');
  const threatBadge = document.getElementById('threatBadge');
  const panicVignette = document.getElementById('panicVignette');
  const lightningFx = document.getElementById('lightningFx');
  const paranormalBanner = document.getElementById('paranormalBanner');
  const dockHint = document.getElementById('dockHint');
  const inventoryTray = document.getElementById('inventoryTray');
  const hotspotsLayer = document.getElementById('hotspotsLayer');
  const btnFlashlight = document.getElementById('btnFlashlight');
  const lightLabel = document.getElementById('lightLabel');
  const btnHide = document.getElementById('btnHide');
  const hideLabel = document.getElementById('hideLabel');
  const btnJournal = document.getElementById('btnJournal');

  // Modals
  const modalJournal = document.getElementById('modalJournal');
  const journalContent = document.getElementById('journalContent');
  const modalSafe = document.getElementById('modalSafe');
  const modalBreaker = document.getElementById('modalBreaker');
  const modalAltar = document.getElementById('modalAltar');
  const modalHelp = document.getElementById('modalHelp');
  const modalEnding = document.getElementById('modalEnding');
  const endingTitle = document.getElementById('endingTitle');
  const endingText = document.getElementById('endingText');

  // --- Room Definitions & Hotspots ---
  const ROOM_CONFIGS = {
    porch: {
      name: 'Entrance Porch',
      hint: 'The iron entrance door is barred with an old brass lock. Search the overgrown steps.',
      hotspots: [
        {
          id: 'doormat',
          top: '80%',
          left: '43.5%',
          width: '9%',
          height: '8%',
          tag: 'Mossy Doormat',
          onClick: () => {
            if (!state.porchKeyFound) {
              state.porchKeyFound = true;
              addItem('brass_key');
              addJournalEntry('Torn Welcome Note (1898)', '"If you seek shelter from the storm, the key rests beneath the moss. But know this: once the threshold is crossed, the manor does not let go."');
              setHint('You found a Rusty Brass Key beneath the moldy doormat!');
            } else {
              setHint('Nothing else beneath the damp mat.');
            }
          }
        },
        {
          id: 'frontDoor',
          top: '20%',
          left: '41%',
          width: '14%',
          height: '43%',
          tag: 'Mansion Front Entrance',
          onClick: () => {
            if (!state.foyerDoorUnlocked) {
              if (state.selectedItem === 'brass_key' || state.inventory.includes('brass_key')) {
                state.foyerDoorUnlocked = true;
                unlockRoom('foyer');
                sound.playCreak();
                setHint('The brass key turns with a loud heavy click! The front entrance swings open.');
                switchRoom('foyer');
              } else {
                sound.playCreak();
                setHint('The heavy wooden door is locked tight. It needs a brass key.');
              }
            } else {
              switchRoom('foyer');
            }
          }
        },
        {
          id: 'gargoyle',
          top: '40%',
          left: '16%',
          width: '9%',
          height: '16%',
          tag: 'Weathered Gargoyle',
          onClick: () => {
            sound.playClick();
            setHint('A stone gargoyle weathered by a century of acid rain. Its hollow eyes seem to stare right at you.');
          }
        }
      ]
    },

    foyer: {
      name: 'Grand Foyer',
      hint: 'The central foyer. Doors lead into the Living Room, Library, Kitchen, and Cellar.',
      hotspots: [
        {
          id: 'doorParlor',
          top: '32%',
          left: '6%',
          width: '10%',
          height: '28%',
          tag: 'Living Room Door',
          onClick: () => {
            unlockRoom('parlor');
            switchRoom('parlor');
          }
        },
        {
          id: 'doorKitchen',
          top: '32%',
          left: '84%',
          width: '10%',
          height: '28%',
          tag: 'Kitchen Door',
          onClick: () => {
            unlockRoom('kitchen');
            switchRoom('kitchen');
          }
        },
        {
          id: 'clockFoyer',
          top: '26%',
          left: '30%',
          width: '5.5%',
          height: '28%',
          tag: 'Grandfather Clock',
          onClick: () => {
            sound.playClick();
            setHint('The pendulum is frozen at 11:58 PM. Blood-red scratches mark the wooden casing.');
          }
        },
        {
          id: 'staircase',
          top: '20%',
          left: '38%',
          width: '24%',
          height: '34%',
          tag: 'Grand Staircase (Upstairs)',
          onClick: () => {
            unlockRoom('bedroom');
            switchRoom('bedroom');
          }
        },
        {
          id: 'cellarGrate',
          top: '70%',
          left: '60%',
          width: '11%',
          height: '10%',
          tag: 'Basement Trapdoor',
          onClick: () => {
            if (state.unlockedRooms.includes('basement')) {
              switchRoom('basement');
            } else {
              if (state.selectedItem === 'basement_key' || state.inventory.includes('basement_key')) {
                unlockRoom('basement');
                sound.playCreak();
                setHint('The heavy iron padlock snaps open! The stone stairs descend into darkness.');
                switchRoom('basement');
              } else {
                setHint('A heavy iron grate bound by a chained padlock. Marked: "Crypt Access - Key Required".');
              }
            }
          }
        }
      ]
    },

    parlor: {
      name: 'Living Room & Parlor',
      hint: 'A grand fireplace and antique phonograph sit among moth-eaten Victorian furnishings.',
      hotspots: [
        {
          id: 'fireplace',
          top: '31%',
          left: '40%',
          width: '16%',
          height: '26%',
          tag: 'Cold Fireplace',
          onClick: () => {
            sound.playClick();
            addJournalEntry("Lord Blackwood's Regret (1898)", '"I made the pact with the shadows to preserve her fragile heart. But the entity asked for far more than blood... it wants every soul who enters Blackwood Manor."');
            setHint('You pulled a soot-stained diary page from the hearth ashes!');
          }
        },
        {
          id: 'painting',
          top: '22%',
          left: '45%',
          width: '95px',
          height: '95px',
          tag: 'Family Oil Portrait',
          onClick: () => {
            openModal(modalSafe);
          }
        },
        {
          id: 'gramophone',
          top: '48%',
          left: '74%',
          width: '10%',
          height: '18%',
          tag: 'Antique Gramophone',
          onClick: () => {
            if (!state.gramophonePlayed) {
              state.gramophonePlayed = true;
              sound.playMusicBox();
              addItem('silver_key');
              setHint('As the eerie vinyl spins, a secret latch pops! You obtained the Parlor Silver Key.');
            } else {
              sound.playMusicBox();
              setHint('The phonograph crackles with the distant laughter of children.');
            }
          }
        },
        {
          id: 'doorToFoyer1',
          top: '42%',
          left: '86%',
          width: '75px',
          height: '130px',
          tag: 'Back to Foyer',
          onClick: () => switchRoom('foyer')
        }
      ]
    },

    library: {
      name: 'Library & Study',
      hint: 'Towering book stacks line the walls. A rotary phone rests upon the dark oak desk.',
      hotspots: [
        {
          id: 'secretBookshelf',
          top: '28%',
          left: '20%',
          width: '100px',
          height: '160px',
          tag: 'Arcane Bookcase',
          onClick: () => {
            if (!state.bookshelfOpened) {
              if (state.selectedItem === 'tome' || state.inventory.includes('tome')) {
                state.bookshelfOpened = true;
                sound.playCreak();
                addItem('basement_key');
                addJournalEntry('The Cellar Warning', '"The ritual pentagram in the crypt can banish the entity, but only if Eleanor\'s locket, sacred salt, and 4 lit candles are placed before the eclipse ends."');
                setHint('You placed the Tome of Shadows! The bookshelf slides open, revealing the Iron Crypt Key!');
              } else {
                setHint('An empty slot on the top shelf is marked with the sign of the shadow. You need the Tome of Shadows.');
              }
            } else {
              setHint('The secret compartment is already open.');
            }
          }
        },
        {
          id: 'deskPhone',
          top: '62%',
          left: '60%',
          width: '70px',
          height: '55px',
          tag: 'Rotary Telephone',
          onClick: () => {
            sound.playWhisper();
            triggerLightning();
            setHint('You lift the receiver... a cold ghostly voice whispers: "The locket is in her bedroom music box... free us..."');
          }
        },
        {
          id: 'doorToFoyer2',
          top: '32%',
          left: '4%',
          width: '8%',
          height: '26%',
          tag: 'Back to Foyer',
          onClick: () => switchRoom('foyer')
        }
      ]
    },

    kitchen: {
      name: 'Kitchen & Pantry',
      hint: 'A rusted meat locker and leaking cast iron faucet. Useful survival supplies may remain.',
      hotspots: [
        {
          id: 'kitchenCounter',
          top: '45%',
          left: '18%',
          width: '18%',
          height: '19%',
          tag: 'Prep Counter',
          onClick: () => {
            if (!state.inventory.includes('matches')) {
              addItem('matches');
              addItem('batteries');
              state.battery = 100;
              setHint('Found a Box of Matchsticks and fresh Flashlight Batteries!');
            } else {
              setHint('The prep counter is cleared out.');
            }
          }
        },
        {
          id: 'pantryCupboard',
          top: '23%',
          left: '48%',
          width: '12%',
          height: '34%',
          tag: 'Locked Pantry',
          onClick: () => {
            if (!state.saltFound) {
              state.saltFound = true;
              addItem('salt');
              addJournalEntry('Alchemical Sanctification', '"Blessed salt creates an impenetrable boundary against the entity. Scatter it across the pentagram."');
              setHint('You unlocked the pantry and found a jar of Consecrated Holy Salt!');
            } else {
              setHint('The pantry shelves are now empty.');
            }
          }
        },
        {
          id: 'doorToFoyer3',
          top: '32%',
          left: '86%',
          width: '8%',
          height: '26%',
          tag: 'Back to Foyer',
          onClick: () => switchRoom('foyer')
        }
      ]
    },

    bedroom: {
      name: 'Master Bedroom',
      hint: 'Eleanor’s old bedchamber. An ornate vanity mirror reflects the shadows of the room.',
      hotspots: [
        {
          id: 'vanityMirror',
          top: '26%',
          left: '21%',
          width: '8%',
          height: '17%',
          tag: 'Ornate Vanity Mirror',
          onClick: () => {
            sound.playJumpscare();
            triggerPanic();
            setHint('A shadowy specter flashes in the glass reflection right behind you! Your heart pounds violently!');
          }
        },
        {
          id: 'nightstand',
          top: '33%',
          left: '44%',
          width: '22%',
          height: '27%',
          tag: 'Bedside Music Box',
          onClick: () => {
            if (!state.musicBoxOpened) {
              state.musicBoxOpened = true;
              sound.playMusicBox();
              addItem('locket');
              addItem('tome');
              addJournalEntry("Eleanor's Keepsake", '"Father gave me this locket on my tenth birthday in 1898. He swore it would keep the dark shadows away forever."');
              setHint("The music box plays Eleanor's lullaby and opens, revealing her Golden Locket and the Tome of Shadows!");
            } else {
              sound.playMusicBox();
              setHint('The delicate music box chimes softly in the dark.');
            }
          }
        },
        {
          id: 'doorToFoyer4',
          top: '32%',
          left: '86%',
          width: '8%',
          height: '26%',
          tag: 'Downstairs to Foyer',
          onClick: () => switchRoom('foyer')
        }
      ]
    },

    basement: {
      name: 'Dark Basement & Crypt',
      hint: 'Cold stone walls and dripping condensation. The storm escape hatch and ritual altar are here.',
      hotspots: [
        {
          id: 'breakerBox',
          top: '26%',
          left: '14%',
          width: '8%',
          height: '19%',
          tag: 'Electrical Breaker Box',
          onClick: () => openModal(modalBreaker)
        },
        {
          id: 'ritualAltar',
          top: '50%',
          left: '42%',
          width: '14%',
          height: '20%',
          tag: 'Demonic Pentagram Altar',
          onClick: () => openModal(modalAltar)
        },
        {
          id: 'stormDoor',
          top: '26%',
          left: '78%',
          width: '10%',
          height: '28%',
          tag: 'Storm Exit Hatch',
          onClick: () => {
            if (state.breakerEngaged) {
              triggerEnding('survivor');
            } else {
              setHint('The storm door is held shut by an electromagnetic security lock. Restore power at the Breaker Box!');
            }
          }
        },
        {
          id: 'doorToFoyer5',
          top: '28%',
          left: '3%',
          width: '7%',
          height: '24%',
          tag: 'Stairs up to Foyer',
          onClick: () => switchRoom('foyer')
        }
      ]
    }
  };

  // --- Room Switching & Hotspot Render ---
  function switchRoom(roomId) {
    if (!state.unlockedRooms.includes(roomId)) {
      setHint('That room is currently locked.');
      return;
    }
    sound.playCreak();
    state.currentRoom = roomId;

    // Update Nav Tabs
    document.querySelectorAll('.room-tab').forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('data-room') === roomId);
    });

    dockHint.textContent = ROOM_CONFIGS[roomId].hint;
    renderHotspots();
  }

  function unlockRoom(roomId) {
    if (!state.unlockedRooms.includes(roomId)) {
      state.unlockedRooms.push(roomId);
      const tab = document.querySelector(`.room-tab[data-room="${roomId}"]`);
      if (tab) tab.classList.remove('locked');
      sound.playClick();
    }
  }

  function renderHotspots() {
    hotspotsLayer.innerHTML = '';
    const cfg = ROOM_CONFIGS[state.currentRoom];
    if (!cfg || !cfg.hotspots) return;

    cfg.hotspots.forEach(hs => {
      const el = document.createElement('div');
      el.className = 'mansion-hotspot';
      el.style.top = hs.top;
      el.style.left = hs.left;
      el.style.width = hs.width;
      el.style.height = hs.height;

      el.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 2a10 10 0 0 0-10 10c0 4.5 3 8 7 9.5"></path>
        </svg>
        <span class="hotspot-tag">${hs.tag}</span>
      `;

      el.addEventListener('click', e => {
        e.stopPropagation();
        hs.onClick();
      });

      hotspotsLayer.appendChild(el);
    });
  }

  // --- Inventory System ---
  function updateInventoryUI() {
    inventoryTray.innerHTML = '';
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
            setHint('Deselected item.');
          } else {
            state.selectedItem = itemKey;
            setHint(`Selected: ${ITEM_NAMES[itemKey]}. Tap an object to use it.`);
          }
          updateInventoryUI();
        });
      } else {
        slot.title = 'Empty pocket';
      }
      inventoryTray.appendChild(slot);
    }
  }

  function addItem(itemKey) {
    if (!state.inventory.includes(itemKey)) {
      state.inventory.push(itemKey);
      sound.playClick();
      updateInventoryUI();
    }
  }

  function removeItem(itemKey) {
    const idx = state.inventory.indexOf(itemKey);
    if (idx !== -1) {
      state.inventory.splice(idx, 1);
      if (state.selectedItem === itemKey) state.selectedItem = null;
      updateInventoryUI();
    }
  }

  function setHint(text) {
    dockHint.textContent = text;
  }

  // --- Case Journal System ---
  function addJournalEntry(title, content) {
    if (!state.journal.some(j => j.title === title)) {
      state.journal.push({ title, content });
      sound.playClick();
      updateJournalUI();
    }
  }

  function updateJournalUI() {
    if (state.journal.length === 0) return;
    journalContent.innerHTML = '';
    state.journal.forEach(entry => {
      const div = document.createElement('div');
      div.className = 'journal-entry';
      div.innerHTML = `<h4>${entry.title}</h4><p>${entry.content}</p>`;
      journalContent.appendChild(div);
    });
  }

  // --- Paranormal & Threat Encounter Loop ---
  function triggerLightning() {
    sound.playThunder();
    lightningFx.classList.add('flash');
    setTimeout(() => {
      lightningFx.classList.remove('flash');
    }, 120);
  }

  function triggerPanic() {
    state.threatLevel = 'danger';
    threatBadge.textContent = 'DANGER!';
    threatBadge.className = 'threat-badge danger';
    panicVignette.classList.add('active');
    btnHide.classList.add('urgent');
    paranormalBanner.classList.add('active');
    state.dangerCountdown = 6; // 6 seconds to hide or take sanity hit
  }

  function resolvePanic(survived) {
    state.threatLevel = 'quiet';
    threatBadge.textContent = 'Quiet';
    threatBadge.className = 'threat-badge';
    panicVignette.classList.remove('active');
    btnHide.classList.remove('urgent');
    paranormalBanner.classList.remove('active');

    if (!survived) {
      sound.playJumpscare();
      state.sanity = Math.max(0, state.sanity - 35);
      sanityBar.style.width = `${state.sanity}%`;
      setHint('The shadow entity strikes through your mind! Your sanity has deteriorated!');
      if (state.sanity <= 0) {
        triggerEnding('bad');
      }
    } else {
      setHint('You held your breath in silence... the cold presence drifted away.');
    }
  }

  // Hide button toggle
  btnHide.addEventListener('click', () => {
    sound.playClick();
    state.isHiding = !state.isHiding;
    if (state.isHiding) {
      hideLabel.textContent = 'Un-Hide';
      btnHide.style.background = '#3c1854';
      if (state.threatLevel === 'danger') {
        setTimeout(() => {
          resolvePanic(true);
        }, 1200);
      }
    } else {
      hideLabel.textContent = 'Hide';
      btnHide.style.background = '';
    }
  });

  // Flashlight button toggle
  btnFlashlight.addEventListener('click', () => {
    sound.playClick();
    state.flashlightOn = !state.flashlightOn;
    lightLabel.textContent = state.flashlightOn ? 'Light: ON' : 'Light: OFF';
  });

  // --- Safe Puzzle (Living Room) ---
  const safeDigit0 = document.getElementById('safeDigit0');
  const safeDigit1 = document.getElementById('safeDigit1');
  const safeDigit2 = document.getElementById('safeDigit2');
  const safeDigit3 = document.getElementById('safeDigit3');
  const safeStatus = document.getElementById('safeStatus');
  const btnUnlockSafe = document.getElementById('btnUnlockSafe');

  document.querySelectorAll('.digit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sound.playClick();
      const dial = parseInt(btn.getAttribute('data-dial'), 10);
      const dir = btn.getAttribute('data-dir');
      if (dir === 'up') {
        state.safeDigits[dial] = (state.safeDigits[dial] + 1) % 10;
      } else {
        state.safeDigits[dial] = (state.safeDigits[dial] - 1 + 10) % 10;
      }
      safeDigit0.textContent = state.safeDigits[0];
      safeDigit1.textContent = state.safeDigits[1];
      safeDigit2.textContent = state.safeDigits[2];
      safeDigit3.textContent = state.safeDigits[3];
    });
  });

  btnUnlockSafe.addEventListener('click', () => {
    if (state.safeUnlocked) {
      safeStatus.textContent = 'The safe is already opened.';
      return;
    }
    // Target combination: 1898
    if (state.safeDigits[0] === 1 && state.safeDigits[1] === 8 && state.safeDigits[2] === 9 && state.safeDigits[3] === 8) {
      state.safeUnlocked = true;
      sound.playCreak();
      unlockRoom('library');
      safeStatus.textContent = 'CLACK! The heavy safe door swings open! The Library is now unlocked!';
      addJournalEntry('Blackwood Deed of 1898', '"To the master of the manor: the library holds the secret mechanism to enter the crypt below."');
      setHint('You unlocked the wall safe and discovered access to the Library!');
    } else {
      sound.playCreak();
      safeStatus.textContent = 'The dial clicks with resistance. Incorrect combination.';
    }
  });

  // --- Breaker Box Puzzle (Basement) ---
  const breakerSwitchesRow = document.getElementById('breakerSwitchesRow');
  const breakerStatus = document.getElementById('breakerStatus');
  const btnEngageBreaker = document.getElementById('btnEngageBreaker');

  function renderBreakerSwitches() {
    breakerSwitchesRow.innerHTML = '';
    state.breakerSwitches.forEach((val, idx) => {
      const b = document.createElement('button');
      b.className = 'btn-secondary';
      b.style.borderColor = val ? '#38ef7d' : '#ff4d4d';
      b.textContent = `Breaker ${idx + 1}: ${val ? 'UP' : 'DOWN'}`;
      b.addEventListener('click', () => {
        sound.playClick();
        state.breakerSwitches[idx] = !state.breakerSwitches[idx];
        renderBreakerSwitches();
      });
      breakerSwitchesRow.appendChild(b);
    });
  }
  renderBreakerSwitches();

  btnEngageBreaker.addEventListener('click', () => {
    // Expected pattern: UP, DOWN, UP, UP
    if (state.breakerSwitches[0] === true && state.breakerSwitches[1] === false && state.breakerSwitches[2] === true && state.breakerSwitches[3] === true) {
      state.breakerEngaged = true;
      sound.playCreak();
      triggerLightning();
      breakerStatus.textContent = 'POWER RESTORED! The electromagnetic lock on the Storm Door buzzes open!';
      setHint('The basement lights spark to life! The storm escape door is now powered and unlocked.');
    } else {
      sound.playJumpscare();
      breakerStatus.textContent = 'Sparks shower from the fusebox! Breaker tripped. Try another circuit combination.';
    }
  });

  // --- Ritual Altar Modal & Endings ---
  const btnPerformRitual = document.getElementById('btnPerformRitual');
  const btnQuickEscape = document.getElementById('btnQuickEscape');
  const altarStatus = document.getElementById('altarStatus');

  btnQuickEscape.addEventListener('click', () => {
    closeModal(modalAltar);
    if (state.breakerEngaged) {
      triggerEnding('survivor');
    } else {
      setHint('The storm door is still unpowered! Restore power at the Breaker Box first.');
    }
  });

  btnPerformRitual.addEventListener('click', () => {
    const hasLocket = state.inventory.includes('locket') || state.selectedItem === 'locket';
    const hasMatches = state.inventory.includes('matches') || state.selectedItem === 'matches';
    const hasSalt = state.inventory.includes('salt') || state.selectedItem === 'salt';

    if (hasLocket && hasMatches && hasSalt) {
      sound.playMusicBox();
      altarStatus.textContent = 'The locket shines with brilliant celestial light! The dark curse dissolves into morning mist!';
      setTimeout(() => {
        closeModal(modalAltar);
        triggerEnding('cursebreaker');
      }, 1500);
    } else {
      sound.playCreak();
      altarStatus.textContent = 'Missing ritual artifacts! You need: Eleanor\'s Locket, Matchsticks, and Consecrated Salt.';
    }
  });

  function triggerEnding(type) {
    state.gameEnded = true;
    if (type === 'cursebreaker') {
      endingTitle.textContent = 'ENDING 1: THE CURSE BREAKER (TRUE ENDING)';
      endingTitle.className = 'ending-title good';
      endingText.innerHTML = `
        <p>You consecrated the pentagram with Eleanor's Golden Locket, lit the sacred candles, and broke the century-old Blackwood curse.</p>
        <p style="margin-top: 10px;">The tortured spirits of the family ascend in peace. The heavy doors swing wide open as the warm orange rays of the morning sun banish the darkness of Blackwood Manor forever.</p>
      `;
    } else if (type === 'survivor') {
      endingTitle.textContent = 'ENDING 2: THE TRAUMATIZED SURVIVOR';
      endingTitle.className = 'ending-title neutral';
      endingText.innerHTML = `
        <p>You restored the auxiliary power and fled through the storm cellar hatch into the rainy autumn woods.</p>
        <p style="margin-top: 10px;">You survived with your life, but the dark curse still lingers over Blackwood Manor. Every Halloween night, you can still hear the whispers following your steps...</p>
      `;
    } else {
      endingTitle.textContent = 'ENDING 3: CLAIMED BY THE SHADOWS';
      endingTitle.className = 'ending-title bad';
      endingText.innerHTML = `
        <p>Your mental sanity completely shattered under the terror of the paranormal entity.</p>
        <p style="margin-top: 10px;">You collapsed in the cold dark corridors. By morning, a new painted portrait hangs silently in the parlor gallery... waiting for the next victim.</p>
      `;
    }
    openModal(modalEnding);
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
      const id = btn.getAttribute('data-close');
      const el = document.getElementById(id);
      if (el) closeModal(el);
    });
  });

  btnJournal.addEventListener('click', () => openModal(modalJournal));
  document.getElementById('helpBtn').addEventListener('click', () => openModal(modalHelp));
  document.getElementById('btnRestartGame').addEventListener('click', () => window.location.reload());

  // Room Nav Tabs
  document.querySelectorAll('.room-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-room');
      switchRoom(target);
    });
  });

  // Sound toggle
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

  // Mouse tracking for Flashlight
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    state.mousePos.x = (e.clientX - rect.left) * (canvas.width / rect.width);
    state.mousePos.y = (e.clientY - rect.top) * (canvas.height / rect.height);
  });

  canvas.addEventListener('touchmove', e => {
    if (e.touches.length > 0) {
      const rect = canvas.getBoundingClientRect();
      state.mousePos.x = (e.touches[0].clientX - rect.left) * (canvas.width / rect.width);
      state.mousePos.y = (e.touches[0].clientY - rect.top) * (canvas.height / rect.height);
    }
  });

  // --- Canvas 60 FPS Room Rendering Loop ---
  const VW = 1000;
  const VH = 600;

  function renderRoom(time) {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const rm = state.currentRoom;

    ctx.save();
    ctx.scale(w / VW, h / VH);

    // Room-specific rendering
    if (rm === 'porch') {
      const skyGrad = ctx.createLinearGradient(0, 0, 0, VH);
      skyGrad.addColorStop(0, '#040208');
      skyGrad.addColorStop(1, '#170c24');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, VW, VH);

      // Distant Dead Trees
      ctx.fillStyle = '#08040d';
      for (let i = 40; i < VW; i += 120) {
        ctx.fillRect(i, 80, 16, 260);
      }

      // Mansion Stone Facade
      ctx.fillStyle = '#1c102b';
      ctx.fillRect(200, 40, 560, 500);

      // Gothic Entrance Arch
      ctx.fillStyle = '#0d0617';
      ctx.beginPath();
      ctx.roundRect(410, 120, 140, 260, [70, 70, 0, 0]);
      ctx.fill();
      ctx.strokeStyle = '#3d1f56';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Stone Porch Steps
      ctx.fillStyle = '#2a163d';
      ctx.fillRect(160, 440, 640, 100);
      ctx.fillStyle = '#190a29';
      ctx.fillRect(180, 475, 600, 65);

      // Porch Doormat
      ctx.fillStyle = state.porchKeyFound ? '#3d2516' : '#2d3319';
      ctx.fillRect(435, 485, 90, 45);

    } else if (rm === 'foyer') {
      ctx.fillStyle = '#12081f';
      ctx.fillRect(0, 0, VW, VH);

      for (let y = 320; y < VH; y += 35) {
        for (let x = 0; x < VW; x += 60) {
          ctx.fillStyle = (Math.floor(x / 60) + Math.floor(y / 35)) % 2 === 0 ? '#1f0d36' : '#0b0414';
          ctx.fillRect(x, y, 60, 35);
        }
      }

      ctx.fillStyle = '#2d1347';
      ctx.beginPath();
      ctx.moveTo(380, 120);
      ctx.lineTo(580, 120);
      ctx.lineTo(660, 320);
      ctx.lineTo(300, 320);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#7a1c2f';
      ctx.beginPath();
      ctx.moveTo(440, 120);
      ctx.lineTo(520, 120);
      ctx.lineTo(560, 320);
      ctx.lineTo(400, 320);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#3a1f18';
      ctx.fillRect(300, 160, 50, 160);

    } else if (rm === 'parlor') {
      ctx.fillStyle = '#1f0c18';
      ctx.fillRect(0, 0, VW, VH);

      ctx.fillStyle = '#160812';
      for (let x = 0; x < VW; x += 40) {
        ctx.fillRect(x, 0, 20, 340);
      }

      ctx.fillStyle = '#22110c';
      ctx.fillRect(0, 340, VW, VH - 340);

      ctx.fillStyle = '#1c171e';
      ctx.fillRect(400, 190, 160, 150);
      ctx.fillStyle = '#0a080c';
      ctx.fillRect(430, 240, 100, 100);

      ctx.fillStyle = '#ff5500';
      ctx.beginPath();
      ctx.arc(480, 325, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#e5a93b';
      ctx.strokeRect(430, 80, 100, 100);
      ctx.fillStyle = '#0f0814';
      ctx.fillRect(432, 82, 96, 96);
      const eyeDx = Math.sin(time * 0.003) * 6;
      const eyeDy = Math.cos(time * 0.002) * 4;
      ctx.fillStyle = '#ff2a55';
      ctx.fillRect(465 + eyeDx, 120 + eyeDy, 3, 3);
      ctx.fillRect(495 + eyeDx, 120 + eyeDy, 3, 3);

    } else if (rm === 'library') {
      ctx.fillStyle = '#130d1e';
      ctx.fillRect(0, 0, VW, VH);

      ctx.fillStyle = '#261633';
      ctx.fillRect(80, 60, 800, 300);
      for (let y = 120; y <= 360; y += 60) {
        ctx.fillStyle = '#3a214d';
        ctx.fillRect(80, y, 800, 8);
        for (let bx = 90; bx < 870; bx += 22) {
          ctx.fillStyle = ['#5c1a29', '#194254', '#2b4d24', '#664319'][Math.floor(bx / 18) % 4];
          ctx.fillRect(bx, y - 36, 14, 36);
        }
      }

      ctx.fillStyle = '#211208';
      ctx.fillRect(480, 290, 240, 110);

    } else if (rm === 'kitchen') {
      ctx.fillStyle = '#0e0b12';
      ctx.fillRect(0, 0, VW, VH);

      for (let y = 340; y < VH; y += 30) {
        for (let x = 0; x < VW; x += 40) {
          ctx.fillStyle = (Math.floor(x / 40) + Math.floor(y / 30)) % 2 === 0 ? '#1b1622' : '#0e0a13';
          ctx.fillRect(x, y, 40, 30);
        }
      }

      ctx.fillStyle = '#241a33';
      ctx.fillRect(180, 270, 180, 110);

      ctx.fillStyle = '#1d152b';
      ctx.fillRect(480, 140, 120, 200);

    } else if (rm === 'bedroom') {
      ctx.fillStyle = '#1a0b1c';
      ctx.fillRect(0, 0, VW, VH);

      ctx.fillStyle = '#2d1430';
      ctx.fillRect(440, 200, 220, 160);
      ctx.fillStyle = '#4d1e54';
      ctx.fillRect(440, 120, 12, 240);
      ctx.fillRect(648, 120, 12, 240);

      ctx.fillStyle = '#261219';
      ctx.fillRect(180, 260, 140, 110);
      ctx.strokeStyle = '#e5a93b';
      ctx.strokeRect(210, 160, 80, 95);

    } else if (rm === 'basement') {
      ctx.fillStyle = '#060408';
      ctx.fillRect(0, 0, VW, VH);

      ctx.strokeStyle = 'rgba(78, 41, 116, 0.2)';
      for (let y = 50; y < VH; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(VW, y);
        ctx.stroke();
      }

      ctx.strokeStyle = state.altarCleansed ? '#00f2fe' : '#ff2a55';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(480, 360, 60, 0, Math.PI * 2);
      ctx.stroke();

      const bulbSwing = Math.sin(time * 0.002) * 30;
      ctx.strokeStyle = '#555';
      ctx.beginPath();
      ctx.moveTo(480, 0);
      ctx.lineTo(480 + bulbSwing, 120);
      ctx.stroke();
      ctx.fillStyle = state.breakerEngaged ? '#ffeeaa' : '#554422';
      ctx.beginPath();
      ctx.arc(480 + bulbSwing, 125, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // Dynamic Flashlight Vignette Cone (Screen Coordinates)
    if (state.flashlightOn && state.battery > 0) {
      const flX = state.mousePos.x;
      const flY = state.mousePos.y;
      const radius = Math.min(w, h) * 0.45 + 50;
      const flGrad = ctx.createRadialGradient(flX, flY, 30, flX, flY, radius);
      flGrad.addColorStop(0, 'rgba(255, 235, 180, 0.08)');
      flGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.65)');
      flGrad.addColorStop(1, 'rgba(0, 0, 0, 0.96)');
      ctx.fillStyle = flGrad;
      ctx.fillRect(0, 0, w, h);
    } else {
      const darkGrad = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, Math.min(w, h) * 0.55);
      darkGrad.addColorStop(0, 'rgba(0,0,0,0.85)');
      darkGrad.addColorStop(1, 'rgba(0,0,0,0.98)');
      ctx.fillStyle = darkGrad;
      ctx.fillRect(0, 0, w, h);
    }

    requestAnimationFrame(renderRoom);
  }
  requestAnimationFrame(renderRoom);

  // --- Real-Time Update Tick (1000ms) ---
  setInterval(() => {
    if (state.gameEnded) return;

    // Battery Decay
    if (state.flashlightOn && state.battery > 0) {
      state.battery = Math.max(0, state.battery - 0.4);
      batteryBar.style.width = `${state.battery}%`;
      if (state.battery <= 0) {
        state.flashlightOn = false;
        lightLabel.textContent = 'Light: DEAD';
        setHint('Your flashlight battery died! Darkness is encroaching!');
      }
    }

    // Lingering in darkness drains sanity
    if (!state.flashlightOn && !state.isHiding) {
      state.sanity = Math.max(0, state.sanity - 1.5);
      sanityBar.style.width = `${state.sanity}%`;
      if (state.sanity <= 0) triggerEnding('bad');
    }

    // Paranormal Timer
    state.threatTimer++;
    if (state.threatTimer > 18 && state.threatLevel === 'quiet') {
      state.threatTimer = 0;
      if (Math.random() < 0.45 && state.currentRoom !== 'porch') {
        triggerPanic();
      } else if (Math.random() < 0.3) {
        triggerLightning();
      }
    }

    // Danger Countdown
    if (state.threatLevel === 'danger') {
      sound.playHeartbeat();
      state.dangerCountdown--;
      if (state.dangerCountdown <= 0) {
        resolvePanic(state.isHiding);
      }
    }
  }, 1000);

  // Initialize
  updateInventoryUI();
  renderHotspots();
})();
