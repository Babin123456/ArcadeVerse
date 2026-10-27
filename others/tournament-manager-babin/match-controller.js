/**
 * Match Controller UI Renderer
 * Interactive bracket DOM rendering, score modal, and winner announcement.
 * Author: Babin Bid (@Babin123456)
 */

class MatchController {
  constructor(containerElement, onScoreSubmit) {
    this.container = containerElement;
    this.onScoreSubmit = onScoreSubmit;
  }

  renderBracket(tournament) {
    this.container.innerHTML = "";

    if (!tournament || !tournament.rounds) {
      this.container.innerHTML = `<div class="empty-bracket">No tournament active. Create a new bracket above!</div>`;
      return;
    }

    const bracketWrapper = document.createElement("div");
    bracketWrapper.className = "bracket-tree";

    tournament.rounds.forEach((round, rIdx) => {
      const col = document.createElement("div");
      col.className = "round-column";

      const roundHeader = document.createElement("div");
      roundHeader.className = "round-header";
      roundHeader.textContent = round.name;
      col.appendChild(roundHeader);

      const matchesList = document.createElement("div");
      matchesList.className = "matches-list";

      round.matches.forEach((match, mIdx) => {
        const matchCard = document.createElement("div");
        matchCard.className = `match-card ${match.status === "completed" ? "completed" : ""}`;

        const isReady = match.player1 && match.player2 && match.player1 !== "BYE" && match.player2 !== "BYE";

        matchCard.innerHTML = `
          <div class="team-slot ${match.winner === match.player1 && match.player1 ? "winner" : ""}">
            <span class="player-name">${match.player1 || "TBD"}</span>
            <span class="player-score">${match.status === "completed" ? match.score1 : "-"}</span>
          </div>
          <div class="team-slot ${match.winner === match.player2 && match.player2 ? "winner" : ""}">
            <span class="player-name">${match.player2 || "TBD"}</span>
            <span class="player-score">${match.status === "completed" ? match.score2 : "-"}</span>
          </div>
        `;

        if (isReady && match.status !== "completed") {
          const scoreBtn = document.createElement("button");
          scoreBtn.className = "btn-log-score";
          scoreBtn.textContent = "Log Score";
          scoreBtn.addEventListener("click", () => {
            this.openScoreModal(match, rIdx, mIdx);
          });
          matchCard.appendChild(scoreBtn);
        }

        matchesList.appendChild(matchCard);
      });

      col.appendChild(matchesList);
      bracketWrapper.appendChild(col);
    });

    this.container.appendChild(bracketWrapper);

    // If champion crowned, show winner banner
    if (tournament.champion) {
      const champBanner = document.createElement("div");
      champBanner.className = "champion-banner";
      champBanner.innerHTML = `
        <div class="trophy-icon">🏆</div>
        <div class="champ-text">
          <h3>Tournament Champion</h3>
          <div class="champ-name">${tournament.champion}</div>
          <p>Crown of ArcadeVerse: ${tournament.gameTitle}</p>
        </div>
      `;
      this.container.prepend(champBanner);
    }
  }

  openScoreModal(match, roundIdx, matchIdx) {
    const p1Score = prompt(`Enter final score for ${match.player1}:`, "10");
    if (p1Score === null) return;
    const p2Score = prompt(`Enter final score for ${match.player2}:`, "8");
    if (p2Score === null) return;

    if (this.onScoreSubmit) {
      this.onScoreSubmit(roundIdx, matchIdx, Number(p1Score), Number(p2Score));
    }
  }
}

window.MatchController = MatchController;
