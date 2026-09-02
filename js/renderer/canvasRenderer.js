/**
 * CanvasRenderer
 * Master 60fps rendering coordinator for Parallel World Observatory
 */

import { SkyRenderer } from './sky.js';
import { LandscapeRenderer, BIOME_TYPES } from './landscape.js';
import { WeatherEffectsRenderer } from './weatherEffects.js';

export class CanvasRenderer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');

    this.skyRenderer = new SkyRenderer();
    this.landscapeRenderer = new LandscapeRenderer();
    this.weatherEffects = new WeatherEffectsRenderer();

    this.width = 0;
    this.height = 0;
    this.dpr = window.devicePixelRatio || 1;

    this.currentParams = null;
    this.currentPhenomenon = null;
    this.currentBiome = BIOME_TYPES.ARCHIPELAGO;

    this.isRunning = false;
    this.startTime = performance.now();

    this.handleResize = this.handleResize.bind(this);
    this.animate = this.animate.bind(this);

    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  }

  handleResize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    if (this.currentParams) {
      this.weatherEffects.initParticles(this.currentParams.particleCount || 100, this.width, this.height);
    }
  }

  setBiome(biomeType, seed) {
    this.currentBiome = biomeType;
    this.landscapeRenderer.setBiome(biomeType, seed);
  }

  updateState(renderParams, phenomenonType, biomeType, seed) {
    this.currentParams = renderParams;
    this.currentPhenomenon = phenomenonType;
    if (biomeType && (biomeType !== this.currentBiome || seed)) {
      this.currentBiome = biomeType;
      this.landscapeRenderer.setBiome(biomeType, seed || Math.random() * 10000);
    }
    if (this.weatherEffects.particles.length === 0) {
      this.weatherEffects.initParticles(renderParams.particleCount || 100, this.width, this.height);
    }
  }

  setSplashAudioCallback(cb) {
    this.weatherEffects.setSplashCallback(cb);
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      requestAnimationFrame(this.animate);
    }
  }

  stop() {
    this.isRunning = false;
  }

  animate(currentTime) {
    if (!this.isRunning) return;

    const time = currentTime - this.startTime;

    if (this.currentParams && this.currentPhenomenon) {
      this.renderFrame(time);
    }

    requestAnimationFrame(this.animate);
  }

  renderFrame(time) {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Sky & Celestial Layer
    this.skyRenderer.render(this.ctx, this.width, this.height, time, this.currentParams);

    // 2. Multi-Biome Landscape Layer
    this.landscapeRenderer.render(this.ctx, this.width, this.height, time, this.currentParams);

    // 3. Weather Phenomenon Particles
    this.weatherEffects.render(this.ctx, this.width, this.height, time, this.currentParams, this.currentPhenomenon);
  }
}
