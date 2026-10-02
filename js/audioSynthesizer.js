/**
 * AudioSynthesizer - Biome-Specific Organic Soundscape Synthesizer (16 Biomes)
 * 100% Procedural Generative Web Audio API
 * Integrated with AnalyserNode for Live HUD Visualizers, Celestial Ambient Pad, and Sci-Fi UI SFX
 */

import { BIOME_TYPES } from './renderer/landscape.js';
import { PHENOMENON_TYPES } from './converter.js';

export class AudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.analyser = null;
    this.isPlaying = false;
    this.volume = 0.55;

    // Gain Nodes for Environmental Layers
    this.gains = {
      pad: null,
      rain: null,
      birds: null,
      wind: null,
      grass: null,
      ocean: null,
      insects: null,
      crystal_bells: null,
      desert_wind: null,
      water_stream: null,
      chimes: null
    };

    // User-customizable layer multipliers (Mixer)
    this.layerMix = {
      pad: 1.0,
      rain: 1.0,
      birds: 1.0,
      wind: 1.0,
      grass: 1.0,
      ocean: 1.0,
      insects: 1.0,
      crystal_bells: 1.0,
      desert_wind: 1.0,
      water_stream: 1.0,
      chimes: 1.0
    };

    this.lastEnvironmentState = null;
    this.birdTimer = null;
    this.dropletTimer = null;
    this.insectTimer = null;
    this.crystalBellTimer = null;
    this.padTimer = null;
    this.activePadVoices = [];

    this.chimeScale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66];
    this.birdScale = [1318.5, 1567.98, 1760.0, 2093.0, 2349.32, 2637.0, 3135.96];
    this.crystalScale = [1046.5, 1318.5, 1567.98, 2093.0, 2637.0, 3135.96];

    // Harmonic chords per biome category
    this.biomeChords = {
      celestial: [220.0, 277.18, 329.63, 415.3, 440.0], // A Major / Lydian
      mystic: [196.0, 246.94, 293.66, 369.99, 392.0],   // G Lydian
      crystalline: [261.63, 329.63, 392.0, 493.88, 523.25], // C Major 7/9
      cyber: [174.61, 220.0, 261.63, 329.63, 349.23],    // F Lydian
      desert: [164.81, 196.0, 246.94, 293.66, 329.63],   // E Minor
      abyss: [130.81, 164.81, 196.0, 246.94, 261.63]     // C Deep Minor
    };
  }

  initContext() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

    // Master Analyser Node for HUD spectrum & waveform
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 128;
    this.analyser.smoothingTimeConstant = 0.82;

    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    Object.keys(this.gains).forEach(layer => {
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      g.connect(this.masterGain);
      this.gains[layer] = g;
    });
  }

  getFrequencyData(array) {
    if (this.analyser && this.isPlaying) {
      this.analyser.getByteFrequencyData(array);
    } else {
      array.fill(0);
    }
  }

  getTimeDomainData(array) {
    if (this.analyser && this.isPlaying) {
      this.analyser.getByteTimeDomainData(array);
    } else {
      array.fill(128);
    }
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
      this.initDesertWindLayer();
      this.initWaterStreamLayer();
      this.startCelestialPadScheduler();
      this.startBirdScheduler();
      this.startInsectScheduler();
      this.startCrystalBellScheduler();
      this.isPlaying = true;
    }
  }

  stop() {
    if (!this.isPlaying) return;
    if (this.birdTimer) clearInterval(this.birdTimer);
    if (this.dropletTimer) clearInterval(this.dropletTimer);
    if (this.insectTimer) clearInterval(this.insectTimer);
    if (this.crystalBellTimer) clearInterval(this.crystalBellTimer);
    if (this.padTimer) clearInterval(this.padTimer);

    this.activePadVoices.forEach(v => {
      try { v.stop(); } catch(e){}
    });
    this.activePadVoices = [];

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
  // CELESTIAL AMBIENT HARMONIC PAD (Warm, evolving, relaxing chord drone)
  // =========================================================================
  startCelestialPadScheduler() {
    this.playNextPadChord();
    this.padTimer = setInterval(() => {
      if (this.isPlaying && this.gains.pad.gain.value > 0.01) {
        this.playNextPadChord();
      }
    }, 7500);
  }

  playNextPadChord() {
    if (!this.ctx || !this.isPlaying) return;
    const now = this.ctx.currentTime;
    const chordPool = this.getChordForCurrentBiome();
    
    // Choose 3 notes from chord
    const shuffled = [...chordPool].sort(() => Math.random() - 0.5);
    const notes = shuffled.slice(0, 3);

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const voiceGain = this.ctx.createGain();

      osc.type = idx === 0 ? 'sine' : (idx === 1 ? 'triangle' : 'sine');
      osc.frequency.setValueAtTime(freq, now);
      // Subtle detune for shimmer
      osc.detune.setValueAtTime((Math.random() - 0.5) * 8, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450 + Math.random() * 300, now);
      filter.frequency.exponentialRampToValueAtTime(800 + Math.random() * 400, now + 3.5);
      filter.frequency.exponentialRampToValueAtTime(400, now + 7.5);

      voiceGain.gain.setValueAtTime(0.0001, now);
      voiceGain.gain.linearRampToValueAtTime(0.045 * this.layerMix.pad, now + 2.5);
      voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + 7.4);

      osc.connect(filter);
      filter.connect(voiceGain);
      voiceGain.connect(this.gains.pad);

      osc.start(now);
      osc.stop(now + 7.6);
      this.activePadVoices.push(osc);
    });

    // Cleanup ended voices
    setTimeout(() => {
      this.activePadVoices = this.activePadVoices.filter(v => v.playbackState !== 3);
    }, 8000);
  }

  getChordForCurrentBiome() {
    if (!this.lastEnvironmentState) return this.biomeChords.celestial;
    const b = this.lastEnvironmentState.biomeType;
    if (b === BIOME_TYPES.GLACIER || b === BIOME_TYPES.CRYSTAL_FOREST) return this.biomeChords.crystalline;
    if (b === BIOME_TYPES.MEGALOPOLIS || b === BIOME_TYPES.FLOATING_CITADEL) return this.biomeChords.cyber;
    if (b === BIOME_TYPES.DESERT_RUINS || b === BIOME_TYPES.SOLAR_SPIRE) return this.biomeChords.desert;
    if (b === BIOME_TYPES.DEEP_ABYSS_REEF || b === BIOME_TYPES.ETHEREAL_SWAMP) return this.biomeChords.abyss;
    if (b === BIOME_TYPES.VOLCANO_PLASMA || b === BIOME_TYPES.LAVA_OCEAN) return this.biomeChords.desert;
    return this.biomeChords.celestial;
  }

  // =========================================================================
  // 1. RAIN & DROPLETS
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
  // 2. CELESTIAL BIRDSONG
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
  // 3. ASTRAL CRICKETS / NIGHT INSECTS
  // =========================================================================
  startInsectScheduler() {
    this.insectTimer = setInterval(() => {
      if (!this.isPlaying || this.gains.insects.gain.value < 0.02) return;
      if (Math.random() < 0.6) {
        this.triggerInsectTrill();
      }
    }, 1800);
  }

  triggerInsectTrill() {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const f = 4600 + Math.random() * 800;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(f, now);

    const tremolo = this.ctx.createOscillator();
    const tremoloGain = this.ctx.createGain();
    tremolo.frequency.setValueAtTime(18, now);
    tremoloGain.gain.setValueAtTime(0.04, now);
    tremolo.connect(g.gain);
    tremolo.start(now);

    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(0.05 * this.layerMix.insects, now + 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc.connect(g);
    g.connect(this.gains.insects);

    osc.start(now);
    osc.stop(now + 0.38);
    tremolo.stop(now + 0.38);
  }

  // =========================================================================
  // 4. QUARTZ CRYSTAL BELLS
  // =========================================================================
  startCrystalBellScheduler() {
    this.crystalBellTimer = setInterval(() => {
      if (!this.isPlaying || this.gains.crystal_bells.gain.value < 0.02) return;
      if (Math.random() < 0.45) {
        this.triggerCrystalBell();
      }
    }, 3200);
  }

  triggerCrystalBell() {
    const now = this.ctx.currentTime;
    const f = this.crystalScale[Math.floor(Math.random() * this.crystalScale.length)];

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(f, now);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(f * 2.76, now);

    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(0.08 * this.layerMix.crystal_bells, now + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

    osc1.connect(g);
    osc2.connect(g);
    g.connect(this.gains.crystal_bells);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 2.3);
    osc2.stop(now + 2.3);
  }

  // =========================================================================
  // 5. WIND & GRASS SWAY
  // =========================================================================
  initWindAndGrassLayer() {
    const noiseBuffer = this.createNoiseBuffer();
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    this.windFilter = this.ctx.createBiquadFilter();
    this.windFilter.type = 'bandpass';
    this.windFilter.frequency.setValueAtTime(450, this.ctx.currentTime);
    this.windFilter.Q.setValueAtTime(1.8, this.ctx.currentTime);

    noiseSource.connect(this.windFilter);
    this.windFilter.connect(this.gains.wind);

    const grassFilter = this.ctx.createBiquadFilter();
    grassFilter.type = 'highpass';
    grassFilter.frequency.setValueAtTime(1800, this.ctx.currentTime);

    this.windFilter.connect(grassFilter);
    grassFilter.connect(this.gains.grass);

    noiseSource.start();
  }

  // =========================================================================
  // 6. OCEAN SURF
  // =========================================================================
  initOceanLayer() {
    const noiseBuffer = this.createNoiseBuffer();
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const oceanFilter = this.ctx.createBiquadFilter();
    oceanFilter.type = 'lowpass';
    oceanFilter.frequency.setValueAtTime(600, this.ctx.currentTime);

    const waveLfo = this.ctx.createOscillator();
    const waveLfoGain = this.ctx.createGain();
    waveLfo.type = 'sine';
    waveLfo.frequency.setValueAtTime(0.12, this.ctx.currentTime);
    waveLfoGain.gain.setValueAtTime(350, this.ctx.currentTime);

    waveLfo.connect(oceanFilter.frequency);
    noiseSource.connect(oceanFilter);
    oceanFilter.connect(this.gains.ocean);

    waveLfo.start();
    noiseSource.start();
  }

  // =========================================================================
  // 7. DESERT WIND
  // =========================================================================
  initDesertWindLayer() {
    const noiseBuffer = this.createNoiseBuffer();
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const desertBP = this.ctx.createBiquadFilter();
    desertBP.type = 'bandpass';
    desertBP.frequency.setValueAtTime(950, this.ctx.currentTime);
    desertBP.Q.setValueAtTime(3.2, this.ctx.currentTime);

    noiseSource.connect(desertBP);
    desertBP.connect(this.gains.desert_wind);
    noiseSource.start();
  }

  // =========================================================================
  // 8. WATER STREAM
  // =========================================================================
  initWaterStreamLayer() {
    const noiseBuffer = this.createNoiseBuffer();
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const streamBP = this.ctx.createBiquadFilter();
    streamBP.type = 'bandpass';
    streamBP.frequency.setValueAtTime(1450, this.ctx.currentTime);
    streamBP.Q.setValueAtTime(1.5, this.ctx.currentTime);

    noiseSource.connect(streamBP);
    streamBP.connect(this.gains.water_stream);
    noiseSource.start();
  }

  // =========================================================================
  // 9. INTERACTIVE & UI SFX (Zero external audio assets required)
  // =========================================================================
  triggerCrystalChime(intensity = 0.5) {
    if (!this.ctx || !this.isPlaying) return;
    const now = this.ctx.currentTime;
    if (now - this.lastChimeTime < 0.12) return;
    this.lastChimeTime = now;

    const freq = this.chimeScale[Math.floor(Math.random() * this.chimeScale.length)];
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(0.09 * intensity * this.layerMix.chimes, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.9);
  }

  triggerGravityWaveChime() {
    this.initContext();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const now = this.ctx.currentTime;
    
    // Multi-tone crystal glass bowl resonance
    const freqs = [432, 648, 864, 1296];
    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      osc.detune.setValueAtTime((Math.random() - 0.5) * 4, now);

      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.05 / (idx + 1), now + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 1.2 + idx * 0.3);

      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 1.6 + idx * 0.3);
    });
  }

  triggerFocusBell() {
    this.initContext();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(528, now); // Solfeggio 528Hz

    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(0.22, now + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 3.6);
  }

  playUiClick() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.03);

    g.gain.setValueAtTime(0.04, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.035);
  }

  playUiWarp() {
    this.initContext();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const now = this.ctx.currentTime;

    // Dimensional sweep upward
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(980, now + 0.6);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, now);
    filter.frequency.exponentialRampToValueAtTime(2400, now + 0.6);

    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(0.12, now + 0.2);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

    osc.connect(filter);
    filter.connect(g);
    g.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.75);

    // Sparkle chime after warp
    setTimeout(() => {
      this.triggerCrystalChime(0.9);
    }, 450);
  }

  // =========================================================================
  // DYNAMIC CROSS-FADER TAILORED TO 16 BIOMES
  // =========================================================================
  updateEnvironment(state) {
    this.lastEnvironmentState = state;
    if (!this.isPlaying || !this.ctx) return;
    const { weatherType, biomeType, windSpeed = 10, humidity = 50 } = state;
    const t = this.ctx.currentTime;
    const ramp = 1.4;

    const isRaining = weatherType === PHENOMENON_TYPES.RAIN || weatherType === PHENOMENON_TYPES.THUNDER;
    const isClear = weatherType === PHENOMENON_TYPES.CLEAR || weatherType === PHENOMENON_TYPES.CLOUDS;

    // Pad Layer: gently active in all biomes
    const padVol = 0.5 * this.layerMix.pad;
    this.gains.pad.gain.setTargetAtTime(padVol, t, ramp);

    // Rain Layer
    const rainVol = (isRaining ? (0.28 + (humidity / 100) * 0.15) : 0.0001) * this.layerMix.rain;
    this.gains.rain.gain.setTargetAtTime(rainVol, t, ramp);

    // Birds
    const birdActive = isClear && (biomeType === BIOME_TYPES.PLAINS || biomeType === BIOME_TYPES.ARCHIPELAGO || biomeType === BIOME_TYPES.COAST);
    const birdVol = (birdActive ? 0.65 : 0.0001) * this.layerMix.birds;
    this.gains.birds.gain.setTargetAtTime(birdVol, t, ramp);

    // Insects
    const insectActive = isClear && (biomeType === BIOME_TYPES.PLAINS || biomeType === BIOME_TYPES.CRYSTAL_FOREST || biomeType === BIOME_TYPES.DESERT_RUINS || biomeType === BIOME_TYPES.MUSHROOM_GROVE || biomeType === BIOME_TYPES.ETHEREAL_SWAMP || biomeType === BIOME_TYPES.AURORA_TUNDRA);
    const insectVol = (insectActive ? 0.45 : 0.0001) * this.layerMix.insects;
    this.gains.insects.gain.setTargetAtTime(insectVol, t, ramp);

    // Crystal Bells
    const crystalActive = (biomeType === BIOME_TYPES.CRYSTAL_FOREST || biomeType === BIOME_TYPES.GLACIER || biomeType === BIOME_TYPES.VOLCANO_PLASMA || biomeType === BIOME_TYPES.FLOATING_CITADEL || biomeType === BIOME_TYPES.NEBULA_CANYON);
    const crystalVol = (crystalActive ? 0.55 : 0.0001) * this.layerMix.crystal_bells;
    this.gains.crystal_bells.gain.setTargetAtTime(crystalVol, t, ramp);

    // Desert Wind
    const desertActive = (biomeType === BIOME_TYPES.DESERT_RUINS || biomeType === BIOME_TYPES.SOLAR_SPIRE || biomeType === BIOME_TYPES.VOLCANO_PLASMA);
    const desertVol = (desertActive ? (0.2 + (windSpeed / 30) * 0.25) : 0.0001) * this.layerMix.desert_wind;
    this.gains.desert_wind.gain.setTargetAtTime(desertVol, t, ramp);

    // Water Stream
    const streamActive = (biomeType === BIOME_TYPES.ARCHIPELAGO || biomeType === BIOME_TYPES.DEEP_ABYSS_REEF || biomeType === BIOME_TYPES.ETHEREAL_SWAMP || biomeType === BIOME_TYPES.MUSHROOM_GROVE);
    const streamVol = (streamActive ? 0.35 : 0.0001) * this.layerMix.water_stream;
    this.gains.water_stream.gain.setTargetAtTime(streamVol, t, ramp);

    // Grass Rustle
    const grassActive = (biomeType === BIOME_TYPES.PLAINS || biomeType === BIOME_TYPES.ETHEREAL_SWAMP || biomeType === BIOME_TYPES.AURORA_TUNDRA) ? (0.25 + (windSpeed / 40) * 0.25) : 0.0001;
    this.gains.grass.gain.setTargetAtTime(grassActive * this.layerMix.grass, t, ramp);

    // Ocean Surf
    const oceanActive = (biomeType === BIOME_TYPES.COAST || biomeType === BIOME_TYPES.LAVA_OCEAN) ? 0.45 : 0.0001;
    this.gains.ocean.gain.setTargetAtTime(oceanActive * this.layerMix.ocean, t, ramp);

    // Base Ambient Wind
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
