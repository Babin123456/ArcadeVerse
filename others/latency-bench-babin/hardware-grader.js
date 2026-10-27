/**
 * Hardware Grader & Diagnostic Advisor
 * Categorizes client rendering capability into arcade performance tiers.
 * Author: Babin Bid (@Babin123456)
 */

class HardwareGrader {
  static evaluate(rafMetrics, avgInputLag) {
    const fps = rafMetrics.estimatedFps;
    const jitter = rafMetrics.jitterStdDevMs;
    const drops = rafMetrics.dropPercentage;
    const inputLag = avgInputLag || 12;

    let tier = "Tier B";
    let badgeColor = "#38bdf8";
    let summary = "Standard Arcade Ready";
    const recommendations = [];

    if (fps >= 60 && jitter < 1.2 && drops < 1.0 && inputLag < 10) {
      tier = "Tier S";
      badgeColor = "#10b981";
      summary = "eSports / Ultra Fast-Twitch Ready";
      recommendations.push("Perfect hardware for 60fps rhythm games, pixel-precise platformers, and bullet-hell shooters.");
      recommendations.push("Display synchronization is optimal with sub-millisecond timer variance.");
    } else if (fps >= 55 && jitter < 3.0 && drops < 3.0) {
      tier = "Tier A";
      badgeColor = "#38bdf8";
      summary = "High-Performance Arcade Ready";
      recommendations.push("Suitable for all ArcadeVerse action and canvas physics games.");
      recommendations.push("Minor micro-stutters detected; consider closing background browser tabs for peak consistency.");
    } else if (fps >= 40) {
      tier = "Tier B";
      badgeColor = "#f59e0b";
      summary = "Standard Playability";
      recommendations.push("Plays turn-based, puzzle, and strategy arcade games without issue.");
      recommendations.push("Recommend reducing canvas particle burst limits or enabling FPS telemetry throttling.");
    } else {
      tier = "Tier C";
      badgeColor = "#ef4444";
      summary = "Hardware Bottleneck Detected";
      recommendations.push("Significant frame pacing fluctuations and drop spikes detected.");
      recommendations.push("Enable hardware acceleration in browser settings or lower resolution scaling.");
    }

    return {
      tier,
      badgeColor,
      summary,
      fps,
      jitter,
      drops,
      inputLag,
      recommendations
    };
  }
}

window.HardwareGrader = HardwareGrader;
