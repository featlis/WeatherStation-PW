/**
 * PlanetFeaturesRenderer
 * Renders cosmic & planetary celestial sky features:
 * 1. Giant Planetary Rings (Saturn-like luminous cosmic rings)
 * 2. Gas Giant Backdrop (空に浮かぶ巨大ガス惑星)
 * 3. Binary Star System (連星系・二重恒星)
 * 4. Pulsar Light Sweeps & Dark Nebular Rifts
 */

export const PLANET_SKY_FEATURES = {
  RINGS: 'RINGS',
  GAS_GIANT: 'GAS_GIANT',
  BINARY_SUNS: 'BINARY_SUNS',
  PULSAR: 'PULSAR',
  DEEP_NEBULA: 'DEEP_NEBULA'
};

export class PlanetFeaturesRenderer {
  constructor() {
    this.ringAngle = Math.PI / 5;
  }

  render(ctx, width, height, time, skyFeature, skyHue, isDay) {
    if (!skyFeature) return;

    ctx.save();
    switch (skyFeature) {
      case PLANET_SKY_FEATURES.RINGS:
        this.renderPlanetaryRings(ctx, width, height, time, skyHue, isDay);
        break;
      case PLANET_SKY_FEATURES.GAS_GIANT:
        this.renderGasGiant(ctx, width, height, time, skyHue);
        break;
      case PLANET_SKY_FEATURES.BINARY_SUNS:
        this.renderBinarySuns(ctx, width, height, time, skyHue, isDay);
        break;
      case PLANET_SKY_FEATURES.PULSAR:
        this.renderPulsar(ctx, width, height, time, skyHue);
        break;
      case PLANET_SKY_FEATURES.DEEP_NEBULA:
      default:
        this.renderDeepNebula(ctx, width, height, time, skyHue);
        break;
    }
    ctx.restore();
  }

  // =========================================================================
  // 1. GIANT PLANETARY RINGS (巨大惑星リング)
  // =========================================================================
  renderPlanetaryRings(ctx, width, height, time, skyHue, isDay) {
    const cx = width * 0.45;
    const cy = height * 0.28;
    const rx = width * 0.65;
    const ry = height * 0.16;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-Math.PI / 7);

    // Multi-band luminous rings
    const ringBands = [
      { rRatio: 0.78, w: 12, alpha: 0.35, color: '#00f0ff' },
      { rRatio: 0.86, w: 24, alpha: 0.55, color: '#e0f2fe' },
      { rRatio: 0.94, w: 8,  alpha: 0.25, color: '#a855f7' },
      { rRatio: 1.02, w: 18, alpha: 0.45, color: '#00ffb2' }
    ];

    for (const b of ringBands) {
      ctx.strokeStyle = b.color;
      ctx.globalAlpha = isDay ? b.alpha * 0.5 : b.alpha * 0.85;
      ctx.lineWidth = b.w;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 10;

      ctx.beginPath();
      ctx.ellipse(0, 0, rx * b.rRatio, ry * b.rRatio, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // =========================================================================
  // 2. GAS GIANT IN SKY (空に浮かぶ巨大縞模様ガス惑星)
  // =========================================================================
  renderGasGiant(ctx, width, height, time, skyHue) {
    const cx = width * 0.22;
    const cy = height * 0.24;
    const radius = 68;

    ctx.save();
    // Atmospheric Corona Glow
    const glow = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 1.6);
    glow.addColorStop(0, 'rgba(168, 85, 247, 0.4)');
    glow.addColorStop(0.5, 'rgba(0, 240, 255, 0.15)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.6, 0, Math.PI * 2);
    ctx.fill();

    // Planet Disc Clip
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();

    // Gas Giant Bands Gradient
    const planetGrad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
    planetGrad.addColorStop(0, '#1e1b4b');
    planetGrad.addColorStop(0.3, '#312e81');
    planetGrad.addColorStop(0.5, '#4338ca');
    planetGrad.addColorStop(0.7, '#6366f1');
    planetGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = planetGrad;
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

    // Dynamic Swirling Atmosphere Bands
    ctx.globalAlpha = 0.35;
    for (let i = -radius; i <= radius; i += 10) {
      ctx.fillStyle = i % 20 === 0 ? '#00f0ff' : '#f43f5e';
      ctx.fillRect(cx - radius, cy + i + Math.sin(time * 0.001 + i) * 3, radius * 2, 6);
    }
    ctx.restore();

    // Small orbiting moon
    const moonAngle = time * 0.0006;
    const mx = cx + Math.cos(moonAngle) * (radius * 1.4);
    const my = cy + Math.sin(moonAngle) * (radius * 0.4);
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(mx, my, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // =========================================================================
  // 3. BINARY SUNS (連星系・二重恒星)
  // =========================================================================
  renderBinarySuns(ctx, width, height, time, skyHue, isDay) {
    const s1x = width * 0.72;
    const s1y = height * 0.22;
    const s2x = width * 0.82;
    const s2y = height * 0.28;

    // Primary Solar Gold Sun
    const g1 = ctx.createRadialGradient(s1x, s1y, 5, s1x, s1y, 110);
    g1.addColorStop(0, '#fff');
    g1.addColorStop(0.2, '#fde047');
    g1.addColorStop(0.6, 'rgba(249, 115, 22, 0.2)');
    g1.addColorStop(1, 'transparent');
    ctx.fillStyle = g1;
    ctx.beginPath();
    ctx.arc(s1x, s1y, 110, 0, Math.PI * 2);
    ctx.fill();

    // Secondary Cyan/Violet Dwarf Sun
    const g2 = ctx.createRadialGradient(s2x, s2y, 3, s2x, s2y, 75);
    g2.addColorStop(0, '#fff');
    g2.addColorStop(0.2, '#38bdf8');
    g2.addColorStop(0.6, 'rgba(168, 85, 247, 0.25)');
    g2.addColorStop(1, 'transparent');
    ctx.fillStyle = g2;
    ctx.beginPath();
    ctx.arc(s2x, s2y, 75, 0, Math.PI * 2);
    ctx.fill();
  }

  // =========================================================================
  // 4. PULSAR (パルサー光線)
  // =========================================================================
  renderPulsar(ctx, width, height, time, skyHue) {
    const px = width * 0.84;
    const py = height * 0.16;
    const pulseAngle = time * 0.003;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(pulseAngle);

    // Opposing energetic beam rays
    const beamGrad = ctx.createLinearGradient(-width * 0.4, 0, width * 0.4, 0);
    beamGrad.addColorStop(0, 'transparent');
    beamGrad.addColorStop(0.45, 'rgba(0, 240, 255, 0.6)');
    beamGrad.addColorStop(0.5, '#fff');
    beamGrad.addColorStop(0.55, 'rgba(0, 240, 255, 0.6)');
    beamGrad.addColorStop(1, 'transparent');

    ctx.fillStyle = beamGrad;
    ctx.fillRect(-width * 0.4, -4, width * 0.8, 8);

    // Core Star
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // =========================================================================
  // 5. DEEP COSMIC NEBULA RIFTS (深宇宙星雲帯)
  // =========================================================================
  renderDeepNebula(ctx, width, height, time, skyHue) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const cx = width * 0.5;
    const cy = height * 0.3;

    const nebGrad = ctx.createRadialGradient(cx, cy, 40, cx, cy, width * 0.6);
    nebGrad.addColorStop(0, `hsla(${skyHue + 60}, 85%, 65%, 0.18)`);
    nebGrad.addColorStop(0.5, `hsla(${skyHue - 40}, 80%, 50%, 0.08)`);
    nebGrad.addColorStop(1, 'transparent');

    ctx.fillStyle = nebGrad;
    ctx.fillRect(0, 0, width, height * 0.7);
    ctx.restore();
  }
}
