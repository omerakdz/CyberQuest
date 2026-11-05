import * as Phaser from "phaser"
import { playCorrectSound, playErrorSound, playPopupSound } from "@/lib/race-audio"
import { COLOR, TEXT, W, backdrop, button, enter, floatText, goTo, heading, panel, shake, showResult, text, topBar } from "@/game/detective/kit"
import { finishLevel } from "./shared"
import { KIND_LABEL, TRACKER_INTRO, TRACKER_LEVELS, type Kind, type TrackerLevel } from "./tracker-data"

type Verdict = { pick: Kind; right: boolean }

const KIND_COLOR: Record<Kind, number> = { active: COLOR.cyan, passive: COLOR.purple }

export function trackerStars(mistakes: number) {
  return mistakes <= 1 ? 3 : mistakes <= 3 ? 2 : 1
}

export class TrackerScene extends Phaser.Scene {
  private level = 1
  private cfg!: TrackerLevel
  private verdicts: (Verdict | null)[] = []
  private current = -1
  private list!: Phaser.GameObjects.Container
  private detail!: Phaser.GameObjects.Container
  private board!: Phaser.GameObjects.Container
  private hud!: Phaser.GameObjects.Text

  constructor() {
    super("play")
  }

  init(data: { level?: number }) {
    this.level = data.level ?? 1
    this.cfg = TRACKER_LEVELS[this.level - 1]
    this.verdicts = this.cfg.activities.map(() => null)
    this.current = -1
  }

  create() {
    backdrop(this)
    enter(this)
    topBar(this, `${this.cfg.character.toUpperCase()}`, "MENU", () => goTo(this, "menu"))
    this.hud = text(this, W - 20, 34, "", 15, TEXT.yellow).setOrigin(1, 0.5)
    text(this, W / 2, 586, TRACKER_INTRO, 10, TEXT.muted, { align: "center", wordWrap: { width: 920 } }).setOrigin(0.5)
    this.list = this.add.container(0, 0)
    this.detail = this.add.container(0, 0)
    this.board = this.add.container(0, 0)
    this.drawList()
    this.drawDetail()
    this.drawBoard()
  }

  private mistakes() {
    return this.verdicts.filter((v) => v && !v.right).length
  }

  private doneCount() {
    return this.verdicts.filter(Boolean).length
  }

  private drawList() {
    this.list.removeAll(true)
    const n = this.cfg.activities.length
    const h = Math.min(54, Math.floor(440 / n) - 4)
    this.cfg.activities.forEach((a, i) => {
      const y = 70 + i * (h + 5)
      const v = this.verdicts[i]
      const open = i === this.current
      this.list.add(panel(this, 24, y, 330, h, { fill: open ? 0x14305e : COLOR.panel, stroke: open ? COLOR.cyan : v ? (v.right ? COLOR.green : COLOR.red) : COLOR.line, width: open ? 3 : 2, radius: 10 }))
      this.list.add(text(this, 36, y + h / 2, a.icon, 20, TEXT.main).setOrigin(0, 0.5))
      this.list.add(text(this, 70, y + h / 2, a.title, 12, TEXT.main, { wordWrap: { width: 245 } }).setOrigin(0, 0.5))
      this.list.add(text(this, 344, y + h / 2, v ? (v.right ? "✔" : "✘") : "●", 15, v ? (v.right ? TEXT.green : TEXT.red) : TEXT.yellow).setOrigin(1, 0.5))
      const zone = this.add.zone(189, y + h / 2, 330, h).setInteractive({ useHandCursor: true })
      zone.on("pointerdown", () => {
        playPopupSound()
        this.current = i
        this.drawList()
        this.drawDetail()
      })
      this.list.add(zone)
    })
    this.hud.setText(`SPOREN ${this.doneCount()}/${n}`)
  }

  private drawDetail() {
    const d = this.detail
    d.removeAll(true)
    d.add(panel(this, 370, 70, 566, 236, { stroke: COLOR.cyan }))
    if (this.current < 0) {
      d.add(text(this, 653, 130, `${this.cfg.avatar}  ${this.cfg.character}`, 24, TEXT.cyan, { align: "center" }).setOrigin(0.5))
      d.add(text(this, 653, 190, this.cfg.intro + "\n\nKies links een activiteit om te onderzoeken.", 14, TEXT.main, { align: "center", wordWrap: { width: 500 }, lineSpacing: 6 }).setOrigin(0.5))
      return
    }
    const a = this.cfg.activities[this.current]
    const v = this.verdicts[this.current]
    d.add(text(this, 390, 84, `${a.icon} ${a.title}`, 16, TEXT.cyan, { fontStyle: "700", wordWrap: { width: 530 } }))
    d.add(text(this, 390, 114, a.detail, 13, TEXT.main, { wordWrap: { width: 528 }, lineSpacing: 5 }))
    if (!v) {
      d.add(text(this, 390, 190, "Wat voor spoor is dit?", 13, TEXT.yellow, { fontStyle: "700" }))
      d.add(button(this, 530, 250, 260, 54, "✍️ ACTIEF\ndit deel je zelf", () => this.answer("active"), { color: COLOR.cyan, size: 13 }).container)
      d.add(button(this, 800, 250, 260, 54, "🕵️ PASSIEF\nwordt verzameld", () => this.answer("passive"), { color: COLOR.purple, size: 13 }).container)
    } else {
      d.add(text(this, 390, 178, `${v.right ? "Goed gezien!" : "Bijna!"} Het is een ${KIND_LABEL[a.kind].toLowerCase()} spoor.`, 14, v.right ? TEXT.green : TEXT.red, { fontStyle: "700" }))
      d.add(text(this, 390, 202, a.why, 12, TEXT.muted, { wordWrap: { width: 528 }, lineSpacing: 4 }))
      if (this.doneCount() === this.cfg.activities.length) d.add(button(this, 800, 276, 270, 34, "BEKIJK HET GROTE PLAATJE →", () => this.overview(), { color: COLOR.green, size: 12 }).container)
      else d.add(button(this, 800, 276, 200, 34, "VOLGENDE SPOOR →", () => this.next(), { color: COLOR.green, size: 12 }).container)
    }
  }

  private next() {
    const n = this.cfg.activities.length
    for (let step = 1; step <= n; step += 1) {
      const i = (this.current + step) % n
      if (!this.verdicts[i]) {
        this.current = i
        break
      }
    }
    this.drawList()
    this.drawDetail()
  }

  private answer(pick: Kind) {
    const a = this.cfg.activities[this.current]
    const right = pick === a.kind
    this.verdicts[this.current] = { pick, right }
    if (right) {
      playCorrectSound()
      floatText(this, 653, 160, "+ SPOOR GEVONDEN", TEXT.green, 26)
    } else {
      playErrorSound()
      shake(this, 0.004)
    }
    this.drawList()
    this.drawDetail()
    this.drawBoard()
  }

  private drawBoard() {
    const b = this.board
    b.removeAll(true)
    b.add(panel(this, 370, 318, 566, 250, { stroke: COLOR.purple }))
    b.add(heading(this, 388, 324, "ONDERZOEKSBORD", 20, TEXT.purple))
    b.add(text(this, 920, 332, "🔵 actief   🟣 passief", 11, TEXT.muted).setOrigin(1, 0))
    const cw = 174
    let slot = 0
    this.cfg.activities.forEach((a, i) => {
      const v = this.verdicts[i]
      if (!v) return
      const x = 384 + (slot % 3) * (cw + 8)
      const y = 358 + Math.floor(slot / 3) * 64
      slot += 1
      const color = KIND_COLOR[a.kind]
      const note = this.add.container(x, y)
      note.add(panel(this, 0, 0, cw, 56, { fill: 0x0a1330, stroke: color, radius: 8 }))
      note.add(text(this, 8, 6, `${a.icon} 👣`, 12, TEXT.main))
      note.add(text(this, 8, 26, a.clue, 11, a.kind === "active" ? TEXT.cyan : TEXT.purple, { wordWrap: { width: cw - 14 } }))
      if (!v.right) note.add(text(this, cw - 8, 6, "↻", 12, TEXT.yellow).setOrigin(1, 0))
      note.setScale(0.5).setAlpha(0)
      b.add(note)
      this.tweens.add({ targets: note, scale: 1, alpha: 1, duration: 260, ease: "Back.easeOut" })
    })
    if (slot === 0) b.add(text(this, 653, 440, "Onderzoek een activiteit om sporen op het bord te plakken.", 13, TEXT.muted, { align: "center" }).setOrigin(0.5))
  }

  // Final overview: every clue connects to the character to show the bigger picture.
  private overview() {
    playPopupSound()
    const layer = this.add.container(0, 0).setDepth(500)
    const dim = this.add.rectangle(W / 2, 300, W, 600, 0x02040c, 0.93).setInteractive()
    layer.add(dim)
    layer.add(heading(this, W / 2, 28, "HET GROTE PLAATJE", 34, TEXT.cyan).setOrigin(0.5))
    const cx = 330
    const cy = 300
    const g = this.add.graphics()
    layer.add(g)
    const acts = this.cfg.activities
    const radius = 195
    acts.forEach((a, i) => {
      const angle = (Math.PI * 2 * i) / acts.length - Math.PI / 2
      const x = cx + Math.cos(angle) * radius * 1.05
      const y = cy + Math.sin(angle) * radius * 0.88
      const color = KIND_COLOR[a.kind]
      g.lineStyle(2, color, 0.6)
      g.lineBetween(cx, cy, x, y)
      const node = this.add.container(x, y)
      node.add(this.add.circle(0, 0, 26, 0x0a1330).setStrokeStyle(3, color))
      node.add(text(this, 0, 0, a.icon, 22, TEXT.main).setOrigin(0.5))
      node.add(text(this, 0, 34, a.clue, 10, a.kind === "active" ? TEXT.cyan : TEXT.purple, { align: "center", wordWrap: { width: 130 } }).setOrigin(0.5, 0))
      node.setScale(0)
      layer.add(node)
      this.tweens.add({ targets: node, scale: 1, duration: 320, delay: 150 + i * 160, ease: "Back.easeOut" })
    })
    const hub = this.add.container(cx, cy)
    hub.add(this.add.circle(0, 0, 44, 0x14305e).setStrokeStyle(4, COLOR.yellow))
    hub.add(text(this, 0, -4, this.cfg.avatar, 34, TEXT.main).setOrigin(0.5))
    hub.add(text(this, 0, 58, this.cfg.character, 12, TEXT.yellow, { fontStyle: "700" }).setOrigin(0.5))
    layer.add(hub)
    this.tweens.add({ targets: hub, scale: 1.08, duration: 900, yoyo: true, repeat: -1 })

    const active = acts.filter((a) => a.kind === "active").length
    const passive = acts.length - active
    layer.add(panel(this, 600, 80, 336, 420, { stroke: COLOR.purple }))
    layer.add(text(this, 618, 98, `✍️ Actieve sporen: ${active}\n🕵️ Passieve sporen: ${passive}`, 14, TEXT.main, { lineSpacing: 8 }))
    layer.add(text(this, 618, 160, this.cfg.picture, 13, TEXT.main, { wordWrap: { width: 302 }, lineSpacing: 6 }))
    layer.add(text(this, 618, 330, "Tip: deel bewust, zet instellingen goed en weet dat sommige sporen vanzelf ontstaan.", 12, TEXT.green, { wordWrap: { width: 302 }, lineSpacing: 5 }))
    layer.add(button(this, 768, 470, 260, 40, "AFRONDEN →", () => this.finish(), { color: COLOR.green, size: 14 }).container)
  }

  private finish() {
    const stars = trackerStars(this.mistakes())
    const total = this.cfg.activities.length
    const onNext = finishLevel(this, "tracker", this.level, stars)
    showResult(this, {
      win: true,
      title: "ONDERZOEK KLAAR",
      lines: [`${total - this.mistakes()} van ${total} sporen goed herkend.`, "Actief: je deelt het zelf. Passief: het wordt verzameld terwijl je online bent.", "Veel kleine sporen samen vormen een groot beeld."],
      stars,
      onRetry: () => goTo(this, "play", { level: this.level }),
      onMenu: () => goTo(this, "menu"),
      onNext,
    })
  }
}
