/**
 * CNG Rush - Main Game Controller & Physics Engine
 * Orchestrates rendering, player physics, collision detection, audio, HUD,
 * camera modes (Driver Cockpit POV & Chase Cam), exit dialogs, and level progression.
 */

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');

    // Display scaling
    this.initCanvasSize();

    // Managers
    this.particles = new ParticleSystem();
    this.road = new RoadManager(this.canvas.width, this.canvas.height);
    this.traffic = new TrafficManager(this.road);
    this.passengers = new PassengerManager(this.road);

    // Camera Mode: 'driver' (Driver Cockpit POV) or 'chase' (3rd person)
    this.cameraMode = 'driver';

    // Player State (Proportional to compact road)
    this.player = {
      x: this.road.getLaneCenter(1, this.canvas.height - 130),
      y: this.canvas.height - 130,
      width: 58,
      height: 96,
      speed: 0,
      maxSpeed: 8.5,
      accel: 0.22,
      friction: 0.08,
      steerSpeed: 4.8,
      rotation: 0,
      health: 100,
      damage: 0,
      isBraking: false,
      skidTimer: 0
    };

    // Economy & Shift Stats
    this.totalEarnings = 0;
    this.baseFaresTotal = 0;
    this.tipsTotal = 0;
    this.bonusesTotal = 0;
    this.penaltiesTotal = 0;
    this.strikes = 0;
    this.maxStrikes = 3;
    this.hornCount = 0;
    this.level = 1;
    this.shiftTime = 0;
    this.bestScore = parseInt(localStorage.getItem('cng_rush_best_score') || '0', 10);

    // Key inputs
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false,
      space: false
    };

    // Game state: 'start', 'playing', 'paused', 'gameover'
    this.state = 'start';
    this.lastTime = performance.now();
    this.globalTime = 0;

    // DOM UI Elements
    this.bindDOM();
    this.bindEvents();

    // Start rendering initial title loop
    requestAnimationFrame(this.loop.bind(this));
  }

  initCanvasSize() {
    const container = document.getElementById('game-container');
    const rect = container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  bindDOM() {
    this.hud = document.getElementById('hud');
    this.bottomBar = document.getElementById('bottom-bar');
    this.startScreen = document.getElementById('start-screen');
    this.pauseScreen = document.getElementById('pause-screen');
    this.exitModal = document.getElementById('exit-modal');
    this.gameOverScreen = document.getElementById('game-over-screen');

    this.meterFareEl = document.getElementById('meter-fare');
    this.hudTotalCashEl = document.getElementById('hud-total-cash');
    this.hudSpeedEl = document.getElementById('hud-speed');
    this.hudHornEl = document.getElementById('hud-horn-count');
    this.hudLevelEl = document.getElementById('hud-level');
    this.hudWeatherEl = document.getElementById('hud-weather');
    this.healthFillEl = document.getElementById('health-fill');
    this.heartsContainerEl = document.getElementById('hearts-container');

    // Camera toggle button
    this.btnCameraEl = document.getElementById('btn-camera-toggle');

    // Passenger card DOM
    this.passengerCardEl = document.getElementById('passenger-card');
    this.searchCardEl = document.getElementById('search-card');
    this.passengerAvatarEl = document.getElementById('passenger-avatar');
    this.passengerNameEl = document.getElementById('passenger-name');
    this.passengerTraitEl = document.getElementById('passenger-trait');
    this.passengerMoodEl = document.getElementById('passenger-mood-emoji');
    this.passengerBubbleEl = document.getElementById('passenger-bubble');
    this.patienceFillEl = document.getElementById('patience-fill');
    this.tripFillEl = document.getElementById('trip-fill');

    // Game over receipt elements
    this.recTripsEl = document.getElementById('rec-trips');
    this.recBaseEl = document.getElementById('rec-base');
    this.recTipsEl = document.getElementById('rec-tips');
    this.recBonusEl = document.getElementById('rec-bonus');
    this.recPenaltiesEl = document.getElementById('rec-penalties');
    this.recTotalEl = document.getElementById('rec-total');
    this.recBestEl = document.getElementById('rec-best');
    this.bestScoreDisplayEl = document.getElementById('best-score-display');

    if (this.bestScoreDisplayEl) {
      this.bestScoreDisplayEl.textContent = this.bestScore;
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.initCanvasSize();
      this.road.resize(this.canvas.width, this.canvas.height);
      this.player.y = this.canvas.height - 130;
    });

    // Keyboard handlers
    window.addEventListener('keydown', (e) => {
      window.soundManager.ensureContext();

      if (e.code === 'KeyW' || e.code === 'ArrowUp') this.keys.up = true;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') this.keys.down = true;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.keys.left = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.keys.right = true;

      if (e.code === 'Space') {
        e.preventDefault();
        if (this.state === 'playing') {
          this.triggerHorn();
        }
      }

      if (e.code === 'KeyC') {
        this.toggleCamera();
      }

      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (this.state === 'playing') this.pauseGame();
        else if (this.state === 'paused') this.resumeGame();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') this.keys.up = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') this.keys.down = false;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.keys.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.keys.right = false;
    });

    // Button Listeners
    const btnStart = document.getElementById('btn-start');
    if (btnStart) {
      btnStart.addEventListener('click', () => {
        window.soundManager.ensureContext();
        this.startShift();
      });
    }

    const btnAudioToggle = document.getElementById('btn-audio-toggle');
    if (btnAudioToggle) {
      btnAudioToggle.addEventListener('click', (e) => {
        window.soundManager.ensureContext();
        const on = window.soundManager.toggleMute();
        e.target.textContent = on ? '🔊 SOUND: ON' : '🔇 SOUND: OFF';
      });
    }

    const btnPauseAudio = document.getElementById('btn-pause-audio');
    if (btnPauseAudio) {
      btnPauseAudio.addEventListener('click', (e) => {
        const on = window.soundManager.toggleMute();
        e.target.textContent = on ? '🔊 SOUND: ON' : '🔇 SOUND: OFF';
      });
    }

    const btnResume = document.getElementById('btn-resume');
    if (btnResume) {
      btnResume.addEventListener('click', () => {
        this.resumeGame();
      });
    }

    const btnQuit = document.getElementById('btn-quit');
    if (btnQuit) {
      btnQuit.addEventListener('click', () => {
        this.pauseScreen.classList.add('hidden');
        this.showExitModal();
      });
    }

    const btnRestart = document.getElementById('btn-restart');
    if (btnRestart) {
      btnRestart.addEventListener('click', () => {
        this.startShift();
      });
    }

    // Camera Toggle Button
    if (this.btnCameraEl) {
      this.btnCameraEl.addEventListener('click', () => {
        this.toggleCamera();
      });
    }

    // Exit Button in HUD
    const btnHudExit = document.getElementById('btn-hud-exit');
    if (btnHudExit) {
      btnHudExit.addEventListener('click', () => {
        this.showExitModal();
      });
    }

    // Exit Confirmation Modal Buttons
    const btnConfirmExit = document.getElementById('btn-confirm-exit');
    if (btnConfirmExit) {
      btnConfirmExit.addEventListener('click', () => {
        this.hideExitModal();
        this.exitToTitleScreen();
      });
    }

    const btnCancelExit = document.getElementById('btn-cancel-exit');
    if (btnCancelExit) {
      btnCancelExit.addEventListener('click', () => {
        this.hideExitModal();
      });
    }

    // Start Screen Exit Button
    const btnExitGame = document.getElementById('btn-exit-game');
    if (btnExitGame) {
      btnExitGame.addEventListener('click', () => {
        if (confirm('Exit CNG Rush? Thank you for playing! (ধন্যবাদ!)')) {
          window.location.reload();
        }
      });
    }
  }

  toggleCamera() {
    this.cameraMode = this.cameraMode === 'driver' ? 'chase' : 'driver';
    if (this.btnCameraEl) {
      this.btnCameraEl.textContent = this.cameraMode === 'driver' ? '🎥 VIEW: DRIVER' : '🎥 VIEW: CHASE';
    }
    this.particles.addFloatingText(`Camera: ${this.cameraMode.toUpperCase()} POV`, this.canvas.width / 2, this.canvas.height / 2 - 40, 'info');
  }

  showExitModal() {
    if (this.exitModal) {
      this.exitModal.classList.remove('hidden');
    }
  }

  hideExitModal() {
    if (this.exitModal) {
      this.exitModal.classList.add('hidden');
    }
  }

  exitToTitleScreen() {
    this.state = 'start';
    this.hud.classList.add('hidden');
    this.bottomBar.classList.add('hidden');
    this.pauseScreen.classList.add('hidden');
    this.gameOverScreen.classList.add('hidden');
    this.hideExitModal();
    this.startScreen.classList.remove('hidden');

    // Reset vehicle & engine sound
    this.player.speed = 0;
    window.soundManager.updateEngine(0, this.player.maxSpeed, false);
    window.soundManager.setRain(false);
  }

  startShift() {
    this.state = 'playing';
    this.totalEarnings = 0;
    this.baseFaresTotal = 0;
    this.tipsTotal = 0;
    this.bonusesTotal = 0;
    this.penaltiesTotal = 0;
    this.strikes = 0;
    this.hornCount = 0;
    this.level = 1;
    this.shiftTime = 0;

    this.player.health = 100;
    this.player.damage = 0;
    this.player.speed = 0;
    this.player.rotation = 0;
    this.player.y = this.canvas.height - 130;
    this.player.x = this.road.getLaneCenter(1, this.player.y);

    this.road.setWeather('clear');
    this.traffic.reset();
    this.traffic.setLevel(1);
    this.passengers.reset();
    this.particles.reset();

    // UI updates
    this.startScreen.classList.add('hidden');
    this.pauseScreen.classList.add('hidden');
    this.gameOverScreen.classList.add('hidden');
    this.hideExitModal();
    this.hud.classList.remove('hidden');
    this.bottomBar.classList.remove('hidden');

    this.updateHUD();
    this.particles.addFloatingText('SHIFT STARTED! Bismillah!', this.canvas.width / 2, this.canvas.height / 2, 'reward');
  }

  pauseGame() {
    this.state = 'paused';
    this.pauseScreen.classList.remove('hidden');
  }

  resumeGame() {
    this.state = 'playing';
    this.pauseScreen.classList.add('hidden');
  }

  endShift(reason = 'Day completed!') {
    this.state = 'gameover';
    this.hud.classList.add('hidden');
    this.bottomBar.classList.add('hidden');

    const netEarnings = Math.max(0, this.totalEarnings);
    if (netEarnings > this.bestScore) {
      this.bestScore = netEarnings;
      localStorage.setItem('cng_rush_best_score', this.bestScore.toString());
    }

    // Populate receipt
    document.getElementById('game-over-reason').textContent = reason;
    this.recTripsEl.textContent = this.passengers.totalTripsCompleted;
    this.recBaseEl.textContent = this.baseFaresTotal;
    this.recTipsEl.textContent = this.tipsTotal;
    this.recBonusEl.textContent = this.bonusesTotal;
    this.recPenaltiesEl.textContent = this.penaltiesTotal;
    this.recTotalEl.textContent = netEarnings;
    this.recBestEl.textContent = this.bestScore;
    document.getElementById('receipt-id').textContent = Math.floor(1000 + Math.random() * 9000);

    this.gameOverScreen.classList.remove('hidden');
  }

  triggerHorn() {
    this.hornCount++;
    this.hudHornEl.textContent = this.hornCount;
    window.soundManager.playHorn();

    const affected = this.traffic.reactToHorn(this.player.x, this.player.y, 260);

    if (this.passengers.activePassenger) {
      this.passengers.recordHorn();
    }

    if (affected > 0) {
      this.particles.addFloatingText('📢 Honk!', this.player.x, this.player.y - 40, 'info');
    }
  }

  updatePlayerPhysics(deltaTime) {
    const p = this.player;
    const activePass = this.passengers.activePassenger;

    const weightMod = activePass ? activePass.weightModifier : 1.0;
    const currentMaxSpeed = p.maxSpeed / Math.sqrt(weightMod);
    const currentAccel = p.accel / weightMod;
    const currentSteer = p.steerSpeed / weightMod;

    p.isBraking = false;
    let isAccelerating = false;

    if (this.keys.up) {
      isAccelerating = true;
      if (p.speed < currentMaxSpeed) {
        p.speed += currentAccel;
      }
      if (Math.random() < 0.4) {
        this.particles.addExhaustSmoke(p.x - 14, p.y + p.height / 2, p.speed);
      }
    } else if (this.keys.down) {
      p.isBraking = true;
      if (p.speed > 0) {
        p.speed -= currentAccel * 1.8;
        p.skidTimer++;
        if (p.skidTimer % 4 === 0) {
          this.particles.addSkidMark(p.x - p.width / 2 + 8, p.y + p.height / 2 - 4);
          this.particles.addSkidMark(p.x + p.width / 2 - 8, p.y + p.height / 2 - 4);
        }
      } else if (p.speed > -3.2) {
        p.speed -= currentAccel * 0.7; // Reverse
      }
    } else {
      if (p.speed > 0) {
        p.speed = Math.max(0, p.speed - p.friction);
      } else if (p.speed < 0) {
        p.speed = Math.min(0, p.speed + p.friction);
      }
    }

    // Steering Left & Right
    let targetRotation = 0;
    if (this.keys.left) {
      p.x -= currentSteer;
      targetRotation = -0.12;
      if (p.speed > 4.5 && Math.random() < 0.25) {
        this.particles.addSkidMark(p.x + p.width / 2 - 8, p.y + p.height / 2 - 4);
      }
    } else if (this.keys.right) {
      p.x += currentSteer;
      targetRotation = 0.12;
      if (p.speed > 4.5 && Math.random() < 0.25) {
        this.particles.addSkidMark(p.x - p.width / 2 + 8, p.y + p.height / 2 - 4);
      }
    }

    p.rotation += (targetRotation - p.rotation) * 0.25;

    // Road boundaries at player's Y coordinate
    const roadLeft = this.road.getRoadLeftAt(p.y);
    const roadWidth = this.road.getRoadWidthAt(p.y);
    const minX = roadLeft - 8;
    const maxX = roadLeft + roadWidth + 8;

    if (p.x < minX) {
      p.x = minX;
      p.speed *= 0.85;
    } else if (p.x > maxX) {
      p.x = maxX;
      p.speed *= 0.85;
    }

    // Engine sound update
    window.soundManager.updateEngine(p.speed, currentMaxSpeed, isAccelerating);
  }

  checkCollisions() {
    const p = this.player;
    const pBox = {
      left: p.x - p.width / 2 + 6,
      right: p.x + p.width / 2 - 6,
      top: p.y - p.height / 2 + 8,
      bottom: p.y + p.height / 2 - 6
    };

    // 1. Pedestrian Accident Collision (user requested: "if CNG hit a person that olso count as accident")
    for (const ped of this.traffic.pedestrians) {
      if (!ped.isHit && Math.hypot(ped.x - p.x, ped.y - p.y) < 38) {
        ped.isHit = true;
        window.soundManager.playCrash(1.5);
        this.particles.triggerShake(18);
        this.particles.addSparks((p.x + ped.x) / 2, (p.y + ped.y) / 2, 16);

        // Severe pedestrian hit penalty
        const penalty = 25;
        this.totalEarnings -= penalty;
        this.penaltiesTotal += penalty;
        p.health = Math.max(0, p.health - 16);
        p.damage = (100 - p.health) / 100;

        this.particles.addFloatingText('-৳25 ACCIDENT! HIT PEDESTRIAN!', p.x, p.y - 35, 'penalty');
        this.passengers.recordBump(2.2);

        if (this.passengers.activePassenger) {
          this.passengers.activePassenger.dialogue = "O Allah re! Manush mere phelchen mama?!";
          this.passengers.activePassenger.dialogueTimer = 180;
          this.passengers.activePassenger.currentMood = '😡';
        }

        p.speed *= 0.25;

        if (p.health <= 0) {
          this.endShift('CNG Totaled! Wrecked in severe pedestrian accident.');
          return;
        }
      }
    }

    // 2. Vehicles Collision
    for (let i = this.traffic.vehicles.length - 1; i >= 0; i--) {
      const v = this.traffic.vehicles[i];
      const scale = this.road.getScale(v.y);
      const vW = v.baseW * scale;
      const vH = v.baseH * scale;

      const vBox = {
        left: v.x - vW / 2 + 4,
        right: v.x + vW / 2 - 4,
        top: v.y - vH / 2 + 4,
        bottom: v.y + vH / 2 - 4
      };

      if (
        pBox.right > vBox.left &&
        pBox.left < vBox.right &&
        pBox.bottom > vBox.top &&
        pBox.top < vBox.bottom
      ) {
        const relativeSpeed = Math.abs(p.speed - v.speed) + 2;
        const severity = Math.min(2.5, relativeSpeed / 3);

        window.soundManager.playCrash(severity);
        this.particles.triggerShake(14 * severity);
        this.particles.addSparks((p.x + v.x) / 2, (p.y + v.y) / 2, 16);

        const healthLoss = Math.round(12 * severity);
        p.health = Math.max(0, p.health - healthLoss);
        p.damage = (100 - p.health) / 100;

        const penalty = Math.round(8 * severity);
        this.totalEarnings -= penalty;
        this.penaltiesTotal += penalty;
        this.particles.addFloatingText(`-৳${penalty} CRASH!`, p.x, p.y - 25, 'penalty');

        this.passengers.recordBump(severity);

        p.speed = -p.speed * 0.4;
        if (p.x < v.x) p.x -= 16;
        else p.x += 16;

        if (p.health <= 0) {
          this.endShift('CNG Totaled! Wrecked in Dhaka traffic.');
          return;
        }
      }
    }

    // 3. Processions Collision
    for (const pr of this.traffic.processions) {
      if (Math.abs(p.y - pr.y) < 32) {
        this.particles.triggerShake(6);
        this.particles.addFloatingText('Blocked by Rally!', p.x, p.y - 25, 'penalty');
        p.speed = -1.5;
      }
    }

    // 4. Hazards: Potholes & Puddles
    for (const h of this.road.hazards) {
      if (Math.abs(h.y - p.y) < 30) {
        const hx = this.road.getLaneCenter(h.lane, h.y);
        const dist = Math.hypot(hx - p.x, h.y - p.y);

        if (h.type === 'pothole') {
          if (dist < 32 && !h.hit && Math.abs(p.speed) > 1.5) {
            h.hit = true;
            window.soundManager.playCrash(0.5);
            this.particles.triggerShake(8);
            this.particles.addFloatingText('-৳5 Pothole Bump!', p.x, p.y - 25, 'penalty');
            this.totalEarnings -= 5;
            this.penaltiesTotal += 5;
            this.passengers.recordBump(0.8);
            p.speed *= 0.7;
            p.health = Math.max(0, p.health - 4);
            p.damage = (100 - p.health) / 100;
          }
        } else if (h.type === 'puddle') {
          if (dist < 36 && !h.hit && Math.abs(p.speed) > 1.5) {
            h.hit = true;
            window.soundManager.playSplash();
            this.particles.addWaterSplash(p.x, p.y + 10, 18);
            this.particles.addFloatingText('Water Splash!', p.x, p.y - 25, 'info');
            p.rotation += (Math.random() > 0.5 ? 0.18 : -0.18);
            p.speed *= 0.85;
          }
        }
      }
    }
  }

  checkMissionsAndProgress() {
    const p = this.player;

    // 1. Pickup
    const pickup = this.passengers.checkPickup(p.x, p.y, p.speed);
    if (pickup) {
      window.soundManager.playPickup();
      this.particles.addFloatingText(`Passenger Boarded!`, p.x, p.y - 35, 'reward');
    }

    // 2. Drop-off
    const dropoff = this.passengers.checkDropoff(p.x, p.y, p.speed);
    if (dropoff) {
      window.soundManager.playDropoff();
      this.particles.addMoneySparkle(p.x, p.y, 22);

      this.totalEarnings += dropoff.total;
      this.baseFaresTotal += dropoff.fare;
      this.tipsTotal += dropoff.tip;
      this.bonusesTotal += dropoff.bonus;

      this.particles.addFloatingText(`+৳${dropoff.total} (Delivered!)`, p.x, p.y - 35, 'reward');
      if (dropoff.bonusNote) {
        setTimeout(() => {
          this.particles.addFloatingText(dropoff.bonusNote, p.x, p.y - 55, 'bonus');
        }, 300);
      }

      const trips = this.passengers.totalTripsCompleted;
      if (trips === 2 && this.level === 1) {
        this.level = 2;
        this.traffic.setLevel(2);
        this.particles.addFloatingText('LEVEL 2: Pedestrians Crossing!', this.canvas.width / 2, this.canvas.height / 2, 'bonus');
      } else if (trips === 4 && this.level === 2) {
        this.level = 3;
        this.traffic.setLevel(3);
        this.road.setWeather('rain');
        this.particles.addFloatingText('LEVEL 3: Monsoon Rain & Slick Roads!', this.canvas.width / 2, this.canvas.height / 2, 'bonus');
      } else if (trips === 6 && this.level === 3) {
        this.level = 4;
        this.traffic.setLevel(4);
        this.particles.addFloatingText('LEVEL 4: Rush Hour Gridlock & Rallies!', this.canvas.width / 2, this.canvas.height / 2, 'bonus');
      }
    }

    // 3. Lost Passenger
    const lost = this.passengers.checkPatienceZero();
    if (lost) {
      window.soundManager.playAngry();
      this.strikes++;
      this.particles.addFloatingText('Passenger Walked Out in Anger!', p.x, p.y - 35, 'penalty');
      this.particles.triggerShake(12);

      p.health = Math.max(0, p.health - 25);
      p.damage = (100 - p.health) / 100;

      if (this.strikes >= this.maxStrikes || p.health <= 0) {
        this.endShift('Too many walkouts! Shift terminated.');
      }
    }
  }

  updateHUD() {
    const pass = this.passengers.activePassenger;
    this.meterFareEl.textContent = pass ? Math.round(pass.currentFare) : 0;
    this.hudTotalCashEl.textContent = Math.max(0, this.totalEarnings);

    const kmh = Math.round(Math.abs(this.player.speed) * 6.5);
    this.hudSpeedEl.textContent = kmh;

    this.healthFillEl.style.width = `${this.player.health}%`;
    this.healthFillEl.style.background = this.player.health < 30 ? '#ef4444' : 'linear-gradient(90deg, #ef4444, #10b981)';

    this.hudLevelEl.textContent = this.level;
    this.hudWeatherEl.textContent = this.road.weather === 'rain' ? '🌧️ Monsoon' : '☀️ Clear';

    if (this.heartsContainerEl) {
      const hearts = this.heartsContainerEl.children;
      const h = Math.max(0, Math.min(100, this.player.health));
      const totalHearts = hearts.length || 3;

      for (let i = 0; i < totalHearts; i++) {
        const minSegment = (i / totalHearts) * 100;
        const midSegment = ((i + 0.5) / totalHearts) * 100;

        if (h > midSegment) {
          // Full healthy heart
          hearts[i].textContent = '❤️';
          hearts[i].classList.remove('lost', 'cracked');
          hearts[i].classList.add('active');
        } else if (h > minSegment) {
          // Cracked heart showing damage from accidents
          hearts[i].textContent = '💔';
          hearts[i].classList.remove('lost');
          hearts[i].classList.add('cracked', 'active');
        } else {
          // Empty lost heart
          hearts[i].textContent = '🖤';
          hearts[i].classList.remove('active', 'cracked');
          hearts[i].classList.add('lost');
        }
      }
    }

    if (this.searchCardEl) {
      if (pass) {
        this.searchCardEl.classList.add('hidden');
      } else {
        this.searchCardEl.classList.remove('hidden');
      }
    }

    if (this.passengerCardEl) {
      if (pass) {
        this.passengerCardEl.classList.remove('hidden');

        if (this.passengerAvatarEl) this.passengerAvatarEl.textContent = pass.avatar;
        if (this.passengerNameEl) this.passengerNameEl.textContent = pass.name;
        if (this.passengerTraitEl) this.passengerTraitEl.textContent = pass.trait;
        if (this.passengerMoodEl) this.passengerMoodEl.textContent = pass.currentMood;
        if (this.passengerBubbleEl) this.passengerBubbleEl.textContent = `"${pass.dialogue}"`;

        if (this.patienceFillEl) this.patienceFillEl.style.width = `${pass.patience}%`;
        const tripProgress = Math.min(100, Math.max(0, ((pass.tripDistance - pass.distanceRemaining) / pass.tripDistance) * 100));
        if (this.tripFillEl) this.tripFillEl.style.width = `${tripProgress}%`;
      } else {
        this.passengerCardEl.classList.add('hidden');
      }
    }
  }

  loop(currentTime) {
    const deltaTime = Math.min(0.1, (currentTime - this.lastTime) / 1000);
    this.lastTime = currentTime;
    this.globalTime += deltaTime;

    if (this.state === 'playing') {
      this.updatePlayerPhysics(deltaTime);

      // World scrolling: positive speed moves environment down; negative moves it up
      const worldSpeedY = this.player.speed;

      this.road.update(worldSpeedY, this.globalTime);
      this.traffic.update(worldSpeedY, this.globalTime);
      this.passengers.update(worldSpeedY, deltaTime);
      this.particles.update(worldSpeedY);

      this.checkCollisions();
      this.checkMissionsAndProgress();
      this.updateHUD();
    } else if (this.state === 'start') {
      this.road.update(2.2, this.globalTime);
      this.particles.update(2.2);
    }

    this.render();
    requestAnimationFrame(this.loop.bind(this));
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const shake = this.particles.getShakeOffset();
    const screenCenterX = this.canvas.width / 2;

    ctx.save();
    ctx.translate(shake.x, shake.y);

    // Camera Translation:
    // In Driver View, camera moves with the driver (player.x) so the road, lanes,
    // and oncoming traffic dynamically shift across the windshield as you steer!
    // In Chase View, camera follows smoothly.
    let camOffsetX = 0;
    if (this.cameraMode === 'driver') {
      camOffsetX = screenCenterX - this.player.x;
      const camYaw = this.player.rotation * 110;
      ctx.translate(camOffsetX - camYaw, 0);

      // Camera roll/banking into turns
      if (Math.abs(this.player.rotation) > 0.001) {
        ctx.translate(this.player.x, this.road.horizonY + 60);
        ctx.rotate(this.player.rotation * 0.16);
        ctx.translate(-this.player.x, -(this.road.horizonY + 60));
      }
    } else {
      camOffsetX = (screenCenterX - this.player.x) * 0.45;
      ctx.translate(camOffsetX, 0);
    }

    // 1. Perspective Road & Roadside Scenery (World space)
    this.road.draw(ctx, this.globalTime);

    // 2. Skid marks
    this.particles.drawSkids(ctx);

    // 3. Waiting Passengers & Drop Zones
    this.passengers.draw(ctx, this.globalTime);

    // 4. Traffic (Buses, Rickshaws, AI CNGs, Pedestrians)
    this.traffic.draw(ctx, this.globalTime);

    // 5. Chase Camera: Draw the full exterior green CNG 3-wheeler in its lane
    if (this.state === 'playing' || this.state === 'paused') {
      const activePass = this.passengers.activePassenger;

      if (this.cameraMode === 'chase') {
        SpriteRenderer.drawCNG(ctx, this.player.x, this.player.y, this.player.width, this.player.height, {
          rotation: this.player.rotation,
          isBraking: this.player.isBraking,
          damage: this.player.damage,
          isPlayer: true,
          bodyColor: '#0a7e3a',
          roofColor: '#facc15',
          hasPassenger: !!activePass,
          passengerEmoji: activePass ? activePass.avatar : '👨'
        });
      }
    }

    // 6. Particles in world coordinates
    this.particles.drawParticles(ctx);

    // 7. Weather overlay
    this.road.drawWeatherOverlay(ctx);

    // 8. Floating Texts
    this.particles.drawFloatingTexts(ctx);

    // Restore world camera transform before rendering driver cockpit overlay
    ctx.restore();

    // 9. Driver Cockpit POV Overlay (drawn fixed to driver's screen)
    if (this.cameraMode === 'driver' && (this.state === 'playing' || this.state === 'paused')) {
      const activePass = this.passengers.activePassenger;
      SpriteRenderer.drawDriverCockpit(ctx, this.canvas.width, this.canvas.height, {
        steerAngle: this.player.rotation * 8,
        speed: this.player.speed,
        damage: this.player.damage,
        isRaining: this.road.weather === 'rain',
        time: this.globalTime,
        fare: activePass ? Math.round(activePass.currentFare) : 0,
        passenger: activePass
      });
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
