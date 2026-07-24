export type MusicTheme = 'race' | 'academy' | 'typing'
export type SfxKind = 'correct' | 'wrong'

type ThemeConfig = {
  bpm: number
  /** Melody notes in Hz; null = rest */
  melody: (number | null)[]
  /** Bass pattern in Hz; null = rest */
  bass: (number | null)[]
  wave: OscillatorType
  bassWave: OscillatorType
  melodyGain: number
  bassGain: number
}

const THEMES: Record<MusicTheme, ThemeConfig> = {
  race: {
    bpm: 128,
    wave: 'triangle',
    bassWave: 'square',
    melodyGain: 0.045,
    bassGain: 0.028,
    // C major peppy loop
    melody: [
      523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, null,
      587.33, 659.25, 698.46, 783.99, 698.46, 659.25, 587.33, 523.25,
    ],
    bass: [
      130.81, null, 130.81, null, 146.83, null, 164.81, null,
      174.61, null, 164.81, null, 146.83, null, 130.81, null,
    ],
  },
  academy: {
    bpm: 92,
    wave: 'sine',
    bassWave: 'triangle',
    melodyGain: 0.05,
    bassGain: 0.022,
    // Soft pentatonic / lullaby feel
    melody: [
      392.0, 440.0, 523.25, 587.33, 523.25, 440.0, 392.0, null,
      349.23, 392.0, 440.0, 523.25, 440.0, 392.0, 349.23, 329.63,
    ],
    bass: [
      196.0, null, null, 220.0, null, null, 246.94, null,
      220.0, null, null, 196.0, null, null, 174.61, null,
    ],
  },
  typing: {
    bpm: 110,
    wave: 'triangle',
    bassWave: 'triangle',
    melodyGain: 0.042,
    bassGain: 0.02,
    // Bouncy playful loop
    melody: [
      440.0, 494.0, 523.25, 587.33, 523.25, 494.0, 440.0, null,
      392.0, 440.0, 494.0, 523.25, 494.0, 440.0, 392.0, 349.23,
    ],
    bass: [
      220.0, null, 246.94, null, 261.63, null, 246.94, null,
      220.0, null, 196.0, null, 220.0, null, 246.94, null,
    ],
  },
}

class MusicEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private timer: number | null = null
  private step = 0
  private theme: MusicTheme | null = null
  private muted = false

  private ensureContext() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new Ctx()
      this.master = this.ctx.createGain()
      this.master.gain.value = this.muted ? 0 : 0.9
      this.master.connect(this.ctx.destination)
    }
    return this.ctx
  }

  async unlock() {
    const ctx = this.ensureContext()
    if (ctx.state === 'suspended') {
      await ctx.resume()
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted
    if (this.master && this.ctx) {
      const now = this.ctx.currentTime
      this.master.gain.cancelScheduledValues(now)
      this.master.gain.linearRampToValueAtTime(muted ? 0 : 0.9, now + 0.08)
    }
  }

  isMuted() {
    return this.muted
  }

  async playTheme(theme: MusicTheme) {
    await this.unlock()
    if (this.theme === theme && this.timer != null) return
    this.stopLoop()
    this.theme = theme
    this.step = 0
    this.scheduleLoop()
  }

  stop() {
    this.stopLoop()
    this.theme = null
  }

  private stopLoop() {
    if (this.timer != null) {
      window.clearInterval(this.timer)
      this.timer = null
    }
  }

  private scheduleLoop() {
    if (!this.theme) return
    const config = THEMES[this.theme]
    const stepMs = (60_000 / config.bpm) / 2 // eighth notes

    const tick = () => {
      if (!this.ctx || !this.master || !this.theme) return
      const conf = THEMES[this.theme]
      const i = this.step % conf.melody.length
      const melody = conf.melody[i]
      const bass = conf.bass[i % conf.bass.length]
      if (melody != null) this.beep(melody, conf.wave, conf.melodyGain, 0.18)
      if (bass != null) this.beep(bass, conf.bassWave, conf.bassGain, 0.22)
      this.step += 1
    }

    tick()
    this.timer = window.setInterval(tick, stepMs)
  }

  private beep(freq: number, type: OscillatorType, gainValue: number, duration: number) {
    if (!this.ctx || !this.master) return
    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = type
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(gainValue, now + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
    osc.connect(gain)
    gain.connect(this.master)
    osc.start(now)
    osc.stop(now + duration + 0.02)
  }

  async playSfx(kind: SfxKind) {
    await this.unlock()
    if (!this.ctx || !this.master || this.muted) return
    if (kind === 'correct') {
      this.beep(523.25, 'triangle', 0.08, 0.12)
      window.setTimeout(() => this.beep(659.25, 'triangle', 0.08, 0.12), 90)
      window.setTimeout(() => this.beep(783.99, 'triangle', 0.09, 0.18), 180)
    } else {
      this.beep(220, 'sine', 0.06, 0.16)
      window.setTimeout(() => this.beep(196, 'sine', 0.05, 0.2), 120)
    }
  }
}

export const musicEngine = new MusicEngine()
