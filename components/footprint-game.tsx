"use client"

import { useEffect, useRef } from "react"
import type { FootprintGameId, FootprintProgress } from "@/lib/footprint"
import type { FootprintBridge } from "@/game/footprint/shared"

type Props = {
  gameId: FootprintGameId
  getProgress: () => FootprintProgress
  onComplete: (game: FootprintGameId, level: number, stars: number) => void
  onExit: () => void
}

// Phaser touches `window` on import, so it is loaded only inside the effect.
export function FootprintGame({ gameId, getProgress, onComplete, onExit }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const latest = useRef({ getProgress, onComplete, onExit })
  latest.current = { getProgress, onComplete, onExit }

  useEffect(() => {
    let cancelled = false
    let game: import("phaser").Game | undefined
    void (async () => {
      const { createFootprintGame } = await import("@/game/footprint")
      if (cancelled || !ref.current) return
      const bridge: FootprintBridge = {
        getProgress: () => latest.current.getProgress(),
        complete: (g, level, stars) => latest.current.onComplete(g, level, stars),
        exit: () => latest.current.onExit(),
      }
      game = createFootprintGame(ref.current, gameId, bridge)
      if (process.env.NODE_ENV !== "production") (window as unknown as { __fp?: unknown }).__fp = game
    })()
    return () => {
      cancelled = true
      game?.destroy(true)
    }
  }, [gameId])

  return <div ref={ref} className="detective-stage footprint-stage" aria-label="Digital Footprint game" />
}
