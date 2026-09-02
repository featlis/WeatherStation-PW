/**
 * CreaturesAndAnomaliesRenderer
 * Renders celestial wildlife, skycraft, meteor showers, and gravity ripples:
 * 1. Astral Leviathan / Star Whale (星鯨 / エーテルマンタ)
 * 2. Ether Skiffs / Sky Pods (空中飛行艇)
 * 3. Sporadic Meteors & Shooting Stars (流星雨)
 * 4. Interactive Gravity Shockwave Ripples (重力波クリック)
 */

export class CreaturesAndAnomaliesRenderer {
  constructor() {
    this.leviathan = null;
    this.lastLeviathanSpawn = 0;
    this.skiffs = [];
    this.meteors = [];
    this.gravityRipples = [];
    this.lastMeteorTime = 0;

    this.initSkiffs();
  }

  initSkiffs() {
    this.skiffs = [
      { x: -100, yRel: 0.32, speed: 0.65, size: 14, color: '#00f0ff', trail: [] },
      { x: -300, yRel: 0.48, speed: 0.45, size: 10, color: '#f43f5e', trail: [] }
    ];
  }

  addGravityRipple(x, y) {
    this.gravityRipples.push({
      x,
      y,
      radius: 4,
      maxRadius: 180,
      alpha: 0.95
    });
  }

  render(ctx, width, height, time, params) {
    const { windSpeed, isDay } = params;

    // 1. Meteors (Active in night & windy conditions)
    this.renderMeteors(ctx, width, height, time, windSpeed, isDay);

    // 2. Astral Leviathan / Star Whale
    this.renderLeviathan(ctx, width, height, time, params);

    // 3. Ether Skiffs / Sky Pods
    this.renderSkiffs(ctx, width, height, time);

    // 4. Gravity Shockwave Ripples
    this.renderGravityRipples(ctx);
  }

  // =========================================================================
  // 1. ASTRAL LEVIATHAN (星空を遊泳する巨大星鯨)
  // =========================================================================
  renderLeviathan(ctx, width, height, time, params) {
    // Spawn leviathan every 25-45 seconds or on initial load
    if (!this.leviathan && time - this.lastLeviathanSpawn > 22000) {
      if (Math.random() < 0.6 || this.lastLeviathanSpawn === 0) {
        this.lastLeviathanSpawn = time;
        const fromLeft = Math.random() > 0.5;
        this.leviathan = {
          x: fromLeft ? -220 : width + 220,
          y: height * (0.15 + Math.random() * 0.35),
          vx: fromLeft ? (0.4 + Math.random() * 0.3) : -(0.4 + Math.random() * 0.3),
          length: 160 + Math.random() * 80,
          phase: Math.random() * Math.PI * 2,
          spores: []
        };
      }
    }

    if (!this.leviathan) return;

    const lev = this.leviathan;
    lev.x += lev.vx;

    // Remove when out of screen
    if ((lev.vx > 0 && lev.x > width + 300) || (lev.vx < 0 && lev.x < -300)) {
      this.leviathan = null;
      return;
    }

    ctx.save();
    ctx.translate(lev.x, lev.y);
    if (lev.vx < 0) ctx.scale(-1, 1);

    const swimWave = Math.sin(time * 0.0018 + lev.phase);
    const L = lev.length;

    // Leviathan Body (Graceful tapered whale/manta silhouette)
    ctx.beginPath();
    ctx.moveTo(L * 0.5, 0); // Head snout
    ctx.quadraticCurveTo(L * 0.2, -L * 0.16 + swimWave * 4, -L * 0.2, -L * 0.1); // Upper back
    ctx.quadraticCurveTo(-L * 0.45, -L * 0.05 + swimWave * 8, -L * 0.5, swimWave * 12); // Tail base
    ctx.quadraticCurveTo(-L * 0.45, L * 0.05 + swimWave * 8, -L * 0.2, L * 0.1); // Belly
    ctx.quadraticCurveTo(L * 0.2, L * 0.16 + swimWave * 4, L * 0.5, 0); // Chin
    ctx.closePath();

    // Bioluminescent ethereal gradient
    const levGrad = ctx.createLinearGradient(-L * 0.5, 0, L * 0.5, 0);
    levGrad.addColorStop(0, 'rgba(168, 85, 247, 0.15)');
    levGrad.addColorStop(0.5, 'rgba(0, 240, 255, 0.4)');
    levGrad.addColorStop(1, 'rgba(235, 248, 255, 0.7)');

    ctx.fillStyle = levGrad;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 18;
    ctx.fill();

    // Glowing edge spine
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Pectoral Fin (Swinging fin)
    const finAngle = Math.sin(time * 0.002) * 0.35;
    ctx.save();
    ctx.translate(L * 0.1, 0);
    ctx.rotate(finAngle);
    ctx.fillStyle = 'rgba(0, 240, 255, 0.3)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-L * 0.15, L * 0.28, -L * 0.3, L * 0.35);
    ctx.quadraticCurveTo(-L * 0.15, L * 0.15, 0, 0);
    ctx.fill();
    ctx.restore();

    // Tail Fluke
    ctx.save();
    ctx.translate(-L * 0.5, swimWave * 12);
    ctx.rotate(swimWave * 0.2);
    ctx.fillStyle = 'rgba(168, 85, 247, 0.5)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-20, -25, -35, -30);
    ctx.quadraticCurveTo(-15, 0, 0, 0);
    ctx.quadraticCurveTo(-15, 0, -35, 30);
    ctx.quadraticCurveTo(-20, 25, 0, 0);
    ctx.fill();
    ctx.restore();

    // Constellation spots on whale belly
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 6; i++) {
      const sx = -L * 0.3 + i * (L * 0.12);
      const sy = Math.sin(i * 1.5 + time * 0.002) * (L * 0.06);
      ctx.beginPath();
      ctx.arc(sx, sy, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // Spawn trailing stardust spores behind whale
    if (Math.random() < 0.4) {
      lev.spores.push({
        x: lev.x - (lev.vx > 0 ? lev.length * 0.45 : -lev.length * 0.45),
        y: lev.y + swimWave * 10 + (Math.random() - 0.5) * 20,
        alpha: 0.8,
        size: Math.random() * 2.2 + 0.8
      });
    }

    // Render spores
    ctx.save();
    for (let i = lev.spores.length - 1; i >= 0; i--) {
      const sp = lev.spores[i];
      sp.alpha -= 0.012;
      sp.y += 0.2;
      ctx.fillStyle = `rgba(0, 240, 255, ${sp.alpha})`;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
      ctx.fill();
      if (sp.alpha <= 0) lev.spores.splice(i, 1);
    }
    ctx.restore();
  }

  // =========================================================================
  // 2. ETHER SKIFFS / SKY PODS (空中飛行艇)
  // =========================================================================
  renderSkiffs(ctx, width, height, time) {
    ctx.save();
    for (const skiff of this.skiffs) {
      skiff.x += skiff.speed;
      const sy = height * skiff.yRel + Math.sin(time * 0.001 + skiff.x * 0.01) * 6;

      // Draw light trail
      skiff.trail.push({ x: skiff.x, y: sy, alpha: 0.7 });
      if (skiff.trail.length > 22) skiff.trail.shift();

      ctx.beginPath();
      for (let i = 0; i < skiff.trail.length; i++) {
        const pt = skiff.trail[i];
        const a = (i / skiff.trail.length) * 0.5;
        ctx.strokeStyle = skiff.color === '#00f0ff' ? `rgba(0, 240, 255, ${a})` : `rgba(244, 63, 94, ${a})`;
        ctx.lineWidth = 1.2;
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();

      // Skiff Hull
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = skiff.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.ellipse(skiff.x, sy, skiff.size * 0.6, skiff.size * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Engine Thruster Glow
      ctx.fillStyle = skiff.color;
      ctx.beginPath();
      ctx.arc(skiff.x - skiff.size * 0.6, sy, 2.5, 0, Math.PI * 2);
      ctx.fill();

      if (skiff.x > width + 200) {
        skiff.x = -150;
        skiff.yRel = 0.25 + Math.random() * 0.35;
        skiff.trail = [];
      }
    }
    ctx.restore();
  }

  // =========================================================================
  // 3. METEORS / SHOOTING STARS (流星雨)
  // =========================================================================
  renderMeteors(ctx, width, height, time, windSpeed, isDay) {
    if (time - this.lastMeteorTime > 3200 && Math.random() < 0.35) {
      this.lastMeteorTime = time;
      this.meteors.push({
        x: width * (0.2 + Math.random() * 0.7),
        y: Math.random() * (height * 0.3),
        vx: -(4.0 + Math.random() * 4.0),
        vy: 3.5 + Math.random() * 3.5,
        length: 60 + Math.random() * 80,
        alpha: 1.0
      });
    }

    ctx.save();
    for (let i = this.meteors.length - 1; i >= 0; i--) {
      const m = this.meteors[i];
      m.x += m.vx;
      m.y += m.vy;
      m.alpha -= 0.025;

      const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 12, m.y - m.vy * 12);
      grad.addColorStop(0, `rgba(255, 255, 255, ${m.alpha})`);
      grad.addColorStop(0.3, `rgba(0, 240, 255, ${m.alpha * 0.7})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - m.vx * 12, m.y - m.vy * 12);
      ctx.stroke();

      if (m.alpha <= 0 || m.x < -100 || m.y > height + 100) {
        this.meteors.splice(i, 1);
      }
    }
    ctx.restore();
  }

  // =========================================================================
  // 4. GRAVITY SHOCKWAVE RIPPLES (重力波クリック)
  // =========================================================================
  renderGravityRipples(ctx) {
    ctx.save();
    for (let i = this.gravityRipples.length - 1; i >= 0; i--) {
      const rip = this.gravityRipples[i];
      rip.radius += 3.8;
      rip.alpha -= 0.022;

      // Double expanding ring
      ctx.strokeStyle = `rgba(0, 240, 255, ${rip.alpha * 0.8})`;
      ctx.lineWidth = 2.0;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 12;

      ctx.beginPath();
      ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner faint harmonic ring
      ctx.strokeStyle = `rgba(168, 85, 247, ${rip.alpha * 0.4})`;
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.arc(rip.x, rip.y, Math.max(0, rip.radius - 20), 0, Math.PI * 2);
      ctx.stroke();

      if (rip.alpha <= 0 || rip.radius >= rip.maxRadius) {
        this.gravityRipples.splice(i, 1);
      }
    }
    ctx.restore();
  }
}
