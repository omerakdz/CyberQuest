"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, Check, Clock3, Keyboard, RotateCcw, Sparkles, Target, TimerReset } from "lucide-react"

type PracticeKind = "word" | "sentence"
type Difficulty = "easy" | "normal" | "hard"
type Duration = 1 | 3 | 5

const WORDS = {
  easy: ["zon", "maan", "fiets", "school", "vriend", "water", "computer", "glimlach"],
  normal: ["toetsenbord", "snelheid", "concentratie", "avontuur", "precisie", "kampioen", "verbinding", "verrassing"],
  hard: ["verantwoordelijkheid", "samenwerking", "nieuwsgierigheid", "onafhankelijkheid", "doorzettingsvermogen", "informatievaardigheden"],
}
const SENTENCES = {
  easy: ["Ik leer elke dag iets nieuws.", "De zon schijnt boven de school.", "Mijn team helpt elkaar altijd."],
  normal: ["Een slimme klik maakt online leren leuker.", "Rustig typen helpt mij om fouten te voorkomen.", "Samen bouwen we aan een veilige digitale wereld."],
  hard: ["Digitale vaardigheden geven mij vertrouwen in elke nieuwe uitdaging.", "Met aandacht en oefening wordt een moeilijk toetsenbordspel steeds gemakkelijker."],
}

export function PracticeArena({ onBack, onRecord }: { onBack: () => void; onRecord?: (wpm: number) => void }) {
  const [kind, setKind] = useState<PracticeKind | null>(null)
  const [difficulty, setDifficulty] = useState<Difficulty>("normal")
  const [duration, setDuration] = useState<Duration>(1)
  const [running, setRunning] = useState(false)
  const [index, setIndex] = useState(0)
  const [typed, setTyped] = useState("")
  const [seconds, setSeconds] = useState(duration * 60)
  const [correct, setCorrect] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [finished, setFinished] = useState(false)
  const items = useMemo(() => kind === "word" ? WORDS[difficulty] : SENTENCES[difficulty], [kind, difficulty])
  const current = items[index % items.length]

  useEffect(() => { if (!running) return; const timer = window.setInterval(() => setSeconds((v) => { if (v <= 1) { setRunning(false); setFinished(true); return 0 } return v - 1 }), 1000); return () => window.clearInterval(timer) }, [running])
  useEffect(() => { if (kind && !running && !finished) setSeconds(duration * 60) }, [duration, kind, finished, running])
  const wpm = startedAt ? Math.round((correct * (kind === "word" ? 1 : 2)) / Math.max(1 / 60, (Date.now() - startedAt) / 60000)) : 0
  const accuracy = correct + mistakes ? Math.round((correct / (correct + mistakes)) * 100) : 100
  const start = () => { setRunning(true); setFinished(false); setStartedAt(Date.now()); setSeconds(duration * 60); setTyped("") }
  const reset = () => { setRunning(false); setFinished(false); setIndex(0); setTyped(""); setCorrect(0); setMistakes(0); setStartedAt(null); setSeconds(duration * 60) }
  const handleChange = (value: string) => { if (!running) return; setTyped(value); if (kind === "word" && value === current) { setCorrect((v) => v + 1); setIndex((v) => v + 1); setTyped("") } if (kind === "sentence" && value === current) { setCorrect((v) => v + 1); setIndex((v) => v + 1); setTyped("") } }
  const choose = (next: PracticeKind) => { setKind(next); reset() }

  if (!kind) return <section className="practice-shell"><button className="corner-back" onClick={onBack}><ArrowLeft /> TYPE BATTLE</button><div className="practice-heading"><div className="season"><Keyboard /> PERSONAL TRAINING</div><h2>CHOOSE YOUR <span>PRACTICE</span></h2><p>Train rustig. Groei op jouw tempo.</p></div><div className="practice-choice-grid"><button className="practice-choice word-choice" onClick={() => choose("word")}><div className="practice-choice-icon"><Target /></div><div><span>MODE 01</span><h3>WORD PRACTICE</h3><p>Practice individual words and improve your typing speed.</p></div><b>START TRAINING <span>→</span></b></button><button className="practice-choice sentence-choice" onClick={() => choose("sentence")}><div className="practice-choice-icon"><Sparkles /></div><div><span>MODE 02</span><h3>SENTENCE PRACTICE</h3><p>Improve your rhythm with complete Dutch sentences.</p></div><b>START TRAINING <span>→</span></b></button></div></section>

  if (finished) return <section className="practice-shell practice-results"><button className="corner-back" onClick={onBack}><ArrowLeft /> TYPE BATTLE</button><div className="practice-heading"><div className="season"><Sparkles /> SESSION COMPLETE</div><h2>TRAINING <span>RESULTS</span></h2></div><div className="practice-result-card"><div className="result-score"><strong>{wpm}</strong><span>WPM</span></div><div className="practice-result-stats"><div><b>{accuracy}%</b><small>ACCURACY</small></div><div><b>{correct}</b><small>{kind === "word" ? "WORDS" : "SENTENCES"}</small></div><div><b>{mistakes}</b><small>MISTAKES</small></div></div><p>Goed gewerkt. Elke oefening maakt je sterker.</p><div className="result-actions"><button className="arcade-button primary" onClick={() => { onRecord?.(wpm); reset() }}><RotateCcw /> AGAIN</button><button className="arcade-button" onClick={onBack}>EXIT</button></div></div></section>

  return <section className="practice-shell practice-session"><button className="corner-back" onClick={() => setKind(null)}><ArrowLeft /> TERUG</button><div className="practice-session-top"><div><div className="season">{kind === "word" ? "WORD PRACTICE" : "SENTENCE PRACTICE"} · {difficulty.toUpperCase()}</div><h2>FOCUS <span>ZONE</span></h2></div><div className="practice-timer"><Clock3 /><b>{String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}</b></div></div><div className="practice-controls"><div className="segmented"><span>DURATION</span>{([1, 3, 5] as Duration[]).map((v) => <button key={v} className={duration === v ? "active" : ""} onClick={() => setDuration(v)}>{v} MIN</button>)}</div><div className="segmented"><span>DIFFICULTY</span>{(["easy", "normal", "hard"] as Difficulty[]).map((v) => <button key={v} className={difficulty === v ? "active" : ""} onClick={() => { setDifficulty(v); reset() }}>{v.toUpperCase()}</button>)}</div></div><div className="practice-workspace"><div className="practice-prompt"><span>{kind === "word" ? "TYPE THE WORD" : "TYPE THE SENTENCE"}</span><div className={kind === "word" ? "practice-word" : "practice-sentence"}>{kind === "word" ? current : current.split("").map((char, i) => <span key={`${char}-${i}`} className={i < typed.length ? typed[i] === char ? "typed-correct" : "typed-wrong" : "typed-neutral"}>{char === " " ? " " : char}</span>)}</div><input autoFocus value={typed} onChange={(e) => handleChange(e.target.value)} onKeyDown={(e) => { if (e.key === "Backspace" && typed.length === 0) setMistakes((v) => v + 1) }} placeholder={running ? "Start typing..." : "Press start when you are ready"} disabled={!running} /></div><aside className="practice-stats"><div><TimerReset /><b>{Math.max(0, wpm)}</b><small>WPM</small></div><div><Check /><b>{accuracy}%</b><small>ACCURACY</small></div><div><span className="mistake-dot"/><b>{mistakes}</b><small>MISTAKES</small></div></aside></div><button className="arcade-button primary practice-start" onClick={running ? () => setRunning(false) : start}>{running ? "PAUZEER" : "START OEFENING"} <span>ENTER</span></button></section>
}
