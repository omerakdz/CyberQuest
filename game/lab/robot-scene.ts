import * as Phaser from "phaser"
import { playCorrectSound, playErrorSound, playPopupSound } from "@/lib/race-audio"
import { COLOR, TEXT, W, backdrop, button, enter, floatText, goTo, heading, panel, shake, showResult, text, topBar, type Button } from "@/game/detective/kit"
import { labBridge } from "./shared"
import { ROBOT_LEVELS } from "./robot-data"
import { DIRS, simulate, type Block, type RobotLevel, type Step } from "./robot-sim"

const GX = 24
const GY = 84
const GW = 580
const GH = 300
const BLOCK_LABEL: Record<Block, string> = { F: "⬆ VOORUIT", L: "↶ LINKS", R: "↷ RECHTS", REP2: "🔁 ×2", REP3: "🔁 ×3" }
const BLOCK_SHORT: Record<Block, string> = { F: "⬆", L: "↶", R: "↷", REP2: "🔁2", REP3: "🔁3" }
const BLOCK_COLOR: Record<Block, number> = { F: COLOR.cyan, L: COLOR.yellow, R: COLOR.yellow, REP2: COLOR.purple, REP3: COLOR.purple }

export class RobotScene extends Phaser.Scene {
  private level = 1
  private cfg!: RobotLevel
  private program: Block[] = []
  private blockLimit = 0
  private attempts = 0
  private running = false
  private token = 0
  private ended = false
  private ts = 48
  private ox = 0
  private oy = 0
  private world!: Phaser.GameObjects.Container
  private items = new Map<string, Phaser.GameObjects.Text>()
  private robot!: Phaser.GameObjects.Container
  private arrow!: Phaser.GameObjects.Graphics
  private slots!: Phaser.GameObjects.Container
  private info!: Phaser.GameObjects.Text
  private counter!: Phaser.GameObjects.Text
  private runBtn!: Button
  private palette: Button[] = []
  private editBtns: Button[] = []
  private facing = 0

  constructor() {
    super("play")
  }

  init(data: { level?: number }) {
    this.level = data.level ?? 1
    this.cfg = ROBOT_LEVELS[this.level - 1]
    this.program = []
    this.blockLimit = this.cfg.limit
    this.attempts = 0
    this.running = false
    this.ended = false
    this.token += 1
    this.palette = []
    this.editBtns = []
    this.items = new Map()
  }

  create() {
    backdrop(this)
    enter(this)
    topBar(this, `MISSIE ${this.level}: ${this.cfg.name.toUpperCase()}`, "MENU", () => goTo(this, "menu"))
    this.buildWorld()
    this.buildPanel()
    this.info = text(this, 24, 400, "", 14, TEXT.main, { wordWrap: { width: 580 }, lineSpacing: 6 })
    this.setInfo(`🎯 ${this.cfg.goal}\nBouw een programma met de blokken rechts en druk op START.`, TEXT.main)
    text(this, 24, 560, "Deze robot is geen AI: hij volgt exact jouw instructies (een algoritme) en leert zelf niets.", 11, TEXT.muted)
  }

  private setInfo(message: string, color: string) {
    this.info.setText(message).setColor(color)
  }

  private buildWorld() {
    const rows = this.cfg.map.length
    const cols = this.cfg.map[0].length
    this.ts = Math.floor(Math.min((GW - 20) / cols, (GH - 20) / rows, 56))
    this.ox = GX + (GW - cols * this.ts) / 2
    this.oy = GY + (GH - rows * this.ts) / 2
    panel(this, GX, GY, GW, GH, { stroke: COLOR.cyan })
    this.world = this.add.container(0, 0)
    this.items.clear()
    const g = this.add.graphics()
    this.world.add(g)
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const ch = this.cfg.map[y][x]
        const px = this.ox + x * this.ts
        const py = this.oy + y * this.ts
        if (ch === "#") {
          g.fillStyle(0x1b3a78, 1)
          g.fillRoundedRect(px + 2, py + 2, this.ts - 4, this.ts - 4, 6)
          g.lineStyle(1, COLOR.cyan, 0.35)
          g.strokeRoundedRect(px + 2, py + 2, this.ts - 4, this.ts - 4, 6)
        } else {
          g.fillStyle(0x0c1a3c, 1)
          g.fillRect(px + 1, py + 1, this.ts - 2, this.ts - 2)
          g.lineStyle(1, 0x24407f, 0.6)
          g.strokeRect(px + 1, py + 1, this.ts - 2, this.ts - 2)
        }
        const icon = ch === "T" ? "🎯" : ch === "B" ? "⚡" : ch === "K" ? "🔑" : ch === "D" ? "🚪" : ""
        if (icon) {
          const t = this.add.text(px + this.ts / 2, py + this.ts / 2, icon, { fontSize: `${Math.floor(this.ts * 0.6)}px` }).setOrigin(0.5)
          this.world.add(t)
          this.items.set(`${x},${y}`, t)
          if (ch === "B" || ch === "T") this.tweens.add({ targets: t, scale: 1.15, yoyo: true, repeat: -1, duration: 700, ease: "Sine.easeInOut" })
        }
      }
    }
    this.arrow = this.add.graphics()
    this.arrow.fillStyle(COLOR.yellow, 1)
    this.arrow.fillTriangle(0, -this.ts * 0.46, -this.ts * 0.14, -this.ts * 0.32, this.ts * 0.14, -this.ts * 0.32)
    const face = this.add.text(0, 0, "🤖", { fontSize: `${Math.floor(this.ts * 0.62)}px` }).setOrigin(0.5)
    this.robot = this.add.container(0, 0, [face, this.arrow]).setDepth(50)
    this.resetRobot()
  }

  private cellPos(x: number, y: number) {
    return { x: this.ox + x * this.ts + this.ts / 2, y: this.oy + y * this.ts + this.ts / 2 }
  }

  private resetRobot() {
    const start = this.startCell()
    const p = this.cellPos(start.x, start.y)
    this.robot.setPosition(p.x, p.y)
    this.facing = this.cfg.startDir
    this.arrow.setRotation((this.facing * Math.PI) / 2)
    this.robot.setScale(1)
    // restore collectibles and the door
    this.cfg.map.forEach((row, y) => [...row].forEach((ch, x) => {
      const t = this.items.get(`${x},${y}`)
      if (!t) return
      this.tweens.killTweensOf(t)
      t.setAlpha(1).setScale(1).setText(ch === "T" ? "🎯" : ch === "B" ? "⚡" : ch === "K" ? "🔑" : "🚪")
      if (ch === "B" || ch === "T") this.tweens.add({ targets: t, scale: 1.15, yoyo: true, repeat: -1, duration: 700, ease: "Sine.easeInOut" })
    }))
  }

  private startCell() {
    for (let y = 0; y < this.cfg.map.length; y += 1) {
      const x = this.cfg.map[y].indexOf("S")
      if (x >= 0) return { x, y }
    }
    return { x: 1, y: 1 }
  }

  private buildPanel() {
    const x = 620
    panel(this, x, 84, 316, 480, { stroke: COLOR.purple })
    heading(this, x + 158, 108, "🧠 PROGRAMMA", 22, TEXT.cyan).setOrigin(0.5)
    this.counter = text(this, x + 158, 134, "", 12, TEXT.yellow).setOrigin(0.5)
    this.slots = this.add.container(0, 0)
    const blocks: Block[] = ["F", "L", "R", "REP2", "REP3"]
    blocks.forEach((b, i) => {
      const col = i % 2
      const row = Math.floor(i / 2)
      const btn = button(this, x + 82 + col * 152, 300 + row * 40, 142, 34, BLOCK_LABEL[b], () => this.add_(b), { color: BLOCK_COLOR[b], size: 13 })
      this.palette.push(btn)
    })
    text(this, x + 158, 276, "BLOKKEN (klik om toe te voegen)", 11, TEXT.muted).setOrigin(0.5)
    this.runBtn = button(this, x + 82, 424, 142, 40, "▶ START", () => this.run(), { color: COLOR.green, size: 15 })
    this.editBtns.push(button(this, x + 234, 424, 142, 40, "↺ RESET", () => this.reset(), { color: COLOR.red, size: 14 }))
    this.editBtns.push(button(this, x + 82, 472, 142, 36, "⌫ WIS LAATSTE", () => this.undo(), { color: COLOR.purple, size: 12 }))
    this.editBtns.push(button(this, x + 234, 472, 142, 36, "🗑 WIS ALLES", () => this.clearAll(), { color: COLOR.purple, size: 12 }))
    this.editBtns.push(button(this, x + 158, 540, 284, 32, "MEER BLOKKEN", () => this.addExtraBlocks(), { color: COLOR.cyan, size: 12 }))
    this.redrawProgram()
  }

  private redrawProgram() {
    this.slots.removeAll(true)
    const x = 638
    const perRow = 4
    for (let i = 0; i < this.blockLimit; i += 1) {
      const px = x + (i % perRow) * 70
      const py = 146 + Math.floor(i / perRow) * 27
      const b = this.program[i]
      const bg = this.add.rectangle(px + 32, py + 13, 64, 24, b ? 0x14305e : 0x0a1330).setStrokeStyle(2, b ? BLOCK_COLOR[b] : 0x24407f)
      this.slots.add(bg)
      this.slots.add(text(this, px + 32, py + 13, b ? BLOCK_SHORT[b] : String(i + 1), b ? 15 : 10, b ? TEXT.main : TEXT.muted).setOrigin(0.5))
    }
    this.counter.setText(`${this.program.length}/${this.blockLimit} blokken`)
    this.counter.setColor(this.program.length >= this.blockLimit ? TEXT.red : TEXT.yellow)
  }

  private addExtraBlocks() {
    if (this.running || this.ended) return
    const maxBlocks = 20
    if (this.blockLimit >= maxBlocks) {
      this.setInfo("Je hebt het maximum aantal extra blokken al toegevoegd.", TEXT.yellow)
      return
    }
    this.blockLimit = Math.min(maxBlocks, this.blockLimit + 4)
    this.redrawProgram()
    playPopupSound()
  }

  private add_(b: Block) {
    if (this.running || this.ended) return
    if (this.program.length >= this.blockLimit) {
      this.setInfo(`Je programma is vol: maximaal ${this.blockLimit} blokken. Voeg extra blokken toe of gebruik een HERHAAL-blok!`, TEXT.yellow)
      playErrorSound()
      return
    }
    this.program.push(b)
    playPopupSound()
    this.redrawProgram()
  }

  private undo() {
    if (this.running || this.ended) return
    this.program.pop()
    this.redrawProgram()
  }

  private clearAll() {
    if (this.running || this.ended) return
    this.program = []
    this.redrawProgram()
    this.reset()
  }

  private reset() {
    if (this.ended) return
    this.token += 1
    this.running = false
    this.tweens.killTweensOf(this.robot)
    this.resetRobot()
    this.setInfo(`🎯 ${this.cfg.goal}\nDe robot staat weer aan de start. Pas je programma aan en druk op START.`, TEXT.main)
  }

  private run() {
    if (this.running || this.ended) return
    if (!this.program.length) {
      this.setInfo("Je programma is leeg. Voeg eerst blokken toe!", TEXT.yellow)
      return
    }
    this.resetRobot()
    const sim = simulate(this.cfg, this.program)
    this.attempts += 1
    if (!sim.steps.length) {
      playErrorSound()
      this.setInfo(sim.message, TEXT.red)
      return
    }
    this.running = true
    const token = ++this.token
    this.setInfo("De robot voert je programma uit...", TEXT.cyan)
    this.playStep(sim.steps, 0, sim.won, sim.message, token)
  }

  private playStep(steps: Step[], i: number, won: boolean, message: string, token: number) {
    if (token !== this.token || this.ended) return
    if (i >= steps.length) {
      this.running = false
      if (won) {
        this.time.delayedCall(600, () => this.finish())
      } else {
        playErrorSound()
        this.setInfo(`✘ ${message}\nDruk op RESET of pas je programma aan.`, TEXT.red)
      }
      return
    }
    const s = steps[i]
    const next = () => this.playStep(steps, i + 1, won, message, token)
    const pos = this.cellPos(s.x, s.y)
    if (s.kind === "move") {
      this.tweens.add({ targets: this.robot, x: pos.x, y: pos.y, duration: 300, ease: "Sine.easeInOut", onComplete: next })
    } else if (s.kind === "turn") {
      const target = this.arrow.rotation + (((s.dir - this.facing + 4) % 4) === 1 ? Math.PI / 2 : -Math.PI / 2)
      this.facing = s.dir
      this.tweens.add({ targets: this.arrow, rotation: target, duration: 240, onComplete: next })
    } else if (s.kind === "bump") {
      const d = DIRS[s.dir]
      this.tweens.add({ targets: this.robot, x: this.robot.x + d.dx * this.ts * 0.3, y: this.robot.y + d.dy * this.ts * 0.3, duration: 120, yoyo: true, onComplete: () => {
        shake(this, 0.004)
        next()
      } })
    } else if (s.kind === "collect" || s.kind === "unlock") {
      playCorrectSound()
      const item = this.items.get(`${s.x},${s.y}`)
      if (item) {
        this.tweens.killTweensOf(item)
        this.tweens.add({ targets: item, alpha: 0, scale: 0.2, duration: 250 })
      }
      if (s.kind === "unlock") this.openDoors()
      floatText(this, this.robot.x, this.robot.y - 30, s.note ?? "", TEXT.yellow, 20)
      this.time.delayedCall(260, next)
    } else {
      playCorrectSound()
      this.tweens.add({ targets: this.robot, scale: 1.4, yoyo: true, duration: 220, onComplete: next })
    }
  }

  private openDoors() {
    this.cfg.map.forEach((row, y) => [...row].forEach((ch, x) => {
      if (ch === "D") this.items.get(`${x},${y}`)?.setText("✅")
    }))
  }

  private finish() {
    this.ended = true
    const used = this.program.length
    const best = this.cfg.solution.length
    const stars = used <= best ? 3 : this.attempts <= 3 ? 2 : 1
    labBridge(this).complete("robot", this.level, stars)
    showResult(this, {
      win: true,
      title: "MISSIE GESLAAGD!",
      lines: [
        `Je gebruikte ${used} van ${this.blockLimit} blokken in ${this.attempts} poging(en).`,
        stars === 3 ? "Zuinig geprogrammeerd!" : "Kun je het met minder blokken? Probeer een HERHAAL-blok.",
        this.cfg.lesson,
        "AI is anders: een AI leert zelf patronen uit voorbeelden. Deze robot volgt alleen jouw regels.",
      ],
      stars,
      onRetry: () => goTo(this, "play", { level: this.level }),
      onMenu: () => goTo(this, "menu"),
      onNext: this.level < ROBOT_LEVELS.length ? () => goTo(this, "play", { level: this.level + 1 }) : undefined,
    })
  }
}
