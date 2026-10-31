import * as Phaser from "phaser"
import { playCorrectSound, playErrorSound, playPopupSound } from "@/lib/race-audio"
import { COLOR, TEXT, W, backdrop, button, enter, flash, floatText, getBridge, goTo, heading, panel, shake, showResult, text, topBar, type Button } from "./kit"
import { PHISHING_LEVELS, type PhishMessage } from "./phishing-data"

const KIND_ICON = { mail: "✉", chat: "💬", popup: "⚠" }
const MAX_WRONG = 3

export class PhishingScene extends Phaser.Scene {
  private level = 1
  private msgs: PhishMessage[] = []
  private index = 0
  private wrong = 0
  private score = 0
  private answered: (boolean | null)[] = []
  private inspected = new Set<string>()
  private locked = false
  private reader!: Phaser.GameObjects.Container
  private listRows: Phaser.GameObjects.Container[] = []
  private hud!: Phaser.GameObjects.Text
  private ended = false

  constructor() {
    super("play")
  }

  init(data: { level?: number }) {
    this.level = data.level ?? 1
    this.msgs = PHISHING_LEVELS[this.level - 1]
    this.index = 0
    this.wrong = 0
    this.score = 0
    this.answered = this.msgs.map(() => null)
    this.inspected = new Set()
    this.locked = false
    this.ended = false
    this.listRows = []
  }

  create() {
    backdrop(this)
    enter(this)
    topBar(this, `DOSSIER ${this.level}`, "MENU", () => goTo(this, "menu"))
    this.hud = text(this, W - 20, 34, "", 15, TEXT.yellow, { align: "right" }).setOrigin(1, 0.5)

    panel(this, 16, 70, 270, 514, { fill: 0x0a1230 })
    text(this, 30, 80, "INBOX", 13, TEXT.muted)
    this.msgs.forEach((msg, i) => {
      const y = 106 + i * 74
      const row = this.add.container(26, y)
      row.add(this.add.rectangle(125, 31, 250, 66, COLOR.panel2, 1).setStrokeStyle(2, COLOR.line).setName("bg"))
      row.add(text(this, 8, 8, `${KIND_ICON[msg.kind]} ${msg.from}`, 12, TEXT.main, { fontStyle: "700", wordWrap: { width: 200 } }).setName("from"))
      row.add(text(this, 8, 32, msg.subj, 11, TEXT.muted, { wordWrap: { width: 200 }, maxLines: 2 }))
      row.add(text(this, 236, 20, "", 20, TEXT.main).setOrigin(0.5).setName("mark"))
      this.listRows.push(row)
    })

    this.reader = this.add.container(0, 0)
    this.show()
  }

  private refreshList() {
    this.listRows.forEach((row, i) => {
      const bg = row.getByName("bg") as Phaser.GameObjects.Rectangle
      const mark = row.getByName("mark") as Phaser.GameObjects.Text
      const done = this.answered[i]
      bg.setStrokeStyle(2, i === this.index ? COLOR.cyan : done === null ? COLOR.line : done ? COLOR.green : COLOR.red)
      mark.setText(done === null ? "" : done ? "✔" : "✘").setColor(done ? TEXT.green : TEXT.red)
    })
    this.hud.setText(`${"♥".repeat(MAX_WRONG - this.wrong)}${"♡".repeat(this.wrong)}   SCORE ${this.score}`)
  }

  private show() {
    this.reader.removeAll(true)
    this.refreshList()
    this.locked = false
    const msg = this.msgs[this.index]
    const r = this.reader
    const x0 = 306
    r.add(panel(this, x0, 70, 638, 514, { fill: 0x0d1736 }))
    r.add(heading(this, x0 + 20, 80, msg.subj, 26, TEXT.main).setWordWrapWidth(600))
    const meta = (label: string, value: string, y: number, key: string) => {
      r.add(text(this, x0 + 20, y, label, 12, TEXT.muted))
      const shown = this.inspected.has(key) ? value : "•••••• (onderzoek mij)"
      r.add(text(this, x0 + 110, y, shown, 13, this.inspected.has(key) ? TEXT.yellow : TEXT.muted, { wordWrap: { width: 500 } }))
    }
    r.add(text(this, x0 + 20, 126, `${KIND_ICON[msg.kind]} ${msg.from}`, 14, TEXT.cyan, { fontStyle: "700" }))
    r.add(this.add.rectangle(x0 + 319, 150, 600, 1, COLOR.line))
    r.add(text(this, x0 + 20, 162, msg.body, 15, TEXT.main, { wordWrap: { width: 596 }, lineSpacing: 6 }))

    meta("Afzender:", msg.addr, 262, "addr")
    let y = 290
    if (msg.link) {
      r.add(text(this, x0 + 20, y, `[ ${msg.link.label} ]`, 14, TEXT.cyan, { fontStyle: "700" }))
      y += 22
      meta("Link naar:", msg.link.url, y, "link")
      y += 34
    }
    if (msg.file) {
      meta("Bijlage:", msg.file, y, "file")
    }

    const tools = this.inspectButtons(msg)
    tools.forEach((b) => r.add(b.container))

    const safe = button(this, x0 + 160, 548, 250, 46, "✔ VEILIG", () => this.answer(false), { color: COLOR.green })
    const bad = button(this, x0 + 478, 548, 250, 46, "⚠ VERDACHT", () => this.answer(true), { color: COLOR.red })
    safe.container.setName("safe")
    bad.container.setName("bad")
    r.add([safe.container, bad.container])
    r.setData("choices", [safe, bad])
  }

  private inspectButtons(msg: PhishMessage): Button[] {
    const items: [string, string][] = [["🔎 Afzender", "addr"]]
    if (msg.link) items.push(["🔎 Link", "link"])
    if (msg.file) items.push(["🔎 Bijlage", "file"])
    return items.map(([label, key], i) =>
      button(this, 376 + i * 140, 492, 128, 34, label, () => {
        if (this.locked || this.inspected.has(key)) return
        this.inspected.add(key)
        playPopupSound()
        this.show()
      }, { size: 12, color: COLOR.purple }),
    )
  }

  private answer(saysBad: boolean) {
    if (this.locked || this.ended) return
    this.locked = true
    const msg = this.msgs[this.index]
    const correct = saysBad === msg.bad
    const looked = this.inspected.size > 0
    this.answered[this.index] = correct
    if (correct) {
      const gain = 100 + (looked ? 25 : 0)
      this.score += gain
      playCorrectSound()
      flash(this, COLOR.green)
      floatText(this, 620, 440, `+${gain}`, TEXT.green)
    } else {
      this.wrong += 1
      playErrorSound()
      shake(this)
      floatText(this, 620, 440, "FOUT", TEXT.red)
    }
    this.refreshList()
    const choices = this.reader.getData("choices") as Button[]
    choices.forEach((b) => b.setEnabled(false))

    const last = this.index === this.msgs.length - 1 || this.wrong >= MAX_WRONG
    const box = panel(this, 316, 240, 618, 242, { fill: 0x08112b, stroke: correct ? COLOR.green : COLOR.red, width: 3 })
    const head = heading(this, 336, 252, correct ? "✔ GOED GEZIEN!" : "✘ NIET HELEMAAL", 30, correct ? TEXT.green : TEXT.red)
    const verdict = text(this, 336, 296, `${msg.bad ? "Dit was VERDACHT." : "Dit was VEILIG."}\n${msg.why}`, 14, TEXT.main, { wordWrap: { width: 580 }, lineSpacing: 6 })
    const next = button(this, 840, 450, 160, 36, last ? "AFRONDEN →" : "VOLGENDE →", () => (last ? this.finish() : this.next()), { color: COLOR.cyan, size: 13 })
    this.reader.add([box, head, verdict, next.container])
  }

  private next() {
    this.index += 1
    this.show()
  }

  private finish() {
    this.ended = true
    const win = this.wrong < MAX_WRONG
    const stars = win ? (this.wrong === 0 ? 3 : this.wrong === 1 ? 2 : 1) : 0
    if (win) getBridge(this).complete("phishing", this.level, stars)
    showResult(this, {
      win,
      title: win ? "DOSSIER GESLOTEN" : "ZAAK MISLUKT",
      lines: [win ? "Je hebt de oplichters ontmaskerd!" : "Je maakte te veel fouten. Probeer het nog eens.", `Score: ${this.score}`, `Fouten: ${this.wrong}/${MAX_WRONG}`, win ? "Tip: bekijk altijd de echte link en afzender." : "Tip: onderzoek eerst de afzender en de link."],
      stars,
      onRetry: () => goTo(this, "play", { level: this.level }),
      onMenu: () => goTo(this, "menu"),
      onNext: this.level < PHISHING_LEVELS.length ? () => goTo(this, "play", { level: this.level + 1 }) : undefined,
    })
  }
}
