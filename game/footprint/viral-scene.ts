import * as Phaser from "phaser"
import { playCorrectSound, playErrorSound, playPopupSound } from "@/lib/race-audio"
import { COLOR, TEXT, W, backdrop, button, enter, goTo, heading, panel, shake, showResult, text, topBar } from "@/game/detective/kit"
import { finishLevel, starsFromRatio } from "./shared"
import { VIRAL_LEVELS, VIRAL_NOTE, type ViralOption, type ViralScenario } from "./viral-data"

const NET_X = 688
const NET_Y = 196

// How many network nodes to draw for a given reach (log scale so 400 people still fits).
export function nodeCount(reach: number) {
  return reach <= 1 ? 0 : Math.max(2, Math.min(26, Math.round(Math.log2(reach) * 2.6)))
}

export class ViralScene extends Phaser.Scene {
  private level = 1
  private scenarios: ViralScenario[] = []
  private index = 0
  private points = 0
  private reached = 0
  private picked: number | null = null
  private feed!: Phaser.GameObjects.Container
  private side!: Phaser.GameObjects.Container
  private net!: Phaser.GameObjects.Container
  private hud!: Phaser.GameObjects.Text

  constructor() {
    super("play")
  }

  init(data: { level?: number }) {
    this.level = data.level ?? 1
    this.scenarios = VIRAL_LEVELS[this.level - 1]
    this.index = 0
    this.points = 0
    this.reached = 0
    this.picked = null
  }

  create() {
    backdrop(this)
    enter(this)
    topBar(this, "JOUW FEED", "MENU", () => goTo(this, "menu"))
    this.hud = text(this, W - 20, 34, "", 15, TEXT.yellow).setOrigin(1, 0.5)
    text(this, W / 2, 588, VIRAL_NOTE, 10, TEXT.muted).setOrigin(0.5)
    this.feed = this.add.container(0, 0)
    this.side = this.add.container(0, 0)
    this.net = this.add.container(0, 0)
    this.render()
  }

  private render() {
    this.feed.removeAll(true)
    this.side.removeAll(true)
    this.net.removeAll(true)
    const sc = this.scenarios[this.index]
    this.hud.setText(`POST ${this.index + 1}/${this.scenarios.length}   SCORE ${Math.round((this.points / (this.scenarios.length * 100)) * 100)}%`)

    const f = this.feed
    f.add(panel(this, 24, 70, 400, 506, { stroke: COLOR.purple }))
    f.add(heading(this, 44, 80, "📱 FEED", 20, TEXT.purple))
    f.add(panel(this, 40, 116, 368, 330, { fill: 0x0a1330, stroke: COLOR.line }))
    f.add(text(this, 56, 128, `${sc.avatar} ${sc.from}`, 14, TEXT.cyan, { fontStyle: "700" }))
    f.add(text(this, 224, 196, sc.art, 54, TEXT.main, { align: "center" }).setOrigin(0.5))
    f.add(text(this, 56, 240, sc.post, 14, TEXT.main, { wordWrap: { width: 336 }, lineSpacing: 6 }))
    f.add(text(this, 56, 394, `ℹ️ ${sc.note}`, 11, TEXT.yellow, { wordWrap: { width: 336 }, lineSpacing: 3 }))
    f.add(text(this, 224, 480, "Jij beslist wat er met dit bericht gebeurt.", 12, TEXT.muted, { align: "center", wordWrap: { width: 340 } }).setOrigin(0.5, 0))
    f.add(text(this, 224, 530, `👥 Bereikt tot nu toe: ${this.reached} mensen`, 11, TEXT.muted).setOrigin(0.5))

    const s = this.side
    s.add(panel(this, 440, 70, 496, 506, { stroke: COLOR.cyan }))
    if (this.picked === null) {
      s.add(heading(this, 460, 82, "WAT DOE JIJ?", 24, TEXT.cyan))
      sc.options.forEach((opt, i) => {
        s.add(button(this, 688, 168 + i * 86, 456, 70, opt.label, () => this.choose(i), { color: [COLOR.cyan, COLOR.purple, COLOR.green][i % 3], size: 14 }).container)
      })
      s.add(text(this, 688, 440, "Denk aan: wie staat er op? Mag het? Klopt het? Wie kan het straks nog meer zien?", 12, TEXT.muted, { align: "center", wordWrap: { width: 440 }, lineSpacing: 4 }).setOrigin(0.5, 0))
    } else {
      this.drawOutcome(sc, sc.options[this.picked])
    }
  }

  private choose(i: number) {
    if (this.picked !== null) return
    const opt = this.scenarios[this.index].options[i]
    this.picked = i
    this.points += opt.points
    this.reached += opt.reach
    if (opt.points >= 70) playCorrectSound()
    else {
      playErrorSound()
      shake(this, 0.004)
    }
    this.render()
  }

  private drawOutcome(sc: ViralScenario, opt: ViralOption) {
    const s = this.side
    s.add(heading(this, 460, 80, `${opt.points >= 70 ? "SLIMME KEUZE" : "LET OP"}  +${opt.points}`, 24, opt.points >= 70 ? TEXT.green : TEXT.red))
    s.add(text(this, 920, 88, `👥 ${opt.reach} ${opt.reach === 1 ? "persoon" : "mensen"}`, 13, opt.reach > 50 ? TEXT.pink : TEXT.green, { fontStyle: "700" }).setOrigin(1, 0))
    this.drawNetwork(opt)
    s.add(text(this, 460, 322, opt.outcome, 13, TEXT.main, { wordWrap: { width: 456 }, lineSpacing: 5 }))
    s.add(text(this, 460, 420, `💡 ${sc.lesson}`, 13, TEXT.cyan, { wordWrap: { width: 456 }, lineSpacing: 5 }))
    const last = this.index + 1 >= this.scenarios.length
    s.add(button(this, 800, 548, 220, 36, last ? "AFRONDEN →" : "VOLGENDE POST →", () => this.next(), { color: COLOR.green, size: 13 }).container)
  }

  // Network visualisation: you in the middle, the content spreading outward ring by ring.
  private drawNetwork(opt: ViralOption) {
    const n = nodeCount(opt.reach)
    const wide = opt.reach > 50
    const color = wide ? COLOR.pink : COLOR.green
    this.net.add(this.add.ellipse(NET_X, NET_Y, 440, 200, 0x0a1330).setStrokeStyle(1, COLOR.line))
    const g = this.add.graphics()
    this.net.add(g)
    const center = this.add.container(NET_X, NET_Y)
    center.add(this.add.circle(0, 0, 20, 0x14305e).setStrokeStyle(3, COLOR.yellow))
    center.add(text(this, 0, 0, "🧑", 18, TEXT.main).setOrigin(0.5))
    this.net.add(center)
    if (n === 0) {
      this.net.add(text(this, NET_X, NET_Y + 56, "Het bericht blijft bij jou.", 12, TEXT.green, { fontStyle: "700" }).setOrigin(0.5))
      return
    }
    const nodes: { x: number; y: number; dot: Phaser.GameObjects.Arc; copy: boolean }[] = []
    for (let i = 0; i < n; i += 1) {
      const ring = i < 6 ? 1 : 2
      const ringCount = ring === 1 ? Math.min(6, n) : n - 6
      const idx = ring === 1 ? i : i - 6
      const angle = (Math.PI * 2 * idx) / ringCount + (ring === 2 ? 0.35 : 0)
      const x = NET_X + Math.cos(angle) * (ring === 1 ? 70 : 190)
      const y = NET_Y + Math.sin(angle) * (ring === 1 ? 44 : 86)
      const dot = this.add.circle(x, y, ring === 1 ? 9 : 6, color, 0.9).setScale(0)
      this.net.add(dot)
      nodes.push({ x, y, dot, copy: i % 3 === 0 })
      this.tweens.add({
        targets: dot,
        scale: 1,
        duration: 220,
        delay: 150 + i * 70,
        ease: "Back.easeOut",
        onStart: () => {
          g.lineStyle(1.5, color, 0.5)
          g.lineBetween(NET_X, NET_Y, x, y)
        },
      })
    }
    if (opt.deleted) {
      const t = 250 + n * 70
      const note = text(this, NET_X, NET_Y + 106, "", 11, TEXT.yellow, { fontStyle: "700" }).setOrigin(0.5)
      this.net.add(note)
      this.time.delayedCall(t, () => {
        if (!this.scene.isActive()) return
        note.setText("🗑️ verwijderd — maar 📸 kopieën blijven bestaan")
        center.setAlpha(0.35)
        nodes.forEach((nd) => {
          if (nd.copy) {
            nd.dot.setFillStyle(COLOR.yellow)
            this.tweens.add({ targets: nd.dot, scale: 1.5, duration: 350, yoyo: true })
          } else this.tweens.add({ targets: nd.dot, alpha: 0.12, duration: 400 })
        })
      })
    }
    this.net.add(text(this, NET_X, NET_Y - 108, wide ? "Het bericht verspreidt zich ver..." : "Het bericht blijft klein.", 11, wide ? TEXT.pink : TEXT.green, { fontStyle: "700" }).setOrigin(0.5))
  }

  private next() {
    playPopupSound()
    this.picked = null
    if (this.index + 1 >= this.scenarios.length) return this.finish()
    this.index += 1
    this.render()
  }

  private finish() {
    const ratio = this.points / (this.scenarios.length * 100)
    const stars = starsFromRatio(ratio)
    const onNext = finishLevel(this, "viral", this.level, stars)
        showResult(this, {
      win: true,
      title: `DELEN-SCORE ${Math.round(ratio * 100)}%`,
      lines: [
        ratio >= 0.85 ? "📡 Je deelt verantwoord en respecteert anderen!" : ratio >= 0.6 ? "📡 Goed bezig. Denk nog iets vaker na voor je deelt." : "📡 Denk eerst na en vraag toestemming. Probeer het nog eens!",
        `Jouw keuzes bereikten samen ${this.reached} mensen.`,
        "Verwijderen wist niet altijd alle kopieën. Denk dus vooraf.",
      ],
      stars,
      onRetry: () => goTo(this, "play", { level: this.level }),
      onMenu: () => goTo(this, "menu"),
      onNext,
    })
  }
}
