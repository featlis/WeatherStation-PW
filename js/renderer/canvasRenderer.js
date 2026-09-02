/**
 * CanvasRenderer
 * Master 60fps rendering coordinator with 10 Biomes, Cosmic Planet Features, Creatures, and Gravity Ripples
 */

import { SkyRenderer } from './sky.js';
import { LandscapeRenderer, BIOME_TYPES } from './landscape.js';
import { WeatherEffectsRenderer } from './weatherEffects.js';
import { CreaturesAndAnomaliesRenderer } from './creatures.js';
import { PlanetFeaturesRenderer, PLANET_SKY_FEATURES } from './planetFeatures.js';

export class CanvasRenderer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');

    this.skyRenderer = new SkyRenderer();
    this.planetFeatures = new PlanetFeaturesRenderer();
    this.landscapeRenderer = new LandscapeRenderer();
    this.weatherEffects = new WeatherEffectsRenderer();
    this.creaturesRenderer = new CreaturesAndAnomaliesRenderer();

    this.width = 0;
    this.height = 0;
    this.dpr = window.devicePixelRatio || 1;

    this.currentParams = null;
    this.currentPhenomenon = null;
    this.currentBiome = BIOME_TYPES.MEGALOPOLIS;
    this.currentSkyFeature = PLANET_SKY_FEATURES.RINGS;

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

  triggerGravityRipple(x, y) {
    this.creaturesRenderer.addGravityRipple(x, y);
  }

  setBiome(biomeType, seed) {
    this.currentBiome = biomeType;
    this.landscapeRenderer.setBiome(biomeType, seed);
  }

  updateState(renderParams, phenomenonType, biomeType, seed, skyFeature) {
    this.currentParams = renderParams;
    this.currentPhenomenon = phenomenonType;
    this.currentSkyFeature = skyFeature || PLANET_SKY_FEATURES.RINGS;

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

    // 1. Base Sky Gradient & Stars
    this.skyRenderer.render(this.ctx, this.width, this.height, time, this.currentParams);

    // 2. Cosmic Planet Sky Features (Planetary Rings, Gas Giants, Binary Suns, Pulsars)
    this.planetFeatures.render(
      this.ctx, 
      this.width, 
      this.height, 
      time, 
      this.currentSkyFeature, 
      this.currentParams.skyHue, 
      this.currentParams.isDay
    );

    // 3. Celestial Creatures & Anomalies (Leviathans, Meteors, Skiffs)
    this.creaturesRenderer.render(this.ctx, this.width, this.height, time, this.currentParams);

    // 4. Multi-Biome Landscape Layer
    this.landscapeRenderer.render(this.ctx, this.width, this.height, time, this.currentParams);

    // 5. Weather Phenomenon Particles
    this.weatherEffects.render(this.ctx, this.width, this.height, time, this.currentParams, this.currentPhenomenon);
  }
}
