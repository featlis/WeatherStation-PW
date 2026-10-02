/**
 * SkyRenderer
 * Renders celestial backgrounds, multi-layer parallax starfields,
 * volumetric cosmic nebulae, photorealistic lunar phases, and striated auroras.
 */

export class SkyRenderer {
  constructor() {
    this.stars = [];
    this.nebulaClusters = [];
    this.initStars(240);
    this.initNebulae();
  }

  initStars(count) {
    this.stars = [];
    const spectralColors = ['#ffffff', '#e0f2fe', '#bae6fd', '#fef08a', '#fecdd3', '#ddd6fe'];

    for (let i = 0; i < count; i++) {
      const layer = i % 3; // 0: distant faint dust, 1: mid-field, 2: bright foreground
      this.stars.push({
        x: Math.random(),
        y: Math.random() * 0.88,
        size: layer === 2 ? (Math.random() * 1.5 + 1.2) : (layer === 1 ? (Math.random() * 0.9 + 0.6) : (Math.random() * 0.5 + 0.3)),
        baseAlpha: layer === 2 ? 0.9 : (layer === 1 ? 0.65 : 0.4),
        twinkleSpeed: Math.random() * 0.03 + 0.008,
        phase: Math.random() * Math.PI * 2,
        color: spectralColors[Math.floor(Math.random() * spectralColors.length)],
        layer,
        hasSpikes: layer === 2 && Math.random() < 0.45
      });
    }

    // Pre-calculate several constellation line pairs
    this.constellationLines = [];
    const brightStars = this.stars.filter(s => s.layer === 2);
    for (let i = 0; i < brightStars.length - 1; i += 2) {
      if (Math.random() < 0.6) {
        this.constellationLines.push([brightStars[i], brightStars[i + 1]]);
      }
    }
  }

  initNebulae() {
    this.nebulaClusters = [
      { relX: 0.25, relY: 0.22, r: 0.35, hueOffset: -25, sat: 80, lit: 25, speed: 0.00008, phase: 0 },
      { relX: 0.75, relY: 0.28, r: 0.42, hueOffset: 40,  sat: 85, lit: 20, speed: -0.00006, phase: 2 },
      { relX: 0.50, relY: 0.15, r: 0.30, hueOffset: 15,  sat: 90, lit: 18, speed: 0.00005, phase: 4 }
    ];
  }

  /**
   * Calculate exact lunar phase [0..1] (0: New Moon, 0.5: Full Moon, 1.0: New Moon)
   */
  getMoonPhase() {
    const now = new Date();
    const refNewMoon = new Date('2000-01-06T18:14:00Z').getTime();
    const synodicMonth = 29.53058867 * 86400000;
    const diff = now.getTime() - refNewMoon;
    return (diff % synodicMonth) / synodicMonth;
  }

  render(ctx, width, height, time, params, parallaxX = 0, parallaxY = 0) {
    const { skyHue, skySaturation, skyLightness, isDay, windSpeed, temperature } = params;

    // 1. Deep Space Atmospheric Gradient with Horizon Glow
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    if (isDay) {
      skyGrad.addColorStop(0, `hsl(${skyHue}, ${skySaturation}%, ${skyLightness}%)`);
      skyGrad.addColorStop(0.45, `hsl(${skyHue + 15}, ${skySaturation - 5}%, ${skyLightness + 10}%)`);
      skyGrad.addColorStop(0.85, `hsl(${skyHue + 35}, ${skySaturation + 15}%, ${skyLightness + 22}%)`);
      skyGrad.addColorStop(1, `hsl(${skyHue - 10}, ${skySaturation + 25}%, ${skyLightness + 30}%)`);
    } else {
      skyGrad.addColorStop(0, `hsl(${skyHue}, ${skySaturation + 25}%, 2.5%)`);
      skyGrad.addColorStop(0.5, `hsl(${skyHue + 20}, ${skySaturation + 15}%, 5.5%)`);
      skyGrad.addColorStop(0.85, `hsl(${skyHue + 35}, ${skySaturation + 10}%, 11%)`);
      skyGrad.addColorStop(1, `hsl(${skyHue + 50}, ${skySaturation + 20}%, 16%)`);
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Volumetric Cosmic Nebulae (Screen blending)
    this.renderNebulae(ctx, width, height, time, skyHue, isDay);

    // 3. Multi-Layer Parallax Starfield & Constellations
    this.renderStars(ctx, width, height, time, isDay, parallaxX, parallaxY);

    // 4. Photorealistic Lunar Bodies or Solar Corona Ring
    this.renderCelestialBodies(ctx, width, height, time, isDay, skyHue, parallaxX, parallaxY);

    // 5. Dynamic Striated Auroral Curtains
    this.renderAuroras(ctx, width, height, time, windSpeed, temperature, skyHue);

    // 6. Horizon Atmospheric Rim Glow
    this.renderHorizonHaze(ctx, width, height, isDay, skyHue);
  }

  renderNebulae(ctx, width, height, time, baseHue, isDay) {
    if (isDay) return; // Nebulae shine primarily in night / twilight
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    for (const neb of this.nebulaClusters) {
      const cx = (neb.relX + Math.sin(time * neb.speed + neb.phase) * 0.05) * width;
      const cy = (neb.relY + Math.cos(time * neb.speed * 0.8 + neb.phase) * 0.04) * height;
      const radius = neb.r * Math.min(width, height);
      const hue = (baseHue + neb.hueOffset + 360) % 360;

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      grad.addColorStop(0, `hsla(${hue}, ${neb.sat}%, ${neb.lit}%, 0.38)`);
      grad.addColorStop(0.45, `hsla(${hue + 15}, ${neb.sat - 10}%, ${neb.lit - 5}%, 0.16)`);
      grad.addColorStop(0.8, `hsla(${hue - 20}, ${neb.sat}%, ${neb.lit - 8}%, 0.04)`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  renderStars(ctx, width, height, time, isDay, px, py) {
    const starAlphaMultiplier = isDay ? 0.28 : 0.95;
    ctx.save();

    // Subtle faint constellation lines
    if (!isDay) {
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.08)';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([3, 4]);
      for (const [s1, s2] of this.constellationLines) {
        const x1 = (s1.x * width + px * 8);
        const y1 = (s1.y * height + py * 8);
        const x2 = (s2.x * width + px * 8);
        const y2 = (s2.y * height + py * 8);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // Stars
    for (const star of this.stars) {
      const layerOffset = (star.layer + 1) * 6;
      const sx = (star.x * width + px * layerOffset + width) % width;
      const sy = (star.y * height + py * layerOffset + height) % height;

      const twinkle = 0.65 + 0.35 * Math.sin(time * star.twinkleSpeed + star.phase);
      const alpha = star.baseAlpha * twinkle * starAlphaMultiplier;

      ctx.fillStyle = star.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
      ctx.fill();

      // 4-point cross diffraction spikes for prominent stars
      if (star.hasSpikes && !isDay && alpha > 0.45) {
        ctx.strokeStyle = star.color;
        ctx.lineWidth = 0.7;
        const spikeLen = star.size * 3.5;
        ctx.beginPath();
        ctx.moveTo(sx - spikeLen, sy);
        ctx.lineTo(sx + spikeLen, sy);
        ctx.moveTo(sx, sy - spikeLen);
        ctx.lineTo(sx, sy + spikeLen);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  renderCelestialBodies(ctx, width, height, time, isDay, skyHue, px, py) {
    ctx.save();
    const cx = width * 0.72 + px * 12;
    const cy = height * 0.24 + py * 12;
    const phase = this.getMoonPhase();

    if (isDay) {
      // Celestial Solar Ring / Corona
      const sunGrad = ctx.createRadialGradient(cx, cy, 12, cx, cy, 180);
      sunGrad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
      sunGrad.addColorStop(0.18, 'rgba(255, 235, 170, 0.65)');
      sunGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.2)');
      sunGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 180, 0, Math.PI * 2);
      ctx.fill();

      // Sharp Inner Solar Corona Disk with Golden Ring
      ctx.strokeStyle = 'rgba(255, 245, 215, 0.85)';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#fef08a';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(cx, cy, 32, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else {
      // Primary Astral Moon with Smooth Photorealistic Lunar Phase
      const moonGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 120);
      moonGrad.addColorStop(0, 'rgba(0, 240, 255, 0.25)');
      moonGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.12)');
      moonGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = moonGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 120, 0, Math.PI * 2);
      ctx.fill();

      const r = 36;

      // 1. Earthshine / Aethershine Dark Side Disc
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // 2. Illuminated Crescent / Gibbous using accurate clip
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();

      // Base bright lunar surface
      const moonSurfGrad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 5, cx, cy, r);
      moonSurfGrad.addColorStop(0, '#ffffff');
      moonSurfGrad.addColorStop(0.7, '#e2e8f0');
      moonSurfGrad.addColorStop(1, '#94a3b8');
      ctx.fillStyle = moonSurfGrad;

      // Terminator curve calculation
      const angle = (phase - 0.5) * Math.PI * 2;
      const k = Math.cos(angle);

      ctx.beginPath();
      if (phase <= 0.5) {
        // Waxing (Right side illuminated)
        ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, false);
        ctx.ellipse(cx, cy, Math.abs(k) * r, r, 0, Math.PI / 2, -Math.PI / 2, k < 0);
      } else {
        // Waning (Left side illuminated)
        ctx.arc(cx, cy, r, Math.PI / 2, -Math.PI / 2, false);
        ctx.ellipse(cx, cy, Math.abs(k) * r, r, 0, -Math.PI / 2, Math.PI / 2, k < 0);
      }
      ctx.closePath();
      ctx.fill();

      // Subtle Mare patterns on moon
      ctx.fillStyle = 'rgba(71, 85, 105, 0.22)';
      ctx.beginPath();
      ctx.arc(cx - 8, cy - 6, 9, 0, Math.PI * 2);
      ctx.arc(cx + 6, cy + 4, 12, 0, Math.PI * 2);
      ctx.arc(cx - 5, cy + 10, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Glowing outer rim
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.5)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // Secondary Distant Violet Moon
      const m2x = width * 0.26 + px * 6;
      const m2y = height * 0.18 + py * 6;
      const m2r = 16;
      const m2Grad = ctx.createRadialGradient(m2x, m2y, 2, m2x, m2y, m2r);
      m2Grad.addColorStop(0, '#e879f9');
      m2Grad.addColorStop(0.7, '#a855f7');
      m2Grad.addColorStop(1, '#4c1d95');
      ctx.fillStyle = m2Grad;
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(m2x, m2y, m2r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.restore();
  }

  renderAuroras(ctx, width, height, time, windSpeed = 10, temperature = 15, skyHue) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    const waveSpeed = 0.0008 + (windSpeed / 100) * 0.001;
    const waveAmp = 25 + Math.min(40, windSpeed * 0.8);
    const auroraY = height * 0.28;

    const curtains = [
      { color: 'rgba(0, 255, 178, 0.28)', yOffset: 0,   freq: 0.0022, phase: 0 },
      { color: 'rgba(0, 240, 255, 0.24)', yOffset: 15,  freq: 0.0035, phase: 1.8 },
      { color: 'rgba(168, 85, 247, 0.20)', yOffset: -10, freq: 0.0018, phase: 3.4 }
    ];

    for (const c of curtains) {
      ctx.fillStyle = c.color;
      ctx.beginPath();
      ctx.moveTo(0, auroraY + c.yOffset);

      for (let x = 0; x <= width; x += 16) {
        const y = auroraY + c.yOffset +
          Math.sin(x * c.freq + time * waveSpeed + c.phase) * waveAmp +
          Math.cos(x * 0.0012 + time * waveSpeed * 0.6) * (waveAmp * 0.5);
        ctx.lineTo(x, y);
      }

      ctx.lineTo(width, 0);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();

      // Striated vertical ray streaks
      ctx.strokeStyle = c.color;
      ctx.lineWidth = 2.5;
      for (let x = 20; x < width; x += 35) {
        const rayH = 40 + Math.sin(x * 0.04 + time * 0.002) * 30;
        const baseY = auroraY + c.yOffset + Math.sin(x * c.freq + time * waveSpeed + c.phase) * waveAmp;
        ctx.beginPath();
        ctx.moveTo(x, baseY);
        ctx.lineTo(x + 5, baseY - rayH);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  renderHorizonHaze(ctx, width, height, isDay, skyHue) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const hazeGrad = ctx.createLinearGradient(0, height * 0.72, 0, height);
    if (isDay) {
      hazeGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
      hazeGrad.addColorStop(1, 'rgba(125, 211, 252, 0.25)');
    } else {
      hazeGrad.addColorStop(0, 'rgba(0, 240, 255, 0)');
      hazeGrad.addColorStop(1, 'rgba(56, 189, 248, 0.12)');
    }
    ctx.fillStyle = hazeGrad;
    ctx.fillRect(0, height * 0.72, width, height * 0.28);
    ctx.restore();
  }
}
