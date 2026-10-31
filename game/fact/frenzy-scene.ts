import * as Phaser from "phaser"
import { playCorrectSound, playErrorSound, playPopupSound } from "@/lib/race-audio"
import { COLOR, TEXT, W, backdrop, button, enter, flash, floatText, goTo, heading, panel, shake, showResult, text, topBar, type Button } from "@/game/detective/kit"
import { factBridge } from "./shared"
import { FRENZY_LEVELS, TRUST_LABEL, type Claim, type ClaimVerdict } from "./frenzy-data"

const VERDICTS: { id: ClaimVerdict; label: string; color: number }[] = [
  { id: "supported", label: "✔ ONDERSTEUND", color: COLOR.green },
  { id: "contradicted", label: "✘ TEGENGESPROKEN", color: COLOR.red },
  { id: "unverified", label: "? NOG ONBEVESTIGD", color: COLOR.yellow },
]
const VERDICT_NAME: Record<ClaimVerdict, string> = { supported: "ONDERSTEUND", contradicted: "TEGENGESPROKEN", unverified: "NOG ONBEVESTIGD" }

export class FrenzyScene extends Phaser.Scene {
  private level = 1
  private claims: Claim[] = []
  private total = 30
  private index = 0
  private score = 0
  private correct = 0
  private left = 0
  private running = false
  private ended = false
  private revealed = new Set<number>()
  private body!: Phaser.GameObjects.Container
  private bar!: Phaser.GameObjects.Graphics
  private clock!: Phaser.GameObjects.Text
  private hud!: Phaser.GameObjects.Text

  constructor() {
    super("play")
  }

  init(data: { level?: number }) {
    this.level = data.level ?? 1
    this.claims = FRENZY_LEVELS[this.level - 1].claims
    this.total = FRENZY_LEVELS[this.level - 1].seconds
    this.index = 0
    this.score = 0
    this.correct = 0
    this.running = false
    this.ended = false
  }

  create() {
    backdrop(this)
    enter(this)
    topBar(this, `REDACTIE ${this.level}`, "MENU", () => goTo(this, "menu"))
    this.hud = text(this, W - 20, 34, "", 15, TEXT.yellow).setOrigin(1, 0.5)
    this.add.text(W - 20, 62, "Nauwkeurigheid gaat voor snelheid!", { fontFamily: '"Space Mono", monospace', fontSize: "11px", color: TEXT.muted }).setOrigin(1, 0.5)
    this.bar = this.add.graphics()
    this.clock = text(this, 36, 74, "", 14, TEXT.yellow, { fontStyle: "700" })
    this.body = this.add.container(0, 0)
    this.loadClaim()
  }

  update(_: number, delta: number) {
    if (!this.running) return
    this.left -= delta / 1000
    this.drawBar()
    if (this.left <= 0) this.timeout()
  }

  private drawBar() {
    const ratio = Phaser.Math.Clamp(this.left / this.total, 0, 1)
    this.bar.clear()
    this.bar.fillStyle(0x14234d, 1)
    this.bar.fillRoundedRect(110, 78, 814, 14, 7)
    this.bar.fillStyle(ratio > 0.5 ? COLOR.green : ratio > 0.25 ? COLOR.yellow : COLOR.red, 1)
    this.bar.fillRoundedRect(110, 78, 814 * ratio, 14, 7)
    this.clock.setText(`⏱ ${Math.max(0, Math.ceil(this.left))}s`)
  }

  private loadClaim() {
    this.body.removeAll(true)
    this.revealed = new Set()
    const claim = this.claims[this.index]
    this.left = this.total
    this.running = true
    this.drawBar()
    this.hud.setText(`SCORE ${this.score}   ${this.index + 1}/${this.claims.length}`)
    const b = this.body

    b.add(panel(this, 24, 106, 912, 112, { fill: 0xf3f0e6, stroke: COLOR.yellow }))
    b.add(text(this, 44, 116, "📡 BINNENGEKOMEN CLAIM", 11, "#6b6552", { fontStyle: "700" }))
    b.add(this.add.text(44, 138, `"${claim.claim}"`, { fontFamily: 'Georgia, "Times New Roman", serif', fontSize: "26px", fontStyle: "bold", color: "#14213d", wordWrap: { width: 872 } }))

    b.add(text(this, 28, 232, "BRONNEN (klik om te lezen)", 12, TEXT.muted))
    claim.sources.forEach((src, i) => {
      const x = 24 + i * 460
      const card = this.add.container(x, 254)
      const bg = this.add.rectangle(226, 78, 452, 156, COLOR.panel2).setStrokeStyle(2, COLOR.line)
      const name = text(this, 14, 12, `📄 ${src.name}`, 14, TEXT.cyan, { fontStyle: "700" })
      const body = text(this, 14, 44, "••••••  Klik om te onderzoeken", 13, TEXT.muted, { wordWrap: { width: 424 }, lineSpacing: 6 })
      const tag = text(this, 14, 130, "", 12, TEXT.main, { fontStyle: "700" })
      bg.setInteractive({ useHandCursor: true })
      bg.on("pointerdown", () => this.reveal(i, bg, body, tag))
      card.add([bg, name, body, tag])
      b.add(card)
    })

    const choices: Button[] = VERDICTS.map((v, i) => button(this, 24 + 148 + i * 308, 548, 290, 48, v.label, () => this.answer(v.id), { size: 14, color: v.color }))
    choices.forEach((c) => b.add(c.container))
    b.setData("choices", choices)
    b.add(text(this, 24, 424, "Beslis: wat zeggen de bronnen over deze claim?", 12, TEXT.muted))
  }

  private reveal(i: number, bg: Phaser.GameObjects.Rectangle, body: Phaser.GameObjects.Text, tag: Phaser.GameObjects.Text) {
    if (!this.running || this.revealed.has(i)) return
    this.revealed.add(i)
    const src = this.claims[this.index].sources[i]
    playPopupSound()
    bg.setStrokeStyle(2, COLOR.yellow)
    body.setText(src.text).setColor(TEXT.main)
    tag.setText(`Bron-check: ${TRUST_LABEL[src.trust]}`)
    const glass = this.add.text(bg.parentContainer.x + 100, bg.parentContainer.y + 90, "🔍", { fontSize: "34px" }).setDepth(400)
    this.tweens.add({ targets: glass, x: glass.x + 220, alpha: 0, duration: 500, onComplete: () => glass.destroy() })
  }

  private answer(pick: ClaimVerdict) {
    if (!this.running || this.ended) return
    this.running = false
    const claim = this.claims[this.index]
    const ok = pick === claim.verdict
    let note: string
    if (ok) {
      const bonus = Math.floor((Math.max(0, this.left) / this.total) * 20)
      this.score += 100 + bonus
      this.correct += 1
      note = `+${100 + bonus}`
      playCorrectSound()
      flash(this, COLOR.green)
    } else {
      this.score = Math.max(0, this.score - 50)
      note = "-50"
      playErrorSound()
      shake(this)
    }
    floatText(this, W / 2, 300, note, ok ? TEXT.green : TEXT.red, 44)
    this.feedback(ok ? "✔ GOED GECHECKT!" : "✘ FOUTE BESLISSING", ok, claim)
  }

  private timeout() {
    if (!this.running) return
    this.running = false
    playErrorSound()
    this.feedback("⏰ TE LAAT", false, this.claims[this.index], true)
  }

  private feedback(title: string, ok: boolean, claim: Claim, late = false) {
    ;(this.body.getData("choices") as Button[]).forEach((b) => b.setEnabled(false))
    this.hud.setText(`SCORE ${this.score}   ${this.index + 1}/${this.claims.length}`)
    const last = this.index === this.claims.length - 1
    const box = panel(this, 24, 300, 912, 286, { fill: 0x08112b, stroke: ok ? COLOR.green : COLOR.red, width: 3 })
    const head = heading(this, 44, 312, title, 32, ok ? TEXT.green : TEXT.red)
    const detail = text(this, 44, 360, `Antwoord: ${VERDICT_NAME[claim.verdict]}.\n${claim.why}${late ? "\nGeen punten of aftrek. Neem de tijd om bronnen te lezen, maar let op de klok." : ""}`, 15, TEXT.main, { wordWrap: { width: 860 }, lineSpacing: 8 })
    const next = button(this, 830, 540, 200, 40, last ? "AFRONDEN →" : "VOLGENDE CLAIM →", () => (last ? this.finish() : this.advance()), { size: 13 })
    this.body.add([box, head, detail, next.container])
  }

  private advance() {
    this.index += 1
    this.loadClaim()
  }

  private finish() {
    this.ended = true
    this.running = false
    const n = this.claims.length
    const win = this.correct >= Math.ceil(n / 2)
    const stars = !win ? 0 : this.correct === n ? 3 : this.correct === n - 1 ? 2 : 1
    if (win) factBridge(this).complete("frenzy", this.level, stars)
    showResult(this, {
      win,
      title: win ? "EDITIE GEPUBLICEERD" : "NIET GEPUBLICEERD",
      lines: [`Goed gecheckt: ${this.correct} van ${n}`, `Redactiescore: ${this.score}`, win ? "Goed gedaan: jij controleert eerst en publiceert daarna." : "Tip: lees alle bronnen. Haast is geen reden om te gokken."],
      stars,
      onRetry: () => goTo(this, "play", { level: this.level }),
      onMenu: () => goTo(this, "menu"),
      onNext: this.level < FRENZY_LEVELS.length ? () => goTo(this, "play", { level: this.level + 1 }) : undefined,
    })
  }
}
