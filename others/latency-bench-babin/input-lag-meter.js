/**
 * Input Lag Meter
 * Measures delta between hardware event dispatch and next RAF paint loop.
 * Author: Babin Bid (@Babin123456)
 */

class InputLagMeter {
  constructor() {
    this.latencies = [];
    this.maxSamples = 15;
  }

  recordEvent(eventTimestamp, onSampleAdded) {
    const start = performance.now();
    requestAnimationFrame(() => {
      const finish = performance.now();
      const latency = finish - start;
      if (latency > 0 && latency < 100) {
        this.latencies.push(latency);
        if (this.latencies.length > this.maxSamples) {
          this.latencies.shift();
        }
        if (onSampleAdded) {
          onSampleAdded(this.getAverageLatency());
        }
      }
    });
  }

  getAverageLatency() {
    if (this.latencies.length === 0) return 0;
    const sum = this.latencies.reduce((a, b) => a + b, 0);
    return Number((sum / this.latencies.length).toFixed(2));
  }

  reset() {
    this.latencies = [];
  }
}

window.InputLagMeter = InputLagMeter;
