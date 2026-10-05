/**
 * Traffic & Dynamic Obstacle System for CNG Rush
 * Manages Dhaka traffic AI with perspective scaling and lane following.
 * Vehicles, rickshaws, and pedestrians start in the distance and grow
 * as they approach the player, providing deep view in length.
 */

class TrafficManager {
  constructor(roadManager) {
    this.road = roadManager;
    this.vehicles = [];
    this.pedestrians = [];
    this.processions = [];

    this.spawnTimer = 0;
    this.pedestrianTimer = 0;
    this.processionTimer = 0;

    // Difficulty settings
    this.level = 1;
    this.densityMultiplier = 1;
  }

  reset() {
    this.vehicles = [];
    this.pedestrians = [];
    this.processions = [];
    this.spawnTimer = 0;
    this.pedestrianTimer = 0;
    this.processionTimer = 0;
  }

  setLevel(lvl) {
    this.level = lvl;
    if (lvl === 1) {
      this.densityMultiplier = 0.85;
    } else if (lvl === 2) {
      this.densityMultiplier = 1.15;
    } else if (lvl === 3) {
      this.densityMultiplier = 1.4;
    } else {
      this.densityMultiplier = 1.8;
    }
  }

  spawnVehicle() {
    const lane = Math.floor(Math.random() * 4);
    const inRightLane = lane === 3;
    const y = this.road.horizonY + 20; // spawns in distance

    const r = Math.random();
    let type, baseW, baseH, baseSpeed, color, stripeColor, slogan;

    if (inRightLane && Math.random() < 0.5) {
      if (Math.random() < 0.6) {
        type = 'rickshaw';
        baseW = 46;
        baseH = 74;
        baseSpeed = 1.4 + Math.random() * 0.6;
        color = '#0284c7';
      } else {
        type = 'cng';
        baseW = 54; // EXACT same size as CNG
        baseH = 88;
        baseSpeed = 2.8 + Math.random() * 1.0;
        color = '#047857';
      }
    } else if (r < 0.38) {
      // Dhaka City Bus (Realistic bus proportions compared to CNG)
      type = 'bus';
      baseW = 94;
      baseH = 210;
      baseSpeed = 2.4 + Math.random() * 0.8;
      const busColors = ['#1d4ed8', '#b91c1c', '#047857', '#7c3aed'];
      color = busColors[Math.floor(Math.random() * busColors.length)];
      stripeColor = '#facc15';
      const slogans = ['আল্লাহ ভরসা', 'মা বাবার দোয়া', 'দূরন্ত এক্সপ্রেস', 'ভিআইপি পরিবহন'];
      slogan = slogans[Math.floor(Math.random() * slogans.length)];
    } else if (r < 0.72) {
      // Cycle Rickshaw (Dhaka 3-wheeler)
      type = 'rickshaw';
      baseW = 46;
      baseH = 74;
      baseSpeed = 1.4 + Math.random() * 0.6;
      const hoods = ['#e11d48', '#0284c7', '#16a34a', '#d97706'];
      color = hoods[Math.floor(Math.random() * hoods.length)];
    } else {
      // AI CNG Auto-Rickshaw (EXACT same size as player CNG)
      type = 'cng';
      baseW = 54;
      baseH = 88;
      baseSpeed = 2.8 + Math.random() * 1.0;
      color = Math.random() > 0.3 ? '#0a7e3a' : '#475569';
    }

    // Check spacing against existing vehicles in this lane near top
    const tooClose = this.vehicles.some(v => v.lane === lane && Math.abs(v.y - y) < 80);
    if (tooClose) return;

    const x = this.road.getLaneCenter(lane, y);

    this.vehicles.push({
      type,
      lane,
      x,
      y,
      baseW,
      baseH,
      baseSpeed,
      speed: baseSpeed,
      color,
      stripeColor,
      slogan,
      laneOffset: 0,
      scaredTimer: 0
    });
  }

  spawnPedestrian() {
    const fromLeft = Math.random() > 0.5;
    const y = this.road.horizonY + 60 + Math.random() * (this.road.height * 0.45);
    const startNormX = fromLeft ? -1.15 : 1.15;

    const colors = ['#2563eb', '#dc2626', '#059669', '#d97706', '#9333ea'];
    this.pedestrians.push({
      normX: startNormX,
      x: this.road.getScreenX(startNormX, y),
      y,
      speedNormX: fromLeft ? (0.012 + Math.random() * 0.008) : (-0.012 - Math.random() * 0.008),
      walkCycle: Math.random() * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      hasUmbrella: this.road.weather === 'rain' || Math.random() < 0.25,
      isScared: false,
      scaredTimer: 0
    });
  }

  spawnProcession() {
    if (this.processions.length > 0) return;
    const y = this.road.horizonY + 25;
    this.processions.push({
      y,
      speed: 0.6,
      time: 0
    });
  }

  /**
   * Horn blast reaction
   */
  reactToHorn(playerX, playerY, hornRadius = 260) {
    let affectedCount = 0;

    for (const v of this.vehicles) {
      const dist = Math.hypot(v.x - playerX, v.y - playerY);
      if (dist < hornRadius && v.y < playerY + 30) {
        v.scaredTimer = 50;
        // Swerve to shoulder
        if (v.type === 'rickshaw') {
          v.laneOffset = v.lane === 3 ? 18 : -18;
          v.speed = v.baseSpeed * 1.5;
        } else {
          v.speed = v.baseSpeed * 1.35;
        }
        affectedCount++;
      }
    }

    for (const p of this.pedestrians) {
      const dist = Math.hypot(p.x - playerX, p.y - playerY);
      if (dist < hornRadius) {
        p.isScared = true;
        p.scaredTimer = 60;
        p.speedNormX *= 1.8;
        affectedCount++;
      }
    }

    return affectedCount;
  }

  update(worldSpeedY, time) {
    // 1. Spawning
    this.spawnTimer++;
    const spawnThreshold = Math.max(40, Math.floor(100 / this.densityMultiplier));
    if (this.spawnTimer >= spawnThreshold) {
      this.spawnTimer = 0;
      if (this.vehicles.length < 8) {
        this.spawnVehicle();
      }
    }

    // Pedestrians (Level 2+)
    if (this.level >= 2) {
      this.pedestrianTimer++;
      if (this.pedestrianTimer >= 170 / this.densityMultiplier) {
        this.pedestrianTimer = 0;
        if (this.pedestrians.length < 3) {
          this.spawnPedestrian();
        }
      }
    }

    // Procession (Level 4)
    if (this.level >= 4) {
      this.processionTimer++;
      if (this.processionTimer >= 850) {
        this.processionTimer = 0;
        this.spawnProcession();
      }
    }

    // 2. Update Vehicles
    for (let i = this.vehicles.length - 1; i >= 0; i--) {
      const v = this.vehicles[i];
      const scale = this.road.getScale(v.y);

      // Relative downward motion: moves down at own speed + world scrolling speed
      v.y += worldSpeedY + v.speed * scale;

      // Calculate perspective X coordinate
      const laneCenterX = this.road.getLaneCenter(v.lane, v.y);
      v.x = laneCenterX + v.laneOffset * scale;

      if (v.scaredTimer > 0) {
        v.scaredTimer--;
        if (v.scaredTimer === 0) {
          v.speed = v.baseSpeed;
          v.laneOffset = 0;
        }
      }

      // Cull off screen
      if (v.y > this.road.height + 180 || v.y < this.road.horizonY - 40) {
        this.vehicles.splice(i, 1);
      }
    }

    // 3. Update Pedestrians
    for (let i = this.pedestrians.length - 1; i >= 0; i--) {
      const p = this.pedestrians[i];
      p.normX += p.speedNormX;
      p.y += worldSpeedY;
      p.x = this.road.getScreenX(p.normX, p.y);
      p.walkCycle += 0.08;

      if (p.scaredTimer > 0) {
        p.scaredTimer--;
        if (p.scaredTimer === 0) p.isScared = false;
      }

      if (Math.abs(p.normX) > 1.45 || p.y > this.road.height + 60 || p.y < this.road.horizonY - 20) {
        this.pedestrians.splice(i, 1);
      }
    }

    // 4. Update Processions
    for (let i = this.processions.length - 1; i >= 0; i--) {
      const pr = this.processions[i];
      const scale = this.road.getScale(pr.y);
      pr.y += worldSpeedY + pr.speed * scale;
      pr.time += 0.05;

      if (pr.y > this.road.height + 120) {
        this.processions.splice(i, 1);
      }
    }
  }

  draw(ctx, time) {
    // Collect all entities and sort by Y (deepest first)
    const renderList = [];

    for (const pr of this.processions) {
      if (pr.y >= this.road.horizonY && pr.y <= this.road.height + 80) {
        renderList.push({ type: 'procession', entity: pr, y: pr.y });
      }
    }
    for (const p of this.pedestrians) {
      if (p.y >= this.road.horizonY && p.y <= this.road.height + 80) {
        renderList.push({ type: 'pedestrian', entity: p, y: p.y });
      }
    }
    for (const v of this.vehicles) {
      if (v.y >= this.road.horizonY && v.y <= this.road.height + 80) {
        renderList.push({ type: 'vehicle', entity: v, y: v.y });
      }
    }

    renderList.sort((a, b) => a.y - b.y);

    for (const item of renderList) {
      const scale = this.road.getScale(item.y);

      if (item.type === 'procession') {
        const pr = item.entity;
        const width = this.road.bottomRoadWidth * 0.5 * scale;
        const x = this.road.getLaneCenter(1, pr.y);
        ctx.save();
        ctx.translate(x, pr.y);
        ctx.scale(scale, scale);
        SpriteRenderer.drawProcession(ctx, 0, 0, width, 55, { time: pr.time });
        ctx.restore();
      } else if (item.type === 'pedestrian') {
        const p = item.entity;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.scale(scale, scale);
        SpriteRenderer.drawPedestrian(ctx, 0, 0, {
          walkCycle: p.walkCycle,
          isScared: p.isScared,
          hasUmbrella: p.hasUmbrella,
          color: p.color
        });
        ctx.restore();
      } else if (item.type === 'vehicle') {
        const v = item.entity;
        ctx.save();
        ctx.translate(v.x, v.y);
        ctx.scale(scale, scale);

        if (v.type === 'bus') {
          SpriteRenderer.drawBus(ctx, 0, 0, v.baseW, v.baseH, {
            color: v.color,
            stripeColor: v.stripeColor,
            slogan: v.slogan
          });
        } else if (v.type === 'rickshaw') {
          SpriteRenderer.drawRickshaw(ctx, 0, 0, v.baseW, v.baseH, {
            hoodColor: v.color
          });
        } else if (v.type === 'cng') {
          SpriteRenderer.drawCNG(ctx, 0, 0, v.baseW, v.baseH, {
            bodyColor: v.color,
            roofColor: '#facc15',
            isPlayer: false
          });
        }
        ctx.restore();
      }
    }
  }
}

window.TrafficManager = TrafficManager;
