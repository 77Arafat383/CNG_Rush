/**
 * Passenger & Mission System for CNG Rush
 * Implements passenger types (Student, Elderly, Family, Office Goer),
 * traits, realistic Bengali street dialogues, patience ticking, and drop-off scoring.
 */

const PASSENGER_TYPES = [
  {
    id: 'student',
    name: 'Tamim (Student in a Hurry)',
    avatar: '🎒',
    trait: 'Urgent! Short timer, High tip',
    baseFare: 140,
    timeLimit: 38, // seconds
    patienceDrainRate: 1.35,
    bumpPatiencePenalty: 18,
    hornPatiencePenalty: 4,
    bonusType: 'speed',
    weightModifier: 1.0, // normal handling
    dialogues: {
      pickup: "Mama, Dhaka University te exam ache, ektu druto jan!",
      bump: "Arre bhai! Amar admit card pore gelo!",
      horn: "Horn den bhalo, kintu gari tanun!",
      smooth: "Darun speed mama, tip paben!",
      lowPatience: "Mama exam miss hole shesh ami!",
      delivered: "Bachalen mama! Ei nen bhalo tip!"
    }
  },
  {
    id: 'elderly',
    name: 'Rafiq Chacha (Elderly)',
    avatar: '👴',
    trait: 'Sensitive! Bumps crush patience',
    baseFare: 120,
    timeLimit: 55,
    patienceDrainRate: 0.8,
    bumpPatiencePenalty: 35, // huge penalty!
    hornPatiencePenalty: 6,
    bonusType: 'smooth',
    weightModifier: 0.95,
    dialogues: {
      pickup: "Baba, Dhanmondi 32 e jabo. Ektu shanto bhabe chaliyo.",
      bump: "Uff Allah re! Amar komor ta shesh kore dila!",
      horn: "Bapre bap, eto horn bajale kaan phete jabe!",
      smooth: "Mashallah, khub sundor chalaccho baba.",
      lowPatience: "Ar parchi na, gari thamao!",
      delivered: "Bhalo thako baba, shundor chalaycho."
    }
  },
  {
    id: 'family',
    name: 'Kabir & Family with Bags',
    avatar: '🧳',
    trait: 'Heavy Load! Sluggish steering & braking',
    baseFare: 180,
    timeLimit: 60,
    patienceDrainRate: 0.9,
    bumpPatiencePenalty: 20,
    hornPatiencePenalty: 5,
    bonusType: 'safe',
    weightModifier: 1.4, // heavy handling
    dialogues: {
      pickup: "Bhai, Sadarghat launch terminal e jabo. Luggage gulo thik moto rakhun.",
      bump: "Bhai dekhun bag gulo pore jacche!",
      horn: "Bhai baccha ghumacche, aste bajaan.",
      smooth: "Gari ta bhalo tanche mama.",
      lowPatience: "Launch chere dibe mone hoy!",
      delivered: "Onek dhonnobad bhai, launch peye gechi!"
    }
  },
  {
    id: 'office',
    name: 'Farhan (Office Executive)',
    avatar: '💼',
    trait: 'Hates Noise! +৳40 bonus for 0 honks',
    baseFare: 150,
    timeLimit: 45,
    patienceDrainRate: 1.0,
    bumpPatiencePenalty: 15,
    hornPatiencePenalty: 15, // hates horn!
    bonusType: 'no_horn',
    weightModifier: 1.0,
    dialogues: {
      pickup: "Motijheel Bank Colony te jabo. Call cholche, shanto thakun.",
      bump: "Hey! Laptop e coffee pore gelo!",
      horn: "Please stop honking! I am on an urgent client call!",
      smooth: "Good driving. Nice and quiet.",
      lowPatience: "Meeting shuru hoye gelo to!",
      delivered: "Meeting thik shomoye pelam. Keep the change!"
    }
  }
];

class PassengerManager {
  constructor(roadManager) {
    this.road = roadManager;
    this.waitingPassenger = null; // roadside entity waiting for pickup
    this.activePassenger = null;  // currently boarded passenger
    this.dropZone = null;         // target delivery zone
    this.totalTripsCompleted = 0;
    this.perfectTripsCount = 0;
  }

  reset() {
    this.waitingPassenger = null;
    this.activePassenger = null;
    this.dropZone = null;
    this.totalTripsCompleted = 0;
    this.perfectTripsCount = 0;
  }

  /**
   * Spawn a new roadside passenger waiting for a ride
   */
  /**
   * Spawn a new roadside passenger waiting for a ride
   */
  spawnWaitingPassenger(aheadDistance = 450) {
    if (this.waitingPassenger || this.activePassenger) return;

    // Pick roadside: left side or right sidewalk
    const isLeft = Math.random() > 0.5;
    const normX = isLeft ? -1.18 : 1.18;
    const y = this.road.horizonY + 30; // Spawns in the distance!

    // Pick random passenger archetype
    const template = PASSENGER_TYPES[Math.floor(Math.random() * PASSENGER_TYPES.length)];
    this.waitingPassenger = {
      ...template,
      normX,
      x: this.road.getScreenX(normX, y),
      y,
      isLeft
    };
  }

  /**
   * Check if player is near waiting passenger and moving slowly enough to pick them up
   */
  checkPickup(playerX, playerY, playerSpeed) {
    if (!this.waitingPassenger || this.activePassenger) return null;

    const wp = this.waitingPassenger;
    const dist = Math.hypot(wp.x - playerX, wp.y - playerY);
    // Needs to be close (within 110px) and slow down (speed < 3.2)
    if (dist < 110 && Math.abs(playerSpeed) < 3.2) {
      const boarded = this.boardPassenger(this.waitingPassenger);
      this.waitingPassenger = null;
      return boarded;
    }
    return null;
  }

  boardPassenger(passengerData) {
    // Generate trip destination (distance to scroll)
    const tripDistance = 1600 + Math.random() * 1000;

    this.activePassenger = {
      ...passengerData,
      patience: 100,
      maxPatience: 100,
      currentFare: passengerData.baseFare,
      tripDistance,
      distanceRemaining: tripDistance,
      timeRemaining: passengerData.timeLimit,
      bumpsCount: 0,
      hornsCount: 0,
      currentMood: '😊',
      dialogue: passengerData.dialogues.pickup,
      dialogueTimer: 180
    };

    this.dropZone = null;
    return this.activePassenger;
  }

  recordBump(severity = 1) {
    if (!this.activePassenger) return;

    this.activePassenger.bumpsCount++;
    const penalty = this.activePassenger.bumpPatiencePenalty * severity;
    this.activePassenger.patience = Math.max(0, this.activePassenger.patience - penalty);

    this.activePassenger.currentMood = this.activePassenger.patience < 35 ? '😡' : '😨';
    this.activePassenger.dialogue = this.activePassenger.dialogues.bump;
    this.activePassenger.dialogueTimer = 140;
  }

  recordHorn() {
    if (!this.activePassenger) return;

    this.activePassenger.hornsCount++;
    const penalty = this.activePassenger.hornPatiencePenalty;
    this.activePassenger.patience = Math.max(0, this.activePassenger.patience - penalty);

    if (this.activePassenger.patience < 40) {
      this.activePassenger.currentMood = '😡';
      this.activePassenger.dialogue = this.activePassenger.dialogues.horn;
      this.activePassenger.dialogueTimer = 120;
    }
  }

  update(worldSpeedY, deltaTime = 1 / 60) {
    // 1. Update waiting passenger roadside position
    if (this.waitingPassenger) {
      const wp = this.waitingPassenger;
      wp.y += worldSpeedY;
      wp.x = this.road.getScreenX(wp.normX, wp.y);

      // If missed and scrolled past off screen, respawn ahead
      if (wp.y > this.road.height + 150) {
        this.waitingPassenger = null;
        this.spawnWaitingPassenger();
      }
    } else if (!this.activePassenger) {
      // Auto spawn waiting passenger if none
      this.spawnWaitingPassenger();
    }

    // 2. Update active trip
    if (this.activePassenger) {
      const p = this.activePassenger;

      if (worldSpeedY > 0) {
        p.distanceRemaining -= worldSpeedY;
      }

      p.timeRemaining = Math.max(0, p.timeRemaining - deltaTime);
      p.patience = Math.max(0, p.patience - p.patienceDrainRate * deltaTime * 1.8);
      p.currentFare = Math.max(40, p.baseFare - ((p.timeLimit - p.timeRemaining) * 0.8));

      // Spawn physical Drop Zone on road when ~320 units left
      if (p.distanceRemaining <= 340 && !this.dropZone) {
        const lane = Math.floor(Math.random() * 4);
        const y = this.road.horizonY + 30;
        this.dropZone = {
          lane,
          y,
          baseW: 110,
          baseH: 60
        };
      }

      if (this.dropZone) {
        this.dropZone.y += worldSpeedY;
      }

      // Mood evaluation
      if (p.patience > 70) {
        p.currentMood = '😊';
      } else if (p.patience > 40) {
        p.currentMood = '😐';
      } else if (p.patience > 15) {
        p.currentMood = '😨';
      } else {
        p.currentMood = '😡';
      }

      if (p.dialogueTimer > 0) {
        p.dialogueTimer--;
      } else if (p.patience < 30) {
        p.dialogue = p.dialogues.lowPatience;
        p.dialogueTimer = 160;
      }
    }
  }

  /**
   * Check if player reached the drop zone and slowed down to complete trip
   */
  checkDropoff(playerX, playerY, playerSpeed) {
    if (!this.activePassenger || !this.dropZone) return null;

    const dz = this.dropZone;
    const dzX = this.road.getLaneCenter(dz.lane, dz.y);
    const dist = Math.hypot(playerX - dzX, playerY - dz.y);

    if (dist < 85 && Math.abs(playerSpeed) < 2.8) {
      const p = this.activePassenger;
      this.totalTripsCompleted++;

      const fare = Math.round(p.currentFare);
      let tip = Math.round((p.patience / 100) * 40);
      let bonus = 0;
      let bonusNote = '';

      if (p.bumpsCount === 0) {
        bonus += 50;
        this.perfectTripsCount++;
        bonusNote = 'Perfect Trip Bonus! (+৳50)';
      }

      if (p.bonusType === 'no_horn' && p.hornsCount === 0) {
        bonus += 40;
        bonusNote = (bonusNote ? bonusNote + ' & ' : '') + 'Quiet Ride Bonus! (+৳40)';
      }

      const totalTripCash = fare + tip + bonus;

      const receipt = {
        passenger: p.name,
        fare,
        tip,
        bonus,
        bonusNote,
        total: totalTripCash,
        bumps: p.bumpsCount,
        dialogue: p.dialogues.delivered
      };

      this.activePassenger = null;
      this.dropZone = null;
      this.spawnWaitingPassenger();

      return receipt;
    }

    return null;
  }

  checkPatienceZero() {
    if (this.activePassenger && this.activePassenger.patience <= 0) {
      const abandoned = this.activePassenger;
      this.activePassenger = null;
      this.dropZone = null;
      this.spawnWaitingPassenger();
      return abandoned;
    }
    return null;
  }

  draw(ctx, time) {
    // 1. Draw roadside waiting passenger
    if (this.waitingPassenger && this.waitingPassenger.y >= this.road.horizonY) {
      const scale = this.road.getScale(this.waitingPassenger.y);
      ctx.save();
      ctx.translate(this.waitingPassenger.x, this.waitingPassenger.y);
      ctx.scale(scale, scale);
      SpriteRenderer.drawWaitingPassenger(ctx, 0, 0, this.waitingPassenger, time);
      ctx.restore();
    }

    // 2. Draw destination drop zone if active
    if (this.dropZone && this.dropZone.y >= this.road.horizonY) {
      const dz = this.dropZone;
      const scale = this.road.getScale(dz.y);
      const dzX = this.road.getLaneCenter(dz.lane, dz.y);
      ctx.save();
      ctx.translate(dzX, dz.y);
      ctx.scale(scale, scale);
      SpriteRenderer.drawDropZone(ctx, 0, 0, dz.baseW, dz.baseH, time);
      ctx.restore();
    }
  }
}

window.PassengerManager = PassengerManager;
