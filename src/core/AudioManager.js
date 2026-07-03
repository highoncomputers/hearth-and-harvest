export class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterVolume = 0.7;
    this.musicVolume = 0.5;
    this.sfxVolume = 0.8;
    this.muted = false;
    this.buffers = new Map();
    this.sfxPool = [];
    this.currentMusic = null;
    this.initialized = false;
    this.ambientNodes = [];
  }

  async init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
      this._generateProceduralSounds();
    } catch (e) {
      console.warn('AudioContext init failed:', e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  _generateProceduralSounds() {
    this.buffers.set('click', this._createClickBuffer());
    this.buffers.set('whoosh', this._createWhooshBuffer());
    this.buffers.set('hit', this._createHitBuffer());
    this.buffers.set('sword_swing', this._createSwordSwingBuffer());
    this.buffers.set('bow_shoot', this._createBowShootBuffer());
    this.buffers.set('block', this._createBlockBuffer());
    this.buffers.set('footstep', this._createFootstepBuffer());
    this.buffers.set('pickup', this._createPickupBuffer());
    this.buffers.set('hurt', this._createHurtBuffer());
    this.buffers.set('death', this._createDeathBuffer());
    this.buffers.set('rain', this._createRainBuffer());
    this.buffers.set('fire', this._createFireBuffer());
    this.buffers.set('till', this._createTillBuffer());
    this.buffers.set('water', this._createWaterBuffer());
    this.buffers.set('ambient_birds', this._createAmbientBirdsBuffer());
    this.buffers.set('ambient_wind', this._createAmbientWindBuffer());
  }

  _createBuffer(duration, fn) {
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    fn(data, sampleRate);
    return buffer;
  }

  _createClickBuffer() {
    return this._createBuffer(0.05, (data) => {
      for (let i = 0; i < data.length; i++) {
        const t = i / this.ctx.sampleRate;
        data[i] = Math.sin(2 * Math.PI * 800 * t) * Math.exp(-t * 80) * 0.5;
      }
    });
  }

  _createWhooshBuffer() {
    return this._createBuffer(0.2, (data) => {
      for (let i = 0; i < data.length; i++) {
        const t = i / this.ctx.sampleRate;
        data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 15) * 0.3;
      }
    });
  }

  _createHitBuffer() {
    return this._createBuffer(0.15, (data) => {
      for (let i = 0; i < data.length; i++) {
        const t = i / this.ctx.sampleRate;
        data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 30) * 0.6 +
          Math.sin(2 * Math.PI * 200 * t) * Math.exp(-t * 20) * 0.4;
      }
    });
  }

  _createSwordSwingBuffer() {
    return this._createBuffer(0.3, (data) => {
      for (let i = 0; i < data.length; i++) {
        const t = i / this.ctx.sampleRate;
        const sweep = 200 + t * 2000;
        data[i] = Math.sin(2 * Math.PI * sweep * t) * Math.exp(-t * 10) * 0.2 +
          (Math.random() * 2 - 1) * Math.exp(-t * 12) * 0.15;
      }
    });
  }

  _createBowShootBuffer() {
    return this._createBuffer(0.4, (data) => {
      for (let i = 0; i < data.length; i++) {
        const t = i / this.ctx.sampleRate;
        const twang = Math.sin(2 * Math.PI * (300 + t * 800) * t) * Math.exp(-t * 12) * 0.4;
        const air = (Math.random() * 2 - 1) * Math.exp(-t * 8) * 0.15;
        data[i] = twang + air;
      }
    });
  }

  _createBlockBuffer() {
    return this._createBuffer(0.1, (data) => {
      for (let i = 0; i < data.length; i++) {
        const t = i / this.ctx.sampleRate;
        data[i] = Math.sin(2 * Math.PI * 1200 * t) * Math.exp(-t * 50) * 0.5 +
          Math.sin(2 * Math.PI * 600 * t) * Math.exp(-t * 40) * 0.3;
      }
    });
  }

  _createFootstepBuffer() {
    return this._createBuffer(0.1, (data) => {
      for (let i = 0; i < data.length; i++) {
        const t = i / this.ctx.sampleRate;
        data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 40) * 0.4 +
          Math.sin(2 * Math.PI * 100 * t) * Math.exp(-t * 30) * 0.3;
      }
    });
  }

  _createPickupBuffer() {
    return this._createBuffer(0.2, (data) => {
      for (let i = 0; i < data.length; i++) {
        const t = i / this.ctx.sampleRate;
        data[i] = (Math.sin(2 * Math.PI * 600 * t) * 0.3 + Math.sin(2 * Math.PI * 900 * t) * 0.2) *
          Math.exp(-t * 15);
      }
    });
  }

  _createHurtBuffer() {
    return this._createBuffer(0.3, (data) => {
      for (let i = 0; i < data.length; i++) {
        const t = i / this.ctx.sampleRate;
        data[i] = Math.sin(2 * Math.PI * 150 * t) * Math.exp(-t * 10) * 0.5 +
          (Math.random() * 2 - 1) * Math.exp(-t * 12) * 0.3;
      }
    });
  }

  _createDeathBuffer() {
    return this._createBuffer(1.0, (data) => {
      for (let i = 0; i < data.length; i++) {
        const t = i / this.ctx.sampleRate;
        const freq = 300 - t * 280;
        data[i] = Math.sin(2 * Math.PI * Math.max(freq, 20) * t) * Math.exp(-t * 3) * 0.4;
      }
    });
  }

  _createRainBuffer() {
    return this._createBuffer(2, (data) => {
      for (let i = 0; i < data.length; i++) {
        const t = i / this.ctx.sampleRate;
        data[i] = (Math.random() * 2 - 1) * Math.max(0, Math.sin(t * 200) * 0.5) * 0.4;
      }
    });
  }

  _createFireBuffer() {
    return this._createBuffer(1, (data) => {
      for (let i = 0; i < data.length; i++) {
        const t = i / this.ctx.sampleRate;
        data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 3) * 0.3 +
          Math.sin(2 * Math.PI * (100 + Math.random() * 50) * t) * 0.1;
      }
    });
  }

  _createTillBuffer() {
    return this._createBuffer(0.3, (data) => {
      for (let i = 0; i < data.length; i++) {
        const t = i / this.ctx.sampleRate;
        data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 20) * 0.5 +
          Math.sin(2 * Math.PI * 80 * t) * Math.exp(-t * 15) * 0.3;
      }
    });
  }

  _createWaterBuffer() {
    return this._createBuffer(0.5, (data) => {
      for (let i = 0; i < data.length; i++) {
        const t = i / this.ctx.sampleRate;
        data[i] = Math.sin(2 * Math.PI * (300 + t * 200) * t) * Math.exp(-t * 8) * 0.4;
      }
    });
  }

  _createAmbientBirdsBuffer() {
    return this._createBuffer(4, (data) => {
      for (let i = 0; i < data.length; i++) {
        const t = i / this.ctx.sampleRate;
        data[i] = 0;
        for (let b = 0; b < 3; b++) {
          const freq = 2000 + Math.random() * 3000;
          const phase = Math.random() * Math.PI * 2;
          const chirp = Math.max(0, Math.sin(t * 8 + phase)) * 0.5;
          data[i] += Math.sin(2 * Math.PI * freq * t) * chirp * 0.08;
        }
      }
    });
  }

  _createAmbientWindBuffer() {
    return this._createBuffer(4, (data) => {
      for (let i = 0; i < data.length; i++) {
        const t = i / this.ctx.sampleRate;
        const noise = (Math.random() * 2 - 1);
        const lfo = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.5 * t);
        data[i] = noise * lfo * 0.15;
      }
    });
  }

  _getOrCreateSFXSource() {
    let source = this.sfxPool.find(s => s.ended);
    if (!source) {
      source = this.ctx.createBufferSource();
      source.ended = true;
      this.sfxPool.push(source);
    }
    return source;
  }

  playSFX(name, volume = 1) {
    if (this.muted || !this.initialized) return;
    const buffer = this.buffers.get(name);
    if (!buffer) return;
    this.resume();
    try {
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      const gain = this.ctx.createGain();
      gain.gain.value = volume * this.sfxVolume * this.masterVolume;
      source.connect(gain);
      gain.connect(this.ctx.destination);
      source.start(0);
      source.onended = () => {
        source.disconnect();
        gain.disconnect();
      };
    } catch (e) {}
  }

  playMusic(buffer, loop = true) {
    if (!this.initialized) return;
    this.stopMusic();
    this.resume();
    try {
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = loop;
      const gain = this.ctx.createGain();
      gain.gain.value = this.musicVolume * this.masterVolume;
      source.connect(gain);
      gain.connect(this.ctx.destination);
      source.start(0);
      this.currentMusic = { source, gain };
    } catch (e) {}
  }

  stopMusic(fadeOut = 0) {
    if (this.currentMusic) {
      if (fadeOut > 0) {
        const startTime = this.ctx.currentTime;
        const vol = this.currentMusic.gain.gain.value;
        this.currentMusic.gain.gain.setValueAtTime(vol, startTime);
        this.currentMusic.gain.gain.linearRampToValueAtTime(0, startTime + fadeOut);
        setTimeout(() => {
          try { this.currentMusic.source.stop(); } catch (e) {}
          this.currentMusic = null;
        }, fadeOut * 1000);
      } else {
        try { this.currentMusic.source.stop(); } catch (e) {}
        this.currentMusic = null;
      }
    }
  }

  startAmbient(name, volume = 0.3) {
    if (this.muted || !this.initialized) return;
    const buffer = this.buffers.get(name);
    if (!buffer) return;
    this.resume();
    try {
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const gain = this.ctx.createGain();
      gain.gain.value = volume * this.masterVolume;
      source.connect(gain);
      gain.connect(this.ctx.destination);
      source.start(0);
      this.ambientNodes.push({ source, gain, name });
    } catch (e) {}
  }

  stopAmbient(name) {
    const idx = this.ambientNodes.findIndex(a => a.name === name);
    if (idx !== -1) {
      try { this.ambientNodes[idx].source.stop(); } catch (e) {}
      this.ambientNodes.splice(idx, 1);
    }
  }

  stopAllAmbient() {
    for (const a of this.ambientNodes) {
      try { a.source.stop(); } catch (e) {}
    }
    this.ambientNodes = [];
  }

  setMasterVolume(v) {
    this.masterVolume = Math.max(0, Math.min(1, v));
    this._updateVolumes();
  }

  setMusicVolume(v) {
    this.musicVolume = Math.max(0, Math.min(1, v));
    this._updateVolumes();
  }

  setSFXVolume(v) {
    this.sfxVolume = Math.max(0, Math.min(1, v));
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      if (this.currentMusic) this.currentMusic.gain.gain.value = 0;
      for (const a of this.ambientNodes) a.gain.gain.value = 0;
    } else {
      this._updateVolumes();
    }
    return this.muted;
  }

  _updateVolumes() {
    if (this.currentMusic && !this.muted) {
      this.currentMusic.gain.gain.value = this.musicVolume * this.masterVolume;
    }
    for (const a of this.ambientNodes) {
      if (!this.muted) {
        a.gain.gain.value = 0.3 * this.masterVolume;
      }
    }
  }

  dispose() {
    this.stopMusic();
    this.stopAllAmbient();
    for (const s of this.sfxPool) {
      try { s.disconnect(); } catch (e) {}
    }
    this.sfxPool = [];
    this.buffers.clear();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}
