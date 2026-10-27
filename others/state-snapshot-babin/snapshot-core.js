/**
 * State Snapshot Core
 * Checkpoint serialization, timeline indexing, and state restoration engine.
 * Author: Babin Bid (@Babin123456)
 */

const SNAPSHOT_STORAGE_KEY = "arcadeverse_debug_snapshots";

const SAMPLE_SNAPSHOTS = [
  {
    id: "snap_101",
    timestamp: "2026-10-27T12:00:00Z",
    gameTitle: "Space Invaders Retro",
    label: "Wave 1 Initialized",
    score: 0,
    state: { playerHp: 3, wave: 1, enemiesRemaining: 48, speedMultiplier: 1.0 }
  },
  {
    id: "snap_102",
    timestamp: "2026-10-27T12:02:15Z",
    gameTitle: "Space Invaders Retro",
    label: "Bunker Breach",
    score: 3400,
    state: { playerHp: 2, wave: 2, enemiesRemaining: 24, speedMultiplier: 1.25 }
  },
  {
    id: "snap_103",
    timestamp: "2026-10-27T12:05:30Z",
    gameTitle: "Space Invaders Retro",
    label: "Boss Swarm Triggered",
    score: 11200,
    state: { playerHp: 1, wave: 3, enemiesRemaining: 12, speedMultiplier: 1.6 }
  }
];

class SnapshotCore {
  static getSnapshots() {
    try {
      const raw = localStorage.getItem(SNAPSHOT_STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(SNAPSHOT_STORAGE_KEY, JSON.stringify(SAMPLE_SNAPSHOTS));
        return SAMPLE_SNAPSHOTS;
      }
      return JSON.parse(raw);
    } catch (err) {
      return SAMPLE_SNAPSHOTS;
    }
  }

  static createSnapshot(gameTitle, label, score, stateData) {
    const list = SnapshotCore.getSnapshots();
    const entry = {
      id: "snap_" + Date.now(),
      timestamp: new Date().toISOString(),
      gameTitle: gameTitle || "Arcade Game",
      label: label || "Manual Checkpoint",
      score: Number(score) || 0,
      state: stateData || {}
    };
    list.push(entry);
    localStorage.setItem(SNAPSHOT_STORAGE_KEY, JSON.stringify(list));
    return entry;
  }

  static deleteSnapshot(id) {
    let list = SnapshotCore.getSnapshots();
    list = list.filter(s => s.id !== id);
    localStorage.setItem(SNAPSHOT_STORAGE_KEY, JSON.stringify(list));
  }

  static clearAll() {
    localStorage.removeItem(SNAPSHOT_STORAGE_KEY);
  }
}

window.SnapshotCore = SnapshotCore;
