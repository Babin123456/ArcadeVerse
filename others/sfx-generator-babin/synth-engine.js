/**
 * Retro SFX Synth Engine
 * Pure Vanilla Web Audio API procedural sound synthesizer.
 * Author: Babin Bid (@Babin123456)
 */

class RetroSynthEngine {
  constructor() {
    this.audioCtx = null;
  }

  ensureContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  play(params, onVisualizerData = null) {
    const ctx = this.ensureContext();
    const now = ctx.currentTime;

    const duration = Math.max(0.05, Math.min(2.0, (params.attack || 0.01) + (params.hold || 0.05) + (params.decay || 0.2)));
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, now);

    // Envelope
    const attackTime = Math.max(0.001, params.attack || 0.01);
    const holdTime = Math.max(0.001, params.hold || 0.05);
    const decayTime = Math.max(0.01, params.decay || 0.2);
    const peakVolume = Math.min(1.0, Math.max(0.05, params.volume || 0.3));

    masterGain.gain.exponentialRampToValueAtTime(peakVolume, now + attackTime);
    masterGain.gain.setValueAtTime(peakVolume, now + attackTime + holdTime);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + attackTime + holdTime + decayTime);

    // Filter
    const filter = ctx.createBiquadFilter();
    filter.type = params.filterType || "lowpass";
    filter.frequency.setValueAtTime(params.filterCutoff || 4000, now);
    filter.Q.setValueAtTime(params.filterResonance || 1.0, now);

    // Connect nodes
    let sourceNode;
    if (params.waveform === "noise") {
      // Noise buffer generator
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      sourceNode = ctx.createBufferSource();
      sourceNode.buffer = buffer;
    } else {
      const osc = ctx.createOscillator();
      osc.type = params.waveform || "square";

      const startFreq = Math.max(20, params.startFreq || 440);
      const endFreq = Math.max(20, params.endFreq || 220);

      osc.frequency.setValueAtTime(startFreq, now);
      if (params.slideType === "linear") {
        osc.frequency.linearRampToValueAtTime(endFreq, now + duration);
      } else {
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
      }

      // Vibrato LFO if requested
      if (params.vibratoDepth > 0) {
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(params.vibratoSpeed || 15, now);
        lfoGain.gain.setValueAtTime(params.vibratoDepth * 20, now);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start(now);
        lfo.stop(now + duration);
      }

      sourceNode = osc;
    }

    // Optional Analyser for real-time visualization
    let analyser = null;
    if (onVisualizerData) {
      analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      masterGain.connect(analyser);
      analyser.connect(ctx.destination);
    } else {
      masterGain.connect(ctx.destination);
    }

    sourceNode.connect(filter);
    filter.connect(masterGain);

    sourceNode.start(now);
    sourceNode.stop(now + duration + 0.05);

    if (analyser && onVisualizerData) {
      onVisualizerData(analyser, duration);
    }
  }

  async exportWavBlob(params) {
    const sampleRate = 44100;
    const duration = Math.max(0.05, Math.min(2.0, (params.attack || 0.01) + (params.hold || 0.05) + (params.decay || 0.2)));
    const OfflineCtxClass = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const offlineCtx = new OfflineCtxClass(1, Math.ceil(sampleRate * duration), sampleRate);

    const now = 0;
    const masterGain = offlineCtx.createGain();
    masterGain.gain.setValueAtTime(0.001, now);

    const attackTime = Math.max(0.001, params.attack || 0.01);
    const holdTime = Math.max(0.001, params.hold || 0.05);
    const decayTime = Math.max(0.01, params.decay || 0.2);
    const peakVolume = Math.min(1.0, Math.max(0.05, params.volume || 0.3));

    masterGain.gain.exponentialRampToValueAtTime(peakVolume, now + attackTime);
    masterGain.gain.setValueAtTime(peakVolume, now + attackTime + holdTime);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + attackTime + holdTime + decayTime);

    const filter = offlineCtx.createBiquadFilter();
    filter.type = params.filterType || "lowpass";
    filter.frequency.setValueAtTime(params.filterCutoff || 4000, now);
    filter.Q.setValueAtTime(params.filterResonance || 1.0, now);

    let sourceNode;
    if (params.waveform === "noise") {
      const bufferSize = Math.floor(sampleRate * duration);
      const buffer = offlineCtx.createBuffer(1, bufferSize, sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      sourceNode = offlineCtx.createBufferSource();
      sourceNode.buffer = buffer;
    } else {
      const osc = offlineCtx.createOscillator();
      osc.type = params.waveform || "square";
      osc.frequency.setValueAtTime(Math.max(20, params.startFreq || 440), now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, params.endFreq || 220), now + duration);
      sourceNode = osc;
    }

    sourceNode.connect(filter);
    filter.connect(masterGain);
    masterGain.connect(offlineCtx.destination);

    sourceNode.start(now);
    sourceNode.stop(now + duration);

    const renderedBuffer = await offlineCtx.startRendering();
    return this.bufferToWav(renderedBuffer);
  }

  bufferToWav(buffer) {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const out = new DataView(new ArrayBuffer(length));
    const channels = [];
    let sample = 0;
    let offset = 0;
    let pos = 0;

    function setUint16(data) {
      out.setUint16(pos, data, true);
      pos += 2;
    }
    function setUint32(data) {
      out.setUint32(pos, data, true);
      pos += 4;
    }

    // RIFF identifier
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8);
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt "
    setUint32(16); // subchunk1size (16 for PCM)
    setUint16(1); // PCM format
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan); // byte rate
    setUint16(numOfChan * 2); // block align
    setUint16(16); // bits per sample
    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4);

    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
      for (let i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        out.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return new Blob([out], { type: "audio/wav" });
  }
}

window.RetroSynthEngine = RetroSynthEngine;
