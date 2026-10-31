"use client"

import { useEffect, useRef } from "react"
import type { DetectiveGameId, DetectiveProgress } from "@/lib/detective"
import type { Bridge } from "@/game/detective/kit"

type Props = {
  gameId: DetectiveGameId
  getProgress: () => DetectiveProgress
  onComplete: (game: DetectiveGameId, level: number, stars: number) => void
  onExit: () => void
}

// Phaser touches `window` on import, so it is loaded only inside the effect.
export function DetectiveGame({ gameId, getProgress, onComplete, onExit }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const latest = useRef({ getProgress, onComplete, onExit })
  latest.current = { getProgress, onComplete, onExit }

  useEffect(() => {
    let cancelled = false
    let game: import("phaser").Game | undefined
    void (async () => {
      const { createDetectiveGame } = await import("@/game/detective")
      if (cancelled || !ref.current) return
      const bridge: Bridge = {
        getProgress: () => latest.current.getProgress(),
        complete: (g, level, stars) => latest.current.onComplete(g, level, stars),
        exit: () => latest.current.onExit(),
      }
      game = createDetectiveGame(ref.current, gameId, bridge)
      if (process.env.NODE_ENV !== "production") (window as unknown as { __detective?: unknown }).__detective = game
    })()
    return () => {
      cancelled = true
      game?.destroy(true)
    }
  }, [gameId])

  return <div ref={ref} className="detective-stage" aria-label="Cyber Detective game" />
}
