import * as Phaser from "phaser"
import { playCorrectSound, playErrorSound, playPopupSound } from "@/lib/race-audio"
import { COLOR, TEXT, W, backdrop, button, enter, flash, floatText, goTo, heading, panel, shake, showResult, text, topBar, type Button } from "@/game/detective/kit"
import { factBridge } from "./shared"
import { NEWS_LEVELS, TOOL_LABEL, type Story, type ToolKey, type Verdict } from "./news-data"

const TOOLS: ToolKey[] = ["bron", "auteur", "datum", "bewijs"]
const VERDICTS: { id: Verdict; label: string; color: number }[] = [
  { id: "reliable", label: "✔ BETROUWBAAR", color: COLOR.green },
  { id: "fake", label: "✘ NEP / MISLEIDEND", color: COLOR.red },
  { id: "unverified", label: "? ONBEVESTIGD", color: COLOR.yellow },
]
const VERDICT_NAME: Record<Verdict, string> = { reliable: "BETROUWBAAR", fake: "NEP of MISLEIDEND", unverified: "ONBEVESTIGD" }

export class NewsScene extends Phaser.Scene {
  private level = 1
  private stories: Story[] = []
  private index = 0
  private score = 0
  private correct = 0
  private answered: (boolean | null)[] = []
  private inspected = new Set<ToolKey>()
  private locked = false
  private reader!: Phaser.GameObjects.Container
  private rows: Phaser.GameObjects.Container[] = []
  private hud!: Phaser.GameObjects.Text
  private ended = false

  constructor() {
    super("play")
  }

  init(data: { level?: number }) {
    this.level = data.level ?? 1
    this.stories = NEWS_LEVELS[this.level - 1]
    this.index = 0
    this.score = 0
    this.correct = 0
    this.answered = this.stories.map(() => null)
    this.inspected = new Set()
    this.locked = false
    this.ended = false
    this.rows = []
  }

  create() {
    backdrop(this)
    enter(this)
    topBar(this, `NIEUWSDESK ${this.level}`, "MENU", () => goTo(this, "menu"))
    this.hud = text(this, W - 20, 34, "", 15, TEXT.yellow).setOrigin(1, 0.5)

    panel(this, 16, 70, 250, 514, { fill: 0x0a1230 })
    text(this, 30, 80, "NIEUWSFEED", 13, TEXT.muted)
    this.stories.forEach((story, i) => {
      const row = this.add.container(24, 106 + i * 118)
      row.add(this.add.rectangle(117, 52, 234, 108, COLOR.panel2).setStrokeStyle(2, COLOR.line).setName("bg"))
      row.add(text(this, 10, 8, story.kind === "krant" ? "📰 KRANT" : "💬 POST", 11, TEXT.yellow, { fontStyle: "700" }))
      row.add(text(this, 10, 28, story.headline, 12, TEXT.main, { fontStyle: "700", wordWrap: { width: 190 }, maxLines: 4 }))
      row.add(text(this, 218, 14, "", 20, TEXT.main).setOrigin(0.5).setName("mark"))
      this.rows.push(row)
    })

    this.reader = this.add.container(0, 0)
    this.show()
  }

  private refresh() {
    this.rows.forEach((row, i) => {
      const bg = row.getByName("bg") as Phaser.GameObjects.Rectangle
      const mark = row.getByName("mark") as Phaser.GameObjects.Text
      const done = this.answered[i]
      bg.setStrokeStyle(2, i === this.index ? COLOR.yellow : done === null ? COLOR.line : done ? COLOR.green : COLOR.red)
      mark.setText(done === null ? "" : done ? "✔" : "✘").setColor(done ? TEXT.green : TEXT.red)
    })
    this.hud.setText(`SCORE ${this.score}   ${this.index + 1}/${this.stories.length}`)
  }

  private show() {
    this.reader.removeAll(true)
    this.refresh()
    this.locked = false
    const story = this.stories[this.index]
    const r = this.reader
    const x0 = 286
    r.add(panel(this, x0, 70, 658, 514, { fill: 0xf3f0e6, stroke: COLOR.yellow }))
    r.add(text(this, x0 + 20, 80, story.kind === "krant" ? "DE DORPSBURGSE KOERIER  ·  EDITIE VANDAAG" : "SOCIAL FEED  ·  GEDEELD BERICHT", 11, "#6b6552", { fontStyle: "700" }))
    r.add(this.add.rectangle(x0 + 329, 100, 618, 3, 0x1b2a55))
    r.add(this.add.text(x0 + 20, 110, story.headline, { fontFamily: 'Georgia, "Times New Roman", serif', fontSize: "27px", fontStyle: "bold", color: "#14213d", wordWrap: { width: 618 } }))
    r.add(this.add.text(x0 + 20, 190, story.body, { fontFamily: 'Georgia, "Times New Roman", serif', fontSize: "16px", color: "#2a2a2a", wordWrap: { width: 618 }, lineSpacing: 6 }))

    r.add(text(this, x0 + 20, 268, "ONDERZOEK DIT BERICHT", 12, "#6b6552", { fontStyle: "700" }))
    TOOLS.forEach((key, i) => {
      const y = 296 + i * 46
      const open = this.inspected.has(key)
      const b = button(this, x0 + 84, y + 14, 130, 34, `🔎 ${TOOL_LABEL[key]}`, () => this.inspect(key), { size: 12, color: COLOR.cyan })
      b.setEnabled(!open)
      r.add(b.container)
      r.add(this.add.text(x0 + 168, y, open ? story.tools[key] : "••••••  (klik om te onderzoeken)", { fontFamily: '"Space Mono", monospace', fontSize: "12px", color: open ? "#14213d" : "#8a8470", wordWrap: { width: 470 }, lineSpacing: 3 }))
    })

    const choices: Button[] = VERDICTS.map((v, i) => button(this, x0 + 110 + i * 219, 548, 205, 44, v.label, () => this.answer(v.id), { size: 12, color: v.color }))
    choices.forEach((b) => r.add(b.container))
    r.setData("choices", choices)
  }

  private inspect(key: ToolKey) {
    if (this.locked || this.inspected.has(key)) return
    this.inspected.add(key)
    playPopupSound()
    const glass = this.add.text(300, 400, "🔍", { fontSize: "46px" }).setDepth(500)
    this.tweens.add({ targets: glass, x: 700, y: 330, angle: 25, duration: 450, ease: "Sine.easeInOut", yoyo: true, onComplete: () => { glass.destroy(); this.show() } })
  }

  private answer(pick: Verdict) {
    if (this.locked || this.ended) return
    this.locked = true
    const story = this.stories[this.index]
    const ok = pick === story.verdict
    this.answered[this.index] = ok
    if (ok) {
      const bonus = this.inspected.size >= 2 ? 25 : 0
      this.score += 100 + bonus
      this.correct += 1
      playCorrectSound()
      flash(this, COLOR.green)
      floatText(this, 620, 440, `+${100 + bonus}`, TEXT.green)
    } else {
      playErrorSound()
      shake(this)
      floatText(this, 620, 440, "FOUT", TEXT.red)
    }
    this.refresh()
    ;(this.reader.getData("choices") as Button[]).forEach((b) => b.setEnabled(false))

    const last = this.index === this.stories.length - 1
    const box = panel(this, 296, 250, 638, 290, { fill: 0x08112b, stroke: ok ? COLOR.green : COLOR.red, width: 3 })
    const head = heading(this, 316, 262, ok ? "✔ GOED ONDERZOCHT!" : "✘ BIJNA!", 30, ok ? TEXT.green : TEXT.red)
    const note = this.inspected.size === 0 ? "\n💡 Je onderzocht niets. Gebruik de tools voor je kiest." : ""
    const verdict = text(this, 316, 306, `Antwoord: ${VERDICT_NAME[story.verdict]}.\n${story.why}${note}`, 14, TEXT.main, { wordWrap: { width: 598 }, lineSpacing: 7 })
    const next = button(this, 840, 500, 170, 38, last ? "AFRONDEN →" : "VOLGENDE →", () => (last ? this.finish() : this.next()), { size: 13 })
    this.reader.add([box, head, verdict, next.container])
  }

  private next() {
    this.index += 1
    this.inspected = new Set()
    this.show()
  }

  private finish() {
    this.ended = true
    const n = this.stories.length
    const win = this.correct >= Math.ceil(n / 2)
    const stars = !win ? 0 : this.correct === n ? 3 : this.correct === n - 1 ? 2 : 1
    if (win) factBridge(this).complete("news", this.level, stars)
    showResult(this, {
      win,
      title: win ? "ONDERZOEK AFGEROND" : "NOG EVEN OEFENEN",
      lines: [`Goed beoordeeld: ${this.correct} van ${n}`, `Onderzoeksscore: ${this.score}`, win ? "Goed bezig: je keek naar bron, datum en bewijs." : "Tip: onderzoek eerst bron, schrijver, datum en bewijs."],
      stars,
      onRetry: () => goTo(this, "play", { level: this.level }),
      onMenu: () => goTo(this, "menu"),
      onNext: this.level < NEWS_LEVELS.length ? () => goTo(this, "play", { level: this.level + 1 }) : undefined,
    })
  }
}
