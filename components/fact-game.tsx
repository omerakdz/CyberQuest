"use client"

import { useEffect, useRef } from "react"
import type { FactGameId, FactProgress } from "@/lib/fact"
import type { FactBridge } from "@/game/fact/shared"

type Props = {
  gameId: FactGameId
  getProgress: () => FactProgress
  onComplete: (game: FactGameId, level: number, stars: number) => void
  onExit: () => void
}

// Phaser touches `window` on import, so it is loaded only inside the effect.
export function FactGame({ gameId, getProgress, onComplete, onExit }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const latest = useRef({ getProgress, onComplete, onExit })
  latest.current = { getProgress, onComplete, onExit }

  useEffect(() => {
    let cancelled = false
    let game: import("phaser").Game | undefined
    void (async () => {
      const { createFactGame } = await import("@/game/fact")
      if (cancelled || !ref.current) return
      const bridge: FactBridge = {
        getProgress: () => latest.current.getProgress(),
        complete: (g, level, stars) => latest.current.onComplete(g, level, stars),
        exit: () => latest.current.onExit(),
      }
      game = createFactGame(ref.current, gameId, bridge)
      if (process.env.NODE_ENV !== "production") (window as unknown as { __fact?: unknown }).__fact = game
    })()
    return () => {
      cancelled = true
      game?.destroy(true)
    }
  }, [gameId])

  return <div ref={ref} className="detective-stage fact-stage" aria-label="Fake or Fact game" />
}
