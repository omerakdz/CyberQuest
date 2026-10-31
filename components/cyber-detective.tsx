"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft, Search } from "lucide-react"
import { DetectiveGame } from "@/components/detective-game"
import {
  DETECTIVE_GAMES,
  DETECTIVE_IDS,
  completedLevels,
  emptyDetectiveProgress,
  loadDetectiveProgress,
  recordResult,
  saveDetectiveProgress,
  totalStars,
  type DetectiveGameId,
  type DetectiveProgress,
} from "@/lib/detective"
import { setMusicTrack } from "@/lib/race-audio"

export function CyberDetective({ onBack, onAward }: { onBack: () => void; onAward: (xp: number) => void }) {
  const [progress, setProgress] = useState<DetectiveProgress>(emptyDetectiveProgress)
  const [active, setActive] = useState<DetectiveGameId | null>(null)
  const progressRef = useRef(progress)
  progressRef.current = progress

  useEffect(() => {
    const loaded = loadDetectiveProgress()
    progressRef.current = loaded
    setProgress(loaded)
  }, [])

  useEffect(() => {
    setMusicTrack("home")
  }, [])

  const complete = (game: DetectiveGameId, level: number, stars: number) => {
    const next = recordResult(progressRef.current, game, level, stars)
    progressRef.current = next
    setProgress(next)
    saveDetectiveProgress(next)
    onAward(50 + 25 * stars)
  }

  if (active) {
    const meta = DETECTIVE_GAMES[active]
    return (
      <section className="detective-shell">
        <div className="detective-frame">
          <div className="detective-frame-title">{meta.icon} {meta.title} <span>{meta.accent}</span></div>
          <DetectiveGame gameId={active} getProgress={() => progressRef.current} onComplete={complete} onExit={() => setActive(null)} />
        </div>
      </section>
    )
  }

  return (
    <section className="detective-shell">
      <button className="corner-back" onClick={onBack}><ArrowLeft /> SELECT A GAME</button>
      <div className="practice-heading">
        <div className="season"><Search /> CASE FILES</div>
        <h2>CYBER <span>DETECTIVE</span></h2>
        <p>Onderzoek, analyseer en los digitale mysteries op. Kies je zaak, detective!</p>
      </div>
      <div className="detective-grid">
        {DETECTIVE_IDS.map((id) => {
          const meta = DETECTIVE_GAMES[id]
          const p = progress[id]
          const total = meta.levels.length
          const done = completedLevels(p)
          return (
            <article key={id} className={`detective-card ${id}`}>
              <div className="detective-art" aria-hidden="true"><span>{meta.icon}</span></div>
              <small>{meta.category}</small>
              <h3>{meta.title} <span>{meta.accent}</span></h3>
              <p>{meta.description}</p>
              <div className="detective-meta">
                <div className="difficulty" aria-label={`Moeilijkheid ${meta.difficulty} van 3`}>
                  {[1, 2, 3].map((n) => <i key={n} className={n <= meta.difficulty ? "on" : ""} />)}
                </div>
                <b>{done}/{total} VOLTOOID · ★ {totalStars(p)}/{total * 3}</b>
              </div>
              <div className="detective-bar"><i style={{ width: `${(done / total) * 100}%` }} /></div>
              <button className="arcade-button primary" onClick={() => setActive(id)}>{done > 0 ? "VERDER" : "SPEEL"} →</button>
            </article>
          )
        })}
      </div>
    </section>
  )
}
