/**
 * AudioSynthesizer
 * Procedural generative ambient soundscapes using Web Audio API
 * Zero external audio assets required. Infinite non-repeating meditation/focus audio.
 */

export class AudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.volume = 0.45;
    this.currentMode = 'sanctuary'; // 'sanctuary', 'rain', 'void'

    // Oscillators & Nodes
    this.droneOsc1 = null;
    this.droneOsc2 = null;
    this.droneFilter = null;
    this.noiseNode = null;
    this.noiseFilter = null;
    this.noiseGain = null;

    // Pentatonic scale frequencies for crystal chimes (A Minor Pentatonic: A4, C5, D5, E5, G5, A5, C6)
    this.chimeScale = [440.0, 523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    this.lastChimeTime = 0;
  }

  /**
   * Initialize AudioContext on first user interaction
   */
  initContext() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  /**
   * Start or resume ambient synthesizer
   */
  async start() {
    this.initContext();
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    if (!this.isPlaying) {
      this.createDrone();
      this.createAtmosphericNoise();
      this.isPlaying = true;
    }
  }

  /**
   * Stop / mute ambient synthesizer
   */
  stop() {
    if (!this.isPlaying) return;
    if (this.droneOsc1) {
      try {
        this.droneOsc1.stop();
        this.droneOsc2.stop();
      } catch (e) {}
    }
    if (this.noiseNode) {
      try {
        this.noiseNode.stop();
      } catch (e) {}
    }
    this.isPlaying = false;
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
    return this.isPlaying;
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  setMode(mode) {
    this.currentMode = mode;
    if (this.isPlaying) {
      this.updateParameters({});
    }
  }

  /**
   * Generative resonant warm drone (Fundamental + Minor Detuned Fifth)
   */
  createDrone() {
    const t = this.ctx.currentTime;

    // Filter
    this.droneFilter = this.ctx.createBiquadFilter();
    this.droneFilter.type = 'lowpass';
    this.droneFilter.frequency.setValueAtTime(360, t);
    this.droneFilter.Q.setValueAtTime(4.0, t);

    const droneGain = this.ctx.createGain();
    droneGain.gain.setValueAtTime(0.35, t);

    // Osc 1: Root note ~ 110Hz (A2)
    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc1.type = 'sine';
    this.droneOsc1.frequency.setValueAtTime(110.0, t);

    // Osc 2: Detuned overtone ~ 164.5Hz (E3 slightly flat for ethereal shimmer)
    this.droneOsc2 = this.ctx.createOscillator();
    this.droneOsc2.type = 'triangle';
    this.droneOsc2.frequency.setValueAtTime(164.5, t);

    // Slow LFO for organic filter breathing
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.08, t); // 12.5s cycle
    lfoGain.gain.setValueAtTime(120, t);
    lfo.connect(this.droneFilter.frequency);
    lfo.start();

    this.droneOsc1.connect(this.droneFilter);
    this.droneOsc2.connect(this.droneFilter);
    this.droneFilter.connect(droneGain);
    droneGain.connect(this.masterGain);

    this.droneOsc1.start();
    this.droneOsc2.start();
  }

  /**
   * Atmospheric filtered pink noise (Wind & Ether breeze)
   */
  createAtmosphericNoise() {
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Generate Pink Noise (1/f)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    this.noiseFilter = this.ctx.createBiquadFilter();
    this.noiseFilter.type = 'bandpass';
    this.noiseFilter.frequency.setValueAtTime(600, this.ctx.currentTime);
    this.noiseFilter.Q.setValueAtTime(2.2, this.ctx.currentTime);

    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

    this.noiseNode.connect(this.noiseFilter);
    this.noiseFilter.connect(this.noiseGain);
    this.noiseGain.connect(this.masterGain);

    this.noiseNode.start();
  }

  /**
   * Trigger a pure pentatonic crystal bell chime (Called on particle landing/splash)
   */
  triggerCrystalChime(intensity = 0.6) {
    if (!this.isPlaying || !this.ctx) return;
    const now = this.ctx.currentTime;
    // Debounce chimes to prevent clutter
    if (now - this.lastChimeTime < 0.14) return;
    this.lastChimeTime = now;

    const freq = this.chimeScale[Math.floor(Math.random() * this.chimeScale.length)];

    const osc = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Fast ethereal envelope (Instant attack, slow peaceful exponential decay)
    const decayDuration = 1.4 + Math.random() * 0.8;
    chimeGain.gain.setValueAtTime(0.0001, now);
    chimeGain.gain.linearRampToValueAtTime(0.08 * intensity, now + 0.02);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + decayDuration);

    osc.connect(chimeGain);
    chimeGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + decayDuration);
  }

  /**
   * Adapt audio harmonics dynamically to wind speed & temperature
   */
  updateParameters({ windSpeed = 10, temperature = 20, humidity = 50 }) {
    if (!this.isPlaying || !this.ctx) return;
    const t = this.ctx.currentTime;

    // Wind modifies atmospheric noise filter & volume
    if (this.noiseFilter && this.noiseGain) {
      const targetFreq = 400 + windSpeed * 28;
      this.noiseFilter.frequency.setTargetAtTime(targetFreq, t, 0.5);
      const targetGain = 0.05 + (windSpeed / 50) * 0.15;
      this.noiseGain.gain.setTargetAtTime(targetGain, t, 0.5);
    }

    // Temperature shifts fundamental drone cutoff
    if (this.droneFilter) {
      const droneCutoff = 280 + (temperature + 20) * 8;
      this.droneFilter.frequency.setTargetAtTime(Math.min(1000, Math.max(180, droneCutoff)), t, 0.8);
    }
  }
}
