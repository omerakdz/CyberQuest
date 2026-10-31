export type LabGameId = "trainer" | "human" | "robot"

export type LabGameProgress = { unlocked: number; stars: Record<string, number> }
export type LabProgress = Record<LabGameId, LabGameProgress>

export type LabGameMeta = {
  id: LabGameId
  title: string
  accent: string
  category: string
  description: string
  difficulty: 1 | 2 | 3
  icon: string
  levels: string[]
}

export const LAB_GAMES: Record<LabGameId, LabGameMeta> = {
  trainer: {
    id: "trainer",
    title: "AI",
    accent: "TRAINER",
    category: "Machine learning",
    description: "Train je eigen robot met voorbeelden. Test hem, zoek uit waarom hij fouten maakt en verbeter zijn trainingsdata.",
    difficulty: 1,
    icon: "🤖",
    levels: ["Dier of voertuig?", "Drie groepen", "Vier groepen"],
  },
  human: {
    id: "human",
    title: "AI OR",
    accent: "HUMAN?",
    category: "AI awareness",
    description: "Teksten, verhalen en plaatjes: gemaakt door AI of door een mens? Soms kun je het écht niet zien!",
    difficulty: 2,
    icon: "🔎",
    levels: ["Eerste speurtocht", "Lastige gevallen", "Kun je het weten?"],
  },
  robot: {
    id: "robot",
    title: "ROBOT",
    accent: "PROGRAMMER",
    category: "Algorithms & logic",
    description: "Programmeer de laboratoriumrobot met blokjes. Ontwijk muren, verzamel energie en bereik het doel.",
    difficulty: 3,
    icon: "🦾",
    levels: ["Eerste stappen", "Energie verzamelen", "De gesloten deur"],
  },
}

export const LAB_IDS = Object.keys(LAB_GAMES) as LabGameId[]

const KEY = "cyberquest-lab-v1"

export function emptyLabProgress(): LabProgress {
  return {
    trainer: { unlocked: 1, stars: {} },
    human: { unlocked: 1, stars: {} },
    robot: { unlocked: 1, stars: {} },
  }
}

export function loadLabProgress(): LabProgress {
  const base = emptyLabProgress()
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return base
    const parsed = JSON.parse(raw) as Partial<LabProgress>
    for (const id of LAB_IDS) {
      const saved = parsed[id]
      if (saved && typeof saved.unlocked === "number" && saved.stars) base[id] = { unlocked: Math.max(1, saved.unlocked), stars: saved.stars }
    }
  } catch {
    return base
  }
  return base
}

export function saveLabProgress(progress: LabProgress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress))
  } catch {
    // Storage can be unavailable (private mode); progress then lasts for this session only.
  }
}

export function recordLabResult(progress: LabProgress, game: LabGameId, level: number, stars: number): LabProgress {
  const current = progress[game]
  const count = LAB_GAMES[game].levels.length
  return {
    ...progress,
    [game]: {
      unlocked: Math.max(current.unlocked, Math.min(count, level + 1)),
      stars: { ...current.stars, [String(level)]: Math.max(current.stars[String(level)] ?? 0, stars) },
    },
  }
}

export function labCompleted(progress: LabGameProgress) {
  return Object.keys(progress.stars).length
}

export function labStars(progress: LabGameProgress) {
  return Object.values(progress.stars).reduce((sum, value) => sum + value, 0)
}
