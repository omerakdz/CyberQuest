import * as Phaser from "phaser"

export type TrackCar = {
  id: string
  name: string
  progress: number
  isYou: boolean
  online: boolean
}

export type TrackState = {
  cars: TrackCar[]
  countdown: number | null
  goFlash: boolean
  winnerId: string | null
}

const WIDTH = 960
const HEIGHT = 400
const TOP = 34
const START_X = 120
const FINISH_X = 860
const CAR_COLORS = [0x38ddff, 0xffc84a, 0xa875ff, 0xff648d, 0x2be7a0, 0xff8a3d, 0x6ea8ff, 0xe3ff5c]

type CarSprite = {
  container: Phaser.GameObjects.Container
  targetX: number
  lastProgress: number
}

export class RaceScene extends Phaser.Scene {
  private state: TrackState = { cars: [], countdown: null, goFlash: false, winnerId: null }
  private cars = new Map<string, CarSprite>()
  private laneKey = ""
  private laneObjects: Phaser.GameObjects.GameObject[] = []
  private countdownText?: Phaser.GameObjects.Text
  private lastCountdown: string | null = null
  private winnerShown: string | null = null
  private ready = false

  constructor() {
    super("RaceScene")
  }

  create() {
    this.drawBackground()
    const dot = this.make.graphics({ x: 0, y: 0 }, false)
    dot.fillStyle(0xffffff, 1).fillRect(0, 0, 6, 6)
    dot.generateTexture("spark", 6, 6)
    dot.destroy()

    this.countdownText = this.add.text(WIDTH / 2, HEIGHT / 2, "", {
      fontFamily: "'Barlow Condensed', Arial, sans-serif",
      fontSize: "150px",
      fontStyle: "bold",
      color: "#ffffff",
      stroke: "#0a1425",
      strokeThickness: 10,
    }).setOrigin(0.5).setDepth(50).setAlpha(0)

    this.ready = true
    this.applyState(this.state)
  }

  // Called by React whenever the shared room state changes; also safe before create().
  applyState(next: TrackState) {
    this.state = next
    if (!this.ready) return
    this.syncLanes()
    this.syncCars()
    this.syncCountdown()
    this.syncWinner()
  }

  update(_time: number, delta: number) {
    const blend = 1 - Math.exp(-delta / 140)
    this.cars.forEach((car) => {
      car.container.x += (car.targetX - car.container.x) * blend
    })
  }

  private drawBackground() {
    const g = this.add.graphics()
    g.fillGradientStyle(0x14335c, 0x14335c, 0x0a1425, 0x0a1425, 1).fillRect(0, 0, WIDTH, HEIGHT)
    g.fillStyle(0x1a2f50, 1)
    for (let i = 0; i < 9; i++) {
      const w = 40 + ((i * 37) % 50)
      const h = 14 + ((i * 53) % 18)
      g.fillRect(30 + i * 108, TOP - h, w, h)
    }
    g.fillStyle(0x2be7a0, 0.35).fillRect(0, HEIGHT - 10, WIDTH, 10)
  }

  private syncLanes() {
    const key = this.state.cars.map((car) => `${car.id}:${car.isYou}`).join("|")
    if (key === this.laneKey) return
    this.laneKey = key

    this.laneObjects.forEach((object) => object.destroy())
    this.laneObjects = []
    this.cars.forEach((car) => car.container.destroy())
    this.cars.clear()

    const count = Math.max(1, this.state.cars.length)
    const laneHeight = (HEIGHT - TOP - 10) / count
    const road = this.add.graphics().setDepth(1)
    for (let lane = 0; lane < count; lane++) {
      const y = TOP + lane * laneHeight
      road.fillStyle(lane % 2 === 0 ? 0x2d3748 : 0x252e3d, 1).fillRect(0, y, WIDTH, laneHeight)
      if (lane > 0) {
        for (let x = 0; x < WIDTH; x += 46) road.fillStyle(0xffffff, 0.35).fillRect(x, y - 1, 24, 2)
      }
    }
    road.fillStyle(0xffffff, 0.9).fillRect(START_X, TOP, 4, HEIGHT - TOP - 10)
    const cell = 12
    const rows = Math.ceil((HEIGHT - TOP - 10) / cell)
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < 2; col++) {
        road.fillStyle((row + col) % 2 === 0 ? 0xffffff : 0x111827, 1).fillRect(FINISH_X + col * cell, TOP + row * cell, cell, cell)
      }
    }
    const start = this.add.text(START_X + 8, TOP - 22, "START", { fontFamily: "monospace", fontSize: "12px", color: "#9fb4c9" }).setDepth(2)
    const finish = this.add.text(FINISH_X - 4, TOP - 22, "FINISH", { fontFamily: "monospace", fontSize: "12px", color: "#ffc84a" }).setDepth(2)
    this.laneObjects.push(road, start, finish)

    this.state.cars.forEach((car, index) => {
      const y = TOP + index * laneHeight + laneHeight / 2
      const size = Math.min(1.25, laneHeight / 52)
      const container = this.add.container(START_X - 40 * size, y).setDepth(10)
      const color = CAR_COLORS[index % CAR_COLORS.length]
      const body = this.add.graphics()
      body.fillStyle(0x000000, 0.3).fillEllipse(0, 18 * size, 66 * size, 8 * size)
      body.fillStyle(color, 1).fillRoundedRect(-34 * size, -11 * size, 68 * size, 22 * size, 7 * size)
      body.fillStyle(color, 1).fillRoundedRect(-14 * size, -22 * size, 34 * size, 15 * size, 6 * size)
      body.fillStyle(0xcdeeff, 1).fillRoundedRect(-9 * size, -19 * size, 12 * size, 9 * size, 3 * size)
      body.fillStyle(0xcdeeff, 1).fillRoundedRect(6 * size, -19 * size, 10 * size, 9 * size, 3 * size)
      body.fillStyle(0xfff2a8, 1).fillRect(30 * size, -6 * size, 5 * size, 5 * size)
      body.fillStyle(0x111827, 1).fillCircle(-21 * size, 11 * size, 7 * size).fillCircle(21 * size, 11 * size, 7 * size)
      body.fillStyle(0x9aa7b8, 1).fillCircle(-21 * size, 11 * size, 3 * size).fillCircle(21 * size, 11 * size, 3 * size)
      const label = this.add.text(0, -34 * size, car.isYou ? `${car.name} (JIJ)` : car.name, {
        fontFamily: "monospace",
        fontSize: "12px",
        fontStyle: "bold",
        color: car.isYou ? "#38ddff" : "#ffffff",
        stroke: "#0a1425",
        strokeThickness: 3,
      }).setOrigin(0.5)
      container.add([body, label])
      this.cars.set(car.id, { container, targetX: container.x, lastProgress: 0 })
    })
  }

  private syncCars() {
    this.state.cars.forEach((car) => {
      const sprite = this.cars.get(car.id)
      if (!sprite) return
      const progress = Math.min(1, Math.max(0, car.progress))
      sprite.targetX = START_X + (FINISH_X - START_X - 36) * progress
      sprite.container.setAlpha(car.online ? 1 : 0.45)
      if (progress > sprite.lastProgress) {
        this.sparkBurst(sprite.container.x - 34, sprite.container.y + 10, 0xffc84a, 8)
        this.tweens.add({ targets: sprite.container, scaleX: 1.12, scaleY: 1.12, duration: 110, yoyo: true })
      }
      sprite.lastProgress = progress
    })
  }

  private syncCountdown() {
    const text = this.countdownText
    if (!text) return
    const value = this.state.countdown !== null ? String(this.state.countdown) : this.state.goFlash ? "GO!" : null
    if (value === this.lastCountdown) return
    this.lastCountdown = value
    this.tweens.killTweensOf(text)
    if (value === null) {
      text.setAlpha(0)
      return
    }
    text.setText(value).setAlpha(1).setScale(1.6).setColor(value === "GO!" ? "#2be7a0" : "#ffffff")
    this.tweens.add({ targets: text, scale: 1, duration: 320, ease: "Back.easeOut" })
    if (value === "GO!") this.tweens.add({ targets: text, alpha: 0, delay: 450, duration: 300 })
  }

  private syncWinner() {
    const winnerId = this.state.winnerId
    if (!winnerId) {
      this.winnerShown = null
      return
    }
    if (this.winnerShown === winnerId) return
    this.winnerShown = winnerId
    const car = this.state.cars.find((entry) => entry.id === winnerId)
    if (!car) return
    const banner = this.add.text(WIDTH / 2, HEIGHT / 2, `${car.name.toUpperCase()} WINT!`, {
      fontFamily: "'Barlow Condensed', Arial, sans-serif",
      fontSize: "64px",
      fontStyle: "bold",
      color: "#ffc84a",
      stroke: "#0a1425",
      strokeThickness: 8,
    }).setOrigin(0.5).setDepth(60).setScale(0.2)
    this.tweens.add({ targets: banner, scale: 1, duration: 450, ease: "Back.easeOut" })
    for (let i = 0; i < 3; i++) {
      this.time.delayedCall(i * 250, () => {
        this.sparkBurst(Phaser.Math.Between(200, 760), Phaser.Math.Between(60, 200), CAR_COLORS[(i * 3) % CAR_COLORS.length], 18)
      })
    }
  }

  private sparkBurst(x: number, y: number, tint: number, quantity: number) {
    const emitter = this.add.particles(x, y, "spark", {
      speed: { min: 40, max: 160 },
      angle: { min: 0, max: 360 },
      lifespan: 520,
      scale: { start: 1, end: 0 },
      tint,
      quantity,
      emitting: false,
    }).setDepth(40)
    emitter.explode(quantity)
    this.time.delayedCall(700, () => emitter.destroy())
  }
}

export const TRACK_SIZE = { width: WIDTH, height: HEIGHT }
