import * as Phaser from "phaser"
import { playCorrectSound, playErrorSound, playPopupSound } from "@/lib/race-audio"
import { COLOR, TEXT, W, backdrop, button, enter, floatText, goTo, heading, panel, shake, showResult, text, topBar } from "@/game/detective/kit"
import { finishLevel, starsFromRatio } from "./shared"
import { PRIVACY_LEVELS, PRIVACY_NOTE, VIS_ICON, VIS_LABEL, VIS_ORDER, type PrivacyLevel, type Visibility } from "./privacy-data"

type Step = { type: "item"; index: number } | { type: "settings" } | { type: "scenario"; index: number }

// Same or stricter than the ideal level is safe; being stricter than needed costs a little fun, looser costs everything.
export function scoreVisibility(best: Visibility, pick: Visibility) {
  const diff = VIS_ORDER.indexOf(pick) - VIS_ORDER.indexOf(best)
  return diff === 0 ? 100 : diff > 0 ? 60 : 0
}

export class PrivacyScene extends Phaser.Scene {
  private level = 1
  private cfg!: PrivacyLevel
  private steps: Step[] = []
  private stepIndex = 0
  private points = 0
  private maxPoints = 0
  private itemPick: (Visibility | null)[] = []
  private toggles: boolean[] = []
  private settingsChecked = false
  private card!: Phaser.GameObjects.Container
  private main!: Phaser.GameObjects.Container
  private hud!: Phaser.GameObjects.Text

  constructor() {
    super("play")
  }

  init(data: { level?: number }) {
    this.level = data.level ?? 1
    this.cfg = PRIVACY_LEVELS[this.level - 1]
    this.steps = [
      ...this.cfg.items.map((_, index): Step => ({ type: "item", index })),
      { type: "settings" },
      ...this.cfg.scenarios.map((_, index): Step => ({ type: "scenario", index })),
    ]
    this.stepIndex = 0
    this.points = 0
    this.maxPoints = (this.cfg.items.length + this.cfg.settings.length + this.cfg.scenarios.length) * 100
    this.itemPick = this.cfg.items.map(() => null)
    this.toggles = this.cfg.settings.map(() => true)
    this.settingsChecked = false
    this.scenarioPick = null
  }

  create() {
    backdrop(this)
    enter(this)
    topBar(this, "BEVEILIG HET PROFIEL", "MENU", () => goTo(this, "menu"))
    this.hud = text(this, W - 20, 34, "", 15, TEXT.yellow).setOrigin(1, 0.5)
    text(this, W / 2, 588, PRIVACY_NOTE, 10, TEXT.muted).setOrigin(0.5)
    this.card = this.add.container(0, 0)
    this.main = this.add.container(0, 0)
    this.drawCard()
    this.drawStep()
  }

  private percent() {
    return Math.round((this.points / this.maxPoints) * 100)
  }

  private drawCard() {
    const c = this.card
    c.removeAll(true)
    c.add(panel(this, 24, 70, 300, 506, { stroke: COLOR.purple }))
    c.add(text(this, 174, 112, this.cfg.avatar, 44, TEXT.main).setOrigin(0.5))
    c.add(heading(this, 174, 150, this.cfg.username, 22, TEXT.cyan).setOrigin(0.5))
    c.add(text(this, 174, 172, this.cfg.bio, 10, TEXT.muted, { align: "center", wordWrap: { width: 270 } }).setOrigin(0.5, 0))
    let y = 214
    this.cfg.items.forEach((item, i) => {
      const pick = this.itemPick[i]
      c.add(text(this, 38, y, `${item.icon} ${item.label}`, 11, TEXT.main, { wordWrap: { width: 215 } }))
      c.add(text(this, 310, y, pick ? VIS_ICON[pick] : "❓", 15, TEXT.main).setOrigin(1, 0))
      y += 31
    })
    y += 6
    c.add(text(this, 38, y, "INSTELLINGEN", 11, TEXT.purple, { fontStyle: "700" }))
    y += 20
    this.cfg.settings.forEach((s, i) => {
      c.add(text(this, 38, y, s.label, 10, TEXT.muted, { wordWrap: { width: 215 } }))
      const state = this.settingsChecked ? (this.toggles[i] ? "AAN" : "UIT") : "?"
      c.add(text(this, 310, y, state, 11, this.settingsChecked ? (this.toggles[i] === s.ideal ? TEXT.green : TEXT.red) : TEXT.muted, { fontStyle: "700" }).setOrigin(1, 0))
      y += 28
    })
    const done = this.stepIndex
    this.hud.setText(`STAP ${Math.min(done + 1, this.steps.length)}/${this.steps.length}   SCORE ${this.percent()}%`)
  }

  private drawStep() {
    const m = this.main
    m.removeAll(true)
    m.add(panel(this, 340, 70, 596, 506, { stroke: COLOR.cyan }))
    const step = this.steps[this.stepIndex]
    const bar = this.add.graphics()
    bar.fillStyle(0x14234d, 1).fillRoundedRect(358, 82, 560, 8, 4)
    bar.fillStyle(COLOR.cyan, 1).fillRoundedRect(358, 82, Math.max(8, (560 * this.stepIndex) / this.steps.length), 8, 4)
    m.add(bar)
    if (step.type === "item") this.drawItem(step.index)
    else if (step.type === "settings") this.drawSettings()
    else this.drawScenario(step.index)
  }

  private advance() {
    playPopupSound()
    if (this.stepIndex + 1 >= this.steps.length) return this.finish()
    this.stepIndex += 1
    this.drawCard()
    this.drawStep()
  }

  private drawItem(index: number) {
    const m = this.main
    const item = this.cfg.items[index]
    const pick = this.itemPick[index]
    m.add(text(this, 358, 104, "WIE MAG DIT ZIEN?", 12, TEXT.purple, { fontStyle: "700" }))
    m.add(panel(this, 358, 130, 560, 110, { fill: 0x0a1330, stroke: COLOR.line }))
    m.add(heading(this, 376, 140, `${item.icon} ${item.label}`, 26, TEXT.cyan))
    m.add(text(this, 376, 182, item.sample, 14, TEXT.main, { wordWrap: { width: 520 }, lineSpacing: 5 }))
    VIS_ORDER.forEach((vis, i) => {
      const b = button(this, 470 + i * 190, 292, 176, 56, `${VIS_ICON[vis]}\n${VIS_LABEL[vis]}`, () => this.pickItem(index, vis), { color: [COLOR.yellow, COLOR.cyan, COLOR.green][i], size: 14 })
      b.setEnabled(!pick)
      m.add(b.container)
    })
    if (pick) {
      const pts = scoreVisibility(item.best, pick)
      const verdict = pts === 100 ? "Precies goed!" : pts === 60 ? "Veilig, maar dit kon ruimer." : "Te open. Dit is risicovol."
      m.add(heading(this, 358, 346, `${verdict}  +${pts}`, 26, pts === 100 ? TEXT.green : pts > 0 ? TEXT.yellow : TEXT.red))
      m.add(text(this, 358, 386, `Beste keuze: ${VIS_ICON[item.best]} ${VIS_LABEL[item.best]}\n\n${item.why}`, 14, TEXT.main, { wordWrap: { width: 560 }, lineSpacing: 6 }))
      m.add(button(this, 800, 540, 220, 40, "VOLGENDE →", () => this.advance(), { color: COLOR.green, size: 14 }).container)
    }
  }

  private pickItem(index: number, vis: Visibility) {
    if (this.itemPick[index]) return
    const pts = scoreVisibility(this.cfg.items[index].best, vis)
    this.itemPick[index] = vis
    this.points += pts
    if (pts === 100) playCorrectSound()
    else {
      playErrorSound()
      if (pts === 0) shake(this, 0.004)
    }
    if (pts > 0) floatText(this, 640, 330, `+${pts}`, pts === 100 ? TEXT.green : TEXT.yellow, 30)
    this.drawCard()
    this.drawStep()
  }

  private drawSettings() {
    const m = this.main
    m.add(text(this, 358, 104, "PRIVACY-INSTELLINGEN", 12, TEXT.purple, { fontStyle: "700" }))
    m.add(text(this, 358, 124, this.settingsChecked ? "Dit zijn de uitkomsten." : "Zet elke schakelaar zoals jij het veilig vindt en druk op CONTROLEER.", 13, TEXT.muted, { wordWrap: { width: 560 } }))
    const gap = this.settingsChecked ? 92 : 76
    this.cfg.settings.forEach((s, i) => {
      const y = 160 + i * gap
      const right = this.toggles[i] === s.ideal
      m.add(panel(this, 358, y, 560, gap - 8, { fill: 0x0a1330, stroke: this.settingsChecked ? (right ? COLOR.green : COLOR.red) : COLOR.line, radius: 10 }))
      m.add(text(this, 372, y + 10, s.label, 14, TEXT.main, { wordWrap: { width: 380 } }))
      if (this.settingsChecked) m.add(text(this, 372, y + 38, `${right ? "✔" : "✘"} ${s.why}`, 11, right ? TEXT.green : TEXT.pink, { wordWrap: { width: 390 }, lineSpacing: 3 }))
      const toggle = button(this, 850, y + (gap - 8) / 2, 110, 40, this.toggles[i] ? "AAN" : "UIT", () => {
        this.toggles[i] = !this.toggles[i]
        playPopupSound()
        this.drawCard()
        this.drawStep()
      }, { color: this.toggles[i] ? COLOR.green : COLOR.red, size: 14 })
      toggle.setEnabled(!this.settingsChecked)
      m.add(toggle.container)
    })
    if (!this.settingsChecked) m.add(button(this, 800, 540, 220, 40, "CONTROLEER", () => this.checkSettings(), { color: COLOR.yellow, size: 14 }).container)
    else m.add(button(this, 800, 540, 220, 40, "VOLGENDE →", () => this.advance(), { color: COLOR.green, size: 14 }).container)
  }

  private checkSettings() {
    this.settingsChecked = true
    const correct = this.cfg.settings.filter((s, i) => this.toggles[i] === s.ideal).length
    this.points += correct * 100
    if (correct === this.cfg.settings.length) playCorrectSound()
    else playErrorSound()
    floatText(this, 640, 300, `${correct}/${this.cfg.settings.length} goed`, correct === this.cfg.settings.length ? TEXT.green : TEXT.yellow, 30)
    this.drawCard()
    this.drawStep()
  }

  private scenarioPick: number | null = null

  private drawScenario(index: number) {
    const m = this.main
    const sc = this.cfg.scenarios[index]
    const picked = this.scenarioPick
    m.add(text(this, 358, 104, "BERICHT VAN IEMAND ANDERS", 12, TEXT.purple, { fontStyle: "700" }))
    m.add(panel(this, 358, 130, 560, 120, { fill: 0x0a1330, stroke: COLOR.purple }))
    m.add(text(this, 376, 142, `${sc.avatar} ${sc.from}`, 14, TEXT.cyan, { fontStyle: "700" }))
    m.add(text(this, 376, 172, `“${sc.message}”`, 14, TEXT.main, { wordWrap: { width: 520 }, lineSpacing: 5 }))
    m.add(text(this, 358, 266, "Wat doe jij?", 13, TEXT.yellow, { fontStyle: "700" }))
    sc.options.forEach((opt, i) => {
      const b = button(this, 638, 314 + i * 58, 560, 48, opt.label, () => this.pickScenario(index, i), { color: picked === i ? (opt.points >= 70 ? COLOR.green : COLOR.red) : COLOR.cyan, size: 13 })
      b.setEnabled(picked === null)
      m.add(b.container)
    })
    if (picked !== null) {
      const opt = sc.options[picked]
      m.add(text(this, 358, 496, `${opt.points >= 70 ? "✔" : "✘"} +${opt.points}  ${opt.feedback}`, 12, opt.points >= 70 ? TEXT.green : TEXT.pink, { wordWrap: { width: 400 }, lineSpacing: 3 }))
      m.add(button(this, 850, 540, 120, 40, "OK →", () => { this.scenarioPick = null; this.advance() }, { color: COLOR.green, size: 14 }).container)
    }
  }

  private pickScenario(index: number, option: number) {
    if (this.scenarioPick !== null) return
    const opt = this.cfg.scenarios[index].options[option]
    this.scenarioPick = option
    this.points += opt.points
    if (opt.points >= 70) playCorrectSound()
    else {
      playErrorSound()
      shake(this, 0.004)
    }
    this.drawCard()
    this.drawStep()
  }

  private finish() {
    const percent = this.percent()
    const stars = starsFromRatio(this.points / this.maxPoints)
    const onNext = finishLevel(this, "privacy", this.level, stars)
    this.drawCard()
    showResult(this, {
      win: true,
      title: `PRIVACYSCORE ${percent}%`,
      lines: [
        percent >= 85 ? "🛡️ Jouw profiel is stevig beschermd!" : percent >= 60 ? "🛡️ Goed bezig, een paar dingen kunnen nog veiliger." : "🛡️ Dit kan veiliger. Probeer het nog eens!",
        "Denk altijd na voor je iets deelt en gebruik je privacy-instellingen.",
        "Vraag een volwassene bij vragen van onbekenden.",
      ],
      stars,
      onRetry: () => goTo(this, "play", { level: this.level }),
      onMenu: () => goTo(this, "menu"),
      onNext,
    })
  }
}
