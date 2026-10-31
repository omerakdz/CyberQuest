"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft, FlaskConical } from "lucide-react"
import { LabGame } from "@/components/lab-game"
import { LAB_GAMES, LAB_IDS, emptyLabProgress, labCompleted, labStars, loadLabProgress, recordLabResult, saveLabProgress, type LabGameId, type LabProgress } from "@/lib/lab"
import { setMusicTrack } from "@/lib/race-audio"

export function AiLab({ onBack, onAward }: { onBack: () => void; onAward: (xp: number) => void }) {
  const [progress, setProgress] = useState<LabProgress>(emptyLabProgress)
  const [active, setActive] = useState<LabGameId | null>(null)
  const progressRef = useRef(progress)
  progressRef.current = progress

  useEffect(() => {
    const loaded = loadLabProgress()
    progressRef.current = loaded
    setProgress(loaded)
    setMusicTrack("home")
  }, [])

  const complete = (game: LabGameId, level: number, stars: number) => {
    const next = recordLabResult(progressRef.current, game, level, stars)
    progressRef.current = next
    setProgress(next)
    saveLabProgress(next)
    onAward(50 + 25 * stars)
  }

  if (active) {
    const meta = LAB_GAMES[active]
    return (
      <section className="detective-shell lab-shell">
        <div className="detective-frame">
          <div className="detective-frame-title lab-title">{meta.icon} {meta.title} <span>{meta.accent}</span></div>
          <LabGame gameId={active} getProgress={() => progressRef.current} onComplete={complete} onExit={() => setActive(null)} />
        </div>
      </section>
    )
  }

  return (
    <section className="detective-shell lab-shell">
      <button className="corner-back" onClick={onBack}><ArrowLeft /> SELECT A GAME</button>
      <div className="practice-heading">
        <div className="season lab-season"><FlaskConical /> AI RESEARCH LABORATORY</div>
        <h2>AI <span>LAB</span></h2>
        <p>Welkom in het lab! Ontdek hoe AI leert, waar het fouten maakt en hoe computers instructies volgen.</p>
      </div>
      <div className="detective-grid">
        {LAB_IDS.map((id) => {
          const meta = LAB_GAMES[id]
          const p = progress[id]
          const total = meta.levels.length
          const done = labCompleted(p)
          return (
            <article key={id} className={`detective-card lab-card ${id}`}>
              <div className="detective-art lab-art" aria-hidden="true"><span>{meta.icon}</span><i className="scan" /></div>
              <small>{meta.category}</small>
              <h3>{meta.title} <span>{meta.accent}</span></h3>
              <p>{meta.description}</p>
              <div className="detective-meta">
                <div className="difficulty" aria-label={`Moeilijkheid ${meta.difficulty} van 3`}>
                  {[1, 2, 3].map((n) => <i key={n} className={n <= meta.difficulty ? "on" : ""} />)}
                </div>
                <b>{done}/{total} VOLTOOID · ★ {labStars(p)}/{total * 3}</b>
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
