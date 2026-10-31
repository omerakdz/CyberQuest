"use client"

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react"
import { ArrowLeft, Check, Lock, Medal, RotateCcw, Trophy } from "lucide-react"
import { adventureLevels, emptyProgress, medalFor, medalRank, type AdventureProgress, type LevelResult, type Medal as MedalType } from "@/lib/typing-adventure"

type AdventureScreen = "map" | "level" | "result" | "final"
const STORAGE_KEY = "cyberquest-typing-adventure-v1"
const medalLabel: Record<MedalType, string> = { gold: "GOLD", silver: "SILVER", bronze: "BRONZE" }

export function TypingAdventure({ onBack, onAward }: { onBack: () => void; onAward: (xp: number) => void }) {
  const [view, setView] = useState<AdventureScreen>("map")
  const [progress, setProgress] = useState<AdventureProgress>(emptyProgress)
  const initialProgress = useRef(progress)
  const [selected, setSelected] = useState(1)
  const [typed, setTyped] = useState("")
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [done, setDone] = useState(false)
  const startRef = useRef<number | null>(null)
  const [lastResult, setLastResult] = useState<LevelResult | null>(null)
  const [newBest, setNewBest] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const loaded = useRef(false)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as AdventureProgress
        if (parsed && typeof parsed.unlocked === "number" && parsed.results) setProgress(parsed)
      }
    } catch { setProgress(emptyProgress()) }
    loaded.current = true
  }, [])
  // Skip the initial save so the empty default never overwrites stored progress.
  useEffect(() => { if (loaded.current && progress !== initialProgress.current) localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)) }, [progress])
  useEffect(() => {
    if (!startedAt || view !== "level" || done) return
    const timer = window.setInterval(() => setElapsed((Date.now() - startedAt) / 1000), 100)
    return () => window.clearInterval(timer)
  }, [startedAt, view, done])

  const completed = Object.keys(progress.results).length
  const totals = useMemo(() => Object.values(progress.results).reduce((acc, result) => { acc[result.medal] += 1; return acc }, { gold: 0, silver: 0, bronze: 0 } as Record<MedalType, number>), [progress])
  const current = adventureLevels[selected - 1]

  function beginLevel(id: number) {
    if (id < 1 || id > 100) return
    setSelected(id); setTyped(""); setElapsed(0); setStartedAt(null); setLastResult(null); setDone(false); startRef.current = null; setView("level")
    window.setTimeout(() => inputRef.current?.focus(), 50)
  }
  function handleType(value: string) {
    if (done) return
    if (!startRef.current && value.length) { startRef.current = Date.now(); setStartedAt(startRef.current) }
    setTyped(value)
    if (value !== current.sentence) return
    const time = startRef.current ? (Date.now() - startRef.current) / 1000 : 0
    const correct = value.split("").filter((char, index) => char === current.sentence[index]).length
    const accuracy = Math.round((correct / current.sentence.length) * 100)
    const medal = medalFor(current, time, accuracy)
    if (!medal) { setTyped(""); setStartedAt(null); startRef.current = null; setElapsed(0); return }
    const previous = progress.results[String(current.id)]
    const improved = !previous || medalRank[medal] > medalRank[previous.medal] || time < previous.time
    const result = improved ? { time, accuracy, medal } : previous
    setLastResult({ time, accuracy, medal }); setNewBest(improved)
    setElapsed(time); setDone(true)
    setProgress((old) => ({ ...old, unlocked: Math.max(old.unlocked, Math.min(100, current.id + 1)), results: { ...old.results, [String(current.id)]: result } }))
    onAward(medal === "gold" ? 100 : medal === "silver" ? 70 : 45)
  }
  const areaProgress = (area: string) => adventureLevels.filter((level) => level.area === area && progress.results[String(level.id)]).length

  if (view === "level") return <section className="adventure-level"><button className="corner-back" onClick={() => setView("map")}><ArrowLeft /> MAP</button><div className="adventure-level-top"><span>{current.area}</span><b>LEVEL {String(current.id).padStart(2, "0")} / 100</b><strong>{elapsed.toFixed(1)}s</strong></div><div className="adventure-challenge"><div className="adventure-kicker">TYPING ADVENTURE · {current.area}</div><h2>TYPE THE <span>MESSAGE</span></h2><div className="sentence"><span className="sentence-correct">{current.sentence.slice(0, typed.length)}</span><span className={typed.length && typed !== current.sentence.slice(0, typed.length) ? "sentence-wrong" : ""}>{current.sentence.slice(typed.length)}</span></div><div className="adventure-progress"><i style={{ width: `${Math.min(100, typed.length / current.sentence.length * 100)}%` }} /></div><input ref={inputRef} autoFocus value={typed} onChange={(event) => handleType(event.target.value)} placeholder="Start typing to begin the timer..." disabled={done} aria-label="Type the level sentence"/><small>{typed.length} / {current.sentence.length} CHARACTERS · MINIMUM ACCURACY 80%</small>{done && lastResult && <div className="level-complete"><div className="adventure-kicker">LEVEL {String(current.id).padStart(2, "0")} COMPLETE · {lastResult.time.toFixed(1)}s · {lastResult.accuracy}%</div><div className="adventure-actions"><button className="arcade-button primary" onClick={() => beginLevel(current.id)}><RotateCcw /> OPNIEUW</button><button className="arcade-button" onClick={() => setView("map")}>MAP</button><button className="arcade-button" onClick={() => beginLevel(current.id + 1)} disabled={current.id >= 100}>VOLGENDE LEVEL <Check /></button></div></div>}</div></section>

  if (view === "result" && lastResult) return <section className="adventure-result"><div className={`result-medal ${lastResult.medal}`}><Medal /></div><div className="adventure-kicker">LEVEL {String(selected).padStart(2, "0")} COMPLETE</div><h2>MISSION <span>CLEARED</span></h2><p className="result-copy">{newBest ? "Nieuwe persoonlijke best! Je voortgang is opgeslagen." : "Goed gedaan. Je beste resultaat blijft bewaard."}</p><div className="result-stats"><div><b>{lastResult.time.toFixed(1)}s</b><small>TIME</small></div><div><b>{lastResult.accuracy}%</b><small>ACCURACY</small></div><div><b>{medalLabel[lastResult.medal]}</b><small>MEDAL</small></div></div><div className="adventure-actions"><button className="arcade-button primary" onClick={() => beginLevel(selected)}><RotateCcw /> REPLAY</button><button className="arcade-button" onClick={() => setView("map")}>WORLD MAP</button><button className="arcade-button" onClick={() => beginLevel(Math.min(100, selected + 1))} disabled={selected >= 100}>NEXT LEVEL <Check /></button></div></section>

  if (view === "final") return <section className="adventure-result final-result"><div className="result-medal gold"><Trophy /></div><div className="adventure-kicker">DIGITAL KINGDOM · LEVEL 100</div><h2>ADVENTURE <span>COMPLETE</span></h2><p className="result-copy">Je hebt alle 100 typing levels veroverd. CyberQuest heeft een nieuwe kampioen.</p><div className="result-stats"><div><b>{totals.gold}</b><small>GOLD</small></div><div><b>{totals.silver}</b><small>SILVER</small></div><div><b>{totals.bronze}</b><small>BRONZE</small></div></div><button className="arcade-button primary" onClick={() => setView("map")}>RETURN TO MAP</button></section>

  return <section className="adventure-map"><div className="adventure-map-head"><button className="corner-back" onClick={onBack}><ArrowLeft /> MODES</button><div><div className="adventure-kicker">TYPE BATTLE · SINGLE PLAYER</div><h2>TYPING <span>ADVENTURE</span></h2><p>Kies zelf een level op de map, of ga verder bij level {Math.min(100, progress.unlocked)}.</p></div><div className="adventure-stats"><b>{completed}<small>/ 100 LEVELS</small></b><b>{totals.gold}<small>GOLD</small></b><b>{totals.silver}<small>SILVER</small></b><b>{totals.bronze}<small>BRONZE</small></b></div></div><div className="world-map" aria-label="Typing Adventure world map"><div className="map-path" />{adventureLevels.map((level) => { const unlocked = true; const result = progress.results[String(level.id)]; return <button key={level.id} className={`map-node ${unlocked ? "unlocked" : "locked"} ${level.id === progress.unlocked ? "current" : ""} ${result ? "completed" : ""}`} style={{ "--x": `${8 + ((level.id - 1) % 10) * 9}%`, "--y": `${Math.floor((level.id - 1) / 10) * 9 + 7}%` } as CSSProperties} onClick={() => beginLevel(level.id)} disabled={!unlocked}><span>{result ? medalLabel[result.medal][0] : unlocked ? level.id : <Lock />}</span><small>{result ? medalLabel[result.medal] : `LEVEL ${level.id}`}</small></button>})}<div className="map-areas">{["Green Valley", "Crystal Caves", "Cyber City", "Neon Desert", "Digital Kingdom"].map((area) => <div key={area}><b>{area}</b><span>{areaProgress(area)} / 20 complete</span></div>)}</div></div></section>
}
