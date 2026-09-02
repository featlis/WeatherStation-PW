/**
 * AudioSynthesizer - Natural Environmental Soundscape & Mixer
 * Dynamic nature sounds + Individual layer volume multipliers + Focus Chimes
 */

import { BIOME_TYPES } from './renderer/landscape.js';
import { PHENOMENON_TYPES } from './converter.js';

export class AudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.volume = 0.55;

    // Gain Nodes for Environmental Layers
    this.gains = {
      rain: null,
      wind: null,
      grass: null,
      ocean: null,
      birds: null,
      chimes: null
    };

    // User-customizable layer multipliers (Mixer)
    this.layerMix = {
      rain: 1.0,
      birds: 1.0,
      wind: 1.0,
      grass: 1.0,
      ocean: 1.0,
      chimes: 1.0
    };

    this.lastEnvironmentState = null;
    this.birdTimer = null;
    this.dropletTimer = null;
    this.lastChimeTime = 0;
    this.chimeScale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66];
    this.birdScale = [1318.5, 1567.98, 1760.0, 2093.0, 2349.32, 2637.0, 3135.96];
  }

  initContext() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

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
      this.initRainLayer();
      this.initWindAndGrassLayer();
      this.initOceanLayer();
      this.startBirdScheduler();
      this.isPlaying = true;
    }
  }

  stop() {
    if (!this.isPlaying) return;
    if (this.birdTimer) clearInterval(this.birdTimer);
    if (this.dropletTimer) clearInterval(this.dropletTimer);
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

  setLayerVolume(layer, val) {
    if (this.layerMix[layer] !== undefined) {
      this.layerMix[layer] = Math.max(0, Math.min(1.5, val));
      if (this.lastEnvironmentState) {
        this.updateEnvironment(this.lastEnvironmentState);
      }
    }
  }

  // =========================================================================
  // 1. RAIN LAYER
  // =========================================================================
  initRainLayer() {
    const noiseBuffer = this.createNoiseBuffer();
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const rainHP = this.ctx.createBiquadFilter();
    rainHP.type = 'highpass';
    rainHP.frequency.setValueAtTime(1600, this.ctx.currentTime);

    const rainBP = this.ctx.createBiquadFilter();
    rainBP.type = 'bandpass';
    rainBP.frequency.setValueAtTime(3800, this.ctx.currentTime);
    rainBP.Q.setValueAtTime(1.0, this.ctx.currentTime);

    noiseSource.connect(rainHP);
    rainHP.connect(rainBP);
    rainBP.connect(this.gains.rain);
    noiseSource.start();

    this.dropletTimer = setInterval(() => {
      if (!this.isPlaying || this.gains.rain.gain.value < 0.02) return;
      if (Math.random() < 0.55) {
        this.triggerRainDroplet();
      }
    }, 140);
  }

  triggerRainDroplet() {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const dropFreq = 2200 + Math.random() * 2600;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(dropFreq, now);
    osc.frequency.exponentialRampToValueAtTime(dropFreq * 0.35, now + 0.03);

    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(0.06 * this.layerMix.rain, now + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

    osc.connect(g);
    g.connect(this.gains.rain);
    osc.start(now);
    osc.stop(now + 0.035);
  }

  // =========================================================================
  // 2. BIRDSONG LAYER
  // =========================================================================
  startBirdScheduler() {
    this.birdTimer = setInterval(() => {
      if (!this.isPlaying || this.gains.birds.gain.value < 0.02) return;
      if (Math.random() < 0.5) {
        this.triggerBirdChirp();
      }
    }, 2400);
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
    carrier.frequency.exponentialRampToValueAtTime(baseFreq * 1.35, now + 0.06);
    carrier.frequency.exponentialRampToValueAtTime(baseFreq * 0.85, now + 0.18);

    modulator.type = 'sine';
    modulator.frequency.setValueAtTime(baseFreq * 1.5, now);
    modGain.gain.setValueAtTime(baseFreq * 0.4, now);
    modulator.connect(carrier.frequency);

    chirpGain.gain.setValueAtTime(0.0001, now);
    chirpGain.gain.linearRampToValueAtTime(0.12 * this.layerMix.birds, now + 0.03);
    chirpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    carrier.connect(chirpGain);
    chirpGain.connect(this.gains.birds);

    carrier.start(now);
    modulator.start(now);
    carrier.stop(now + 0.24);
    modulator.stop(now + 0.24);
  }

  // =========================================================================
  // 3. WIND & GRASS LAYER
  // =========================================================================
  initWindAndGrassLayer() {
    const noiseBuffer = this.createNoiseBuffer();
    const windSource = this.ctx.createBufferSource();
    windSource.buffer = noiseBuffer;
    windSource.loop = true;

    const airHP = this.ctx.createBiquadFilter();
    airHP.type = 'highpass';
    airHP.frequency.setValueAtTime(650, this.ctx.currentTime);

    this.windFilter = this.ctx.createBiquadFilter();
    this.windFilter.type = 'bandpass';
    this.windFilter.frequency.setValueAtTime(1100, this.ctx.currentTime);
    this.windFilter.Q.setValueAtTime(2.0, this.ctx.currentTime);

    const breezeLFO = this.ctx.createOscillator();
    const breezeGain = this.ctx.createGain();
    breezeLFO.frequency.setValueAtTime(0.18, this.ctx.currentTime);
    breezeGain.gain.setValueAtTime(350, this.ctx.currentTime);
    breezeLFO.connect(this.windFilter.frequency);
    breezeLFO.start();

    windSource.connect(airHP);
    airHP.connect(this.windFilter);
    this.windFilter.connect(this.gains.wind);
    this.windFilter.connect(this.gains.grass);
    windSource.start();
  }

  // =========================================================================
  // 4. OCEAN WAVE SURF LAYER
  // =========================================================================
  initOceanLayer() {
    const noiseBuffer = this.createNoiseBuffer();
    const oceanSource = this.ctx.createBufferSource();
    oceanSource.buffer = noiseBuffer;
    oceanSource.loop = true;

    const oceanHP = this.ctx.createBiquadFilter();
    oceanHP.type = 'highpass';
    oceanHP.frequency.setValueAtTime(450, this.ctx.currentTime);

    const oceanBP = this.ctx.createBiquadFilter();
    oceanBP.type = 'bandpass';
    oceanBP.frequency.setValueAtTime(1200, this.ctx.currentTime);
    oceanBP.Q.setValueAtTime(1.4, this.ctx.currentTime);

    const swellLFO = this.ctx.createOscillator();
    const swellGain = this.ctx.createGain();
    swellLFO.type = 'sine';
    swellLFO.frequency.setValueAtTime(0.12, this.ctx.currentTime);
    swellGain.gain.setValueAtTime(600, this.ctx.currentTime);
    swellLFO.connect(oceanBP.frequency);
    swellLFO.start();

    oceanSource.connect(oceanHP);
    oceanHP.connect(oceanBP);
    oceanBP.connect(this.gains.ocean);
    oceanSource.start();
  }

  // =========================================================================
  // 5. PENTATONIC CRYSTAL CHIMES
  // =========================================================================
  triggerCrystalChime(intensity = 0.6) {
    if (!this.isPlaying || !this.ctx) return;
    const now = this.ctx.currentTime;
    if (now - this.lastChimeTime < 0.12) return;
    this.lastChimeTime = now;

    const freq = this.chimeScale[Math.floor(Math.random() * this.chimeScale.length)];
    const osc = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    const decayDuration = 1.2 + Math.random() * 0.6;
    chimeGain.gain.setValueAtTime(0.0001, now);
    chimeGain.gain.linearRampToValueAtTime(0.09 * intensity * this.layerMix.chimes, now + 0.015);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + decayDuration);

    osc.connect(chimeGain);
    chimeGain.connect(this.gains.chimes);
    osc.start(now);
    osc.stop(now + decayDuration);
  }

  // =========================================================================
  // 6. FOCUS BELL & GRAVITY WAVE SOUNDS
  // =========================================================================
  triggerFocusBell() {
    if (!this.isPlaying || !this.ctx) return;
    const now = this.ctx.currentTime;
    const bellFreqs = [528.0, 792.0, 1056.0]; // 528Hz Solfeggio / DNA harmony bell

    bellFreqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);

      const decay = 3.5 - idx * 0.6;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.15 / (idx + 1), now + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + decay);
    });
  }

  triggerGravityWaveChime() {
    if (!this.isPlaying || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.35);

    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(0.08, now + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.55);
  }

  // =========================================================================
  // DYNAMIC CROSS-FADER
  // =========================================================================
  updateEnvironment(state) {
    this.lastEnvironmentState = state;
    if (!this.isPlaying || !this.ctx) return;
    const { weatherType, biomeType, windSpeed = 10, humidity = 50 } = state;
    const t = this.ctx.currentTime;
    const ramp = 1.4;

    const isRaining = weatherType === PHENOMENON_TYPES.RAIN || weatherType === PHENOMENON_TYPES.THUNDER;
    const isClear = weatherType === PHENOMENON_TYPES.CLEAR || weatherType === PHENOMENON_TYPES.CLOUDS;

    // Rain
    const rainVol = (isRaining ? (0.28 + (humidity / 100) * 0.15) : 0.0001) * this.layerMix.rain;
    this.gains.rain.gain.setTargetAtTime(rainVol, t, ramp);

    // Birds
    const birdActive = isClear && (biomeType === BIOME_TYPES.PLAINS || biomeType === BIOME_TYPES.ARCHIPELAGO || biomeType === BIOME_TYPES.COAST || biomeType === BIOME_TYPES.MEGALOPOLIS);
    const birdVol = (birdActive ? 0.65 : 0.0001) * this.layerMix.birds;
    this.gains.birds.gain.setTargetAtTime(birdVol, t, ramp);

    // Grass
    const grassActive = biomeType === BIOME_TYPES.PLAINS ? (0.25 + (windSpeed / 40) * 0.25) : 0.0001;
    const grassVol = grassActive * this.layerMix.grass;
    this.gains.grass.gain.setTargetAtTime(grassVol, t, ramp);

    // Ocean
    const oceanActive = biomeType === BIOME_TYPES.COAST ? 0.45 : 0.0001;
    const oceanVol = oceanActive * this.layerMix.ocean;
    this.gains.ocean.gain.setTargetAtTime(oceanVol, t, ramp);

    // Wind
    const windVol = (0.08 + (windSpeed / 40) * 0.2) * this.layerMix.wind;
    this.gains.wind.gain.setTargetAtTime(windVol, t, ramp);
    if (this.windFilter) {
      this.windFilter.frequency.setTargetAtTime(800 + windSpeed * 30, t, ramp);
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
      out[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.1;
      b6 = white * 0.115926;
    }
    return buffer;
  }
}
