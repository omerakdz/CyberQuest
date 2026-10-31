"use client"

import { useEffect, useRef } from "react"
import type { LabGameId, LabProgress } from "@/lib/lab"
import type { LabBridge } from "@/game/lab/shared"

type Props = {
  gameId: LabGameId
  getProgress: () => LabProgress
  onComplete: (game: LabGameId, level: number, stars: number) => void
  onExit: () => void
}

// Phaser touches `window` on import, so it is loaded only inside the effect.
export function LabGame({ gameId, getProgress, onComplete, onExit }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const latest = useRef({ getProgress, onComplete, onExit })
  latest.current = { getProgress, onComplete, onExit }

  useEffect(() => {
    let cancelled = false
    let game: import("phaser").Game | undefined
    void (async () => {
      const { createLabGame } = await import("@/game/lab")
      if (cancelled || !ref.current) return
      const bridge: LabBridge = {
        getProgress: () => latest.current.getProgress(),
        complete: (g, level, stars) => latest.current.onComplete(g, level, stars),
        exit: () => latest.current.onExit(),
      }
      game = createLabGame(ref.current, gameId, bridge)
      if (process.env.NODE_ENV !== "production") (window as unknown as { __lab?: unknown }).__lab = game
    })()
    return () => {
      cancelled = true
      game?.destroy(true)
    }
  }, [gameId])

  return <div ref={ref} className="detective-stage lab-stage" aria-label="AI Lab game" />
}
