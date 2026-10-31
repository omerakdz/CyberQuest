export type Origin = "ai" | "human"

export type Piece = {
  kind: string
  title: string
  body: string
  art?: string
  origin: Origin
  // false means nobody could reliably tell from the content alone
  tellable: boolean
  clues: string
  why: string
}

const NOTE = "Alle voorbeelden zijn verzonnen en gemaakt voor deze les."

export const HUMAN_NOTE = NOTE

export const HUMAN_LEVELS: Piece[][] = [
  [
    {
      kind: "Gedicht", title: "De Zon",
      body: "De zon is geel, de lucht is blauw,\nde bloemen zijn mooi, de wereld is nieuw.\nHet leven is fijn, de dag is vol licht,\nen iedereen heeft een vrolijk gezicht.",
      origin: "ai", tellable: true,
      clues: "Het is netjes, vrolijk en heel algemeen. Er staat geen enkel persoonlijk detail in.",
      why: "In dit voorbeeld maakte een AI het gedicht. Algemene, nette teksten zonder eigen details kúnnen een aanwijzing zijn, maar mensen schrijven ook zulke gedichten.",
    },
    {
      kind: "Verhaaltje", title: "Kees de kat",
      body: "Mijn oma heeft een hond die Kees heet, maar eigenlijk is Kees een kat. Niemand weet waarom. Als je 'Kees, zit!' roept, kijkt hij je aan alsof je gek bent, en dan gaat hij in de fruitschaal liggen.",
      origin: "human", tellable: true,
      clues: "Het bevat grappige, rare en persoonlijke details waar je niet zo snel op komt.",
      why: "Dit schreef in dit voorbeeld een kind. Eigen herinneringen en rare details vind je vaak bij mensen, maar een AI kan ook zoiets verzinnen als je erom vraagt.",
    },
    {
      kind: "Tekst", title: "Hoe maak je een boterham?",
      body: "1. Pak twee sneetjes brood.\n2. Smeer boter op één sneetje.\n3. Leg beleg op de boter.\n4. Leg het andere sneetje erbovenop.\n5. Geniet van je heerlijke boterham!",
      origin: "ai", tellable: false,
      clues: "Het is heel overzichtelijk, maar een leraar of een kind kan dit net zo schrijven.",
      why: "Hier maakte een AI de tekst, maar je kunt dat niet zien. Een zorgvuldig mens schrijft precies hetzelfde. Dit is dus een voorbeeld waarbij 'weet ik niet' het eerlijkste antwoord is.",
    },
    {
      kind: "Tekening", title: "Een rare vogel",
      art: "🦜🌳☁️\n🌿🌿🥚",
      body: "Een vrolijke papegaai zit in een boom. Onder de boom ligt één ei.",
      origin: "human", tellable: false,
      clues: "Een simpele tekening zegt weinig over wie hem maakte.",
      why: "Een kind tekende dit in dit voorbeeld. Een eenvoudig plaatje kan van een mens of van een AI-programma komen. Aan alleen het plaatje zie je dat niet.",
    },
    {
      kind: "Mop", title: "De zieke computer",
      body: "Waarom ging de computer naar de dokter?\nHij had een virus!",
      origin: "ai", tellable: false,
      clues: "Deze mop kennen veel mensen al. Dat zegt niets over wie hem opschreef.",
      why: "Een AI schreef deze mop op in dit voorbeeld. Veel bekende grappen bestaan al lang, dus je kunt de maker niet herkennen. Controleer bij echte content altijd de bron.",
    },
  ],
  [
    {
      kind: "Nieuwsbericht", title: "Nieuw zwembad in Dorpsveld",
      body: "In Dorpsveld is een nieuw zwembad geopend. Het bad biedt een breed scala aan faciliteiten voor alle leeftijden. De gemeente benadrukt het belang van beweging voor een gezonde levensstijl.",
      origin: "ai", tellable: false,
      clues: "Het klinkt zakelijk, maar echte persberichten klinken precies zo.",
      why: "Dit tekstje maakte in dit voorbeeld een AI. Zakelijke tekst van mensen lijkt er sterk op. Je kunt de maker er niet aan afleiden; je moet de bron controleren.",
    },
    {
      kind: "Verhaal", title: "De ochtend van Sam",
      body: "Sam verslapen. Weer. Eén sok aan, één sok zoek, en de kat zat op zijn schooltas. 'Je bent een verrader,' mompelde hij, en rende zonder ontbijt de deur uit.",
      origin: "human", tellable: true,
      clues: "Korte stukjes, humor en een eigen toon. Zo schrijven veel mensen.",
      why: "Dit schreef een kind in dit voorbeeld. De eigen stem en het grapje zijn hints. Het is geen bewijs, want een AI kan ook zo imiteren.",
    },
    {
      kind: "Beschrijving", title: "Het robot-tekeningetje",
      art: "🤖🔧\n⚙️⚙️⚙️",
      body: "Een robot staat in een werkplaats met tandwielen.",
      origin: "ai", tellable: false,
      clues: "Een eenvoudige afbeelding of beschrijving kan van iedereen komen.",
      why: "Dit plaatje is in het voorbeeld door een AI-programma gemaakt. Maar een mens had het ook zo kunnen tekenen. Bij simpele afbeeldingen valt de maker niet te raden.",
    },
    {
      kind: "Gedicht", title: "Regen",
      body: "Tik tik tik op het dak,\nmijn sokken zijn nat, wat een gedoe.\nMaar zodra ik thuis ben, een kop thee erbij,\nen de regen mag blijven, ik doe niks meer vandaag.",
      origin: "human", tellable: false,
      clues: "Het rijmt maar half en klinkt persoonlijk, maar dat kan ook nagemaakt worden.",
      why: "Een kind schreef dit in het voorbeeld. Onregelmatigheden zijn vaak menselijk, maar AI kan ook onregelmatig schrijven. Dit is dus echt lastig te zeggen.",
    },
    {
      kind: "Tekst", title: "Mijn lievelingsdier",
      body: "Mijn lievelingsdier is de hond. Honden zijn trouw, vriendelijk en speels. Ze zijn de beste vrienden van de mens en brengen veel vreugde in ons leven.",
      origin: "ai", tellable: true,
      clues: "Het is vlot, maar zegt niets persoonlijks: geen naam, geen eigen verhaal.",
      why: "In dit voorbeeld schreef een AI het. Het ontbreken van eigen details is een hint, geen bewijs: ook mensen schrijven soms zo algemeen op school.",
    },
  ],
  [
    {
      kind: "Verhaal", title: "De laatste ijsco",
      body: "Er was er nog één. Mila en Joep keken naar de laatste ijsco in de vriezer. 'Steen, papier, schaar,' zei Joep. Mila won. Joep at de ijsco toch op toen ze naar de wc was.",
      origin: "human", tellable: false,
      clues: "Het is levendig en grappig, maar dat kunnen beide makers.",
      why: "Een mens schreef dit. Goede AI-teksten kunnen ook levendig zijn. Je kunt dit niet met zekerheid zeggen.",
    },
    {
      kind: "Uitleg", title: "Waarom is de lucht blauw?",
      body: "Zonlicht bestaat uit alle kleuren. Blauw licht botst vaker tegen de kleine deeltjes in de lucht en wordt daardoor in alle richtingen verstrooid. Daarom zien wij blauwe lucht.",
      origin: "human", tellable: false,
      clues: "Het is correct en duidelijk. Dat zijn ook de eigenschappen van goede uitleg van een leraar.",
      why: "Een leraar schreef dit in het voorbeeld. Een heldere uitleg zegt niets over de maker. Ook AI kan fouten maken, dus controleer feiten altijd.",
    },
    {
      kind: "Tekening", title: "Een stad in de wolken",
      art: "☁️🏙️☁️\n🌈✨🌈",
      body: "Een stad zweeft boven de wolken met een regenboog.",
      origin: "ai", tellable: false,
      clues: "Fantasieplaatjes kunnen door mensen én door AI gemaakt worden.",
      why: "Een AI-programma maakte dit in het voorbeeld. Je ziet dat niet aan het resultaat. Betrouwbaar nagaan kan alleen via de maker of de bron.",
    },
    {
      kind: "Tekst", title: "Een vakantiebrief",
      body: "Lieve oma, het strand is super! Gisteren heb ik een krab gevangen en hem Karel genoemd. Hij is helaas ontsnapt. Papa zegt dat dat de beste krab ooit was. Tot snel!",
      origin: "ai", tellable: false,
      clues: "Persoonlijke details lijken menselijk, maar een AI kan die verzinnen.",
      why: "Een AI schreef dit brief-voorbeeld. Wie denkt 'dit is persoonlijk, dus menselijk' kan zich vergissen. Tijdens het schrijven kan een AI persoonlijke details verzinnen.",
    },
    {
      kind: "Gedicht", title: "Maan",
      body: "De maan hangt scheef aan de nacht,\nalsof iemand haar vergat.\nIk zwaai even, ze zwaait niet terug,\nmaar dat is niet erg: ze heeft het druk.",
      origin: "human", tellable: false,
      clues: "Het is origineel en grappig, maar een AI kan ook originele beelden maken.",
      why: "Een mens schreef dit. Als je het niet kunt weten, is 'weet ik niet' juist het slimste antwoord. Echte verificatie vraagt om bewijs, zoals de maker of het bronbestand.",
    },
  ],
]
