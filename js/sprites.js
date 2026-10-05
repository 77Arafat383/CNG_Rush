/**
 * Sprites & Visual Assets Generator for CNG Rush
 * Procedurally renders authentic Dhaka city vehicles, pedestrians, cows, hazards,
 * and roadside decor using HTML5 Canvas primitives.
 */

class SpriteRenderer {
  /**
   * Draw the iconic Green Bangladeshi CNG Auto-Rickshaw (Player or AI)
   */
  static drawCNG(ctx, x, y, width, height, options = {}) {
    const {
      rotation = 0,
      isBraking = false,
      damage = 0, // 0 to 1
      isPlayer = true,
      bodyColor = '#0a7e3a',
      roofColor = '#facc15',
      hasPassenger = false,
      passengerEmoji = '👨'
    } = options;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.roundRect(-width / 2 + 4, -height / 2 + 6, width - 2, height, 8);
    ctx.fill();

    // Main Chassis & Body
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.roundRect(-width / 2, -height / 2, width, height, 10);
    ctx.fill();

    // Dark trim / bumper outline
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Iconic Yellow/Black Roof Canvas
    const roofW = width * 0.76;
    const roofH = height * 0.52;
    ctx.fillStyle = roofColor;
    ctx.beginPath();
    ctx.roundRect(-roofW / 2, -roofH / 2 + 4, roofW, roofH, 6);
    ctx.fill();

    // Roof ribs/folds
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1.5;
    for (let i = -roofH / 2 + 10; i < roofH / 2; i += 8) {
      ctx.beginPath();
      ctx.moveTo(-roofW / 2 + 4, i);
      ctx.lineTo(roofW / 2 - 4, i);
      ctx.stroke();
    }

    // Side Safety Metal Grills / Wire Mesh (Authentic Dhaka safety cage!)
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    // Left grill
    ctx.strokeRect(-width / 2 + 2, -height / 4, 3, height * 0.45);
    // Right grill
    ctx.strokeRect(width / 2 - 5, -height / 4, 3, height * 0.45);

    // Front Windshield
    const windW = width * 0.65;
    const windH = height * 0.16;
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.roundRect(-windW / 2, -height / 2 + 4, windW, windH, [4, 4, 2, 2]);
    ctx.fill();

    // Windshield reflection glare
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.moveTo(-windW / 2 + 3, -height / 2 + 6);
    ctx.lineTo(-windW / 2 + 12, -height / 2 + 6);
    ctx.lineTo(-windW / 2 + 6, -height / 2 + windH + 2);
    ctx.lineTo(-windW / 2 + 1, -height / 2 + windH + 2);
    ctx.fill();

    // Front Single Wheel & Handlebars (CNG is a 3-wheeler!)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-4, -height / 2 - 4, 8, 8); // front tire tip

    // Driver in front cabin
    ctx.fillStyle = '#d97706'; // driver gamcha / shirt
    ctx.beginPath();
    ctx.arc(0, -height / 2 + windH + 9, 7, 0, Math.PI * 2);
    ctx.fill();
    // Driver head/cap
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(0, -height / 2 + windH + 8, 4, 0, Math.PI * 2);
    ctx.fill();

    // Passenger in back seat (if boarded)
    if (hasPassenger) {
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(passengerEmoji, 0, 8);
    }

    // Front Headlights
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-width / 2 + 5, -height / 2, 6, 3);
    ctx.fillRect(width / 2 - 11, -height / 2, 6, 3);

    // Headlight Light Beam cone on the road in front
    if (isPlayer) {
      const grad = ctx.createLinearGradient(0, -height / 2, 0, -height / 2 - 90);
      grad.addColorStop(0, 'rgba(254, 240, 138, 0.25)');
      grad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(-width / 2 + 2, -height / 2);
      ctx.lineTo(-width * 0.9, -height / 2 - 90);
      ctx.lineTo(width * 0.9, -height / 2 - 90);
      ctx.lineTo(width / 2 - 2, -height / 2);
      ctx.closePath();
      ctx.fill();
    }

    // Rear Brake / Taillights
    ctx.fillStyle = isBraking ? '#ff0000' : '#b91c1c';
    if (isBraking) {
      ctx.shadowColor = '#ff2222';
      ctx.shadowBlur = 12;
    }
    ctx.fillRect(-width / 2 + 4, height / 2 - 4, 8, 4);
    ctx.fillRect(width / 2 - 12, height / 2 - 4, 8, 4);
    ctx.shadowBlur = 0; // reset

    // Number plate at rear (Dhaka Metro-Th)
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-12, height / 2 - 3, 24, 4);
    ctx.fillStyle = '#0f172a';
    ctx.font = '3px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ঢাকা-থ', 0, height / 2);

    // Visual Damage indicator (cracks on windshield, dents)
    if (damage > 0.25) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-6, -height / 2 + 6);
      ctx.lineTo(2, -height / 2 + 12);
      ctx.lineTo(7, -height / 2 + 8);
      ctx.stroke();
    }
    if (damage > 0.6) {
      // Dented side
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.arc(width / 2 - 2, 0, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Dhaka Colorful Local Bus ("Murir Tin" with slogans & roof luggage)
   */
  static drawBus(ctx, x, y, width, height, options = {}) {
    const {
      color = '#2563eb',
      stripeColor = '#f59e0b',
      slogan = 'আল্লাহ ভরসা',
      rotation = 0
    } = options;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.roundRect(-width / 2 + 6, -height / 2 + 8, width, height, 8);
    ctx.fill();

    // Main Bus Body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(-width / 2, -height / 2, width, height, 10);
    ctx.fill();

    // Decorative racing stripes
    ctx.fillStyle = stripeColor;
    ctx.fillRect(-width / 2, -height * 0.2, width, 14);

    // Bus Roof Carrier (Luggage rack with tied bags and spare tires!)
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    const rackW = width * 0.75;
    const rackH = height * 0.55;
    ctx.strokeRect(-rackW / 2, -rackH / 2, rackW, rackH);

    // Luggage bundles on roof
    ctx.fillStyle = '#b45309';
    ctx.fillRect(-rackW / 2 + 4, -rackH / 2 + 6, 16, 12);
    ctx.fillStyle = '#065f46';
    ctx.fillRect(rackW / 2 - 20, -rackH / 2 + 8, 16, 14);

    // Spare tire on roof
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 10, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(0, 10, 3, 0, Math.PI * 2);
    ctx.fill();

    // Front Windshield
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.roundRect(-width / 2 + 6, -height / 2 + 4, width - 12, 16, [4, 4, 0, 0]);
    ctx.fill();

    // Rear Windshield
    ctx.beginPath();
    ctx.roundRect(-width / 2 + 8, height / 2 - 14, width - 16, 10, [0, 0, 4, 4]);
    ctx.fill();

    // Authentic Bengali Slogan on Rear ("আল্লাহ ভরসা" or "মা বাবার দোয়া")
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 9px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(slogan, 0, height / 2 - 2);

    // Headlights & Tail lights
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-width / 2 + 4, -height / 2, 8, 4);
    ctx.fillRect(width / 2 - 12, -height / 2, 8, 4);

    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-width / 2 + 4, height / 2 - 4, 8, 4);
    ctx.fillRect(width / 2 - 12, height / 2 - 4, 8, 4);

    ctx.restore();
  }

  /**
   * Traditional Cycle Rickshaw with colorful painted hood
   */
  static drawRickshaw(ctx, x, y, width, height, options = {}) {
    const { rotation = 0, hoodColor = '#e11d48' } = options;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(3, 4, width * 0.45, height * 0.48, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rear wheels (2 side wheels)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-width / 2, height / 4 - 4, 4, 18);
    ctx.fillRect(width / 2 - 4, height / 4 - 4, 4, 18);

    // Passenger Hood (Folded or Upright painted canopy)
    ctx.fillStyle = hoodColor;
    ctx.beginPath();
    ctx.roundRect(-width / 2 + 3, 0, width - 6, height / 2 - 2, [6, 6, 8, 8]);
    ctx.fill();

    // Rickshaw art floral motif on hood
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(0, height / 4, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(0, height / 4, 3, 0, Math.PI * 2);
    ctx.fill();

    // Frame connecting puller to hood
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -height / 3);
    ctx.stroke();

    // Puller (wearing lungi / vest)
    ctx.fillStyle = '#0284c7'; // lungi/shirt
    ctx.beginPath();
    ctx.arc(0, -height / 6, 6, 0, Math.PI * 2);
    ctx.fill();
    // Puller head with gamcha
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(0, -height / 6 - 2, 4, 0, Math.PI * 2);
    ctx.fill();

    // Front single bicycle wheel & handlebars
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-2, -height / 2 - 2, 4, 12);

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-8, -height / 3 - 2);
    ctx.lineTo(8, -height / 3 - 2);
    ctx.stroke();

    // Brass bell
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(6, -height / 3 - 2, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Wandering Dhaka Street Cow
   */
  static drawCow(ctx, x, y, width, height, options = {}) {
    const { rotation = 0, walkCycle = 0 } = options;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(2, 4, width * 0.42, height * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body (light brown / tan cow)
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.roundRect(-width / 2 + 4, -height / 2 + 10, width - 8, height - 16, 8);
    ctx.fill();

    // White dairy patches
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(-4, -2, 6, 10, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(5, 6, 5, 7, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.ellipse(0, -height / 2 + 6, 8, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Horns
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-5, -height / 2 + 6);
    ctx.quadraticCurveTo(-11, -height / 2 + 1, -8, -height / 2 - 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(5, -height / 2 + 6);
    ctx.quadraticCurveTo(11, -height / 2 + 1, 8, -height / 2 - 4);
    ctx.stroke();

    // Ears
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.ellipse(-8, -height / 2 + 7, 4, 2, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(8, -height / 2 + 7, 4, 2, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Tail with animated wag
    const tailWag = Math.sin(walkCycle * 6) * 6;
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, height / 2 - 6);
    ctx.quadraticCurveTo(tailWag, height / 2 + 4, tailWag * 1.2, height / 2 + 10);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Jaywalking Pedestrian
   */
  static drawPedestrian(ctx, x, y, options = {}) {
    const { walkCycle = 0, isScared = false, isHit = false, hasUmbrella = false, color = '#3b82f6' } = options;

    ctx.save();
    ctx.translate(x, y);

    if (isHit) {
      // Knocked down during pedestrian accident!
      ctx.rotate(Math.PI / 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(0, 2, 12, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '14px sans-serif';
      ctx.fillText('💫', 0, -16);
    } else {
      // Normal Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.ellipse(1, 3, 10, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Walking legs
    const legSwing = isHit ? 0 : Math.sin(walkCycle * 8) * 5;
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    // Left leg
    ctx.beginPath();
    ctx.moveTo(-3, 2);
    ctx.lineTo(-3, 8 + legSwing);
    ctx.stroke();
    // Right leg
    ctx.beginPath();
    ctx.moveTo(3, 2);
    ctx.lineTo(3, 8 - legSwing);
    ctx.stroke();

    // Body (Panjabi / Shirt)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(-6, -8, 12, 13, 3);
    ctx.fill();

    // Head
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -12, 5, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, -14, 4, Math.PI, 0);
    ctx.fill();

    // Umbrella (if rainy/sunny)
    if (hasUmbrella && !isHit) {
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(4, -14, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0369a1';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Panic sweat bubble if scared by horn
    if (isScared && !isHit) {
      ctx.font = '12px sans-serif';
      ctx.fillText('💦', 8, -16);
    }

    ctx.restore();
  }

  /**
   * Procession / Rally (Michil) blocking lanes
   */
  static drawProcession(ctx, x, y, width, height, options = {}) {
    const { time = 0 } = options;

    ctx.save();
    ctx.translate(x, y);

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(-width / 2, -height / 2 + 6, width, height);

    // Crowd of people
    const count = 5;
    for (let i = 0; i < count; i++) {
      const px = -width / 2 + 10 + i * (width / count);
      const py = Math.sin(time * 4 + i) * 3;
      SpriteRenderer.drawPedestrian(ctx, px, py, {
        walkCycle: time + i,
        color: i % 2 === 0 ? '#ef4444' : '#10b981'
      });
    }

    // Giant Banner carried in front
    const bannerW = width * 0.85;
    const bannerH = 18;
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.roundRect(-bannerW / 2, -height / 2 - 4, bannerW, bannerH, 4);
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('দাবি মোদের একটাই! 🚩', 0, -height / 2 + 5);

    ctx.restore();
  }

  /**
   * Road Hazard: Pothole (Dhaka Gorto)
   */
  static drawPothole(ctx, x, y, radius) {
    ctx.save();
    ctx.translate(x, y);

    // Asphalt cracks
    ctx.strokeStyle = '#090d16';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-radius - 8, -2);
    ctx.lineTo(-radius, 0);
    ctx.lineTo(radius, 2);
    ctx.lineTo(radius + 7, -3);
    ctx.stroke();

    // Crater depth
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.ellipse(0, 0, radius, radius * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner gravel & depth gradient
    ctx.fillStyle = '#171f2e';
    ctx.beginPath();
    ctx.ellipse(2, 2, radius * 0.6, radius * 0.4, 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Road Hazard: Flooded Waterlogged Puddle (Jolabodhyota)
   */
  static drawPuddle(ctx, x, y, width, height, time = 0) {
    ctx.save();
    ctx.translate(x, y);

    // Water surface
    const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, width / 2);
    grad.addColorStop(0, 'rgba(30, 58, 138, 0.7)');
    grad.addColorStop(0.7, 'rgba(14, 116, 144, 0.5)');
    grad.addColorStop(1, 'rgba(14, 116, 144, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 0, width / 2, height / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Animated shimmering ripple rings
    const ripple = Math.max(0.05, (time * 2) % 1);
    const rw = Math.max(0.5, (width / 2) * ripple);
    const rh = Math.max(0.3, (height / 2) * ripple);
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 * (1 - ripple)})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(0, 0, rw, rh, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Authentic Driver Cockpit Point-of-View (Behind the Handlebars & Windshield)
   */
  static drawDriverCockpit(ctx, width, height, options = {}) {
    const {
      steerAngle = 0,
      speed = 0,
      damage = 0,
      isRaining = false,
      time = 0,
      fare = 0,
      passenger = null
    } = options;

    ctx.save();

    // Dynamic View Transformation when changing direction
    const swayX = steerAngle * 24;
    const swayTilt = steerAngle * 0.06;
    ctx.translate(width / 2 + swayX, height / 2);
    ctx.rotate(swayTilt);
    ctx.translate(-width / 2, -height / 2);

    // 1. Left & Right Metal Safety Grills / Side Pillars
    ctx.fillStyle = '#0a7e3a'; // CNG Green pillar
    ctx.fillRect(-20, 0, 56, height);
    ctx.fillRect(width - 36, 0, 56, height);

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    for (let y = 80; y < height - 120; y += 40) {
      ctx.strokeRect(6, y, 28, 4);
      ctx.strokeRect(width - 34, y, 28, 4);
    }

    // 2. Windshield Upper Visor / Canopy Frame
    ctx.fillStyle = '#0a7e3a';
    ctx.fillRect(-20, 0, width + 40, 55);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-20, 52, width + 40, 4);

    // 3. Overhead Rearview Mirror (Shows passenger in the back seat!)
    const mirrorW = 140;
    const mirrorH = 44;
    const mirrorX = width / 2 - mirrorW / 2;
    const mirrorY = 25;

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(width / 2 - 4, 10, 8, 18);

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(mirrorX, mirrorY, mirrorW, mirrorH, 8);
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(mirrorX + 3, mirrorY + 3, mirrorW - 6, mirrorH - 6, 6);
    ctx.fill();

    ctx.fillStyle = '#334155';
    ctx.fillRect(mirrorX + 8, mirrorY + 16, mirrorW - 16, 20);

    if (passenger) {
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(passenger.avatar || '👨', width / 2 - 16, mirrorY + 22);

      ctx.font = '14px sans-serif';
      ctx.fillText(passenger.currentMood || '😊', width / 2 + 20, mirrorY + 20);
    } else {
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 9px "Chakra Petch", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('NO PASSENGER', width / 2, mirrorY + 22);
    }

    // 4. Windshield Glass Tint & Wipers
    if (isRaining) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 25; i++) {
        const rx = 40 + ((i * 59 + time * 60) % (width - 80));
        const ry = 60 + ((i * 83) % (height - 240));
        ctx.beginPath();
        ctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      const wiperSweep = Math.sin(time * 6) * 0.7;
      ctx.save();
      ctx.translate(width / 2, height - 150);
      ctx.rotate(wiperSweep);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -170);
      ctx.stroke();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(-15, -170);
      ctx.lineTo(15, -170);
      ctx.stroke();
      ctx.restore();
    }

    if (damage > 0.3) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width * 0.35, height * 0.4);
      ctx.lineTo(width * 0.38, height * 0.45);
      ctx.lineTo(width * 0.43, height * 0.42);
      ctx.lineTo(width * 0.48, height * 0.49);
      ctx.stroke();
    }

    // 5. Lower Dashboard & Cowling with Front Hood Nose Focus
    // Clean, authentic low cowl so the road ahead is wide and unobstructed
    const dashH = 95;
    const dashY = height - dashH;

    // Green CNG front hood cowl
    ctx.fillStyle = '#0a7e3a';
    ctx.beginPath();
    ctx.moveTo(-40, height + 10);
    ctx.lineTo(-40, dashY + 28);
    ctx.quadraticCurveTo(width / 2, dashY - 14, width + 40, dashY + 28);
    ctx.lineTo(width + 40, height + 10);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#166534';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Front Nose Tip / Fender (shows exact lane alignment on the road ahead!)
    ctx.fillStyle = '#065f46';
    ctx.beginPath();
    ctx.roundRect(width / 2 - 20, dashY - 18, 40, 26, [8, 8, 2, 2]);
    ctx.fill();
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Front headlight beam projection from the nose onto the asphalt
    const beamGrad = ctx.createLinearGradient(width / 2, dashY - 18, width / 2, dashY - 140);
    beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.22)');
    beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 16, dashY - 18);
    ctx.lineTo(width / 2 - 50, dashY - 140);
    ctx.lineTo(width / 2 + 50, dashY - 140);
    ctx.lineTo(width / 2 + 16, dashY - 18);
    ctx.closePath();
    ctx.fill();

    // Center Console & Digital Meter Box
    const consoleW = 190;
    const consoleH = 55;
    const consoleX = width / 2 - consoleW / 2;
    const consoleY = height - consoleH - 8;

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(consoleX, consoleY, consoleW, consoleH, 6);
    ctx.fill();
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Built-in Glowing Meter Display on Dashboard
    ctx.fillStyle = '#022c22';
    ctx.fillRect(consoleX + 12, consoleY + 8, consoleW - 24, 20);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1;
    ctx.strokeRect(consoleX + 12, consoleY + 8, consoleW - 24, 20);

    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 13px "Press Start 2P", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`৳${fare}`, consoleX + consoleW - 18, consoleY + 23);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 8px "Chakra Petch", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('METER', consoleX + 16, consoleY + 22);

    const kmh = Math.round(Math.abs(speed) * 6.5);
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 11px "Chakra Petch", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${kmh} KM/H`, width / 2, consoleY + 44);

    // 6. Motorbike Handlebars with driver handgrips
    ctx.save();
    ctx.translate(width / 2, height - 32);
    ctx.rotate(steerAngle * 0.45); // tilts with steering!

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-105, 0);
    ctx.quadraticCurveTo(0, -14, 105, 0);
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(-22, -18, 44, 24, 5);
    ctx.fill();

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, -6, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📢', 0, -6);

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(-118, -8, 28, 16, 4);
    ctx.roundRect(90, -8, 28, 16, 4);
    ctx.fill();

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-105, -6);
    ctx.lineTo(-128, -16);
    ctx.moveTo(105, -6);
    ctx.lineTo(128, -16);
    ctx.stroke();

    ctx.restore();

    ctx.restore();
  }

  /**
   * Roadside Environment: Tea Stall (Tong er dokan)
   */
  static drawTeaStall(ctx, x, y, width, height) {
    ctx.save();
    ctx.translate(x, y);

    // Stall base platform
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-width / 2, -height / 2, width, height);

    // Blue/Red tin roof
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-width / 2 - 4, -height / 2 - 4, width + 8, height * 0.45);

    // Roof stripes
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1;
    for (let i = -width / 2; i < width / 2 + 4; i += 6) {
      ctx.beginPath();
      ctx.moveTo(i, -height / 2 - 4);
      ctx.lineTo(i, -height / 2 + height * 0.45 - 4);
      ctx.stroke();
    }

    // Big aluminum tea kettle
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(-8, 4, 6, 0, Math.PI * 2);
    ctx.fill();
    // Kettle spout
    ctx.fillRect(-16, 2, 5, 2);

    // Colorful biscuit / chanachur jars
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(4, 0, 5, 8);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(11, 0, 5, 8);

    // Signboard ("রং চা / মামা স্পেশাল চা")
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-width / 2 + 2, -height / 2 - 2, width - 4, 6);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 5px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('মামার স্পেশাল চা', 0, -height / 2 + 3);

    ctx.restore();
  }

  /**
   * Roadside Environment: Dhaka Billboard
   */
  static drawBillboard(ctx, x, y, width, height, text = 'বিরিয়ানি হাউস 🍗') {
    ctx.save();
    ctx.translate(x, y);

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(-width / 2 + 4, -height / 2 + 4, width, height);

    // Board Background
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.roundRect(-width / 2, -height / 2, width, height, 4);
    ctx.fill();

    // Glowing Neon Border
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Billboard Text
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 11px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, 0);

    ctx.restore();
  }

  /**
   * Authentic Long Dhaka Urban Building along roadside
   * Displays rooftop parapet, lift penthouse, iconic Gazi water tanks,
   * street-facing windows, balconies, shop awnings, and rooftop neon commercial signs.
   */
  static drawLongBuilding(ctx, x, y, width, length, options = {}) {
    const {
      side = 'left',
      roofColor = '#334155',
      parapetColor = '#1e293b',
      facadeColor = '#0f172a',
      windowColor = '#fef08a',
      signText = 'সিটি ব্যাংক',
      hasGaziTank = true,
      hasLiftHouse = true,
      hasShopfront = true,
      seed = 1
    } = options;

    ctx.save();
    ctx.translate(x, y);

    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    const shadowOffsetX = side === 'left' ? -6 : 8;
    ctx.fillRect(-width / 2 + shadowOffsetX, -length / 2 + 6, width, length);

    // Main roof slab
    ctx.fillStyle = roofColor;
    ctx.fillRect(-width / 2, -length / 2, width, length);

    // Parapet border (concrete perimeter wall)
    ctx.strokeStyle = parapetColor;
    ctx.lineWidth = 3.5;
    ctx.strokeRect(-width / 2, -length / 2, width, length);

    // Corner pillar posts on parapet
    ctx.fillStyle = parapetColor;
    const pSize = 6;
    ctx.fillRect(-width / 2 - 1, -length / 2 - 1, pSize, pSize);
    ctx.fillRect(width / 2 - pSize + 1, -length / 2 - 1, pSize, pSize);
    ctx.fillRect(-width / 2 - 1, length / 2 - pSize + 1, pSize, pSize);
    ctx.fillRect(width / 2 - pSize + 1, length / 2 - pSize + 1, pSize, pSize);

    // Road-facing facade strip & balconies
    // If left side, the road is on the right (+X side).
    // If right side, the road is on the left (-X side).
    const facadeWidth = Math.max(14, Math.min(24, width * 0.18));
    const facadeX = side === 'left' ? (width / 2 - facadeWidth) : (-width / 2);

    ctx.fillStyle = facadeColor;
    ctx.fillRect(facadeX, -length / 2, facadeWidth, length);

    // Windows & Balconies along the facade facing the street
    const windowStep = 18;
    const numWindows = Math.floor((length - 20) / windowStep);
    const startY = -length / 2 + 12;

    for (let i = 0; i < numWindows; i++) {
      const wy = startY + i * windowStep;
      
      // Window pane
      const isLit = ((i + seed) % 3 !== 0);
      ctx.fillStyle = isLit ? windowColor : '#1e293b';
      const winW = facadeWidth * 0.55;
      const winX = side === 'left' ? (facadeX + 3) : (facadeX + facadeWidth - winW - 3);
      ctx.fillRect(winX, wy, winW, 8);

      // Balcony railing
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(winX - 1, wy + 2, winW + 2, 8);

      // AC Outdoor Unit mounted below some windows
      if ((i + seed) % 2 === 0) {
        const acX = side === 'left' ? (winX + winW + 1) : (winX - 5);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(acX, wy + 2, 4, 5);
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(acX + 2, wy + 4.5, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Ground level shopfront awnings along the road edge
    if (hasShopfront) {
      const awningW = 6;
      const awningX = side === 'left' ? (width / 2) : (-width / 2 - awningW);
      const awningColors = ['#ef4444', '#facc15', '#3b82f6', '#10b981', '#ec4899'];
      const col = awningColors[seed % awningColors.length];

      for (let i = 0; i < numWindows; i += 2) {
        const ay = startY + i * windowStep;
        ctx.fillStyle = col;
        ctx.fillRect(awningX, ay, awningW, 14);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(awningX, ay + 4, awningW, 4);
      }
    }

    // Rooftop Elements:
    // 1. Lift Penthouse / Stairwell Machine Room
    if (hasLiftHouse) {
      const lhW = Math.max(20, Math.min(36, width * 0.35));
      const lhH = Math.max(26, Math.min(46, length * 0.25));
      const lhX = side === 'left' ? (-width / 2 + 10) : (width / 2 - lhW - 10);
      const lhY = -15;

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(lhX, lhY, lhW, lhH);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(lhX, lhY, lhW, lhH);

      // Access door
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(lhX + 4, lhY + lhH - 12, 8, 12);
    }

    // 2. Iconic Dhaka GAZI Water Tank (Blue cylinder)
    if (hasGaziTank) {
      const tankRadius = 8;
      const tankX = side === 'left' ? (-width / 2 + 20) : (width / 2 - 20);
      const tankY = length / 4;

      // Tank stand
      ctx.fillStyle = '#475569';
      ctx.fillRect(tankX - 9, tankY - 9, 18, 18);

      // Blue cylinder
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(tankX, tankY, tankRadius, 0, Math.PI * 2);
      ctx.fill();

      // Top cap / ring
      ctx.fillStyle = '#0369a1';
      ctx.beginPath();
      ctx.arc(tankX, tankY, tankRadius * 0.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(tankX - 2, tankY - 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Prominent Commercial Rooftop Billboard / Neon Sign
    if (signText) {
      const signW = Math.max(50, Math.min(96, width * 0.65));
      const signH = 20;
      const signX = side === 'left' ? (width / 2 - facadeWidth - signW / 2 - 4) : (-width / 2 + facadeWidth + signW / 2 + 4);
      const signY = -length / 3;

      // Sign background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(signX - signW / 2, signY - signH / 2, signW, signH);

      // Glowing neon border
      const neonColors = ['#f43f5e', '#38bdf8', '#facc15', '#4ade80', '#c084fc'];
      ctx.strokeStyle = neonColors[seed % neonColors.length];
      ctx.lineWidth = 1.8;
      ctx.strokeRect(signX - signW / 2, signY - signH / 2, signW, signH);

      // Sign text
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 8.5px "Hind Siliguri", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(signText, signX, signY);
    }

    ctx.restore();
  }

  /**
   * Roadside Lush Tree (Palm, Krishnachura, Banyan, or Mango)
   */
  static drawTree(ctx, x, y, radius = 26, variety = 'banyan') {
    ctx.save();
    ctx.translate(x, y);

    // Soft drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
    ctx.beginPath();
    ctx.arc(5, 6, radius * 1.05, 0, Math.PI * 2);
    ctx.fill();

    if (variety === 'palm') {
      // Coconut / Date Palm with radiating fronds
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.22, 0, Math.PI * 2);
      ctx.fill();

      // Radiating palm fronds
      const numFronds = 8;
      for (let i = 0; i < numFronds; i++) {
        const ang = (i / numFronds) * Math.PI * 2;
        const fx = Math.cos(ang) * radius;
        const fy = Math.sin(ang) * radius;
        ctx.strokeStyle = i % 2 === 0 ? '#15803d' : '#16a34a';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(fx * 0.6 + Math.sin(ang) * 4, fy * 0.6 - Math.cos(ang) * 4, fx, fy);
        ctx.stroke();

        // Leaf tips
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(fx, fy, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Coconuts in center
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.arc(2, 2, 2.8, 0, Math.PI * 2);
      ctx.arc(-2, 3, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (variety === 'krishnachura') {
      // Iconic Bangladeshi Krishnachura tree with fiery red-orange blossoms
      ctx.fillStyle = '#14532d';
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#166534';
      ctx.beginPath();
      ctx.arc(-radius * 0.2, -radius * 0.2, radius * 0.75, 0, Math.PI * 2);
      ctx.fill();

      // Red and orange floral blossoms scattered on top
      const petalColors = ['#dc2626', '#ef4444', '#f97316', '#ea580c', '#f87171'];
      for (let i = 0; i < 9; i++) {
        const px = Math.sin(i * 2.3) * (radius * 0.65);
        const py = Math.cos(i * 1.7) * (radius * 0.65);
        ctx.fillStyle = petalColors[i % petalColors.length];
        ctx.beginPath();
        ctx.arc(px, py, 4 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Lush tropical banyan / rain tree with multi-tiered organic canopy
      ctx.fillStyle = '#064e3b';
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();

      // Cluster 1 (Left lobe)
      ctx.fillStyle = '#047857';
      ctx.beginPath();
      ctx.arc(-radius * 0.35, -radius * 0.2, radius * 0.68, 0, Math.PI * 2);
      ctx.fill();

      // Cluster 2 (Right lobe)
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.arc(radius * 0.3, -radius * 0.15, radius * 0.65, 0, Math.PI * 2);
      ctx.fill();

      // Cluster 3 (Bottom-center lobe)
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(-radius * 0.1, radius * 0.25, radius * 0.58, 0, Math.PI * 2);
      ctx.fill();

      // Top sun-highlight cluster
      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(-radius * 0.15, -radius * 0.25, radius * 0.42, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Waiting Passenger roadside with animated pulsating PICKUP beacon
   */
  static drawWaitingPassenger(ctx, x, y, passenger, time = 0) {
    ctx.save();
    ctx.translate(x, y);

    // Pulsating ground target circle
    const pulse = (Math.sin(time * 6) + 1) / 2;
    const ringRadius = 24 + pulse * 8;

    ctx.strokeStyle = `rgba(250, 204, 21, ${0.4 + pulse * 0.5})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(250, 204, 21, 0.15)';
    ctx.beginPath();
    ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
    ctx.fill();

    // Floating Animated "PICKUP" Marker Pin
    const bob = Math.sin(time * 8) * 4;
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.roundRect(-24, -38 + bob, 48, 16, 8);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 9px "Chakra Petch", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PICKUP', 0, -30 + bob);

    // Downward arrow pointer
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(-5, -22 + bob);
    ctx.lineTo(5, -22 + bob);
    ctx.lineTo(0, -17 + bob);
    ctx.closePath();
    ctx.fill();

    // Passenger Avatar Emoji
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(passenger.avatar || '👨', 0, 0);

    ctx.restore();
  }

  /**
   * Destination Drop-off Zone (Checkered flag glowing zone)
   */
  static drawDropZone(ctx, x, y, width, height, time = 0) {
    ctx.save();
    ctx.translate(x, y);

    // Glowing cyan outline
    const glow = (Math.sin(time * 5) + 1) / 2;
    ctx.fillStyle = `rgba(6, 182, 212, ${0.2 + glow * 0.15})`;
    ctx.fillRect(-width / 2, -height / 2, width, height);

    ctx.strokeStyle = `rgba(6, 182, 212, ${0.7 + glow * 0.3})`;
    ctx.lineWidth = 3;
    ctx.strokeRect(-width / 2, -height / 2, width, height);

    // Checkered border stripes
    const sq = 12;
    for (let i = -width / 2; i < width / 2; i += sq) {
      ctx.fillStyle = ((i / sq) % 2 === 0) ? '#06b6d4' : '#ffffff';
      ctx.fillRect(i, -height / 2, sq, 4);
      ctx.fillRect(i, height / 2 - 4, sq, 4);
    }

    // Drop Zone Banner
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.roundRect(-45, -12, 90, 24, 6);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px "Chakra Petch", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏁 DROP ZONE', 0, 0);

    ctx.restore();
  }
}

window.SpriteRenderer = SpriteRenderer;
