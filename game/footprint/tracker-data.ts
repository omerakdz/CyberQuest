export type Kind = "active" | "passive"

export type Activity = {
  icon: string
  title: string
  detail: string
  kind: Kind
  why: string
  clue: string
}

export type TrackerLevel = {
  character: string
  avatar: string
  intro: string
  activities: Activity[]
  picture: string
}

export const KIND_LABEL: Record<Kind, string> = { active: "ACTIEF", passive: "PASSIEF" }

export const TRACKER_INTRO = "Actief spoor: iets wat je zelf bewust deelt. Passief spoor: info die wordt verzameld terwijl je online bent, ook als je er niet bij nadenkt."

export const TRACKER_LEVELS: TrackerLevel[] = [
  {
    character: "Mila Pixel",
    avatar: "🧑‍🎤",
    intro: "Mila is een verzonnen meisje van 11 dat graag skatet en tekent. Volg haar dag online.",
    activities: [
      { icon: "📸", title: "Foto van haar skateboard posten", detail: "Mila plaatst een foto van haar nieuwe skateboard met de tekst 'Eindelijk mijn eigen board!'.", kind: "active", why: "Mila koos zelf om dit te delen. Dat is een actief spoor.", clue: "Heeft een skateboard" },
      { icon: "💬", title: "Reactie onder een tekenvideo", detail: "Ze schrijft onder een video: 'Wat een mooie tekening, ik wil dit ook leren!'.", kind: "active", why: "Een reactie typ je zelf en iedereen kan hem lezen. Actief spoor.", clue: "Wil leren tekenen" },
      { icon: "🌐", title: "Een skatewebsite bezoeken", detail: "Mila surft naar een webshop met skate-spullen. De website onthoudt via cookies welke pagina's ze bekeek.", kind: "passive", why: "Mila deelde niets bewust, maar de site verzamelt wel gegevens over haar bezoek. Passief spoor.", clue: "Bekeek skatespullen" },
      { icon: "👍", title: "Een video liken", detail: "Ze drukt op het duimpje bij een filmpje over skatetrucs.", kind: "active", why: "Een like is een bewuste actie die zichtbaar kan zijn voor anderen. Actief spoor.", clue: "Vindt skatetrucs leuk" },
      { icon: "🔍", title: "Zoeken op 'beste skatehelm'", detail: "Mila typt dit in een zoekmachine. De zoekmachine bewaart haar zoekopdracht.", kind: "passive", why: "Je geeft de zoekopdracht niet aan een persoon, maar hij wordt wel bewaard. Passief spoor.", clue: "Zocht een skatehelm" },
    ],
    picture: "Uit de losse sporen ontstaat een beeld: Mila houdt van skaten en tekenen en is op zoek naar een helm.",
  },
  {
    character: "Daan Byte",
    avatar: "🧑‍💻",
    intro: "Daan is een verzonnen jongen van 12 die gamet en filmpjes kijkt. Sommige sporen zie je niet meteen.",
    activities: [
      { icon: "📝", title: "Account maken voor een game", detail: "Daan verzint een gebruikersnaam (geen echte naam) en kiest zelf een avatar.", kind: "active", why: "Hij vult zelf gegevens in. Daarom is een account maken een actief spoor.", clue: "Gamer met eigen avatar" },
      { icon: "🍪", title: "Cookies accepteren", detail: "Een gamewebsite vraagt om cookies. Daan klikt snel op 'Alles accepteren'.", kind: "passive", why: "Cookies verzamelen op de achtergrond gegevens over wat hij doet. De bijhorende gegevens zijn passief.", clue: "Cookies volgen zijn gedrag" },
      { icon: "📍", title: "Foto met plaatsgegevens", detail: "Hij post een foto van zijn kamer. In het bestand staat verborgen informatie over waar de foto is gemaakt.", kind: "passive", why: "Daan deelt de foto zelf (actief), maar de verborgen plaatsgegevens gaan mee zonder dat hij het ziet. Dat deel is passief.", clue: "Foto verraadt de plek" },
      { icon: "▶️", title: "Filmpjes kijken", detail: "Een videosite houdt bij welke filmpjes Daan kijkt en hoe lang, om nieuwe filmpjes te adviseren.", kind: "passive", why: "Het kijkgedrag wordt automatisch bijgehouden. Passief spoor.", clue: "Kijkt gamefilmpjes" },
      { icon: "🎮", title: "Score delen in de game-chat", detail: "Hij typt: 'Ik haalde level 12 in één keer!' in een openbare chat.", kind: "active", why: "Een bericht in een openbare chat kiest hij zelf. Actief spoor.", clue: "Haalt level 12" },
      { icon: "📣", title: "Advertenties op maat", detail: "Na het kijken ziet hij reclame voor gaming-headsets in allerlei apps.", kind: "passive", why: "Reclame op maat komt voort uit verzamelde gegevens. Daan deelde dit niet bewust. Passief spoor.", clue: "Ziet headsetreclame" },
    ],
    picture: "De sporen laten zien wat Daan speelt, wanneer hij online is en waar hij een foto nam. Samen is dat veel meer dan één bericht.",
  },
  {
    character: "Noor Cloud",
    avatar: "👩‍🚀",
    intro: "Noor is een verzonnen meisje van 12 met een druk online leven. Let op: kleine sporen kunnen samen een groot geheel vormen.",
    activities: [
      { icon: "🎂", title: "Verjaardagsbericht plaatsen", detail: "Noor plaatst: 'Morgen word ik 13! Feestje in het park.'.", kind: "active", why: "Dit deelt ze zelf. Het verraadt wanneer en waar ze feest. Actief spoor.", clue: "Wordt morgen 13" },
      { icon: "📱", title: "Apparaatgegevens", detail: "Elke app weet welk toesteltype Noor gebruikt en welke taal en tijdzone is ingesteld.", kind: "passive", why: "Dit gaat automatisch mee. Passief spoor.", clue: "Toestel, taal en tijdzone" },
      { icon: "🏫", title: "Sportclub-tag", detail: "Ze tagt de naam van haar club bij een foto.", kind: "active", why: "Een tag voeg je zelf toe. Actief spoor, met informatie over waar ze vaak is.", clue: "Zit op een sportclub" },
      { icon: "🧭", title: "Locatie in een app", detail: "Een weer-app krijgt toestemming om haar locatie te volgen, ook als de app dicht is.", kind: "passive", why: "De locatie wordt automatisch doorgegeven. Passief spoor.", clue: "Locatie wordt gevolgd" },
      { icon: "🛍️", title: "Wensenlijstje in een webshop", detail: "Ze zet een paar spullen op een lijstje. De webshop bewaart het en toont haar later reclame.", kind: "active", why: "Het lijstje maakte ze zelf (actief). De reclame op maat die daarna komt, is een passief gevolg.", clue: "Heeft een wensenlijst" },
      { icon: "🖱️", title: "Hoe lang ze op een pagina blijft", detail: "Websites meten hoe lang Noor blijft hangen en waar ze klikt.", kind: "passive", why: "Dit meten ze zonder dat Noor iets deelt. Passief spoor.", clue: "Klikgedrag wordt gemeten" },
      { icon: "🎥", title: "Korte video uploaden", detail: "Noor uploadt een dansvideo voor haar vrienden.", kind: "active", why: "Een bewust gekozen upload is een actief spoor.", clue: "Plaatst dansvideo's" },
    ],
    picture: "Combineer de sporen en je weet wanneer Noor jarig is, waar ze sport, waar ze is en wat ze leuk vindt. Daarom is nadenken vooraf zo belangrijk.",
  },
]
