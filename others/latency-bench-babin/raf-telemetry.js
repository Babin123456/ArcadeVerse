/**
 * requestAnimationFrame Telemetry Engine
 * High-precision display refresh rate and frame-time jitter analyzer.
 * Author: Babin Bid (@Babin123456)
 */

class RafTelemetryEngine {
  constructor() {
    this.samples = [];
    this.maxSamples = 180; // 3 seconds at 60fps
    this.lastTimestamp = 0;
    this.isBenchmarking = false;
    this.onComplete = null;
    this.animId = null;
  }

  startBenchmark(onProgress, onComplete) {
    this.samples = [];
    this.lastTimestamp = performance.now();
    this.isBenchmarking = true;
    this.onComplete = onComplete;

    const step = (now) => {
      if (!this.isBenchmarking) return;

      const delta = now - this.lastTimestamp;
      this.lastTimestamp = now;

      if (delta > 0 && delta < 200) { // filter out tab switch anomalies
        this.samples.push(delta);
      }

      if (onProgress) {
        onProgress(Math.min(100, Math.floor((this.samples.length / this.maxSamples) * 100)));
      }

      if (this.samples.length >= this.maxSamples) {
        this.isBenchmarking = false;
        const results = this.calculateMetrics();
        if (this.onComplete) this.onComplete(results);
        return;
      }

      this.animId = requestAnimationFrame(step);
    };

    this.animId = requestAnimationFrame(step);
  }

  stop() {
    this.isBenchmarking = false;
    if (this.animId) cancelAnimationFrame(this.animId);
  }

  calculateMetrics() {
    if (this.samples.length === 0) return null;

    const sum = this.samples.reduce((a, b) => a + b, 0);
    const mean = sum / this.samples.length;

    // Standard deviation (jitter)
    const variance = this.samples.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / this.samples.length;
    const stdDev = Math.sqrt(variance);

    // Frame drops (> 1.4x mean)
    const droppedFrames = this.samples.filter(d => d > mean * 1.4).length;
    const estimatedFps = Math.round(1000 / mean);

    return {
      samplesCount: this.samples.length,
      meanFrameTimeMs: Number(mean.toFixed(2)),
      jitterStdDevMs: Number(stdDev.toFixed(2)),
      droppedFrames,
      dropPercentage: Number(((droppedFrames / this.samples.length) * 100).toFixed(1)),
      estimatedFps
    };
  }
}

window.RafTelemetryEngine = RafTelemetryEngine;
