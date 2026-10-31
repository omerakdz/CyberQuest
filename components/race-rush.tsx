"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { tipForRound } from "@/lib/typing-tips"
import { ArrowLeft, Check, Crown, Flame, Keyboard, Lightbulb, Sparkles, Trophy, Zap } from "lucide-react"
import { RaceRushRooms } from "@/components/race-rush-rooms"
import { RACE_WORDS } from "@/lib/race-rooms"
import { playCorrectSound, playErrorSound, playPopupSound, setMusicTrack } from "@/lib/race-audio"

type Racer = { name: string; score: number; streak: number; color: string; isYou?: boolean; correct: number; response: number }
const BOT_NAMES = ["Sara", "Adam", "Lina"]
const scoreForPlace = (place: number) => [100, 80, 60, 40][place] ?? 20

type RaceRushProps = { onBack: () => void; playerName?: string; onRecord?: (wpm: number) => void }

export function RaceRush({ onBack, playerName = "Nova", onRecord }: RaceRushProps) {
  const [solo, setSolo] = useState(false)
  if (solo) return <LocalRaceRush onBack={() => setSolo(false)} playerName={playerName} onRecord={onRecord} />
  return <RaceRushRooms playerName={playerName} onBack={onBack} onSolo={() => setSolo(true)} />
}

function LocalRaceRush({ onBack, playerName = "Nova", onRecord }: RaceRushProps) {
  const [round, setRound] = useState(1)
  const [phase, setPhase] = useState<"countdown" | "ready" | "typing" | "results" | "finished">("countdown")
  const [countdown, setCountdown] = useState(3)
  const [typed, setTyped] = useState("")
  const [timeLeft, setTimeLeft] = useState(10)
  const [submitted, setSubmitted] = useState(false)
  const [notice, setNotice] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const [popup, setPopup] = useState<{ text: string; kind: "lead" | "streak" | "fast" | "broken" } | null>(null)
  const [racers, setRacers] = useState<Racer[]>(() => [{ name: playerName, score: 0, streak: 0, color: "#30ddff", isYou: true, correct: 0, response: 0 }, ...BOT_NAMES.map((name, i) => ({ name, score: 0, streak: 0, color: ["#ffbd36", "#a875ff", "#ff668f"][i], correct: 0, response: 0 }))])
  const word = useMemo(() => RACE_WORDS[(round - 1) % RACE_WORDS.length], [round])
  const sorted = [...racers].sort((a, b) => b.score - a.score)

  useEffect(() => { if (phase !== "countdown") return; if (countdown <= 0) { setPhase("ready"); return } const t = window.setTimeout(() => setCountdown((v) => v - 1), 700); return () => window.clearTimeout(t) }, [phase, countdown])
  useEffect(() => { if (phase !== "ready") return; const t = window.setTimeout(() => setPhase("typing"), 550); return () => window.clearTimeout(t) }, [phase])
  useEffect(() => { if (phase !== "typing") return; if (timeLeft <= 0) { finishRound(); return } const t = window.setInterval(() => setTimeLeft((v) => v - 1), 1000); return () => window.clearInterval(t) }, [phase, timeLeft])
  useEffect(() => { if (phase !== "typing") return; const t = window.setTimeout(() => { setRacers((list) => list.map((r) => r.isYou ? r : Math.random() > .35 ? { ...r, score: r.score + scoreForPlace(Math.floor(Math.random() * 4)), streak: r.streak + 1, correct: r.correct + 1, response: r.response + 2 + Math.random() * 3 } : { ...r, streak: 0 })); }, 1600 + Math.random() * 2500); return () => window.clearTimeout(t) }, [phase, round])
  useEffect(() => { if (phase === "finished") return; setMusicTrack("race"); return () => setMusicTrack("home") }, [phase === "finished"])
  const prevRacers = useRef<{ leader: string; streaks: Record<string, number>; correct: Record<string, number>; fastRound: number }>({ leader: "", streaks: {}, correct: {}, fastRound: 0 })
  useEffect(() => {
    const prev = prevRacers.current
    const top = [...racers].sort((a, b) => b.score - a.score)[0]
    const leader = top && top.score > 0 ? top.name : ""
    let text = ""
    let kind: "lead" | "streak" | "fast" | "broken" = "lead"
    let fastRound = prev.fastRound
    const scorer = racers.find((r) => r.correct > (prev.correct[r.name] ?? 0))
    if (scorer && fastRound !== round) { fastRound = round; text = `${scorer.name.toUpperCase()} IS DE SNELSTE DEZE RONDE!`; kind = "fast" }
    const broken = racers.find((r) => r.streak === 0 && (prev.streaks[r.name] ?? 0) >= 3)
    if (broken) { text = `${broken.name.toUpperCase()} · COMBO VERBROKEN!`; kind = "broken" }
    if (leader && leader !== prev.leader) { text = `${leader.toUpperCase()} TAKES THE LEAD!`; kind = "lead" }
    for (const r of racers) if ((r.streak === 3 || r.streak === 5 || r.streak === 8) && prev.streaks[r.name] !== r.streak) { text = `${r.name.toUpperCase()} · COMBO x${r.streak}!`; kind = "streak" }
    prevRacers.current = { leader, streaks: Object.fromEntries(racers.map((r) => [r.name, r.streak])), correct: Object.fromEntries(racers.map((r) => [r.name, r.correct])), fastRound }
    if (!text) return
    setPopup({ text, kind }); playPopupSound()
    const t = window.setTimeout(() => setPopup(null), 1800)
    return () => window.clearTimeout(t)
  }, [racers])
  useEffect(() => { if (phase === "typing" && !submitted) inputRef.current?.focus() }, [phase, round, submitted])
  const beginRound = () => { setPhase("countdown"); setCountdown(3); setTimeLeft(10); setTyped(""); setSubmitted(false) }
  const finishRound = () => { if (phase !== "typing") return; setPhase("results"); setTimeLeft(0); window.setTimeout(() => { if (round >= 20) { setPhase("finished"); onRecord?.(Math.max(...racers.map((r) => r.correct * 8))) } else { setRound((v) => v + 1); beginRound() } }, 1300) }
  const submit = () => { if (submitted || phase !== "typing") return; if (typed.toLowerCase() !== word) { playErrorSound(); setNotice("WRONG INPUT · KEEP FOCUS"); window.setTimeout(() => setNotice(""), 700); return } const place = racers.filter((r) => r.correct > racers.find((x) => x.isYou)?.correct!).length; setSubmitted(true); playCorrectSound(); setNotice(place === 0 ? `${playerName.toUpperCase()} TAKES THE LEAD!` : `${playerName.toUpperCase()} SCORES +${scoreForPlace(place)}`); setRacers((list) => list.map((r) => r.isYou ? { ...r, score: r.score + scoreForPlace(place), streak: r.streak + 1, correct: r.correct + 1, response: r.response + (10 - timeLeft) } : r)); window.setTimeout(() => setNotice(""), 1100) }
  const reset = () => { setRound(1); setPhase("countdown"); setCountdown(3); setTimeLeft(10); setTyped(""); setSubmitted(false); setRacers([{ name: playerName, score: 0, streak: 0, color: "#30ddff", isYou: true, correct: 0, response: 0 }, ...BOT_NAMES.map((name, i) => ({ name, score: 0, streak: 0, color: ["#ffbd36", "#a875ff", "#ff668f"][i], correct: 0, response: 0 }))]) }
  if (phase === "finished") return <section className="race-arena race-finished"><button className="corner-back" onClick={onBack}><ArrowLeft /> TYPE BATTLE</button><div className="race-finish-heading"><div className="season"><Trophy /> RACE COMPLETE</div><h2>FINAL <span>LEADERBOARD</span></h2><p>{sorted[0]?.name} is the champion.</p></div><div className="final-leaderboard">{sorted.map((r, i) => <div className={r.isYou ? "final-row you" : "final-row"} key={r.name}><strong>0{i + 1}</strong><span style={{ color: r.color }}>{r.name}</span><b>{r.score}</b><small>{r.correct} correct · streak {r.streak}</small></div>)}</div><div className="race-finish-actions"><button className="arcade-button primary" onClick={reset}><Zap /> RACE AGAIN</button><button className="arcade-button" onClick={onBack}>EXIT ARENA</button></div></section>
  return <main className="race-arena"><div className="race-arena-top"><button className="corner-back" onClick={onBack}><ArrowLeft /> EXIT</button><div><div className="season"><Keyboard /> TYPE BATTLE · RACE RUSH</div><h2>ROUND <span>{String(round).padStart(2, "0")} / 20</span></h2></div><div className="race-status"><i /> LIVE</div></div><div className="race-grid"><section className="race-center"><div className="race-popup-slot">{popup ? <div key={popup.text} className={`race-popup ${popup.kind}`}><Flame /> {popup.text}</div> : notice ? <div className="race-popup notice"><Flame /> {notice}</div> : phase !== "typing" ? <div key={`tip-${round}`} className="race-popup tip"><Lightbulb /> TIP: {tipForRound(round)}</div> : null}</div><div className={`reveal-stage ${phase}`}><div className="round-state">{phase === "countdown" ? countdown : phase === "ready" ? "READY" : phase === "typing" ? "TYPE NOW" : "ROUND OVER"}</div>{phase === "typing" || phase === "results" ? <div className="race-word">{word}</div> : <div className="race-hidden-word">???</div>}<div className="race-timer">{phase === "typing" ? `${timeLeft}s` : phase === "results" ? "SCORED" : "10s ROUND"}</div></div><div className="race-input-panel"><span>TYPE THE WORD</span><input ref={inputRef} autoFocus value={typed} onChange={(e) => setTyped(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") submit() }} disabled={phase !== "typing" || submitted} placeholder={phase === "typing" ? "Type the revealed word..." : "Get ready..."} /><button className="arcade-button primary" disabled={phase !== "typing" || submitted} onClick={submit}>SUBMIT <span>ENTER</span></button></div><div className="race-rules"><span><Zap /> FASTEST CORRECT WINS</span><span><ClockIcon /> 10 SECOND ROUND</span><span><Sparkles /> SAME WORD FOR EVERYONE</span></div></section><aside className="race-leaderboard"><div className="leaderboard-heading"><div><span>LIVE RANKING</span><h3>LEADERBOARD</h3></div><Trophy /></div>{sorted.map((r, i) => <div className={r.isYou ? "leader-row you" : "leader-row"} key={r.name}><strong>{i + 1}</strong><span className="leader-avatar" style={{ background: r.color }}>{r.name[0]}</span><div><b>{r.name}{r.isYou && <small> YOU</small>}</b><span>{r.streak >= 3 ? `COMBO x${r.streak}` : "READY"}</span></div><em>{r.score.toLocaleString()}</em>{i === 0 && <Crown className="leader-crown" />}</div>)}</aside></div></main>
}
function ClockIcon() { return <span className="clock-icon">◷</span> }
