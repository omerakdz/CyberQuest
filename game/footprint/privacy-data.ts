export type Visibility = "public" | "friends" | "private"

export type ProfileItem = { icon: string; label: string; sample: string; best: Visibility; why: string }
export type Setting = { label: string; ideal: boolean; why: string }
export type ScenarioOption = { label: string; points: number; feedback: string }
export type Scenario = { from: string; avatar: string; message: string; options: ScenarioOption[] }

export type PrivacyLevel = {
  username: string
  avatar: string
  bio: string
  items: ProfileItem[]
  settings: Setting[]
  scenarios: Scenario[]
}

export const VIS_LABEL: Record<Visibility, string> = { public: "OPENBAAR", friends: "VRIENDEN", private: "PRIVÉ" }
export const VIS_ICON: Record<Visibility, string> = { public: "🌍", friends: "👥", private: "🔒" }
export const VIS_ORDER: Visibility[] = ["public", "friends", "private"]

export const PRIVACY_NOTE = "Alle profielen zijn verzonnen. Vul nooit je echte naam, adres, school, telefoonnummer of wachtwoord in."

export const PRIVACY_LEVELS: PrivacyLevel[] = [
  {
    username: "PixelPanda_07",
    avatar: "🐼",
    bio: "Nieuw profiel van een verzonnen kind. Houdt van tekenen en dieren.",
    items: [
      { icon: "🖼️", label: "Profielfoto", sample: "Een tekening van een panda (geen echt gezicht).", best: "public", why: "Een tekening verraadt niets over wie je bent. Openbaar is prima." },
      { icon: "🎨", label: "Favoriete hobby", sample: "Tekenen en dieren.", best: "friends", why: "Een hobby is niet erg, maar vrienden zijn genoeg. Zo kent niet iedereen je interesses." },
      { icon: "🎂", label: "Verjaardag met jaartal", sample: "12 mei 2014.", best: "private", why: "Een volledige geboortedatum kan gebruikt worden om je te volgen of een account te misbruiken." },
      { icon: "🏠", label: "Thuisadres", sample: "Verzonnen: Pixelstraat 1.", best: "private", why: "Je adres hoort nooit openbaar. Alleen jij en je ouders hoeven het te weten." },
    ],
    settings: [
      { label: "Iedereen mag mijn profiel vinden", ideal: false, why: "Beter alleen vrienden. Dan vinden vreemden je minder makkelijk." },
      { label: "Locatie delen bij foto's", ideal: false, why: "Foto's met locatie verraden waar je bent of woont." },
      { label: "Vriendschapsverzoeken van vreemden toestaan", ideal: false, why: "Accepteer alleen mensen die je echt kent." },
    ],
    scenarios: [
      { from: "SuperFan_99", avatar: "🧢", message: "Hoi! Leuk profiel. Op welke school zit jij? Dan kunnen we misschien samen spelen!", options: [
        { label: "Mijn schoolnaam intypen", points: 0, feedback: "Met je school kan iemand je vinden. Deel dit niet met mensen die je niet kent." },
        { label: "Niet antwoorden en het aan een volwassene vertellen", points: 100, feedback: "Slim! Je hoeft niet te antwoorden en een volwassene kan helpen." },
        { label: "Zeggen dat je dat liever niet zegt", points: 70, feedback: "Ook veilig, al is niet reageren nog beter bij vreemden." },
      ] },
      { from: "WinnerBot", avatar: "🤖", message: "Gefeliciteerd! Je wint een prijs. Typ hier je telefoonnummer om hem op te halen.", options: [
        { label: "Mijn nummer geven", points: 0, feedback: "Dit is waarschijnlijk oplichting. Geef nooit je nummer voor een 'prijs'." },
        { label: "Het bericht negeren en melden", points: 100, feedback: "Goed gedaan! Zo help je ook anderen." },
        { label: "Eerst aan mijn ouders laten zien", points: 90, feedback: "Ook slim. Zo kijkt een volwassene mee." },
      ] },
    ],
  },
  {
    username: "StarGamer_21",
    avatar: "🦊",
    bio: "Verzonnen gamer van 12. Plaatst scores, foto's en filmpjes.",
    items: [
      { icon: "🕹️", label: "Highscore van een game", sample: "Level 14 gehaald!", best: "public", why: "Een score verraadt niets over je privéleven. Openbaar kan." },
      { icon: "📸", label: "Foto van jouw gezicht", sample: "Selfie met de verzonnen vos-hoodie.", best: "friends", why: "Je gezicht deel je liever met mensen die je kent." },
      { icon: "🏫", label: "Foto in schooluniform met schoolnaam", sample: "Verzonnen: 'Pixel Primary'.", best: "private", why: "School en gezicht samen laten vreemden zien waar je overdag bent." },
      { icon: "📞", label: "Telefoonnummer", sample: "Verzonnen: 06-0000 0000.", best: "private", why: "Je nummer is alleen voor mensen die je écht vertrouwt." },
      { icon: "✈️", label: "Vakantieplannen", sample: "'Volgende week een week weg met het hele gezin!'", best: "friends", why: "Iedereen hoeft niet te weten dat je huis leeg staat. Vrienden volstaat, of wacht tot je terug bent." },
    ],
    settings: [
      { label: "Iedereen mag mijn berichten lezen", ideal: false, why: "Beperk je berichten tot vrienden." },
      { label: "Locatie delen in de game", ideal: false, why: "Locatie in een game laat zien waar je bent." },
      { label: "Ik moet getagd worden goedkeuren", ideal: true, why: "Zo bepaal jij zelf welke foto's aan jou gekoppeld worden." },
      { label: "Vreemden mogen mij privéberichten sturen", ideal: false, why: "Laat alleen vrienden je berichten sturen." },
    ],
    scenarios: [
      { from: "CoolCoach_X", avatar: "🕶️", message: "Ik help je met gamen. Stuur me je wachtwoord, dan haal ik jouw level voor je.", options: [
        { label: "Wachtwoord sturen", points: 0, feedback: "Nooit je wachtwoord delen, ook niet met 'helpers'. Dan neemt iemand je account over." },
        { label: "Nee zeggen, blokkeren en melden", points: 100, feedback: "Sterk! Een wachtwoord is geheim." },
        { label: "Een nep-wachtwoord sturen", points: 30, feedback: "Beter niet reageren. Spelen met vreemden blijft risicovol." },
      ] },
      { from: "Nieuwe_Vriend", avatar: "🙂", message: "Hé, we praten al een tijdje. Wat is jouw echte naam en waar woon je?", options: [
        { label: "Mijn echte naam en woonplaats vertellen", points: 0, feedback: "Vertel online nooit je naam en plaats aan iemand die je niet kent." },
        { label: "Zeggen dat je dat niet deelt", points: 80, feedback: "Goed! Je bepaalt wat je vertelt." },
        { label: "Stoppen met praten en een volwassene vertellen", points: 100, feedback: "Perfect. Bij persoonlijke vragen van vreemden praat je met een volwassene." },
      ] },
    ],
  },
  {
    username: "NovaNinja_33",
    avatar: "🦄",
    bio: "Verzonnen profiel met veel foto's. Let goed op wat je laat zien.",
    items: [
      { icon: "🎵", label: "Lievelingsmuziek", sample: "Speellijst 'Gamemuziek'.", best: "public", why: "Muzieksmaak is onschuldig. Openbaar mag." },
      { icon: "👨‍👩‍👧", label: "Foto met familie", sample: "Verzonnen familie bij de kerstboom.", best: "friends", why: "Familie komt ook in beeld. Deel alleen met vrienden en vraag toestemming." },
      { icon: "🏃", label: "Sporttraining met tijd en plek", sample: "'Elke woensdag 17:00, veld 2.'", best: "private", why: "Zo weet iemand precies waar jij wanneer bent." },
      { icon: "🔑", label: "Wachtwoord in een bericht", sample: "Verzonnen: 'mijnWachtwoord123'.", best: "private", why: "Een wachtwoord deel je nooit. Ook niet 'even snel'." },
      { icon: "🐶", label: "Foto van je huisdier", sample: "Verzonnen hond Bram.", best: "public", why: "Een foto van een huisdier verraadt weinig. Openbaar kan, zolang je huis niet te zien is." },
      { icon: "📧", label: "E-mailadres", sample: "Verzonnen: nova@example.test", best: "private", why: "Met je e-mailadres kunnen vreemden je spam of oplichting sturen." },
    ],
    settings: [
      { label: "Iedereen mag mijn foto's downloaden", ideal: false, why: "Dan kunnen foto's overal terechtkomen." },
      { label: "Tweestapsverificatie aan", ideal: true, why: "Een extra stap maakt inbreken veel moeilijker." },
      { label: "Mijn profiel verschijnt in zoekresultaten", ideal: false, why: "Hou je profiel minder vindbaar voor vreemden." },
      { label: "Reacties van iedereen toestaan", ideal: false, why: "Laat alleen vrienden reageren." },
    ],
    scenarios: [
      { from: "Account_Helper", avatar: "⚠️", message: "Je account wordt gesloten! Klik op deze link en log in om het te redden.", options: [
        { label: "Op de link klikken en inloggen", points: 0, feedback: "Dit is phishing. Klik niet en vul nergens wachtwoorden in." },
        { label: "Niet klikken, melden en het aan een volwassene tonen", points: 100, feedback: "Super! Zo blijft je account veilig." },
        { label: "Een vriend vragen wat hij ervan vindt", points: 60, feedback: "Veilig, maar de beste keuze is een volwassene erbij te halen." },
      ] },
      { from: "Vriend_van_Vriend", avatar: "🤝", message: "Ik ken Sam. Mag ik je foto's van jouw verjaardag zien? Stuur ze maar door!", options: [
        { label: "Alle foto's sturen", points: 10, feedback: "Je kent deze persoon niet echt. Foto's kunnen verder gedeeld worden." },
        { label: "Eerst checken of ik hem echt ken", points: 90, feedback: "Slim. Controleer wie iemand echt is, bijvoorbeeld via een volwassene." },
        { label: "Nee zeggen en blokkeren", points: 100, feedback: "Veilig gekozen." },
      ] },
      { from: "NieuwGame_Club", avatar: "🎯", message: "Vul dit formulier in met je naam, school en geboortedatum om lid te worden.", options: [
        { label: "Alles invullen", points: 0, feedback: "Een spel hoeft niet je school en geboortedatum te weten." },
        { label: "Eerst met mijn ouders bekijken", points: 100, feedback: "Goed. Zo kijkt een volwassene mee en bespreek je wat nodig is." },
        { label: "Alleen een bijnaam invullen", points: 70, feedback: "Een bijnaam is veel veiliger. Overleg toch altijd even met een volwassene." },
      ] },
    ],
  },
]
