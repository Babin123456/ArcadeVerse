/**
 * ArcadeVerse Contributor Game Pre-Flight Validator CLI
 * Audits all community games for folder naming, required files, schema, emojis, and asset resolution
 * Usage: node scripts/validate-games.js
 * Author: Babin Bid (@Babin123456)
 * Open Source for ArcadeVerse - NSOC Winter Edition 2026
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const GAMES_DIR = path.join(ROOT_DIR, 'games');

const REQUIRED_FILES = ['index.html', 'style.css', 'game.js', 'game.json'];
const REQUIRED_JSON_FIELDS = ['title', 'category', 'description', 'author', 'github'];

// Emoji detector regex
const EMOJI_REGEX = /[\uD83C-\uDBFF\uDC00-\uDFFF]|[\u2600-\u27BF]/;

let totalErrors = 0;
let totalWarnings = 0;

console.log('\n🔍 ========================================================');
console.log('   ArcadeVerse Pre-Flight Contributor Game Validator');
console.log('========================================================\n');

if (!fs.existsSync(GAMES_DIR)) {
  console.error('❌ Critical: games directory not found at:', GAMES_DIR);
  process.exit(1);
}

const folders = fs.readdirSync(GAMES_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

console.log(`Found ${folders.length} community games to audit...\n`);

folders.forEach(folder => {
  const gamePath = path.join(GAMES_DIR, folder);
  const issues = [];

  // 1. Folder Naming Convention: <game-name_username>
  if (!/^[a-z0-9-]+_[a-z0-9-]+$/i.test(folder)) {
    issues.push(`⚠️ Folder naming convention should be games/<game-name_username> (got: ${folder})`);
    totalWarnings++;
  }

  // 2. Required Files Check
  REQUIRED_FILES.forEach(file => {
    const filePath = path.join(gamePath, file);
    if (!fs.existsSync(filePath)) {
      issues.push(`❌ Missing required file: ${file}`);
      totalErrors++;
    }
  });

  // 3. game.json Schema & Field Verification
  const metaPath = path.join(gamePath, 'game.json');
  if (fs.existsSync(metaPath)) {
    try {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      REQUIRED_JSON_FIELDS.forEach(field => {
        if (!meta[field]) {
          issues.push(`❌ game.json missing required field: "${field}"`);
          totalErrors++;
        }
      });
    } catch (err) {
      issues.push(`❌ game.json contains invalid JSON: ${err.message}`);
      totalErrors++;
    }
  }

  // 4. Emoji scan in UI files
  ['index.html', 'style.css', 'game.js'].forEach(file => {
    const filePath = path.join(gamePath, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (EMOJI_REGEX.test(content)) {
        issues.push(`⚠️ Detected unicode emoji in ${file}. Please replace with SVG or Lucide icon.`);
        totalWarnings++;
      }
    }
  });

  // 5. HTML Structure Verification
  const htmlPath = path.join(gamePath, 'index.html');
  if (fs.existsSync(htmlPath)) {
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    if (!/<title>.*<\/title>/i.test(htmlContent)) {
      issues.push(`❌ index.html is missing a <title> tag.`);
      totalErrors++;
    }
    if (!/viewport/i.test(htmlContent)) {
      issues.push(`⚠️ index.html is missing a responsive viewport <meta> tag.`);
      totalWarnings++;
    }
  }

  // Print Report for this game
  if (issues.length === 0) {
    console.log(`  ✅ [PASS] ${folder}`);
  } else {
    console.log(`  ⚠️ [AUDIT] ${folder}`);
    issues.forEach(msg => console.log(`      ${msg}`));
  }
});

console.log('\n========================================================');
console.log(`Audited ${folders.length} games: ${totalErrors} Errors, ${totalWarnings} Warnings`);
console.log('========================================================\n');

if (totalErrors > 0) {
  console.error('❌ Validation failed! Please fix the errors listed above before submitting your PR.\n');
  process.exit(1);
} else {
  console.log('✨ All community games pass pre-flight verification!\n');
  process.exit(0);
}
