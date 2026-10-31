import * as Phaser from "phaser"
import { playCorrectSound, playErrorSound, playPopupSound } from "@/lib/race-audio"
import { COLOR, TEXT, W, backdrop, button, enter, floatText, goTo, heading, panel, shake, showResult, text, topBar } from "@/game/detective/kit"
import { labBridge } from "./shared"
import { misleadingFeatures, predict, train, featureShare, type Example, type Model } from "./ai-engine"
import { FEATURE_LABEL, TRAINER_LEVELS, type TrainerLevel } from "./trainer-data"

const MAX_PICKS = 3
const IDEAL_PICKS = [1, 1, 2]
const featureNames = (f: string[]) => f.map((x) => FEATURE_LABEL[x] ?? x).join(", ")
const pct = (v: number) => `${Math.round(v * 100)}%`

type TestRow = { item: Example; cat: string; confidence: number; scores: Record<string, number>; ok: boolean }

export class TrainerScene extends Phaser.Scene {
  private level = 1
  private cfg!: TrainerLevel
  private cats: string[] = []
  private learned: Example[] = []
  private trainIndex = 0
  private sortErrors = 0
  private picks = 0
  private testIndex = 0
  private rows: TestRow[] = []
  private options: Example[] = []
  private locked = false
  private ended = false
  private ui!: Phaser.GameObjects.Container
  private barFill!: Phaser.GameObjects.Rectangle
  private barLabel!: Phaser.GameObjects.Text
  private brain!: Phaser.GameObjects.Container

  constructor() {
    super("play")
  }

  init(data: { level?: number }) {
    this.level = data.level ?? 1
    this.cfg = TRAINER_LEVELS[this.level - 1]
    this.cats = this.cfg.cats.map((c) => c.id)
    this.learned = []
    this.trainIndex = 0
    this.sortErrors = 0
    this.picks = 0
    this.testIndex = 0
    this.rows = []
    this.options = [...this.cfg.fixes]
    this.locked = false
    this.ended = false
  }

  create() {
    backdrop(this)
    enter(this)
    topBar(this, `LAB ${this.level}: ${this.cfg.name.toUpperCase()}`, "MENU", () => goTo(this, "menu"))
    text(this, W / 2, 584, "Let op: dit is een vereenvoudigde simulatie van machine learning. Er wordt geen echt AI-model getraind.", 11, TEXT.muted).setOrigin(0.5)
    this.ui = this.add.container(0, 0)
    this.buildBrain()
    this.showTrainItem()
  }

  private catLabel(id: string) {
    return this.cfg.cats.find((c) => c.id === id)?.label ?? id
  }

  private clear() {
    this.ui.removeAll(true)
  }

  // The right-hand "AI brain" panel stays on screen for every phase.
  private buildBrain() {
    this.brain?.destroy(true)
    const x = 624
    const c = this.add.container(0, 0)
    c.add(panel(this, x, 84, 312, 480, { stroke: COLOR.purple }))
    c.add(heading(this, x + 156, 112, "🤖 AI-BREIN", 24, TEXT.cyan).setOrigin(0.5))
    c.add(text(this, x + 16, 142, "AI-KENNIS", 12, TEXT.muted))
    c.add(this.add.rectangle(x + 16, 168, 280, 16, 0x14234d).setOrigin(0, 0.5))
    this.barFill = this.add.rectangle(x + 16, 168, 2, 16, COLOR.green).setOrigin(0, 0.5)
    this.barLabel = text(this, x + 296, 142, "", 12, TEXT.yellow).setOrigin(1, 0)
    c.add([this.barFill, this.barLabel])
    this.cfg.cats.forEach((cat, i) => {
      const y = 196 + i * 86
      const mine = this.learned.filter((l) => l.cat === cat.id)
      c.add(panel(this, x + 12, y, 288, 76, { fill: COLOR.panel2, stroke: COLOR.line }))
      c.add(text(this, x + 24, y + 8, `${cat.icon} ${cat.label} (${mine.length})`, 13, TEXT.cyan, { fontStyle: "700" }))
      c.add(text(this, x + 24, y + 34, mine.map((m) => m.e).join(" ") || "nog geen voorbeelden", 22, mine.length ? TEXT.main : TEXT.muted))
    })
    this.brain = c
    this.updateBar()
  }

  private updateBar() {
    const ratio = Phaser.Math.Clamp(this.learned.length / (this.cfg.train.length + MAX_PICKS), 0, 1)
    this.barFill.width = Math.max(2, 280 * ratio)
    this.barLabel.setText(`${this.learned.length} voorbeelden`)
  }

  private model(): Model {
    return train(this.learned, this.cats)
  }

  // Phase 1: the player sorts every training example.
  private showTrainItem() {
    this.clear()
    this.locked = false
    const item = this.cfg.train[this.trainIndex]
    const u = this.ui
    u.add(panel(this, 24, 84, 584, 480, { stroke: COLOR.cyan }))
    u.add(text(this, 44, 98, `FASE 1: TRAINEN  ${this.trainIndex + 1}/${this.cfg.train.length}`, 13, TEXT.cyan, { fontStyle: "700" }))
    u.add(text(this, 44, 120, this.trainIndex === 0 ? this.cfg.intro : "Sorteer het voorbeeld in de juiste groep.", 13, TEXT.muted, { wordWrap: { width: 540 } }))
    const emoji = text(this, 316, 250, item.e, 120).setOrigin(0.5)
    this.tweens.add({ targets: emoji, scale: { from: 0.2, to: 1 }, duration: 320, ease: "Back.easeOut" })
    u.add(emoji)
    u.add(text(this, 316, 330, item.name.toUpperCase(), 20, TEXT.main, { fontStyle: "700" }).setOrigin(0.5))
    u.add(text(this, 316, 362, `De AI ziet: ${featureNames(item.f)}`, 13, TEXT.yellow, { align: "center", wordWrap: { width: 520 } }).setOrigin(0.5, 0))
    const note = text(this, 316, 420, "Welke groep is dit?", 14, TEXT.main, { align: "center", wordWrap: { width: 540 } }).setOrigin(0.5, 0)
    u.add(note)
    const n = this.cfg.cats.length
    const bw = Math.min(170, (540 - (n - 1) * 10) / n)
    this.cfg.cats.forEach((cat, i) => {
      const bx = 316 - ((n - 1) * (bw + 10)) / 2 + i * (bw + 10)
      u.add(button(this, bx, 520, bw, 48, `${cat.icon} ${cat.label}`, () => this.sort(item, cat.id, note), { size: 14, color: COLOR.cyan }).container)
    })
  }

  private sort(item: Example, cat: string, note: Phaser.GameObjects.Text) {
    if (this.locked) return
    if (cat !== item.cat) {
      this.sortErrors += 1
      playErrorSound()
      shake(this)
      note.setColor(TEXT.red).setText(`✘ Dat is niet goed: een ${item.name} hoort bij ${this.catLabel(item.cat)}. De AI vertrouwt jouw labels. Foute labels maken een foute AI!`)
      return
    }
    this.locked = true
    playCorrectSound()
    this.learned.push(item)
    note.setColor(TEXT.green).setText(`✔ De AI onthoudt: ${featureNames(item.f)} → ${this.catLabel(cat)}`)
    floatText(this, 316, 200, "+1 voorbeeld", TEXT.green, 24)
    this.buildBrain()
    this.trainIndex += 1
    this.time.delayedCall(900, () => {
      if (this.ended) return
      if (this.trainIndex < this.cfg.train.length) this.showTrainItem()
      else this.showTrained()
    })
  }

  private showTrained() {
    this.clear()
    const u = this.ui
    u.add(panel(this, 24, 84, 584, 480, { stroke: COLOR.green }))
    u.add(heading(this, 316, 200, "TRAINING KLAAR!", 40, TEXT.green).setOrigin(0.5))
    u.add(text(this, 316, 270, "De AI heeft van jouw voorbeelden geleerd welke kenmerken bij welke groep horen.\n\nNu komt de test: de AI krijgt plaatjes die hij nog nooit zag.", 15, TEXT.main, { align: "center", lineSpacing: 6, wordWrap: { width: 500 } }).setOrigin(0.5, 0))
    u.add(button(this, 316, 480, 240, 52, "START DE TEST →", () => this.startTest(), { color: COLOR.green, size: 16 }).container)
  }

  // Phase 2: the AI classifies unseen examples.
  private startTest() {
    this.testIndex = 0
    this.showTest()
  }

  private evaluate(): TestRow[] {
    const model = this.model()
    return this.cfg.test.map((item) => {
      const p = predict(model, item, this.cats)
      return { item, cat: p.cat, confidence: p.confidence, scores: p.scores, ok: p.cat === item.cat }
    })
  }

  private showTest() {
    this.clear()
    this.locked = true
    this.rows = this.evaluate()
    const row = this.rows[this.testIndex]
    const u = this.ui
    u.add(panel(this, 24, 84, 584, 480, { stroke: COLOR.purple }))
    u.add(text(this, 44, 98, `FASE 2: TESTEN  ${this.testIndex + 1}/${this.rows.length}`, 13, TEXT.cyan, { fontStyle: "700" }))
    u.add(text(this, 44, 120, "Een nieuw plaatje. Wat denkt de AI?", 13, TEXT.muted))
    u.add(text(this, 316, 240, row.item.e, 110).setOrigin(0.5))
    u.add(text(this, 316, 316, row.item.name.toUpperCase(), 18, TEXT.main, { fontStyle: "700" }).setOrigin(0.5))
    const thinking = text(this, 316, 372, "🤖 De AI denkt na...", 18, TEXT.cyan).setOrigin(0.5)
    u.add(thinking)
    this.tweens.add({ targets: thinking, alpha: 0.3, yoyo: true, repeat: 2, duration: 220 })
    this.time.delayedCall(720, () => {
      if (this.ended) return
      thinking.destroy()
      playPopupSound()
      const ok = row.ok
      u.add(heading(this, 316, 372, `AI zegt: ${this.catLabel(row.cat)} (${pct(row.confidence)} zeker)`, 22, ok ? TEXT.green : TEXT.red).setOrigin(0.5))
      u.add(text(this, 316, 410, ok ? "✔ Goed gedaan, de AI had het juist!" : `✘ Fout! Het is eigenlijk: ${this.catLabel(row.item.cat)}`, 15, ok ? TEXT.green : TEXT.red, { fontStyle: "700" }).setOrigin(0.5))
      if (!ok) shake(this)
      else playCorrectSound()
      const last = this.testIndex === this.rows.length - 1
      u.add(button(this, 316, 520, 240, 48, last ? "BEKIJK RESULTAAT →" : "VOLGENDE →", () => (last ? this.afterTest() : this.nextTest()), { size: 15, color: COLOR.green }).container)
      this.drawBars(row)
      this.locked = false
    })
  }

  private drawBars(row: TestRow) {
    this.buildBrain()
    const x = 624
    this.cfg.cats.forEach((cat, i) => {
      const y = 196 + i * 86
      const v = row.scores[cat.id]
      this.brain.add(this.add.rectangle(x + 24, y + 62, 252, 8, 0x14234d).setOrigin(0, 0.5))
      this.brain.add(this.add.rectangle(x + 24, y + 62, Math.max(2, 252 * v), 8, cat.id === row.cat ? COLOR.yellow : COLOR.cyan).setOrigin(0, 0.5))
      this.brain.add(text(this, x + 290, y + 8, pct(v), 13, TEXT.yellow).setOrigin(1, 0))
    })
  }

  private nextTest() {
    this.testIndex += 1
    this.showTest()
  }

  private afterTest() {
    if (this.rows.every((r) => r.ok)) this.finish()
    else this.showInvestigate(null)
  }

  // Phase 3: find out why the AI failed and repair the training data.
  private showInvestigate(message: string | null) {
    this.clear()
    this.buildBrain()
    const u = this.ui
    const wrong = this.rows.filter((r) => !r.ok)
    const focus = wrong[0]
    const model = this.model()
    u.add(panel(this, 24, 84, 584, 480, { stroke: COLOR.pink }))
    u.add(text(this, 44, 98, "FASE 3: ONDERZOEK  Waarom maakte de AI een fout?", 13, TEXT.pink, { fontStyle: "700" }))
    u.add(text(this, 44, 124, this.rows.map((r) => `${r.item.e}${r.ok ? "✔" : "✘"}`).join("  "), 22, TEXT.main))
    const why = misleadingFeatures(model, focus.item, focus.cat, focus.item.cat)
    let explain: string
    if (why.length) {
      const w = why[0]
      explain = `De AI dacht bij ${focus.item.e} ${focus.item.name} aan ${this.catLabel(focus.cat)}.\nWaarom? Het kenmerk "${FEATURE_LABEL[w.feature] ?? w.feature}" zat in ${pct(w.wrong)} van de ${this.catLabel(focus.cat)}-voorbeelden, maar in slechts ${pct(w.right)} van de ${this.catLabel(focus.item.cat)}-voorbeelden.`
    } else {
      const share = featureShare(model, focus.item.cat, focus.item.f[0])
      explain = `De AI dacht bij ${focus.item.e} ${focus.item.name} aan ${this.catLabel(focus.cat)}, maar is er maar ${pct(focus.confidence)} zeker van.\nHij kent te weinig voorbeelden die hierop lijken (eerste kenmerk: ${pct(share)} van zijn ${this.catLabel(focus.item.cat)}-voorbeelden).`
    }
    u.add(text(this, 44, 168, explain, 14, TEXT.main, { wordWrap: { width: 540 }, lineSpacing: 6 }))
    u.add(text(this, 44, 292, message ?? `Voeg een extra voorbeeld toe aan de trainingsdata. Je hebt nog ${MAX_PICKS - this.picks} keuze(s).`, 14, message ? TEXT.yellow : TEXT.cyan, { wordWrap: { width: 540 }, lineSpacing: 4 }))
    const n = this.options.length
    const bw = Math.min(180, (540 - (n - 1) * 8) / n)
    this.options.forEach((opt, i) => {
      const bx = 316 - ((n - 1) * (bw + 8)) / 2 + i * (bw + 8)
      u.add(button(this, bx, 470, bw, 100, `${opt.e}\n${opt.name}\nals ${this.catLabel(opt.cat)}`, () => this.pick(opt), { size: 14, color: COLOR.purple }).container)
    })
  }

  private pick(opt: Example) {
    if (this.locked || this.ended) return
    const before = this.rows
    this.picks += 1
    this.learned.push(opt)
    this.options = this.options.filter((o) => o !== opt)
    playPopupSound()
    this.rows = this.evaluate()
    const broke = this.rows.filter((r, i) => !r.ok && before[i].ok)
    const fixed = this.rows.filter((r, i) => r.ok && !before[i].ok)
    const left = this.rows.filter((r) => !r.ok).length
    if (left === 0) {
      this.buildBrain()
      this.finish()
      return
    }
    if (this.picks >= MAX_PICKS || !this.options.length) {
      this.buildBrain()
      this.finish()
      return
    }
    let msg = `Je voegde ${opt.e} toe. `
    msg += fixed.length ? `Hersteld: ${fixed.map((r) => r.item.e).join(" ")}. ` : "Dit loste niets op: dit voorbeeld hielp de AI niet verder. "
    if (broke.length) msg += `Let op: nu gaat ${broke.map((r) => r.item.e).join(" ")} fout! Nieuwe voorbeelden kunnen ook nieuwe fouten veroorzaken. `
    msg += `Nog ${left} fout(en), ${MAX_PICKS - this.picks} keuze(s) over.`
    shake(this, 0.003)
    this.showInvestigate(msg)
  }

  private finish() {
    this.ended = true
    const left = this.rows.filter((r) => !r.ok).length
    const win = left === 0
    const stars = !win ? 0 : this.sortErrors === 0 && this.picks <= IDEAL_PICKS[this.level - 1] ? 3 : 2
    if (win) labBridge(this).complete("trainer", this.level, stars)
    showResult(this, {
      win,
      title: win ? "AI GETRAIND!" : "AI NOG NIET GOED",
      lines: win
        ? [this.picks === 0 ? "De AI had alles meteen goed!" : `Je loste het op met ${this.picks} extra voorbeeld(en).`, this.cfg.fixTip, "Echte AI werkt ook zo: veel en gevarieerde voorbeelden."]
        : [`De AI maakt nog ${left} fout(en).`, this.cfg.fixTip, "Probeer het opnieuw met andere voorbeelden."],
      stars,
      onRetry: () => goTo(this, "play", { level: this.level }),
      onMenu: () => goTo(this, "menu"),
      onNext: this.level < TRAINER_LEVELS.length ? () => goTo(this, "play", { level: this.level + 1 }) : undefined,
    })
  }
}
