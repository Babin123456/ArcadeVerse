/**
 * ArcadeVerse Registry Auto-Generator
 * Scans all games in games/<game-name_contributor-name>/game.json
 * Compiles assets/js/games-registry.js cleanly and without merge conflicts.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const GAMES_DIR = path.join(ROOT_DIR, 'games');
const REGISTRY_FILE = path.join(ROOT_DIR, 'assets', 'js', 'games-registry.js');

function buildRegistry() {
  if (!fs.existsSync(GAMES_DIR)) {
    console.error(`Error: games directory not found at ${GAMES_DIR}`);
    process.exit(1);
  }

  // 1. Compile Games Registry
  const gameEntries = fs.readdirSync(GAMES_DIR, { withFileTypes: true });
  const gameFolders = gameEntries.filter(e => e.isDirectory()).map(e => e.name);

  const gamesRegistry = [];
  const contributorStats = new Map();

  for (const folder of gameFolders) {
    const metaFile = path.join(GAMES_DIR, folder, 'game.json');
    if (!fs.existsSync(metaFile)) {
      console.warn(`[Skip Game] ${folder}: Missing game.json`);
      continue;
    }

    try {
      const raw = fs.readFileSync(metaFile, 'utf8');
      const meta = JSON.parse(raw);

      const gameId = meta.id || folder;
      const htmlPath = `games/${folder}/index.html`;

      const gameObj = {
        id: gameId,
        title: meta.title || folder,
        category: meta.category || "Arcade",
        lucideIcon: meta.lucideIcon || "gamepad-2",
        description: meta.description || "",
        author: meta.author || "Contributor",
        github: meta.github || "",
        role: meta.role || "Arcade Developer",
        path: htmlPath,
        tags: Array.isArray(meta.tags) ? meta.tags : ["Arcade"],
        stars: typeof meta.stars === 'number' ? meta.stars : 25,
        featured: Boolean(meta.featured)
      };

      if (meta.difficulty) gameObj.difficulty = meta.difficulty;
      if (meta.releaseDate) gameObj.releaseDate = meta.releaseDate;

      gamesRegistry.push(gameObj);

      // Track contributors
      if (meta.github) {
        const gh = meta.github;
        if (!contributorStats.has(gh)) {
          contributorStats.set(gh, {
            name: meta.author || gh,
            github: gh,
            avatarInitial: (meta.author || gh).charAt(0).toUpperCase(),
            games: []
          });
        }
        contributorStats.get(gh).games.push(gameObj.title);
      }
    } catch (err) {
      console.error(`[Error] Failed parsing ${metaFile}:`, err.message);
    }
  }

  // Features registry is empty following the retirement of the others/ folder
  const featuresRegistry = [];

  // Preserve established Contributors registry structure
  const predefinedContributors = [
    {
      name: "Debasmita Bose",
      github: "DebasmitaBose0",
      avatarInitial: "D",
      role: "Project Admin & Lead (NSOC '26)",
      commits: 37,
      gamesCount: contributorStats.has("DebasmitaBose0") ? contributorStats.get("DebasmitaBose0").games.length : 2,
      mechanicsBonus: 2,
      platformPRs: 2,
      qualityPRs: 0,
      bonusPts: 0,
      contributions: contributorStats.has("DebasmitaBose0") ? contributorStats.get("DebasmitaBose0").games : ["Quantum Memory Matrix", "Cyber Neon Pong", "Arcade Core Engine"]
    },
    {
      name: "Babin Bid",
      github: "Babin123456",
      avatarInitial: "B",
      role: "Arcade Developer (NSOC '26)",
      commits: 19,
      gamesCount: contributorStats.has("Babin123456") ? contributorStats.get("Babin123456").games.length : 10,
      mechanicsBonus: 2,
      platformPRs: 29,
      qualityPRs: 1,
      bonusPts: 0,
      contributions: contributorStats.has("Babin123456") ? contributorStats.get("Babin123456").games : ["Quantum 2048", "Cyber Tower Stacker"]
    },
    {
      name: "mistu7debnath",
      github: "mistu7debnath",
      avatarInitial: "M",
      role: "Contributor (NSOC '26)",
      commits: 2,
      gamesCount: contributorStats.has("mistu7debnath") ? contributorStats.get("mistu7debnath").games.length : 4,
      mechanicsBonus: 1,
      platformPRs: 0,
      qualityPRs: 0,
      bonusPts: 0,
      contributions: contributorStats.has("mistu7debnath") ? contributorStats.get("mistu7debnath").games : ["Flappy Cyber Jet"]
    },
    {
      name: "Harsh Jaiswani",
      github: "hrshjswniii",
      avatarInitial: "H",
      role: "Active Contributor (NSOC '26)",
      commits: 2,
      gamesCount: contributorStats.has("hrshjswniii") ? contributorStats.get("hrshjswniii").games.length : 0,
      mechanicsBonus: 0,
      platformPRs: 0,
      qualityPRs: 1,
      bonusPts: 0,
      contributions: ["Quality & Bug Fix PR"]
    },
    {
      name: "Joita Paul",
      github: "joitapaul",
      avatarInitial: "J",
      role: "Active Contributor (NSOC '26)",
      commits: 1,
      gamesCount: contributorStats.has("joitapaul") ? contributorStats.get("joitapaul").games.length : 4,
      mechanicsBonus: 0,
      platformPRs: 0,
      qualityPRs: 1,
      bonusPts: 0,
      contributions: contributorStats.has("joitapaul") ? contributorStats.get("joitapaul").games : ["Quality & Bug Fix PR", "Neon Asteroid Escape"]
    },
    {
      name: "Pragna Seetha",
      github: "pragna7",
      avatarInitial: "P",
      role: "Contributor (NSOC '26)",
      commits: 1,
      gamesCount: contributorStats.has("pragna7") ? contributorStats.get("pragna7").games.length : 1,
      mechanicsBonus: 0,
      platformPRs: 0,
      qualityPRs: 0,
      bonusPts: 0,
      contributions: contributorStats.has("pragna7") ? contributorStats.get("pragna7").games : ["Astro Infinite Jumper"]
    }
  ];

  const code = `const GAMES_REGISTRY = ${JSON.stringify(gamesRegistry, null, 2)};\n\nconst FEATURES_REGISTRY = ${JSON.stringify(featuresRegistry, null, 2)};\n\nconst CONTRIBUTORS_REGISTRY = ${JSON.stringify(predefinedContributors, null, 2)};\n`;

  fs.writeFileSync(REGISTRY_FILE, code, 'utf8');
  console.log(`✅ Successfully compiled ${gamesRegistry.length} games into ${path.relative(ROOT_DIR, REGISTRY_FILE)}`);
}

buildRegistry();
