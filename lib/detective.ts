export type DetectiveGameId = "phishing" | "crime" | "password"

export type GameProgress = { unlocked: number; stars: Record<string, number> }
export type DetectiveProgress = Record<DetectiveGameId, GameProgress>

export type DetectiveGameMeta = {
  id: DetectiveGameId
  title: string
  accent: string
  category: string
  description: string
  difficulty: 1 | 2 | 3
  icon: string
  unit: string
  levels: string[]
}

export const DETECTIVE_GAMES: Record<DetectiveGameId, DetectiveGameMeta> = {
  phishing: {
    id: "phishing",
    title: "PHISHING",
    accent: "HUNTER",
    category: "Internet safety",
    description: "Onderzoek e-mails, chatberichten en pop-ups. Is het bericht veilig of een valstrik?",
    difficulty: 2,
    icon: "🎣",
    unit: "DOSSIER",
    levels: ["Eerste zaak", "Slimme oplichters", "Valse vrienden", "Verborgen sporen", "Meesterhacker"],
  },
  crime: {
    id: "crime",
    title: "DIGITAL",
    accent: "CRIME SCENE",
    category: "Logic & investigation",
    description: "Onderzoek de plaats delict, verzamel bewijs, verbind aanwijzingen en los het mysterie op.",
    difficulty: 3,
    icon: "🔍",
    unit: "ZAAK",
    levels: ["Het verdwenen werkstuk", "Het gehackte account", "Het gelekte spelplan"],
  },
  password: {
    id: "password",
    title: "PASSWORD",
    accent: "BREAKER",
    category: "Digital security & logic",
    description: "Kraak digitale sloten, ontdek zwakke wachtwoorden en leer hoe je veilig blijft.",
    difficulty: 1,
    icon: "🔐",
    unit: "TERMINAL",
    levels: ["Zwak of sterk?", "Sorteer de sloten", "Denk als een hacker", "Geheime code", "Wat doe je?", "Pincode kraken", "Sterk wachtwoord", "De kluis"],
  },
}

export const DETECTIVE_IDS = Object.keys(DETECTIVE_GAMES) as DetectiveGameId[]

const KEY = "cyberquest-detective-v1"

export function emptyDetectiveProgress(): DetectiveProgress {
  return {
    phishing: { unlocked: 1, stars: {} },
    crime: { unlocked: 1, stars: {} },
    password: { unlocked: 1, stars: {} },
  }
}

export function loadDetectiveProgress(): DetectiveProgress {
  const base = emptyDetectiveProgress()
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return base
    const parsed = JSON.parse(raw) as Partial<DetectiveProgress>
    for (const id of DETECTIVE_IDS) {
      const saved = parsed[id]
      if (saved && typeof saved.unlocked === "number" && saved.stars) base[id] = { unlocked: Math.max(1, saved.unlocked), stars: saved.stars }
    }
  } catch {
    return base
  }
  return base
}

export function saveDetectiveProgress(progress: DetectiveProgress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress))
  } catch {
    // Storage can be unavailable (private mode); progress then lasts for this session only.
  }
}

export function recordResult(progress: DetectiveProgress, game: DetectiveGameId, level: number, stars: number): DetectiveProgress {
  const current = progress[game]
  const count = DETECTIVE_GAMES[game].levels.length
  return {
    ...progress,
    [game]: {
      unlocked: Math.max(current.unlocked, Math.min(count, level + 1)),
      stars: { ...current.stars, [String(level)]: Math.max(current.stars[String(level)] ?? 0, stars) },
    },
  }
}

export function completedLevels(progress: GameProgress) {
  return Object.keys(progress.stars).length
}

export function totalStars(progress: GameProgress) {
  return Object.values(progress.stars).reduce((sum, value) => sum + value, 0)
}
