/**
 * LandscapeRenderer - 16 Modular Procedural Planet Biomes
 * Art-directed procedural rendering with multi-layer parallax depth,
 * volumetric lighting, glowing circuits, swaying vegetation, crystalline facets, and water reflections.
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
  SOLAR_SPIRE: 'SOLAR_SPIRE',
  NEBULA_CANYON: 'NEBULA_CANYON',
  MUSHROOM_GROVE: 'MUSHROOM_GROVE',
  ETHEREAL_SWAMP: 'ETHEREAL_SWAMP',
  FLOATING_CITADEL: 'FLOATING_CITADEL',
  LAVA_OCEAN: 'LAVA_OCEAN',
  AURORA_TUNDRA: 'AURORA_TUNDRA'
};

export class LandscapeRenderer {
  constructor() {
    this.currentBiome = BIOME_TYPES.MEGALOPOLIS;
    this.seed = 42;
    this.grassBlades = [];
    this.buildings = [];
    this.waves = [];
    this.crystals = [];
    this.ruins = [];
    this.islands = [];
    this.volcanoes = [];
    this.spires = [];
    this.mushrooms = [];
    this.canyons = [];
    this.swamps = [];
    this.citadels = [];
    this.tundras = [];
    this.treeSparks = [];
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
      const count = 42;
      for (let i = 0; i < count; i++) {
        const layer = i % 3; // 0: background distant, 1: midground, 2: foreground
        const relX = (i / count) + (rng() - 0.5) * 0.035;
        const width = 32 + rng() * 60 * (layer + 1) * 0.55;
        const heightRatio = 0.28 + rng() * 0.58 * (layer === 2 ? 0.95 : 1.25);
        const spire = rng() > 0.4;
        const windows = [];
        const winRows = Math.floor(rng() * 14) + 6;
        const winCols = Math.floor(rng() * 5) + 2;
        for (let r = 0; r < winRows; r++) {
          for (let c = 0; c < winCols; c++) {
            if (rng() > 0.3) {
              windows.push({
                r: r / winRows,
                c: c / winCols,
                isWarm: rng() > 0.65,
                blinkOffset: rng() * 100
              });
            }
          }
        }
        this.buildings.push({ relX, width, heightRatio, layer, spire, windows });
      }
    } else if (this.currentBiome === BIOME_TYPES.PLAINS) {
      this.grassBlades = [];
      const grassCount = 220;
      for (let i = 0; i < grassCount; i++) {
        this.grassBlades.push({
          relX: i / grassCount + (rng() - 0.5) * 0.015,
          height: 35 + rng() * 70,
          curvePhase: rng() * Math.PI * 2,
          flexibility: 0.7 + rng() * 0.9,
          layer: Math.floor(rng() * 3)
        });
      }
      this.treeSparks = [];
      for (let i = 0; i < 35; i++) {
        this.treeSparks.push({
          relX: 0.72 + (rng() - 0.5) * 0.25,
          relY: 0.52 + (rng() - 0.5) * 0.22,
          size: 1 + rng() * 2.5,
          speed: 0.001 + rng() * 0.002,
          phase: rng() * Math.PI * 2
        });
      }
    } else if (this.currentBiome === BIOME_TYPES.COAST || this.currentBiome === BIOME_TYPES.LAVA_OCEAN) {
      this.waves = [];
      for (let i = 0; i < 6; i++) {
        this.waves.push({
          baseYRel: 0.72 + i * 0.045,
          speed: 0.0012 + i * 0.0006,
          freq: 0.006 + i * 0.003,
          amp: 10 + i * 5,
          phase: rng() * Math.PI * 2
        });
      }
    } else if (this.currentBiome === BIOME_TYPES.ARCHIPELAGO) {
      this.islands = [
        { baseRelX: 0.20, baseRelY: 0.58, width: 320, height: 130, phase: 0.0, speed: 0.7 },
        { baseRelX: 0.70, baseRelY: 0.48, width: 380, height: 150, phase: 1.8, speed: 0.5 },
        { baseRelX: 0.88, baseRelY: 0.68, width: 220, height: 95,  phase: 3.4, speed: 0.9 },
        { baseRelX: 0.08, baseRelY: 0.40, width: 200, height: 85,  phase: 4.8, speed: 0.8 }
      ];
    } else if (this.currentBiome === BIOME_TYPES.GLACIER) {
      this.glaciers = [];
      for (let i = 0; i < 22; i++) {
        this.glaciers.push({
          relX: (i / 22) + (rng() - 0.5) * 0.05,
          width: 70 + rng() * 110,
          heightRatio: 0.35 + rng() * 0.48,
          slant: (rng() - 0.5) * 45,
          facetOffset: (rng() - 0.5) * 20,
          layer: i % 3
        });
      }
    } else if (this.currentBiome === BIOME_TYPES.VOLCANO_PLASMA) {
      this.volcanoes = [
        { relX: 0.32, width: 460, heightRatio: 0.55, craterWidth: 70 },
        { relX: 0.78, width: 360, heightRatio: 0.46, craterWidth: 50 },
        { relX: 0.06, width: 260, heightRatio: 0.38, craterWidth: 35 }
      ];
    } else if (this.currentBiome === BIOME_TYPES.CRYSTAL_FOREST) {
      this.crystals = [];
      for (let i = 0; i < 32; i++) {
        this.crystals.push({
          relX: (i / 32) + (rng() - 0.5) * 0.03,
          height: 90 + rng() * 200,
          width: 24 + rng() * 40,
          color: i % 2 === 0 ? '#00f0ff' : '#c084fc',
          tilt: (rng() - 0.5) * 0.25,
          layer: i % 3
        });
      }
    } else if (this.currentBiome === BIOME_TYPES.DESERT_RUINS) {
      this.ruins = [];
      for (let i = 0; i < 8; i++) {
        this.ruins.push({
          relX: 0.12 + i * 0.11 + (rng() - 0.5) * 0.04,
          height: 70 + rng() * 130,
          width: 28 + rng() * 32,
          isPortal: i === 3
        });
      }
    } else if (this.currentBiome === BIOME_TYPES.DEEP_ABYSS_REEF) {
      this.reefs = [];
      for (let i = 0; i < 24; i++) {
        this.reefs.push({
          relX: (i / 24) + (rng() - 0.5) * 0.03,
          height: 60 + rng() * 130,
          tentacles: Math.floor(rng() * 4) + 4,
          glowColor: i % 3 === 0 ? '#00ffb2' : (i % 3 === 1 ? '#00f0ff' : '#f43f5e'),
          phase: rng() * Math.PI * 2
        });
      }
    } else if (this.currentBiome === BIOME_TYPES.SOLAR_SPIRE) {
      this.spires = [
        { relX: 0.50, heightRatio: 0.68, main: true },
        { relX: 0.22, heightRatio: 0.46, main: false },
        { relX: 0.78, heightRatio: 0.50, main: false }
      ];
    } else if (this.currentBiome === BIOME_TYPES.MUSHROOM_GROVE) {
      this.mushrooms = [];
      for (let i = 0; i < 18; i++) {
        this.mushrooms.push({
          relX: (i / 18) + (rng() - 0.5) * 0.04,
          stemH: 80 + rng() * 150,
          capW: 50 + rng() * 85,
          color: i % 2 === 0 ? '#38bdf8' : '#e879f9',
          layer: i % 2
        });
      }
    } else if (this.currentBiome === BIOME_TYPES.NEBULA_CANYON) {
      this.canyons = [
        { side: 'left', widthRatio: 0.42, slope: 0.8 },
        { side: 'right', widthRatio: 0.42, slope: 0.8 }
      ];
    } else if (this.currentBiome === BIOME_TYPES.ETHEREAL_SWAMP) {
      this.swamps = [];
      for (let i = 0; i < 18; i++) {
        this.swamps.push({
          relX: (i / 18) + (rng() - 0.5) * 0.05,
          lilyRadius: 20 + rng() * 32,
          glowAlpha: 0.6 + rng() * 0.4,
          flower: rng() > 0.4
        });
      }
    } else if (this.currentBiome === BIOME_TYPES.FLOATING_CITADEL) {
      // Replaces crude black cubes with a majestic sci-fi alien citadel fortress!
      this.citadels = [
        { relX: 0.50, relY: 0.46, size: 160, rotSpeed: 0.0005, rings: 3, isMaster: true },
        { relX: 0.22, relY: 0.60, size: 75,  rotSpeed: -0.0009, rings: 2, isMaster: false },
        { relX: 0.78, relY: 0.56, size: 90,  rotSpeed: 0.0007, rings: 2, isMaster: false }
      ];
    } else if (this.currentBiome === BIOME_TYPES.AURORA_TUNDRA) {
      this.tundras = [];
      for (let i = 0; i < 28; i++) {
        this.tundras.push({
          relX: (i / 28) + (rng() - 0.5) * 0.03,
          height: 35 + rng() * 55,
          color: i % 2 === 0 ? '#00ffb2' : '#7dd3fc'
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

  render(ctx, width, height, time, params, px = 0, py = 0) {
    const { islandBuoyancy, windSpeed, accentColor } = params;

    switch (this.currentBiome) {
      case BIOME_TYPES.MEGALOPOLIS:
        this.renderMegalopolis(ctx, width, height, time, windSpeed, accentColor, px, py);
        break;
      case BIOME_TYPES.PLAINS:
        this.renderPlains(ctx, width, height, time, windSpeed, accentColor, px, py);
        break;
      case BIOME_TYPES.COAST:
        this.renderCoast(ctx, width, height, time, windSpeed, accentColor, px, py);
        break;
      case BIOME_TYPES.GLACIER:
        this.renderGlacier(ctx, width, height, time, windSpeed, accentColor, px, py);
        break;
      case BIOME_TYPES.VOLCANO_PLASMA:
        this.renderVolcanoPlasma(ctx, width, height, time, windSpeed, accentColor, px, py);
        break;
      case BIOME_TYPES.CRYSTAL_FOREST:
        this.renderCrystalForest(ctx, width, height, time, windSpeed, accentColor, px, py);
        break;
      case BIOME_TYPES.DESERT_RUINS:
        this.renderDesertRuins(ctx, width, height, time, windSpeed, accentColor, px, py);
        break;
      case BIOME_TYPES.DEEP_ABYSS_REEF:
        this.renderDeepAbyssReef(ctx, width, height, time, windSpeed, accentColor, px, py);
        break;
      case BIOME_TYPES.SOLAR_SPIRE:
        this.renderSolarSpire(ctx, width, height, time, windSpeed, accentColor, px, py);
        break;
      case BIOME_TYPES.MUSHROOM_GROVE:
        this.renderMushroomGrove(ctx, width, height, time, windSpeed, accentColor, px, py);
        break;
      case BIOME_TYPES.NEBULA_CANYON:
        this.renderNebulaCanyon(ctx, width, height, time, windSpeed, accentColor, px, py);
        break;
      case BIOME_TYPES.ETHEREAL_SWAMP:
        this.renderEtherealSwamp(ctx, width, height, time, windSpeed, accentColor, px, py);
        break;
      case BIOME_TYPES.FLOATING_CITADEL:
        this.renderFloatingCitadel(ctx, width, height, time, windSpeed, accentColor, px, py);
        break;
      case BIOME_TYPES.LAVA_OCEAN:
        this.renderLavaOcean(ctx, width, height, time, windSpeed, accentColor, px, py);
        break;
      case BIOME_TYPES.AURORA_TUNDRA:
        this.renderAuroraTundra(ctx, width, height, time, windSpeed, accentColor, px, py);
        break;
      case BIOME_TYPES.ARCHIPELAGO:
      default:
        this.renderArchipelago(ctx, width, height, time, islandBuoyancy, windSpeed, accentColor, px, py);
        break;
    }
  }

  // =========================================================================
  // 1. MEGALOPOLIS (星間サイバー摩天楼)
  // =========================================================================
  renderMegalopolis(ctx, width, height, time, windSpeed, accentColor, px, py) {
    ctx.save();
    const groundY = height * 0.95;

    // Background Layer 0
    for (const b of this.buildings.filter(b => b.layer === 0)) {
      const bx = b.relX * width + px * 3;
      const bh = b.heightRatio * height * 0.8;
      const grad = ctx.createLinearGradient(0, groundY - bh, 0, groundY);
      grad.addColorStop(0, 'rgba(15, 23, 42, 0.8)');
      grad.addColorStop(1, 'rgba(4, 9, 20, 0.95)');
      ctx.fillStyle = grad;
      ctx.fillRect(bx - b.width * 0.5, groundY - bh, b.width, bh);
    }

    // Midground & Foreground Layers 1 & 2
    for (const b of this.buildings.filter(b => b.layer > 0)) {
      const pFactor = b.layer === 2 ? 10 : 6;
      const bx = b.relX * width + px * pFactor;
      const bh = b.heightRatio * height;
      const by = groundY - bh;
      const bw = b.width;

      const towerGrad = ctx.createLinearGradient(bx, by, bx + bw, by);
      towerGrad.addColorStop(0, b.layer === 2 ? '#0b1329' : '#070d1d');
      towerGrad.addColorStop(0.5, b.layer === 2 ? '#131e3d' : '#0e1833');
      towerGrad.addColorStop(1, b.layer === 2 ? '#080e20' : '#050a16');

      ctx.fillStyle = towerGrad;
      ctx.fillRect(bx - bw * 0.5, by, bw, bh);

      // Glowing Neon Structural Edges
      ctx.strokeStyle = b.layer === 2 ? 'rgba(0, 240, 255, 0.45)' : 'rgba(168, 85, 247, 0.28)';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx - bw * 0.5, by, bw, bh);

      // Vertical energy conduits running down tower center
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx, groundY);
      ctx.stroke();

      // Rooftop Spire & Aviation Beacon
      if (b.spire) {
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx, by - 38);
        ctx.stroke();

        const beaconAlpha = 0.5 + 0.5 * Math.sin(time * 0.005 + bx);
        ctx.fillStyle = accentColor;
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(bx, by - 38, 2.5 * beaconAlpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Illuminated Window Matrix
      for (const win of b.windows) {
        const wx = bx - bw * 0.42 + win.c * (bw * 0.84);
        const wy = by + 12 + win.r * (bh - 25);
        const winFlicker = Math.sin(time * 0.002 + win.blinkOffset) > -0.85;

        if (winFlicker) {
          ctx.fillStyle = win.isWarm ? 'rgba(254, 240, 138, 0.85)' : 'rgba(56, 189, 248, 0.85)';
          ctx.fillRect(wx, wy, 2.5, 3.5);
        }
      }
    }

    // Skyway Aerial Traffic Flow (Hover-car photon streams)
    const trafficY1 = height * 0.62;
    const trafficY2 = height * 0.75;
    ctx.lineWidth = 1.5;

    // Cyan Stream
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 6;
    for (let i = 0; i < 6; i++) {
      const tx = ((time * 0.15 + i * 220) % (width + 200)) - 100;
      ctx.beginPath();
      ctx.moveTo(tx, trafficY1);
      ctx.lineTo(tx + 28, trafficY1);
      ctx.stroke();
    }

    // Amber Stream (Opposite direction)
    ctx.strokeStyle = 'rgba(251, 146, 60, 0.6)';
    ctx.shadowColor = '#fb923c';
    for (let i = 0; i < 5; i++) {
      const tx = width - (((time * 0.12 + i * 260) % (width + 200)) - 100);
      ctx.beginPath();
      ctx.moveTo(tx, trafficY2);
      ctx.lineTo(tx - 24, trafficY2);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  // =========================================================================
  // 2. PLAINS & GREAT SPIRIT TREE (霊光草原・巨大霊樹)
  // =========================================================================
  renderPlains(ctx, width, height, time, windSpeed, accentColor, px, py) {
    ctx.save();

    // 1. Far Rolling Hills
    const hill1Y = height * 0.72;
    const hillGrad1 = ctx.createLinearGradient(0, hill1Y, 0, height);
    hillGrad1.addColorStop(0, '#061a22');
    hillGrad1.addColorStop(1, '#02090e');
    ctx.fillStyle = hillGrad1;
    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let x = 0; x <= width; x += 30) {
      const y = hill1Y + Math.sin(x * 0.003 + 1.2) * 45;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();

    // 2. Midground Rolling Hill
    const hill2Y = height * 0.80;
    const hillGrad2 = ctx.createLinearGradient(0, hill2Y, 0, height);
    hillGrad2.addColorStop(0, '#0a2c38');
    hillGrad2.addColorStop(1, '#031015');
    ctx.fillStyle = hillGrad2;
    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let x = 0; x <= width; x += 25) {
      const y = hill2Y + Math.cos(x * 0.0025 + 0.4) * 35;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();

    // 3. The Great Spirit Tree (巨大霊樹)
    const treeX = width * 0.72 + px * 6;
    const treeBaseY = height * 0.85;

    // Gnarled Tree Trunk
    ctx.fillStyle = '#06131c';
    ctx.strokeStyle = 'rgba(0, 255, 178, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(treeX - 25, treeBaseY);
    ctx.quadraticCurveTo(treeX - 18, treeBaseY - 80, treeX - 35, treeBaseY - 140);
    ctx.quadraticCurveTo(treeX, treeBaseY - 110, treeX + 35, treeBaseY - 135);
    ctx.quadraticCurveTo(treeX + 16, treeBaseY - 75, treeX + 22, treeBaseY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Glowing Bioluminescent Tree Veins
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(treeX - 8, treeBaseY);
    ctx.lineTo(treeX - 12, treeBaseY - 60);
    ctx.lineTo(treeX - 26, treeBaseY - 120);
    ctx.moveTo(treeX + 4, treeBaseY);
    ctx.lineTo(treeX + 8, treeBaseY - 55);
    ctx.lineTo(treeX + 24, treeBaseY - 115);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Billowing Luminous Canopy (Overlapping bioluminescent cloud masses)
    const canopies = [
      { ox: 0,   oy: -150, r: 85, color: 'rgba(0, 255, 178, 0.28)' },
      { ox: -45, oy: -135, r: 65, color: 'rgba(0, 240, 255, 0.25)' },
      { ox: 45,  oy: -130, r: 70, color: 'rgba(168, 85, 247, 0.22)' }
    ];
    for (const c of canopies) {
      const cg = ctx.createRadialGradient(treeX + c.ox, treeBaseY + c.oy, 10, treeX + c.ox, treeBaseY + c.oy, c.r);
      cg.addColorStop(0, c.color.replace('0.2', '0.6'));
      cg.addColorStop(0.7, c.color);
      cg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(treeX + c.ox, treeBaseY + c.oy, c.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Falling Luminous Tree Spores / Petals
    ctx.fillStyle = '#00ffb2';
    ctx.shadowColor = '#00ffb2';
    ctx.shadowBlur = 6;
    for (const sp of this.treeSparks) {
      const sx = (sp.relX * width + Math.sin(time * sp.speed + sp.phase) * 30 + px * 6);
      const sy = (sp.relY * height + (time * sp.speed * 80) % 220);
      ctx.beginPath();
      ctx.arc(sx, sy, sp.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // 4. Foreground Swaying Bioluminescent Grass Blades
    const grassBaseY = height * 0.94;
    const windForce = Math.sin(time * 0.002) * (windSpeed * 0.45);

    for (const g of this.grassBlades) {
      const gx = g.relX * width + px * 8;
      const sway = Math.sin(time * 0.003 + g.curvePhase) * (14 + windForce) * g.flexibility;
      const gh = g.height;

      ctx.strokeStyle = g.layer === 2 ? 'rgba(0, 255, 178, 0.75)' : (g.layer === 1 ? 'rgba(56, 189, 248, 0.55)' : 'rgba(168, 85, 247, 0.35)');
      ctx.lineWidth = g.layer === 2 ? 2.0 : 1.2;

      ctx.beginPath();
      ctx.moveTo(gx, grassBaseY);
      ctx.quadraticCurveTo(gx + sway * 0.4, grassBaseY - gh * 0.5, gx + sway, grassBaseY - gh);
      ctx.stroke();
    }

    ctx.restore();
  }

  // =========================================================================
  // 3. COAST & LUMINOUS SURF (結晶海岸・波光)
  // =========================================================================
  renderCoast(ctx, width, height, time, windSpeed, accentColor, px, py) {
    ctx.save();
    const seaY = height * 0.74;

    // Deep Ocean Water Gradient
    const seaGrad = ctx.createLinearGradient(0, seaY, 0, height);
    seaGrad.addColorStop(0, '#041525');
    seaGrad.addColorStop(0.5, '#07243d');
    seaGrad.addColorStop(1, '#020d18');
    ctx.fillStyle = seaGrad;
    ctx.fillRect(0, seaY, width, height - seaY);

    // Multi-Layered Bioluminescent Waves
    for (const w of this.waves) {
      const wy = w.baseYRel * height;
      ctx.beginPath();
      ctx.moveTo(0, height);

      for (let x = 0; x <= width; x += 18) {
        const y = wy + Math.sin(x * w.freq + time * w.speed + w.phase) * w.amp;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.closePath();

      // Translucent deep wave body
      ctx.fillStyle = 'rgba(7, 36, 61, 0.45)';
      ctx.fill();

      // Electric Cyan Glowing Wave Crest
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.65)';
      ctx.lineWidth = 2.2;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Shoreline Wet Sand Reflection Band
    const sandGrad = ctx.createLinearGradient(0, height * 0.92, 0, height);
    sandGrad.addColorStop(0, 'rgba(56, 189, 248, 0.15)');
    sandGrad.addColorStop(1, 'rgba(2, 13, 24, 0.95)');
    ctx.fillStyle = sandGrad;
    ctx.fillRect(0, height * 0.92, width, height * 0.08);

    // Distant Crystalline Lighthouse Beacon
    const lX = width * 0.18 + px * 4;
    const lY = seaY - 15;
    const sweepAngle = time * 0.0012;

    ctx.save();
    ctx.translate(lX, lY);
    ctx.rotate(sweepAngle);
    const beamGrad = ctx.createLinearGradient(0, 0, 420, 0);
    beamGrad.addColorStop(0, 'rgba(0, 255, 178, 0.7)');
    beamGrad.addColorStop(0.3, 'rgba(0, 240, 255, 0.25)');
    beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(420, -35);
    ctx.lineTo(420, 35);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  // =========================================================================
  // 4. ARCHIPELAGO (浮遊列島・天球神殿)
  // =========================================================================
  renderArchipelago(ctx, width, height, time, islandBuoyancy, windSpeed, accentColor, px, py) {
    ctx.save();

    for (const isl of this.islands) {
      const bob = Math.sin(time * 0.001 * isl.speed + isl.phase) * (14 + islandBuoyancy * 0.2);
      const ix = isl.baseRelX * width + px * 8;
      const iy = isl.baseRelY * height + bob + py * 8;
      const w = isl.width;
      const h = isl.height;

      // Craggy Inverted Island Keel (Underground rock mass)
      ctx.beginPath();
      ctx.moveTo(ix - w * 0.5, iy);
      ctx.quadraticCurveTo(ix - w * 0.35, iy + h * 0.7, ix, iy + h);
      ctx.quadraticCurveTo(ix + w * 0.35, iy + h * 0.7, ix + w * 0.5, iy);
      ctx.closePath();

      const rockGrad = ctx.createLinearGradient(ix, iy, ix, iy + h);
      rockGrad.addColorStop(0, '#111827');
      rockGrad.addColorStop(0.6, '#080d1a');
      rockGrad.addColorStop(1, '#020611');
      ctx.fillStyle = rockGrad;
      ctx.fill();

      // Luminous Crystal Veins in the rock
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Top Lush Grass & Structure Plateau
      ctx.fillStyle = '#06282d';
      ctx.beginPath();
      ctx.ellipse(ix, iy, w * 0.5, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#00ffb2';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Celestial Temple on the Main Island
      if (isl.width > 300) {
        ctx.fillStyle = '#e2e8f0';
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
        ctx.lineWidth = 1.2;

        // Temple Columns
        for (let c = -3; c <= 3; c++) {
          const colX = ix + c * 24;
          const colY = iy - 32;
          ctx.fillRect(colX - 3, colY, 6, 32);
        }
        // Temple Architrave & Pediment
        ctx.fillRect(ix - 85, iy - 38, 170, 7);
        ctx.beginPath();
        ctx.moveTo(ix - 85, iy - 38);
        ctx.lineTo(ix, iy - 58);
        ctx.lineTo(ix + 85, iy - 38);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Levitating Floating Obelisk above Temple
        const obY = iy - 82 + Math.sin(time * 0.002) * 6;
        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(ix, obY - 18);
        ctx.lineTo(ix + 7, obY);
        ctx.lineTo(ix, obY + 18);
        ctx.lineTo(ix - 7, obY);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Ethereal Waterfall pouring off island cliff
      const wfX = ix - w * 0.25;
      const wfLen = h * 0.85;
      const wfGrad = ctx.createLinearGradient(wfX, iy, wfX, iy + wfLen);
      wfGrad.addColorStop(0, 'rgba(0, 240, 255, 0.8)');
      wfGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.4)');
      wfGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
      ctx.fillStyle = wfGrad;
      ctx.fillRect(wfX - 5, iy, 10, wfLen);
    }

    ctx.restore();
  }

  // =========================================================================
  // 5. GLACIER & PRISMATIC SPIRES (極氷晶界・氷尖塔)
  // =========================================================================
  renderGlacier(ctx, width, height, time, windSpeed, accentColor, px, py) {
    ctx.save();
    const groundY = height * 0.95;

    for (const g of this.glaciers) {
      const gx = g.relX * width + px * (g.layer + 1) * 3;
      const gh = g.heightRatio * height;
      const gw = g.width;
      const topX = gx + g.slant;
      const topY = groundY - gh;

      // Faceted Shading: Left Facet (Reflecting Cyan Sky)
      ctx.beginPath();
      ctx.moveTo(gx - gw * 0.5, groundY);
      ctx.lineTo(topX, topY);
      ctx.lineTo(gx + g.facetOffset, groundY);
      ctx.closePath();

      const f1Grad = ctx.createLinearGradient(topX, topY, gx, groundY);
      f1Grad.addColorStop(0, '#e0f2fe');
      f1Grad.addColorStop(0.4, '#38bdf8');
      f1Grad.addColorStop(1, '#0c2340');
      ctx.fillStyle = f1Grad;
      ctx.fill();

      // Right Facet (Deep Indigo Shadow)
      ctx.beginPath();
      ctx.moveTo(gx + g.facetOffset, groundY);
      ctx.lineTo(topX, topY);
      ctx.lineTo(gx + gw * 0.5, groundY);
      ctx.closePath();

      const f2Grad = ctx.createLinearGradient(topX, topY, gx, groundY);
      f2Grad.addColorStop(0, '#c7d2fe');
      f2Grad.addColorStop(0.5, '#1e3a8a');
      f2Grad.addColorStop(1, '#061024');
      ctx.fillStyle = f2Grad;
      ctx.fill();

      // Prismatic Razor-Sharp Edge Specular
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(topX, topY);
      ctx.lineTo(gx + g.facetOffset, groundY);
      ctx.stroke();

      // Peak Sparkle Gleam
      const gleam = 0.5 + 0.5 * Math.sin(time * 0.004 + gx);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(topX, topY, 2.5 * gleam, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }

  // =========================================================================
  // 6. VOLCANO & PLASMA CALDERA (星核溶岩・発光カルデラ)
  // =========================================================================
  renderVolcanoPlasma(ctx, width, height, time, windSpeed, accentColor, px, py) {
    ctx.save();
    const groundY = height * 0.95;

    for (const v of this.volcanoes) {
      const vx = v.relX * width + px * 6;
      const vh = v.heightRatio * height;
      const vw = v.width;
      const topY = groundY - vh;
      const cw = v.craterWidth;

      // Volcano Mountain Cone
      ctx.beginPath();
      ctx.moveTo(vx - vw * 0.5, groundY);
      ctx.lineTo(vx - cw * 0.5, topY);
      ctx.lineTo(vx + cw * 0.5, topY);
      ctx.lineTo(vx + vw * 0.5, groundY);
      ctx.closePath();

      const coneGrad = ctx.createLinearGradient(vx, topY, vx, groundY);
      coneGrad.addColorStop(0, '#1c1917');
      coneGrad.addColorStop(0.6, '#0f0e0c');
      coneGrad.addColorStop(1, '#050505');
      ctx.fillStyle = coneGrad;
      ctx.fill();

      // Branching Glowing Magma Cracks on volcano flank
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.75)';
      ctx.lineWidth = 1.6;
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(vx - 10, topY + 5);
      ctx.lineTo(vx - 25, topY + 45);
      ctx.lineTo(vx - 18, topY + 95);
      ctx.lineTo(vx - 45, groundY);
      ctx.moveTo(vx + 12, topY + 5);
      ctx.lineTo(vx + 28, topY + 65);
      ctx.lineTo(vx + 48, groundY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Superheated Plasma Caldera Crater Glow
      const plasmaGrad = ctx.createRadialGradient(vx, topY, 4, vx, topY, cw * 1.2);
      plasmaGrad.addColorStop(0, '#ffffff');
      plasmaGrad.addColorStop(0.3, '#fbbf24');
      plasmaGrad.addColorStop(0.7, '#f43f5e');
      plasmaGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = plasmaGrad;
      ctx.beginPath();
      ctx.ellipse(vx, topY, cw * 0.8, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rising Geothermal Plasma Smoke Plume
      const plumeGrad = ctx.createLinearGradient(vx, topY, vx, topY - 140);
      plumeGrad.addColorStop(0, 'rgba(244, 63, 94, 0.45)');
      plumeGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.25)');
      plumeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = plumeGrad;
      ctx.beginPath();
      ctx.moveTo(vx - cw * 0.4, topY);
      ctx.quadraticCurveTo(vx - cw * 0.8 + Math.sin(time * 0.002) * 20, topY - 70, vx - 15, topY - 140);
      ctx.quadraticCurveTo(vx + cw * 0.8 + Math.sin(time * 0.002) * 20, topY - 70, vx + cw * 0.4, topY);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  // =========================================================================
  // 7. CRYSTAL FOREST (巨晶の森・クォーツ尖峰)
  // =========================================================================
  renderCrystalForest(ctx, width, height, time, windSpeed, accentColor, px, py) {
    ctx.save();
    const groundY = height * 0.95;

    for (const c of this.crystals) {
      const cx = c.relX * width + px * (c.layer + 1) * 3;
      const ch = c.height;
      const cw = c.width;
      const topX = cx + Math.sin(c.tilt) * ch;
      const topY = groundY - ch;

      // Hexagonal Crystal Facets (Left & Right)
      ctx.beginPath();
      ctx.moveTo(cx - cw * 0.5, groundY);
      ctx.lineTo(topX - cw * 0.2, topY + 18);
      ctx.lineTo(topX, topY);
      ctx.lineTo(cx, groundY);
      ctx.closePath();

      const g1 = ctx.createLinearGradient(topX, topY, cx, groundY);
      g1.addColorStop(0, '#ffffff');
      g1.addColorStop(0.3, c.color);
      g1.addColorStop(1, '#051022');
      ctx.fillStyle = g1;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx, groundY);
      ctx.lineTo(topX, topY);
      ctx.lineTo(topX + cw * 0.2, topY + 18);
      ctx.lineTo(cx + cw * 0.5, groundY);
      ctx.closePath();

      const g2 = ctx.createLinearGradient(topX, topY, cx, groundY);
      g2.addColorStop(0, c.color);
      g2.addColorStop(0.7, '#1e1b4b');
      g2.addColorStop(1, '#050a16');
      ctx.fillStyle = g2;
      ctx.fill();

      // Crystal Edge Bevel Stroke
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Internal Bioluminescent Energy Pulse
      const pulseY = topY + (Math.sin(time * 0.003 + cx) * 0.5 + 0.5) * ch;
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = c.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(cx, pulseY, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }

  // =========================================================================
  // 8. DESERT RUINS & STARGATE PORTAL (星屑砂漠・古代環状遺跡)
  // =========================================================================
  renderDesertRuins(ctx, width, height, time, windSpeed, accentColor, px, py) {
    ctx.save();
    const groundY = height * 0.94;

    // Rolling Golden Sand Dunes
    const dune1Y = height * 0.78;
    const d1Grad = ctx.createLinearGradient(0, dune1Y, 0, height);
    d1Grad.addColorStop(0, '#78350f');
    d1Grad.addColorStop(0.5, '#451a03');
    d1Grad.addColorStop(1, '#1c0a00');
    ctx.fillStyle = d1Grad;
    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let x = 0; x <= width; x += 30) {
      ctx.lineTo(x, dune1Y + Math.sin(x * 0.0025 + 0.5) * 35);
    }
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();

    // Ancient Stargate Portal Ring (Hero Feature)
    const portalX = width * 0.50 + px * 6;
    const portalY = height * 0.65;
    const portalR = 110;

    // Portal Outer Ring
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 16;
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(portalX, portalY, portalR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Glowing Alien Glyphs on Portal
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
      const gx = portalX + Math.cos(a) * portalR;
      const gy = portalY + Math.sin(a) * portalR;
      ctx.beginPath();
      ctx.arc(gx, gy, 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Event Horizon Swirling Vortex
    const vortexGrad = ctx.createRadialGradient(portalX, portalY, 10, portalX, portalY, portalR - 10);
    vortexGrad.addColorStop(0, 'rgba(0, 240, 255, 0.85)');
    vortexGrad.addColorStop(0.6, 'rgba(168, 85, 247, 0.45)');
    vortexGrad.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
    ctx.fillStyle = vortexGrad;
    ctx.beginPath();
    ctx.arc(portalX, portalY, portalR - 8, 0, Math.PI * 2);
    ctx.fill();

    // Surrounding Ancient Monoliths
    for (const r of this.ruins) {
      if (r.isPortal) continue;
      const rx = r.relX * width + px * 6;
      ctx.fillStyle = '#291807';
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.fillRect(rx - r.width * 0.5, groundY - r.height, r.width, r.height);
      ctx.strokeRect(rx - r.width * 0.5, groundY - r.height, r.width, r.height);
    }

    ctx.restore();
  }

  // =========================================================================
  // 9. DEEP ABYSS REEF (深淵発光サンゴ礁)
  // =========================================================================
  renderDeepAbyssReef(ctx, width, height, time, windSpeed, accentColor, px, py) {
    ctx.save();
    const seaY = height * 0.80;

    for (const r of this.reefs) {
      const rx = r.relX * width + px * 6;
      const rh = r.height;

      // Base Stalk
      ctx.strokeStyle = r.glowColor;
      ctx.lineWidth = 3;
      ctx.shadowColor = r.glowColor;
      ctx.shadowBlur = 10;

      for (let t = 0; t < r.tentacles; t++) {
        const angleOffset = (t / r.tentacles - 0.5) * 0.8;
        const wave = Math.sin(time * 0.002 + r.phase + t) * 18;

        ctx.beginPath();
        ctx.moveTo(rx, seaY + 40);
        ctx.quadraticCurveTo(rx + angleOffset * 60 + wave, seaY - rh * 0.5, rx + angleOffset * 100 + wave * 1.5, seaY - rh);
        ctx.stroke();

        // Bioluminescent bulb at tip
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(rx + angleOffset * 100 + wave * 1.5, seaY - rh, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }

  // =========================================================================
  // 10. SOLAR SPIRE (太陽受光塔・集光アレイ)
  // =========================================================================
  renderSolarSpire(ctx, width, height, time, windSpeed, accentColor, px, py) {
    ctx.save();
    const groundY = height * 0.95;

    for (const s of this.spires) {
      const sx = s.relX * width + px * (s.main ? 10 : 5);
      const sh = s.heightRatio * height;
      const topY = groundY - sh;

      // Spire Core Column
      const spireGrad = ctx.createLinearGradient(sx - 15, 0, sx + 15, 0);
      spireGrad.addColorStop(0, '#0f172a');
      spireGrad.addColorStop(0.5, '#e2e8f0');
      spireGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = spireGrad;
      ctx.fillRect(sx - 8, topY, 16, sh);

      // Rotating Concentric Collector Rings
      for (let r = 1; r <= 3; r++) {
        const ry = topY + r * 35;
        const ringW = 40 + r * 16;
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.75)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(sx, ry, ringW, 8, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Blinding Vertical Solar Energy Beam piercing the heavens
      if (s.main) {
        ctx.globalCompositeOperation = 'screen';
        const beamGrad = ctx.createLinearGradient(sx - 25, 0, sx + 25, 0);
        beamGrad.addColorStop(0, 'rgba(0, 240, 255, 0)');
        beamGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
        beamGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
        ctx.fillStyle = beamGrad;
        ctx.fillRect(sx - 25, 0, 50, topY);
      }
    }

    ctx.restore();
  }

  // =========================================================================
  // 11. NEBULA CANYON (星雲峡谷・大断崖)
  // =========================================================================
  renderNebulaCanyon(ctx, width, height, time, windSpeed, accentColor, px, py) {
    ctx.save();

    // Left Canyon Cliff
    const lCliffW = width * 0.38 + px * 8;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(lCliffW * 0.4, 0);
    ctx.lineTo(lCliffW * 0.65, height * 0.45);
    ctx.lineTo(lCliffW, height);
    ctx.lineTo(0, height);
    ctx.closePath();

    const lGrad = ctx.createLinearGradient(0, 0, lCliffW, 0);
    lGrad.addColorStop(0, '#0f172a');
    lGrad.addColorStop(0.8, '#1e293b');
    lGrad.addColorStop(1, '#090d16');
    ctx.fillStyle = lGrad;
    ctx.fill();

    // Right Canyon Cliff
    const rCliffW = width * 0.62 + px * 8;
    ctx.beginPath();
    ctx.moveTo(width, 0);
    ctx.lineTo(width - (width - rCliffW) * 0.4, 0);
    ctx.lineTo(width - (width - rCliffW) * 0.7, height * 0.45);
    ctx.lineTo(rCliffW, height);
    ctx.lineTo(width, height);
    ctx.closePath();

    const rGrad = ctx.createLinearGradient(width, 0, rCliffW, 0);
    rGrad.addColorStop(0, '#0f172a');
    rGrad.addColorStop(0.8, '#1e293b');
    rGrad.addColorStop(1, '#090d16');
    ctx.fillStyle = rGrad;
    ctx.fill();

    // Canyon Floor Glowing Leyline River
    ctx.globalCompositeOperation = 'screen';
    const riverGrad = ctx.createLinearGradient(0, height * 0.85, 0, height);
    riverGrad.addColorStop(0, 'rgba(0, 240, 255, 0)');
    riverGrad.addColorStop(0.5, 'rgba(0, 240, 255, 0.75)');
    riverGrad.addColorStop(1, 'rgba(168, 85, 247, 0.6)');
    ctx.fillStyle = riverGrad;
    ctx.fillRect(lCliffW - 10, height * 0.85, (rCliffW - lCliffW) + 20, height * 0.15);

    ctx.restore();
  }

  // =========================================================================
  // 12. MUSHROOM GROVE (発光茸の森・胞子樹林)
  // =========================================================================
  renderMushroomGrove(ctx, width, height, time, windSpeed, accentColor, px, py) {
    ctx.save();
    const groundY = height * 0.94;

    for (const m of this.mushrooms) {
      const mx = m.relX * width + px * (m.layer + 1) * 4;
      const sh = m.stemH;
      const cw = m.capW;
      const capY = groundY - sh;

      // Stem with internal luminescence
      ctx.fillStyle = '#061320';
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(mx - 8, groundY);
      ctx.quadraticCurveTo(mx - 4, groundY - sh * 0.5, mx - 6, capY);
      ctx.lineTo(mx + 6, capY);
      ctx.quadraticCurveTo(mx + 4, groundY - sh * 0.5, mx + 8, groundY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Translucent Glowing Umbrella Cap
      const capGrad = ctx.createRadialGradient(mx, capY - cw * 0.2, 5, mx, capY, cw * 0.7);
      capGrad.addColorStop(0, '#ffffff');
      capGrad.addColorStop(0.35, m.color);
      capGrad.addColorStop(1, 'rgba(15, 23, 42, 0.85)');
      ctx.fillStyle = capGrad;
      ctx.beginPath();
      ctx.arc(mx, capY, cw * 0.5, Math.PI, 0);
      ctx.closePath();
      ctx.fill();

      // Spore drops falling from mushroom
      const sporeY = capY + 10 + (time * 0.05 + mx) % 65;
      ctx.fillStyle = m.color;
      ctx.beginPath();
      ctx.arc(mx + (Math.sin(time * 0.003 + mx) * 12), sporeY, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // =========================================================================
  // 13. ETHEREAL SWAMP (幽霊沼沢・水鏡湿原)
  // =========================================================================
  renderEtherealSwamp(ctx, width, height, time, windSpeed, accentColor, px, py) {
    ctx.save();
    const waterY = height * 0.80;

    // Mirror-like Water Surface
    const waterGrad = ctx.createLinearGradient(0, waterY, 0, height);
    waterGrad.addColorStop(0, '#030c14');
    waterGrad.addColorStop(0.5, '#051824');
    waterGrad.addColorStop(1, '#02070d');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, waterY, width, height - waterY);

    // Glowing Water Lilies and Blooms
    for (const s of this.swamps) {
      const sx = s.relX * width + px * 6;
      const sy = waterY + 25 + Math.sin(time * 0.0012 + sx) * 8;
      const r = s.lilyRadius;

      // Lily Pad
      ctx.fillStyle = 'rgba(0, 255, 178, 0.18)';
      ctx.strokeStyle = 'rgba(0, 255, 178, 0.65)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(sx, sy, r, r * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Glowing Lotus Flower Bloom
      if (s.flower) {
        ctx.fillStyle = '#e879f9';
        ctx.shadowColor = '#e879f9';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(sx, sy - 6, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    ctx.restore();
  }

  // =========================================================================
  // 14. FLOATING CITADEL (天空要塞・幾何学モノリス)
  // =========================================================================
  renderFloatingCitadel(ctx, width, height, time, windSpeed, accentColor, px, py) {
    ctx.save();

    for (const c of this.citadels) {
      const cx = c.relX * width + px * 10;
      const cy = c.relY * height + Math.sin(time * 0.001 + cx) * 14 + py * 8;
      const s = c.size;

      // Outer Rotating Concentric Magnetic Rings
      for (let r = 1; r <= c.rings; r++) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(time * c.rotSpeed * (r % 2 === 0 ? -1.5 : 1.2) + r);

        ctx.strokeStyle = r === 1 ? 'rgba(0, 240, 255, 0.75)' : 'rgba(168, 85, 247, 0.5)';
        ctx.lineWidth = 2.0;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.75 * r * 0.55, s * 0.25 * r * 0.55, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      // Central Colossal Faceted Octahedral Fortress Core
      ctx.save();
      ctx.translate(cx, cy);

      // Top Half Diamond
      const topGrad = ctx.createLinearGradient(0, -s * 0.5, s * 0.4, 0);
      topGrad.addColorStop(0, '#e0f2fe');
      topGrad.addColorStop(0.5, '#0ea5e9');
      topGrad.addColorStop(1, '#082f49');
      ctx.fillStyle = topGrad;

      ctx.beginPath();
      ctx.moveTo(0, -s * 0.5);
      ctx.lineTo(s * 0.4, 0);
      ctx.lineTo(0, s * 0.1);
      ctx.lineTo(-s * 0.4, 0);
      ctx.closePath();
      ctx.fill();

      // Bottom Inverted Diamond
      const botGrad = ctx.createLinearGradient(0, 0, 0, s * 0.5);
      botGrad.addColorStop(0, '#082f49');
      botGrad.addColorStop(1, '#020617');
      ctx.fillStyle = botGrad;

      ctx.beginPath();
      ctx.moveTo(-s * 0.4, 0);
      ctx.lineTo(0, s * 0.1);
      ctx.lineTo(s * 0.4, 0);
      ctx.lineTo(0, s * 0.5);
      ctx.closePath();
      ctx.fill();

      // Glowing Fortress Edge Armor & Forcefield Seams
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.9)';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Hangar Docking Beacon Lights
      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 6;
      ctx.fillRect(-8, -4, 16, 8);
      ctx.shadowBlur = 0;

      ctx.restore();
    }

    ctx.restore();
  }

  // =========================================================================
  // 15. LAVA OCEAN (溶融プラズマ海)
  // =========================================================================
  renderLavaOcean(ctx, width, height, time, windSpeed, accentColor, px, py) {
    ctx.save();
    const seaY = height * 0.74;

    const lavaGrad = ctx.createLinearGradient(0, seaY, 0, height);
    lavaGrad.addColorStop(0, '#450a0a');
    lavaGrad.addColorStop(0.5, '#7f1d1d');
    lavaGrad.addColorStop(1, '#1c0505');
    ctx.fillStyle = lavaGrad;
    ctx.fillRect(0, seaY, width, height - seaY);

    for (const w of this.waves) {
      const wy = w.baseYRel * height;
      ctx.beginPath();
      ctx.moveTo(0, height);

      for (let x = 0; x <= width; x += 18) {
        const y = wy + Math.sin(x * w.freq + time * w.speed * 1.5 + w.phase) * w.amp;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.closePath();

      ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.fill();

      // Superheated Golden Orange Crest
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)';
      ctx.lineWidth = 2.4;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }

  // =========================================================================
  // 16. AURORA TUNDRA (極光ツンドラ・発光苔原)
  // =========================================================================
  renderAuroraTundra(ctx, width, height, time, windSpeed, accentColor, px, py) {
    ctx.save();
    const groundY = height * 0.88;

    // Permafrost Expanse
    const tundraGrad = ctx.createLinearGradient(0, groundY, 0, height);
    tundraGrad.addColorStop(0, '#071d24');
    tundraGrad.addColorStop(0.5, '#041217');
    tundraGrad.addColorStop(1, '#010507');
    ctx.fillStyle = tundraGrad;
    ctx.fillRect(0, groundY, width, height - groundY);

    // Glowing Bioluminescent Lichen Patches
    for (const t of this.tundras) {
      const tx = t.relX * width + px * 6;
      const pulse = 0.5 + 0.5 * Math.sin(time * 0.002 + tx);

      ctx.fillStyle = t.color;
      ctx.shadowColor = t.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.ellipse(tx, groundY + 15 + (tx % 25), t.height * 0.7, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }
}
