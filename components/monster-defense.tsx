"use client"

import { useEffect, useReducer, useRef, useState } from "react"
import { ArrowLeft, Flame, Heart, Lightbulb, RotateCcw, Swords } from "lucide-react"
import { playCorrectSound, playErrorSound, playPopupSound, setMusicTrack } from "@/lib/race-audio"
import { tipForRound } from "@/lib/typing-tips"

type Monster = { id: number; word: string; x: number; lane: number; speed: number; emoji: string; boss: boolean }
type Fx = { id: number; x: number; lane: number; text: string; life: number; beam?: boolean }
type Phase = "ready" | "playing" | "intermission" | "over"
type Game = {
  phase: Phase
  monsters: Monster[]
  fx: Fx[]
  nextId: number
  wave: number
  toSpawn: number
  bossPending: boolean
  spawnCd: number
  lives: number
  score: number
  combo: number
  bestCombo: number
  killed: number
  chars: number
  playMs: number
  interCd: number
  lock: number | null
  shake: number
}
type GameEvent = { type: "hit" | "clear" | "wave" | "over"; wave?: number }
type PopupKind = "lead" | "streak" | "fast" | "broken"

const BASE_X = 12
const LANES = 5
const MAX_LIVES = 5
const EMOJIS = ["👾", "👻", "🧟", "🦇", "👹", "🕷️"]
const TIER_1 = ["kat", "zon", "vis", "boek", "maan", "hond", "boom", "huis", "vuur", "wolk", "ster", "bal", "ijs", "taart"]
const TIER_2 = ["pizza", "fiets", "appel", "school", "water", "regen", "draak", "robot", "vriend", "spelen", "tekenen", "muziek", "banaan"]
const TIER_3 = ["computer", "toetsenbord", "avontuur", "schildpad", "regenboog", "chocolade", "vakantie", "zwembad", "raketschip", "superheld"]
const BOSS_PHRASES = [
  "de draak spuwt vuur",
  "snel typen is een superkracht",
  "de ridder redt het kasteel",
  "oefening baart kunst",
  "ik ben de baas van het toetsenbord",
]

const isBossWave = (wave: number) => wave % 3 === 0

function newGame(): Game {
  return {
    phase: "ready", monsters: [], fx: [], nextId: 1, wave: 0, toSpawn: 0, bossPending: false, spawnCd: 0,
    lives: MAX_LIVES, score: 0, combo: 0, bestCombo: 0, killed: 0, chars: 0, playMs: 0, interCd: 0, lock: null, shake: 0,
  }
}

function startWave(g: Game) {
  g.wave += 1
  g.bossPending = isBossWave(g.wave)
  g.toSpawn = g.bossPending ? 3 + Math.floor(g.wave / 3) : Math.min(20, 4 + g.wave * 2)
  g.spawnCd = 0.6
}

function pickWord(g: Game) {
  const pool = g.wave <= 2 ? TIER_1 : g.wave <= 5 ? [...TIER_1, ...TIER_2] : [...TIER_2, ...TIER_3]
  // Avoid two monsters starting with the same letter so the first key always picks one target.
  const used = new Set(g.monsters.map((m) => m.word[0]))
  let word = pool[Math.floor(Math.random() * pool.length)]
  for (let i = 0; i < 12 && used.has(word[0]); i += 1) word = pool[Math.floor(Math.random() * pool.length)]
  return word
}

function spawn(g: Game) {
  const taken = new Set(g.monsters.filter((m) => m.x > 78).map((m) => m.lane))
  const free = Array.from({ length: LANES }, (_, i) => i).filter((l) => !taken.has(l))
  const lane = (free.length ? free : [0, 1, 2, 3, 4])[Math.floor(Math.random() * (free.length || LANES))]
  const speed = 5 + g.wave * 0.6
  if (g.toSpawn > 0) {
    g.toSpawn -= 1
    g.monsters.push({ id: g.nextId++, word: pickWord(g), x: 100, lane, speed, emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)], boss: false })
  } else if (g.bossPending) {
    g.bossPending = false
    g.monsters.push({ id: g.nextId++, word: BOSS_PHRASES[Math.floor(g.wave / 3 - 1) % BOSS_PHRASES.length], x: 100, lane: 2, speed: speed * 0.45, emoji: "🐲", boss: true })
  }
}

function tick(g: Game, dt: number): GameEvent[] {
  const events: GameEvent[] = []
  g.fx = g.fx.map((f) => ({ ...f, life: f.life - dt })).filter((f) => f.life > 0)
  g.shake = Math.max(0, g.shake - dt)

  if (g.phase === "intermission") {
    g.interCd -= dt
    if (g.interCd <= 0) {
      startWave(g)
      g.phase = "playing"
      events.push({ type: "wave", wave: g.wave })
    }
    return events
  }
  if (g.phase !== "playing") return events

  g.playMs += dt * 1000
  g.spawnCd -= dt
  if (g.spawnCd <= 0 && (g.toSpawn > 0 || g.bossPending)) {
    spawn(g)
    g.spawnCd = Math.max(0.9, 2.6 - g.wave * 0.2)
  }

  for (const m of g.monsters) m.x -= m.speed * dt
  const breached = g.monsters.filter((m) => m.x <= BASE_X)
  if (breached.length) {
    g.monsters = g.monsters.filter((m) => m.x > BASE_X)
    for (const m of breached) {
      g.lives -= m.boss ? 2 : 1
      if (g.lock === m.id) g.lock = null
      g.fx.push({ id: g.nextId++, x: BASE_X, lane: m.lane, text: "💢", life: 0.6 })
    }
    g.combo = 0
    g.shake = 0.4
    events.push({ type: "hit" })
  }

  if (g.lives <= 0) {
    g.lives = 0
    g.phase = "over"
    events.push({ type: "over" })
  } else if (g.toSpawn === 0 && !g.bossPending && g.monsters.length === 0) {
    g.phase = "intermission"
    g.interCd = 3.2
    g.score += g.wave * 50
    events.push({ type: "clear", wave: g.wave })
  }
  return events
}

type Props = { onBack: () => void; onRecord?: (wpm: number) => void }

export function MonsterDefense({ onBack, onRecord }: Props) {
  const G = useRef<Game>(newGame())
  const inputRef = useRef<HTMLInputElement>(null)
  const popupTimer = useRef<number | null>(null)
  const [typed, setTyped] = useState("")
  const [popup, setPopup] = useState<{ text: string; kind: PopupKind | "tip" } | null>(null)
  const [, force] = useReducer((n: number) => n + 1, 0)
  const g = G.current
  const active = g.phase === "playing" || g.phase === "intermission"

  const showPopup = (text: string, kind: PopupKind) => {
    setPopup({ text, kind })
    playPopupSound()
    if (popupTimer.current) window.clearTimeout(popupTimer.current)
    popupTimer.current = window.setTimeout(() => setPopup(null), 1800)
  }

  useEffect(() => {
    let last = performance.now()
    const id = window.setInterval(() => {
      const now = performance.now()
      const dt = Math.min(0.25, (now - last) / 1000)
      last = now
      const game = G.current
      const events = tick(game, dt)
      for (const event of events) {
        if (event.type === "hit") { playErrorSound(); setTyped(""); showPopup("AU! EEN MONSTER BREEKT DOOR", "broken") }
        if (event.type === "clear") showPopup(`WAVE ${event.wave} GEWONNEN!`, "lead")
        if (event.type === "wave") { showPopup(isBossWave(event.wave ?? 0) ? "EINDBAAS NADERT!" : `WAVE ${event.wave} BEGINT`, "fast"); setTyped("") }
        if (event.type === "over") {
          setTyped("")
          const minutes = Math.max(0.1, game.playMs / 60000)
          onRecord?.(Math.round(game.chars / 5 / minutes))
        }
      }
      force()
    }, 50)
    return () => { window.clearInterval(id); if (popupTimer.current) window.clearTimeout(popupTimer.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!active) return
    setMusicTrack("race")
    return () => setMusicTrack("home")
  }, [active])

  useEffect(() => {
    if (g.phase === "playing") inputRef.current?.focus()
  }, [g.phase, g.wave])

  const start = () => {
    const game = G.current
    Object.assign(game, newGame())
    startWave(game)
    game.phase = "playing"
    setTyped("")
    setPopup(null)
    force()
    window.setTimeout(() => inputRef.current?.focus(), 30)
  }

  const handleType = (raw: string) => {
    const game = G.current
    if (game.phase !== "playing") return
    const value = raw.toLowerCase()
    if (!value) { game.lock = null; setTyped(""); return }
    let target = game.lock !== null ? game.monsters.find((m) => m.id === game.lock) : undefined
    if (target && !target.word.startsWith(value)) {
      // Wrong key: ignore it and break the combo.
      playErrorSound()
      if (game.combo >= 3) showPopup("COMBO VERBROKEN!", "broken")
      game.combo = 0
      return
    }
    if (!target) {
      target = game.monsters.filter((m) => m.word.startsWith(value)).sort((a, b) => a.x - b.x)[0]
      if (!target) {
        playErrorSound()
        if (game.combo >= 3) showPopup("COMBO VERBROKEN!", "broken")
        game.combo = 0
        return
      }
      game.lock = target.id
    }
    setTyped(value)
    if (value !== target.word) return

    game.monsters = game.monsters.filter((m) => m.id !== target!.id)
    game.lock = null
    game.combo += 1
    game.bestCombo = Math.max(game.bestCombo, game.combo)
    game.killed += 1
    game.chars += target.word.length
    game.score += Math.round(target.word.length * 10 * (1 + Math.floor(game.combo / 5) * 0.5) * (target.boss ? 3 : 1))
    game.fx.push({ id: game.nextId++, x: BASE_X, lane: target.lane, text: "", life: 0.25, beam: true })
    game.fx.push({ id: game.nextId++, x: target.x, lane: target.lane, text: target.boss ? "🏆" : "💥", life: 0.6 })
    setTyped("")
    playCorrectSound()
    if (target.boss) showPopup("EINDBAAS VERSLAGEN!", "lead")
    else if ([3, 5, 8, 12].includes(game.combo)) showPopup(`COMBO x${game.combo}!`, "streak")
    force()
  }

  const wpm = Math.round(g.chars / 5 / Math.max(0.1, g.playMs / 60000))
  const lockedMonster = g.monsters.find((m) => m.id === g.lock)

  return (
    <main className="race-arena md-arena">
      <div className="race-arena-top">
        <button className="corner-back" onClick={onBack}><ArrowLeft /> EXIT</button>
        <div>
          <div className="season"><Swords /> TYPE BATTLE · MONSTER DEFENSE</div>
          <h2>WAVE <span>{String(Math.max(1, g.wave)).padStart(2, "0")}</span></h2>
        </div>
        <div className="md-hud">
          <span className="md-lives" aria-label={`${g.lives} levens`}>{Array.from({ length: MAX_LIVES }, (_, i) => <Heart key={i} className={i < g.lives ? "on" : ""} />)}</span>
          <b>{g.score.toLocaleString("nl-NL")}</b>
          {g.combo >= 2 && <em>COMBO x{g.combo}</em>}
        </div>
      </div>

      <div className="race-popup-slot">
        {popup ? <div key={popup.text} className={`race-popup ${popup.kind}`}><Flame /> {popup.text}</div> : g.phase === "intermission" ? <div className="race-popup tip"><Lightbulb /> TIP: {tipForRound(g.wave)}</div> : null}
      </div>

      <div className={`md-field${g.shake > 0 ? " shake" : ""}`}>
        <div className="md-base">🏰</div>
        {g.fx.map((f) => (
          f.beam
            ? <i key={f.id} className="md-beam" style={{ left: `${BASE_X}%`, top: `${10 + f.lane * 20}%`, width: `${Math.max(0, f.x - BASE_X)}%` }} />
            : <span key={f.id} className="md-fx" style={{ left: `${f.x}%`, top: `${10 + f.lane * 20}%` }}>{f.text}</span>
        ))}
        {g.monsters.map((m) => {
          const locked = m.id === g.lock
          return (
            <div key={m.id} className={`md-monster${m.boss ? " boss" : ""}${locked ? " locked" : ""}`} style={{ left: `${m.x}%`, top: `${10 + m.lane * 20}%` }}>
              <span className="md-word"><span className="md-typed">{locked ? m.word.slice(0, typed.length) : ""}</span>{locked ? m.word.slice(typed.length) : m.word}</span>
              <span className="md-emoji">{m.emoji}</span>
            </div>
          )
        })}
        {g.phase === "ready" && (
          <div className="md-overlay">
            <h3>VERDEDIG HET KASTEEL</h3>
            <p>Monsters lopen naar je kasteel. Typ het woord boven een monster om het te verslaan. Elke golf wordt moeilijker en na elke derde golf komt een eindbaas met een hele zin.</p>
            <button className="arcade-button primary" onClick={start}><Swords /> START</button>
          </div>
        )}
        {g.phase === "intermission" && (
          <div className="md-overlay light"><h3>WAVE {g.wave} GEWONNEN!</h3><p>Volgende golf over {Math.ceil(g.interCd)}...</p></div>
        )}
        {g.phase === "over" && (
          <div className="md-overlay">
            <h3>HET KASTEEL IS GEVALLEN</h3>
            <div className="md-stats">
              <div><b>{g.wave}</b><small>WAVE</small></div>
              <div><b>{g.score.toLocaleString("nl-NL")}</b><small>SCORE</small></div>
              <div><b>{g.killed}</b><small>MONSTERS</small></div>
              <div><b>{wpm}</b><small>WPM</small></div>
              <div><b>x{g.bestCombo}</b><small>BESTE COMBO</small></div>
            </div>
            <div className="md-actions">
              <button className="arcade-button primary" onClick={start}><RotateCcw /> OPNIEUW</button>
              <button className="arcade-button" onClick={onBack}>EXIT</button>
            </div>
          </div>
        )}
      </div>

      <div className="race-input-panel">
        <span>{lockedMonster ? `TYP: ${lockedMonster.word.toUpperCase()}` : "TYP EEN WOORD OM TE SCHIETEN"}</span>
        <input
          ref={inputRef}
          autoFocus
          value={typed}
          onChange={(event) => handleType(event.target.value)}
          onBlur={() => { if (G.current.phase === "playing") window.setTimeout(() => inputRef.current?.focus(), 0) }}
          disabled={g.phase === "ready" || g.phase === "over"}
          placeholder={g.phase === "playing" ? "Typ het woord boven een monster..." : "Wacht even..."}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </div>
    </main>
  )
}
