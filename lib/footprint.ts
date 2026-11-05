export type FootprintGameId = "tracker" | "privacy" | "viral"

export type FootprintGameProgress = { unlocked: number; stars: Record<string, number> }
export type FootprintProgress = Record<FootprintGameId, FootprintGameProgress>

export type FootprintGameMeta = {
  id: FootprintGameId
  title: string
  accent: string
  category: string
  description: string
  difficulty: 1 | 2 | 3
  icon: string
  levels: string[]
}

export const FOOTPRINT_GAMES: Record<FootprintGameId, FootprintGameMeta> = {
  tracker: {
    id: "tracker",
    title: "FOOTPRINT",
    accent: "TRACKER",
    category: "Digitale voetafdruk",
    description: "Volg de online dag van een verzonnen personage. Ontdek welke sporen ze achterlaat en welke sporen je zelf deelt of die onzichtbaar worden verzameld.",
    difficulty: 1,
    icon: "👣",
    levels: ["Een gewone dag", "Verborgen sporen", "Het grote plaatje"],
  },
  privacy: {
    id: "privacy",
    title: "PRIVACY",
    accent: "PROTECTOR",
    category: "Privacy & persoonlijke info",
    description: "Beveilig een nieuw (verzonnen) profiel. Kies wat openbaar, voor vrienden of privé is en reageer slim op vragen van anderen.",
    difficulty: 2,
    icon: "🛡️",
    levels: ["Nieuw profiel", "Vragen van vreemden", "Alles op slot"],
  },
  viral: {
    id: "viral",
    title: "VIRAL OR",
    accent: "PRIVATE",
    category: "Slim delen",
    description: "Beheer een verzonnen account en beslis: delen, niet delen, toestemming vragen of eerst checken? Zie hoe berichten zich verspreiden.",
    difficulty: 3,
    icon: "📡",
    levels: ["Eerste posts", "Anderen in beeld", "Het is verspreid!"],
  },
}

export const FOOTPRINT_IDS = Object.keys(FOOTPRINT_GAMES) as FootprintGameId[]

const KEY = "cyberquest-footprint-v1"

export function emptyFootprintProgress(): FootprintProgress {
  return {
    tracker: { unlocked: 1, stars: {} },
    privacy: { unlocked: 1, stars: {} },
    viral: { unlocked: 1, stars: {} },
  }
}

export function loadFootprintProgress(): FootprintProgress {
  const base = emptyFootprintProgress()
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return base
    const parsed = JSON.parse(raw) as Partial<FootprintProgress>
    for (const id of FOOTPRINT_IDS) {
      const saved = parsed[id]
      if (saved && typeof saved.unlocked === "number" && saved.stars) base[id] = { unlocked: Math.max(1, saved.unlocked), stars: saved.stars }
    }
  } catch {
    return base
  }
  return base
}

export function saveFootprintProgress(progress: FootprintProgress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress))
  } catch {
    // Storage can be unavailable (private mode); progress then lasts for this session only.
  }
}

export function recordFootprintResult(progress: FootprintProgress, game: FootprintGameId, level: number, stars: number): FootprintProgress {
  const current = progress[game]
  const count = FOOTPRINT_GAMES[game].levels.length
  return {
    ...progress,
    [game]: {
      unlocked: Math.max(current.unlocked, Math.min(count, level + 1)),
      stars: { ...current.stars, [String(level)]: Math.max(current.stars[String(level)] ?? 0, stars) },
    },
  }
}

export function footprintCompleted(progress: FootprintGameProgress) {
  return Object.keys(progress.stars).length
}

export function footprintStars(progress: FootprintGameProgress) {
  return Object.values(progress.stars).reduce((sum, value) => sum + value, 0)
}
