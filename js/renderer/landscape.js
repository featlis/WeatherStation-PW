/**
 * LandscapeRenderer - 10 Modular Procedural Planet Biomes
 * 1. MEGALOPOLIS (星間摩天楼・空中都市)
 * 2. PLAINS (霊光草原・巨大霊樹)
 * 3. COAST (結晶海岸・波光)
 * 4. ARCHIPELAGO (浮遊列島・天球神殿)
 * 5. GLACIER (極氷晶界・氷尖塔)
 * 6. VOLCANO_PLASMA (星核溶岩・発光クレーター・エーテル噴煙)
 * 7. CRYSTAL_FOREST (巨晶の森・クォーツ尖峰群)
 * 8. DESERT_RUINS (星屑砂漠・古代環状遺跡)
 * 9. DEEP_ABYSS_REEF (深淵発光サンゴ礁)
 * 10. SOLAR_SPIRE (太陽受光塔・集光アレイ)
 */

export const BIOME_TYPES = {
  MEGALOPOLIS: 'MEGALOPOLIS',
  PLAINS: 'PLAINS',
  COAST: 'COAST',
  ARCHIPELAGO: 'ARCHIPELAGO',
  GLACIER: 'GLACIER',
  VOLCANO_PLASMA: 'VOLCANO_PLASMA',
  CRYSTAL_FOREST: 'CRYSTAL_FOREST',
  DESERT_RUINS: 'DESERT_RUINS',
  DEEP_ABYSS_REEF: 'DEEP_ABYSS_REEF',
  SOLAR_SPIRE: 'SOLAR_SPIRE'
};

export class LandscapeRenderer {
  constructor() {
    this.currentBiome = BIOME_TYPES.MEGALOPOLIS;
    this.seed = 42;
    this.grassBlades = [];
    this.buildings = [];
    this.waves = [];
    this.trees = [];
    this.crystals = [];
    this.ruins = [];
    this.volcanoes = [];
    this.spires = [];
  }

  setBiome(biomeType, seed = Math.random() * 10000) {
    this.currentBiome = biomeType;
    this.seed = seed;
    this.generateBiomeData();
  }

  generateBiomeData() {
    const rng = this.createRng(this.seed);

    if (this.currentBiome === BIOME_TYPES.MEGALOPOLIS) {
      this.buildings = [];
      const count = 38;
      for (let i = 0; i < count; i++) {
        const layer = i % 3;
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
    } else if (this.currentBiome === BIOME_TYPES.VOLCANO_PLASMA) {
      this.volcanoes = [
        { relX: 0.35, width: 420, heightRatio: 0.52, craterWidth: 60 },
        { relX: 0.78, width: 320, heightRatio: 0.42, craterWidth: 40 }
      ];
    } else if (this.currentBiome === BIOME_TYPES.CRYSTAL_FOREST) {
      this.crystals = [];
      const cCount = 28;
      for (let i = 0; i < cCount; i++) {
        this.crystals.push({
          relX: (i / cCount) + (rng() - 0.5) * 0.03,
          height: 80 + rng() * 180,
          width: 20 + rng() * 35,
          color: i % 2 === 0 ? '#00f0ff' : '#c084fc',
          tilt: (rng() - 0.5) * 0.3
        });
      }
    } else if (this.currentBiome === BIOME_TYPES.DESERT_RUINS) {
      this.ruins = [];
      for (let i = 0; i < 7; i++) {
        this.ruins.push({
          relX: 0.15 + i * 0.12 + (rng() - 0.5) * 0.04,
          height: 60 + rng() * 120,
          width: 24 + rng() * 30,
          ring: i % 3 === 0
        });
      }
    } else if (this.currentBiome === BIOME_TYPES.DEEP_ABYSS_REEF) {
      this.reefs = [];
      for (let i = 0; i < 22; i++) {
        this.reefs.push({
          relX: (i / 22) + (rng() - 0.5) * 0.03,
          height: 50 + rng() * 110,
          tentacles: Math.floor(rng() * 4) + 3,
          glowColor: i % 3 === 0 ? '#00ffb2' : '#f43f5e'
        });
      }
    } else if (this.currentBiome === BIOME_TYPES.SOLAR_SPIRE) {
      this.spires = [
        { relX: 0.5, heightRatio: 0.65, main: true },
        { relX: 0.22, heightRatio: 0.45, main: false },
        { relX: 0.78, heightRatio: 0.48, main: false }
      ];
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
      case BIOME_TYPES.VOLCANO_PLASMA:
        this.renderVolcanoPlasma(ctx, width, height, time, windSpeed, accentColor);
        break;
      case BIOME_TYPES.CRYSTAL_FOREST:
        this.renderCrystalForest(ctx, width, height, time, windSpeed, accentColor);
        break;
      case BIOME_TYPES.DESERT_RUINS:
        this.renderDesertRuins(ctx, width, height, time, windSpeed, accentColor);
        break;
      case BIOME_TYPES.DEEP_ABYSS_REEF:
        this.renderDeepAbyssReef(ctx, width, height, time, windSpeed, accentColor);
        break;
      case BIOME_TYPES.SOLAR_SPIRE:
        this.renderSolarSpire(ctx, width, height, time, windSpeed, accentColor);
        break;
      case BIOME_TYPES.ARCHIPELAGO:
      default:
        this.renderArchipelago(ctx, width, height, time, islandBuoyancy, windSpeed, accentColor);
        break;
    }
  }

  // --- 1. MEGALOPOLIS ---
  renderMegalopolis(ctx, width, height, time, windSpeed, accentColor) {
    ctx.save();
    const groundY = height * 0.94;
    for (const b of this.buildings.filter(b => b.layer === 0)) {
      const bx = b.relX * width;
      const bh = b.heightRatio * height * 0.8;
      ctx.fillStyle = 'rgba(6, 12, 28, 0.7)';
      ctx.fillRect(bx - b.width * 0.5, groundY - bh, b.width, bh);
    }
    for (const b of this.buildings.filter(b => b.layer > 0)) {
      const bx = b.relX * width;
      const bh = b.heightRatio * height;
      const by = groundY - bh;
      const bw = b.width;
      ctx.fillStyle = b.layer === 1 ? '#091024' : '#050a16';
      ctx.fillRect(bx - bw * 0.5, by, bw, bh);
      ctx.strokeStyle = b.layer === 2 ? 'rgba(0, 240, 255, 0.35)' : 'rgba(168, 85, 247, 0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx - bw * 0.5, by, bw, bh);
      if (b.spire) {
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx, by - 35);
        ctx.stroke();
        const beaconAlpha = 0.5 + 0.5 * Math.sin(time * 0.004 + bx);
        ctx.fillStyle = accentColor;
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(bx, by - 35, 2.5 * beaconAlpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      for (const win of b.windows) {
        if (!win.active) continue;
        const wx = bx - bw * 0.4 + win.c * (bw * 0.8);
        const wy = by + 16 + win.r * (bh - 30);
        const winGlow = 0.4 + 0.6 * Math.sin(time * 0.001 + wx * 0.1);
        ctx.fillStyle = b.layer === 2 ? `rgba(0, 240, 255, ${0.4 * winGlow})` : `rgba(255, 215, 120, ${0.3 * winGlow})`;
        ctx.fillRect(wx, wy, 4, 6);
      }
    }
    ctx.restore();
  }

  // --- 2. PLAINS ---
  renderPlains(ctx, width, height, time, windSpeed, accentColor) {
    ctx.save();
    const groundY = height * 0.88;
    ctx.fillStyle = 'rgba(5, 20, 22, 0.85)';
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    for (let x = 0; x <= width; x += 40) {
      ctx.lineTo(x, groundY - 40 + Math.sin(x * 0.003 + 1.2) * 35);
    }
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    for (const tree of this.trees) {
      const tx = tree.relX * width;
      const ty = groundY - 30;
      const ts = tree.size * (height * 0.45);
      ctx.strokeStyle = '#051214';
      ctx.lineWidth = 14 * tree.size;
      ctx.beginPath();
      ctx.moveTo(tx, ty + 40);
      ctx.quadraticCurveTo(tx - 20, ty - ts * 0.5, tx, ty - ts);
      ctx.stroke();

      const canopyGrad = ctx.createRadialGradient(tx, ty - ts, 10, tx, ty - ts, ts * 0.7);
      canopyGrad.addColorStop(0, 'rgba(0, 255, 178, 0.6)');
      canopyGrad.addColorStop(0.5, 'rgba(0, 240, 255, 0.25)');
      canopyGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = canopyGrad;
      ctx.beginPath();
      ctx.arc(tx, ty - ts, ts * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }

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
    }
    ctx.restore();
  }

  // --- 3. COAST ---
  renderCoast(ctx, width, height, time, windSpeed, accentColor) {
    ctx.save();
    const shoreY = height * 0.76;
    for (const w of this.waves) {
      const wy = w.baseYRel * height;
      ctx.fillStyle = 'rgba(2, 12, 28, 0.45)';
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, wy);
      for (let x = 0; x <= width; x += 30) {
        ctx.lineTo(x, wy + Math.sin(x * w.freq + time * w.speed + w.phase) * w.amp);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // --- 4. ARCHIPELAGO ---
  renderArchipelago(ctx, width, height, time, islandBuoyancy, windSpeed, accentColor) {
    ctx.save();
    for (const island of this.islands) {
      const bob = Math.sin(time * 0.001 * island.speed + island.phase) * (12 + windSpeed * 0.2);
      const sway = Math.cos(time * 0.0008 * island.speed + island.phase) * (4 + windSpeed * 0.15);
      const cx = island.baseRelX * width + sway;
      const cy = island.baseRelY * height + bob - islandBuoyancy;
      const w = island.width;
      const h = island.height;
      ctx.fillStyle = '#080e1e';
      ctx.beginPath();
      ctx.moveTo(cx - w * 0.5, cy);
      ctx.quadraticCurveTo(cx, cy - h * 0.25, cx + w * 0.5, cy);
      ctx.lineTo(cx + w * 0.32, cy + h * 0.45);
      ctx.lineTo(cx, cy + h * 0.95);
      ctx.lineTo(cx - w * 0.35, cy + h * 0.4);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
    ctx.restore();
  }

  // --- 5. GLACIER ---
  renderGlacier(ctx, width, height, time, windSpeed, accentColor) {
    ctx.save();
    const horizonY = height * 0.9;
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
    }
    ctx.restore();
  }

  // --- 6. VOLCANO & PLASMA CALDERA (星核溶岩・発光クレーター) ---
  renderVolcanoPlasma(ctx, width, height, time, windSpeed, accentColor) {
    ctx.save();
    const groundY = height * 0.92;
    for (const v of this.volcanoes) {
      const vx = v.relX * width;
      const vh = v.heightRatio * height;
      const vy = groundY - vh;

      // Volcano Mountain Body
      ctx.fillStyle = '#180a0a';
      ctx.beginPath();
      ctx.moveTo(vx - v.width * 0.5, groundY);
      ctx.lineTo(vx - v.craterWidth * 0.5, vy);
      ctx.lineTo(vx + v.craterWidth * 0.5, vy);
      ctx.lineTo(vx + v.width * 0.5, groundY);
      ctx.closePath();
      ctx.fill();

      // Pulsing Glowing Caldera Plasma Core
      const glow = 0.6 + 0.4 * Math.sin(time * 0.003 + vx);
      const magmaGrad = ctx.createRadialGradient(vx, vy, 4, vx, vy - 20, v.craterWidth * 1.5);
      magmaGrad.addColorStop(0, '#fff');
      magmaGrad.addColorStop(0.3, '#ff4d6d');
      magmaGrad.addColorStop(0.7, 'rgba(249, 115, 22, 0.4)');
      magmaGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = magmaGrad;
      ctx.beginPath();
      ctx.arc(vx, vy - 10, v.craterWidth * 1.5 * glow, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // --- 7. CRYSTAL FOREST (巨晶の森) ---
  renderCrystalForest(ctx, width, height, time, windSpeed, accentColor) {
    ctx.save();
    const groundY = height * 0.92;
    for (const c of this.crystals) {
      const cx = c.relX * width;
      const cy = groundY;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(c.tilt);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.moveTo(-c.width * 0.5, 0);
      ctx.lineTo(0, -c.height);
      ctx.lineTo(c.width * 0.5, 0);
      ctx.closePath();
      ctx.fill();

      // Glowing Facet Edge
      ctx.strokeStyle = c.color;
      ctx.lineWidth = 1.6;
      ctx.shadowColor = c.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(-c.width * 0.5, 0);
      ctx.lineTo(0, -c.height);
      ctx.lineTo(0, 0);
      ctx.stroke();

      ctx.restore();
    }
    ctx.restore();
  }

  // --- 8. DESERT RUINS (星屑砂漠 & 古代環状遺跡) ---
  renderDesertRuins(ctx, width, height, time, windSpeed, accentColor) {
    ctx.save();
    const groundY = height * 0.88;
    // Dune curves
    ctx.fillStyle = 'rgba(28, 18, 10, 0.9)';
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    for (let x = 0; x <= width; x += 50) {
      ctx.lineTo(x, groundY - 20 + Math.sin(x * 0.002 + 0.8) * 20);
    }
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // Ancient Obelisks & Rings
    for (const r of this.ruins) {
      const rx = r.relX * width;
      const ry = groundY - 10;
      ctx.fillStyle = '#0f0b08';
      ctx.fillRect(rx - r.width * 0.5, ry - r.height, r.width, r.height);
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(rx - r.width * 0.5, ry - r.height, r.width, r.height);

      if (r.ring) {
        ctx.strokeStyle = '#ffd166';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(rx, ry - r.height - 18, 16, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // --- 9. DEEP ABYSS REEF (深淵発光サンゴ礁) ---
  renderDeepAbyssReef(ctx, width, height, time, windSpeed, accentColor) {
    ctx.save();
    const groundY = height * 0.9;
    for (const r of this.reefs) {
      const rx = r.relX * width;
      const ry = groundY;
      ctx.strokeStyle = r.glowColor;
      ctx.lineWidth = 2.2;
      ctx.shadowColor = r.glowColor;
      ctx.shadowBlur = 8;
      for (let t = 0; t < r.tentacles; t++) {
        const angle = (t - r.tentacles * 0.5) * 0.35;
        const sway = Math.sin(time * 0.002 + rx + t) * 12;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.quadraticCurveTo(rx + angle * 30 + sway * 0.5, ry - r.height * 0.6, rx + angle * 50 + sway, ry - r.height);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // --- 10. SOLAR SPIRE (太陽受光塔) ---
  renderSolarSpire(ctx, width, height, time, windSpeed, accentColor) {
    ctx.save();
    const groundY = height * 0.94;
    for (const s of this.spires) {
      const sx = s.relX * width;
      const sh = s.heightRatio * height;
      const sy = groundY - sh;

      // Tower Core
      ctx.fillStyle = '#050a14';
      ctx.beginPath();
      ctx.moveTo(sx - 18, groundY);
      ctx.lineTo(sx - 4, sy);
      ctx.lineTo(sx + 4, sy);
      ctx.lineTo(sx + 18, groundY);
      ctx.closePath();
      ctx.fill();

      // Top Radiant Lens Core
      const pulse = 0.5 + 0.5 * Math.sin(time * 0.004 + sx);
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(sx, sy, s.main ? 10 * pulse : 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
