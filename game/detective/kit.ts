import * as Phaser from "phaser"
import type { DetectiveGameId, DetectiveProgress } from "@/lib/detective"

export const W = 960
export const H = 600

export const COLOR = {
  bg: 0x050a18,
  panel: 0x0d1736,
  panel2: 0x14234d,
  line: 0x2b4b94,
  cyan: 0x38ddff,
  purple: 0x9b6bff,
  pink: 0xff648d,
  green: 0x2be7a0,
  yellow: 0xffc84a,
  red: 0xff4d6d,
}

export const TEXT = {
  main: "#eaf2ff",
  muted: "#8da1b5",
  cyan: "#38ddff",
  purple: "#b99bff",
  pink: "#ff8fae",
  green: "#5af2b8",
  yellow: "#ffd36b",
  red: "#ff7a90",
}

export const FONT = {
  title: '"Barlow Condensed", "Arial Narrow", sans-serif',
  body: '"Space Mono", "Courier New", monospace',
}

// The React side hands every scene the same bridge through the game registry.
export type Bridge = {
  getProgress(): DetectiveProgress
  complete(game: DetectiveGameId, level: number, stars: number): void
  exit(): void
}

export function getBridge(scene: Phaser.Scene) {
  return scene.registry.get("bridge") as Bridge
}

export function text(scene: Phaser.Scene, x: number, y: number, value: string, size = 16, color = TEXT.main, style: Phaser.Types.GameObjects.Text.TextStyle = {}) {
  return scene.add.text(x, y, value, { fontFamily: FONT.body, fontSize: `${size}px`, color, ...style })
}

export function heading(scene: Phaser.Scene, x: number, y: number, value: string, size = 40, color = TEXT.main) {
  return scene.add.text(x, y, value, { fontFamily: FONT.title, fontSize: `${size}px`, fontStyle: "800", color })
}

export function panel(scene: Phaser.Scene, x: number, y: number, w: number, h: number, opts: { fill?: number; stroke?: number; alpha?: number; radius?: number; width?: number } = {}) {
  const g = scene.add.graphics()
  g.fillStyle(opts.fill ?? COLOR.panel, opts.alpha ?? 1)
  g.fillRoundedRect(x, y, w, h, opts.radius ?? 14)
  g.lineStyle(opts.width ?? 2, opts.stroke ?? COLOR.line, 1)
  g.strokeRoundedRect(x, y, w, h, opts.radius ?? 14)
  return g
}

export function backdrop(scene: Phaser.Scene) {
  scene.cameras.main.setBackgroundColor(COLOR.bg)
  const g = scene.add.graphics()
  g.fillGradientStyle(0x0b1638, 0x0b1638, 0x050a18, 0x050a18, 1)
  g.fillRect(0, 0, W, H)
  g.lineStyle(1, 0x1b3a78, 0.22)
  for (let x = 0; x <= W; x += 48) g.lineBetween(x, 0, x, H)
  for (let y = 0; y <= H; y += 48) g.lineBetween(0, y, W, y)
  g.setDepth(-10)
  for (let i = 0; i < 22; i += 1) {
    const dot = scene.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H), Phaser.Math.Between(1, 3), i % 3 === 0 ? COLOR.purple : COLOR.cyan, 0.35).setDepth(-9)
    scene.tweens.add({ targets: dot, y: dot.y - Phaser.Math.Between(30, 90), alpha: 0.05, duration: Phaser.Math.Between(2500, 5000), yoyo: true, repeat: -1, ease: "Sine.easeInOut" })
  }
}

export type Button = {
  container: Phaser.GameObjects.Container
  setEnabled(enabled: boolean): void
  setLabel(value: string): void
  setColor(color: number): void
}

export function button(scene: Phaser.Scene, x: number, y: number, w: number, h: number, label: string, onClick: () => void, opts: { color?: number; size?: number } = {}): Button {
  let color = opts.color ?? COLOR.cyan
  let enabled = true
  let hover = false
  const g = scene.add.graphics()
  const caption = text(scene, 0, 0, label, opts.size ?? 15, TEXT.main, { fontStyle: "700", align: "center", wordWrap: { width: w - 16 } }).setOrigin(0.5)
  const zone = scene.add.zone(0, 0, w, h).setInteractive({ useHandCursor: true })
  const container = scene.add.container(x, y, [g, caption, zone])

  const draw = () => {
    g.clear()
    g.fillStyle(enabled ? (hover ? color : COLOR.panel2) : 0x0b1228, enabled ? (hover ? 0.35 : 1) : 0.8)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 12)
    g.lineStyle(2, enabled ? color : 0x2a3350, 1)
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 12)
    caption.setAlpha(enabled ? 1 : 0.4)
  }
  draw()

  zone.on("pointerover", () => {
    if (!enabled) return
    hover = true
    draw()
    scene.tweens.add({ targets: container, scale: 1.04, duration: 90 })
  })
  zone.on("pointerout", () => {
    hover = false
    draw()
    scene.tweens.add({ targets: container, scale: 1, duration: 90 })
  })
  zone.on("pointerdown", () => {
    if (!enabled) return
    scene.tweens.add({ targets: container, scale: 0.96, duration: 60, yoyo: true })
    onClick()
  })

  return {
    container,
    setEnabled(next) {
      enabled = next
      if (!next) {
        hover = false
        container.setScale(1)
      }
      draw()
    },
    setLabel(value) {
      caption.setText(value)
    },
    setColor(next) {
      color = next
      draw()
    },
  }
}

export function floatText(scene: Phaser.Scene, x: number, y: number, value: string, color = TEXT.green, size = 28) {
  const t = heading(scene, x, y, value, size, color).setOrigin(0.5).setDepth(900)
  scene.tweens.add({ targets: t, y: y - 60, alpha: 0, duration: 1000, ease: "Cubic.easeOut", onComplete: () => t.destroy() })
}

export function shake(scene: Phaser.Scene, strength = 0.006) {
  scene.cameras.main.shake(220, strength)
}

export function flash(scene: Phaser.Scene, color: number) {
  scene.cameras.main.flash(260, (color >> 16) & 255, (color >> 8) & 255, color & 255, false)
}

export function enter(scene: Phaser.Scene) {
  scene.cameras.main.fadeIn(280, 5, 10, 24)
}

export function goTo(scene: Phaser.Scene, key: string, data?: object) {
  scene.cameras.main.fadeOut(220, 5, 10, 24)
  scene.cameras.main.once("camerafadeoutcomplete", () => scene.scene.start(key, data))
}

export function starString(count: number, max = 3) {
  return "★".repeat(count) + "☆".repeat(Math.max(0, max - count))
}

export function topBar(scene: Phaser.Scene, label: string, backLabel: string, onBack: () => void) {
  const back = button(scene, 92, 34, 164, 44, `← ${backLabel}`, onBack, { size: 13, color: COLOR.purple })
  const title = heading(scene, W / 2, 34, label, 30, TEXT.cyan).setOrigin(0.5)
  return { back, title }
}

export type ResultOptions = {
  win: boolean
  title: string
  lines: string[]
  stars?: number
  onRetry: () => void
  onMenu: () => void
  onNext?: () => void
}

// Shared end-of-level overlay so every game has the same win/lose flow.
export function showResult(scene: Phaser.Scene, opts: ResultOptions) {
  const layer = scene.add.container(0, 0).setDepth(1000)
  const dim = scene.add.rectangle(W / 2, H / 2, W, H, 0x02040c, 0.82).setInteractive()
  const accent = opts.win ? COLOR.green : COLOR.red
  const card = panel(scene, W / 2 - 280, H / 2 - 190, 560, 380, { fill: COLOR.panel, stroke: accent, width: 3 })
  const head = heading(scene, W / 2, H / 2 - 150, opts.title, 46, opts.win ? TEXT.green : TEXT.red).setOrigin(0.5)
  const body = text(scene, W / 2, H / 2 - 95, opts.lines.join("\n"), 15, TEXT.main, { align: "center", lineSpacing: 8, wordWrap: { width: 500 } }).setOrigin(0.5, 0)
  layer.add([dim, card, head, body])
  if (opts.win && opts.stars !== undefined) {
    const stars = heading(scene, W / 2, H / 2 + 60, starString(opts.stars), 54, TEXT.yellow).setOrigin(0.5)
    layer.add(stars)
    stars.setScale(0)
    scene.tweens.add({ targets: stars, scale: 1, duration: 500, ease: "Back.easeOut", delay: 200 })
  }
  const items: [string, () => void, number][] = [["OPNIEUW", opts.onRetry, COLOR.yellow], ["MENU", opts.onMenu, COLOR.purple]]
  if (opts.win && opts.onNext) items.push(["VOLGENDE →", opts.onNext, COLOR.green])
  const gap = 170
  const startX = W / 2 - ((items.length - 1) * gap) / 2
  items.forEach(([label, fn, color], index) => {
    layer.add(button(scene, startX + index * gap, H / 2 + 140, 150, 46, label, fn, { color, size: 14 }).container)
  })
  layer.setAlpha(0)
  scene.tweens.add({ targets: layer, alpha: 1, duration: 260 })
  return layer
}
