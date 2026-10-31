import * as Phaser from "phaser"
import { playCorrectSound, playErrorSound, playPopupSound } from "@/lib/race-audio"
import { COLOR, TEXT, W, backdrop, button, enter, floatText, goTo, heading, panel, shake, showResult, text, topBar } from "@/game/detective/kit"
import { labBridge } from "./shared"
import { HUMAN_LEVELS, HUMAN_NOTE, type Origin, type Piece } from "./human-data"

type Pick = Origin | "unknown"
type Answer = { pick: Pick; points: number }

const KIND_ICON: Record<string, string> = { Gedicht: "📜", Verhaaltje: "📖", Verhaal: "📖", Tekst: "📝", Tekening: "🎨", Mop: "😄", Nieuwsbericht: "📰", Beschrijving: "🖼️", Uitleg: "💡" }
const MAX_POINTS = 100

// Points: a clear case rewards the right origin; an undecidable case rewards honest uncertainty.
export function scoreAnswer(piece: Piece, pick: Pick) {
  if (piece.tellable) return pick === piece.origin ? 100 : pick === "unknown" ? 30 : 0
  return pick === "unknown" ? 100 : pick === piece.origin ? 50 : 0
}

export class HumanScene extends Phaser.Scene {
  private level = 1
  private pieces: Piece[] = []
  private answers: (Answer | null)[] = []
  private current = 0
  private ended = false
  private gallery!: Phaser.GameObjects.Container
  private view!: Phaser.GameObjects.Container
  private hud!: Phaser.GameObjects.Text

  constructor() {
    super("play")
  }

  init(data: { level?: number }) {
    this.level = data.level ?? 1
    this.pieces = HUMAN_LEVELS[this.level - 1]
    this.answers = this.pieces.map(() => null)
    this.current = 0
    this.ended = false
  }

  create() {
    backdrop(this)
    enter(this)
    topBar(this, `GALERIJ ${this.level}`, "MENU", () => goTo(this, "menu"))
    this.hud = text(this, W - 20, 34, "", 15, TEXT.yellow).setOrigin(1, 0.5)
    text(this, W / 2, 586, HUMAN_NOTE + " Een goede onderzoeker blijft kritisch: AI en mensen kunnen hetzelfde maken.", 11, TEXT.muted).setOrigin(0.5)
    this.gallery = this.add.container(0, 0)
    this.view = this.add.container(0, 0)
    this.drawGallery()
    this.drawView()
  }

  private score() {
    return this.answers.reduce((sum, a) => sum + (a?.points ?? 0), 0)
  }

  private drawGallery() {
    this.gallery.removeAll(true)
    const cw = 172
    this.pieces.forEach((piece, i) => {
      const x = 24 + i * (cw + 13)
      const done = this.answers[i]
      const open = i === this.current
      this.gallery.add(panel(this, x, 70, cw, 84, { fill: open ? 0x14305e : COLOR.panel, stroke: open ? COLOR.cyan : done ? COLOR.green : COLOR.line, width: open ? 3 : 2 }))
      this.gallery.add(text(this, x + 12, 80, `${KIND_ICON[piece.kind] ?? "📄"} ${piece.kind}`, 13, TEXT.cyan, { fontStyle: "700" }))
      this.gallery.add(text(this, x + 12, 104, piece.title, 12, TEXT.main, { wordWrap: { width: cw - 24 } }))
      this.gallery.add(text(this, x + cw - 12, 132, done ? (done.points > 0 ? "✔" : "✘") : "●", 14, done ? (done.points > 0 ? TEXT.green : TEXT.red) : TEXT.yellow).setOrigin(1, 0))
      const zone = this.add.zone(x + cw / 2, 112, cw, 84).setInteractive({ useHandCursor: true })
      zone.on("pointerdown", () => {
        if (this.ended) return
        playPopupSound()
        this.current = i
        this.drawGallery()
        this.drawView()
      })
      this.gallery.add(zone)
    })
    const doneCount = this.answers.filter(Boolean).length
    this.hud.setText(`SCORE ${this.score()}   ${doneCount}/${this.pieces.length}`)
  }

  private drawView() {
    this.view.removeAll(true)
    const v = this.view
    const piece = this.pieces[this.current]
    const answer = this.answers[this.current]
    v.add(panel(this, 24, 168, 560, 396, { stroke: COLOR.purple }))
    v.add(text(this, 44, 182, `${KIND_ICON[piece.kind] ?? "📄"} ${piece.kind.toUpperCase()}  ·  FICTIEF VOORBEELD`, 12, TEXT.muted))
    v.add(heading(this, 44, 204, piece.title, 26, TEXT.cyan))
    let y = 250
    if (piece.art) {
      v.add(text(this, 304, y + 30, piece.art, 44, TEXT.main, { align: "center", lineSpacing: 6 }).setOrigin(0.5, 0))
      y += 140
    }
    v.add(text(this, 44, y, piece.body, 17, TEXT.main, { wordWrap: { width: 520 }, lineSpacing: 8, fontFamily: 'Georgia, "Times New Roman", serif' }))

    v.add(panel(this, 600, 168, 336, 396, { stroke: answer ? (answer.points > 0 ? COLOR.green : COLOR.red) : COLOR.cyan }))
    if (!answer) {
      v.add(heading(this, 768, 198, "WIE MAAKTE DIT?", 22, TEXT.cyan).setOrigin(0.5))
      v.add(text(this, 768, 232, "Kijk goed naar het voorbeeld en kies.", 13, TEXT.muted, { align: "center", wordWrap: { width: 300 } }).setOrigin(0.5, 0))
      v.add(button(this, 768, 300, 290, 54, "🤖 GEMAAKT DOOR AI", () => this.decide("ai"), { color: COLOR.purple }).container)
      v.add(button(this, 768, 370, 290, 54, "🧑 GEMAAKT DOOR EEN MENS", () => this.decide("human"), { color: COLOR.green }).container)
      v.add(button(this, 768, 440, 290, 54, "❓ DAT KAN IK NIET WETEN", () => this.decide("unknown"), { color: COLOR.yellow }).container)
      v.add(text(this, 768, 500, "Soms is 'weet ik niet' het slimste antwoord.", 12, TEXT.muted, { align: "center", wordWrap: { width: 290 } }).setOrigin(0.5, 0))
    } else {
      this.drawReveal(piece, answer)
    }
  }

  private drawReveal(piece: Piece, answer: Answer) {
    const v = this.view
    const good = answer.points > 0
    v.add(heading(this, 768, 192, answer.points >= MAX_POINTS ? "SCHERP!" : good ? "DEELS GOED" : "NIET GOED", 24, good ? TEXT.green : TEXT.red).setOrigin(0.5))
    const origin = piece.origin === "ai" ? "🤖 een AI" : "🧑 een mens"
    const verdict = piece.tellable ? "Met aanwijzingen te vermoeden" : "Niet te zien aan de inhoud zelf"
    const pickText = answer.pick === "unknown" ? "Jij zei: dat kan ik niet weten." : `Jij zei: ${answer.pick === "ai" ? "AI" : "mens"}.`
    const body = `In dit voorbeeld gemaakt door: ${origin}.\n${pickText} +${answer.points} punten\n\n${verdict}.\n\nAanwijzing: ${piece.clues}\n\n${piece.why}`
    v.add(text(this, 616, 218, body, 13, TEXT.main, { wordWrap: { width: 304 }, lineSpacing: 5 }))
    const allDone = this.answers.every(Boolean)
    if (allDone) v.add(button(this, 768, 534, 290, 40, "AFRONDEN →", () => this.finish(), { color: COLOR.green, size: 14 }).container)
    else v.add(button(this, 768, 534, 290, 40, "VOLGENDE VOORBEELD →", () => this.goNext(), { color: COLOR.cyan, size: 14 }).container)
  }

  private goNext() {
    const next = this.answers.findIndex((a, i) => !a && i !== this.current)
    if (next >= 0) {
      this.current = next
      this.drawGallery()
      this.drawView()
    }
  }

  private decide(pick: Pick) {
    if (this.ended || this.answers[this.current]) return
    const piece = this.pieces[this.current]
    const points = scoreAnswer(piece, pick)
    this.answers[this.current] = { pick, points }
    if (points > 0) playCorrectSound()
    else {
      playErrorSound()
      shake(this, 0.003)
    }
    floatText(this, 768, 300, points ? `+${points}` : "0", points ? TEXT.green : TEXT.red, 40)
    this.drawGallery()
    this.drawView()
  }

  private finish() {
    this.ended = true
    const total = this.pieces.length * MAX_POINTS
    const score = this.score()
    const ratio = score / total
    const win = ratio >= 0.4
    const stars = ratio >= 0.8 ? 3 : ratio >= 0.6 ? 2 : win ? 1 : 0
    if (win) labBridge(this).complete("human", this.level, stars)
    const honest = this.pieces.filter((p, i) => !p.tellable && this.answers[i]?.pick === "unknown").length
    showResult(this, {
      win,
      title: win ? "ONDERZOEK KLAAR" : "NOG EEN KEER KIJKEN",
      lines: [
        `Score: ${score} van ${total}`,
        `Je erkende ${honest}x eerlijk dat je het niet kon weten.`,
        "Leerpunt: AI en mensen kunnen bijna hetzelfde maken. Aan het uiterlijk zie je het niet altijd.",
        "Controleer liever de bron, de maker of het bewijs.",
      ],
      stars,
      onRetry: () => goTo(this, "play", { level: this.level }),
      onMenu: () => goTo(this, "menu"),
      onNext: this.level < HUMAN_LEVELS.length ? () => goTo(this, "play", { level: this.level + 1 }) : undefined,
    })
  }
}
