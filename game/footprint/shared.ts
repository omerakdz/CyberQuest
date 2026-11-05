import * as Phaser from "phaser"
import { FOOTPRINT_GAMES, type FootprintGameId, type FootprintProgress } from "@/lib/footprint"
import { COLOR, TEXT, W, backdrop, button, enter, goTo, heading, panel, starString, text, topBar } from "@/game/detective/kit"

export type FootprintBridge = {
  getProgress(): FootprintProgress
  complete(game: FootprintGameId, level: number, stars: number): void
  exit(): void
}

export function footprintBridge(scene: Phaser.Scene) {
  return scene.registry.get("bridge") as FootprintBridge
}

export function starsFromRatio(ratio: number) {
  return ratio >= 0.85 ? 3 : ratio >= 0.6 ? 2 : 1
}

// Saves the result and returns a "next level" callback (undefined after the last level).
export function finishLevel(scene: Phaser.Scene, game: FootprintGameId, level: number, stars: number) {
  footprintBridge(scene).complete(game, level, stars)
  return level < FOOTPRINT_GAMES[game].levels.length ? () => goTo(scene, "play", { level: level + 1 }) : undefined
}

export class FootprintMenuScene extends Phaser.Scene {
  constructor() {
    super("menu")
  }

  create() {
    const gameId = this.registry.get("gameId") as FootprintGameId
    const meta = FOOTPRINT_GAMES[gameId]
    const bridge = footprintBridge(this)
    const progress = bridge.getProgress()[gameId]
    backdrop(this)
    enter(this)
    topBar(this, `${meta.title} ${meta.accent}`, "TERUG", () => bridge.exit())
    text(this, W / 2, 84, "Kies een level. Alle voorbeelden zijn verzonnen.", 15, TEXT.muted).setOrigin(0.5)

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
      panel(this, x, y, cw, ch, { stroke: open ? COLOR.cyan : 0x2a3350, fill: open ? COLOR.panel : 0x0a1024 })
      heading(this, x + cw / 2, y + 48, open ? String(level).padStart(2, "0") : "🔒", 56, open ? TEXT.cyan : TEXT.muted).setOrigin(0.5)
      text(this, x + cw / 2, y + 100, name, 14, open ? TEXT.main : TEXT.muted, { align: "center", wordWrap: { width: cw - 24 } }).setOrigin(0.5, 0)
      if (open) heading(this, x + cw / 2, y + 150, starString(stars), 30, TEXT.yellow).setOrigin(0.5)
      const b = button(this, x + cw / 2, y + ch - 22, 120, 32, open ? "START" : "VERGRENDELD", () => goTo(this, "play", { level }), { size: 13, color: COLOR.green })
      b.setEnabled(open)
    })
  }
}
