/**
 * WeatherEffectsRenderer
 * Particle system for bioluminescent rain spores, zero-G prism snow, lightning arcs, and fog
 */

import { PHENOMENON_TYPES } from '../converter.js';

export class WeatherEffectsRenderer {
  constructor() {
    this.particles = [];
    this.splashes = [];
    this.lightningArcs = [];
    this.lastLightning = 0;
    this.onSplashCallback = null; // Connected to AudioSynthesizer chime
  }

  setSplashCallback(cb) {
    this.onSplashCallback = cb;
  }

  initParticles(count, width, height) {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle(width, height, true));
    }
  }

  createParticle(width, height, randomizeY = false) {
    return {
      x: Math.random() * width,
      y: randomizeY ? Math.random() * height : -20,
      size: Math.random() * 2.5 + 1.2,
      speedY: Math.random() * 2.5 + 2.0,
      speedX: (Math.random() - 0.5) * 0.8,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.05,
      alpha: Math.random() * 0.7 + 0.3,
      life: 1.0,
      prismSides: Math.floor(Math.random() * 3) + 3 // 3, 4, 5-sided crystals
    };
  }

  render(ctx, width, height, time, params, phenomenonType) {
    const { particleCount, windSpeed, accentColor } = params;

    // Ensure particle count matches density
    if (this.particles.length < particleCount) {
      this.particles.push(this.createParticle(width, height));
    } else if (this.particles.length > particleCount) {
      this.particles.pop();
    }

    ctx.save();

    // 1. Render Specific Phenomena
    switch (phenomenonType) {
      case PHENOMENON_TYPES.RAIN:
        this.renderRainSpores(ctx, width, height, time, windSpeed, accentColor);
        break;
      case PHENOMENON_TYPES.SNOW:
        this.renderZeroGPrisms(ctx, width, height, time, windSpeed, accentColor);
        break;
      case PHENOMENON_TYPES.THUNDER:
        this.renderThunderstorm(ctx, width, height, time, windSpeed, accentColor);
        break;
      case PHENOMENON_TYPES.CLOUDS:
      case PHENOMENON_TYPES.FOG:
        this.renderEtherMist(ctx, width, height, time, accentColor);
        break;
      case PHENOMENON_TYPES.CLEAR:
      default:
        this.renderSolarWindRibbons(ctx, width, height, time, windSpeed, accentColor);
        break;
    }

    // 2. Render and Update Splash Waves
    this.renderSplashes(ctx, width, height, accentColor);

    ctx.restore();
  }

  // --- Rain: Bioluminescent Cyan Spores ---
  renderRainSpores(ctx, width, height, time, windSpeed, accentColor) {
    const windDrift = (windSpeed * 0.18);
    const horizonY = height * 0.94;

    ctx.lineWidth = 1.6;
    ctx.shadowBlur = 8;
    ctx.shadowColor = accentColor;

    for (const p of this.particles) {
      p.y += p.speedY * 2.6;
      p.x += p.speedX + windDrift;

      // Draw glowing streak
      const tailLen = p.speedY * 5;
      const grad = ctx.createLinearGradient(p.x, p.y, p.x - windDrift * 2, p.y - tailLen);
      grad.addColorStop(0, accentColor);
      grad.addColorStop(1, 'rgba(0, 240, 255, 0)');

      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - windDrift * 2, p.y - tailLen);
      ctx.stroke();

      // Glowing tip
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
      ctx.fill();

      // Hit bottom horizon
      if (p.y >= horizonY) {
        if (Math.random() < 0.25) {
          this.createSplash(p.x, horizonY);
          if (this.onSplashCallback) this.onSplashCallback(0.7);
        }
        p.y = -10;
        p.x = Math.random() * width;
      }
      if (p.x > width + 50) p.x = -20;
    }
  }

  // --- Snow: Zero-Gravity Prism Crystals ---
  renderZeroGPrisms(ctx, width, height, time, windSpeed, accentColor) {
    const windDrift = (windSpeed * 0.08);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 1.2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00f0ff';

    for (const p of this.particles) {
      p.y += p.speedY * 0.45;
      p.x += p.speedX + windDrift + Math.sin(time * 0.002 + p.rotation) * 0.6;
      p.rotation += p.rotSpeed;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      // Draw rotating geometric prism shard
      ctx.fillStyle = 'rgba(0, 240, 255, 0.18)';
      ctx.beginPath();
      const r = p.size * 3.5;
      for (let i = 0; i < p.prismSides; i++) {
        const angle = (i / p.prismSides) * Math.PI * 2;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Center glowing nucleus
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(0, 0, 1.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      if (p.y > height + 20) {
        p.y = -20;
        p.x = Math.random() * width;
      }
      if (p.x > width + 40) p.x = -20;
    }
  }

  // --- Thunder: Quantum Arc Lightning ---
  renderThunderstorm(ctx, width, height, time, windSpeed, accentColor) {
    // First render heavy rain
    this.renderRainSpores(ctx, width, height, time, windSpeed, '#a855f7');

    // Trigger sporadic quantum lightning bolts
    if (time - this.lastLightning > 2400 && Math.random() < 0.035) {
      this.lastLightning = time;
      this.generateLightningArc(width, height);
    }

    // Render active lightning arcs
    for (let i = this.lightningArcs.length - 1; i >= 0; i--) {
      const arc = this.lightningArcs[i];
      arc.alpha -= 0.06;

      ctx.save();
      ctx.strokeStyle = `rgba(216, 180, 254, ${arc.alpha})`;
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 24;
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      for (let j = 0; j < arc.points.length; j++) {
        const pt = arc.points[j];
        if (j === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();

      // Screen flash
      if (arc.alpha > 0.7) {
        ctx.fillStyle = `rgba(168, 85, 247, ${arc.alpha * 0.15})`;
        ctx.fillRect(0, 0, width, height);
      }

      ctx.restore();

      if (arc.alpha <= 0) {
        this.lightningArcs.splice(i, 1);
      }
    }
  }

  generateLightningArc(width, height) {
    const startX = width * (0.3 + Math.random() * 0.4);
    const startY = 0;
    const endX = startX + (Math.random() - 0.5) * 300;
    const endY = height * (0.6 + Math.random() * 0.3);

    const points = [{ x: startX, y: startY }];
    const segments = 14;
    for (let i = 1; i < segments; i++) {
      const prog = i / segments;
      const x = startX + (endX - startX) * prog + (Math.random() - 0.5) * 50;
      const y = startY + (endY - startY) * prog + (Math.random() - 0.5) * 20;
      points.push({ x, y });
    }
    points.push({ x: endX, y: endY });

    this.lightningArcs.push({ points, alpha: 1.0 });
  }

  // --- Clouds / Mist: Gaseous Bioluminescent Ether ---
  renderEtherMist(ctx, width, height, time, accentColor) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (const p of this.particles) {
      p.x += Math.cos(time * 0.001 + p.y) * 0.4;
      p.y += Math.sin(time * 0.0008 + p.x) * 0.2;

      const grad = ctx.createRadialGradient(p.x, p.y, 4, p.x, p.y, p.size * 22);
      grad.addColorStop(0, 'rgba(0, 240, 255, 0.12)');
      grad.addColorStop(0.5, 'rgba(168, 85, 247, 0.05)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 22, 0, Math.PI * 2);
      ctx.fill();

      if (p.x > width + 100) p.x = -50;
      if (p.y > height + 100) p.y = -50;
    }
    ctx.restore();
  }

  // --- Clear: Solar Wind Streaming Ribbons ---
  renderSolarWindRibbons(ctx, width, height, time, windSpeed, accentColor) {
    ctx.save();
    for (const p of this.particles) {
      p.x += 1.2 + (windSpeed * 0.05);
      p.y += Math.sin(time * 0.0015 + p.x * 0.01) * 0.5;

      ctx.fillStyle = `rgba(255, 240, 200, ${p.alpha * 0.4})`;
      ctx.shadowColor = accentColor;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.75, 0, Math.PI * 2);
      ctx.fill();

      if (p.x > width + 20) {
        p.x = -20;
        p.y = Math.random() * height;
      }
    }
    ctx.restore();
  }

  createSplash(x, y) {
    this.splashes.push({
      x,
      y,
      radius: 2,
      maxRadius: Math.random() * 18 + 8,
      alpha: 0.8
    });
  }

  renderSplashes(ctx, width, height, accentColor) {
    ctx.save();
    for (let i = this.splashes.length - 1; i >= 0; i--) {
      const s = this.splashes[i];
      s.radius += 0.8;
      s.alpha -= 0.035;

      ctx.strokeStyle = `rgba(0, 240, 255, ${s.alpha})`;
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.ellipse(s.x, s.y, s.radius * 2, s.radius * 0.6, 0, 0, Math.PI * 2);
      ctx.stroke();

      if (s.alpha <= 0) {
        this.splashes.splice(i, 1);
      }
    }
    ctx.restore();
  }
}
