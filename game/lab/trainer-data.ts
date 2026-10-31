import type { Example } from "./ai-engine"

export const FEATURE_LABEL: Record<string, string> = {
  legs: "poten", fur: "vacht", alive: "levend", fins: "vinnen", swims: "zwemt", wings: "vleugels", flies: "vliegt", feathers: "veren",
  wheels: "wielen", metal: "metaal", engine: "motor", pedals: "pedalen", red: "rood", small: "klein", round: "rond", sweet: "zoet",
  edible: "eetbaar", long: "langwerpig", yellow: "geel", orange: "oranje", warm: "warm", shell: "schild", big: "groot", trunk: "slurf",
  toy: "speelgoed", paper: "papier", handle: "handvat", flat: "plat", sharp: "scherp", soft: "zacht",
}

export type CatDef = { id: string; label: string; icon: string }

export type TrainerLevel = {
  name: string
  intro: string
  cats: CatDef[]
  train: Example[]
  test: Example[]
  fixes: Example[]
  fixTip: string
}

const ANIMAL = { id: "animal", label: "DIER", icon: "🐾" }
const FOOD = { id: "food", label: "ETEN", icon: "🍽️" }
const VEHICLE = { id: "vehicle", label: "VOERTUIG", icon: "🚦" }
const OBJECT = { id: "object", label: "VOORWERP", icon: "🧰" }

const I = (e: string, name: string, cat: string, f: string[]): Example => ({ e, name, cat, f })

export const TRAINER_LEVELS: TrainerLevel[] = [
  {
    name: "Dier of voertuig?",
    intro: "Sorteer de voorbeelden. De AI kijkt naar kenmerken en onthoudt wat vaak bij welke groep hoort.",
    cats: [ANIMAL, VEHICLE],
    train: [
      I("🐶", "hond", "animal", ["legs", "fur", "alive"]),
      I("🚗", "auto", "vehicle", ["wheels", "metal", "engine"]),
      I("🐱", "kat", "animal", ["legs", "fur", "alive"]),
      I("🚌", "bus", "vehicle", ["wheels", "metal", "engine"]),
      I("🐟", "vis", "animal", ["fins", "swims", "alive"]),
      I("✈️", "vliegtuig", "vehicle", ["wings", "flies", "metal", "engine"]),
    ],
    test: [
      I("🐴", "paard", "animal", ["legs", "fur", "alive"]),
      I("🚂", "trein", "vehicle", ["wheels", "metal", "engine"]),
      I("🦅", "adelaar", "animal", ["wings", "flies", "alive", "feathers"]),
      I("🛵", "scooter", "vehicle", ["wheels", "metal", "engine"]),
    ],
    fixes: [
      I("🐘", "olifant", "animal", ["legs", "alive", "big", "trunk"]),
      I("🦆", "eend", "animal", ["wings", "flies", "swims", "alive", "feathers"]),
      I("🛩️", "propellervliegtuig", "vehicle", ["wings", "flies", "metal", "engine"]),
    ],
    fixTip: "Een AI kan alleen herkennen wat in zijn voorbeelden zit. Ontbreekt een soort voorbeeld, dan gokt hij.",
  },
  {
    name: "Drie groepen",
    intro: "Nu zijn er drie groepen. Let op: de voorbeelden zijn niet van alles evenveel. Dat kan de AI misleiden.",
    cats: [ANIMAL, FOOD, VEHICLE],
    train: [
      I("🐶", "hond", "animal", ["legs", "fur", "alive"]),
      I("🍎", "appel", "food", ["round", "red", "sweet", "edible"]),
      I("🚗", "auto", "vehicle", ["wheels", "metal", "engine"]),
      I("🐟", "vis", "animal", ["fins", "swims", "alive"]),
      I("🍓", "aardbei", "food", ["small", "red", "sweet", "edible"]),
      I("🚌", "bus", "vehicle", ["wheels", "metal", "engine"]),
      I("🐴", "paard", "animal", ["legs", "fur", "alive"]),
      I("🍅", "tomaat", "food", ["round", "red", "edible"]),
      I("🚂", "trein", "vehicle", ["wheels", "metal", "engine"]),
    ],
    test: [
      I("🍌", "banaan", "food", ["long", "yellow", "sweet", "edible"]),
      I("🐱", "kat", "animal", ["legs", "fur", "alive"]),
      I("🦀", "krab", "animal", ["legs", "small", "red", "shell"]),
      I("🚒", "brandweerwagen", "vehicle", ["wheels", "red", "metal", "engine"]),
    ],
    fixes: [
      I("🐞", "lieveheersbeestje", "animal", ["legs", "small", "red", "alive"]),
      I("🚲", "fiets", "vehicle", ["wheels", "metal", "pedals"]),
      I("🍕", "pizza", "food", ["round", "warm", "edible"]),
    ],
    fixTip: "Als alle eten in je voorbeelden rood is, denkt de AI dat 'rood' bij eten hoort. Gevarieerde voorbeelden helpen.",
  },
  {
    name: "Vier groepen",
    intro: "Dieren, eten, voertuigen en voorwerpen. Zoek uit waarom de AI fouten maakt en repareer zijn trainingsdata.",
    cats: [ANIMAL, FOOD, VEHICLE, OBJECT],
    train: [
      I("🐶", "hond", "animal", ["legs", "fur", "alive"]),
      I("🍎", "appel", "food", ["round", "red", "sweet", "edible"]),
      I("🚗", "auto", "vehicle", ["wheels", "metal", "engine"]),
      I("⚽", "voetbal", "object", ["round", "toy"]),
      I("🐟", "vis", "animal", ["fins", "swims", "alive"]),
      I("🍌", "banaan", "food", ["long", "yellow", "sweet", "edible"]),
      I("🚌", "bus", "vehicle", ["wheels", "metal", "engine"]),
      I("📚", "boeken", "object", ["flat", "paper"]),
      I("🐴", "paard", "animal", ["legs", "fur", "alive"]),
      I("🥕", "wortel", "food", ["long", "orange", "edible"]),
      I("🚂", "trein", "vehicle", ["wheels", "metal", "engine"]),
      I("🔨", "hamer", "object", ["metal", "handle"]),
    ],
    test: [
      I("🍊", "sinaasappel", "food", ["round", "orange", "sweet", "edible"]),
      I("🧸", "knuffelbeer", "object", ["fur", "soft", "toy"]),
      I("🛴", "step", "vehicle", ["wheels", "metal"]),
      I("🦊", "vos", "animal", ["legs", "fur", "orange", "alive"]),
      I("✂️", "schaar", "object", ["metal", "handle", "sharp"]),
    ],
    fixes: [
      I("🐻", "beer", "animal", ["legs", "fur", "alive", "big"]),
      I("🛹", "skateboard", "vehicle", ["wheels", "flat", "toy"]),
      I("🏀", "basketbal", "object", ["round", "toy", "orange"]),
      I("🪆", "matroesjka", "object", ["toy", "soft"]),
    ],
    fixTip: "Slechte of eenzijdige trainingsdata geeft een AI die verkeerde patronen leert. Meer gevarieerde voorbeelden maken hem eerlijker.",
  },
]
