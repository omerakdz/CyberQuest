import * as Phaser from "phaser"
import { playCorrectSound, playErrorSound, playPopupSound } from "@/lib/race-audio"
import { COLOR, TEXT, W, backdrop, button, enter, flash, floatText, getBridge, goTo, heading, panel, shake, showResult, text, topBar, type Button } from "./kit"
import { MYSTERIES, type Mystery } from "./crime-data"

const MAX_WRONG = 3

export class CrimeScene extends Phaser.Scene {
  private level = 1
  private mystery!: Mystery
  private layer!: Phaser.GameObjects.Container
  private found = new Set<string>()
  private linked = new Set<number>()
  private selected: string | null = null
  private wrong = 0
  private hints = 0
  private info!: Phaser.GameObjects.Text
  private infoTitle!: Phaser.GameObjects.Text
  private cards = new Map<string, Phaser.GameObjects.Container>()
  private board!: Phaser.GameObjects.Container
  private deductions!: Phaser.GameObjects.Text
  private solve!: Button
  private counter!: Phaser.GameObjects.Text
  private tiles = new Map<string, Phaser.GameObjects.Container>()
  private ended = false

  constructor() {
    super("play")
  }

  init(data: { level?: number }) {
    this.level = data.level ?? 1
    this.mystery = MYSTERIES[this.level - 1]
    this.found = new Set()
    this.linked = new Set()
    this.selected = null
    this.wrong = 0
    this.hints = 0
    this.cards = new Map()
    this.tiles = new Map()
    this.ended = false
  }

  create() {
    backdrop(this)
    enter(this)
    topBar(this, `ZAAK ${this.level}: ${this.mystery.title.toUpperCase()}`, "MENU", () => goTo(this, "menu"))
    this.layer = this.add.container(0, 0)
    this.buildInvestigation()
  }

  private buildInvestigation() {
    const m = this.mystery
    const L = this.layer
    L.add(text(this, 20, 64, m.intro, 12, TEXT.muted, { wordWrap: { width: 550 } }))

    m.objects.forEach((obj, i) => {
      const x = 16 + (i % 3) * 186
      const y = 108 + Math.floor(i / 3) * 124
      const tile = this.add.container(x, y)
      const bg = this.add.rectangle(88, 52, 176, 112, COLOR.panel2).setStrokeStyle(2, COLOR.line)
      const icon = text(this, 88, 40, obj.icon, 38).setOrigin(0.5)
      const label = text(this, 88, 88, obj.label, 13, TEXT.main, { fontStyle: "700" }).setOrigin(0.5)
      const done = text(this, 160, 12, "", 16, TEXT.green).setOrigin(0.5)
      bg.setInteractive({ useHandCursor: true })
      bg.on("pointerover", () => bg.setStrokeStyle(2, COLOR.cyan))
      bg.on("pointerout", () => bg.setStrokeStyle(2, this.found.has(obj.id) ? COLOR.green : COLOR.line))
      bg.on("pointerdown", () => this.inspect(obj.id, done, bg))
      tile.add([bg, icon, label, done])
      this.tiles.set(obj.id, tile)
      L.add(tile)
    })

    L.add(panel(this, 16, 362, 556, 222, { fill: 0x08112b }))
    this.infoTitle = heading(this, 32, 370, "ONDERZOEK", 20, TEXT.cyan)
    this.info = text(this, 32, 400, "Klik op de objecten om sporen te vinden. Verbind daarna bewijs op het bord.", 14, TEXT.main, { wordWrap: { width: 520 }, lineSpacing: 6 })
    L.add([this.infoTitle, this.info])

    const hint = button(this, 90, 560, 130, 34, "💡 HINT", () => this.hint(), { size: 13, color: COLOR.yellow })
    this.solve = button(this, 470, 560, 180, 34, "OPLOSSEN →", () => this.startQuestions(), { size: 13, color: COLOR.green })
    this.solve.setEnabled(false)
    L.add([hint.container, this.solve.container])

    L.add(panel(this, 588, 64, 356, 520, { fill: 0x0d1736 }))
    L.add(heading(this, 604, 70, "BEWIJSBORD", 20, TEXT.purple))
    this.counter = text(this, 928, 78, "", 12, TEXT.muted).setOrigin(1, 0)
    L.add(this.counter)
    L.add(text(this, 604, 100, "Kies twee kaarten die bij elkaar horen.", 11, TEXT.muted))
    this.board = this.add.container(0, 0)
    L.add(this.board)
    this.deductions = text(this, 604, 390, "", 11, TEXT.yellow, { wordWrap: { width: 326 }, lineSpacing: 4 })
    L.add(this.deductions)
    this.updateBoard()
  }

  private inspect(id: string, mark: Phaser.GameObjects.Text, bg: Phaser.GameObjects.Rectangle) {
    if (this.ended) return
    const obj = this.mystery.objects.find((o) => o.id === id)!
    const first = !this.found.has(id)
    this.found.add(id)
    this.infoTitle.setText(`${obj.icon} ${obj.label.toUpperCase()}`).setColor(TEXT.cyan)
    this.info.setText(obj.clue)
    if (first) {
      playPopupSound()
      mark.setText("✔")
      bg.setStrokeStyle(2, COLOR.green)
      floatText(this, 300, 340, "BEWIJS GEVONDEN", TEXT.cyan, 22)
      this.updateBoard()
    }
  }

  private updateBoard() {
    const clues = this.mystery.clues.filter((c) => this.found.has(c.id))
    this.board.removeAll(true)
    this.cards.clear()
    clues.forEach((clue, i) => {
      const y = 116 + i * 44
      const card = this.add.container(600, y)
      const bg = this.add.rectangle(166, 18, 332, 38, COLOR.panel2).setStrokeStyle(2, this.selected === clue.id ? COLOR.yellow : this.isLinked(clue.id) ? COLOR.green : COLOR.line)
      const label = text(this, 10, 18, clue.text, 12, TEXT.main, { wordWrap: { width: 310 } }).setOrigin(0, 0.5)
      bg.setInteractive({ useHandCursor: true })
      bg.on("pointerdown", () => this.pick(clue.id))
      card.add([bg, label])
      this.board.add(card)
      this.cards.set(clue.id, card)
    })
    this.counter.setText(`BEWIJS ${this.found.size}/${this.mystery.objects.length}   LINKS ${this.linked.size}/${this.mystery.links.length}   ✘ ${this.wrong}/${MAX_WRONG}`)
    this.deductions.setText([...this.linked].map((i) => `▸ ${this.mystery.links[i].deduction}`).join("\n"))
    const ready = this.found.size === this.mystery.objects.length && this.linked.size === this.mystery.links.length
    this.solve.setEnabled(ready)
  }

  private isLinked(id: string) {
    return [...this.linked].some((i) => this.mystery.links[i].a === id || this.mystery.links[i].b === id)
  }

  private pick(id: string) {
    if (this.ended) return
    if (this.selected === null) {
      this.selected = id
      this.updateBoard()
      return
    }
    if (this.selected === id) {
      this.selected = null
      this.updateBoard()
      return
    }
    const a = this.selected
    this.selected = null
    const idx = this.mystery.links.findIndex((l) => (l.a === a && l.b === id) || (l.a === id && l.b === a))
    if (idx >= 0 && !this.linked.has(idx)) {
      this.linked.add(idx)
      playCorrectSound()
      flash(this, COLOR.green)
      this.infoTitle.setText("🔗 CONCLUSIE").setColor(TEXT.green)
      this.info.setText(this.mystery.links[idx].deduction)
    } else if (idx >= 0) {
      this.infoTitle.setText("AL VERBONDEN").setColor(TEXT.yellow)
      this.info.setText("Deze link heb je al gelegd.")
    } else {
      this.wrong += 1
      playErrorSound()
      shake(this)
      this.infoTitle.setText("GEEN VERBAND").setColor(TEXT.red)
      this.info.setText("Deze twee aanwijzingen horen niet direct bij elkaar. Denk aan tijd, plaats en persoon.")
      if (this.wrong >= MAX_WRONG) {
        this.updateBoard()
        this.lose("Je legde te veel foute verbanden.")
        return
      }
    }
    this.updateBoard()
  }

  private hint() {
    if (this.ended) return
    this.hints += 1
    const missing = this.mystery.objects.find((o) => !this.found.has(o.id))
    if (missing) {
      const tile = this.tiles.get(missing.id)!
      this.tweens.add({ targets: tile, scale: 1.12, duration: 220, yoyo: true, repeat: 3 })
      this.infoTitle.setText("💡 HINT").setColor(TEXT.yellow)
      this.info.setText(`Je hebt nog niet alles onderzocht. Kijk eens bij: ${missing.label}.`)
      return
    }
    const link = this.mystery.links.find((_, i) => !this.linked.has(i))
    if (link) {
      const a = this.mystery.clues.find((c) => c.id === link.a)!
      this.infoTitle.setText("💡 HINT").setColor(TEXT.yellow)
      this.info.setText(`Probeer de kaart '${a.text}' te verbinden met een andere kaart.`)
      this.tweens.add({ targets: this.cards.get(a.id), alpha: 0.3, duration: 200, yoyo: true, repeat: 3 })
    }
  }

  private lose(reason: string) {
    this.ended = true
    showResult(this, {
      win: false,
      title: "ZAAK GESLOTEN ZONDER BEWIJS",
      lines: [reason, "Onderzoek rustig en kijk naar tijdstippen."],
      onRetry: () => goTo(this, "play", { level: this.level }),
      onMenu: () => goTo(this, "menu"),
    })
  }

  private startQuestions() {
    this.layer.destroy(true)
    this.layer = this.add.container(0, 0)
    this.askQuestion(0, 0)
  }

  private askQuestion(i: number, wrong: number) {
    const m = this.mystery
    const q = m.questions[i]
    const L = this.layer
    L.removeAll(true)
    L.add(panel(this, 80, 80, 800, 480, { fill: 0x0d1736 }))
    L.add(heading(this, 110, 96, `VRAAG ${i + 1} / ${m.questions.length}`, 24, TEXT.purple))
    L.add(text(this, 850, 104, `Fouten ${wrong}/${MAX_WRONG}`, 13, TEXT.red).setOrigin(1, 0))
    L.add(text(this, 110, 150, q.q, 20, TEXT.main, { fontStyle: "700", wordWrap: { width: 740 } }))
    const buttons: Button[] = []
    q.options.forEach((opt, k) => {
      const b = button(this, W / 2, 240 + k * 64, 700, 50, opt, () => {
        buttons.forEach((x) => x.setEnabled(false))
        const ok = k === q.answer
        const nextWrong = ok ? wrong : wrong + 1
        if (ok) {
          playCorrectSound()
          flash(this, COLOR.green)
        } else {
          playErrorSound()
          shake(this)
        }
        b.setColor(ok ? COLOR.green : COLOR.red)
        L.add(text(this, 110, 450, `${ok ? "✔ Juist!" : "✘ Helaas."} ${q.explain}`, 14, ok ? TEXT.green : TEXT.red, { wordWrap: { width: 740 }, lineSpacing: 6 }))
        const last = i === m.questions.length - 1 || nextWrong >= MAX_WRONG
        const go = button(this, 770, 530, 170, 36, last ? "AFRONDEN →" : "VOLGENDE →", () => (last ? this.conclude(nextWrong) : this.askQuestion(i + 1, nextWrong)), { size: 13 })
        L.add(go.container)
      }, { size: 15 })
      buttons.push(b)
      L.add(b.container)
    })
  }

  private conclude(wrong: number) {
    if (wrong >= MAX_WRONG) {
      this.lose("Je trok te veel verkeerde conclusies.")
      return
    }
    this.ended = true
    const stars = wrong === 0 && this.wrong === 0 ? 3 : wrong + this.wrong <= 2 ? 2 : 1
    getBridge(this).complete("crime", this.level, stars)
    showResult(this, {
      win: true,
      title: "ZAAK OPGELOST!",
      lines: [`Goed speurwerk, detective!`, `Fouten op het bord: ${this.wrong}`, `Foute antwoorden: ${wrong}`, `Hints gebruikt: ${this.hints}`],
      stars,
      onRetry: () => goTo(this, "play", { level: this.level }),
      onMenu: () => goTo(this, "menu"),
      onNext: this.level < MYSTERIES.length ? () => goTo(this, "play", { level: this.level + 1 }) : undefined,
    })
  }
}
