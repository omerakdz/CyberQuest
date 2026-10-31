export type Block = "F" | "L" | "R" | "REP2" | "REP3"

export const DIRS = [
  { dx: 0, dy: -1 },
  { dx: 1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: -1, dy: 0 },
]

export type RobotLevel = {
  name: string
  goal: string
  map: string[]
  startDir: number
  limit: number
  lesson: string
  solution: Block[]
}

export type Step = {
  kind: "move" | "turn" | "bump" | "collect" | "unlock" | "goal"
  x: number
  y: number
  dir: number
  note?: string
}

export type SimResult = {
  steps: Step[]
  won: boolean
  message: string
  start: { x: number; y: number }
}

export function findCell(map: string[], ch: string) {
  for (let y = 0; y < map.length; y += 1) {
    const x = map[y].indexOf(ch)
    if (x >= 0) return { x, y }
  }
  return null
}

// A REP block repeats the block directly after it. A REP without a follower is reported to the player.
export function expand(program: Block[]): { ops: ("F" | "L" | "R")[]; error: string | null } {
  const ops: ("F" | "L" | "R")[] = []
  for (let i = 0; i < program.length; i += 1) {
    const b = program[i]
    if (b === "REP2" || b === "REP3") {
      const next = program[i + 1]
      if (!next || next === "REP2" || next === "REP3") return { ops, error: "Na een HERHAAL-blok moet een gewoon blok komen (vooruit, links of rechts)." }
      for (let n = 0; n < (b === "REP2" ? 2 : 3); n += 1) ops.push(next)
      i += 1
    } else ops.push(b)
  }
  return { ops, error: null }
}

export function simulate(level: RobotLevel, program: Block[]): SimResult {
  const start = findCell(level.map, "S")!
  const out: SimResult = { steps: [], won: false, message: "", start }
  const { ops, error } = expand(program)
  if (error) {
    out.message = error
    return out
  }
  const batteries = new Set<string>()
  const keys = new Set<string>()
  level.map.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch === "B") batteries.add(`${x},${y}`)
    if (ch === "K") keys.add(`${x},${y}`)
  }))
  const totalBatteries = batteries.size
  let { x, y } = start
  let dir = level.startDir
  let hasKey = false
  let collected = 0
  for (const op of ops) {
    if (op === "L" || op === "R") {
      dir = (dir + (op === "R" ? 1 : 3)) % 4
      out.steps.push({ kind: "turn", x, y, dir })
      continue
    }
    const nx = x + DIRS[dir].dx
    const ny = y + DIRS[dir].dy
    const cell = level.map[ny]?.[nx] ?? "#"
    if (cell === "#") {
      out.steps.push({ kind: "bump", x, y, dir, note: "Au! Een muur." })
      out.message = "De robot botste tegen een muur. De computer doet precies wat jij zegt, ook als het niet slim is."
      return out
    }
    if (cell === "D" && !hasKey) {
      out.steps.push({ kind: "bump", x, y, dir, note: "De deur is dicht." })
      out.message = "De deur is nog dicht. Pak eerst de sleutel!"
      return out
    }
    x = nx
    y = ny
    out.steps.push({ kind: "move", x, y, dir })
    if (cell === "B" && batteries.delete(`${x},${y}`)) {
      collected += 1
      out.steps.push({ kind: "collect", x, y, dir, note: `Energie ${collected}/${totalBatteries}` })
    }
    if (cell === "K" && keys.delete(`${x},${y}`)) {
      hasKey = true
      out.steps.push({ kind: "unlock", x, y, dir, note: "Sleutel gepakt!" })
    }
    if (cell === "T") {
      if (collected === totalBatteries) {
        out.steps.push({ kind: "goal", x, y, dir })
        out.won = true
        out.message = "Missie geslaagd!"
        return out
      }
    }
  }
  const at = level.map[y][x]
  out.message = at === "T" ? "De robot staat op het doel, maar nog niet alle energie is verzameld." : "De robot staat niet op het doel. Pas je programma aan en probeer opnieuw."
  return out
}
