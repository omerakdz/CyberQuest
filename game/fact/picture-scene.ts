import * as Phaser from "phaser"
import { playCorrectSound, playErrorSound, playPopupSound } from "@/lib/race-audio"
import { COLOR, TEXT, W, backdrop, button, enter, flash, floatText, goTo, heading, panel, shake, showResult, text, topBar, type Button } from "@/game/detective/kit"
import { factBridge } from "./shared"
import { PICTURE_LEVELS, type Picture, type PicVerdict } from "./picture-data"

const FX = 24
const FY = 84
const FW = 560
const FH = 330
const VERDICTS: { id: PicVerdict; label: string; color: number }[] = [
  { id: "honest", label: "✔ EERLIJK", color: COLOR.green },
  { id: "misleading", label: "✘ MISLEIDEND", color: COLOR.red },
  { id: "unverified", label: "? NIET TE CONTROLEREN", color: COLOR.yellow },
]
const VERDICT_NAME: Record<PicVerdict, string> = { honest: "EERLIJK gebruikt", misleading: "MISLEIDEND", unverified: "NIET TE CONTROLEREN" }

export class PictureScene extends Phaser.Scene {
  private level = 1
  private pictures: Picture[] = []
  private index = 0
  private score = 0
  private correct = 0
  private found = new Set<number>()
  private locked = false
  private ended = false
  private stage!: Phaser.GameObjects.Container
  private lens!: Phaser.GameObjects.Graphics
  private clueText!: Phaser.GameObjects.Text
  private listText!: Phaser.GameObjects.Text
  private hud!: Phaser.GameObjects.Text
  private ui!: Phaser.GameObjects.Container

  constructor() {
    super("play")
  }

  init(data: { level?: number }) {
    this.level = data.level ?? 1
    this.pictures = PICTURE_LEVELS[this.level - 1]
    this.index = 0
    this.score = 0
    this.correct = 0
    this.ended = false
  }

  create() {
    backdrop(this)
    enter(this)
    topBar(this, `FOTOLAB ${this.level}`, "MENU", () => goTo(this, "menu"))
    this.hud = text(this, W - 20, 34, "", 15, TEXT.yellow).setOrigin(1, 0.5)
    this.loadItem()
  }

  private loadItem() {
    this.stage?.destroy(true)
    this.ui?.destroy(true)
    this.found = new Set()
    this.locked = false
    const pic = this.pictures[this.index]
    this.hud.setText(`SCORE ${this.score}   ${this.index + 1}/${this.pictures.length}`)

    this.stage = this.add.container(FX, FY)
    const g = this.add.graphics()
    g.fillGradientStyle(pic.sky[0], pic.sky[0], pic.sky[1], pic.sky[1], 1)
    g.fillRect(0, 0, FW, FH)
    if (pic.ground) {
      g.fillStyle(pic.ground.color, 1)
      g.fillRect(0, pic.ground.y, FW, FH - pic.ground.y)
    }
    this.stage.add(g)
    pic.elements.forEach((el) => this.stage.add(this.add.text(el.x, el.y, el.e, { fontSize: `${el.s}px` }).setOrigin(0.5).setAlpha(el.a ?? 1)))
    this.stage.add(this.add.rectangle(FW / 2, FH / 2, FW, FH).setStrokeStyle(4, COLOR.yellow))
    this.stage.add(this.add.text(10, FH - 22, "FOTO", { fontFamily: '"Space Mono", monospace', fontSize: "11px", color: "#ffffff", backgroundColor: "#00000088" }))

    const hit = this.add.rectangle(FW / 2, FH / 2, FW, FH, 0xffffff, 0.001).setInteractive({ useHandCursor: false })
    this.stage.add(hit)
    this.lens = this.add.graphics()
    this.stage.add(this.lens)
    hit.on("pointermove", (p: Phaser.Input.Pointer) => this.moveLens(p.x - FX, p.y - FY))
    hit.on("pointerout", () => this.lens.clear())
    hit.on("pointerdown", (p: Phaser.Input.Pointer) => this.probe(p.x - FX, p.y - FY))

    this.ui = this.add.container(0, 0)
    const ui = this.ui
    ui.add(panel(this, 600, 84, 344, 500, { fill: 0xf3f0e6, stroke: COLOR.yellow }))
    ui.add(text(this, 618, 96, "ONDERSCHRIFT", 11, "#6b6552", { fontStyle: "700" }))
    ui.add(this.add.text(618, 116, pic.caption, { fontFamily: 'Georgia, "Times New Roman", serif', fontSize: "20px", fontStyle: "bold", color: "#14213d", wordWrap: { width: 308 } }))
    ui.add(text(this, 618, 230, "HET VERHAAL", 11, "#6b6552", { fontStyle: "700" }))
    ui.add(this.add.text(618, 250, pic.story, { fontFamily: 'Georgia, "Times New Roman", serif', fontSize: "15px", color: "#2a2a2a", wordWrap: { width: 308 }, lineSpacing: 5 }))
    ui.add(text(this, 618, 340, "GEVONDEN AANWIJZINGEN", 11, "#6b6552", { fontStyle: "700" }))
    this.listText = this.add.text(618, 360, "Nog niets gevonden.", { fontFamily: '"Space Mono", monospace', fontSize: "12px", color: "#14213d", wordWrap: { width: 308 }, lineSpacing: 5 })
    ui.add(this.listText)

    ui.add(panel(this, FX, 426, FW, 64, { fill: 0x08112b }))
    this.clueText = text(this, FX + 14, 434, "🔍 Beweeg het vergrootglas over de foto en klik op verdachte details. Zoek de aanwijzingen!", 13, TEXT.main, { wordWrap: { width: 532 }, lineSpacing: 5 })
    ui.add(this.clueText)
    const choices: Button[] = VERDICTS.map((v, i) => button(this, FX + 93 + i * 187, 540, 176, 46, v.label, () => this.answer(v.id), { size: 12, color: v.color }))
    choices.forEach((b) => ui.add(b.container))
    ui.setData("choices", choices)
    ui.add(text(this, FX, 500, "Wat vind jij van de foto en het onderschrift?", 12, TEXT.muted))
  }

  private moveLens(x: number, y: number) {
    this.lens.clear()
    this.lens.lineStyle(4, COLOR.yellow, 1)
    this.lens.strokeCircle(x, y, 30)
    this.lens.lineBetween(x + 21, y + 21, x + 44, y + 44)
    this.lens.fillStyle(0xffffff, 0.12)
    this.lens.fillCircle(x, y, 30)
  }

  // Click handler; also callable directly with frame-local coordinates.
  probe(x: number, y: number) {
    if (this.locked || this.ended) return
    const pic = this.pictures[this.index]
    const idx = pic.hotspots.findIndex((h) => Phaser.Math.Distance.Between(x, y, h.x, h.y) <= h.r)
    if (idx < 0) {
      this.clueText.setText("🔍 Niets bijzonders op deze plek. Probeer een ander detail.").setColor(TEXT.muted)
      return
    }
    const first = !this.found.has(idx)
    this.found.add(idx)
    this.clueText.setText(`🔎 AANWIJZING: ${pic.hotspots[idx].clue}`).setColor(TEXT.yellow)
    if (first) {
      playPopupSound()
      const h = pic.hotspots[idx]
      const ring = this.add.circle(h.x, h.y, 10, COLOR.green, 0).setStrokeStyle(3, COLOR.green)
      this.stage.add(ring)
      this.tweens.add({ targets: ring, radius: Math.min(h.r, 40), duration: 400, ease: "Back.easeOut" })
      this.listText.setText([...this.found].map((i) => `• ${pic.hotspots[i].clue}`).join("\n"))
    }
  }

  private answer(pick: PicVerdict) {
    if (this.locked || this.ended) return
    this.locked = true
    const pic = this.pictures[this.index]
    const ok = pick === pic.verdict
    if (ok) {
      const bonus = this.found.size > 0 ? 25 : 0
      this.score += 100 + bonus
      this.correct += 1
      playCorrectSound()
      flash(this, COLOR.green)
      floatText(this, 300, 250, `+${100 + bonus}`, TEXT.green, 36)
    } else {
      playErrorSound()
      shake(this)
      floatText(this, 300, 250, "FOUT", TEXT.red, 36)
    }
    ;(this.ui.getData("choices") as Button[]).forEach((b) => b.setEnabled(false))
    this.lens.clear()
    const last = this.index === this.pictures.length - 1
    const box = panel(this, FX, 424, FW, 162, { fill: 0x08112b, stroke: ok ? COLOR.green : COLOR.red, width: 3 })
    const head = heading(this, FX + 14, 430, ok ? "✔ GOED GEKEKEN!" : "✘ BIJNA!", 26, ok ? TEXT.green : TEXT.red)
    const missed = this.found.size === 0 ? "\n💡 Je zocht geen aanwijzingen. Gebruik het vergrootglas." : `\nAanwijzingen gevonden: ${this.found.size}/${pic.hotspots.length}`
    const verdict = text(this, FX + 14, 462, `Dit was: ${VERDICT_NAME[pic.verdict]}.\n${pic.why}${missed}`, 12, TEXT.main, { wordWrap: { width: 410 }, lineSpacing: 5 })
    const next = button(this, FX + 482, 556, 130, 34, last ? "AFRONDEN →" : "VOLGENDE →", () => (last ? this.finish() : this.advance()), { size: 12 })
    this.ui.add([box, head, verdict, next.container])
  }

  private advance() {
    this.index += 1
    this.loadItem()
  }

  private finish() {
    this.ended = true
    const n = this.pictures.length
    const win = this.correct >= Math.ceil(n / 2)
    const stars = !win ? 0 : this.correct === n ? 3 : 2
    if (win) factBridge(this).complete("picture", this.level, stars)
    showResult(this, {
      win,
      title: win ? "FOTOLAB AFGEROND" : "NOG EVEN OEFENEN",
      lines: [`Goed beoordeeld: ${this.correct} van ${n}`, `Score: ${this.score}`, "Onthoud: een ongewone foto is niet automatisch nep, en een echte foto kan toch misleidend zijn."],
      stars,
      onRetry: () => goTo(this, "play", { level: this.level }),
      onMenu: () => goTo(this, "menu"),
      onNext: this.level < PICTURE_LEVELS.length ? () => goTo(this, "play", { level: this.level + 1 }) : undefined,
    })
  }
}
