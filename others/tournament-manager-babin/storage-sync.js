/**
 * Tournament Storage Sync
 * LocalStorage persistence and tournament export manager.
 * Author: Babin Bid (@Babin123456)
 */

const TOURNAMENT_STORAGE_KEY = "arcadeverse_active_tournament";
const TOURNAMENT_HISTORY_KEY = "arcadeverse_tournament_history";

class TournamentStorageSync {
  static saveActive(tournament) {
    try {
      localStorage.setItem(TOURNAMENT_STORAGE_KEY, JSON.stringify(tournament));
      if (tournament.champion) {
        TournamentStorageSync.archiveTournament(tournament);
      }
    } catch (err) {
      console.warn("Storage sync failed:", err);
    }
  }

  static getActive() {
    try {
      const data = localStorage.getItem(TOURNAMENT_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      return null;
    }
  }

  static clearActive() {
    localStorage.removeItem(TOURNAMENT_STORAGE_KEY);
  }

  static archiveTournament(tournament) {
    try {
      const history = JSON.parse(localStorage.getItem(TOURNAMENT_HISTORY_KEY) || "[]");
      const filtered = history.filter(t => t.id !== tournament.id);
      filtered.unshift({
        id: tournament.id,
        name: tournament.name,
        gameTitle: tournament.gameTitle,
        champion: tournament.champion,
        date: new Date().toLocaleDateString()
      });
      localStorage.setItem(TOURNAMENT_HISTORY_KEY, JSON.stringify(filtered.slice(0, 10)));
    } catch (err) {
      console.warn("Archive sync error:", err);
    }
  }

  static getHistory() {
    try {
      return JSON.parse(localStorage.getItem(TOURNAMENT_HISTORY_KEY) || "[]");
    } catch (err) {
      return [];
    }
  }

  static exportJSON(tournament) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tournament, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `tournament_${tournament.name.toLowerCase().replace(/\s+/g, '_')}.json`);
    dlAnchor.click();
  }
}

window.TournamentStorageSync = TournamentStorageSync;
