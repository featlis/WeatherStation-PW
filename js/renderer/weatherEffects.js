/**
 * WeatherEffectsRenderer
 * Renders atmospheric phenomena:
 * 1. Spore Rain (Cyan glowing particle streaks with ground splash sparks)
 * 2. Zero-G Prism Crystals (Rotating 3D faceted snowflakes)
 * 3. Quantum Arc Resonance (Recursive fractal lightning with sky flash)
 * 4. Astral Ether Mist (Sinusoidal rolling volumetric fog banks)
 * 5. Solar God Rays & Starlight Dust
 */

import { PHENOMENON_TYPES } from '../converter.js';

export class WeatherEffectsRenderer {
  constructor() {
    this.particles = [];
    this.splashes = [];
    this.lightningArcs = [];
    this.lightningFlash = 0;
    this.lastLightningTime = 0;
    this.splashCallback = null;
  }

  setSplashCallback(cb) {
    this.splashCallback = cb;
  }

  initParticles(count, width, height) {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: Math.random() * 2 + 1,
        size: Math.random() * 2.5 + 1.2,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.04,
        alpha: Math.random() * 0.6 + 0.4
      });
    }
  }

  render(ctx, width, height, time, params, phenomenonType) {
    switch (phenomenonType) {
      case PHENOMENON_TYPES.RAIN:
        this.renderSporeRain(ctx, width, height, time, params);
        break;
      case PHENOMENON_TYPES.SNOW:
        this.renderPrismSnow(ctx, width, height, time, params);
        break;
      case PHENOMENON_TYPES.THUNDER:
        this.renderThunderstorm(ctx, width, height, time, params);
        break;
      case PHENOMENON_TYPES.FOG:
        this.renderEtherMist(ctx, width, height, time, params);
        break;
      case PHENOMENON_TYPES.CLOUDS:
        this.renderNebulaVeil(ctx, width, height, time, params);
        break;
      case PHENOMENON_TYPES.CLEAR:
      default:
        this.renderSolarMotes(ctx, width, height, time, params);
        break;
    }

    // Always render active ground splashes
    this.renderSplashes(ctx);
  }

  // =========================================================================
  // 1. SPORE RAIN (蒼光星屑雨)
  // =========================================================================
  renderSporeRain(ctx, width, height, time, params) {
    const { windSpeed, particleSpeed } = params;
    const windAngle = (windSpeed * 0.04);
    const groundY = height * 0.94;

    ctx.save();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.75)';
    ctx.lineWidth = 1.4;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 6;

    for (const p of this.particles) {
      p.y += (12 + particleSpeed * 4) * p.speed;
      p.x += Math.sin(windAngle) * (10 + particleSpeed * 3);

      if (p.x > width + 50) p.x = -50;
      if (p.x < -50) p.x = width + 50;

      // Ground impact
      if (p.y >= groundY) {
        if (this.splashes.length < 35) {
          this.splashes.push({
            x: p.x,
            y: groundY,
            r: 2,
            maxR: 18 + Math.random() * 12,
            alpha: 0.9
          });
          if (this.splashCallback && Math.random() < 0.25) {
            this.splashCallback(0.4);
          }
        }
        p.y = -20;
        p.x = Math.random() * width;
      }

      const streakLen = 18 + particleSpeed * 6;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - Math.sin(windAngle) * streakLen, p.y - streakLen);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // =========================================================================
  // 2. PRISM SNOW (反重力結晶)
  // =========================================================================
  renderPrismSnow(ctx, width, height, time, params) {
    const { windSpeed } = params;

    ctx.save();
    for (const p of this.particles) {
      p.y += (1.2 + Math.sin(time * 0.001 + p.x) * 0.6);
      p.x += Math.sin(time * 0.0015 + p.y * 0.01) * 1.5 + (windSpeed * 0.06);
      p.rot += p.rotSpeed;

      if (p.y > height + 20) {
        p.y = -20;
        p.x = Math.random() * width;
      }
      if (p.x > width + 20) p.x = -20;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);

      // Rotating Crystalline Diamond
      ctx.fillStyle = 'rgba(224, 242, 254, 0.85)';
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.9)';
      ctx.lineWidth = 1;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 8;

      ctx.beginPath();
      ctx.moveTo(0, -p.size * 3);
      ctx.lineTo(p.size * 2, 0);
      ctx.lineTo(0, p.size * 3);
      ctx.lineTo(-p.size * 2, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }
    ctx.restore();
  }

  // =========================================================================
  // 3. THUNDERSTORM / QUANTUM ARCS (量子共鳴放電)
  // =========================================================================
  renderThunderstorm(ctx, width, height, time, params) {
    // Also render rain
    this.renderSporeRain(ctx, width, height, time, params);

    // Occasional Blinding Quantum Arc Flash
    if (time - this.lastLightningTime > 4500 && Math.random() < 0.35) {
      this.lastLightningTime = time;
      this.lightningFlash = 0.85;

      // Generate Fractal Lightning Arc
      const startX = width * (0.2 + Math.random() * 0.6);
      const arc = [{ x: startX, y: 0 }];
      let curX = startX;
      let curY = 0;

      while (curY < height * 0.88) {
        curY += 20 + Math.random() * 25;
        curX += (Math.random() - 0.5) * 60;
        arc.push({ x: curX, y: curY });
      }
      this.lightningArcs.push({ points: arc, alpha: 1.0 });
    }

    // Sky Flash
    if (this.lightningFlash > 0.01) {
      ctx.save();
      ctx.fillStyle = `rgba(168, 85, 247, ${this.lightningFlash * 0.35})`;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
      this.lightningFlash *= 0.85;
    }

    // Render Arcs
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = this.lightningArcs.length - 1; i >= 0; i--) {
      const arc = this.lightningArcs[i];
      arc.alpha -= 0.08;
      if (arc.alpha <= 0) {
        this.lightningArcs.splice(i, 1);
        continue;
      }

      ctx.strokeStyle = `rgba(255, 255, 255, ${arc.alpha})`;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 16;

      ctx.beginPath();
      ctx.moveTo(arc.points[0].x, arc.points[0].y);
      for (let p = 1; p < arc.points.length; p++) {
        ctx.lineTo(arc.points[p].x, arc.points[p].y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  // =========================================================================
  // 4. ETHER MIST (深幽霊霧)
  // =========================================================================
  renderEtherMist(ctx, width, height, time, params) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    for (let l = 0; l < 3; l++) {
      const mistY = height * (0.65 + l * 0.1);
      const grad = ctx.createLinearGradient(0, mistY - 60, 0, mistY + 60);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0)');
      grad.addColorStop(0.5, 'rgba(168, 85, 247, 0.22)');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, mistY);

      for (let x = 0; x <= width; x += 30) {
        const y = mistY + Math.sin(x * 0.003 + time * 0.0008 + l) * 25;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  // =========================================================================
  // 5. NEBULA VEIL (霊脈星雲)
  // =========================================================================
  renderNebulaVeil(ctx, width, height, time, params) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    const veilGrad = ctx.createRadialGradient(width * 0.5, height * 0.35, 40, width * 0.5, height * 0.35, width * 0.6);
    veilGrad.addColorStop(0, 'rgba(168, 85, 247, 0.28)');
    veilGrad.addColorStop(0.5, 'rgba(0, 240, 255, 0.16)');
    veilGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = veilGrad;
    ctx.fillRect(0, 0, width, height * 0.7);
    ctx.restore();
  }

  // =========================================================================
  // 6. SOLAR MOTES & GOD RAYS (星環光芒・陽炎)
  // =========================================================================
  renderSolarMotes(ctx, width, height, time, params) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    for (const p of this.particles) {
      p.y += Math.sin(time * 0.001 + p.x) * 0.4 - 0.2;
      p.x += Math.cos(time * 0.001 + p.y) * 0.4;

      if (p.y < 0) p.y = height;
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;

      const alpha = 0.3 + 0.3 * Math.sin(time * 0.002 + p.x);
      ctx.fillStyle = `rgba(255, 240, 200, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  renderSplashes(ctx) {
    if (this.splashes.length === 0) return;
    ctx.save();
    for (let i = this.splashes.length - 1; i >= 0; i--) {
      const s = this.splashes[i];
      s.r += 1.2;
      s.alpha -= 0.06;

      if (s.alpha <= 0 || s.r >= s.maxR) {
        this.splashes.splice(i, 1);
        continue;
      }

      ctx.strokeStyle = `rgba(0, 240, 255, ${s.alpha})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(s.x, s.y, s.r, s.r * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
}
