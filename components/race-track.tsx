"use client"

import { useEffect, useRef } from "react"
import type { TrackState } from "@/game/race/race-scene"

// Phaser touches `window` on import, so it is loaded only inside the effect.
export function RaceTrack({ state }: { state: TrackState }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<import("@/game/race/race-scene").RaceScene | null>(null)
  const latestState = useRef(state)
  latestState.current = state

  useEffect(() => {
    let cancelled = false
    let game: import("phaser").Game | undefined

    void (async () => {
      const [Phaser, { RaceScene, TRACK_SIZE }] = await Promise.all([import("phaser"), import("@/game/race/race-scene")])
      if (cancelled || !containerRef.current) return
      const scene = new RaceScene()
      sceneRef.current = scene
      game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: containerRef.current,
        width: TRACK_SIZE.width,
        height: TRACK_SIZE.height,
        transparent: true,
        audio: { noAudio: true },
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_HORIZONTALLY },
        scene,
      })
      scene.applyState(latestState.current)
    })()

    return () => {
      cancelled = true
      sceneRef.current = null
      game?.destroy(true)
    }
  }, [])

  useEffect(() => {
    sceneRef.current?.applyState(state)
  }, [state])

  return <div ref={containerRef} className="race-track-canvas" aria-label="Race track" />
}
