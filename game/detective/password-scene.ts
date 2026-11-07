import * as Phaser from "phaser"
import { playCorrectSound, playErrorSound, playPopupSound } from "@/lib/race-audio"
import { COLOR, TEXT, W, backdrop, button, enter, flash, floatText, getBridge, goTo, heading, panel, shake, showResult, text, topBar, type Button } from "./kit"
import { BUILDER_RULES, BUILDER_TILES, CAESAR_ROUNDS, CHOICE_LEVELS } from "./password-data"

const MAX_STRIKES = 3
const AX = 276

type Mind = { digits: number; min: number; max: number; attempts: number }
const MIND: Record<number, Mind> = { 6: { digits: 3, min: 1, max: 6, attempts: 10 }, 8: { digits: 4, min: 0, max: 9, attempts: 12 } }

export class PasswordScene extends Phaser.Scene {
  private level = 1
  private strikes = 0
  private ended = false
  private area!: Phaser.GameObjects.Container
  private lock!: Phaser.GameObjects.Container
  private lockGfx!: Phaser.GameObjects.Graphics
  private strikeText!: Phaser.GameObjects.Text
  private keyHandler?: (event: KeyboardEvent) => void

  constructor() {
    super("play")
  }

  init(data: { level?: number }) {
    this.level = data.level ?? 1
    this.strikes = 0
    this.ended = false
  }

  create() {
    backdrop(this)
    enter(this)
    topBar(this, `TERMINAL ${this.level}`, "MENU", () => goTo(this, "menu"))
    this.strikeText = text(this, W - 20, 34, "", 16, TEXT.red).setOrigin(1, 0.5)
    panel(this, 16, 70, 244, 514, { fill: 0x0a1230 })
    this.lockGfx = this.add.graphics()
    this.lock = this.add.container(138, 270, [this.lockGfx])
    this.drawLock("locked")
    this.area = this.add.container(0, 0)
    this.events.once("shutdown", () => this.removeKeys())
    this.refreshStrikes()
    this.startLevel()
  }

  private drawLock(state: "locked" | "error" | "open") {
    const g = this.lockGfx
    const color = state === "open" ? COLOR.green : state === "error" ? COLOR.red : COLOR.yellow
    g.clear()
    g.lineStyle(14, color, 1)
    g.beginPath()
    if (state === "open") {
      g.arc(26, -70, 42, Math.PI, Math.PI * 2, false)
      g.lineTo(68, -50)
    } else {
      g.arc(0, -30, 42, Math.PI, Math.PI * 2, false)
      g.lineTo(42, -10)
    }
    g.strokePath()
    if (state !== "open") g.lineBetween(-42, -30, -42, -10)
    g.fillStyle(color, 0.25)
    g.fillRoundedRect(-70, -10, 140, 110, 16)
    g.lineStyle(4, color, 1)
    g.strokeRoundedRect(-70, -10, 140, 110, 16)
    g.fillStyle(color, 1)
    g.fillCircle(0, 40, 12)
    g.fillRect(-4, 44, 8, 26)
  }

  private refreshStrikes() {
    if (this.level === 6 || this.level === 8) {
      this.strikeText.setText("")
      return
    }
    this.strikeText.setText(`ALARM ${"●".repeat(this.strikes)}${"○".repeat(MAX_STRIKES - this.strikes)}`)
  }

  private clearArea() {
    this.removeKeys()
    this.area.destroy(true)
    this.area = this.add.container(0, 0)
  }

  private removeKeys() {
    if (this.keyHandler) {
      this.input.keyboard?.off("keydown", this.keyHandler)
      this.keyHandler = undefined
    }
  }

  private startLevel() {
    if (CHOICE_LEVELS[this.level]) this.choiceRound(0)
    else if (this.level === 4) this.caesarRound(0)
    else if (this.level === 7) this.builder()
    else this.mastermind(MIND[this.level])
  }

  private fail() {
    this.strikes += 1
    this.refreshStrikes()
    this.drawLock("error")
    playErrorSound()
    shake(this)
    this.tweens.add({ targets: this.lock, x: this.lock.x + 8, duration: 50, yoyo: true, repeat: 4, onComplete: () => this.lock.setX(138) })
    this.time.delayedCall(500, () => !this.ended && this.drawLock("locked"))
    if (this.strikes >= MAX_STRIKES) {
      this.time.delayedCall(700, () => this.lose("Het alarm gaat af! Je maakte te veel fouten."))
      return true
    }
    return false
  }

  private good() {
    playCorrectSound()
    flash(this, COLOR.green)
  }

  private lose(reason: string) {
    if (this.ended) return
    this.ended = true
    this.drawLock("error")
    showResult(this, {
      win: false,
      title: "ALARM!",
      lines: [reason, "Probeer het opnieuw, hacker in opleiding."],
      onRetry: () => goTo(this, "play", { level: this.level }),
      onMenu: () => goTo(this, "menu"),
    })
  }

  private win(stars: number, lines: string[]) {
    this.ended = true
    this.drawLock("open")
    playPopupSound()
    getBridge(this).complete("password", this.level, stars)
    this.time.delayedCall(700, () =>
      showResult(this, {
        win: true,
        title: "SLOT OPEN!",
        lines,
        stars,
        onRetry: () => goTo(this, "play", { level: this.level }),
        onMenu: () => goTo(this, "menu"),
        onNext: this.level < 8 ? () => goTo(this, "play", { level: this.level + 1 }) : undefined,
      }),
    )
  }

  private strikeStars() {
    return this.strikes === 0 ? 3 : this.strikes === 1 ? 2 : 1
  }

  private header(title: string, intro: string) {
    this.area.add(heading(this, AX, 72, title.toUpperCase(), 32, TEXT.yellow))
    this.area.add(text(this, AX, 114, intro, 13, TEXT.muted, { wordWrap: { width: 660 }, lineSpacing: 5 }))
  }

  // Levels 1, 2, 3 and 5 share one question flow.
  private choiceRound(i: number) {
    const data = CHOICE_LEVELS[this.level]
    const round = data.rounds[i]
    this.clearArea()
    this.header(data.title, data.intro)
    this.area.add(text(this, AX, 160, `${i + 1} / ${data.rounds.length}`, 13, TEXT.cyan))
    this.area.add(text(this, AX, 186, round.q, this.level === 2 ? 28 : 18, TEXT.main, { fontStyle: "700", wordWrap: { width: 660 }, lineSpacing: 6 }))
    const two = round.options.length === 2
    const buttons: Button[] = []
    round.options.forEach((option, k) => {
      const b = button(this, two ? AX + 170 + k * 340 : AX + 330, two ? 330 : 290 + k * 62, two ? 300 : 660, 50, option, () => {
        buttons.forEach((x) => x.setEnabled(false))
        const ok = k === round.answer
        b.setColor(ok ? COLOR.green : COLOR.red)
        if (ok) this.good()
        const dead = ok ? false : this.fail()
        this.area.add(text(this, AX, 450, `${ok ? "✔ Juist!" : "✘ Niet goed."} ${round.explain}`, 14, ok ? TEXT.green : TEXT.red, { wordWrap: { width: 660 }, lineSpacing: 6 }))
        if (dead) return
        const last = i === data.rounds.length - 1
        const go = button(this, 850, 540, 170, 36, last ? "OPEN SLOT →" : "VOLGENDE →", () => (last ? this.win(this.strikeStars(), [data.title, `Alarmfouten: ${this.strikes}`, "Sterke wachtwoorden zijn lang en persoonlijk onvoorspelbaar."]) : this.choiceRound(i + 1)), { size: 13 })
        this.area.add(go.container)
      }, { size: two ? 18 : 14 })
      buttons.push(b)
      this.area.add(b.container)
    })
  }

  private caesarRound(i: number) {
    const round = CAESAR_ROUNDS[i]
    const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const shift = (s: string, n: number) => [...s].map((c) => A[(A.indexOf(c) + n + 26) % 26]).join("")
    const cipher = shift(round.plain, round.shift)
    let dial = 0
    this.clearArea()
    this.header("Geheime code", "Elke letter is een aantal plekken verschoven in het alfabet (Caesar-code). Draai aan het rad tot je het echte woord leest.")
    this.area.add(text(this, AX, 170, `CODE ${i + 1} / ${CAESAR_ROUNDS.length}`, 13, TEXT.cyan))
    this.area.add(text(this, AX + 330, 230, cipher, 46, TEXT.pink, { fontStyle: "700", letterSpacing: 8 }).setOrigin(0.5))
    const out = text(this, AX + 330, 330, shift(cipher, -dial), 46, TEXT.green, { fontStyle: "700", letterSpacing: 8 }).setOrigin(0.5)
    const dialText = heading(this, AX + 330, 410, "", 32, TEXT.yellow).setOrigin(0.5)
    this.area.add([out, dialText])
    const update = () => {
      out.setText(shift(cipher, -dial))
      dialText.setText(`SHIFT ${dial}`)
    }
    update()
    const prev = button(this, AX + 200, 410, 70, 44, "◄", () => { dial = (dial + 25) % 26; update() }, { size: 20, color: COLOR.purple })
    const next = button(this, AX + 460, 410, 70, 44, "►", () => { dial = (dial + 1) % 26; update() }, { size: 20, color: COLOR.purple })
    const check = button(this, AX + 330, 500, 220, 46, "CONTROLEER", () => {
      if (shift(cipher, -dial) === round.plain) {
        check.setEnabled(false)
        this.good()
        floatText(this, AX + 330, 280, "✔ " + round.plain, TEXT.green)
        if (i === CAESAR_ROUNDS.length - 1) this.win(this.strikeStars(), ["Je kraakte de Caesar-code!", `Alarmfouten: ${this.strikes}`, "Zo'n simpele code is in een paar seconden te kraken."])
        else this.time.delayedCall(700, () => this.caesarRound(i + 1))
      } else {
        floatText(this, AX + 330, 280, "Nog niet", TEXT.red)
        this.fail()
      }
    }, { color: COLOR.green })
    this.area.add([prev.container, next.container, check.container])
  }

  private builder() {
    let value = ""
    this.clearArea()
    this.header("Sterk wachtwoord", "Bouw een fictief wachtwoord met de tegels. Voldoe aan alle eisen en druk op CONTROLEER.")
    const display = text(this, AX + 330, 190, "", 26, TEXT.cyan, { fontStyle: "700" }).setOrigin(0.5)
    const meter = this.add.graphics()
    const rules = BUILDER_RULES.map((rule, i) => text(this, AX + 20, 240 + i * 26, "", 14, TEXT.muted).setData("i", i))
    this.area.add([display, meter, ...rules])
    const update = () => {
      display.setText(value || "(leeg)")
      const met = BUILDER_RULES.filter((r) => r.test(value)).length
      meter.clear()
      meter.fillStyle(0x14234d, 1)
      meter.fillRoundedRect(AX + 20, 388, 620, 14, 7)
      meter.fillStyle(met === BUILDER_RULES.length ? COLOR.green : met >= 3 ? COLOR.yellow : COLOR.red, 1)
      meter.fillRoundedRect(AX + 20, 388, (620 * met) / BUILDER_RULES.length, 14, 7)
      rules.forEach((t, i) => {
        const ok = value.length > 0 && BUILDER_RULES[i].test(value)
        t.setText(`${ok ? "✔" : "✘"} ${BUILDER_RULES[i].label}`).setColor(ok ? TEXT.green : TEXT.muted)
      })
    }
    update()
    BUILDER_TILES.forEach((tile, i) => {
      const b = button(this, AX + 54 + (i % 6) * 106, 436 + Math.floor(i / 6) * 46, 100, 38, tile, () => {
        if (value.length < 40) value += tile
        playPopupSound()
        update()
      }, { size: 13, color: COLOR.purple })
      this.area.add(b.container)
    })
    const clear = button(this, AX + 130, 548, 190, 38, "WISSEN", () => { value = ""; update() }, { size: 13, color: COLOR.yellow })
    const check = button(this, AX + 530, 548, 220, 38, "CONTROLEER", () => {
      if (BUILDER_RULES.every((r) => r.test(value))) {
        this.good()
        this.win(this.strikeStars(), ["Dat is een sterk wachtwoord!", `Alarmfouten: ${this.strikes}`, "Gebruik lange combinaties en niets persoonlijks."])
      } else {
        floatText(this, AX + 330, 220, "Nog niet sterk genoeg", TEXT.red, 24)
        this.fail()
      }
    }, { size: 13, color: COLOR.green })
    this.area.add([clear.container, check.container])
  }

  private mastermind(cfg: Mind) {
    const pool: number[] = []
    for (let d = cfg.min; d <= cfg.max; d += 1) pool.push(d)
    const secret = Phaser.Utils.Array.Shuffle([...pool]).slice(0, cfg.digits)
    const history: { guess: number[]; exact: number; near: number }[] = []
    let current: number[] = []
    this.clearArea()
    this.header(cfg.digits === 3 ? "Pincode kraken" : "De kluis", `Raad de code van ${cfg.digits} verschillende cijfers (${cfg.min}-${cfg.max}). 🟢 = juiste plek, 🟡 = andere plek. Gebruik elke poging om cijfers uit te sluiten. Je hebt ${cfg.attempts} pogingen.`)
    const display = text(this, AX + 40, 190, "", 40, TEXT.cyan, { fontStyle: "700", letterSpacing: 10 })
    const attempts = text(this, AX + 40, 250, "", 14, TEXT.yellow)
    const log = text(this, AX + 380, 150, "", 14, TEXT.main, { lineSpacing: 8 })
    this.area.add([display, attempts, log])
    const refresh = () => {
      display.setText([...Array(cfg.digits).keys()].map((k) => (current[k] === undefined ? "_" : String(current[k]))).join(" "))
      attempts.setText(`Poging ${Math.min(history.length + 1, cfg.attempts)} / ${cfg.attempts}`)
      log.setText(history.map((h) => `${h.guess.join(" ")}   🟢${h.exact}  🟡${h.near}`).join("\n"))
    }
    refresh()

    const press = (d: number) => {
      if (this.ended || current.length >= cfg.digits || current.includes(d)) return
      current.push(d)
      refresh()
    }
    const back = () => { current.pop(); refresh() }
    const submit = () => {
      if (this.ended || current.length < cfg.digits) return
      const exact = current.filter((d, k) => d === secret[k]).length
      const near = current.filter((d, k) => d !== secret[k] && secret.includes(d)).length
      history.push({ guess: [...current], exact, near })
      current = []
      refresh()
      if (exact === cfg.digits) {
        this.good()
        const used = history.length
        const stars = used <= cfg.attempts / 2 ? 3 : used <= (cfg.attempts * 3) / 4 ? 2 : 1
        this.win(stars, [`Code gekraakt: ${secret.join(" ")}`, `Pogingen: ${used}/${cfg.attempts}`, "Je gebruikte logica, geen geluk. Een pincode van 4 cijfers is toch al lastig!"])
      } else if (history.length >= cfg.attempts) {
        this.fail()
        this.lose(`Je pogingen zijn op. De code was ${secret.join(" ")}.`)
      } else {
        playPopupSound()
      }
    }

    pool.forEach((d, i) => {
      const cols = 5
      const b = button(this, AX + 70 + (i % cols) * 80, 330 + Math.floor(i / cols) * 56, 70, 46, String(d), () => press(d), { size: 18, color: COLOR.purple })
      this.area.add(b.container)
    })
    const del = button(this, AX + 90, 520, 150, 40, "⌫ WIS", back, { size: 13, color: COLOR.yellow })
    const ok = button(this, AX + 290, 520, 190, 40, "PROBEER", submit, { size: 13, color: COLOR.green })
    this.area.add([del.container, ok.container])

    this.keyHandler = (event: KeyboardEvent) => {
      if (event.key >= "0" && event.key <= "9") {
        const d = Number(event.key)
        if (d >= cfg.min && d <= cfg.max) press(d)
      } else if (event.key === "Backspace") back()
      else if (event.key === "Enter") submit()
    }
    this.input.keyboard?.on("keydown", this.keyHandler)
  }
}
