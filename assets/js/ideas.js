/**
 * Ideas Vault Page Engine
 * Features:
 * - Interactive Idea Roulette Spinner
 * - Full 20+ idea catalog with search/filter
 * - "Claim" bridge to PR Helper
 */

const IDEA_VAULT = [
  {
    id: "flappy-cyber",
    title: "Flappy Cyber Jet",
    category: "Action",
    icon: "🚀",
    difficulty: "Beginner",
    description: "Endless side-scrolling obstacle avoider. Control vertical thrusters with spacebar or screen taps.",
    tags: ["HTML5 Canvas", "Gravity Physics", "High Score LocalStorage"],
    features: ["Procedural pipe obstacles", "Score multiplier zones", "Particle smoke trail"]
  },
  {
    id: "quantum-2048",
    title: "Quantum 2048",
    category: "Puzzle",
    icon: "🔢",
    difficulty: "Intermediate",
    description: "Slide and fuse elements on a 4x4 grid to unlock the ultimate quantum 2048 molecule.",
    tags: ["CSS Grid", "Matrix Slide Logic", "Smooth Transitions"],
    features: ["Keyboard arrow controls", "Undo last move feature", "Best score record"]
  },
  {
    id: "neon-pong",
    title: "Cyber Pong (PvP & AI)",
    category: "Retro",
    icon: "🏓",
    difficulty: "Beginner",
    description: "Dual-paddle glowing pong with adjustable computer AI bot difficulty and 2-player local mode.",
    tags: ["Canvas 2D", "Collision Physics", "Bot AI Logic"],
    features: ["1P vs AI or 2P Local mode", "Velocity curve calculations", "Retro hit audio effects"]
  },
  {
    id: "space-invaders",
    title: "Space Invaders 2026",
    category: "Action",
    icon: "🛸",
    difficulty: "Intermediate",
    description: "Classic arcade space defense. Control your cannon with arrow keys and blast descending alien waves.",
    tags: ["Sprite Animation", "Bullet Queues", "Wave Scaling"],
    features: ["Multi-stage alien formations", "Destructible shield bunkers", "Mystery mothership spawn"]
  },
  {
    id: "cyber-stacker",
    title: "Cyber Tower Stacker",
    category: "Arcade",
    icon: "🏢",
    difficulty: "Beginner",
    description: "Stack swinging blocks with precision timing. Unaligned edges are sliced off as the tower grows!",
    tags: ["Timing Reflex", "Precision Slicing", "Canvas"],
    features: ["Color gradient height effects", "Combo streak sounds", "Game over collapse animation"]
  },
  {
    id: "whack-a-bug",
    title: "Whack-A-Bug Developer",
    category: "Arcade",
    icon: "🐛",
    difficulty: "Beginner",
    description: "Whack unexpected production bugs emerging from server racks before CPU temperature reaches 100°C!",
    tags: ["DOM Events", "Timer Intervals", "Audio Cues"],
    features: ["Different bug point values", "Golden bug power-ups", "Penalty on clicking server firewalls"]
  },
  {
    id: "cryptic-wordle",
    title: "Cryptic Wordle Hack",
    category: "Puzzle",
    icon: "🔤",
    difficulty: "Intermediate",
    description: "Guess the secret 5-letter tech keyword in 6 tries with green and amber feedback clues.",
    tags: ["String Algorithms", "Virtual Keyboard GUI", "State Machine"],
    features: ["Tech glossary word bank", "Shake animation on invalid word", "Statistics tracker"]
  },
  {
    id: "astro-jump",
    title: "Astro Infinite Jumper",
    category: "Arcade",
    icon: "🦘",
    difficulty: "Intermediate",
    description: "Bounce continuously upward across floating space platforms, collecting jetpacks and dodging black holes.",
    tags: ["Vertical Camera Scroll", "Jump Velocity", "Procedural Platforms"],
    features: ["Spring & rocket boosters", "Moving and fragile platforms", "Altitude tracker"]
  },
  {
    id: "quantum-minesweeper",
    title: "Quantum Minesweeper",
    category: "Puzzle",
    icon: "💣",
    difficulty: "Intermediate",
    description: "Classic minefield sweeper with modern flat aesthetic. Flag danger tiles and calculate risk tiles.",
    tags: ["Recursive Flood Fill", "Right-Click Handling", "Grid Engine"],
    features: ["Custom board sizes (9x9, 16x16)", "First click never a mine", "Timer & flag counter"]
  },
  {
    id: "synth-says",
    title: "Synth-Wave Simon Says",
    category: "Retro",
    icon: "🎹",
    difficulty: "Beginner",
    description: "Watch and listen to synthesizer sound sequences, then repeat the exact musical pattern under timer.",
    tags: ["Web Audio API", "Array Queues", "Memory Challenge"],
    features: ["Synthesizer tone generation", "High score memory", "Speed acceleration per round"]
  }
];

document.addEventListener("DOMContentLoaded", () => {
  let currentIndex = 0;
  const ideaTitle = document.getElementById("idea-title");
  const ideaCategory = document.getElementById("idea-category");
  const ideaIcon = document.getElementById("idea-icon");
  const ideaDescription = document.getElementById("idea-description");
  const ideaTechTags = document.getElementById("idea-tech-tags");
  const rollIdeaBtn = document.getElementById("roll-idea-btn");
  const claimIdeaBtn = document.getElementById("claim-idea-btn");
  const catalogGrid = document.getElementById("ideas-catalog-grid");

  function displayRouletteIdea(index) {
    const item = IDEA_VAULT[index];
    ideaTitle.textContent = item.title;
    ideaCategory.textContent = `${item.category} • ${item.difficulty}`;
    ideaIcon.textContent = item.icon;
    ideaDescription.textContent = item.description;
    ideaTechTags.innerHTML = item.tags.map(t => `<span>${t}</span>`).join("");
  }

  if (rollIdeaBtn) {
    rollIdeaBtn.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % IDEA_VAULT.length;
      displayRouletteIdea(currentIndex);
    });
  }

  // Render full catalog as disabled trial/reference concepts
  if (catalogGrid) {
    catalogGrid.innerHTML = "";
    IDEA_VAULT.forEach((idea) => {
      const card = document.createElement("div");
      card.className = "idea-catalog-card trial-card";
      card.innerHTML = `
        <div class="idea-cat-header">
          <span class="idea-icon-sm">${idea.icon}</span>
          <span class="difficulty-badge ${idea.difficulty.toLowerCase()}">${idea.difficulty}</span>
        </div>
        <h3>${idea.title}</h3>
        <p class="idea-desc-text">${idea.description}</p>
        <div class="idea-tags-list">
          ${idea.tags.map(t => `<span>${t}</span>`).join("")}
        </div>
        <div class="idea-features-box">
          <strong>Key Features (Reference Blueprint):</strong>
          <ul>
            ${idea.features.map(f => `<li>${f}</li>`).join("")}
          </ul>
        </div>
        <button class="btn btn-secondary btn-sm btn-disabled-concept" disabled title="This is a reference blueprint for trial purposes only.">
          🔒 Example Concept (Disabled)
        </button>
      `;

      catalogGrid.appendChild(card);
    });
  }

  // Mobile Navigation Drawer Controller
  const navHamburger = document.getElementById("nav-hamburger");
  const mobileNavDrawer = document.getElementById("mobile-nav-drawer");
  const mobileNavBackdrop = document.getElementById("mobile-nav-backdrop");

  function toggleMobileNav(forceClose = false) {
    if (!navHamburger || !mobileNavDrawer || !mobileNavBackdrop) return;
    const isOpening = forceClose ? false : !mobileNavDrawer.classList.contains("active");

    navHamburger.classList.toggle("active", isOpening);
    navHamburger.setAttribute("aria-expanded", isOpening ? "true" : "false");
    mobileNavDrawer.classList.toggle("active", isOpening);
    mobileNavDrawer.setAttribute("aria-hidden", isOpening ? "false" : "true");
    mobileNavBackdrop.classList.toggle("active", isOpening);
    mobileNavBackdrop.setAttribute("aria-hidden", isOpening ? "false" : "true");
    document.body.style.overflow = isOpening ? "hidden" : "auto";
  }

  if (navHamburger) {
    navHamburger.addEventListener("click", () => toggleMobileNav());
  }

  if (mobileNavBackdrop) {
    mobileNavBackdrop.addEventListener("click", () => toggleMobileNav(true));
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileNavDrawer && mobileNavDrawer.classList.contains("active")) {
      toggleMobileNav(true);
    }
  });

  if (mobileNavDrawer) {
    mobileNavDrawer.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", () => toggleMobileNav(true));
    });
  }

  // Initial display
  displayRouletteIdea(currentIndex);
});
