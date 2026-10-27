---
name: "Clean up points, notifications, and themes"
about: "Audit and correct the in-application point system, remove others folder, remove achievement toasts, and refine dark/light themes"
title: "fix: clean up points, notifications, and themes"
labels: ["enhancement", "refactor", "ui", "good first issue"]
assignees: ""
---

## 📌 Issue Overview
This issue addresses platform refinement and architectural consistency across **ArcadeVerse**:
1. Removing the deprecated `others/` folder to streamline the repository into a pure, game-centric arcade station.
2. Auditing and rectifying the in-application point system to establish a comprehensive multi-tier progression (from Novice Game Creator for 1 game up to Legendary Game Architect for 50+ games, and Apprentice up to Immortal Legend for points) with consistent calculations and displays without modifying verified historical records.
3. Completely eliminating achievement-related toast notifications and their associated triggers while preserving point system calculations and unrelated notifications.
4. Implementing a refined Dark/Light theme system featuring subtle dark textures in dark mode and warm cream-colored backgrounds in light mode with high readability and WCAG accessibility.
5. Updating all documentation (`README.md`, `CONTRIBUTING.md`, registry compiler, and GitHub workflows) to reflect the unified structure.

---

## 📂 Affected Files & Components
- **Directories Deleted:**
  - `others/` (all 29 non-game feature subdirectories)
- **Markup & Layout:**
  - `index.html` (remove `others/` imports, update dev tools showcase cards, add theme toggle button)
  - `leaderboard.html` (remove `others/` imports, add theme toggle button, sync scoring displays)
- **Stylesheets:**
  - `assets/css/style.css` (implement refined dark mode with subtle dark textures, warm cream light mode, and theme toggle button styles)
- **JavaScript & Logic:**
  - `assets/js/navbar.js` (add dark/light theme switching engine with `localStorage` persistence)
  - `assets/js/app.js` (remove background plugin loader and dynamic tools category filter)
  - `assets/js/leaderboard.js` (audit and synchronize baseline contributor data and point calculation displays)
  - `assets/js/games-registry.js` (regenerate registry without `others/`)
- **Build & CI/CD:**
  - `scripts/build-registry.js` (remove `others/` scan and safely preserve contributor records)
  - `.github/workflows/build-registry.yml` (remove `others/**/feature.json` path trigger)
- **Documentation:**
  - `README.md` (remove `others/` references and clean up folder isolation guidelines)
  - `CONTRIBUTING.md` (align guidelines with pure game directory architecture)

---

## ✅ Acceptance Criteria
- [ ] The `others/` directory is completely removed, and zero 404 console errors occur on `index.html` or `leaderboard.html`.
- [ ] All achievement-related toast notifications and trigger functions are completely removed.
- [ ] In-application point calculation is consistent across table rows, podium cards, admin spotlight, and tooltip formulas, featuring a comprehensive multi-tier progression (1 to 50+ games, 1 to 5000+ points).
- [ ] Existing verified contributor statistics and game titles remain intact without arbitrary record inflation or missing data.
- [ ] Dark mode presents subtle, premium dark textures with consistent text contrast.
- [ ] Light mode applies warm cream-colored backgrounds (`#fcf9f2` / `#f5efe2`) where all text is strictly converted to black (`#000000` / `#111827`), ensuring crystal-clear legibility across the entire platform.
- [ ] Hall of Fame point calculations and contributor badge tags are verified and rendered accurately across podium cards, standings table, and admin spotlight without undefined values or missing badges.
- [ ] Theme toggle switch works seamlessly and persists choice via `localStorage`.
- [ ] `node scripts/build-registry.js` executes with zero errors and outputs the updated `assets/js/games-registry.js`.
- [ ] Documentation (`README.md`, `CONTRIBUTING.md`) accurately describes the streamlined repository architecture.
