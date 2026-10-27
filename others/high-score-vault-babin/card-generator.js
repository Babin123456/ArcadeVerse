/**
 * Score Certificate Card Generator
 * Creates verified personal best SVG badges and shareable PNG cards.
 * Author: Babin Bid (@Babin123456)
 */

class ScoreCardGenerator {
  static generateCard(record, playerName = "Arcade Pilot") {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 450;
    const ctx = canvas.getContext("2d");

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, 800, 450);
    bg.addColorStop(0, "#080c16");
    bg.addColorStop(0.5, "#0f172a");
    bg.addColorStop(1, "#030712");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 800, 450);

    // Border
    ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, 760, 410);

    // Inner subtle glow border
    ctx.strokeStyle = "rgba(236, 72, 153, 0.3)";
    ctx.lineWidth = 1;
    ctx.strokeRect(26, 26, 748, 398);

    // Header Stamp
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 14px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("ARCADEVERSE • OFFICIAL HIGH SCORE RECORD", 50, 65);

    // Game Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px 'Space Grotesk', sans-serif";
    ctx.fillText(record.gameTitle, 50, 115);

    // Player Handle
    ctx.fillStyle = "#94a3b8";
    ctx.font = "600 18px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(`Player: ${playerName}`, 50, 150);

    // Large Score Display
    ctx.fillStyle = "#f59e0b";
    ctx.font = "800 64px 'Space Grotesk', sans-serif";
    ctx.fillText(record.score.toLocaleString(), 50, 240);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "14px monospace";
    ctx.fillText("POINTS ACHIEVED", 50, 265);

    // Metadata Footer
    ctx.fillStyle = "#64748b";
    ctx.font = "14px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(`Difficulty: ${record.difficulty}  |  Date: ${record.date}`, 50, 360);

    // NSoC Stamp (Bottom Right)
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1.5;
    ctx.fillStyle = "rgba(56, 189, 248, 0.1)";
    ctx.beginPath();
    ctx.roundRect(580, 320, 170, 50, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 12px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("NSOC '26 VERIFIED", 665, 350);

    return canvas.toDataURL("image/png");
  }

  static downloadCard(record, playerName = "Arcade Pilot") {
    const dataUrl = ScoreCardGenerator.generateCard(record, playerName);
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `highscore_${record.gameTitle.toLowerCase().replace(/\s+/g, '_')}.png`;
    a.click();
  }
}

window.ScoreCardGenerator = ScoreCardGenerator;
