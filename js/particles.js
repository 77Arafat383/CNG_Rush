/**
 * Particle Effects & Skid Mark System for CNG Rush
 * Handles exhaust smoke puffs, tire skids, crash sparks/debris, rain splashes,
 * floating reward/penalty texts, and screen shake.
 */

class ParticleSystem {
  constructor() {
    this.particles = [];
    this.skidMarks = [];
    this.floatingTexts = [];
    this.maxSkids = 120;
    this.screenShakeIntensity = 0;
    this.shakeDecay = 0.9;
  }

  reset() {
    this.particles = [];
    this.skidMarks = [];
    this.floatingTexts = [];
    this.screenShakeIntensity = 0;
  }

  triggerShake(intensity = 10) {
    this.screenShakeIntensity = Math.min(24, Math.max(this.screenShakeIntensity, intensity));
  }

  getShakeOffset() {
    if (this.screenShakeIntensity <= 0.2) return { x: 0, y: 0 };
    const angle = Math.random() * Math.PI * 2;
    const dist = this.screenShakeIntensity;
    return {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist
    };
  }

  addSkidMark(x, y, width = 6, opacity = 0.4) {
    this.skidMarks.push({
      x,
      y,
      width,
      opacity,
      life: 1.0
    });
    if (this.skidMarks.length > this.maxSkids) {
      this.skidMarks.shift();
    }
  }

  addExhaustSmoke(x, y, speedY = 0) {
    this.particles.push({
      type: 'smoke',
      x: x + (Math.random() * 4 - 2),
      y: y + (Math.random() * 4 - 2),
      vx: (Math.random() * 0.8 - 0.4),
      vy: 1.5 + Math.random() * 1.5 + (speedY > 0 ? speedY * 0.2 : 0),
      size: 4 + Math.random() * 3,
      maxSize: 14 + Math.random() * 6,
      color: 'rgba(148, 163, 184,',
      alpha: 0.5,
      decay: 0.025
    });
  }

  addSparks(x, y, count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      this.particles.push({
        type: 'spark',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        color: Math.random() > 0.3 ? '#facc15' : '#ef4444',
        alpha: 1.0,
        decay: 0.04 + Math.random() * 0.04
      });
    }
  }

  addWaterSplash(x, y, count = 16) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4.5;
      this.particles.push({
        type: 'splash',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 4,
        color: '#38bdf8',
        alpha: 0.8,
        decay: 0.03
      });
    }
  }

  addMoneySparkle(x, y, count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      this.particles.push({
        type: 'sparkle',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: 4 + Math.random() * 3,
        color: Math.random() > 0.5 ? '#10b981' : '#facc15',
        alpha: 1.0,
        decay: 0.02
      });
    }
  }

  addFloatingText(text, x, y, type = 'reward') {
    this.floatingTexts.push({
      text,
      x,
      y,
      type,
      vy: -1.2,
      alpha: 1.0,
      scale: 1.2,
      life: 60
    });
  }

  update(worldSpeedY = 0) {
    // Decay shake
    this.screenShakeIntensity *= this.shakeDecay;
    if (this.screenShakeIntensity < 0.2) this.screenShakeIntensity = 0;

    // Update skid marks position with scrolling world
    for (let i = this.skidMarks.length - 1; i >= 0; i--) {
      const sm = this.skidMarks[i];
      sm.y += worldSpeedY;
      sm.life -= 0.002;
      if (sm.life <= 0 || sm.y > 1400 || sm.y < -400) {
        this.skidMarks.splice(i, 1);
      }
    }

    // Update active particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy + worldSpeedY;
      p.alpha -= p.decay;

      if (p.type === 'smoke') {
        p.size += 0.35;
      }

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy + worldSpeedY * 0.3;
      ft.life--;
      ft.scale = Math.max(1, ft.scale - 0.005);
      if (ft.life < 20) {
        ft.alpha = ft.life / 20;
      }
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  drawSkids(ctx) {
    for (const sm of this.skidMarks) {
      ctx.fillStyle = `rgba(15, 23, 42, ${sm.opacity * sm.life})`;
      ctx.fillRect(sm.x - sm.width / 2, sm.y, sm.width, 10);
    }
  }

  drawParticles(ctx) {
    for (const p of this.particles) {
      ctx.save();
      if (p.type === 'smoke') {
        ctx.fillStyle = `${p.color} ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'spark' || p.type === 'sparkle') {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'splash') {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  drawFloatingTexts(ctx) {
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.translate(ft.x, ft.y);
      ctx.scale(ft.scale, ft.scale);

      ctx.font = 'bold 18px "Chakra Petch", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Outline
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.lineWidth = 4;
      ctx.strokeText(ft.text, 0, 0);

      // Fill color based on type
      if (ft.type === 'reward') {
        ctx.fillStyle = '#34d399';
      } else if (ft.type === 'penalty') {
        ctx.fillStyle = '#f87171';
      } else if (ft.type === 'bonus') {
        ctx.fillStyle = '#facc15';
      } else {
        ctx.fillStyle = '#38bdf8';
      }
      ctx.fillText(ft.text, 0, 0);

      ctx.restore();
    }
  }
}

window.ParticleSystem = ParticleSystem;
