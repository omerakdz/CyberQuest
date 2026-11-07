export type MusicTrack = "home" | "race"

let ctx: AudioContext | null = null
let master: GainNode | null = null
let timer: number | null = null
let nextTime = 0
let step = 0
let wanted: MusicTrack | null = null
let playing: MusicTrack | null = null
let prefs = { music: false, sound: true }

const TRACKS = {
  // Calm, bright arpeggio for the menus.
  home: {
    step: 60 / 96 / 2,
    bass: [130.81, 130.81, 196, 196, 220, 220, 174.61, 174.61],
    lead: [523.25, 659.25, 783.99, 659.25, 880, 783.99, 659.25, 523.25],
  },
  // Fast, minor and tense for the race.
  race: {
    step: 60 / 150 / 2,
    bass: [55, 55, 82.41, 55, 65.41, 55, 87.31, 82.41],
    lead: [440, 523.25, 659.25, 523.25, 440, 622.25, 659.25, 783.99],
  },
}

function getCtx() {
  if (typeof window === "undefined") return null
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
    master = ctx.createGain()
    master.gain.value = 0.5
    master.connect(ctx.destination)
  }
  if (ctx.state === "suspended") void ctx.resume()
  return ctx
}

function tone(freq: number, start: number, dur: number, type: OscillatorType, vol: number, slideTo?: number, dest?: AudioNode) {
  const out = dest ?? master
  if (!ctx || !out) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + dur)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(vol, start + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur)
  osc.connect(gain).connect(out)
  osc.start(start)
  osc.stop(start + dur + 0.02)
}

function scheduleStep(track: MusicTrack, time: number, index: number, bus: AudioNode) {
  const t = TRACKS[track]
  const i = index % 8
  if (track === "home") {
    tone(t.bass[i], time, t.step * 1.8, "sine", 0.1, undefined, bus)
    tone(t.lead[i], time, t.step * 1.4, "triangle", 0.05, undefined, bus)
    return
  }
  tone(t.bass[i], time, t.step * 0.9, "sawtooth", 0.09, undefined, bus)
  if (i % 2 === 0) tone(60, time, 0.12, "sine", 0.22, undefined, bus)
  if (i % 2 === 1) tone(8000, time, 0.03, "square", 0.012, undefined, bus)
  if (Math.floor(index / 8) % 2 === 1) tone(t.lead[i], time, t.step * 0.6, "square", 0.03, undefined, bus)
}

let musicBus: GainNode | null = null

function halt() {
  if (timer !== null) window.clearInterval(timer)
  timer = null
  playing = null
  // Disconnecting the bus silences notes that were already scheduled.
  musicBus?.disconnect()
  musicBus = null
}

function apply() {
  const target = wanted === "home" && !prefs.music ? null : wanted
  if (target === playing) return
  halt()
  if (!target) return
  const audio = getCtx()
  if (!audio || !master) return
  const bus = audio.createGain()
  bus.connect(master)
  musicBus = bus
  playing = target
  nextTime = audio.currentTime + 0.05
  step = 0
  timer = window.setInterval(() => {
    if (!ctx || !playing) return
    while (nextTime < ctx.currentTime + 0.3) {
      scheduleStep(playing, nextTime, step, bus)
      nextTime += TRACKS[playing].step
      step += 1
    }
  }, 80)
}

export function unlockAudio() {
  getCtx()
}

export function setAudioPrefs(next: { music: boolean; sound: boolean }) {
  prefs = next
  apply()
}

export function setMusicTrack(track: MusicTrack | null) {
  wanted = track
  apply()
}

export function playCorrectSound() {
  if (!prefs.sound) return
  const audio = getCtx()
  if (!audio) return
  const t = audio.currentTime
  tone(659.25, t, 0.14, "triangle", 0.25)
  tone(880, t + 0.09, 0.14, "triangle", 0.25)
  tone(1318.5, t + 0.18, 0.3, "triangle", 0.25)
}

export function playErrorSound() {
  if (!prefs.sound) return
  const audio = getCtx()
  if (!audio) return
  const t = audio.currentTime
  tone(220, t, 0.18, "sawtooth", 0.18, 110)
  tone(165, t + 0.12, 0.26, "square", 0.14, 82)
}

export function playPopupSound() {
  if (!prefs.sound) return
  const audio = getCtx()
  if (!audio) return
  const t = audio.currentTime
  tone(987.77, t, 0.1, "sine", 0.15)
  tone(1318.5, t + 0.08, 0.18, "sine", 0.15)
}
