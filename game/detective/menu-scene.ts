import * as Phaser from "phaser"
import { DETECTIVE_GAMES, type DetectiveGameId } from "@/lib/detective"
import { COLOR, TEXT, W, backdrop, button, enter, getBridge, goTo, heading, panel, starString, text, topBar } from "./kit"

export class LevelMenuScene extends Phaser.Scene {
  constructor() {
    super("menu")
  }

  create() {
    const gameId = this.registry.get("gameId") as DetectiveGameId
    const meta = DETECTIVE_GAMES[gameId]
    const bridge = getBridge(this)
    const progress = bridge.getProgress()[gameId]
    backdrop(this)
    enter(this)
    topBar(this, `${meta.title} ${meta.accent}`, "TERUG", () => bridge.exit())
    text(this, W / 2, 84, `Kies een ${meta.unit.toLowerCase()}. Haal je alle sterren?`, 15, TEXT.muted).setOrigin(0.5)

    const count = meta.levels.length
    const cols = count > 5 ? 4 : count
    const rows = Math.ceil(count / cols)
    const gap = 16
    const cw = Math.min(210, Math.floor((W - 48 - gap * (cols - 1)) / cols))
    const ch = 170
    const startX = W / 2 - ((cols * cw + (cols - 1) * gap) / 2)
    const startY = rows === 1 ? 190 : 130
    meta.levels.forEach((name, i) => {
      const level = i + 1
      const x = startX + (i % cols) * (cw + gap)
      const y = startY + Math.floor(i / cols) * (ch + gap)
      const open = level <= progress.unlocked
      const stars = progress.stars[String(level)] ?? 0
      panel(this, x, y, cw, ch, { stroke: open ? COLOR.cyan : 0x2a3350, fill: open ? COLOR.panel : 0x0a1024 })
      heading(this, x + cw / 2, y + 36, open ? String(level).padStart(2, "0") : "🔒", 42, open ? TEXT.cyan : TEXT.muted).setOrigin(0.5)
      text(this, x + cw / 2, y + 78, name, 13, open ? TEXT.main : TEXT.muted, { align: "center", wordWrap: { width: cw - 20 } }).setOrigin(0.5, 0)
      if (open) heading(this, x + cw / 2, y + 120, starString(stars), 28, TEXT.yellow).setOrigin(0.5)
      const b = button(this, x + cw / 2, y + ch - 18, 110, 28, open ? "START" : "VERGRENDELD", () => goTo(this, "play", { level }), { size: 12, color: COLOR.green })
      b.setEnabled(open)
      b.container.y = y + ch - 16
    })
  }
}
