/**
 * Retro SFX Code Generator
 * Converts synthesis parameters to standalone, zero-dependency Vanilla JS snippets.
 * Author: Babin Bid (@Babin123456)
 */

class SFXCodeGenerator {
  static toVanillaSnippet(params, functionName = "playCustomSFX") {
    if (params.waveform === "noise") {
      return `/**
 * Procedural Explosion / Noise SFX (Pure Vanilla JS)
 * Zero external audio files required. Safe for ArcadeVerse games!
 */
function ${functionName}() {
  const ctx = window.audioContextInstance || (window.audioContextInstance = new (window.AudioContext || window.webkitAudioContext)());
  if (ctx.state === "suspended") ctx.resume();

  const duration = ${(params.attack + params.hold + params.decay).toFixed(2)};
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "${params.filterType || "lowpass"}";
  filter.frequency.setValueAtTime(${params.filterCutoff || 2000}, ctx.currentTime);
  filter.Q.setValueAtTime(${params.filterResonance || 3}, ctx.currentTime);

  const gain = ctx.createGain();
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(${params.volume || 0.4}, now + ${params.attack});
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(now);
  noise.stop(now + duration);
}`;
    }

    return `/**
 * Procedural Retro Arcade SFX (Pure Vanilla JS)
 * Zero external audio files required. Safe for ArcadeVerse games!
 */
function ${functionName}() {
  const ctx = window.audioContextInstance || (window.audioContextInstance = new (window.AudioContext || window.webkitAudioContext)());
  if (ctx.state === "suspended") ctx.resume();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  const now = ctx.currentTime;
  const duration = ${(params.attack + params.hold + params.decay).toFixed(2)};

  osc.type = "${params.waveform || "square"}";
  osc.frequency.setValueAtTime(${params.startFreq || 440}, now);
  osc.frequency.${params.slideType === "linear" ? "linearRampToValueAtTime" : "exponentialRampToValueAtTime"}(${params.endFreq || 110}, now + duration);

  filter.type = "${params.filterType || "lowpass"}";
  filter.frequency.setValueAtTime(${params.filterCutoff || 4000}, now);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(${params.volume || 0.3}, now + ${params.attack});
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration + 0.05);
}`;
  }
}

window.SFXCodeGenerator = SFXCodeGenerator;
