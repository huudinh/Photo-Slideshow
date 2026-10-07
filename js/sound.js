/**
 * Tạo âm thanh thư giãn bằng Web Audio API.
 *
 * Mưa, sóng biển, lửa sưởi, chuông gió, chim hót và Lofi piano đều được tổng
 * hợp ngay trong trình duyệt: chạy 100% ngoại tuyến, không tốn băng thông, hợp
 * với iPad cũ phát liên tục cả ngày.
 */

class AmbientSoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.currentTrack = 'off';
    /** Chứa cả AudioNode lẫn id của setInterval để dọn trong một vòng. */
    this.activeNodes = [];
    this.lofiInterval = null;
  }

  initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
      }
    }
    // Safari treo AudioContext tới khi có thao tác người dùng.
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  setVolume(volume) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(
        Math.max(0, Math.min(1, volume)),
        this.ctx.currentTime,
        0.1
      );
    }
  }

  stop() {
    if (this.lofiInterval) {
      clearInterval(this.lofiInterval);
      this.lofiInterval = null;
    }

    this.activeNodes.forEach((item) => {
      if (typeof item === 'number') {
        clearInterval(item);
      } else {
        try {
          if (typeof item.stop === 'function') item.stop();
          item.disconnect();
        } catch (e) {
          /* node đã dừng sẵn */
        }
      }
    });
    this.activeNodes = [];
    this.currentTrack = 'off';
  }

  play(track, volume = 0.5) {
    this.stop();
    if (track === 'off') return;

    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.setVolume(volume);
    this.currentTrack = track;

    switch (track) {
      case 'rain':
        this.playRain();
        break;
      case 'ocean':
        this.playOcean();
        break;
      case 'fireplace':
        this.playFireplace();
        break;
      case 'windchime':
        this.playWindChime();
        break;
      case 'birds':
        this.playBirds();
        break;
      case 'lofi-piano':
        this.playLofiPiano();
        break;
    }
  }

  /** 1. Mưa rơi tí tách — nhiễu hồng qua bộ lọc thông thấp. */
  playRain() {
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0,
      b1 = 0,
      b2 = 0,
      b3 = 0,
      b4 = 0,
      b5 = 0,
      b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.08;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);

    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(0.6, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(this.masterGain);

    whiteNoise.start();
    this.activeNodes.push(whiteNoise, filter, rainGain);
  }

  /** 2. Sóng biển — nhiễu lọc thấp, điều biến bằng LFO 0,12 Hz (~8 giây/con sóng). */
  playOcean() {
    const bufferSize = this.ctx.sampleRate * 3;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.15;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);

    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(300, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const waveGain = this.ctx.createGain();
    waveGain.gain.setValueAtTime(0.8, this.ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(this.masterGain);

    noiseSource.start();
    lfo.start();
    this.activeNodes.push(noiseSource, lfo, lfoGain, filter, waveGain);
  }

  /** 3. Lửa sưởi — nền trầm cộng tiếng nổ lách tách ngẫu nhiên. */
  playFireplace() {
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.08;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(this.masterGain);
    noise.start();
    this.activeNodes.push(noise, filter);

    const interval = window.setInterval(() => {
      if (!this.ctx || !this.masterGain || this.currentTrack !== 'fireplace') return;
      if (Math.random() > 0.4) {
        const osc = this.ctx.createOscillator();
        const popGain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800 + Math.random() * 1500, this.ctx.currentTime);
        popGain.gain.setValueAtTime(0.08 + Math.random() * 0.15, this.ctx.currentTime);
        popGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
        osc.connect(popGain);
        popGain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
      }
    }, 180);

    this.activeNodes.push(interval);
  }

  /** 4. Chuông gió — thang ngũ cung, điểm từng tiếng ngẫu nhiên. */
  playWindChime() {
    const pentatonic = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51];

    const interval = window.setInterval(() => {
      if (!this.ctx || !this.masterGain || this.currentTrack !== 'windchime') return;
      if (Math.random() > 0.3) {
        const freq = pentatonic[Math.floor(Math.random() * pentatonic.length)];
        const osc = this.ctx.createOscillator();
        const chimeGain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        chimeGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 3.0);

        osc.connect(chimeGain);
        chimeGain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 3.1);
      }
    }, 1200);

    this.activeNodes.push(interval);
  }

  /** 5. Chim hót sớm mai — tiếng ríu rít ngắn, tần số lên xuống. */
  playBirds() {
    const interval = window.setInterval(() => {
      if (!this.ctx || !this.masterGain || this.currentTrack !== 'birds') return;
      if (Math.random() > 0.4) {
        const baseFreq = 2200 + Math.random() * 1200;
        const osc = this.ctx.createOscillator();
        const chirpGain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.linearRampToValueAtTime(baseFreq + 600, now + 0.08);
        osc.frequency.linearRampToValueAtTime(baseFreq + 200, now + 0.16);

        chirpGain.gain.setValueAtTime(0.08, now);
        chirpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(chirpGain);
        chirpGain.connect(this.masterGain);

        osc.start();
        osc.stop(now + 0.25);
      }
    }, 1600);

    this.activeNodes.push(interval);
  }

  /** 6. Lofi piano — vòng hợp âm Cmaj7 · Am7 · Fmaj7 · G7, rải nốt nhẹ. */
  playLofiPiano() {
    const chords = [
      [261.63, 329.63, 392.0, 493.88],
      [220.0, 261.63, 329.63, 392.0],
      [174.61, 220.0, 261.63, 329.63],
      [196.0, 246.94, 293.66, 349.23],
    ];
    let chordIdx = 0;

    const playChord = () => {
      if (!this.ctx || !this.masterGain || this.currentTrack !== 'lofi-piano') return;
      const currentChord = chords[chordIdx];
      chordIdx = (chordIdx + 1) % chords.length;

      currentChord.forEach((note, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime + i * 0.06;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note, now);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 4.0);
      });
    };

    playChord();
    this.lofiInterval = window.setInterval(playChord, 4200);
    this.activeNodes.push(this.lofiInterval);
  }

  getCurrentTrack() {
    return this.currentTrack;
  }
}

export const soundEngine = new AmbientSoundEngine();
