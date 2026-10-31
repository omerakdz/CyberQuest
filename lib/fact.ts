export type FactGameId = "news" | "picture" | "frenzy"

export type FactGameProgress = { unlocked: number; stars: Record<string, number> }
export type FactProgress = Record<FactGameId, FactGameProgress>

export type FactGameMeta = {
  id: FactGameId
  title: string
  accent: string
  category: string
  description: string
  difficulty: 1 | 2 | 3
  icon: string
  levels: string[]
}

export const FACT_GAMES: Record<FactGameId, FactGameMeta> = {
  news: {
    id: "news",
    title: "NEWS",
    accent: "DETECTIVE",
    category: "Media literacy",
    description: "Onderzoek bron, schrijver, datum en bewijs. Is het nieuws betrouwbaar, nep of nog niet te controleren?",
    difficulty: 1,
    icon: "📰",
    levels: ["Eerste krantenkop", "Let op de bron", "Meesterlijke speurder"],
  },
  picture: {
    id: "picture",
    title: "PICTURE",
    accent: "PERFECT",
    category: "Image literacy",
    description: "Bekijk foto's met een vergrootglas. Klopt het onderschrift of is het plaatje misleidend gebruikt?",
    difficulty: 2,
    icon: "🖼️",
    levels: ["Kijk goed", "Context telt", "Bewerkt of echt?"],
  },
  frenzy: {
    id: "frenzy",
    title: "FACT CHECK",
    accent: "FRENZY",
    category: "Critical thinking",
    description: "Je werkt op een drukke redactie. Controleer claims op tijd, maar nauwkeurig gaat altijd voor snel!",
    difficulty: 3,
    icon: "⏱️",
    levels: ["Rustige ochtend", "Drukke middag", "Breaking news"],
  },
}

export const FACT_IDS = Object.keys(FACT_GAMES) as FactGameId[]

const KEY = "cyberquest-fact-v1"

export function emptyFactProgress(): FactProgress {
  return {
    news: { unlocked: 1, stars: {} },
    picture: { unlocked: 1, stars: {} },
    frenzy: { unlocked: 1, stars: {} },
  }
}

export function loadFactProgress(): FactProgress {
  const base = emptyFactProgress()
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return base
    const parsed = JSON.parse(raw) as Partial<FactProgress>
    for (const id of FACT_IDS) {
      const saved = parsed[id]
      if (saved && typeof saved.unlocked === "number" && saved.stars) base[id] = { unlocked: Math.max(1, saved.unlocked), stars: saved.stars }
    }
  } catch {
    return base
  }
  return base
}

export function saveFactProgress(progress: FactProgress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress))
  } catch {
    // Storage can be unavailable (private mode); progress then lasts for this session only.
  }
}

export function recordFactResult(progress: FactProgress, game: FactGameId, level: number, stars: number): FactProgress {
  const current = progress[game]
  const count = FACT_GAMES[game].levels.length
  return {
    ...progress,
    [game]: {
      unlocked: Math.max(current.unlocked, Math.min(count, level + 1)),
      stars: { ...current.stars, [String(level)]: Math.max(current.stars[String(level)] ?? 0, stars) },
    },
  }
}

export function factCompleted(progress: FactGameProgress) {
  return Object.keys(progress.stars).length
}

export function factStars(progress: FactGameProgress) {
  return Object.values(progress.stars).reduce((sum, value) => sum + value, 0)
}
