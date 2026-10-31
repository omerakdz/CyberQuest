export type PicVerdict = "honest" | "misleading" | "unverified"

export type PicElement = { e: string; x: number; y: number; s: number; a?: number }
export type Hotspot = { x: number; y: number; r: number; clue: string }

export type Picture = {
  caption: string
  story: string
  sky: [number, number]
  ground?: { y: number; color: number }
  elements: PicElement[]
  hotspots: Hotspot[]
  verdict: PicVerdict
  why: string
}

// All pictures are drawn in a 560x330 frame with emoji; every story is fictional.
export const PICTURE_LEVELS: Picture[][] = [
  [
    {
      caption: "Een gigantische reuzenvis gevangen in het meertje van Dorpsburg!",
      story: "Iemand deelt de foto met 'Wie durft hier nog te zwemmen?!'",
      sky: [0x7ec8ff, 0xcfeaff],
      ground: { y: 190, color: 0x2a77b5 },
      elements: [{ e: "🐟", x: 280, y: 200, s: 190 }, { e: "🧑", x: 130, y: 100, s: 40 }, { e: "☁️", x: 430, y: 50, s: 60 }],
      hotspots: [
        { x: 300, y: 205, r: 80, clue: "De man houdt de vis vlak voor de camera. Dichtbij lijkt alles veel groter: dat heet perspectief." },
        { x: 130, y: 110, r: 36, clue: "Op een andere foto van dezelfde visser is de vis ongeveer 40 cm, zo lang als zijn onderarm." },
      ],
      verdict: "misleading",
      why: "De foto is niet bewerkt, maar de manier van fotograferen laat de vis veel groter lijken. Het onderschrift is daarom misleidend.",
    },
    {
      caption: "Leerlingen planten bomen tijdens de schooltuindag.",
      story: "Foto van de website van Basisschool De Regenboog, bij een bericht over de schooltuindag.",
      sky: [0x9fe0ff, 0xe3f6ff],
      ground: { y: 200, color: 0x4a9d4a },
      elements: [{ e: "🌳", x: 90, y: 210, s: 110 }, { e: "🧒", x: 230, y: 240, s: 56 }, { e: "🧒", x: 310, y: 250, s: 56 }, { e: "🌱", x: 390, y: 270, s: 46 }, { e: "🪧", x: 470, y: 230, s: 64 }],
      hotspots: [
        { x: 470, y: 230, r: 40, clue: "Op het bord staat 'Schooltuindag, De Regenboog'. Dat past bij het onderschrift." },
        { x: 270, y: 250, r: 60, clue: "De kinderen dragen dezelfde schooltruien en dezelfde foto staat bij het bericht op de schoolwebsite." },
      ],
      verdict: "honest",
      why: "Foto, plaats en onderschrift passen bij elkaar en de bron is de school zelf.",
    },
    {
      caption: "Dorpsburg vanochtend: pak je slee, het sneeuwt!",
      story: "Het bericht werd gisteren, op 4 juli, gedeeld met het woord 'vanochtend'.",
      sky: [0xcfd8e8, 0xf0f4fb],
      ground: { y: 210, color: 0xf6f8ff },
      elements: [{ e: "⛄", x: 150, y: 250, s: 80 }, { e: "🏘️", x: 380, y: 190, s: 110 }, { e: "❄️", x: 90, y: 60, s: 34 }, { e: "❄️", x: 300, y: 90, s: 28 }, { e: "❄️", x: 470, y: 50, s: 30 }],
      hotspots: [
        { x: 280, y: 160, r: 120, clue: "In de bestandsgegevens van de foto staat: genomen op 12 januari 2019." },
        { x: 150, y: 250, r: 50, clue: "Op 4 juli is het in Dorpsburg gemiddeld ruim 20 graden. Sneeuw is dan zeer onwaarschijnlijk." },
      ],
      verdict: "misleading",
      why: "De foto is echt, maar oud. Doordat 'vanochtend' er bij staat, krijgt het een andere betekenis. Context en datum zijn belangrijk.",
    },
  ],
  [
    {
      caption: "Een wolk die op een draak lijkt, gisteren boven het dorp.",
      story: "Gedeeld door een lokale fotograaf die vaker de lucht fotografeert.",
      sky: [0x3f8fe8, 0x9fd0ff],
      elements: [{ e: "☁️", x: 220, y: 130, s: 200 }, { e: "☁️", x: 340, y: 110, s: 150 }, { e: "🐉", x: 270, y: 120, s: 130, a: 0.25 }, { e: "☁️", x: 480, y: 230, s: 90 }],
      hotspots: [
        { x: 270, y: 120, r: 90, clue: "Wolken kunnen toevallig bijzondere vormen hebben. Een ongewone foto is nog niet nep." },
        { x: 480, y: 235, r: 50, clue: "De fotograaf heeft het originele bestand en meerdere foto's van dezelfde minuten. Niets wijst op bewerking." },
      ],
      verdict: "honest",
      why: "Het ziet er bijzonder uit, maar er is niets wat op bewerking wijst en de maker is bekend. Eerlijk onderzoek begint met aanwijzingen, niet met een gevoel.",
    },
    {
      caption: "Duizenden mensen op het plein tijdens de demonstratie!",
      story: "Het bericht wil laten zien hoe populair de actie was.",
      sky: [0x9ec7f5, 0xe0efff],
      ground: { y: 170, color: 0x9a9a9a },
      elements: [...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => ({ e: "🧍", x: 220 + (i % 5) * 36, y: 230 + Math.floor(i / 5) * 40, s: 40 })), { e: "🏛️", x: 100, y: 130, s: 90 }],
      hotspots: [
        { x: 290, y: 240, r: 100, clue: "Alle mensen staan in één klein hoekje. De foto is ingezoomd op de drukste plek." },
        { x: 480, y: 240, r: 60, clue: "Op een andere foto van dezelfde dag is het plein bijna leeg: de politie telde ongeveer 60 mensen." },
      ],
      verdict: "misleading",
      why: "Door te kiezen waar je de camera op richt, lijkt het veel drukker. De foto laat maar een stukje van de waarheid zien.",
    },
    {
      caption: "Mysterieus licht boven het bos?",
      story: "Het bericht is gedeeld door een anoniem account.",
      sky: [0x050918, 0x0f1c3f],
      ground: { y: 230, color: 0x07150c },
      elements: [{ e: "🌲", x: 70, y: 280, s: 100 }, { e: "🌲", x: 200, y: 290, s: 120 }, { e: "🌲", x: 340, y: 285, s: 110 }, { e: "🌲", x: 490, y: 290, s: 120 }, { e: "✨", x: 290, y: 100, s: 60 }],
      hotspots: [
        { x: 290, y: 100, r: 60, clue: "Een lichtpunt kan een lamp, een drone of een weerspiegeling in de lens zijn. Dat kun je hier niet zien." },
        { x: 100, y: 285, r: 70, clue: "Er staat geen plaats, datum of fotograaf bij. Je kunt niets controleren." },
      ],
      verdict: "unverified",
      why: "Er is geen bewijs dat de foto nep is, maar ook geen manier om te controleren wat het is. Dan zeg je: niet te controleren.",
    },
  ],
  [
    {
      caption: "Voetbalclub Dorpsburg wint de bekerfinale met 3-1.",
      story: "Foto uit het wedstrijdverslag van de regionale krant.",
      sky: [0x9ddcff, 0xe5f6ff],
      ground: { y: 200, color: 0x3a8d3a },
      elements: [{ e: "🏟️", x: 280, y: 110, s: 110 }, { e: "🧍", x: 150, y: 250, s: 52 }, { e: "🧍", x: 230, y: 255, s: 52 }, { e: "🏆", x: 330, y: 250, s: 60 }, { e: "🧍", x: 420, y: 255, s: 52 }, { e: "⚽", x: 480, y: 280, s: 34 }],
      hotspots: [
        { x: 280, y: 110, r: 60, clue: "Op het bord staat '3 - 1'. Dat klopt met de uitslag in drie andere verslagen." },
        { x: 190, y: 252, r: 70, clue: "De shirts hebben het logo van de club uit het onderschrift." },
      ],
      verdict: "honest",
      why: "De details in de foto kloppen met het onderschrift en andere bronnen.",
    },
    {
      caption: "Hond redt kind uit het water, gisteren echt gebeurd!",
      story: "Het filmpje gaat rond met veel hartjes en 'Deel dit!'.",
      sky: [0x8fb8e8, 0xd5e6fb],
      ground: { y: 180, color: 0x2468a8 },
      elements: [{ e: "🌊", x: 200, y: 230, s: 90 }, { e: "🐕", x: 300, y: 240, s: 70 }, { e: "🧒", x: 380, y: 235, s: 56 }, { e: "🎥", x: 480, y: 120, s: 58 }, { e: "🪑", x: 100, y: 130, s: 50 }],
      hotspots: [
        { x: 480, y: 120, r: 46, clue: "Rechts boven staat een filmcamera in beeld." },
        { x: 100, y: 130, r: 40, clue: "Links staat een regisseursstoel met de tekst 'Director'. Dit is een filmset." },
      ],
      verdict: "misleading",
      why: "De beelden komen uit een film, maar worden als echt nieuws gedeeld. De context verandert alles.",
    },
    {
      caption: "Brief van de burgemeester: 'De school sluit voorgoed!'",
      story: "Een foto van een brief verspreidt zich razendsnel.",
      sky: [0xefe9d8, 0xf8f4e8],
      elements: [{ e: "📄", x: 280, y: 170, s: 210 }, { e: "🏛️", x: 100, y: 70, s: 60 }, { e: "✒️", x: 460, y: 260, s: 46 }],
      hotspots: [
        { x: 280, y: 190, r: 70, clue: "Eén zin heeft een ander lettertype en andere kleur dan de rest. Deze is later toegevoegd." },
        { x: 100, y: 70, r: 40, clue: "De gemeente zegt: deze brief hebben wij nooit verstuurd." },
      ],
      verdict: "misleading",
      why: "De brief is bewerkt. Er zijn aanwijzingen in de details en de afzender ontkent het.",
    },
  ],
]
