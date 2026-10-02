/**
 * App Main Controller (Exoplanet Suite v5.0)
 * Seamlessly integrates:
 * - 16 Procedural Alien Biomes with Multi-Layer Depth
 * - Holographic 3D Rotating Exoplanet Wireframe Globe
 * - Real-Time Atmospheric Flux Oscilloscope
 * - Live Web Audio Frequency Spectrum Visualizer
 * - Galactic Archive (Planet Codex) with LocalStorage Persistence
 * - Time & Space Resonance Simulator (Manual Overrides)
 * - Enhanced Postcard Snapshot Export
 * - Ambient Focus Mode & Procedural Sci-Fi UI SFX
 */

import { WeatherService, PRESET_CITIES, BIOME_LABELS } from './weatherService.js';
import { WeatherConverter, PHENOMENON_TYPES } from './converter.js';
import { AudioSynthesizer } from './audioSynthesizer.js';
import { CanvasRenderer } from './renderer/canvasRenderer.js';
import { BIOME_TYPES } from './renderer/landscape.js';

class ObservatoryApp {
  constructor() {
    this.weatherService = new WeatherService();
    this.audioSynth = new AudioSynthesizer();
    this.renderer = null;

    this.currentTelemetry = null;
    this.currentTransmuted = null;
    this.logInterval = null;

    // Mini Canvas Contexts
    this.globeCtx = null;
    this.waveCtx = null;
    this.spectrumCtx = null;
    this.auxAnimFrame = null;
    this.globeRotation = 0;

    // Codex Storage
    this.codex = this.loadCodex();

    // Simulation Overrides
    this.simOverrides = {
      weather: 'AUTO',
      biome: 'AUTO',
      windSpeed: null,
      temperature: null
    };

    this.timer = {
      interval: null,
      mode: 'focus',
      timeLeft: 25 * 60,
      totalTime: 25 * 60,
      isRunning: false
    };
  }

  async init() {
    const canvas = document.getElementById('world-canvas');
    this.renderer = new CanvasRenderer(canvas);

    this.renderer.setSplashAudioCallback((intensity) => {
      this.audioSynth.triggerCrystalChime(intensity);
    });

    // Initialize mini HUD canvases
    this.initMiniCanvases();

    this.setupUIEventListeners();
    this.setupCityModal();
    this.setupMixerModal();
    this.setupCodexModal();
    this.setupSimulatorModal();
    this.setupPomodoroTimer();
    this.setupPostcardSnapshot();
    this.setupInteractiveCanvasRipples(canvas);
    this.setupRandomWarpButton();

    await this.loadCityWeather(PRESET_CITIES[0]);

    this.renderer.start();
    this.startAuxiliaryAnimLoop();
    this.startObservationLogger();

    // Periodic live sync
    setInterval(() => {
      if (this.weatherService.currentCity && this.simOverrides.weather === 'AUTO') {
        this.loadCityWeather(this.weatherService.currentCity, true);
      }
    }, 3 * 60 * 1000);
  }

  initMiniCanvases() {
    const globeCanvas = document.getElementById('planet-hologram-canvas');
    if (globeCanvas) this.globeCtx = globeCanvas.getContext('2d');

    const waveCanvas = document.getElementById('telemetry-wave-canvas');
    if (waveCanvas) this.waveCtx = waveCanvas.getContext('2d');

    const specCanvas = document.getElementById('audio-spectrum-canvas');
    if (specCanvas) this.spectrumCtx = specCanvas.getContext('2d');
  }

  startAuxiliaryAnimLoop() {
    const freqData = new Uint8Array(64);

    const renderLoop = (time) => {
      this.renderHolographicGlobe(time);
      this.renderAtmosphericOscilloscope(time);
      this.renderAudioSpectrum(freqData);
      this.auxAnimFrame = requestAnimationFrame(renderLoop);
    };
    this.auxAnimFrame = requestAnimationFrame(renderLoop);
  }

  // =========================================================================
  // MINI CANVAS 1: 3D HOLOGRAPHIC ROTATING EXOPLANET GLOBE
  // =========================================================================
  renderHolographicGlobe(time) {
    if (!this.globeCtx) return;
    const ctx = this.globeCtx;
    const w = 76;
    const h = 76;
    const cx = w * 0.5;
    const cy = h * 0.5;
    const r = 26;

    ctx.clearRect(0, 0, w, h);

    this.globeRotation += 0.015;
    const rot = this.globeRotation;

    // Glowing Hologram Disc
    const grad = ctx.createRadialGradient(cx, cy, 6, cx, cy, r);
    grad.addColorStop(0, 'rgba(0, 240, 255, 0.4)');
    grad.addColorStop(0.7, 'rgba(168, 85, 247, 0.2)');
    grad.addColorStop(1, 'rgba(0, 240, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Outer Rim
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.65)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Rotating Latitudinal and Longitudinal Wireframe Rings
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
    ctx.lineWidth = 0.9;

    // Equator & Parallels
    for (let lat = -1; lat <= 1; lat++) {
      const yOffset = lat * (r * 0.5);
      const radAtLat = Math.sqrt(Math.max(0, r * r - yOffset * yOffset));
      ctx.beginPath();
      ctx.ellipse(cx, cy + yOffset, radAtLat, radAtLat * 0.25, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Meridians
    for (let m = 0; m < 4; m++) {
      const mAngle = rot + (m * Math.PI) / 4;
      const xRad = Math.cos(mAngle) * r;
      ctx.beginPath();
      ctx.ellipse(cx, cy, Math.abs(xRad), r, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // =========================================================================
  // MINI CANVAS 2: REAL-TIME ATMOSPHERIC OSCILLOSCOPE
  // =========================================================================
  renderAtmosphericOscilloscope(time) {
    if (!this.waveCtx) return;
    const ctx = this.waveCtx;
    const w = 280;
    const h = 38;
    ctx.clearRect(0, 0, w, h);

    const wind = this.currentTelemetry ? this.currentTelemetry.windSpeed : 10;
    const humidity = this.currentTelemetry ? this.currentTelemetry.humidity : 50;

    ctx.strokeStyle = 'rgba(0, 255, 178, 0.85)';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = '#00ffb2';
    ctx.shadowBlur = 6;

    ctx.beginPath();
    for (let x = 0; x < w; x += 4) {
      const wave = Math.sin(x * 0.045 + time * 0.003) * (8 + wind * 0.2) +
                   Math.cos(x * 0.09 - time * 0.002) * (humidity * 0.06);
      const y = h * 0.5 + wave;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // =========================================================================
  // MINI CANVAS 3: LIVE AUDIO SPECTRUM VISUALIZER
  // =========================================================================
  renderAudioSpectrum(freqData) {
    if (!this.spectrumCtx) return;
    const ctx = this.spectrumCtx;
    const w = 280;
    const h = 32;
    ctx.clearRect(0, 0, w, h);

    this.audioSynth.getFrequencyData(freqData);

    const barCount = 28;
    const barWidth = 6;
    const gap = 3.5;
    const startX = (w - (barCount * (barWidth + gap))) * 0.5;

    for (let i = 0; i < barCount; i++) {
      const val = freqData[i] || 0;
      const barH = Math.max(2, (val / 255) * (h - 4));
      const x = startX + i * (barWidth + gap);
      const y = h - barH;

      const grad = ctx.createLinearGradient(0, y, 0, h);
      grad.addColorStop(0, '#00f0ff');
      grad.addColorStop(1, '#a855f7');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barWidth, barH);
    }
  }

  setupInteractiveCanvasRipples(canvas) {
    canvas.addEventListener('pointerdown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.renderer.triggerGravityRipple(x, y);
      this.audioSynth.triggerGravityWaveChime();
    });
  }

  setupRandomWarpButton() {
    const warpBtn = document.getElementById('random-warp-btn');
    if (warpBtn) {
      warpBtn.addEventListener('click', async () => {
        this.audioSynth.playUiWarp();
        warpBtn.classList.add('active');

        const randomLocation = await this.weatherService.getRandomWorldLocation();
        await this.loadCityWeather(randomLocation);
        setTimeout(() => warpBtn.classList.remove('active'), 600);

        const log = {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          text: `[次元跳躍] ${randomLocation.name} (${this.currentTelemetry.parallelCity}) へワープ完了。`
        };
        this.appendLog(log);
      });
    }
  }

  async loadCityWeather(city, isSilent = false) {
    const cityLabel = document.getElementById('current-city-label');
    const syncStatus = document.getElementById('sync-status-text');

    if (!isSilent) {
      if (cityLabel) cityLabel.textContent = `${city.name.split(' ')[0]} (跳躍中...)`;
      if (syncStatus) syncStatus.textContent = 'WARPING...';
    }

    try {
      const telemetry = await this.weatherService.fetchWeather(city);
      this.currentTelemetry = telemetry;
      this.applyTelemetry(telemetry);
      this.saveToCodex(telemetry);
      if (syncStatus) syncStatus.textContent = 'LIVE SYNC';
    } catch (e) {
      console.error('Failed to load city weather:', e);
      if (syncStatus) syncStatus.textContent = 'OFFLINE MODE';
    }
  }

  applyTelemetry(telemetry) {
    const transmuted = WeatherConverter.transmute(telemetry);
    this.currentTransmuted = transmuted;

    // Apply any simulation overrides
    if (this.simOverrides.weather !== 'AUTO') {
      transmuted.phenomenonType = this.simOverrides.weather;
    }
    if (this.simOverrides.biome !== 'AUTO') {
      transmuted.biome = this.simOverrides.biome;
      telemetry.biome = this.simOverrides.biome;
      telemetry.biomeLabel = BIOME_LABELS[this.simOverrides.biome] || telemetry.biomeLabel;
    }
    if (this.simOverrides.windSpeed !== null) {
      telemetry.windSpeed = this.simOverrides.windSpeed;
      transmuted.renderParams.windSpeed = this.simOverrides.windSpeed;
    }
    if (this.simOverrides.temperature !== null) {
      telemetry.temperature = this.simOverrides.temperature;
      transmuted.renderParams.temperature = this.simOverrides.temperature;
    }

    this.updateHUD(telemetry, transmuted);

    this.renderer.updateState(
      transmuted.renderParams,
      transmuted.phenomenonType,
      telemetry.biome,
      telemetry.seed,
      telemetry.skyFeature
    );

    this.audioSynth.updateEnvironment({
      weatherType: transmuted.phenomenonType,
      biomeType: telemetry.biome,
      windSpeed: telemetry.windSpeed,
      temperature: telemetry.temperature,
      humidity: telemetry.humidity
    });
  }

  updateHUD(telemetry, transmuted) {
    document.getElementById('current-city-label').textContent = telemetry.city;
    document.getElementById('parallel-dimension-title').textContent = `${transmuted.dualTelemetry.dimensionalZone} // ${telemetry.planetDesignation}`;
    document.getElementById('phenomenon-name').textContent = transmuted.phenomenonName;
    document.getElementById('phenomenon-sub').textContent = transmuted.phenomenonSub;
    document.getElementById('weather-badge').textContent = transmuted.weatherBadge;
    document.getElementById('poetic-quote').textContent = `“ ${transmuted.poeticDescription} ”`;

    const biomeBadge = document.getElementById('current-biome-badge');
    if (biomeBadge) biomeBadge.textContent = BIOME_LABELS[transmuted.biome] || telemetry.biomeLabel;

    document.getElementById('metric-temp').textContent = `${telemetry.temperature.toFixed(1)}`;
    document.getElementById('metric-temp-dual').textContent = transmuted.dualTelemetry.etherCaloric;

    document.getElementById('metric-humidity').textContent = `${telemetry.humidity}`;
    document.getElementById('metric-humidity-dual').textContent = transmuted.dualTelemetry.astralDensity;

    document.getElementById('metric-pressure').textContent = `${Math.round(telemetry.pressure)}`;
    document.getElementById('metric-pressure-dual').textContent = transmuted.dualTelemetry.gravBuoyancy;

    document.getElementById('metric-wind').textContent = `${telemetry.windSpeed.toFixed(1)}`;
    document.getElementById('metric-wind-dual').textContent = transmuted.dualTelemetry.vectorDrift;

    // Hazard Rating
    const hazardBadge = document.getElementById('hazard-badge');
    if (hazardBadge) {
      if (telemetry.temperature < -15 || telemetry.windSpeed > 35) {
        hazardBadge.textContent = 'ALERT // CL-3';
        hazardBadge.style.color = 'var(--accent-rose)';
        hazardBadge.style.borderColor = 'rgba(244, 63, 94, 0.4)';
      } else if (telemetry.temperature > 32 || telemetry.windSpeed > 22) {
        hazardBadge.textContent = 'WARN // CL-2';
        hazardBadge.style.color = 'var(--accent-amber)';
        hazardBadge.style.borderColor = 'rgba(245, 158, 11, 0.4)';
      } else {
        hazardBadge.textContent = 'SAFE // CL-1';
        hazardBadge.style.color = 'var(--accent-emerald)';
        hazardBadge.style.borderColor = 'rgba(0, 255, 178, 0.3)';
      }
    }

    // Planetary Specs in Right Panel
    const liveTimeEl = document.getElementById('telemetry-live-time');
    if (liveTimeEl) liveTimeEl.textContent = telemetry.time;

    const gravityEl = document.getElementById('telemetry-gravity');
    if (gravityEl) gravityEl.textContent = telemetry.gravity;

    const atmoEl = document.getElementById('telemetry-atmo');
    if (atmoEl) atmoEl.textContent = telemetry.atmosphere;

    const skyFeatureEl = document.getElementById('telemetry-sky-feature');
    if (skyFeatureEl) skyFeatureEl.textContent = telemetry.skyFeature;
  }

  // =========================================================================
  // GALACTIC ARCHIVE (PLANET CODEX)
  // =========================================================================
  loadCodex() {
    try {
      const data = localStorage.getItem('aetheria_codex');
      return data ? JSON.parse(data) : [];
    } catch(e) {
      return [];
    }
  }

  saveToCodex(telemetry) {
    if (!telemetry) return;
    const exists = this.codex.some(e => e.planetDesignation === telemetry.planetDesignation);
    if (!exists) {
      this.codex.unshift({
        name: telemetry.city,
        parallelCity: telemetry.parallelCity,
        planetDesignation: telemetry.planetDesignation,
        biome: telemetry.biome,
        biomeLabel: telemetry.biomeLabel,
        lat: telemetry.rawLatitude,
        lon: telemetry.rawLongitude,
        discoveredAt: new Date().toLocaleDateString()
      });
      if (this.codex.length > 30) this.codex.pop();
      try {
        localStorage.setItem('aetheria_codex', JSON.stringify(this.codex));
      } catch(e) {}
    }
  }

  setupCodexModal() {
    const codexBtn = document.getElementById('codex-btn');
    const codexModal = document.getElementById('codex-modal-overlay');
    const closeBtn = document.getElementById('close-codex-btn');
    const listContainer = document.getElementById('codex-entries-list');

    const renderCodex = () => {
      if (this.codex.length === 0) {
        listContainer.innerHTML = '<div style="color: var(--text-muted); font-size: 0.8rem; padding: 20px;">まだ惑星データが記録されていません。Wキーで跳躍してください。</div>';
        return;
      }
      listContainer.innerHTML = this.codex.map((p, idx) => `
        <div class="codex-entry-card">
          <div class="codex-card-title">${p.parallelCity || p.planetDesignation}</div>
          <div class="codex-card-sub">${p.planetDesignation} // ${p.biomeLabel}</div>
          <div class="codex-card-date">地球地点: ${p.name} | 記録: ${p.discoveredAt}</div>
          <button class="codex-warp-btn" data-index="${idx}">次元跳躍 (WARP)</button>
        </div>
      `).join('');

      listContainer.querySelectorAll('.codex-warp-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const entry = this.codex[e.target.dataset.index];
          this.loadCityWeather({ name: entry.name, lat: entry.lat, lon: entry.lon, basePlanet: entry.parallelCity });
          codexModal.classList.remove('open');
        });
      });
    };

    codexBtn.addEventListener('click', () => {
      this.audioSynth.playUiClick();
      renderCodex();
      codexModal.classList.add('open');
    });

    closeBtn.addEventListener('click', () => {
      codexModal.classList.remove('open');
    });

    codexModal.addEventListener('click', (e) => {
      if (e.target === codexModal) codexModal.classList.remove('open');
    });
  }

  // =========================================================================
  // TIME & SPACE SIMULATOR MODAL
  // =========================================================================
  setupSimulatorModal() {
    const simBtn = document.getElementById('simulator-btn');
    const simModal = document.getElementById('sim-modal-overlay');
    const closeBtn = document.getElementById('close-sim-btn');

    const weatherSelect = document.getElementById('sim-weather-select');
    const biomeSelect = document.getElementById('sim-biome-select');
    const windSlider = document.getElementById('sim-wind-slider');
    const tempSlider = document.getElementById('sim-temp-slider');

    simBtn.addEventListener('click', () => {
      this.audioSynth.playUiClick();
      simModal.classList.add('open');
    });

    closeBtn.addEventListener('click', () => {
      simModal.classList.remove('open');
    });

    simModal.addEventListener('click', (e) => {
      if (e.target === simModal) simModal.classList.remove('open');
    });

    weatherSelect.addEventListener('change', (e) => {
      this.simOverrides.weather = e.target.value;
      if (this.currentTelemetry) this.applyTelemetry(this.currentTelemetry);
    });

    biomeSelect.addEventListener('change', (e) => {
      this.simOverrides.biome = e.target.value;
      if (this.currentTelemetry) this.applyTelemetry(this.currentTelemetry);
    });

    windSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      document.getElementById('sim-wind-val').textContent = `${val} km/h`;
      this.simOverrides.windSpeed = val;
      if (this.currentTelemetry) this.applyTelemetry(this.currentTelemetry);
    });

    tempSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      document.getElementById('sim-temp-val').textContent = `${val} °C`;
      this.simOverrides.temperature = val;
      if (this.currentTelemetry) this.applyTelemetry(this.currentTelemetry);
    });
  }

  setupPomodoroTimer() {
    const timerBtn = document.getElementById('timer-toggle-play-btn');
    const timerResetBtn = document.getElementById('timer-reset-btn');
    const timerDisplay = document.getElementById('timer-time-display');
    const timerModeBtn = document.getElementById('timer-mode-btn');

    const updateTimerDisplay = () => {
      const mins = Math.floor(this.timer.timeLeft / 60).toString().padStart(2, '0');
      const secs = (this.timer.timeLeft % 60).toString().padStart(2, '0');
      timerDisplay.textContent = `${mins}:${secs}`;
    };

    timerBtn.addEventListener('click', () => {
      this.audioSynth.playUiClick();
      if (this.timer.isRunning) {
        clearInterval(this.timer.interval);
        this.timer.isRunning = false;
        timerBtn.textContent = 'START';
      } else {
        this.timer.isRunning = true;
        timerBtn.textContent = 'PAUSE';
        this.timer.interval = setInterval(() => {
          this.timer.timeLeft--;
          updateTimerDisplay();

          if (this.timer.timeLeft <= 0) {
            clearInterval(this.timer.interval);
            this.timer.isRunning = false;
            timerBtn.textContent = 'START';
            this.audioSynth.triggerFocusBell();

            if (this.timer.mode === 'focus') {
              this.timer.mode = 'break';
              this.timer.totalTime = 5 * 60;
              this.timer.timeLeft = 5 * 60;
              timerModeBtn.textContent = 'REST (5m)';
              timerModeBtn.classList.add('break-mode');
            } else {
              this.timer.mode = 'focus';
              this.timer.totalTime = 25 * 60;
              this.timer.timeLeft = 25 * 60;
              timerModeBtn.textContent = 'FOCUS (25m)';
              timerModeBtn.classList.remove('break-mode');
            }
            updateTimerDisplay();
          }
        }, 1000);
      }
    });

    timerResetBtn.addEventListener('click', () => {
      this.audioSynth.playUiClick();
      clearInterval(this.timer.interval);
      this.timer.isRunning = false;
      timerBtn.textContent = 'START';
      this.timer.timeLeft = this.timer.totalTime;
      updateTimerDisplay();
    });

    timerModeBtn.addEventListener('click', () => {
      this.audioSynth.playUiClick();
      clearInterval(this.timer.interval);
      this.timer.isRunning = false;
      timerBtn.textContent = 'START';
      if (this.timer.mode === 'focus') {
        this.timer.mode = 'break';
        this.timer.totalTime = 5 * 60;
        this.timer.timeLeft = 5 * 60;
        timerModeBtn.textContent = 'REST (5m)';
        timerModeBtn.classList.add('break-mode');
      } else {
        this.timer.mode = 'focus';
        this.timer.totalTime = 25 * 60;
        this.timer.timeLeft = 25 * 60;
        timerModeBtn.textContent = 'FOCUS (25m)';
        timerModeBtn.classList.remove('break-mode');
      }
      updateTimerDisplay();
    });
  }

  setupPostcardSnapshot() {
    const postcardBtn = document.getElementById('postcard-btn');
    postcardBtn.addEventListener('click', () => {
      this.audioSynth.playUiClick();
      const canvas = document.getElementById('world-canvas');
      const offCanvas = document.createElement('canvas');
      offCanvas.width = canvas.width;
      offCanvas.height = canvas.height;
      const ctx = offCanvas.getContext('2d');

      ctx.drawImage(canvas, 0, 0);

      const dpr = window.devicePixelRatio || 1;
      const w = offCanvas.width / dpr;
      const h = offCanvas.height / dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Sci-Fi Cybernetic Postcard Overlay Frame
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.55)';
      ctx.lineWidth = 3;
      ctx.strokeRect(20, 20, w - 40, h - 40);

      // Corner Reticle Accents
      const cLen = 16;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 20, cLen, cLen);
      ctx.strokeRect(w - 20 - cLen, 20, cLen, cLen);
      ctx.strokeRect(20, h - 20 - cLen, cLen, cLen);
      ctx.strokeRect(w - 20 - cLen, h - 20 - cLen, cLen, cLen);

      // Stamp Card Box
      ctx.fillStyle = 'rgba(4, 9, 20, 0.85)';
      ctx.fillRect(w - 360, h - 115, 330, 85);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(w - 360, h - 115, 330, 85);

      ctx.fillStyle = '#fff';
      ctx.font = '600 13px "Cinzel", serif';
      ctx.fillText('AETHERIA OBSERVATORY // PLANET ARCHIVE', w - 345, h - 90);

      ctx.fillStyle = '#00f0ff';
      ctx.font = '11px "JetBrains Mono", monospace';
      const planetTitle = this.currentTelemetry ? `${this.currentTelemetry.parallelCity} [${this.currentTelemetry.planetDesignation}]` : 'EXOPLANET';
      ctx.fillText(planetTitle, w - 345, h - 68);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '10px "JetBrains Mono", monospace';
      const biomeText = this.currentTelemetry ? `BIOME: ${this.currentTelemetry.biomeLabel}` : '';
      ctx.fillText(`${biomeText} | ${new Date().toLocaleDateString()}`, w - 345, h - 48);

      const link = document.createElement('a');
      link.download = `Aetheria_Planet_${Date.now()}.png`;
      link.href = offCanvas.toDataURL('image/png');
      link.click();
    });
  }

  setupMixerModal() {
    const mixerOpenBtn = document.getElementById('open-mixer-btn');
    const mixerModal = document.getElementById('mixer-modal-overlay');
    const closeBtn = document.getElementById('close-mixer-btn');

    mixerOpenBtn.addEventListener('click', () => {
      this.audioSynth.playUiClick();
      mixerModal.classList.add('open');
    });

    closeBtn.addEventListener('click', () => {
      mixerModal.classList.remove('open');
    });

    mixerModal.addEventListener('click', (e) => {
      if (e.target === mixerModal) mixerModal.classList.remove('open');
    });

    const layers = ['pad', 'rain', 'birds', 'grass', 'ocean', 'wind', 'insects', 'crystal_bells', 'desert_wind', 'water_stream', 'chimes'];
    layers.forEach(l => {
      const slider = document.getElementById(`mix-${l}-slider`);
      if (slider) {
        slider.addEventListener('input', (e) => {
          this.audioSynth.setLayerVolume(l, parseFloat(e.target.value));
        });
      }
    });
  }

  setupUIEventListeners() {
    const audioBtn = document.getElementById('audio-toggle-btn');
    const audioSlider = document.getElementById('audio-volume-slider');
    const volPct = document.getElementById('volume-pct');

    audioBtn.addEventListener('click', async () => {
      const playing = this.audioSynth.toggle();
      audioBtn.classList.toggle('active', playing);
      audioBtn.innerHTML = playing ? `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        </svg>
      ` : `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
        </svg>
      `;

      if (playing && this.currentTransmuted && this.currentTelemetry) {
        this.audioSynth.updateEnvironment({
          weatherType: this.currentTransmuted.phenomenonType,
          biomeType: this.currentTelemetry.biome,
          windSpeed: this.currentTelemetry.windSpeed,
          temperature: this.currentTelemetry.temperature,
          humidity: this.currentTelemetry.humidity
        });
      }
    });

    audioSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.audioSynth.setVolume(val);
      if (volPct) volPct.textContent = `${Math.round(val * 100)}%`;
    });

    const ambientBtn = document.getElementById('ambient-toggle-btn');
    const restoreHint = document.getElementById('ambient-restore-hint');

    const toggleAmbient = () => {
      document.body.classList.toggle('ambient-mode');
    };

    ambientBtn.addEventListener('click', toggleAmbient);
    restoreHint.addEventListener('click', toggleAmbient);

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      if (e.key === 'f' || e.key === 'F' || e.key === ' ') {
        e.preventDefault();
        toggleAmbient();
      } else if (e.key === 'm' || e.key === 'M') {
        audioBtn.click();
      } else if (e.key === 'w' || e.key === 'W') {
        const warpBtn = document.getElementById('random-warp-btn');
        if (warpBtn) warpBtn.click();
      } else if (e.key === 'p' || e.key === 'P') {
        document.getElementById('postcard-btn').click();
      } else if (e.key === 'c' || e.key === 'C') {
        document.getElementById('codex-btn').click();
      } else if (e.key === 's' || e.key === 'S') {
        document.getElementById('simulator-btn').click();
      }
    });

    document.getElementById('fullscreen-btn').addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });
  }

  setupCityModal() {
    const cityBtn = document.getElementById('city-select-btn');
    const modalOverlay = document.getElementById('city-modal-overlay');
    const searchInput = document.getElementById('city-search-input');
    const searchResults = document.getElementById('search-results');
    const presetContainer = document.getElementById('preset-cities');
    const closeCityBtn = document.getElementById('close-city-btn');

    closeCityBtn.addEventListener('click', () => modalOverlay.classList.remove('open'));

    presetContainer.innerHTML = PRESET_CITIES.map((c, i) => {
      const sessionInfo = this.weatherService.getCitySessionInfo(c.lat, c.lon, c.name);
      return `
        <div class="preset-city-item" data-index="${i}">
          <div style="font-weight: 500;">${c.name}</div>
          <div style="font-size: 0.68rem; color: var(--accent-cyan);">${c.basePlanet || sessionInfo.biomeLabel}</div>
        </div>
      `;
    }).join('');

    presetContainer.querySelectorAll('.preset-city-item').forEach(item => {
      item.addEventListener('click', () => {
        const city = PRESET_CITIES[item.dataset.index];
        this.loadCityWeather(city);
        modalOverlay.classList.remove('open');
      });
    });

    cityBtn.addEventListener('click', () => {
      this.audioSynth.playUiClick();
      modalOverlay.classList.add('open');
      searchInput.focus();
    });

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) modalOverlay.classList.remove('open');
    });

    let searchTimeout = null;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const q = e.target.value;
      if (q.length < 2) {
        searchResults.innerHTML = '';
        return;
      }

      searchTimeout = setTimeout(async () => {
        searchResults.innerHTML = '<div style="padding: 10px; color: var(--text-muted); font-size: 0.8rem;">惑星座標を索敵中...</div>';
        const results = await this.weatherService.searchCities(q);
        if (results.length === 0) {
          searchResults.innerHTML = '<div style="padding: 10px; color: var(--text-muted); font-size: 0.8rem;">観測地点が見つかりませんでした</div>';
          return;
        }

        searchResults.innerHTML = results.map(r => `
          <div class="preset-city-item custom-search-item" style="text-align: left; margin-bottom: 6px;">
            <div style="color: #fff; font-weight: 500;">${r.name}</div>
            <div style="font-size: 0.7rem; color: var(--accent-cyan);">${r.basePlanet} [${r.biomeLabel}]</div>
          </div>
        `).join('');

        searchResults.querySelectorAll('.custom-search-item').forEach((item, idx) => {
          item.addEventListener('click', () => {
            this.loadCityWeather(results[idx]);
            modalOverlay.classList.remove('open');
          });
        });
      }, 350);
    });
  }

  startObservationLogger() {
    const stream = document.getElementById('log-stream');
    if (this.currentTransmuted) {
      const initLog = WeatherConverter.generateLogEntry(this.currentTransmuted);
      this.appendLog(initLog);
    }

    this.logInterval = setInterval(() => {
      if (this.currentTransmuted) {
        const log = WeatherConverter.generateLogEntry(this.currentTransmuted);
        this.appendLog(log);
      }
    }, 8500);
  }

  appendLog(log) {
    const stream = document.getElementById('log-stream');
    if (!stream) return;

    const el = document.createElement('div');
    el.className = 'log-item';
    el.innerHTML = `
      <span class="log-timestamp">[${log.timestamp}]</span>
      <span class="log-text">${log.text}</span>
    `;

    stream.insertBefore(el, stream.firstChild);

    while (stream.children.length > 8) {
      stream.removeChild(stream.lastChild);
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const app = new ObservatoryApp();
  app.init();
});
