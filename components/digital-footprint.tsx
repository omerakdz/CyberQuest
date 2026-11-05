"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft, Fingerprint } from "lucide-react"
import { FootprintGame } from "@/components/footprint-game"
import { FOOTPRINT_GAMES, FOOTPRINT_IDS, emptyFootprintProgress, footprintCompleted, footprintStars, loadFootprintProgress, recordFootprintResult, saveFootprintProgress, type FootprintGameId, type FootprintProgress } from "@/lib/footprint"
import { setMusicTrack } from "@/lib/race-audio"

export function DigitalFootprint({ onBack, onAward }: { onBack: () => void; onAward: (xp: number) => void }) {
  const [progress, setProgress] = useState<FootprintProgress>(emptyFootprintProgress)
  const [active, setActive] = useState<FootprintGameId | null>(null)
  const progressRef = useRef(progress)
  progressRef.current = progress

  useEffect(() => {
    const loaded = loadFootprintProgress()
    progressRef.current = loaded
    setProgress(loaded)
    setMusicTrack("home")
  }, [])

  const complete = (game: FootprintGameId, level: number, stars: number) => {
    const next = recordFootprintResult(progressRef.current, game, level, stars)
    progressRef.current = next
    setProgress(next)
    saveFootprintProgress(next)
    onAward(50 + 25 * stars)
  }

  if (active) {
    const meta = FOOTPRINT_GAMES[active]
    return (
      <section className="detective-shell footprint-shell">
        <div className="detective-frame">
          <div className="detective-frame-title footprint-title">{meta.icon} {meta.title} <span>{meta.accent}</span></div>
          <FootprintGame gameId={active} getProgress={() => progressRef.current} onComplete={complete} onExit={() => setActive(null)} />
        </div>
      </section>
    )
  }

  return (
    <section className="detective-shell footprint-shell">
      <button className="corner-back" onClick={onBack}><ArrowLeft /> SELECT A GAME</button>
      <div className="practice-heading">
        <div className="season footprint-season"><Fingerprint /> ONLINE IDENTITY</div>
        <h2>DIGITAL <span>FOOTPRINT</span></h2>
        <p>Alles wat je online doet laat sporen na. Ontdek hoe je slim omgaat met je privacy en wat je deelt.</p>
      </div>
      <div className="detective-grid">
        {FOOTPRINT_IDS.map((id) => {
          const meta = FOOTPRINT_GAMES[id]
          const p = progress[id]
          const total = meta.levels.length
          const done = footprintCompleted(p)
          return (
            <article key={id} className={`detective-card footprint-card ${id}`}>
              <div className="detective-art footprint-art" aria-hidden="true"><span>{meta.icon}</span><i className="trail" /></div>
              <small>{meta.category}</small>
              <h3>{meta.title} <span>{meta.accent}</span></h3>
              <p>{meta.description}</p>
              <div className="detective-meta">
                <div className="difficulty" aria-label={`Moeilijkheid ${meta.difficulty} van 3`}>
                  {[1, 2, 3].map((n) => <i key={n} className={n <= meta.difficulty ? "on" : ""} />)}
                </div>
                <b>{done}/{total} VOLTOOID · ★ {footprintStars(p)}/{total * 3}</b>
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
