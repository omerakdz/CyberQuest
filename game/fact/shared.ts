import * as Phaser from "phaser"
import { FACT_GAMES, type FactGameId, type FactProgress } from "@/lib/fact"
import { COLOR, TEXT, W, backdrop, button, enter, goTo, heading, panel, starString, text, topBar } from "@/game/detective/kit"

export type FactBridge = {
  getProgress(): FactProgress
  complete(game: FactGameId, level: number, stars: number): void
  exit(): void
}

export function factBridge(scene: Phaser.Scene) {
  return scene.registry.get("bridge") as FactBridge
}

// Shared by all three games: pick a level, then start the "play" scene.
export class FactMenuScene extends Phaser.Scene {
  constructor() {
    super("menu")
  }

  create() {
    const gameId = this.registry.get("gameId") as FactGameId
    const meta = FACT_GAMES[gameId]
    const bridge = factBridge(this)
    const progress = bridge.getProgress()[gameId]
    backdrop(this)
    enter(this)
    topBar(this, `${meta.title} ${meta.accent}`, "TERUG", () => bridge.exit())
    text(this, W / 2, 84, "Kies een ronde. Haal je alle sterren?", 15, TEXT.muted).setOrigin(0.5)

    const count = meta.levels.length
    const gap = 24
    const cw = 270
    const ch = 220
    const startX = W / 2 - (count * cw + (count - 1) * gap) / 2
    meta.levels.forEach((name, i) => {
      const level = i + 1
      const x = startX + i * (cw + gap)
      const y = 170
      const open = level <= progress.unlocked
      const stars = progress.stars[String(level)] ?? 0
      panel(this, x, y, cw, ch, { stroke: open ? COLOR.yellow : 0x2a3350, fill: open ? COLOR.panel : 0x0a1024 })
      heading(this, x + cw / 2, y + 48, open ? String(level).padStart(2, "0") : "🔒", 56, open ? TEXT.yellow : TEXT.muted).setOrigin(0.5)
      text(this, x + cw / 2, y + 100, name, 14, open ? TEXT.main : TEXT.muted, { align: "center", wordWrap: { width: cw - 24 } }).setOrigin(0.5, 0)
      if (open) heading(this, x + cw / 2, y + 150, starString(stars), 30, TEXT.yellow).setOrigin(0.5)
      const b = button(this, x + cw / 2, y + ch - 22, 120, 32, open ? "START" : "VERGRENDELD", () => goTo(this, "play", { level }), { size: 13, color: COLOR.green })
      b.setEnabled(open)
    })
  }
}
