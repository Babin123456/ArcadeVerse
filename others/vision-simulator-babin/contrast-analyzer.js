/**
 * WCAG 2.1 Contrast Ratio Analyzer
 * Standardized color luminance and accessibility verification formulas.
 * Author: Babin Bid (@Babin123456)
 */

class ContrastAnalyzer {
  static hexToRgb(hex) {
    const cleaned = hex.replace("#", "");
    const bigint = parseInt(cleaned.length === 3 ? cleaned.split("").map(c => c + c).join("") : cleaned, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255
    };
  }

  static getLuminance(rgb) {
    const a = [rgb.r, rgb.g, rgb.b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  static getContrastRatio(fgHex, bgHex) {
    const fg = ContrastAnalyzer.hexToRgb(fgHex);
    const bg = ContrastAnalyzer.hexToRgb(bgHex);
    const l1 = ContrastAnalyzer.getLuminance(fg);
    const l2 = ContrastAnalyzer.getLuminance(bg);
    const brighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    const ratio = (brighter + 0.05) / (darker + 0.05);

    const rounded = Number(ratio.toFixed(2));
    return {
      ratio: rounded,
      wcagAA_Normal: rounded >= 4.5,
      wcagAA_Large: rounded >= 3.0,
      wcagAAA_Normal: rounded >= 7.0,
      wcagAAA_Large: rounded >= 4.5
    };
  }
}

window.ContrastAnalyzer = ContrastAnalyzer;
