"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft, Newspaper } from "lucide-react"
import { FactGame } from "@/components/fact-game"
import { FACT_GAMES, FACT_IDS, emptyFactProgress, factCompleted, factStars, loadFactProgress, recordFactResult, saveFactProgress, type FactGameId, type FactProgress } from "@/lib/fact"
import { setMusicTrack } from "@/lib/race-audio"

export function FakeOrFact({ onBack, onAward }: { onBack: () => void; onAward: (xp: number) => void }) {
  const [progress, setProgress] = useState<FactProgress>(emptyFactProgress)
  const [active, setActive] = useState<FactGameId | null>(null)
  const progressRef = useRef(progress)
  progressRef.current = progress

  useEffect(() => {
    const loaded = loadFactProgress()
    progressRef.current = loaded
    setProgress(loaded)
    setMusicTrack("home")
  }, [])

  const complete = (game: FactGameId, level: number, stars: number) => {
    const next = recordFactResult(progressRef.current, game, level, stars)
    progressRef.current = next
    setProgress(next)
    saveFactProgress(next)
    onAward(50 + 25 * stars)
  }

  if (active) {
    const meta = FACT_GAMES[active]
    return (
      <section className="detective-shell fact-shell">
        <div className="detective-frame">
          <div className="detective-frame-title fact-title">{meta.icon} {meta.title} <span>{meta.accent}</span></div>
          <FactGame gameId={active} getProgress={() => progressRef.current} onComplete={complete} onExit={() => setActive(null)} />
        </div>
      </section>
    )
  }

  return (
    <section className="detective-shell fact-shell">
      <button className="corner-back" onClick={onBack}><ArrowLeft /> SELECT A GAME</button>
      <div className="practice-heading">
        <div className="season fact-season"><Newspaper /> NIEUWSREDACTIE</div>
        <h2>FAKE OR <span>FACT</span></h2>
        <p>Controleer bronnen, foto&apos;s en claims. Word een echte factchecker!</p>
      </div>
      <div className="detective-grid">
        {FACT_IDS.map((id) => {
          const meta = FACT_GAMES[id]
          const p = progress[id]
          const total = meta.levels.length
          const done = factCompleted(p)
          return (
            <article key={id} className={`detective-card fact-card ${id}`}>
              <div className="detective-art fact-art" aria-hidden="true"><span>{meta.icon}</span><em className="glass">🔍</em></div>
              <small>{meta.category}</small>
              <h3>{meta.title} <span>{meta.accent}</span></h3>
              <p>{meta.description}</p>
              <div className="detective-meta">
                <div className="difficulty" aria-label={`Moeilijkheid ${meta.difficulty} van 3`}>
                  {[1, 2, 3].map((n) => <i key={n} className={n <= meta.difficulty ? "on" : ""} />)}
                </div>
                <b>{done}/{total} VOLTOOID · ★ {factStars(p)}/{total * 3}</b>
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
