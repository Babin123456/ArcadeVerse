/**
 * Arcade Score Ledger Engine
 * Consolidated localStorage store for cross-game personal bests.
 * Author: Babin Bid (@Babin123456)
 */

const SCORE_LEDGER_STORAGE_KEY = "arcadeverse_score_ledger";

const DEFAULT_SAMPLE_SCORES = [
  { id: "s1", gameTitle: "Space Invaders Retro", score: 14200, difficulty: "Hard", date: "2026-10-24", durationSec: 245 },
  { id: "s2", gameTitle: "Space Invaders Retro", score: 18500, difficulty: "Hard", date: "2026-10-25", durationSec: 310 },
  { id: "s3", gameTitle: "Cyber Snake Matrix", score: 840, difficulty: "Normal", date: "2026-10-25", durationSec: 180 },
  { id: "s4", gameTitle: "Cyber Snake Matrix", score: 1260, difficulty: "Normal", date: "2026-10-26", durationSec: 290 },
  { id: "s5", gameTitle: "Quantum 2048", score: 20480, difficulty: "Normal", date: "2026-10-26", durationSec: 620 },
  { id: "s6", gameTitle: "Whack-A-Bug Arcade", score: 3450, difficulty: "Extreme", date: "2026-10-27", durationSec: 120 }
];

class ScoreLedger {
  static getRecords() {
    try {
      const raw = localStorage.getItem(SCORE_LEDGER_STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(SCORE_LEDGER_STORAGE_KEY, JSON.stringify(DEFAULT_SAMPLE_SCORES));
        return DEFAULT_SAMPLE_SCORES;
      }
      return JSON.parse(raw);
    } catch (err) {
      return DEFAULT_SAMPLE_SCORES;
    }
  }

  static addRecord(record) {
    const list = ScoreLedger.getRecords();
    const entry = {
      id: "score_" + Date.now(),
      gameTitle: record.gameTitle || "Arcade Game",
      score: Number(record.score) || 0,
      difficulty: record.difficulty || "Normal",
      date: record.date || new Date().toISOString().split("T")[0],
      durationSec: Number(record.durationSec) || 0
    };
    list.unshift(entry);
    localStorage.setItem(SCORE_LEDGER_STORAGE_KEY, JSON.stringify(list));
    return entry;
  }

  static deleteRecord(id) {
    let list = ScoreLedger.getRecords();
    list = list.filter(r => r.id !== id);
    localStorage.setItem(SCORE_LEDGER_STORAGE_KEY, JSON.stringify(list));
  }

  static getPersonalBests() {
    const list = ScoreLedger.getRecords();
    const bests = new Map();

    list.forEach(r => {
      const existing = bests.get(r.gameTitle);
      if (!existing || r.score > existing.score) {
        bests.set(r.gameTitle, r);
      }
    });

    return Array.from(bests.values()).sort((a, b) => b.score - a.score);
  }

  static exportCSV() {
    const list = ScoreLedger.getRecords();
    const header = ["ID", "Game Title", "Score", "Difficulty", "Date", "Duration (s)"];
    const rows = list.map(r => [
      r.id,
      `"${r.gameTitle}"`,
      r.score,
      r.difficulty,
      r.date,
      r.durationSec
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [header.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "arcadeverse_high_scores.csv");
    link.click();
  }
}

window.ScoreLedger = ScoreLedger;
