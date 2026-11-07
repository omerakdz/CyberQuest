import type { RobotLevel } from "./robot-sim"

export const ROBOT_LEVELS: RobotLevel[] = [
  {
    name: "Eerste stappen",
    goal: "Breng de robot naar het doel 🎯.",
    map: [
      "#######",
      "#S...##",
      "#..#..#",
      "#..##T#",
      "#.....#",
      "#######",
    ],
    startDir: 1,
    limit: 12,
    lesson: "Een algoritme is een rijtje stappen in de juiste volgorde. De robot doet precies wat er staat.",
    solution: ["F", "F", "F", "R", "F", "L", "F", "R", "F"],
  },
  {
    name: "Energie verzamelen",
    goal: "Pak alle batterijen ⚡ en ga dan naar het doel 🎯.",
    map: [
      "#########",
      "#S.B...B#",
      "#.#####.#",
      "#.....T.#",
      "#########",
    ],
    startDir: 1,
    limit: 11,
    lesson: "Een HERHAAL-blok bespaart stappen: een lus herhaalt dezelfde instructie.",
    solution: ["REP3", "F", "REP3", "F", "R", "REP2", "F", "R", "F"],
  },
  {
    name: "De gesloten deur",
    goal: "Pak de sleutel 🔑, open de deur 🚪 en bereik het doel 🎯 met weinig blokken.",
    map: [
      "#########",
      "#S.K....#",
      "#######.#",
      "#T.D....#",
      "#########",
    ],
    startDir: 1,
    limit: 16,
    lesson: "Echte AI leert zelf van voorbeelden. Deze robot leert niets: hij volgt jouw programma stap voor stap.",
    solution: ["REP3", "F", "REP3", "F", "R", "REP2", "F", "R", "REP3", "F", "REP3", "F"],
  },
]
