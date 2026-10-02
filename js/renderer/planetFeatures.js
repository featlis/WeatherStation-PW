/**
 * PlanetFeaturesRenderer
 * Renders cosmic & planetary celestial sky features with high visual fidelity:
 * 1. Giant Planetary Rings (Saturn-like luminous rings with Cassini division & planet shadow)
 * 2. Gas Giant Backdrop (Multi-harmonic swirling storm bands, vortex eye, and orbiting moons)
 * 3. Binary Star System (Solar corona prominences, anamorphic lens flares, twin suns)
 * 4. Pulsar Magnetar (Sweeping relativistic particle beams, synchrotron shockwaves)
 * 5. Deep Cosmic Nebula Rift (Interstellar dust lanes & radiant star nurseries)
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
    this.ringAngle = -Math.PI / 6.5;
  }

  render(ctx, width, height, time, skyFeature, skyHue, isDay, px = 0, py = 0) {
    if (!skyFeature) return;

    ctx.save();
    switch (skyFeature) {
      case PLANET_SKY_FEATURES.RINGS:
        this.renderPlanetaryRings(ctx, width, height, time, skyHue, isDay, px, py);
        break;
      case PLANET_SKY_FEATURES.GAS_GIANT:
        this.renderGasGiant(ctx, width, height, time, skyHue, px, py);
        break;
      case PLANET_SKY_FEATURES.BINARY_SUNS:
        this.renderBinarySuns(ctx, width, height, time, skyHue, isDay, px, py);
        break;
      case PLANET_SKY_FEATURES.PULSAR:
        this.renderPulsar(ctx, width, height, time, skyHue, px, py);
        break;
      case PLANET_SKY_FEATURES.DEEP_NEBULA:
      default:
        this.renderDeepNebula(ctx, width, height, time, skyHue, px, py);
        break;
    }
    ctx.restore();
  }

  // =========================================================================
  // 1. GIANT PLANETARY RINGS (巨大惑星多層リング)
  // =========================================================================
  renderPlanetaryRings(ctx, width, height, time, skyHue, isDay, px, py) {
    const cx = width * 0.45 + px * 8;
    const cy = height * 0.28 + py * 8;
    const rx = width * 0.72;
    const ry = height * 0.16;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.ringAngle);

    // Multi-band realistic rings with Cassini Division
    const ringBands = [
      // Inner C-Ring (Crepe ring)
      { rMin: 0.65, rMax: 0.74, color: 'rgba(56, 189, 248, 0.15)', blur: 2 },
      // B-Ring (Dense, brilliant)
      { rMin: 0.75, rMax: 0.88, color: 'rgba(224, 242, 254, 0.55)', blur: 8 },
      // Cassini Division (Gap) is between 0.88 and 0.91
      // A-Ring (Outer structured band)
      { rMin: 0.91, rMax: 1.02, color: 'rgba(168, 85, 247, 0.38)', blur: 6 },
      // Outer F-Ring (Delicate luminous thread)
      { rMin: 1.05, rMax: 1.06, color: 'rgba(0, 255, 178, 0.75)', blur: 12 }
    ];

    for (const b of ringBands) {
      const midR = (b.rMin + b.rMax) * 0.5;
      const w = (b.rMax - b.rMin) * rx;

      ctx.strokeStyle = b.color;
      ctx.lineWidth = Math.max(1, w);
      ctx.shadowColor = b.color;
      ctx.shadowBlur = b.blur;

      ctx.beginPath();
      ctx.ellipse(0, 0, rx * midR, ry * midR, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Shadow cast by planet onto the rear section of the rings
    ctx.save();
    ctx.rotate(-this.ringAngle); // un-rotate for planet shadow
    const shadowGrad = ctx.createRadialGradient(0, 0, 20, 0, 0, 110);
    shadowGrad.addColorStop(0, 'rgba(3, 7, 18, 0.95)');
    shadowGrad.addColorStop(0.7, 'rgba(3, 7, 18, 0.65)');
    shadowGrad.addColorStop(1, 'rgba(3, 7, 18, 0)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 110, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  // =========================================================================
  // 2. GAS GIANT IN SKY (空に浮かぶ巨大縞模様ガス惑星)
  // =========================================================================
  renderGasGiant(ctx, width, height, time, skyHue, px, py) {
    const cx = width * 0.22 + px * 10;
    const cy = height * 0.25 + py * 10;
    const radius = 78;

    ctx.save();
    // Atmospheric Corona Rayleigh Glow
    const glow = ctx.createRadialGradient(cx, cy, radius * 0.85, cx, cy, radius * 1.8);
    glow.addColorStop(0, 'rgba(168, 85, 247, 0.45)');
    glow.addColorStop(0.4, 'rgba(0, 240, 255, 0.22)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Planet Disc Clip with 3D Spherical Shading
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();

    // Gas Giant Bands Gradient Base
    const planetGrad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
    planetGrad.addColorStop(0, '#1e1b4b');
    planetGrad.addColorStop(0.3, '#312e81');
    planetGrad.addColorStop(0.5, '#4338ca');
    planetGrad.addColorStop(0.7, '#6366f1');
    planetGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = planetGrad;
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

    // Multi-Harmonic Swirling Atmospheric Cloud Bands
    for (let i = -radius; i <= radius; i += 7) {
      const bandWave = Math.sin(time * 0.0008 + i * 0.15) * 4 + Math.cos(time * 0.0005 + i * 0.08) * 2;
      const isCyan = (i + 100) % 21 === 0;
      const isAmber = (i + 100) % 14 === 0;
      ctx.fillStyle = isCyan ? 'rgba(56, 189, 248, 0.4)' : (isAmber ? 'rgba(244, 63, 94, 0.35)' : 'rgba(255, 255, 255, 0.22)');
      ctx.fillRect(cx - radius, cy + i + bandWave, radius * 2, 4.5);
    }

    // Great Red/Cyan Storm Vortex Eye (Pulsing Cyclone)
    const stormX = cx + radius * 0.35;
    const stormY = cy + radius * 0.2 + Math.sin(time * 0.001) * 3;
    const stormGrad = ctx.createRadialGradient(stormX, stormY, 1, stormX, stormY, 14);
    stormGrad.addColorStop(0, '#00f0ff');
    stormGrad.addColorStop(0.5, '#a855f7');
    stormGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = stormGrad;
    ctx.beginPath();
    ctx.ellipse(stormX, stormY, 14, 8, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // 3D Spherical Limb Darkening (terminator shadow)
    const sphereShadow = ctx.createRadialGradient(cx - radius * 0.4, cy - radius * 0.4, radius * 0.2, cx, cy, radius);
    sphereShadow.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    sphereShadow.addColorStop(0.65, 'rgba(0, 0, 0, 0.15)');
    sphereShadow.addColorStop(0.9, 'rgba(3, 7, 18, 0.7)');
    sphereShadow.addColorStop(1, 'rgba(3, 7, 18, 0.95)');
    ctx.fillStyle = sphereShadow;
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

    ctx.restore(); // end planet disc clip

    // Glowing atmospheric edge ring
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    // 2 Natural Satellites with orbiting tracks
    const moons = [
      { rRatio: 1.55, speed: 0.0006, size: 5, color: '#e0f2fe', shadow: '#00f0ff' },
      { rRatio: 2.1, speed: -0.00035, size: 3.5, color: '#fbcfe8', shadow: '#f43f5e' }
    ];
    for (const m of moons) {
      const mAngle = time * m.speed;
      const mx = cx + Math.cos(mAngle) * (radius * m.rRatio);
      const my = cy + Math.sin(mAngle) * (radius * 0.35 * m.rRatio);

      ctx.fillStyle = m.color;
      ctx.shadowColor = m.shadow;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(mx, my, m.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // =========================================================================
  // 3. BINARY SUNS (連星系・二重恒星)
  // =========================================================================
  renderBinarySuns(ctx, width, height, time, skyHue, isDay, px, py) {
    const s1x = width * 0.72 + px * 12;
    const s1y = height * 0.22 + py * 12;
    const s2x = width * 0.83 + px * 10;
    const s2y = height * 0.28 + py * 10;

    ctx.save();

    // Primary Solar Gold Sun
    const g1 = ctx.createRadialGradient(s1x, s1y, 8, s1x, s1y, 140);
    g1.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
    g1.addColorStop(0.2, 'rgba(251, 191, 36, 0.8)');
    g1.addColorStop(0.5, 'rgba(245, 158, 11, 0.25)');
    g1.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g1;
    ctx.beginPath();
    ctx.arc(s1x, s1y, 140, 0, Math.PI * 2);
    ctx.fill();

    // Solar Prominence Filaments
    ctx.strokeStyle = 'rgba(251, 146, 60, 0.6)';
    ctx.lineWidth = 1.8;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      const flareLen = 22 + Math.sin(time * 0.003 + a * 3) * 10;
      ctx.beginPath();
      ctx.moveTo(s1x + Math.cos(a) * 24, s1y + Math.sin(a) * 24);
      ctx.lineTo(s1x + Math.cos(a) * (24 + flareLen), s1y + Math.sin(a) * (24 + flareLen));
      ctx.stroke();
    }

    // Companion Violet Star (Smaller, high temperature)
    const g2 = ctx.createRadialGradient(s2x, s2y, 4, s2x, s2y, 80);
    g2.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    g2.addColorStop(0.25, 'rgba(192, 132, 252, 0.85)');
    g2.addColorStop(0.6, 'rgba(168, 85, 247, 0.25)');
    g2.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g2;
    ctx.beginPath();
    ctx.arc(s2x, s2y, 80, 0, Math.PI * 2);
    ctx.fill();

    // Anamorphic Lens Flare Horizontal Streak
    ctx.globalCompositeOperation = 'screen';
    const flareGrad = ctx.createLinearGradient(s1x - 180, s1y, s1x + 180, s1y);
    flareGrad.addColorStop(0, 'rgba(251, 191, 36, 0)');
    flareGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.55)');
    flareGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = flareGrad;
    ctx.fillRect(s1x - 180, s1y - 2, 360, 4);

    ctx.restore();
  }

  // =========================================================================
  // 4. PULSAR (超高速回転中性子星)
  // =========================================================================
  renderPulsar(ctx, width, height, time, skyHue, px, py) {
    const cx = width * 0.32 + px * 8;
    const cy = height * 0.20 + py * 8;
    const beamAngle = time * 0.0035;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // Dual Relativistic Beams
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(beamAngle);

    const beamLen = Math.max(width, height) * 0.9;
    const beamGrad = ctx.createLinearGradient(-beamLen, 0, beamLen, 0);
    beamGrad.addColorStop(0, 'rgba(0, 240, 255, 0)');
    beamGrad.addColorStop(0.4, 'rgba(0, 240, 255, 0.35)');
    beamGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
    beamGrad.addColorStop(0.6, 'rgba(0, 240, 255, 0.35)');
    beamGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');

    ctx.fillStyle = beamGrad;
    // Conical shape
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(beamLen, -25);
    ctx.lineTo(beamLen, 25);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-beamLen, -25);
    ctx.lineTo(-beamLen, 25);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Synchrotron Shockwave Rings
    for (let r = 16; r <= 52; r += 12) {
      const ringPulse = (time * 0.02 + r) % 52;
      ctx.strokeStyle = `rgba(0, 255, 178, ${0.6 - (ringPulse / 52) * 0.5})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, ringPulse, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Ultra-dense glowing core
    const coreGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 14);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.4, '#00f0ff');
    coreGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // =========================================================================
  // 5. DEEP NEBULA RIFT (深宇宙星雲帯)
  // =========================================================================
  renderDeepNebula(ctx, width, height, time, skyHue, px, py) {
    const cx = width * 0.55 + px * 6;
    const cy = height * 0.22 + py * 6;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // Cosmic Fissure Clouds
    const riftGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 240);
    riftGrad.addColorStop(0, 'rgba(232, 121, 249, 0.42)');
    riftGrad.addColorStop(0.35, 'rgba(168, 85, 247, 0.25)');
    riftGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.15)');
    riftGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = riftGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 260, 110, Math.PI / 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Protostar stellar nursery points
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 9; i++) {
      const px = cx + (Math.sin(i * 1.7) * 90);
      const py = cy + (Math.cos(i * 1.3) * 45);
      const pulse = 0.5 + 0.5 * Math.sin(time * 0.003 + i);
      ctx.beginPath();
      ctx.arc(px, py, 1.8 * pulse, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
