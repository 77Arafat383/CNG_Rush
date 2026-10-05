/**
 * Audio System for CNG Rush
 * Generates retro 8-bit / arcade synthesizer sound effects using the Web Audio API.
 * No external audio files required! Works completely offline and with zero latency.
 */
class SoundManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.engineGain = null;
    this.engineOsc = null;
    this.engineNoise = null;
    this.rainGain = null;
    this.rainSource = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.initEngineSound();
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  ensureContext() {
    if (!this.initialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.engineGain) {
      this.engineGain.gain.setValueAtTime(this.isMuted ? 0 : 0.08, this.ctx.currentTime);
    }
    if (this.rainGain && this.isMuted) {
      this.rainGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
    return !this.isMuted;
  }

  /**
   * Continuous 2-stroke sputtering CNG engine sound
   */
  initEngineSound() {
    if (!this.ctx) return;

    // Master engine gain
    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    this.engineGain.connect(this.ctx.destination);

    // Primary low thumping pulse (mimics 2-stroke cylinder pop)
    this.engineOsc = this.ctx.createOscillator();
    this.engineOsc.type = 'sawtooth';
    this.engineOsc.frequency.setValueAtTime(35, this.ctx.currentTime);

    // Modulator for the chugging 2-stroke flutter
    this.engineMod = this.ctx.createOscillator();
    this.engineMod.type = 'square';
    this.engineMod.frequency.setValueAtTime(14, this.ctx.currentTime);

    const modGain = this.ctx.createGain();
    modGain.gain.setValueAtTime(15, this.ctx.currentTime);
    this.engineMod.connect(modGain);
    modGain.connect(this.engineOsc.frequency);

    // Low pass filter to make it sound mechanical & rumbling
    this.engineFilter = this.ctx.createBiquadFilter();
    this.engineFilter.type = 'lowpass';
    this.engineFilter.frequency.setValueAtTime(280, this.ctx.currentTime);

    this.engineOsc.connect(this.engineFilter);
    this.engineFilter.connect(this.engineGain);

    this.engineOsc.start();
    this.engineMod.start();
  }

  updateEngine(speed, maxSpeed, isAccelerating) {
    if (!this.ctx || !this.engineOsc || this.isMuted) return;

    const ratio = Math.max(0, Math.min(1, Math.abs(speed) / (maxSpeed || 1)));
    const now = this.ctx.currentTime;

    // Pitch increases with speed and acceleration
    const baseFreq = 30 + ratio * 45 + (isAccelerating ? 15 : 0);
    const modFreq = 12 + ratio * 28 + (isAccelerating ? 6 : 0);
    const filterFreq = 240 + ratio * 350;

    this.engineOsc.frequency.setTargetAtTime(baseFreq, now, 0.05);
    this.engineMod.frequency.setTargetAtTime(modFreq, now, 0.05);
    this.engineFilter.frequency.setTargetAtTime(filterFreq, now, 0.08);

    const targetGain = this.isMuted ? 0 : 0.06 + (ratio * 0.06);
    this.engineGain.gain.setTargetAtTime(targetGain, now, 0.05);
  }

  /**
   * Iconic Dhaka CNG Dual-Tone Pip-Pip Air Horn
   */
  playHorn() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'square';

    // Classic twin tone ~ 440Hz and 554Hz (A4 + C#5)
    osc1.frequency.setValueAtTime(440, now);
    osc2.frequency.setValueAtTime(554, now);

    // Slight vibrato
    osc1.frequency.exponentialRampToValueAtTime(460, now + 0.18);
    osc2.frequency.exponentialRampToValueAtTime(580, now + 0.18);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.22);
    osc2.stop(now + 0.22);
  }

  /**
   * Metal crash and bump impact
   */
  playCrash(severity = 1) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, now);
    filter.Q.setValueAtTime(3, now);

    const gain = this.ctx.createGain();
    const volume = Math.min(0.4, 0.18 * severity);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    whiteNoise.start(now);
  }

  /**
   * Passenger boarding chime
   */
  playPickup() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [330, 440, 554, 659]; // E4, A4, C#5, E5
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.15, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.14);
    });
  }

  /**
   * Cash / Drop-off Success Chime
   */
  playDropoff() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Upward triumphant arpeggio + bell
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.2, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.25);
    });
  }

  /**
   * Water Splash sound when hitting puddles
   */
  playSplash() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.2);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
  }

  /**
   * Passenger Angry Grunt / Buzz
   */
  playAngry() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.25);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  /**
   * Ambient rain sound generator
   */
  setRain(enabled) {
    if (!this.ctx) return;
    if (enabled && !this.rainSource && !this.isMuted) {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.3;
      }

      this.rainSource = this.ctx.createBufferSource();
      this.rainSource.buffer = buffer;
      this.rainSource.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1000;

      this.rainGain = this.ctx.createGain();
      this.rainGain.gain.setValueAtTime(0.05, this.ctx.currentTime);

      this.rainSource.connect(filter);
      filter.connect(this.rainGain);
      this.rainGain.connect(this.ctx.destination);

      this.rainSource.start();
    } else if (!enabled && this.rainSource) {
      try {
        this.rainSource.stop();
        this.rainSource.disconnect();
      } catch (e) {}
      this.rainSource = null;
    }
  }
}

// Global instance
window.soundManager = new SoundManager();
