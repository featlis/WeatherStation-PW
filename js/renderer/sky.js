/**
 * SkyRenderer
 * Renders celestial backgrounds, starfields, nebulae, dynamic moon phase bodies, and auroras
 */

export class SkyRenderer {
  constructor() {
    this.stars = [];
    this.initStars(180);
    this.auroraTime = 0;
  }

  initStars(count) {
    this.stars = [];
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random(),
        y: Math.random() * 0.85,
        size: Math.random() * 1.8 + 0.4,
        baseAlpha: Math.random() * 0.6 + 0.3,
        twinkleSpeed: Math.random() * 0.04 + 0.01,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  /**
   * Calculate exact lunar phase [0..1] (0: New Moon, 0.5: Full Moon, 1.0: New Moon)
   */
  getMoonPhase() {
    const now = new Date();
    // Known reference new moon: 2000-01-06 18:14 UTC
    const refNewMoon = new Date('2000-01-06T18:14:00Z').getTime();
    const synodicMonth = 29.53058867 * 86400000;
    const diff = now.getTime() - refNewMoon;
    return (diff % synodicMonth) / synodicMonth;
  }

  render(ctx, width, height, time, params) {
    const { skyHue, skySaturation, skyLightness, isDay, windSpeed, temperature } = params;

    // 1. Deep Space Cosmic Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    if (isDay) {
      skyGrad.addColorStop(0, `hsl(${skyHue}, ${skySaturation}%, ${skyLightness}%)`);
      skyGrad.addColorStop(0.5, `hsl(${skyHue + 20}, ${skySaturation - 10}%, ${skyLightness + 8}%)`);
      skyGrad.addColorStop(1, `hsl(${skyHue - 15}, ${skySaturation + 15}%, ${skyLightness + 18}%)`);
    } else {
      skyGrad.addColorStop(0, `hsl(${skyHue}, ${skySaturation + 20}%, 3%)`);
      skyGrad.addColorStop(0.6, `hsl(${skyHue + 25}, ${skySaturation}%, 7%)`);
      skyGrad.addColorStop(1, `hsl(${skyHue + 40}, ${skySaturation - 15}%, 12%)`);
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Stars
    const starAlphaMultiplier = isDay ? 0.35 : 0.95;
    ctx.save();
    for (const star of this.stars) {
      const alpha = star.baseAlpha * (0.6 + 0.4 * Math.sin(time * star.twinkleSpeed + star.phase)) * starAlphaMultiplier;
      ctx.fillStyle = `rgba(235, 245, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(star.x * width, star.y * height, star.size, 0, Math.PI * 2);
      ctx.fill();

      if (star.size > 1.6 && !isDay) {
        ctx.strokeStyle = `rgba(180, 230, 255, ${alpha * 0.4})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(star.x * width - 4, star.y * height);
        ctx.lineTo(star.x * width + 4, star.y * height);
        ctx.moveTo(star.x * width, star.y * height - 4);
        ctx.lineTo(star.x * width, star.y * height + 4);
        ctx.stroke();
      }
    }
    ctx.restore();

    // 3. Celestial Bodies (Moon Phase & Twin Moons / Solar Ring)
    this.renderCelestialBodies(ctx, width, height, time, isDay, skyHue);

    // 4. Dynamic Auroral Ribbons
    this.renderAuroras(ctx, width, height, time, windSpeed, temperature, skyHue);
  }

  renderCelestialBodies(ctx, width, height, time, isDay, skyHue) {
    ctx.save();
    const cx = width * 0.72;
    const cy = height * 0.26;
    const phase = this.getMoonPhase();

    if (isDay) {
      // Celestial Solar Ring / Corona
      const sunGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 160);
      sunGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      sunGrad.addColorStop(0.2, 'rgba(255, 230, 160, 0.6)');
      sunGrad.addColorStop(0.6, 'rgba(0, 240, 255, 0.15)');
      sunGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 160, 0, Math.PI * 2);
      ctx.fill();

      // Sharp Inner Solar Core with Golden Ring
      ctx.strokeStyle = 'rgba(255, 240, 200, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 28, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Primary Astral Moon with Real-time Lunar Phase
      const moonGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 100);
      moonGrad.addColorStop(0, 'rgba(0, 240, 255, 0.3)');
      moonGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.12)');
      moonGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = moonGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 100, 0, Math.PI * 2);
      ctx.fill();

      const moonRadius = 34;

      // Full Moon Base
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.arc(cx, cy, moonRadius, 0, Math.PI * 2);
      ctx.fill();

      // Moon Phase Mask Calculation
      // 0: New Moon (full mask), 0.25: First Quarter, 0.5: Full Moon (no mask), 0.75: Last Quarter
      const maskOffset = (phase <= 0.5 ? (0.5 - phase) * 2 : (phase - 0.5) * 2) * (moonRadius * 1.5);
      if (maskOffset > 2) {
        ctx.fillStyle = `hsl(${skyHue}, 60%, 5%)`;
        ctx.beginPath();
        ctx.arc(cx + (phase < 0.5 ? maskOffset : -maskOffset), cy, moonRadius * 0.95, 0, Math.PI * 2);
        ctx.fill();
      }

      // Glowing outer rim
      ctx.strokeStyle = 'rgba(200, 235, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, moonRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Secondary Distant Violet Moon
      const m2x = width * 0.28;
      const m2y = height * 0.18;
      ctx.fillStyle = 'rgba(192, 132, 252, 0.85)';
      ctx.beginPath();
      ctx.arc(m2x, m2y, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(192, 132, 252, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(m2x, m2y, 24, 7, Math.PI / 6, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  renderAuroras(ctx, width, height, time, windSpeed, temperature, skyHue) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    this.auroraTime += 0.008 + (windSpeed * 0.0003);

    const auroraCount = 3;
    for (let j = 0; j < auroraCount; j++) {
      ctx.beginPath();
      const baseHeight = height * (0.2 + j * 0.1);
      const points = 24;
      const step = width / points;

      ctx.moveTo(0, baseHeight);
      for (let i = 0; i <= points; i++) {
        const x = i * step;
        const wave1 = Math.sin(i * 0.4 + this.auroraTime * 1.5 + j * 2.0) * 35;
        const wave2 = Math.cos(i * 0.25 - this.auroraTime * 0.8 + j) * 20;
        const y = baseHeight + wave1 + wave2;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, 0);
      ctx.lineTo(0, 0);
      ctx.closePath();

      const auroraGrad = ctx.createLinearGradient(0, baseHeight - 60, 0, baseHeight + 50);
      const alpha = 0.18 - j * 0.04;
      auroraGrad.addColorStop(0, `rgba(0, 240, 255, 0)`);
      auroraGrad.addColorStop(0.4, `hsla(${skyHue + 40 + j * 30}, 90%, 65%, ${alpha})`);
      auroraGrad.addColorStop(1, `rgba(0, 255, 178, 0)`);

      ctx.fillStyle = auroraGrad;
      ctx.fill();
    }
    ctx.restore();
  }
}
