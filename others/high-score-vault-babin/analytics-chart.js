/**
 * SVG Analytics Chart Renderer
 * Zero-dependency pure SVG bar and trend visualizer for high scores.
 * Author: Babin Bid (@Babin123456)
 */

class AnalyticsChart {
  static renderBarChart(container, bests) {
    container.innerHTML = "";
    if (!bests || bests.length === 0) {
      container.innerHTML = `<div style="color: #94a3b8; text-align: center; padding: 40px;">No score data available yet.</div>`;
      return;
    }

    const width = 640;
    const height = 260;
    const padding = { top: 20, right: 30, bottom: 40, left: 130 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxScore = Math.max(...bests.map(b => b.score), 100);
    const barHeight = Math.min(32, Math.floor(chartH / bests.length) - 8);

    let svg = `<svg viewBox="0 0 ${width} ${height}" width="100%" height="100%" style="overflow: visible;">
      <defs>
        <linearGradient id="neonBarGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#0284c7" />
          <stop offset="100%" stop-color="#38bdf8" />
        </linearGradient>
      </defs>
    `;

    bests.forEach((item, idx) => {
      const y = padding.top + idx * (barHeight + 8);
      const barW = Math.max(10, (item.score / maxScore) * chartW);

      // Label (Game Title)
      svg += `<text x="${padding.left - 10}" y="${y + barHeight / 2 + 4}" fill="#94a3b8" font-size="12" font-family="'Plus Jakarta Sans', sans-serif" text-anchor="end">${item.gameTitle.length > 16 ? item.gameTitle.slice(0, 16) + '...' : item.gameTitle}</text>`;

      // Background Track
      svg += `<rect x="${padding.left}" y="${y}" width="${chartW}" height="${barHeight}" rx="4" fill="rgba(255,255,255,0.03)" />`;

      // Active Neon Bar
      svg += `<rect x="${padding.left}" y="${y}" width="${barW}" height="${barHeight}" rx="4" fill="url(#neonBarGrad)" />`;

      // Score Value text
      svg += `<text x="${padding.left + barW + 8}" y="${y + barHeight / 2 + 4}" fill="#38bdf8" font-size="12" font-weight="700" font-family="monospace">${item.score.toLocaleString()}</text>`;
    });

    svg += `</svg>`;
    container.innerHTML = svg;
  }
}

window.AnalyticsChart = AnalyticsChart;
