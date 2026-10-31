# 🎃 GitHub Issues: Halloween Games & Showcase Layout Overhaul

This document contains ready-to-publish GitHub Issue templates for the **Halloween Games & Showcase Layout Overhaul** in ArcadeVerse (NSoC '26). These can be directly copy-pasted into new GitHub Issues for community contributors.

---

## 📌 Issue 1: [UI/Layout]: Refine Responsive Grid Layout & Viewport Sizing for Homepage Halloween Showcase Section

### 🏷️ Labels
`level2`, `ui`, `halloween`, `responsive`, `nsoc26`, `good first issue`

### 📋 Description
The new **"Halloween special game 🎃"** showcase section on the homepage features a 3-card grid highlighting the recently released Halloween games. While the dark atmospheric container and Jolly Lodger title look great, the layout needs fine-tuning across different viewport widths (ultra-wide, tablet portrait, and mobile devices).

### 🎯 Scope & Layout Fixes Required
1. **Responsive Grid & Flex Wrapping:**
   - On screens between `768px` and `1024px` (tablets), the 3 cards currently wrap awkwardly into a 2+1 layout. Implement an optimized tablet breakpoint or clean responsive grid (`grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))`) to maintain balanced card proportions.
   - On mobile screens (`< 480px`), ensure card padding and icon banners scale gracefully without content overflowing the viewport.
2. **Card Content Alignment:**
   - Equalize card body heights using `flex: 1` so the card footers (`Dev: Debasmita Bose` and `Play Now` buttons) are vertically aligned across all 3 cards regardless of description length.
   - Adjust `.halloween-card-banner` height on small devices (`height: 100px` on mobile vs `120px` on desktop) to optimize vertical fold space.
3. **Banner Badge & Pill Positioning:**
   - Ensure `.halloween-tag-pill` (e.g., `HORROR MYSTERY`, `ESCAPE ROOM`) never collides with `.halloween-card-icon` on narrow mobile screens (`< 360px`).
   - Center `.halloween-badge` and give `.halloween-title` fluid clamp typography (`font-size: clamp(2.2rem, 5vw, 3.8rem)`) to prevent title clipping on small phones.
4. **Touch & Hover Consistency:**
   - Ensure the hover elevation (`transform: translateY(-6px)`) does not trigger unintended layout shifts or sticky hover states on touch-based mobile browsers.

### 📁 Target Files
- `assets/css/halloween.css`
- `index.html`

### ✅ Acceptance Criteria
- [ ] No horizontal scrolling or content clipping at `320px`, `375px`, `768px`, `1024px`, and `1440px` viewports.
- [ ] All 3 card footers align consistently across the grid row.
- [ ] Light and Dark mode contrast remains crystal-clear and vibrant.
- [ ] Passes `node scripts/validate-games.js` with 0 errors and 0 warnings.

---

## 📌 Issue 2: [Game Layout]: Mobile & Tablet Responsive HUD Layout Overhaul for 'Haunted House: The Curse Within'

### 🏷️ Labels
`level2`, `ui`, `game-layout`, `halloween`, `responsive`, `nsoc26`

### 📋 Description
In **"Haunted House: The Curse Within"** (`games/haunted-house_debasmita/`), the game runs inside an 85vh modal iframe. While the full-viewport canvas renders properly, the floating HUD elements (Top Sanity/Battery meters, Rooms Navigation bar, Case File Tracker, and Bottom Action Dock) become cramped or overlap when played on mobile devices or short viewports.

### 🎯 Scope & Layout Fixes Required
1. **Top HUD & Meters Layout:**
   - On mobile screens (`< 600px`), the title pod (`BLACKWOOD MANOR`), Sanity meter, Battery meter, and audio buttons crowd together. Convert the top bar into a flexible wrap layout or compact icons with progress rings on mobile.
   - Ensure `.case-tracker` sits cleanly below the room navigation tabs with sufficient margin so it never overlaps the canvas room view.
2. **Rooms Navigation Bar (`.rooms-nav`):**
   - When 7 rooms are unlocked, the navigation tabs overflow horizontally. Add smooth touch scroll snapping (`overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none;`) with subtle left/right gradient fade indicators so players know more rooms can be scrolled.
3. **Bottom Action Dock (`.bottom-dock`):**
   - On narrow screens, the Flashlight toggle, Hide button, Journal button, and inventory tray wrap into multiple rows, obscuring the lower room view.
   - Implement an adaptive mobile layout: icon-only buttons with tooltips or a compact floating bottom shelf (`max-width: 95vw`).
4. **Modal Dialogs (Safe, Breaker, Altar, Journal):**
   - Ensure all puzzle modals (`.modal-window`) have `max-height: 80vh` with `overflow-y: auto` inside `.modal-content` so that buttons like "Engage Lever" or "Turn Tumbler" remain visible and clickable without being cut off on short screens or mobile keyboards.

### 📁 Target Files
- `games/haunted-house_debasmita/style.css`
- `games/haunted-house_debasmita/index.html`
- `games/haunted-house_debasmita/game.js`

### ✅ Acceptance Criteria
- [ ] Zero overlapping HUD elements on viewports between 320px and 1280px.
- [ ] Room navigation tabs scroll smoothly on mobile with no ugly default scrollbars.
- [ ] All puzzle modals fit comfortably inside the screen and can be solved on small viewports.
- [ ] Strictly zero Unicode emojis in code files (use SVG icons only).
- [ ] Passes `node scripts/validate-games.js` with 0 errors and 0 warnings.

---

## 📌 Issue 3: [Game Layout]: Ergonomic Mobile Touch D-Pad & Responsive HUD Layout for 'Island Survival: Lost Beyond the Shore'

### 🏷️ Labels
`level2`, `ui`, `game-layout`, `halloween`, `responsive`, `nsoc26`

### 📋 Description
In **"Island Survival: Lost Beyond the Shore"** (`games/island-survival_debasmita/`), players explore a 2D open-world island. On mobile devices, the on-screen touch controls (D-pad and ACT button) need improved ergonomic placement, and the top vitals bars require responsive compacting so they don't cover the gameplay area.

### 🎯 Scope & Layout Fixes Required
1. **Mobile Touch Controls Placement (`.touch-container`):**
   - Position the touch D-pad in the lower-left corner with thumb ergonomics (`bottom: 80px; left: 16px;`) and place the `ACT` button in the lower-right corner (`bottom: 80px; right: 16px;`).
   - Increase touch button hit targets to a minimum of `48px x 48px` for reliable finger tapping.
   - Hide the touch controls entirely on devices with fine pointers / hover capability (`@media (hover: hover) and (pointer: fine)`).
2. **Vitals HUD Pod (`.vitals-pod`):**
   - On screens `< 640px`, the 4 vital bars (Health, Hunger, Thirst, Energy) take up too much horizontal space. Stack them into a 2x2 compact mini-grid or use circular micro-gauges.
   - Prevent the `.quest-tracker` from colliding with `.hud-topbar` on narrow screens.
3. **Bottom Hotbar & Crafting Layout (`.hud-bottombar`):**
   - On small screens, ensure the Craft, Eat, and Rest buttons stay easily reachable and resource counters (`Wood`, `Stone`, `Vines`, `Leaves`) collapse into a compact horizontal badge tray.
   - In the Crafting Manual modal (`.crafting-grid`), implement a 1-column layout on mobile (`< 600px`) and 2-column layout on desktop to prevent card squishing.
4. **Action Prompt HUD:**
   - Ensure in-canvas floating action badges (`[SPACE / Click] Chop Wood`) dynamically scale text size based on device pixel ratio so they remain legible without obscuring player movement.

### 📁 Target Files
- `games/island-survival_debasmita/style.css`
- `games/island-survival_debasmita/index.html`
- `games/island-survival_debasmita/game.js`

### ✅ Acceptance Criteria
- [ ] Touch D-pad and ACT button are ergonomically spaced on mobile portrait and landscape.
- [ ] Touch controls auto-hide on desktop devices with mouse input.
- [ ] Vitals and Quest HUD do not obscure more than 15% of the mobile screen.
- [ ] Crafting modal items are cleanly readable and scrollable without clipped text.
- [ ] Passes `node scripts/validate-games.js` with 0 errors and 0 warnings.

---

## 📌 Issue 4: [Game Layout]: Fullscreen Viewport Alignment & Modal Responsive Layout for 'Halloween Escape: Witch's Crypt'

### 🏷️ Labels
`level2`, `ui`, `game-layout`, `halloween`, `responsive`, `nsoc26`

### 📋 Description
In **"Halloween Escape: Witch's Crypt"** (`games/escape-room_debasmita/`), players inspect the crypt chamber to solve puzzles and unlock the gate. While the canvas scales, extreme aspect ratios (e.g. 21:9 ultrawide monitors or tall 9:19 mobile phones) can cause hotspot overlays to shift relative to canvas graphics, and puzzle modals need responsive styling.

### 🎯 Scope & Layout Fixes Required
1. **Interactive Hotspot Scaling:**
   - Hotspots (`#hotspotGate`, `#hotspotBooks`, `#hotspotCauldron`, `#hotspotPedestal`, `#hotspotChest`, `#hotspotTorches`, `#hotspotPlant`) currently use percentage positioning. Ensure canvas rendering maintains consistent aspect ratio anchor points (or letterbox pillarboxing if needed on extreme vertical ratios) so hotspots align pixel-perfect over the drawn stone objects on all devices.
2. **Bottom Inventory Dock (`.inventory-panel`):**
   - On mobile screens (`< 500px`), the inventory slots (6 items) and the title/hint text can wrap and cause vertical expansion.
   - Make the inventory dock compact on mobile: horizontal swipeable slots row with item count badges, and place the inspection hint text in a floating tooltip above the bar.
3. **Puzzle Modals (Grimoire Bookshelf, Cauldron, Runic Pedestal):**
   - **Bookshelf (`.bookshelf-shelf`):** The 4 books (`BLOOD`, `DUSK`, `VINE`, `VOID`) should shrink proportionally on mobile (`height: 100px; width: 40px;` on mobile vs `140px x 50px` on desktop) to fit inside the modal without horizontal overflow.
   - **Runic Pedestal (`.runic-dials-row`):** Ensure the 3 dial columns have minimum 44px touch targets for the UP and DOWN buttons.
   - **Cauldron (`#modalCauldron`):** Ingredient status badges should wrap into a clean 3-chip row on mobile.
4. **Header HUD (`.crypt-header`):**
   - Ensure timer box, audio toggle, hint button, and help guide remain in a single row without pushing the title text off-screen.

### 📁 Target Files
- `games/escape-room_debasmita/style.css`
- `games/escape-room_debasmita/index.html`
- `games/escape-room_debasmita/game.js`

### ✅ Acceptance Criteria
- [ ] Hotspot targets align over drawn canvas elements across 16:9, 4:3, and 9:16 aspect ratios.
- [ ] Inventory bar fits neatly across screen bottom without blocking crypt view.
- [ ] All 3 puzzle modals fit within mobile viewport without double scrollbars.
- [ ] Passes `node scripts/validate-games.js` with 0 errors and 0 warnings.

---

## 📌 Issue 5: [Platform/UX]: Optimize Game Player Modal Frame & Viewport Container for Halloween Games

### 🏷️ Labels
`level2`, `ui`, `platform`, `responsive`, `nsoc26`

### 📋 Description
When launching games from the homepage, ArcadeVerse renders them inside `.modal-window` via an `<iframe>`. Certain mobile browsers (iOS Safari and Android Chrome) calculate `85vh` modal height dynamically when URL address bars collapse, which can cause subtle iframe clipping or letterboxing.

### 🎯 Scope & Layout Fixes Required
1. **Dynamic Viewport Height (`100dvh` / `85dvh`):**
   - Update `.modal-window` in `assets/css/style.css` to leverage `dvh` (dynamic viewport height) units (`max-height: 88dvh; height: 88dvh;`) with `vh` fallback to prevent address-bar resize jitter on mobile.
2. **Fullscreen Mode Layout:**
   - In `.modal-window.fullscreen`, ensure the game iframe occupies `100vw` and `calc(100dvh - var(--topbar-height))` with zero extra margins or borders.
3. **Modal Topbar Controls Layout:**
   - Ensure the game title, author badge, category pill, favorite star, fullscreen toggle, and close button do not collide on screens `< 480px`.
   - On narrow mobile devices, collapse the author tag to avatar initial or hide secondary tags so the title and close `X` button remain easily tappable.

### 📁 Target Files
- `assets/css/style.css`
- `assets/js/app.js`

### ✅ Acceptance Criteria
- [ ] Modal iframe fits perfectly without vertical scrollbars or address-bar jump on iOS and Android browsers.
- [ ] Modal topbar controls remain cleanly spaced on screens down to 320px width.
- [ ] Fullscreen toggle smoothly expands to full device dimensions.
