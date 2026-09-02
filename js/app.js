/**
 * App Main Controller
 * Integrates Real-time WeatherService (Session-Fixed Biomes), Converter, Dynamic Audio, and Multi-Biome Renderer
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
  }

  async init() {
    const canvas = document.getElementById('world-canvas');
    this.renderer = new CanvasRenderer(canvas);

    // Link rain/crystal particle splashes to procedural pentatonic chimes
    this.renderer.setSplashAudioCallback((intensity) => {
      this.audioSynth.triggerCrystalChime(intensity);
    });

    this.setupUIEventListeners();
    this.setupCityModal();

    // Initial weather fetch for Tokyo (Real-time live data)
    await this.loadCityWeather(PRESET_CITIES[0]);

    this.renderer.start();
    this.startObservationLogger();

    // Periodic real weather refresh every 3 minutes
    setInterval(() => {
      this.loadCityWeather(this.weatherService.currentCity, true);
    }, 3 * 60 * 1000);
  }

  /**
   * Fetch live weather data for city
   */
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

  /**
   * Apply live telemetry and fixed session biome to renderer & audio
   */
  applyTelemetry(telemetry) {
    const transmuted = WeatherConverter.transmute(telemetry);
    this.currentTransmuted = transmuted;

    this.updateHUD(telemetry, transmuted);

    // Update Canvas Renderer with the city's fixed session biome and seed
    this.renderer.updateState(
      transmuted.renderParams, 
      transmuted.phenomenonType, 
      telemetry.biome, 
      telemetry.seed
    );

    // Update Dynamic Multi-Layer Ambient Audio
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

    // Biome badge
    const biomeBadge = document.getElementById('current-biome-badge');
    if (biomeBadge) {
      biomeBadge.textContent = telemetry.biomeLabel;
    }

    // Dual Metrics (Earth Live vs Parallel Transmuted)
    document.getElementById('metric-temp').textContent = `${telemetry.temperature.toFixed(1)}`;
    document.getElementById('metric-temp-dual').textContent = transmuted.dualTelemetry.etherCaloric;

    document.getElementById('metric-humidity').textContent = `${telemetry.humidity}`;
    document.getElementById('metric-humidity-dual').textContent = transmuted.dualTelemetry.astralDensity;

    document.getElementById('metric-pressure').textContent = `${Math.round(telemetry.pressure)}`;
    document.getElementById('metric-pressure-dual').textContent = transmuted.dualTelemetry.gravBuoyancy;

    document.getElementById('metric-wind').textContent = `${telemetry.windSpeed.toFixed(1)}`;
    document.getElementById('metric-wind-dual').textContent = transmuted.dualTelemetry.vectorDrift;

    // Station Telemetry Details in Right Panel
    const liveTimeEl = document.getElementById('telemetry-live-time');
    if (liveTimeEl) liveTimeEl.textContent = telemetry.time;

    const windDirEl = document.getElementById('telemetry-wind-dir');
    if (windDirEl) windDirEl.textContent = `${telemetry.windDirection}°`;
  }

  setupUIEventListeners() {
    // 1. Audio Toggle & Volume
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

    // 2. Ambient / Fullscreen Focus Mode
    const ambientBtn = document.getElementById('ambient-toggle-btn');
    const restoreHint = document.getElementById('ambient-restore-hint');

    const toggleAmbient = () => {
      document.body.classList.toggle('ambient-mode');
    };

    ambientBtn.addEventListener('click', toggleAmbient);
    restoreHint.addEventListener('click', toggleAmbient);

    // Keyboard Shortcuts (F/Space: Ambient Mode, M: Mute/Unmute)
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'f' || e.key === 'F' || e.key === ' ') {
        e.preventDefault();
        toggleAmbient();
      } else if (e.key === 'm' || e.key === 'M') {
        audioBtn.click();
      }
    });

    document.getElementById('world-canvas').addEventListener('dblclick', toggleAmbient);

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
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('open');
      }
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
    }, 9000);
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
