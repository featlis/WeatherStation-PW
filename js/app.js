/**
 * App Main Controller
 * Integrated with Celestial Focus Timer, Sound Mixer, Gravity Ripples, and Postcard Snapshot Export
 */

import { WeatherService, PRESET_CITIES } from './weatherService.js';
import { WeatherConverter } from './converter.js';
import { AudioSynthesizer } from './audioSynthesizer.js';
import { CanvasRenderer } from './renderer/canvasRenderer.js';

class ObservatoryApp {
  constructor() {
    this.weatherService = new WeatherService();
    this.audioSynth = new AudioSynthesizer();
    this.renderer = null;

    this.currentTelemetry = null;
    this.currentTransmuted = null;
    this.logInterval = null;

    // Focus / Pomodoro Timer State
    this.timer = {
      interval: null,
      mode: 'focus', // 'focus' (25m) or 'break' (5m)
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

    this.setupUIEventListeners();
    this.setupCityModal();
    this.setupMixerModal();
    this.setupPomodoroTimer();
    this.setupPostcardSnapshot();
    this.setupInteractiveCanvasRipples(canvas);

    await this.loadCityWeather(PRESET_CITIES[0]);

    this.renderer.start();
    this.startObservationLogger();

    setInterval(() => {
      this.loadCityWeather(this.weatherService.currentCity, true);
    }, 3 * 60 * 1000);
  }

  /**
   * Interactive Gravity Ripple on Canvas Click
   */
  setupInteractiveCanvasRipples(canvas) {
    canvas.addEventListener('pointerdown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.renderer.triggerGravityRipple(x, y);
      this.audioSynth.triggerGravityWaveChime();
    });
  }

  async loadCityWeather(city, isSilent = false) {
    const cityLabel = document.getElementById('current-city-label');
    const syncStatus = document.getElementById('sync-status-text');

    if (!isSilent) {
      if (cityLabel) cityLabel.textContent = `${city.name.split(' ')[0]} (同期中...)`;
      if (syncStatus) syncStatus.textContent = 'CONNECTING...';
    }

    try {
      const telemetry = await this.weatherService.fetchWeather(city);
      this.currentTelemetry = telemetry;
      this.applyTelemetry(telemetry);
      if (syncStatus) syncStatus.textContent = 'LIVE SYNC';
    } catch (e) {
      console.error('Failed to load city weather:', e);
      if (syncStatus) syncStatus.textContent = 'OFFLINE MODE';
    }
  }

  applyTelemetry(telemetry) {
    const transmuted = WeatherConverter.transmute(telemetry);
    this.currentTransmuted = transmuted;

    this.updateHUD(telemetry, transmuted);

    this.renderer.updateState(
      transmuted.renderParams, 
      transmuted.phenomenonType, 
      telemetry.biome, 
      telemetry.seed
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
    document.getElementById('parallel-dimension-title').textContent = `${transmuted.dualTelemetry.dimensionalZone} // ${telemetry.biomeLabel}`;
    document.getElementById('phenomenon-name').textContent = transmuted.phenomenonName;
    document.getElementById('phenomenon-sub').textContent = transmuted.phenomenonSub;
    document.getElementById('weather-badge').textContent = transmuted.weatherBadge;
    document.getElementById('poetic-quote').textContent = `“ ${transmuted.poeticDescription} ”`;

    const biomeBadge = document.getElementById('current-biome-badge');
    if (biomeBadge) biomeBadge.textContent = telemetry.biomeLabel;

    document.getElementById('metric-temp').textContent = `${telemetry.temperature.toFixed(1)}`;
    document.getElementById('metric-temp-dual').textContent = transmuted.dualTelemetry.etherCaloric;

    document.getElementById('metric-humidity').textContent = `${telemetry.humidity}`;
    document.getElementById('metric-humidity-dual').textContent = transmuted.dualTelemetry.astralDensity;

    document.getElementById('metric-pressure').textContent = `${Math.round(telemetry.pressure)}`;
    document.getElementById('metric-pressure-dual').textContent = transmuted.dualTelemetry.gravBuoyancy;

    document.getElementById('metric-wind').textContent = `${telemetry.windSpeed.toFixed(1)}`;
    document.getElementById('metric-wind-dual').textContent = transmuted.dualTelemetry.vectorDrift;

    const liveTimeEl = document.getElementById('telemetry-live-time');
    if (liveTimeEl) liveTimeEl.textContent = telemetry.time;

    const windDirEl = document.getElementById('telemetry-wind-dir');
    if (windDirEl) windDirEl.textContent = `${telemetry.windDirection}°`;
  }

  // =========================================================================
  // CELESTIAL POMODORO FOCUS TIMER (25m / 5m)
  // =========================================================================
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

            // Play Solfeggio Focus Harmony Bell
            this.audioSynth.triggerFocusBell();

            // Switch mode
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
      clearInterval(this.timer.interval);
      this.timer.isRunning = false;
      timerBtn.textContent = 'START';
      this.timer.timeLeft = this.timer.totalTime;
      updateTimerDisplay();
    });

    timerModeBtn.addEventListener('click', () => {
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

  // =========================================================================
  // OBSERVATION POSTCARD SNAPSHOT (PNG Export)
  // =========================================================================
  setupPostcardSnapshot() {
    const postcardBtn = document.getElementById('postcard-btn');
    postcardBtn.addEventListener('click', () => {
      const canvas = document.getElementById('world-canvas');
      const offCanvas = document.createElement('canvas');
      offCanvas.width = canvas.width;
      offCanvas.height = canvas.height;
      const ctx = offCanvas.getContext('2d');

      // Draw Main Canvas
      ctx.drawImage(canvas, 0, 0);

      // Add Aesthetic Celestial Postcard Stamp Overlay
      const dpr = window.devicePixelRatio || 1;
      const w = offCanvas.width / dpr;
      const h = offCanvas.height / dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Outer glowing frame
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, w - 40, h - 40);

      // Card Stamp Bottom Right
      ctx.fillStyle = 'rgba(4, 9, 20, 0.75)';
      ctx.fillRect(w - 320, h - 100, 290, 70);
      ctx.strokeStyle = 'rgba(140, 185, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(w - 320, h - 100, 290, 70);

      ctx.fillStyle = '#fff';
      ctx.font = '600 13px "Cinzel", serif';
      ctx.fillText('AETHERIA OBSERVATORY // POSTCARD', w - 305, h - 75);

      ctx.fillStyle = '#00f0ff';
      ctx.font = '11px "JetBrains Mono", monospace';
      const cityText = this.currentTelemetry ? `${this.currentTelemetry.city} [${this.currentTransmuted.phenomenonName}]` : 'ASTRAL STATION';
      ctx.fillText(cityText, w - 305, h - 55);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(`REC: ${new Date().toLocaleString()}`, w - 305, h - 40);

      // Download
      const link = document.createElement('a');
      link.download = `Aetheria_Observatory_${Date.now()}.png`;
      link.href = offCanvas.toDataURL('image/png');
      link.click();
    });
  }

  // =========================================================================
  // SOUNDSCAPE MIXER MODAL
  // =========================================================================
  setupMixerModal() {
    const mixerOpenBtn = document.getElementById('open-mixer-btn');
    const mixerModal = document.getElementById('mixer-modal-overlay');
    const closeBtn = document.getElementById('close-mixer-btn');

    mixerOpenBtn.addEventListener('click', () => {
      mixerModal.classList.add('open');
    });

    closeBtn.addEventListener('click', () => {
      mixerModal.classList.remove('open');
    });

    mixerModal.addEventListener('click', (e) => {
      if (e.target === mixerModal) mixerModal.classList.remove('open');
    });

    // Wire individual sliders
    const layers = ['rain', 'birds', 'grass', 'ocean', 'wind', 'chimes'];
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
      this.audioSynth.setVolume(parseFloat(e.target.value));
    });

    const ambientBtn = document.getElementById('ambient-toggle-btn');
    const restoreHint = document.getElementById('ambient-restore-hint');

    const toggleAmbient = () => {
      document.body.classList.toggle('ambient-mode');
    };

    ambientBtn.addEventListener('click', toggleAmbient);
    restoreHint.addEventListener('click', toggleAmbient);

    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'f' || e.key === 'F' || e.key === ' ') {
        e.preventDefault();
        toggleAmbient();
      } else if (e.key === 'm' || e.key === 'M') {
        audioBtn.click();
      } else if (e.key === 'p' || e.key === 'P') {
        document.getElementById('postcard-btn').click();
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

    presetContainer.innerHTML = PRESET_CITIES.map((c, i) => {
      const sessionInfo = this.weatherService.getCitySessionInfo(c.lat, c.lon);
      return `
        <div class="preset-city-item" data-index="${i}">
          <div style="font-weight: 500;">${c.name}</div>
          <div style="font-size: 0.68rem; color: var(--accent-cyan);">${sessionInfo.biomeLabel}</div>
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
        searchResults.innerHTML = '<div style="padding: 10px; color: var(--text-muted); font-size: 0.8rem;">天球座標を索敵中...</div>';
        const results = await this.weatherService.searchCities(q);
        if (results.length === 0) {
          searchResults.innerHTML = '<div style="padding: 10px; color: var(--text-muted); font-size: 0.8rem;">観測地点が見つかりませんでした</div>';
          return;
        }

        searchResults.innerHTML = results.map(r => `
          <div class="preset-city-item custom-search-item" style="text-align: left; margin-bottom: 6px;">
            <div style="color: #fff; font-weight: 500;">${r.name}</div>
            <div style="font-size: 0.7rem; color: var(--accent-cyan);">${r.parallelName} [${r.biomeLabel}]</div>
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
