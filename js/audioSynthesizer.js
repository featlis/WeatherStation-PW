/**
 * AudioSynthesizer - Dynamic Multi-Layer Environmental Soundscape
 * Procedurally synthesizes rich, responsive ambient layers with seamless cross-fading:
 * 1. Warm Harmonic Ambient Pad (Evolving chord intervals)
 * 2. Real Procedural Rain & Droplet Texture (Rain weather)
 * 3. Celestial / Alien Birdsong Chirps (FM-synthesized chirps during Clear/Plains)
 * 4. Grass Rustling & Wind Swells (Plains biome)
 * 5. Rhythmic Ocean Wave Wash (Coast biome)
 * 6. Energy Grid Sub-harmonic Pulse (Megalopolis biome)
 * 7. Pentatonic Crystal Chimes (Particle impacts)
 */

import { BIOME_TYPES } from './renderer/landscape.js';
import { PHENOMENON_TYPES } from './converter.js';

export class AudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.volume = 0.45;

    // Layer Gain Nodes for Seamless Cross-fading
    this.gains = {
      pad: null,
      rain: null,
      wind: null,
      grass: null,
      ocean: null,
      city: null,
      birds: null,
      chimes: null
    };

    // Synthesizer State & Schedulers
    this.birdTimer = null;
    this.lastChimeTime = 0;
    this.chimeScale = [440.0, 523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    this.birdScale = [1318.5, 1567.98, 1760.0, 2093.0, 2349.32, 2637.0]; // High pentatonic for celestial birds
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

    // Create Layer Gains
    Object.keys(this.gains).forEach(layer => {
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      g.connect(this.masterGain);
      this.gains[layer] = g;
    });
  }

  async start() {
    this.initContext();
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    if (!this.isPlaying) {
      this.initPadLayer();
      this.initRainLayer();
      this.initWindAndGrassLayer();
      this.initOceanLayer();
      this.initCityLayer();
      this.startBirdScheduler();
      this.isPlaying = true;
    }
  }

  stop() {
    if (!this.isPlaying) return;
    if (this.birdTimer) clearInterval(this.birdTimer);
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.2);
    }
    this.isPlaying = false;
  }

  toggle() {
    if (this.isPlaying) this.stop();
    else this.start();
    return this.isPlaying;
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  // =========================================================================
  // LAYER 1: WARM HARMONIC PAD (Fundamental + Minor 7th / 9th chords)
  // =========================================================================
  initPadLayer() {
    const t = this.ctx.currentTime;
    this.gains.pad.gain.setTargetAtTime(0.35, t, 1.0);

    const padFilter = this.ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.setValueAtTime(420, t);
    padFilter.Q.setValueAtTime(3.0, t);
    padFilter.connect(this.gains.pad);

    // Triad of warm sines for evolving chord (A2: 110Hz, E3: 164.8Hz, B3: 246.9Hz)
    const freqs = [110.0, 164.8, 246.9];
    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      osc.type = idx === 1 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(f, t);

      // Micro LFO detune for lush analog chorusing
      const lfo = this.ctx.createOscillator();
      const lfoG = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.06 + idx * 0.02, t);
      lfoG.gain.setValueAtTime(1.5, t);
      lfo.connect(osc.detune);
      lfo.start();

      osc.connect(padFilter);
      osc.start();
    });
  }

  // =========================================================================
  // LAYER 2: PROCEDURAL RAIN & DROPLET TEXTURE
  // =========================================================================
  initRainLayer() {
    const noiseBuffer = this.createNoiseBuffer();
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Highpass + Dual Bandpass for realistic rain hiss
    const rainHP = this.ctx.createBiquadFilter();
    rainHP.type = 'highpass';
    rainHP.frequency.setValueAtTime(1200, this.ctx.currentTime);

    const rainBP = this.ctx.createBiquadFilter();
    rainBP.type = 'bandpass';
    rainBP.frequency.setValueAtTime(3200, this.ctx.currentTime);
    rainBP.Q.setValueAtTime(1.2, this.ctx.currentTime);

    noiseSource.connect(rainHP);
    rainHP.connect(rainBP);
    rainBP.connect(this.gains.rain);
    noiseSource.start();

    // Random micro-patter water droplet generator
    setInterval(() => {
      if (!this.isPlaying || this.gains.rain.gain.value < 0.05) return;
      if (Math.random() < 0.4) {
        this.triggerRainDroplet();
      }
    }, 180);
  }

  triggerRainDroplet() {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const dropFreq = 1800 + Math.random() * 2400;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(dropFreq, now);
    osc.frequency.exponentialRampToValueAtTime(dropFreq * 0.4, now + 0.035);

    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(0.04, now + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

    osc.connect(g);
    g.connect(this.gains.rain);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  // =========================================================================
  // LAYER 3: WIND & SWAYING GRASS RUSTLE
  // =========================================================================
  initWindAndGrassLayer() {
    const noiseBuffer = this.createNoiseBuffer();
    const windSource = this.ctx.createBufferSource();
    windSource.buffer = noiseBuffer;
    windSource.loop = true;

    this.windFilter = this.ctx.createBiquadFilter();
    this.windFilter.type = 'bandpass';
    this.windFilter.frequency.setValueAtTime(550, this.ctx.currentTime);
    this.windFilter.Q.setValueAtTime(2.5, this.ctx.currentTime);

    // Slow wind gust modulator
    const gustLFO = this.ctx.createOscillator();
    const gustGain = this.ctx.createGain();
    gustLFO.frequency.setValueAtTime(0.12, this.ctx.currentTime);
    gustGain.gain.setValueAtTime(220, this.ctx.currentTime);
    gustLFO.connect(this.windFilter.frequency);
    gustLFO.start();

    windSource.connect(this.windFilter);
    this.windFilter.connect(this.gains.wind);
    this.windFilter.connect(this.gains.grass);
    windSource.start();
  }

  // =========================================================================
  // LAYER 4: OCEAN SURF WAVE SWELL (Coast Biome)
  // =========================================================================
  initOceanLayer() {
    const noiseBuffer = this.createNoiseBuffer();
    const oceanSource = this.ctx.createBufferSource();
    oceanSource.buffer = noiseBuffer;
    oceanSource.loop = true;

    const oceanLP = this.ctx.createBiquadFilter();
    oceanLP.type = 'lowpass';
    oceanLP.frequency.setValueAtTime(320, this.ctx.currentTime);

    // 8-second slow swell LFO for crashing & receding waves
    const swellLFO = this.ctx.createOscillator();
    const swellGain = this.ctx.createGain();
    swellLFO.type = 'sine';
    swellLFO.frequency.setValueAtTime(0.12, this.ctx.currentTime); // ~8.3s cycle
    swellGain.gain.setValueAtTime(280, this.ctx.currentTime);
    swellLFO.connect(oceanLP.frequency);
    swellLFO.start();

    oceanSource.connect(oceanLP);
    oceanLP.connect(this.gains.ocean);
    oceanSource.start();
  }

  // =========================================================================
  // LAYER 5: MEGALOPOLIS CITY ENERGY SUB-PULSE
  // =========================================================================
  initCityLayer() {
    const t = this.ctx.currentTime;
    const cityOsc = this.ctx.createOscillator();
    cityOsc.type = 'sine';
    cityOsc.frequency.setValueAtTime(65.4, t); // C2 low grid hum

    const citySubFilter = this.ctx.createBiquadFilter();
    citySubFilter.type = 'lowpass';
    citySubFilter.frequency.setValueAtTime(180, t);

    cityOsc.connect(citySubFilter);
    citySubFilter.connect(this.gains.city);
    cityOsc.start();
  }

  // =========================================================================
  // LAYER 6: CELESTIAL BIRDSONG (FM-Synthesized Chirps)
  // =========================================================================
  startBirdScheduler() {
    this.birdTimer = setInterval(() => {
      if (!this.isPlaying || this.gains.birds.gain.value < 0.05) return;
      // Sporadic bird warble (every 3 to 7 seconds)
      if (Math.random() < 0.45) {
        this.triggerBirdChirp();
      }
    }, 2800);
  }

  triggerBirdChirp() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const baseFreq = this.birdScale[Math.floor(Math.random() * this.birdScale.length)];

    const carrier = this.ctx.createOscillator();
    const modulator = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    const chirpGain = this.ctx.createGain();

    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(baseFreq, now);
    // Pitch chirp contour (up-down or falling swoop)
    carrier.frequency.exponentialRampToValueAtTime(baseFreq * 1.4, now + 0.08);
    carrier.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, now + 0.22);

    // FM modulation for bell/avian timbre
    modulator.type = 'sine';
    modulator.frequency.setValueAtTime(baseFreq * 2.0, now);
    modGain.gain.setValueAtTime(baseFreq * 0.6, now);
    modulator.connect(carrier.frequency);

    chirpGain.gain.setValueAtTime(0.0001, now);
    chirpGain.gain.linearRampToValueAtTime(0.08, now + 0.04);
    chirpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

    carrier.connect(chirpGain);
    chirpGain.connect(this.gains.birds);

    carrier.start(now);
    modulator.start(now);
    carrier.stop(now + 0.26);
    modulator.stop(now + 0.26);
  }

  // =========================================================================
  // LAYER 7: PENTATONIC CRYSTAL CHIMES (Particle landing)
  // =========================================================================
  triggerCrystalChime(intensity = 0.6) {
    if (!this.isPlaying || !this.ctx) return;
    const now = this.ctx.currentTime;
    if (now - this.lastChimeTime < 0.14) return;
    this.lastChimeTime = now;

    const freq = this.chimeScale[Math.floor(Math.random() * this.chimeScale.length)];
    const osc = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    const decayDuration = 1.4 + Math.random() * 0.8;
    chimeGain.gain.setValueAtTime(0.0001, now);
    chimeGain.gain.linearRampToValueAtTime(0.08 * intensity, now + 0.02);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + decayDuration);

    osc.connect(chimeGain);
    chimeGain.connect(this.gains.chimes);
    osc.start(now);
    osc.stop(now + decayDuration);
  }

  // =========================================================================
  // DYNAMIC SEAMLESS CROSS-FADER (Weather + Biome Synchronizer)
  // =========================================================================
  updateEnvironment({ weatherType, biomeType, windSpeed = 10, temperature = 20, humidity = 50 }) {
    if (!this.isPlaying || !this.ctx) return;
    const t = this.ctx.currentTime;
    const rampTime = 1.6; // Buttery smooth 1.6s crossfade constant

    const isRaining = weatherType === PHENOMENON_TYPES.RAIN || weatherType === PHENOMENON_TYPES.THUNDER;
    const isClear = weatherType === PHENOMENON_TYPES.CLEAR || weatherType === PHENOMENON_TYPES.CLOUDS;

    // 1. Rain Layer Gain
    this.gains.rain.gain.setTargetAtTime(isRaining ? (0.22 + (humidity / 100) * 0.18) : 0.0001, t, rampTime);

    // 2. Birds Layer Gain (Active during clear skies & plains)
    const birdTarget = (isClear && (biomeType === BIOME_TYPES.PLAINS || biomeType === BIOME_TYPES.ARCHIPELAGO || biomeType === BIOME_TYPES.COAST)) ? 0.4 : 0.0001;
    this.gains.birds.gain.setTargetAtTime(birdTarget, t, rampTime);

    // 3. Grass Rustle Gain (Active in plains)
    const grassTarget = biomeType === BIOME_TYPES.PLAINS ? (0.15 + (windSpeed / 40) * 0.25) : 0.0001;
    this.gains.grass.gain.setTargetAtTime(grassTarget, t, rampTime);

    // 4. Ocean Surf Gain (Active in coast)
    const oceanTarget = biomeType === BIOME_TYPES.COAST ? 0.32 : 0.0001;
    this.gains.ocean.gain.setTargetAtTime(oceanTarget, t, rampTime);

    // 5. Megalopolis City Pulse (Active in megalopolis)
    const cityTarget = biomeType === BIOME_TYPES.MEGALOPOLIS ? 0.25 : 0.0001;
    this.gains.city.gain.setTargetAtTime(cityTarget, t, rampTime);

    // 6. Base Wind Sweep
    const windTarget = 0.08 + (windSpeed / 50) * 0.2;
    this.gains.wind.gain.setTargetAtTime(windTarget, t, rampTime);
    if (this.windFilter) {
      this.windFilter.frequency.setTargetAtTime(350 + windSpeed * 32, t, rampTime);
    }
  }

  createNoiseBuffer() {
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const out = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      out[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }
}
