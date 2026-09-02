/**
 * LandscapeRenderer - Multi-Biome Procedural Generation Engine
 * Generates unique procedural landscapes per location:
 * 1. MEGALOPOLIS (架空の巨塔・星間摩天楼・空中都市)
 * 2. PLAINS (霊光の草原・風になびく草・巨大霊樹)
 * 3. COAST (結晶海岸・波光・星屑の灯台)
 * 4. ARCHIPELAGO (浮遊列島・天球神殿・虚空の滝)
 * 5. GLACIER (極氷晶界・氷の尖塔・クリスタル崖)
 */

export const BIOME_TYPES = {
  MEGALOPOLIS: 'MEGALOPOLIS',
  PLAINS: 'PLAINS',
  COAST: 'COAST',
  ARCHIPELAGO: 'ARCHIPELAGO',
  GLACIER: 'GLACIER'
};

export class LandscapeRenderer {
  constructor() {
    this.currentBiome = BIOME_TYPES.ARCHIPELAGO;
    this.biomeData = null;
    this.seed = 42;
    this.grassBlades = [];
    this.buildings = [];
    this.waves = [];
    this.trees = [];
  }

  /**
   * Deterministically configure or randomize biome based on city name/seed
   */
  setBiome(biomeType, seed = Math.random() * 10000) {
    this.currentBiome = biomeType;
    this.seed = seed;
    this.generateBiomeData();
  }

  /**
   * Procedurally generate terrain geometry according to biome
   */
  generateBiomeData() {
    const rng = this.createRng(this.seed);

    if (this.currentBiome === BIOME_TYPES.MEGALOPOLIS) {
      this.buildings = [];
      const count = 38;
      for (let i = 0; i < count; i++) {
        const layer = i % 3; // 0: background, 1: mid, 2: foreground
        const relX = (i / count) + (rng() - 0.5) * 0.04;
        const width = 28 + rng() * 55 * (layer + 1) * 0.5;
        const heightRatio = 0.25 + rng() * 0.55 * (layer === 2 ? 0.9 : 1.2);
        const spire = rng() > 0.45;
        const windows = [];
        const winRows = Math.floor(rng() * 12) + 6;
        const winCols = Math.floor(rng() * 4) + 2;
        for (let r = 0; r < winRows; r++) {
          for (let c = 0; c < winCols; c++) {
            if (rng() > 0.3) windows.push({ r: r / winRows, c: c / winCols, active: rng() > 0.25 });
          }
        }
        this.buildings.push({ relX, width, heightRatio, layer, spire, windows });
      }
    } else if (this.currentBiome === BIOME_TYPES.PLAINS) {
      // Procedural grass blades & Great Ethereal Tree
      this.grassBlades = [];
      const grassCount = 180;
      for (let i = 0; i < grassCount; i++) {
        this.grassBlades.push({
          relX: i / grassCount + (rng() - 0.5) * 0.01,
          height: 35 + rng() * 65,
          curvePhase: rng() * Math.PI * 2,
          flexibility: 0.6 + rng() * 0.8,
          layer: Math.floor(rng() * 3)
        });
      }
      this.trees = [
        { relX: 0.72, size: 1.0, glowPhase: rng() * Math.PI },
        { relX: 0.24, size: 0.6, glowPhase: rng() * Math.PI }
      ];
    } else if (this.currentBiome === BIOME_TYPES.COAST) {
      this.waves = [];
      for (let i = 0; i < 5; i++) {
        this.waves.push({
          baseYRel: 0.78 + i * 0.04,
          speed: 0.0015 + i * 0.0006,
          freq: 0.008 + i * 0.003,
          amp: 8 + i * 4,
          phase: rng() * Math.PI * 2
        });
      }
    } else if (this.currentBiome === BIOME_TYPES.ARCHIPELAGO) {
      this.islands = [
        { baseRelX: 0.22, baseRelY: 0.62, width: 280, height: 110, phase: 0.0, speed: 0.8, monolith: true },
        { baseRelX: 0.68, baseRelY: 0.52, width: 340, height: 130, phase: 1.8, speed: 0.6, monolith: true },
        { baseRelX: 0.88, baseRelY: 0.72, width: 200, height: 85,  phase: 3.4, speed: 1.1, monolith: false },
        { baseRelX: 0.08, baseRelY: 0.44, width: 180, height: 75,  phase: 4.8, speed: 0.9, monolith: false }
      ];
    } else if (this.currentBiome === BIOME_TYPES.GLACIER) {
      this.glaciers = [];
      for (let i = 0; i < 18; i++) {
        this.glaciers.push({
          relX: (i / 18) + (rng() - 0.5) * 0.06,
          width: 60 + rng() * 100,
          heightRatio: 0.35 + rng() * 0.45,
          slant: (rng() - 0.5) * 40,
          layer: i % 2
        });
      }
    }
  }

  createRng(seed) {
    let s = Math.sin(seed) * 10000;
    return () => {
      s = Math.sin(s++) * 10000;
      return s - Math.floor(s);
    };
  }

  render(ctx, width, height, time, params) {
    const { islandBuoyancy, windSpeed, accentColor } = params;

    switch (this.currentBiome) {
      case BIOME_TYPES.MEGALOPOLIS:
        this.renderMegalopolis(ctx, width, height, time, windSpeed, accentColor);
        break;
      case BIOME_TYPES.PLAINS:
        this.renderPlains(ctx, width, height, time, windSpeed, accentColor);
        break;
      case BIOME_TYPES.COAST:
        this.renderCoast(ctx, width, height, time, windSpeed, accentColor);
        break;
      case BIOME_TYPES.GLACIER:
        this.renderGlacier(ctx, width, height, time, windSpeed, accentColor);
        break;
      case BIOME_TYPES.ARCHIPELAGO:
      default:
        this.renderArchipelago(ctx, width, height, time, islandBuoyancy, windSpeed, accentColor);
        break;
    }
  }

  // =========================================================================
  // 1. MEGALOPOLIS BIOME
  // =========================================================================
  renderMegalopolis(ctx, width, height, time, windSpeed, accentColor) {
    ctx.save();
    const groundY = height * 0.94;

    // Layer 0: Far Background Silhouettes
    for (const b of this.buildings.filter(b => b.layer === 0)) {
      const bx = b.relX * width;
      const bh = b.heightRatio * height * 0.8;
      const by = groundY - bh;
      ctx.fillStyle = 'rgba(6, 12, 28, 0.7)';
      ctx.fillRect(bx - b.width * 0.5, by, b.width, bh);
    }

    // Layer 1 & 2: Mid & Foreground Spires with Glowing Windows & Antennas
    for (const b of this.buildings.filter(b => b.layer > 0)) {
      const bx = b.relX * width;
      const bh = b.heightRatio * height;
      const by = groundY - bh;
      const bw = b.width;

      // Building Wall
      ctx.fillStyle = b.layer === 1 ? '#091024' : '#050a16';
      ctx.fillRect(bx - bw * 0.5, by, bw, bh);

      // Building Edge Accent Lines
      ctx.strokeStyle = b.layer === 2 ? 'rgba(0, 240, 255, 0.35)' : 'rgba(168, 85, 247, 0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx - bw * 0.5, by, bw, bh);

      // Spires & Antennas
      if (b.spire) {
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx, by - 35);
        ctx.stroke();

        // Pulsing Beacon Light
        const beaconAlpha = 0.5 + 0.5 * Math.sin(time * 0.004 + bx);
        ctx.fillStyle = accentColor;
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(bx, by - 35, 2.5 * beaconAlpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Windows Matrix
      for (const win of b.windows) {
        if (!win.active) continue;
        const wx = bx - bw * 0.4 + win.c * (bw * 0.8);
        const wy = by + 16 + win.r * (bh - 30);
        const winGlow = 0.4 + 0.6 * Math.sin(time * 0.001 + wx * 0.1);
        ctx.fillStyle = b.layer === 2 ? `rgba(0, 240, 255, ${0.4 * winGlow})` : `rgba(255, 215, 120, ${0.3 * winGlow})`;
        ctx.fillRect(wx, wy, 4, 6);
      }
    }

    // Skyway Energy Traffic Line (Horizontal glowing light streaks)
    const trafficY = height * 0.75;
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, trafficY);
    ctx.lineTo(width, trafficY);
    ctx.stroke();

    // Floating sky car light pulses
    for (let i = 0; i < 5; i++) {
      const carX = ((time * 0.15 * (i + 1) + i * 280) % (width + 100)) - 50;
      ctx.fillStyle = i % 2 === 0 ? '#00f0ff' : '#f43f5e';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 8;
      ctx.fillRect(carX, trafficY - 2, 12, 4);
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }

  // =========================================================================
  // 2. PLAINS BIOME (霊光の草原 & 巨大霊樹)
  // =========================================================================
  renderPlains(ctx, width, height, time, windSpeed, accentColor) {
    ctx.save();
    const groundY = height * 0.88;

    // Rolling Hills in Background
    ctx.fillStyle = 'rgba(5, 20, 22, 0.85)';
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    for (let x = 0; x <= width; x += 40) {
      const y = groundY - 40 + Math.sin(x * 0.003 + 1.2) * 35;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // Giant Sacred Astral Trees
    for (const tree of this.trees) {
      const tx = tree.relX * width;
      const ty = groundY - 30;
      const ts = tree.size * (height * 0.45);

      // Trunk
      ctx.strokeStyle = '#051214';
      ctx.lineWidth = 14 * tree.size;
      ctx.beginPath();
      ctx.moveTo(tx, ty + 40);
      ctx.quadraticCurveTo(tx - 20, ty - ts * 0.5, tx, ty - ts);
      ctx.stroke();

      // Glowing Foliage Canopy (Bioluminescent cloud)
      const canopyGrad = ctx.createRadialGradient(tx, ty - ts, 10, tx, ty - ts, ts * 0.7);
      canopyGrad.addColorStop(0, 'rgba(0, 255, 178, 0.6)');
      canopyGrad.addColorStop(0.5, 'rgba(0, 240, 255, 0.25)');
      canopyGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = canopyGrad;
      ctx.beginPath();
      ctx.arc(tx, ty - ts, ts * 0.7, 0, Math.PI * 2);
      ctx.fill();

      // Spore particles floating from canopy
      for (let s = 0; s < 6; s++) {
        const sx = tx + Math.sin(time * 0.002 + s * 2) * (ts * 0.6);
        const sy = ty - ts + Math.cos(time * 0.0015 + s) * (ts * 0.4) - ((time * 0.03 + s * 20) % 60);
        ctx.fillStyle = '#00ffb2';
        ctx.shadowColor = '#00ffb2';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(sx, sy, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // Foreground Swaying Bioluminescent Grass Blades
    const windForce = (windSpeed * 0.04 + 0.8);
    for (const blade of this.grassBlades) {
      const bx = blade.relX * width;
      const by = groundY + blade.layer * 16;
      const sway = Math.sin(time * 0.003 * windForce + blade.curvePhase) * (20 * blade.flexibility + windSpeed * 0.8);

      ctx.strokeStyle = blade.layer === 0 ? 'rgba(0, 255, 178, 0.7)' : 'rgba(0, 240, 255, 0.4)';
      ctx.lineWidth = blade.layer === 0 ? 2.2 : 1.4;

      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.quadraticCurveTo(bx + sway * 0.5, by - blade.height * 0.5, bx + sway, by - blade.height);
      ctx.stroke();

      // Glowing seed tip
      if (blade.layer === 0 && blade.height > 60) {
        ctx.fillStyle = '#00ffb2';
        ctx.beginPath();
        ctx.arc(bx + sway, by - blade.height, 2.0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  // =========================================================================
  // 3. COAST BIOME (結晶海岸 & 星屑の海)
  // =========================================================================
  renderCoast(ctx, width, height, time, windSpeed, accentColor) {
    ctx.save();
    const shoreY = height * 0.76;

    // Distant Coastal Cliffs
    ctx.fillStyle = '#040b18';
    ctx.beginPath();
    ctx.moveTo(0, shoreY - 70);
    ctx.lineTo(width * 0.35, shoreY - 20);
    ctx.lineTo(width * 0.45, shoreY + 100);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // Crystal Lighthouse / Beacon on the cliff
    const lhX = width * 0.18;
    const lhY = shoreY - 80;
    ctx.fillStyle = '#0a1628';
    ctx.fillRect(lhX - 8, lhY, 16, 50);

    // Revolving Light Beam
    const beamAngle = time * 0.001;
    const beamLen = width * 0.7;
    ctx.save();
    ctx.translate(lhX, lhY);
    ctx.rotate(Math.sin(beamAngle) * 0.6 - 0.2);
    const beamGrad = ctx.createLinearGradient(0, 0, beamLen, 0);
    beamGrad.addColorStop(0, 'rgba(0, 240, 255, 0.8)');
    beamGrad.addColorStop(0.3, 'rgba(0, 240, 255, 0.15)');
    beamGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(beamLen, -40);
    ctx.lineTo(beamLen, 40);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Ocean Surface & Waves
    for (const w of this.waves) {
      const wy = w.baseYRel * height;
      ctx.fillStyle = 'rgba(2, 12, 28, 0.45)';
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, wy);
      for (let x = 0; x <= width; x += 30) {
        const yOffset = Math.sin(x * w.freq + time * w.speed + w.phase) * w.amp;
        ctx.lineTo(x, wy + yOffset);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // Shimmering Foam Wave Edge
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x <= width; x += 30) {
        const yOffset = Math.sin(x * w.freq + time * w.speed + w.phase) * w.amp;
        if (x === 0) ctx.moveTo(x, wy + yOffset);
        else ctx.lineTo(x, wy + yOffset);
      }
      ctx.stroke();
    }

    ctx.restore();
  }

  // =========================================================================
  // 4. GLACIER BIOME (極氷晶界・氷の尖塔)
  // =========================================================================
  renderGlacier(ctx, width, height, time, windSpeed, accentColor) {
    ctx.save();
    const horizonY = height * 0.9;

    // Jagged Crystal Ice Spires
    for (const g of this.glaciers) {
      const gx = g.relX * width;
      const gh = g.heightRatio * height;
      const gy = horizonY - gh;
      const gw = g.width;

      ctx.fillStyle = g.layer === 0 ? 'rgba(7, 24, 48, 0.85)' : 'rgba(12, 38, 70, 0.95)';
      ctx.beginPath();
      ctx.moveTo(gx - gw * 0.5, horizonY);
      ctx.lineTo(gx + g.slant, gy);
      ctx.lineTo(gx + gw * 0.5, horizonY);
      ctx.closePath();
      ctx.fill();

      // Crystal Facet Prism Line
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(gx - gw * 0.5, horizonY);
      ctx.lineTo(gx + g.slant, gy);
      ctx.lineTo(gx + gw * 0.1, horizonY);
      ctx.stroke();

      // Apex Prismatic Glint
      const glint = 0.5 + 0.5 * Math.sin(time * 0.003 + gx);
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#7dd3fc';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(gx + g.slant, gy, 2.5 * glint, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }

  // =========================================================================
  // 5. ARCHIPELAGO BIOME (浮遊列島 & 神殿)
  // =========================================================================
  renderArchipelago(ctx, width, height, time, islandBuoyancy, windSpeed, accentColor) {
    ctx.save();
    for (const island of this.islands) {
      const bob = Math.sin(time * 0.001 * island.speed + island.phase) * (12 + windSpeed * 0.2);
      const sway = Math.cos(time * 0.0008 * island.speed + island.phase) * (4 + windSpeed * 0.15);
      const cx = island.baseRelX * width + sway;
      const cy = island.baseRelY * height + bob - islandBuoyancy;
      const w = island.width;
      const h = island.height;

      // Glowing Tendril Roots
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.lineWidth = 1.2;
      for (let r = -w * 0.35; r <= w * 0.35; r += 28) {
        ctx.beginPath();
        ctx.moveTo(cx + r, cy + h * 0.3);
        const rootLength = h * (0.8 + Math.sin(r + time * 0.002) * 0.3);
        const rootSway = Math.sin(time * 0.0015 + r) * (6 + windSpeed * 0.3);
        ctx.quadraticCurveTo(cx + r + rootSway * 0.5, cy + h * 0.5 + rootLength * 0.5, cx + r + rootSway, cy + h * 0.3 + rootLength);
        ctx.stroke();

        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(cx + r + rootSway, cy + h * 0.3 + rootLength, 2.0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Island Body
      ctx.fillStyle = '#080e1e';
      ctx.beginPath();
      ctx.moveTo(cx - w * 0.5, cy);
      ctx.quadraticCurveTo(cx, cy - h * 0.25, cx + w * 0.5, cy);
      ctx.lineTo(cx + w * 0.32, cy + h * 0.45);
      ctx.lineTo(cx, cy + h * 0.95);
      ctx.lineTo(cx - w * 0.35, cy + h * 0.4);
      ctx.closePath();
      ctx.fill();

      // Top Edge
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx - w * 0.5, cy);
      ctx.quadraticCurveTo(cx, cy - h * 0.25, cx + w * 0.5, cy);
      ctx.stroke();

      if (island.monolith) {
        this.renderMonolith(ctx, cx, cy - h * 0.15, accentColor, time);
      }
    }
    ctx.restore();
  }

  renderMonolith(ctx, x, y, accentColor, time) {
    ctx.save();
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

    const pulse = 0.5 + 0.5 * Math.sin(time * 0.003);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(x, y - spireH * 0.85);
    ctx.lineTo(x, y - 4);
    ctx.stroke();

    ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 + pulse * 0.5})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(x, y - spireH * 0.55, 18, 5, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}
