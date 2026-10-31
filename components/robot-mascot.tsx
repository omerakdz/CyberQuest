"use client"

import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react"
import { X } from "lucide-react"

type MascotContext = "home" | "select" | "race" | "practice-word" | "practice-sentence" | "adventure" | "future"
type Expression = "normal" | "happy" | "excited" | "surprised" | "confused" | "sleepy" | "wink" | "silly"

const messages: Record<MascotContext, string[]> = {
  home: ["Klik op mij!", "Ben je klaar om te spelen?", "Welke game gaan we spelen?", "Ik ben er klaar voor!", "Komaan, tijd om te gamen!"],
  select: ["Kies je missie!", "Psst... ik heb een geheimpje!", "Welke digitale wereld ontdek jij?"],
  race: ["Blijf rustig tijdens de countdown!", "Snelheid is belangrijk, maar typ ook correct!", "Je staat bijna bovenaan het leaderboard!", "Wacht tot het woord verschijnt!"],
  "practice-word": ["Probeer eerst nauwkeurig te typen!", "Oefening baart kunst!", "Je snelheid komt vanzelf!"],
  "practice-sentence": ["Vergeet de leestekens niet!", "Let ook op hoofdletters.", "Houd een gelijkmatig tempo aan."],
  adventure: ["Probeer deze keer goud te halen!", "Neem je tijd en let op je nauwkeurigheid.", "Je bent bijna bij het volgende gebied!"],
  future: ["Onderzoek altijd je bronnen!", "Denk slim, klik veilig!"],
}
const clickLines = ["Haha! Dat was leuk!", "Nog eens!", "Hey! Wat doe je?", "Ik ben wakker!", "Wooohooo!", "Dat voelde ik!"]
const expressions: Expression[] = ["happy", "excited", "surprised", "confused", "sleepy", "wink", "silly"]

export function RobotMascot({ context = "home", compact = false, gameActive = false, allowTips = true, className = "" }: { context?: MascotContext; compact?: boolean; gameActive?: boolean; allowTips?: boolean; className?: string }) {
  const canShowTips = gameActive && allowTips
  const [expression, setExpression] = useState<Expression>("normal")
  const [speech, setSpeech] = useState<string | null>(!gameActive && context === "home" ? "READY?" : null)
  const [tipVisible, setTipVisible] = useState(!gameActive)
  const [dragging, setDragging] = useState(false)
  const [dragPosition, setDragPosition] = useState<{ left: number; top: number } | null>(null)
  const moved = useRef(false)
  const [near, setNear] = useState(false)
  const [reduced, setReduced] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const lastInteraction = useRef(0)
  const recent = useRef<string[]>([])
  const availableMessages = useMemo(() => messages[context], [context])

  useEffect(() => { setSpeech(null); setExpression("normal"); setTipVisible(!gameActive); setDragging(false); setDragPosition(null); recent.current = [] }, [context, gameActive, allowTips])
  useEffect(() => { if (gameActive && !allowTips) { setSpeech(null); setTipVisible(false) } }, [gameActive, allowTips])
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(query.matches)
    update(); query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])
  useEffect(() => {
    if (reduced) return
    const timer = window.setInterval(() => {
      setExpression((current) => current === "normal" ? expressions[Math.floor(Math.random() * expressions.length)] : "normal")
    }, 4200 + Math.random() * 3600)
    return () => window.clearInterval(timer)
  }, [reduced])
  useEffect(() => {
    if (reduced || dragging || (gameActive && !allowTips)) return
    const delay = gameActive ? 18000 + Math.random() * 12000 : 5200 + Math.random() * 5200
    const timer = window.setTimeout(() => showMessage(), delay)
    return () => window.clearTimeout(timer)
  }, [context, reduced, dragging, speech, gameActive, allowTips])

  function showMessage(line?: string) {
    const pool = line ? [line] : availableMessages.filter((item) => !recent.current.includes(item))
    if (!pool.length) { recent.current = []; return }
    const next = pool[Math.floor(Math.random() * pool.length)]
    recent.current = [...recent.current.slice(-2), next]
    setSpeech(next)
    setTipVisible(true)
    window.setTimeout(() => {
      setSpeech((current) => current === next ? null : current)
      if (gameActive) setTipVisible(false)
    }, gameActive ? 3200 : 3600)
  }
  function interact() {
    if (gameActive || moved.current) { moved.current = false; return }
    const now = Date.now()
    if (now - lastInteraction.current < 850) return
    lastInteraction.current = now
    const next = expressions[Math.floor(Math.random() * expressions.length)]
    setExpression(next)
    showMessage(clickLines[Math.floor(Math.random() * clickLines.length)])
    window.setTimeout(() => setExpression("normal"), 1500)
  }
  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (gameActive || compact || (event.pointerType !== "touch" && event.button !== 0)) return
    const rect = event.currentTarget.getBoundingClientRect()
    dragOffset.current = { x: event.clientX - rect.left, y: event.clientY - rect.top }
    moved.current = false
    setDragPosition({ left: rect.left, top: rect.top })
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(true)
    setNear(false)
  }
  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragging || gameActive || compact) {
      if (!dragging && !gameActive) setNear(Math.hypot(event.clientX - (window.innerWidth * .82), event.clientY - (window.innerHeight * .28)) < 180)
      return
    }
    const rect = event.currentTarget.getBoundingClientRect()
    const left = Math.max(0, Math.min(window.innerWidth - rect.width, event.clientX - dragOffset.current.x))
    const top = Math.max(0, Math.min(window.innerHeight - rect.height, event.clientY - dragOffset.current.y))
    moved.current = true
    setDragPosition({ left, top })
  }
  function onPointerUp(event?: PointerEvent<HTMLDivElement>) {
    if (event && event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    if (!dragging) return
    setDragging(false)
    setExpression("happy")
    window.setTimeout(() => setExpression("normal"), 800)
  }
  const positionStyle = dragPosition ? { left: `${dragPosition.left}px`, top: `${dragPosition.top}px`, transform: "none" } : undefined
  return <div className={`robot-mascot ${compact ? "compact" : ""} ${gameActive ? "game-active" : ""} ${gameActive && tipVisible ? "tip-visible" : ""} ${dragging ? "dragging" : ""} ${near ? "near" : ""} ${className}`} style={positionStyle} onPointerMove={onPointerMove} onPointerCancel={onPointerUp} onPointerLeave={() => setNear(false)} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onClick={interact} role="button" tabIndex={gameActive ? -1 : 0} aria-hidden={gameActive && !tipVisible} aria-label="Interactieve CyberQuest robot" onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") interact() }}>
    {speech && <div className="robot-speech">{speech}<button aria-label="Dismiss tip" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); setSpeech(null) }}><X /></button></div>}
    <div className={`robot-body expression-${expression}`}><span className="robot-antenna"/><div className="robot-eye robot-eye-left"/><div className="robot-eye robot-eye-right"/><div className="robot-mouth"/><span className="robot-key">K</span></div>
    <div className="robot-shadow" />
  </div>
}
