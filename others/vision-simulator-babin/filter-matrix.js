/**
 * Vision CVD Filter Matrices
 * Mathematically accurate color transformation matrices for vision deficiency simulation.
 * Author: Babin Bid (@Babin123456)
 */

const VISION_MATRICES = {
  normal: {
    name: "Normal Vision",
    values: "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0",
    filterStyle: "none"
  },
  protanopia: {
    name: "Protanopia (Red-Blind)",
    values: "0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0",
    filterStyle: "url(#cvd-filter)"
  },
  deuteranopia: {
    name: "Deuteranopia (Green-Blind)",
    values: "0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0",
    filterStyle: "url(#cvd-filter)"
  },
  tritanopia: {
    name: "Tritanopia (Blue-Blind)",
    values: "0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0",
    filterStyle: "url(#cvd-filter)"
  },
  achromatopsia: {
    name: "Achromatopsia (Monochromacy)",
    values: "0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0 0 0 1 0",
    filterStyle: "url(#cvd-filter)"
  },
  cataracts: {
    name: "Cataracts / Low Acuity",
    values: "0.8 0.1 0.1 0 0  0.1 0.8 0.1 0 0  0.1 0.1 0.8 0 0  0 0 0 1 0",
    filterStyle: "url(#cvd-filter) blur(2.5px)"
  }
};

class FilterMatrixEngine {
  static applyMode(modeKey, targetElement, svgFilterElement) {
    const config = VISION_MATRICES[modeKey] || VISION_MATRICES.normal;
    if (svgFilterElement) {
      svgFilterElement.setAttribute("values", config.values);
    }
    if (targetElement) {
      targetElement.style.filter = config.filterStyle;
    }
    return config;
  }
}

window.VISION_MATRICES = VISION_MATRICES;
window.FilterMatrixEngine = FilterMatrixEngine;
