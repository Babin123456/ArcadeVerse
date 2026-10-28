/**
 * ArcadeVerse Interactive Game Ratings & Review Engine
 * Provides interactive 5-star rating widgets and community rating score integration
 * Author: Babin Bid (@Babin123456)
 * Open Source for ArcadeVerse - NSOC Winter Edition 2026
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'arcadeverse_game_ratings';

  const GameRatings = {
    ratings: {},

    init() {
      this.loadRatings();
      this.bindEvents();
    },

    loadRatings() {
      try {
        this.ratings = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
      } catch (_) {
        this.ratings = {};
      }
    },

    saveRatings() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.ratings));
      } catch (_) {}
    },

    getGameRating(gameId, defaultStars = 25) {
      const userRating = this.ratings[gameId];
      if (userRating) {
        return {
          score: userRating,
          stars: defaultStars + userRating,
          userVoted: true
        };
      }
      return {
        score: null,
        stars: defaultStars,
        userVoted: false
      };
    },

    setGameRating(gameId, rating) {
      this.ratings[gameId] = rating;
      this.saveRatings();

      // Trigger custom event so app.js or catalog re-renders if sorted
      window.dispatchEvent(new CustomEvent('rating-updated', { detail: { gameId, rating } }));
    },

    bindEvents() {
      // Listen for click on rating trigger button
      document.addEventListener('click', (e) => {
        const starBtn = e.target.closest('.rate-star-btn');
        if (starBtn) {
          e.preventDefault();
          e.stopPropagation();
          const gameId = starBtn.dataset.game;
          const score = parseInt(starBtn.dataset.star, 10);
          if (gameId && score) {
            this.setGameRating(gameId, score);
            this.updateStarUI(gameId, score);
          }
        }
      });
    },

    updateStarUI(gameId, score) {
      const card = document.querySelector(`[data-game-id="${gameId}"]`);
      if (card) {
        const starContainer = card.querySelector('.game-rating-stars');
        if (starContainer) {
          const stars = starContainer.querySelectorAll('.rate-star-btn');
          stars.forEach((s, idx) => {
            if (idx < score) s.classList.add('voted');
            else s.classList.remove('voted');
          });
        }
      }
    }
  };

  window.GameRatings = GameRatings;
  document.addEventListener('DOMContentLoaded', () => GameRatings.init());
})();
