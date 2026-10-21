/**
 * ArcadeVerse Favorites & Quick Launch Engine
 * Persists bookmarked games across sessions with instant filtering
 * Author: Babin Bid (@Babin123456)
 * Event: Nexus Spring of Code – Winter Edition 2026
 */

(function () {
  const STORAGE_KEY = "arcadeverse_favorite_games";

  const FavoritesManager = {
    favorites: new Set(),

    init() {
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        this.favorites = new Set(stored);
      } catch (e) {
        this.favorites = new Set();
      }
      this.updateBadge();
    },

    save() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(this.favorites)));
      this.updateBadge();
    },

    isFavorite(gameId) {
      return this.favorites.has(gameId);
    },

    toggle(gameId) {
      if (this.favorites.has(gameId)) {
        this.favorites.delete(gameId);
      } else {
        this.favorites.add(gameId);
      }
      this.save();
      return this.isFavorite(gameId);
    },

    getAll() {
      return Array.from(this.favorites);
    },

    count() {
      return this.favorites.size;
    },

    updateBadge() {
      const badge = document.getElementById("favorites-count-badge");
      if (badge) {
        badge.textContent = this.count();
        if (this.count() > 0) {
          badge.classList.add("has-items");
        } else {
          badge.classList.remove("has-items");
        }
      }
    }
  };

  FavoritesManager.init();
  window.FavoritesManager = FavoritesManager;
})();
