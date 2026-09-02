/**
 * LandscapeRenderer
 * Renders levitating celestial islands, crystalline monoliths, leylines, and ethereal horizon
 */

export class LandscapeRenderer {
  constructor() {
    this.islands = [
      { baseRelX: 0.22, baseRelY: 0.62, width: 280, height: 110, phase: 0.0, speed: 0.8, monolith: true },
      { baseRelX: 0.68, baseRelY: 0.52, width: 340, height: 130, phase: 1.8, speed: 0.6, monolith: true },
      { baseRelX: 0.88, baseRelY: 0.72, width: 200, height: 85,  phase: 3.4, speed: 1.1, monolith: false },
      { baseRelX: 0.08, baseRelY: 0.44, width: 180, height: 75,  phase: 4.8, speed: 0.9, monolith: false }
    ];
  }

  render(ctx, width, height, time, params) {
    const { islandBuoyancy, windSpeed, accentColor } = params;

    // 1. Distant Mountain Silhouettes
    this.renderDistantMountains(ctx, width, height, time, params);

    // 2. Levitating Islands & Monoliths
    for (const island of this.islands) {
      this.renderFloatingIsland(ctx, width, height, time, island, islandBuoyancy, windSpeed, accentColor);
    }

    // 3. Ethereal Abyss / Mirror Horizon at Bottom
    this.renderAbyssHorizon(ctx, width, height, time, accentColor);
  }

  renderDistantMountains(ctx, width, height, time, params) {
    ctx.save();
    // Far mountain layer
    ctx.fillStyle = 'rgba(10, 18, 38, 0.6)';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.82);
    ctx.lineTo(width * 0.15, height * 0.68);
    ctx.lineTo(width * 0.35, height * 0.76);
    ctx.lineTo(width * 0.58, height * 0.64);
    ctx.lineTo(width * 0.78, height * 0.74);
    ctx.lineTo(width, height * 0.69);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // Mid mountain layer with soft glow edge
    ctx.fillStyle = 'rgba(7, 12, 28, 0.85)';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.88);
    ctx.lineTo(width * 0.25, height * 0.75);
    ctx.lineTo(width * 0.48, height * 0.82);
    ctx.lineTo(width * 0.72, height * 0.73);
    ctx.lineTo(width * 0.92, height * 0.84);
    ctx.lineTo(width, height * 0.8);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  renderFloatingIsland(ctx, width, height, time, island, buoyancy, windSpeed, accentColor) {
    ctx.save();

    // Harmonic float oscillation
    const bob = Math.sin(time * 0.001 * island.speed + island.phase) * (12 + windSpeed * 0.2);
    const sway = Math.cos(time * 0.0008 * island.speed + island.phase) * (4 + windSpeed * 0.15);

    const cx = island.baseRelX * width + sway;
    const cy = island.baseRelY * height + bob - buoyancy;
    const w = island.width;
    const h = island.height;

    // Glowing Bioluminescent Tendril Roots
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth = 1.2;
    for (let r = -w * 0.35; r <= w * 0.35; r += 28) {
      ctx.beginPath();
      ctx.moveTo(cx + r, cy + h * 0.3);
      const rootLength = h * (0.8 + Math.sin(r + time * 0.002) * 0.3);
      const rootSway = Math.sin(time * 0.0015 + r) * (6 + windSpeed * 0.3);
      ctx.quadraticCurveTo(cx + r + rootSway * 0.5, cy + h * 0.5 + rootLength * 0.5, cx + r + rootSway, cy + h * 0.3 + rootLength);
      ctx.stroke();

      // Root tip glowing seed spore
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.arc(cx + r + rootSway, cy + h * 0.3 + rootLength, 2.0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Island Rock Body (Polygonal inverted crystal cone)
    ctx.fillStyle = '#080e1e';
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.5, cy);
    ctx.quadraticCurveTo(cx, cy - h * 0.25, cx + w * 0.5, cy); // Top plateau
    ctx.lineTo(cx + w * 0.32, cy + h * 0.45);
    ctx.lineTo(cx, cy + h * 0.95); // Deep bottom vertex
    ctx.lineTo(cx - w * 0.35, cy + h * 0.4);
    ctx.closePath();
    ctx.fill();

    // Island Top Luminescent Grass & Leyline Edge
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.5, cy);
    ctx.quadraticCurveTo(cx, cy - h * 0.25, cx + w * 0.5, cy);
    ctx.stroke();

    // Geometric Astral Monolith / Ancient Observatory Obelisk
    if (island.monolith) {
      this.renderMonolith(ctx, cx, cy - h * 0.15, accentColor, time);
    }

    ctx.restore();
  }

  renderMonolith(ctx, x, y, accentColor, time) {
    ctx.save();
    // Levitating Spire Core
    const spireH = 55;
    const spireW = 14;

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(x, y - spireH);
    ctx.lineTo(x + spireW * 0.5, y);
    ctx.lineTo(x, y + 6);
    ctx.lineTo(x - spireW * 0.5, y);
    ctx.closePath();
    ctx.fill();

    // Central pulsing rune conduit
    const pulse = 0.5 + 0.5 * Math.sin(time * 0.003);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.moveTo(x, y - spireH * 0.85);
    ctx.lineTo(x, y - 4);
    ctx.stroke();

    // Floating Halo Ring around Monolith
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 + pulse * 0.5})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(x, y - spireH * 0.55, 18, 5, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  renderAbyssHorizon(ctx, width, height, time, accentColor) {
    ctx.save();
    const horizonY = height * 0.94;
    const abyssGrad = ctx.createLinearGradient(0, horizonY, 0, height);
    abyssGrad.addColorStop(0, 'rgba(4, 9, 20, 0.4)');
    abyssGrad.addColorStop(0.3, 'rgba(0, 240, 255, 0.06)');
    abyssGrad.addColorStop(1, 'rgba(2, 4, 10, 0.95)');

    ctx.fillStyle = abyssGrad;
    ctx.fillRect(0, horizonY, width, height - horizonY);

    // Glowing horizon mirror line
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(width, horizonY);
    ctx.stroke();
    ctx.restore();
  }
}
