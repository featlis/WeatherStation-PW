/**
 * CanvasRenderer
 * Master 60fps rendering coordinator with 16 Biomes, Cosmic Planet Features,
 * Celestial Wildlife, Weather Phenomena, and 2.5D Interactive Parallax.
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

    // Smooth Mouse 2.5D Parallax
    this.targetPx = 0;
    this.targetPy = 0;
    this.px = 0;
    this.py = 0;

    this.isRunning = false;
    this.startTime = performance.now();

    this.handleResize = this.handleResize.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.animate = this.animate.bind(this);

    window.addEventListener('resize', this.handleResize);
    window.addEventListener('pointermove', this.handleMouseMove);
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
      this.weatherEffects.initParticles(this.currentParams.particleCount || 120, this.width, this.height);
    }
  }

  handleMouseMove(e) {
    // Normalized offset [-1..1]
    const nx = (e.clientX / this.width) * 2 - 1;
    const ny = (e.clientY / this.height) * 2 - 1;
    this.targetPx = nx;
    this.targetPy = ny;
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
      this.weatherEffects.initParticles(renderParams.particleCount || 120, this.width, this.height);
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

    // Smooth Lerp for Parallax
    this.px += (this.targetPx - this.px) * 0.05;
    this.py += (this.targetPy - this.py) * 0.05;

    if (this.currentParams && this.currentPhenomenon) {
      this.renderFrame(time);
    }

    requestAnimationFrame(this.animate);
  }

  renderFrame(time) {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Base Sky Gradient, Volumetric Nebulae & Stars
    this.skyRenderer.render(
      this.ctx, 
      this.width, 
      this.height, 
      time, 
      this.currentParams, 
      this.px, 
      this.py
    );

    // 2. Cosmic Planet Sky Features (Planetary Rings, Gas Giants, Binary Suns, Pulsars)
    this.planetFeatures.render(
      this.ctx, 
      this.width, 
      this.height, 
      time, 
      this.currentSkyFeature, 
      this.currentParams.skyHue, 
      this.currentParams.isDay, 
      this.px, 
      this.py
    );

    // 3. Celestial Creatures & Anomalies (Leviathans, Meteors, Skiffs)
    this.creaturesRenderer.render(
      this.ctx, 
      this.width, 
      this.height, 
      time, 
      this.currentParams, 
      this.px, 
      this.py
    );

    // 4. Multi-Biome Landscape Layer with Parallax Depth
    this.landscapeRenderer.render(
      this.ctx, 
      this.width, 
      this.height, 
      time, 
      this.currentParams, 
      this.px, 
      this.py
    );

    // 5. Weather Phenomenon Particles (Spore Rain, Crystals, Arcs, Mist)
    this.weatherEffects.render(
      this.ctx, 
      this.width, 
      this.height, 
      time, 
      this.currentParams, 
      this.currentPhenomenon
    );
  }
}
