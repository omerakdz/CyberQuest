export type CrimeObject = { id: string; icon: string; label: string; clue: string }
export type CrimeClue = { id: string; text: string }
export type CrimeLink = { a: string; b: string; deduction: string }
export type CrimeQuestion = { q: string; options: string[]; answer: number; explain: string }

export type Mystery = {
  title: string
  intro: string
  objects: CrimeObject[]
  clues: CrimeClue[]
  links: CrimeLink[]
  questions: CrimeQuestion[]
}

export const MYSTERIES: Mystery[] = [
  {
    title: "Het verdwenen werkstuk",
    intro: "Het werkstuk van de klas is van PC-3 gewist! Verdachten: Tom, Lars en Noor. Onderzoek de objecten.",
    objects: [
      { id: "pc", icon: "🖥", label: "PC-3", clue: "Het werkstuk is om 14:12 verwijderd vanaf PC-3." },
      { id: "door", icon: "🚪", label: "Deurlog", clue: "Badge van Noor opende het lokaal om 14:05." },
      { id: "printer", icon: "🖨", label: "Printer", clue: "Om 14:10 werd er geprint vanaf PC-3." },
      { id: "chat", icon: "💬", label: "Klaschat", clue: "Lars schreef om 14:11: 'ik zit al in de klas'." },
      { id: "note", icon: "📝", label: "Briefje", clue: "Briefje: 'Wachtwoord van PC-3 kent iedereen.'" },
      { id: "janitor", icon: "🧹", label: "Conciërge", clue: "Tom was van 14:00 tot 14:20 bij de conciërge." },
    ],
    clues: [
      { id: "pc", text: "Werkstuk verwijderd 14:12 (PC-3)" },
      { id: "door", text: "Noors badge opende lokaal 14:05" },
      { id: "printer", text: "Print vanaf PC-3 om 14:10" },
      { id: "chat", text: "Lars zat om 14:11 in de klas" },
      { id: "note", text: "Iedereen kent het PC-3 wachtwoord" },
      { id: "janitor", text: "Tom was 14:00-14:20 bij conciërge" },
    ],
    links: [
      { a: "pc", b: "printer", deduction: "Op PC-3 werd eerst geprint en daarna gewist: één persoon zat daar bezig." },
      { a: "door", b: "pc", deduction: "Noor was om 14:05 in het lokaal, dus ze had de kans om om 14:12 te wissen." },
      { a: "chat", b: "janitor", deduction: "Lars en Tom hebben allebei een alibi voor die tijd." },
    ],
    questions: [
      { q: "Wie wiste het werkstuk?", options: ["Tom", "Lars", "Noor"], answer: 2, explain: "Noor was in het lokaal en de anderen hebben een alibi." },
      { q: "Welk bewijs plaatst iemand in het lokaal?", options: ["De deurlog met badge", "De klaschat", "Het briefje"], answer: 0, explain: "De badge-log laat precies zien wie binnenkwam." },
      { q: "Waarom is het briefje een afleiding?", options: ["Het bewijst dat Tom schuldig is", "Iedereen kon inloggen, het wijst niemand aan", "Het is een nepbriefje"], answer: 1, explain: "Als iedereen het wachtwoord kent, bewijst inloggen niets." },
    ],
  },
  {
    title: "Het gehackte account",
    intro: "Het gamer-account van Sam is leeggehaald. 12 skins zijn weg! Hoe gebeurde dit?",
    objects: [
      { id: "mail", icon: "✉", label: "Mailbox", clue: "Bericht van SkinKing99: 'Log in via skinsnu-gratis.com voor gratis skins!'" },
      { id: "history", icon: "🌐", label: "Browser", clue: "Om 16:48 werd skinsnu-gratis.com bezocht en er werd ingelogd." },
      { id: "alert", icon: "🔔", label: "Melding", clue: "Om 16:52: 'Nieuw apparaat heeft ingelogd op je account.'" },
      { id: "inventory", icon: "🎒", label: "Inventaris", clue: "Om 16:55 zijn 12 skins naar 'SkinKing99' gestuurd." },
      { id: "sister", icon: "👧", label: "Lotte", clue: "Zusje Lotte was om 16:50 buiten, haar tablet stond uit." },
      { id: "sticky", icon: "📌", label: "Plakbriefje", clue: "Een briefje met een oud wachtwoord ligt naast de pc." },
    ],
    clues: [
      { id: "mail", text: "SkinKing99 stuurde een gratis-skins link" },
      { id: "history", text: "16:48 ingelogd op skinsnu-gratis.com" },
      { id: "alert", text: "16:52 nieuw apparaat logde in" },
      { id: "inventory", text: "16:55 skins gestuurd naar SkinKing99" },
      { id: "sister", text: "Lotte was buiten, tablet uit" },
      { id: "sticky", text: "Oud wachtwoord op een briefje" },
    ],
    links: [
      { a: "mail", b: "history", deduction: "Sam klikte op de link van SkinKing99 en vulde zijn wachtwoord in op een nepsite." },
      { a: "history", b: "alert", deduction: "Kort na het invullen logde een vreemd apparaat in: het wachtwoord was gestolen." },
      { a: "alert", b: "inventory", deduction: "Direct na het inloggen stuurde de hacker de skins naar zichzelf." },
    ],
    questions: [
      { q: "Hoe kwam de hacker aan het wachtwoord?", options: ["Via een phishing-link", "Door te raden", "Via Lotte"], answer: 0, explain: "De nepsite vroeg om in te loggen: dat is phishing." },
      { q: "Wie kreeg de skins?", options: ["Lotte", "SkinKing99", "Sam zelf"], answer: 1, explain: "Het logboek toont de overdracht aan SkinKing99." },
      { q: "Wat had Sam moeten doen?", options: ["Op de link klikken en snel inloggen", "De link negeren en alleen via de officiële app inloggen", "Het wachtwoord naar een vriend sturen"], answer: 1, explain: "Log alleen in via de officiële site of app, nooit via een link van een vreemde." },
    ],
  },
  {
    title: "Het gelekte spelplan",
    intro: "Het geheime spelplan van de studio is gelekt naar een rivaal. Iris lijkt de dader, maar klopt dat wel?",
    objects: [
      { id: "usb", icon: "💾", label: "USB-log", clue: "Om 16:20 werd het plan naar een USB-stick gekopieerd op PC-2 met Iris' account." },
      { id: "agenda", icon: "📅", label: "Agenda", clue: "Iris zat van 16:00 tot 16:45 in een vergadering." },
      { id: "door", icon: "🚪", label: "Deurlog", clue: "Joris was van 16:10 tot 16:30 in de kamer met PC-2." },
      { id: "sticky", icon: "📌", label: "Plakbriefje", clue: "Op PC-2 plakt een briefje: 'Iris2024'." },
      { id: "chat", icon: "💬", label: "Chat", clue: "Joris schreef aan RivaalStudio: 'ik stuur het plan zo'." },
      { id: "holiday", icon: "🏖", label: "Verlof", clue: "Pieter heeft deze week vakantie." },
    ],
    clues: [
      { id: "usb", text: "16:20 kopie via Iris' account (PC-2)" },
      { id: "agenda", text: "Iris in vergadering 16:00-16:45" },
      { id: "door", text: "Joris in de kamer 16:10-16:30" },
      { id: "sticky", text: "Wachtwoord 'Iris2024' op briefje" },
      { id: "chat", text: "Joris schreef aan RivaalStudio" },
      { id: "holiday", text: "Pieter heeft vakantie" },
    ],
    links: [
      { a: "usb", b: "agenda", deduction: "Iris' account werd gebruikt terwijl zij in een vergadering zat: iemand anders logde in met haar account." },
      { a: "sticky", b: "usb", deduction: "Het wachtwoord lag open en bloot, dus iedereen kon als Iris inloggen." },
      { a: "door", b: "usb", deduction: "Joris was precies in de kamer toen het plan gekopieerd werd." },
      { a: "chat", b: "door", deduction: "Joris had contact met de rivaal en de gelegenheid om te lekken." },
    ],
    questions: [
      { q: "Wie lekte het plan waarschijnlijk?", options: ["Iris", "Joris", "Pieter"], answer: 1, explain: "Joris was in de kamer en had contact met de rivaal." },
      { q: "Waarom is Iris niet de dader?", options: ["Ze was in een vergadering toen het gebeurde", "Ze heeft geen account", "De USB was van haar"], answer: 0, explain: "Haar agenda toont dat ze er niet kon zijn." },
      { q: "Wat ging er mis met de beveiliging?", options: ["De deur stond open", "Het wachtwoord stond op een briefje", "De USB was kapot"], answer: 1, explain: "Een wachtwoord hoort geheim te blijven." },
      { q: "Wat is een goede les?", options: ["Wachtwoorden delen met collega's", "Vergrendel je pc en houd wachtwoorden geheim", "Nooit meer vergaderen"], answer: 1, explain: "Vergrendel je scherm en bewaar wachtwoorden veilig." },
    ],
  },
]
