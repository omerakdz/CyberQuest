export type ViralOption = {
  label: string
  points: number
  outcome: string
  reach: number
  deleted?: boolean
}

export type ViralScenario = {
  from: string
  avatar: string
  art: string
  post: string
  note: string
  options: ViralOption[]
  lesson: string
}

export const VIRAL_NOTE = "Alle personen, berichten en situaties zijn verzonnen. Geen echte accounts."

export const VIRAL_LEVELS: ViralScenario[][] = [
  [
    {
      from: "Kettingbericht", avatar: "⛓️", art: "✉️",
      post: "“Stuur dit door naar 10 vrienden, anders krijg je een week pech!”",
      note: "Een vriend stuurde je dit bericht door.",
      options: [
        { label: "📤 DELEN met 10 vrienden", points: 0, outcome: "Het bericht verspreidt zich razendsnel en jaagt anderen onnodig schrik aan. Er zit niets waars in.", reach: 240 },
        { label: "🚫 NIET DELEN", points: 100, outcome: "Je stopt de keten. Zo'n bericht heeft geen waarheid in zich en verdwijnt bij jou.", reach: 1 },
        { label: "🔎 EERST CONTROLEREN", points: 70, outcome: "Slim om te checken. Je vindt snel dat het onzin is. Daarna niet delen is de beste stap.", reach: 1 },
      ],
      lesson: "Kettingberichten zijn vaak onzin. Stuur ze niet door.",
    },
    {
      from: "Nieuwsflits_24", avatar: "📰", art: "🚨",
      post: "“BREAKING: alle scholen sluiten morgen!!! Deel dit snel!”",
      note: "Het account ken je niet en er staat geen bron bij.",
      options: [
        { label: "📤 DELEN", points: 0, outcome: "Het bericht klopte niet, maar het is al honderden keren gedeeld. Veel mensen raken in de war.", reach: 400 },
        { label: "🚫 NIET DELEN", points: 70, outcome: "Je deelt geen onwaarheid, maar je weet nog niet of het klopt.", reach: 1 },
        { label: "🔎 EERST CONTROLEREN", points: 100, outcome: "Je zoekt het op bij de officiële schoolwebsite en ziet dat het nep is. Zo help je anderen niet misleiden.", reach: 1 },
      ],
      lesson: "Check de bron voor je nieuws deelt.",
    },
    {
      from: "Jij", avatar: "🧑", art: "🎨",
      post: "Een foto van jouw tekening van een draak. Er staat niets over jou op.",
      note: "Je bent trots op je werk.",
      options: [
        { label: "📤 DELEN met vrienden", points: 100, outcome: "Je vrienden vinden het mooi. Het is jouw werk en er staat geen privé-informatie op.", reach: 12 },
        { label: "🚫 NIET DELEN", points: 60, outcome: "Prima, maar je mag trots zijn. Dit is een veilige post.", reach: 1 },
        { label: "🙋 TOESTEMMING VRAGEN", points: 40, outcome: "Dat hoeft niet. Het is je eigen tekening zonder andere mensen erop.", reach: 1 },
      ],
      lesson: "Eigen werk zonder privé-info kun je gerust delen met vrienden.",
    },
    {
      from: "Jij", avatar: "🧑", art: "🐶🏠",
      post: "Een foto van jouw hond voor de voordeur. Je huisnummer staat er duidelijk op.",
      note: "Je wilt hem laten zien aan vrienden.",
      options: [
        { label: "📤 DELEN zoals het is", points: 20, outcome: "Je huisnummer is zichtbaar. Iemand kan zo zien waar je woont.", reach: 150 },
        { label: "✂️ EERST BIJSNIJDEN, DAN DELEN", points: 100, outcome: "Je snijdt het huisnummer weg. Je hond is schattig en je adres blijft privé.", reach: 14 },
        { label: "🚫 NIET DELEN", points: 70, outcome: "Veilig, maar met een kleine aanpassing kun je het toch leuk delen.", reach: 1 },
      ],
      lesson: "Kijk naar de achtergrond: ook huisnummers en straten verraden veel.",
    },
  ],
  [
    {
      from: "Feestfoto", avatar: "🎂", art: "🤪",
      post: "Een groepsfoto van het verjaardagsfeestje. Je vriend Bo staat er met zijn mond wijd open op.",
      note: "Het is een grappige foto, maar Bo staat er niet fijn op.",
      options: [
        { label: "📤 DELEN", points: 10, outcome: "Bo schaamt zich. De foto wordt opgeslagen en doorgestuurd. Vragen had gekund.", reach: 120 },
        { label: "🙋 EERST TOESTEMMING VRAGEN", points: 100, outcome: "Bo zegt dat hij liever een andere foto heeft. Jullie kiezen er samen één en iedereen is blij.", reach: 8 },
        { label: "🚫 NIET DELEN", points: 70, outcome: "Je beschermt Bo. Vragen aan hem is nog netter.", reach: 1 },
      ],
      lesson: "Vraag toestemming voordat je een foto van een ander deelt.",
    },
    {
      from: "Groepschat", avatar: "💬", art: "📱",
      post: "Een screenshot van een privé-gesprek. Je vriendin Eva vertelt dat ze verliefd is.",
      note: "Eva stuurde dit alleen aan jou.",
      options: [
        { label: "📤 DOORSTUREN naar één vriend", points: 10, outcome: "Die vriend stuurt het weer door. Eva's geheim is nu bij heel de klas bekend.", reach: 60 },
        { label: "🚫 NIET DOORSTUREN", points: 100, outcome: "Jij houdt Eva's geheim. Zo blijf je een betrouwbare vriend.", reach: 1 },
        { label: "🙋 EERST AAN EVA VRAGEN", points: 60, outcome: "Netjes, maar een privébericht stuur je meestal gewoon niet door.", reach: 1 },
      ],
      lesson: "Privéberichten van anderen blijven privé.",
    },
    {
      from: "Schoolplein", avatar: "🏫", art: "😬",
      post: "Een filmpje van een klasgenoot die struikelt in de kantine.",
      note: "Je vindt het grappig, maar hij ziet er beteuterd uit.",
      options: [
        { label: "📤 DELEN", points: 0, outcome: "Het filmpje gaat rond en de klasgenoot wordt uitgelachen. Dat blijft online staan.", reach: 500 },
        { label: "🚫 NIET DELEN", points: 100, outcome: "Je laat hem met rust. Voor hem is dit pijnlijk, ook al is het 'maar een filmpje'.", reach: 1 },
        { label: "🙋 TOESTEMMING VRAGEN", points: 60, outcome: "Goed dat je denkt aan zijn mening. Maar ook als hij 'ja' zegt, kan hij zich later schamen.", reach: 4 },
      ],
      lesson: "Lachen om iemand die zich pijn doet of schaamt is geen reden om te delen.",
    },
    {
      from: "Familie", avatar: "👵", art: "💇",
      post: "Een foto van je oma met haar nieuwe kapsel. Ze vindt het zelf leuk.",
      note: "Je wilt hem op je profiel zetten.",
      options: [
        { label: "📤 DELEN", points: 40, outcome: "Je vroeg niet om toestemming. Ook bij familie is vragen netter, want je weet niet wie de foto verder deelt.", reach: 30 },
        { label: "🙋 EERST TOESTEMMING VRAGEN", points: 100, outcome: "Oma zegt blij: 'Natuurlijk!' en vraagt of je niet de straat laat zien. Samen kiezen jullie een goede foto.", reach: 12 },
        { label: "🚫 NIET DELEN", points: 70, outcome: "Veilig, maar met toestemming kan het prima.", reach: 1 },
      ],
      lesson: "Toestemming vragen is een teken van respect.",
    },
  ],
  [
    {
      from: "Jij", avatar: "🧑", art: "😜",
      post: "Je plaatste vanochtend een grappige foto. Nu voel je je er niet fijn bij.",
      note: "Drie vrienden hebben hem al gezien.",
      options: [
        { label: "🗑️ ACHTERAF VERWIJDEREN", points: 60, outcome: "De foto is weg bij jou. Maar twee vrienden hadden een screenshot gemaakt. Kopieën kunnen blijven bestaan.", reach: 20, deleted: true },
        { label: "⏳ LATEN STAAN", points: 10, outcome: "De foto blijft zichtbaar en wordt weer gedeeld. Je hebt geen controle meer.", reach: 90 },
        { label: "🙋 VERWIJDEREN + VRIENDEN VRAGEN OOK TE WISSEN", points: 100, outcome: "Je vrienden helpen en wissen hun kopieën. Zo is de kans kleiner dat de foto blijft ronddwalen.", reach: 6, deleted: true },
      ],
      lesson: "Verwijderen helpt, maar kopieën kunnen blijven bestaan. Denk dus eerst.",
    },
    {
      from: "Roddel_Kanaal", avatar: "🗣️", art: "🤫",
      post: "“Meester Jan zou ontslagen zijn! Zag je dat? Deel maar door!”",
      note: "Er staat geen bewijs bij.",
      options: [
        { label: "📤 DELEN", points: 0, outcome: "De roddel verspreidt zich en het blijkt onwaar. De meester voelt zich gekwetst en jij ook.", reach: 350 },
        { label: "🔎 EERST CONTROLEREN", points: 100, outcome: "Je vraagt het aan een volwassene. Het blijkt onwaar. Je deelt niets.", reach: 1 },
        { label: "🚫 NIET DELEN", points: 80, outcome: "Goed, je verspreidt het niet. Checken of het waar is, kan ook helpen.", reach: 1 },
      ],
      lesson: "Geruchten zijn niet altijd waar en kunnen mensen kwetsen.",
    },
    {
      from: "Anoniem", avatar: "❓", art: "💬",
      post: "Je krijgt een screenshot van een privébericht van een klasgenoot, met de tekst 'Deel dit!'",
      note: "Het bericht was nooit bedoeld voor jou.",
      options: [
        { label: "📤 DELEN", points: 0, outcome: "Het bericht gaat door de hele school. De klasgenoot voelt zich vreselijk.", reach: 300 },
        { label: "🚫 NIET DELEN", points: 80, outcome: "Goed gedaan. Je vertelt het ook best aan een volwassene.", reach: 1 },
        { label: "🧑‍🏫 MELDEN BIJ EEN VOLWASSENE", points: 100, outcome: "Een volwassene helpt om het bericht te laten verwijderen en de klasgenoot te steunen.", reach: 2 },
      ],
      lesson: "Een privébericht dat bij jou terechtkomt, deel je niet verder.",
    },
    {
      from: "Jij", avatar: "🧑", art: "🎉🏠",
      post: "Je plaatste openbaar: “Feestje bij mij thuis, zaterdag om 15:00!” met je adres erbij.",
      note: "Veel meer mensen dan je vrienden kunnen dit zien.",
      options: [
        { label: "⏳ OPENBAAR LATEN STAAN", points: 0, outcome: "Vreemden zien je adres en de tijd. Dat kun je niet meer terughalen.", reach: 400 },
        { label: "🗑️ ALLEEN VERWIJDEREN", points: 60, outcome: "Je verwijdert het bericht, maar sommigen hadden het al opgeslagen of doorgestuurd.", reach: 40, deleted: true },
        { label: "✉️ VERWIJDEREN + ADRES PRIVÉ DOORGEVEN", points: 100, outcome: "Je verwijdert het en geeft het adres via een privébericht aan de uitgenodigde vrienden.", reach: 8, deleted: true },
      ],
      lesson: "Deel adressen en tijden alleen privé met mensen die je kent.",
    },
    {
      from: "Jij", avatar: "🧑", art: "🤝",
      post: "Een foto van jou en je vriend Luca bij het skatepark. Luca zegt: “Ja, deel maar, ik vind hem leuk.”",
      note: "Luca heeft duidelijk toestemming gegeven.",
      options: [
        { label: "📤 DELEN met vrienden", points: 100, outcome: "Dankzij de toestemming is dit prima. Je let er ook op dat het skatepark niet te herkennen is.", reach: 15 },
        { label: "🚫 NIET DELEN", points: 60, outcome: "Dat mag, maar met toestemming kun je het leuk delen.", reach: 1 },
        { label: "🙋 NOGMAALS VRAGEN", points: 70, outcome: "Dat is netjes. Hij zei al ja, dus je kunt delen.", reach: 1 },
      ],
      lesson: "Met duidelijke toestemming kun je veilig delen.",
    },
  ],
]
