/**
 * Accessibility Audit Reporter
 * Generates structured compliance summaries and recommendations for game UI.
 * Author: Babin Bid (@Babin123456)
 */

class AuditReporter {
  static generateReport(gameTitle, testedMode, fgColor, bgColor, contrastResult) {
    const isCompliant = contrastResult.wcagAA_Large;
    const tips = [];

    if (!contrastResult.wcagAA_Normal) {
      tips.push("Body text and score displays should increase contrast or increase font weight to 700+ to satisfy WCAG AA.");
    }
    if (testedMode === "protanopia" || testedMode === "deuteranopia") {
      tips.push("Avoid relying solely on Red vs Green indicators (e.g. Health vs Poison). Supplement color cues with distinct icons or shape badges.");
    }
    if (testedMode === "achromatopsia") {
      tips.push("Ensure HUD elements have brightness contrast rather than hue contrast.");
    }

    return {
      gameTitle,
      testedMode,
      ratio: contrastResult.ratio,
      isCompliant,
      status: isCompliant ? "PASS (WCAG AA)" : "ATTENTION NEEDED",
      tips: tips.length > 0 ? tips : ["Color contrast meets recommended arcade visibility standards!"]
    };
  }
}

window.AuditReporter = AuditReporter;
