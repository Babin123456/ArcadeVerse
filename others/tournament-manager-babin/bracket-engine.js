/**
 * Tournament Bracket Engine
 * Generates single-elimination tournament trees and handles bracket progression.
 * Author: Babin Bid (@Babin123456)
 */

class BracketEngine {
  static createTournament(tournamentName, gameTitle, players) {
    const playerCount = players.length;
    let bracketSize = 4;
    if (playerCount > 8) bracketSize = 16;
    else if (playerCount > 4) bracketSize = 8;

    // Pad players with Byes if needed
    const seeded = [...players];
    while (seeded.length < bracketSize) {
      seeded.push("BYE");
    }

    const roundCount = Math.log2(bracketSize);
    const rounds = [];

    // Round 1 (Opening Round / Quarterfinals)
    const r1Matches = [];
    for (let i = 0; i < bracketSize / 2; i++) {
      const p1 = seeded[i * 2];
      const p2 = seeded[i * 2 + 1];
      const match = {
        id: `r1-m${i + 1}`,
        roundIndex: 0,
        player1: p1,
        player2: p2,
        score1: 0,
        score2: 0,
        winner: null,
        status: (p1 === "BYE" || p2 === "BYE") ? "completed" : "pending"
      };
      if (p2 === "BYE") match.winner = p1;
      else if (p1 === "BYE") match.winner = p2;
      r1Matches.push(match);
    }
    rounds.push({ name: BracketEngine.getRoundName(0, roundCount), matches: r1Matches });

    // Subsequent Rounds
    let prevMatchCount = bracketSize / 2;
    for (let r = 1; r < roundCount; r++) {
      const matchCount = prevMatchCount / 2;
      const matches = [];
      for (let m = 0; m < matchCount; m++) {
        matches.push({
          id: `r${r + 1}-m${m + 1}`,
          roundIndex: r,
          player1: null,
          player2: null,
          score1: 0,
          score2: 0,
          winner: null,
          status: "pending"
        });
      }
      rounds.push({ name: BracketEngine.getRoundName(r, roundCount), matches });
      prevMatchCount = matchCount;
    }

    // Propagate any BYE winners from Round 1
    BracketEngine.syncProgression(rounds);

    return {
      id: "tourney_" + Date.now(),
      name: tournamentName,
      gameTitle: gameTitle,
      bracketSize,
      roundCount,
      rounds,
      champion: null,
      createdAt: new Date().toISOString()
    };
  }

  static getRoundName(roundIndex, totalRounds) {
    const roundsLeft = totalRounds - roundIndex;
    if (roundsLeft === 1) return "Grand Finals";
    if (roundsLeft === 2) return "Semifinals";
    if (roundsLeft === 3) return "Quarterfinals";
    return `Round of ${Math.pow(2, roundsLeft)}`;
  }

  static resolveMatch(tournament, roundIdx, matchIdx, score1, score2) {
    const round = tournament.rounds[roundIdx];
    const match = round.matches[matchIdx];

    match.score1 = Number(score1);
    match.score2 = Number(score2);
    match.status = "completed";
    match.winner = match.score1 >= match.score2 ? match.player1 : match.player2;

    BracketEngine.syncProgression(tournament.rounds);

    // Check if Grand Finals completed
    const finalRound = tournament.rounds[tournament.rounds.length - 1];
    if (finalRound.matches[0].status === "completed") {
      tournament.champion = finalRound.matches[0].winner;
    }

    return tournament;
  }

  static syncProgression(rounds) {
    for (let r = 0; r < rounds.length - 1; r++) {
      const currentRound = rounds[r];
      const nextRound = rounds[r + 1];

      for (let m = 0; m < currentRound.matches.length; m++) {
        const match = currentRound.matches[m];
        if (match.status === "completed" && match.winner) {
          const nextMatchIdx = Math.floor(m / 2);
          const nextMatch = nextRound.matches[nextMatchIdx];
          if (m % 2 === 0) {
            nextMatch.player1 = match.winner;
          } else {
            nextMatch.player2 = match.winner;
          }
        }
      }
    }
  }
}

window.BracketEngine = BracketEngine;
