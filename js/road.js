/**
 * Road & Environment System for CNG Rush
 * Generates the compact Dhaka street with FULL edge-to-edge forward road view.
 * The road extends all the way to the top of the screen (no black cover),
 * providing maximum driving visibility and distance.
 */

class RoadManager {
  constructor(canvasWidth, canvasHeight) {
    this.width = canvasWidth;
    this.height = canvasHeight;

    this.recalculateDimensions();

    // Scrolling offsets
    this.scrollOffset = 0;
    this.stripeOffset = 0;

    // Roadside objects, trees & hazards
    this.scenery = [];
    this.hazards = [];
    this.rainDrops = [];

    // Weather state
    this.weather = 'clear'; // 'clear', 'rain', 'night'
    this.rainIntensity = 0;

    this.initScenery();
    this.initRain();
  }

  recalculateDimensions() {
    // Road is centered and compact
    this.bottomRoadWidth = Math.min(560, Math.max(400, this.width * 0.52));
    this.topRoadWidth = this.bottomRoadWidth * 0.20; // vanishing point at top edge
    
    // Horizon is 0: Full road view edge-to-edge from top (0) to bottom (height)
    this.horizonY = 0; 

    this.roadCenterX = this.width / 2;
    this.bottomRoadX = this.roadCenterX - this.bottomRoadWidth / 2;
    this.topRoadX = this.roadCenterX - this.topRoadWidth / 2;

    // 4 Clean Lanes across the road
    this.numLanes = 4;
  }

  resize(canvasWidth, canvasHeight) {
    this.width = canvasWidth;
    this.height = canvasHeight;
    this.recalculateDimensions();
  }

  setWeather(type) {
    this.weather = type;
    if (type === 'rain') {
      this.rainIntensity = 1;
      window.soundManager.setRain(true);
    } else {
      this.rainIntensity = 0;
      window.soundManager.setRain(false);
    }
  }

  initRain() {
    this.rainDrops = [];
    for (let i = 0; i < 90; i++) {
      this.rainDrops.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        len: 12 + Math.random() * 16,
        speed: 16 + Math.random() * 8
      });
    }
  }

  /**
   * Perspective scale factor based on screen Y
   * Near bottom (height) = 1.0, Near top (0) = 0.25
   */
  getScale(y) {
    const clampedY = Math.max(0, Math.min(this.height + 60, y));
    const t = clampedY / this.height;
    return Math.max(0.24, Math.min(1.0, 0.22 + 0.78 * t));
  }

  /**
   * Get road width at a specific Y coordinate with perspective
   */
  getRoadWidthAt(y) {
    const t = Math.max(0, Math.min(1, y / this.height));
    return this.topRoadWidth + (this.bottomRoadWidth - this.topRoadWidth) * t;
  }

  /**
   * Get road Left X at a specific Y coordinate
   */
  getRoadLeftAt(y) {
    const rw = this.getRoadWidthAt(y);
    return this.roadCenterX - rw / 2;
  }

  /**
   * Get lane center X coordinate at a given Y
   * All 4 lanes are uniformly proportioned across the road width
   */
  getLaneCenter(laneIndex, y = this.height - 140) {
    const rw = this.getRoadWidthAt(y);
    const leftX = this.roadCenterX - rw / 2;
    const laneW = rw / 4;
    const idx = Math.max(0, Math.min(3, laneIndex));
    return leftX + (idx + 0.5) * laneW;
  }

  /**
   * Convert normalized lane position (-1 to 1) into screen X at Y
   */
  getScreenX(normX, y) {
    const halfW = this.getRoadWidthAt(y) / 2;
    return this.roadCenterX + normX * halfW;
  }

  initScenery() {
    this.scenery = [];
    this.hazards = [];

    // Populate lush roadside trees, stalls, and scenery along both sides
    for (let y = -50; y < this.height + 250; y += 38) {
      this.spawnSceneryAt(y, 'left');
      this.spawnSceneryAt(y + 19, 'right');
    }

    // Populate initial potholes / puddles
    for (let y = 30; y < this.height + 150; y += 160) {
      this.spawnHazardAt(y);
    }
  }

  spawnSceneryAt(y, forcedSide = null) {
    const isLeft = forcedSide ? (forcedSide === 'left') : (Math.random() > 0.5);
    const rand = Math.random();

    // Roadside offset: near curb (-1.12 to -1.35) or deep grass verge (-1.45 to -2.1)
    const isDeep = Math.random() < 0.5;
    const offset = isDeep ? (1.45 + Math.random() * 0.65) : (1.12 + Math.random() * 0.28);
    const normX = isLeft ? -offset : offset;

    let item;
    if (rand < 0.78) {
      // 78% Trees: Banyan, Palm, Krishnachura
      const treeTypes = ['banyan', 'palm', 'krishnachura'];
      const variety = treeTypes[Math.floor(Math.random() * treeTypes.length)];
      item = {
        type: 'tree',
        normX,
        y,
        baseRadius: 22 + Math.random() * 12,
        variety
      };
    } else if (rand < 0.89) {
      item = { type: 'stall', normX: isLeft ? -1.16 : 1.16, y, baseW: 42, baseH: 44 };
    } else {
      const ads = ['কাচ্চি ভাই 🍗', 'স্টার কাবাব', 'অনলাইন ভর্তি চলছে 💻', 'ডায়াবেটিস পরীক্ষা', 'স্পেশাল মালাই চা ☕', 'প্রাণ ফ্রুটো 🥭', 'রবির নেটওয়ার্ক 📶'];
      item = {
        type: 'billboard',
        normX: isLeft ? -1.22 : 1.22,
        y,
        baseW: 72,
        baseH: 32,
        text: ads[Math.floor(Math.random() * ads.length)]
      };
    }
    this.scenery.push(item);
  }

  spawnHazardAt(y) {
    const lane = Math.floor(Math.random() * 4);
    const isPuddle = (this.weather === 'rain') || (Math.random() < 0.35);

    this.hazards.push({
      type: isPuddle ? 'puddle' : 'pothole',
      lane,
      y,
      baseRadius: 15 + Math.random() * 6,
      baseW: 42 + Math.random() * 18,
      baseH: 26 + Math.random() * 10,
      hit: false
    });
  }

  update(worldSpeedY, time) {
    this.stripeOffset = (this.stripeOffset + worldSpeedY) % 36;

    // Update roadside scenery positions
    for (let i = this.scenery.length - 1; i >= 0; i--) {
      const item = this.scenery[i];
      item.y += worldSpeedY;

      if (item.y > this.height + 180) {
        this.scenery.splice(i, 1);
        this.spawnSceneryAt(-40);
      } else if (item.y < -80) {
        this.scenery.splice(i, 1);
        this.spawnSceneryAt(this.height + 140);
      }
    }

    // Update hazards positions
    for (let i = this.hazards.length - 1; i >= 0; i--) {
      const h = this.hazards[i];
      h.y += worldSpeedY;

      if (h.y > this.height + 150) {
        this.hazards.splice(i, 1);
        this.spawnHazardAt(15);
      } else if (h.y < -50) {
        this.hazards.splice(i, 1);
        this.spawnHazardAt(this.height + 100);
      }
    }

    // Update rain streaks
    if (this.weather === 'rain') {
      for (const r of this.rainDrops) {
        r.y += r.speed + worldSpeedY * 0.4;
        r.x += 1.2;
        if (r.y > this.height) {
          r.y = -20;
          r.x = Math.random() * this.width;
        }
        if (r.x > this.width) {
          r.x = 0;
        }
      }
    }
  }

  draw(ctx, time) {
    const topW = this.topRoadWidth;
    const botW = this.bottomRoadWidth;
    const cx = this.roadCenterX;

    // 1. Lush Green Grass Ground (left & right sides of road)
    ctx.fillStyle = '#163820'; // deep lush tropical grass
    ctx.fillRect(0, 0, this.width, this.height);

    // Natural grass gradient on left and right verges
    const leftGrad = ctx.createLinearGradient(0, 0, cx - topW / 2, 0);
    leftGrad.addColorStop(0, '#102a18');
    leftGrad.addColorStop(1, '#1b4a2a');
    ctx.fillStyle = leftGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(cx - topW / 2, 0);
    ctx.lineTo(cx - botW / 2, this.height);
    ctx.lineTo(0, this.height);
    ctx.closePath();
    ctx.fill();

    const rightGrad = ctx.createLinearGradient(cx + topW / 2, 0, this.width, 0);
    rightGrad.addColorStop(0, '#1b4a2a');
    rightGrad.addColorStop(1, '#102a18');
    ctx.fillStyle = rightGrad;
    ctx.beginPath();
    ctx.moveTo(cx + topW / 2, 0);
    ctx.lineTo(this.width, 0);
    ctx.lineTo(this.width, this.height);
    ctx.lineTo(cx + botW / 2, this.height);
    ctx.closePath();
    ctx.fill();

    // Roadside soft grassy shoulder / verge strips
    const shTop = 14 * this.getScale(0);
    const shBot = 24 * this.getScale(this.height);
    ctx.fillStyle = '#265432';
    // Left shoulder
    ctx.beginPath();
    ctx.moveTo(cx - topW / 2, 0);
    ctx.lineTo(cx - topW / 2 - shTop, 0);
    ctx.lineTo(cx - botW / 2 - shBot, this.height);
    ctx.lineTo(cx - botW / 2, this.height);
    ctx.closePath();
    ctx.fill();
    // Right shoulder
    ctx.beginPath();
    ctx.moveTo(cx + topW / 2, 0);
    ctx.lineTo(cx + topW / 2 + shTop, 0);
    ctx.lineTo(cx + botW / 2 + shBot, this.height);
    ctx.lineTo(cx + botW / 2, this.height);
    ctx.closePath();
    ctx.fill();

    // 2. Main Road Tapered Polygon (Full view from y=0 to y=height!)
    ctx.fillStyle = '#1e2229'; // deep asphalt
    ctx.beginPath();
    ctx.moveTo(cx - topW / 2, 0);
    ctx.lineTo(cx + topW / 2, 0);
    ctx.lineTo(cx + botW / 2, this.height);
    ctx.lineTo(cx - botW / 2, this.height);
    ctx.closePath();
    ctx.fill();

    // Side Curbs (Concrete borders from y=0 to y=height)
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3.5;
    // Left curb
    ctx.beginPath();
    ctx.moveTo(cx - topW / 2, 0);
    ctx.lineTo(cx - botW / 2, this.height);
    ctx.stroke();
    // Right curb
    ctx.beginPath();
    ctx.moveTo(cx + topW / 2, 0);
    ctx.lineTo(cx + botW / 2, this.height);
    ctx.stroke();

    // 3. Perspective Lane Markings (White dotted lines for ALL lanes, including 3rd lane!)
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([20, 16]);
    ctx.lineDashOffset = -this.stripeOffset;

    for (let i = 1; i <= 3; i++) {
      const frac = i * 0.25;
      ctx.beginPath();
      ctx.moveTo(cx - topW / 2 + topW * frac, 0);
      ctx.lineTo(cx - botW / 2 + botW * frac, this.height);
      ctx.stroke();
    }
    ctx.setLineDash([]); // reset

    // 4. Draw Hazards with Perspective (Potholes & Puddles)
    for (const h of this.hazards) {
      if (h.y < -30 || h.y > this.height + 50) continue;
      const scale = this.getScale(h.y);
      const hx = this.getLaneCenter(h.lane, h.y);

      ctx.save();
      ctx.translate(hx, h.y);
      ctx.scale(scale, scale);
      if (h.type === 'pothole') {
        SpriteRenderer.drawPothole(ctx, 0, 0, h.baseRadius);
      } else if (h.type === 'puddle') {
        SpriteRenderer.drawPuddle(ctx, 0, 0, h.baseW, h.baseH, time);
      }
      ctx.restore();
    }

    // 6. Draw Roadside Scenery with Perspective (Trees, Stalls, Billboards on sidewalk)
    this.scenery.sort((a, b) => a.y - b.y);

    for (const s of this.scenery) {
      if (s.y < -30 || s.y > this.height + 80) continue;
      const scale = this.getScale(s.y);
      const sx = this.getScreenX(s.normX, s.y);

      ctx.save();
      ctx.translate(sx, s.y);
      ctx.scale(scale, scale);

      if (s.type === 'tree') {
        SpriteRenderer.drawTree(ctx, 0, 0, s.baseRadius, s.variety || 'banyan');
      } else if (s.type === 'stall') {
        SpriteRenderer.drawTeaStall(ctx, 0, 0, s.baseW, s.baseH);
      } else if (s.type === 'billboard') {
        SpriteRenderer.drawBillboard(ctx, 0, 0, s.baseW, s.baseH, s.text);
      }
      ctx.restore();
    }
  }

  drawWeatherOverlay(ctx) {
    if (this.weather === 'rain') {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
      ctx.fillRect(0, 0, this.width, this.height);

      ctx.strokeStyle = 'rgba(186, 230, 253, 0.65)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (const r of this.rainDrops) {
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x + 3, r.y + r.len);
      }
      ctx.stroke();
    } else if (this.weather === 'night') {
      ctx.fillStyle = 'rgba(2, 6, 23, 0.55)';
      ctx.fillRect(0, 0, this.width, this.height);
    }
  }
}

window.RoadManager = RoadManager;
