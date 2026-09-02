/**
 * AudioSynthesizer - Rich Multi-Source Environmental Soundscape & Mixer
 * 100% Drone-Free, Clean Organic Sounds:
 * 1. Rain & Micro-Droplets (雨音・水滴)
 * 2. Celestial Birds (天球鳥のさえずり)
 * 3. Wind & Grass Rustle (風と草原)
 * 4. Ocean Surf & Waves (波のさざなみ)
 * 5. Astral Crickets / Night Insects (星光コオロギ・虫の鳴き声)
 * 6. Quartz Crystal Bell Shimmer (水晶共鳴ベル)
 * 7. Desert Glass Wind (星屑砂漠の乾いた風)
 * 8. Water Stream Brook (エーテル清流のせせらぎ)
 * 9. Pentatonic Landing Chimes (着地チャイム)
 * 10. Focus Solfeggio Bell (瞑想ベル)
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
    this.lastChimeTime = 0;

    this.chimeScale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66];
    this.birdScale = [1318.5, 1567.98, 1760.0, 2093.0, 2349.32, 2637.0, 3135.96];
    this.crystalScale = [1046.5, 1318.5, 1567.98, 2093.0, 2637.0, 3135.96];
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
      this.initDesertWindLayer();
      this.initWaterStreamLayer();
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
  // 3. ASTRAL CRICKETS / NIGHT INSECTS (星光コオロギ)
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

    // Fast micro-tremolo for insect chirr
    const tremolo = this.ctx.createOscillator();
    const tremoloGain = this.ctx.createGain();
    tremolo.frequency.setValueAtTime(18, now);
    tremoloGain.gain.setValueAtTime(0.04, now);
    tremolo.connect(g.gain);
    tremolo.start(now);

    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(0.04 * this.layerMix.insects, now + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc.connect(g);
    g.connect(this.gains.insects);
    osc.start(now);
    osc.stop(now + 0.36);
    tremolo.stop(now + 0.36);
  }

  // =========================================================================
  // 4. QUARTZ CRYSTAL BELLS (巨晶の森共振)
  // =========================================================================
  startCrystalBellScheduler() {
    this.crystalBellTimer = setInterval(() => {
      if (!this.isPlaying || this.gains.crystal_bells.gain.value < 0.02) return;
      if (Math.random() < 0.45) {
        this.triggerCrystalBellShimmer();
      }
    }, 3200);
  }

  triggerCrystalBellShimmer() {
    const now = this.ctx.currentTime;
    const f = this.crystalScale[Math.floor(Math.random() * this.crystalScale.length)];
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(f, now);

    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(0.05 * this.layerMix.crystal_bells, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

    osc.connect(g);
    g.connect(this.gains.crystal_bells);
    osc.start(now);
    osc.stop(now + 1.85);
  }

  // =========================================================================
  // 5. WIND & GRASS
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
  // 6. OCEAN SURF
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
  // 7. DESERT SAND WIND (乾いた星屑砂漠の風)
  // =========================================================================
  initDesertWindLayer() {
    const noiseBuffer = this.createNoiseBuffer();
    const sandSource = this.ctx.createBufferSource();
    sandSource.buffer = noiseBuffer;
    sandSource.loop = true;

    const sandBP = this.ctx.createBiquadFilter();
    sandBP.type = 'bandpass';
    sandBP.frequency.setValueAtTime(2400, this.ctx.currentTime);
    sandBP.Q.setValueAtTime(3.5, this.ctx.currentTime);

    sandSource.connect(sandBP);
    sandBP.connect(this.gains.desert_wind);
    sandSource.start();
  }

  // =========================================================================
  // 8. WATER STREAM (エーテル清流のせせらぎ水音)
  // =========================================================================
  initWaterStreamLayer() {
    const noiseBuffer = this.createNoiseBuffer();
    const streamSource = this.ctx.createBufferSource();
    streamSource.buffer = noiseBuffer;
    streamSource.loop = true;

    const streamBP = this.ctx.createBiquadFilter();
    streamBP.type = 'bandpass';
    streamBP.frequency.setValueAtTime(1800, this.ctx.currentTime);
    streamBP.Q.setValueAtTime(1.8, this.ctx.currentTime);

    streamSource.connect(streamBP);
    streamBP.connect(this.gains.water_stream);
    streamSource.start();
  }

  // =========================================================================
  // 9. PENTATONIC CRYSTAL CHIMES
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
  // 10. FOCUS BELL & GRAVITY WAVE
  // =========================================================================
  triggerFocusBell() {
    if (!this.isPlaying || !this.ctx) return;
    const now = this.ctx.currentTime;
    const bellFreqs = [528.0, 792.0, 1056.0];

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

    // 1. Rain
    const rainVol = (isRaining ? (0.28 + (humidity / 100) * 0.15) : 0.0001) * this.layerMix.rain;
    this.gains.rain.gain.setTargetAtTime(rainVol, t, ramp);

    // 2. Birds (Active in plains, archipelago, coast, megalopolis during clear weather)
    const birdActive = isClear && (biomeType === BIOME_TYPES.PLAINS || biomeType === BIOME_TYPES.ARCHIPELAGO || biomeType === BIOME_TYPES.COAST || biomeType === BIOME_TYPES.MEGALOPOLIS || biomeType === BIOME_TYPES.SOLAR_SPIRE);
    const birdVol = (birdActive ? 0.65 : 0.0001) * this.layerMix.birds;
    this.gains.birds.gain.setTargetAtTime(birdVol, t, ramp);

    // 3. Insects (Active in plains, crystal forest, desert ruins, deep abyss reef)
    const insectActive = isClear && (biomeType === BIOME_TYPES.PLAINS || biomeType === BIOME_TYPES.CRYSTAL_FOREST || biomeType === BIOME_TYPES.DESERT_RUINS || biomeType === BIOME_TYPES.DEEP_ABYSS_REEF);
    const insectVol = (insectActive ? 0.45 : 0.0001) * this.layerMix.insects;
    this.gains.insects.gain.setTargetAtTime(insectVol, t, ramp);

    // 4. Crystal Bells (Active in crystal forest & glacier)
    const crystalActive = (biomeType === BIOME_TYPES.CRYSTAL_FOREST || biomeType === BIOME_TYPES.GLACIER || biomeType === BIOME_TYPES.VOLCANO_PLASMA);
    const crystalVol = (crystalActive ? 0.55 : 0.0001) * this.layerMix.crystal_bells;
    this.gains.crystal_bells.gain.setTargetAtTime(crystalVol, t, ramp);

    // 5. Desert Wind (Active in desert ruins & solar spire)
    const desertActive = (biomeType === BIOME_TYPES.DESERT_RUINS || biomeType === BIOME_TYPES.SOLAR_SPIRE);
    const desertVol = (desertActive ? (0.2 + (windSpeed / 30) * 0.25) : 0.0001) * this.layerMix.desert_wind;
    this.gains.desert_wind.gain.setTargetAtTime(desertVol, t, ramp);

    // 6. Water Stream (Active in archipelago & deep abyss reef)
    const streamActive = (biomeType === BIOME_TYPES.ARCHIPELAGO || biomeType === BIOME_TYPES.DEEP_ABYSS_REEF);
    const streamVol = (streamActive ? 0.35 : 0.0001) * this.layerMix.water_stream;
    this.gains.water_stream.gain.setTargetAtTime(streamVol, t, ramp);

    // 7. Grass Rustle
    const grassActive = biomeType === BIOME_TYPES.PLAINS ? (0.25 + (windSpeed / 40) * 0.25) : 0.0001;
    this.gains.grass.gain.setTargetAtTime(grassActive * this.layerMix.grass, t, ramp);

    // 8. Ocean Surf
    const oceanActive = biomeType === BIOME_TYPES.COAST ? 0.45 : 0.0001;
    this.gains.ocean.gain.setTargetAtTime(oceanActive * this.layerMix.ocean, t, ramp);

    // 9. Base Wind
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
