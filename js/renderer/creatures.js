/**
 * CreaturesAndAnomaliesRenderer
 * Renders celestial wildlife, skycraft, meteor showers, and gravity ripples:
 * 1. Astral Leviathan / Star Whale (Segmented swimming spine, celestial wings, stardust wake)
 * 2. Ether Skiffs / Sky Pods (Aerodynamic exploratory vessels with ion particle plumes)
 * 3. Meteors & Bolides (Incandescent atmospheric streaks with burst sparks)
 * 4. Interactive Gravity Shockwave Ripples (Multi-ring chromatic dispersion)
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
      { x: -120, yRel: 0.32, speed: 0.75, size: 16, color: '#00f0ff', trail: [] },
      { x: -340, yRel: 0.46, speed: 0.52, size: 12, color: '#f43f5e', trail: [] }
    ];
  }

  addGravityRipple(x, y) {
    this.gravityRipples.push({
      x,
      y,
      radius: 4,
      maxRadius: 240,
      alpha: 1.0,
      rings: [0, -15, -30]
    });
  }

  render(ctx, width, height, time, params, px = 0, py = 0) {
    const { windSpeed, isDay } = params;

    // 1. Meteors (Active in night & twilight)
    this.renderMeteors(ctx, width, height, time, windSpeed, isDay);

    // 2. Astral Leviathan / Star Whale
    this.renderLeviathan(ctx, width, height, time, params, px, py);

    // 3. Ether Skiffs / Sky Pods
    this.renderSkiffs(ctx, width, height, time);

    // 4. Interactive Gravity Shockwave Ripples
    this.renderGravityRipples(ctx);
  }

  // =========================================================================
  // 1. ASTRAL LEVIATHAN (星空を遊泳する星鯨・エーテルマンタ)
  // =========================================================================
  renderLeviathan(ctx, width, height, time, params, px = 0, py = 0) {
    if (!this.leviathan && time - this.lastLeviathanSpawn > 18000) {
      this.lastLeviathanSpawn = time;
      const fromLeft = Math.random() > 0.5;
      this.leviathan = {
        x: fromLeft ? -260 : width + 260,
        y: height * (0.16 + Math.random() * 0.32),
        vx: fromLeft ? (0.45 + Math.random() * 0.3) : -(0.45 + Math.random() * 0.3),
        length: 220 + Math.random() * 90,
        phase: Math.random() * Math.PI * 2,
        wakeParticles: []
      };
    }

    if (!this.leviathan) return;
    const lev = this.leviathan;
    lev.x += lev.vx;

    // Wake particle emission
    if (Math.random() < 0.65) {
      lev.wakeParticles.push({
        x: lev.vx > 0 ? lev.x - lev.length * 0.5 : lev.x + lev.length * 0.5,
        y: lev.y + (Math.random() - 0.5) * 16,
        vx: -lev.vx * 0.25 + (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.3,
        alpha: 0.9,
        size: Math.random() * 2.8 + 1.2,
        color: Math.random() > 0.5 ? '#00f0ff' : '#e879f9'
      });
    }

    // Update wake particles
    for (let i = lev.wakeParticles.length - 1; i >= 0; i--) {
      const p = lev.wakeParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.007;
      if (p.alpha <= 0) {
        lev.wakeParticles.splice(i, 1);
      }
    }

    // Render Wake Particles
    ctx.save();
    for (const p of lev.wakeParticles) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Check exit
    if ((lev.vx > 0 && lev.x > width + 350) || (lev.vx < 0 && lev.x < -350)) {
      this.leviathan = null;
      return;
    }

    ctx.save();
    ctx.translate(lev.x, lev.y);
    if (lev.vx < 0) ctx.scale(-1, 1);

    const L = lev.length;
    const wave = Math.sin(time * 0.0018 + lev.phase);

    // Segmented Spine Curve
    ctx.beginPath();
    ctx.moveTo(L * 0.48, 0); // Snout
    ctx.quadraticCurveTo(L * 0.2, -L * 0.16 + wave * 4, -L * 0.1, -L * 0.11 + wave * 6);
    ctx.quadraticCurveTo(-L * 0.35, -L * 0.05 + wave * 10, -L * 0.5, wave * 14); // Tail
    ctx.quadraticCurveTo(-L * 0.35, L * 0.05 + wave * 10, -L * 0.1, L * 0.11 + wave * 6);
    ctx.quadraticCurveTo(L * 0.2, L * 0.16 + wave * 4, L * 0.48, 0);
    ctx.closePath();

    // Bioluminescent Body Gradient
    const levGrad = ctx.createLinearGradient(-L * 0.5, 0, L * 0.5, 0);
    levGrad.addColorStop(0, 'rgba(168, 85, 247, 0.2)');
    levGrad.addColorStop(0.45, 'rgba(0, 240, 255, 0.45)');
    levGrad.addColorStop(0.85, 'rgba(240, 249, 255, 0.85)');
    ctx.fillStyle = levGrad;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 18;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Glowing Spine Contour
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Undulating Pectoral Wings / Fins (3D-like flutter)
    const finFlap = Math.sin(time * 0.0022) * 0.4;
    ctx.save();
    ctx.translate(L * 0.12, 0);
    ctx.rotate(finFlap);

    // Top Wing
    ctx.fillStyle = 'rgba(0, 240, 255, 0.35)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-L * 0.15, -L * 0.32, -L * 0.32, -L * 0.42);
    ctx.quadraticCurveTo(-L * 0.18, -L * 0.16, 0, 0);
    ctx.fill();

    // Bottom Wing
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-L * 0.15, L * 0.32, -L * 0.32, L * 0.42);
    ctx.quadraticCurveTo(-L * 0.18, L * 0.16, 0, 0);
    ctx.fill();
    ctx.restore();

    // Tail Fluke
    ctx.save();
    ctx.translate(-L * 0.5, wave * 14);
    ctx.rotate(wave * 0.22);
    ctx.fillStyle = 'rgba(168, 85, 247, 0.6)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-25, -30, -42, -35);
    ctx.quadraticCurveTo(-20, 0, 0, 0);
    ctx.quadraticCurveTo(-20, 0, -42, 35);
    ctx.quadraticCurveTo(-25, 30, 0, 0);
    ctx.fill();
    ctx.restore();

    // Belly Constellation Points
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 6;
    for (let i = 0; i < 7; i++) {
      const bx = -L * 0.32 + i * (L * 0.11);
      const by = Math.sin(i * 1.4 + time * 0.002) * (L * 0.05);
      ctx.beginPath();
      ctx.arc(bx, by, 2.0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // =========================================================================
  // 2. ETHER SKIFFS / SKY PODS (空中探査艇)
  // =========================================================================
  renderSkiffs(ctx, width, height, time) {
    ctx.save();
    for (const s of this.skiffs) {
      s.x += s.speed;
      if (s.x > width + 200) {
        s.x = -200;
        s.yRel = 0.25 + Math.random() * 0.35;
      }

      const sy = s.yRel * height;

      // Ion Particle Plume Trail
      s.trail.push({ x: s.x, y: sy, alpha: 0.8 });
      if (s.trail.length > 24) s.trail.shift();

      for (let i = 0; i < s.trail.length; i++) {
        const pt = s.trail[i];
        const a = (i / s.trail.length) * 0.65;
        ctx.fillStyle = s.color;
        ctx.globalAlpha = a;
        ctx.beginPath();
        ctx.arc(pt.x - 12, pt.y, (i / s.trail.length) * 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Sleek Vessel Body
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = '#e2e8f0';
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 8;

      ctx.beginPath();
      ctx.moveTo(s.x + s.size, sy);
      ctx.lineTo(s.x - s.size * 0.6, sy - s.size * 0.3);
      ctx.lineTo(s.x - s.size * 0.4, sy);
      ctx.lineTo(s.x - s.size * 0.6, sy + s.size * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  // =========================================================================
  // 3. METEORS & SHOOTING STARS (流星群)
  // =========================================================================
  renderMeteors(ctx, width, height, time, windSpeed, isDay) {
    if (isDay) return;

    if (time - this.lastMeteorTime > 2600 && Math.random() < 0.45) {
      this.lastMeteorTime = time;
      this.meteors.push({
        x: Math.random() * width * 0.8 + width * 0.1,
        y: Math.random() * height * 0.35,
        len: 80 + Math.random() * 120,
        speed: 9 + Math.random() * 8,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.25,
        alpha: 1.0
      });
    }

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = this.meteors.length - 1; i >= 0; i--) {
      const m = this.meteors[i];
      m.x += Math.cos(m.angle) * m.speed;
      m.y += Math.sin(m.angle) * m.speed;
      m.alpha -= 0.024;

      if (m.alpha <= 0) {
        this.meteors.splice(i, 1);
        continue;
      }

      const tailX = m.x - Math.cos(m.angle) * m.len;
      const tailY = m.y - Math.sin(m.angle) * m.len;

      const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      grad.addColorStop(0.3, 'rgba(0, 240, 255, 0.7)');
      grad.addColorStop(1, 'rgba(0, 240, 255, 0)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();

      // Sparkling Head
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(m.x, m.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // =========================================================================
  // 4. INTERACTIVE GRAVITY SHOCKWAVE RIPPLES (重力波)
  // =========================================================================
  renderGravityRipples(ctx) {
    if (this.gravityRipples.length === 0) return;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    for (let i = this.gravityRipples.length - 1; i >= 0; i--) {
      const r = this.gravityRipples[i];
      r.radius += 4.5;
      r.alpha = Math.max(0, 1 - (r.radius / r.maxRadius));

      if (r.radius >= r.maxRadius || r.alpha <= 0.01) {
        this.gravityRipples.splice(i, 1);
        continue;
      }

      // Outer Ring (Cyan)
      ctx.strokeStyle = `rgba(0, 240, 255, ${r.alpha * 0.75})`;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner Harmonic Ring (Violet)
      if (r.radius > 20) {
        ctx.strokeStyle = `rgba(168, 85, 247, ${r.alpha * 0.55})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius * 0.75, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}
