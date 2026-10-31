export type ChoiceRound = { q: string; options: string[]; answer: number; explain: string }

export const CHOICE_LEVELS: Record<number, { title: string; intro: string; rounds: ChoiceRound[] }> = {
  1: {
    title: "Zwak of sterk?",
    intro: "Kies steeds het sterkste wachtwoord. Lang, uniek en niet te raden is sterk.",
    rounds: [
      { q: "Welk wachtwoord is het sterkst?", options: ["123456", "Mila2012", "Blauwe-Draak-Fiets#42"], answer: 2, explain: "Lang, met losse woorden, een cijfer en een teken. Dat is moeilijk te raden." },
      { q: "Welk wachtwoord is het sterkst?", options: ["wachtwoord", "K9$mP2!vQzRt", "hond123"], answer: 1, explain: "Willekeurig en lang. De andere twee staan in elke lijst met veelgebruikte wachtwoorden." },
      { q: "Welk wachtwoord is het sterkst?", options: ["qwerty", "Voetbal1", "Zon&Maan-Regen-77!"], answer: 2, explain: "Een zin van losse woorden met tekens is lang en toch te onthouden." },
    ],
  },
  2: {
    title: "Sorteer de sloten",
    intro: "Beslis per wachtwoord: ZWAK of STERK? Drie fouten en het alarm gaat af!",
    rounds: [
      { q: "123456", options: ["ZWAK", "STERK"], answer: 0, explain: "Het meest gebruikte wachtwoord ter wereld. In een seconde gekraakt." },
      { q: "Blauwe-Draak-Fiets#42", options: ["ZWAK", "STERK"], answer: 1, explain: "Lang en met woorden, cijfers en een teken." },
      { q: "wachtwoord", options: ["ZWAK", "STERK"], answer: 0, explain: "Een woord uit het woordenboek raad je meteen." },
      { q: "Zon&Maan-Regen-77!", options: ["ZWAK", "STERK"], answer: 1, explain: "Lang en onvoorspelbaar." },
      { q: "Sem2013", options: ["ZWAK", "STERK"], answer: 0, explain: "Naam plus geboortejaar is makkelijk te raden." },
      { q: "iloveyou", options: ["ZWAK", "STERK"], answer: 0, explain: "Een populair wachtwoord dat hackers als eerste proberen." },
      { q: "pR8!tZ#kV2mQ", options: ["ZWAK", "STERK"], answer: 1, explain: "Willekeurig, lang en met verschillende soorten tekens." },
      { q: "hond", options: ["ZWAK", "STERK"], answer: 0, explain: "Te kort en een gewoon woord." },
    ],
  },
  3: {
    title: "Denk als een hacker",
    intro: "Je kent een paar feiten over iemand. Welk wachtwoord zou een hacker het eerst proberen?",
    rounds: [
      { q: "Mila (12) heeft een hond Bruno en is geboren in 2012.", options: ["Bruno2012", "xT7#pQ!9zLw", "Zeil-Boot-Koek-81"], answer: 0, explain: "Hackers proberen eerst namen, huisdieren en jaartallen." },
      { q: "Sem is fan van Ajax en draagt rugnummer 10.", options: ["Ajax10", "N4$kx!Q7pzA", "Zwerm-Koffie-31"], answer: 0, explain: "Een favoriete club plus nummer is zeer voorspelbaar." },
      { q: "Lotte houdt van de kleur roze en is jarig op 3 mei.", options: ["Roze0305", "Pq9#Lm!2xVd", "Kaas-Tijger-88!"], answer: 0, explain: "Persoonlijke dingen horen niet in je wachtwoord." },
    ],
  },
  5: {
    title: "Wat doe je?",
    intro: "Kies in elke situatie het slimste antwoord.",
    rounds: [
      { q: "Een vriend vraagt je wachtwoord voor jouw spel. Wat doe je?", options: ["Geven, hij is mijn vriend", "Nee, mijn wachtwoord blijft geheim", "Een half wachtwoord geven"], answer: 1, explain: "Wachtwoorden deel je met niemand, behalve met je ouders." },
      { q: "Je krijgt een melding dat je account is gehackt. Eerste stap?", options: ["Negeren", "Op de link in de melding klikken", "Zelf je wachtwoord wijzigen en een ouder vertellen"], answer: 2, explain: "Ga zelf naar de officiële site en vertel het een volwassene." },
      { q: "Mag je hetzelfde wachtwoord voor al je accounts gebruiken?", options: ["Ja, handig", "Nee, elk account een eigen wachtwoord", "Alleen voor games"], answer: 1, explain: "Wordt één site gehackt, dan zijn al je accounts in gevaar." },
      { q: "Je verlaat een schoolcomputer terwijl je nog bent ingelogd.", options: ["Laten staan", "Het tabblad sluiten", "Uitloggen"], answer: 2, explain: "Altijd uitloggen, anders kan iemand anders met jouw account verder." },
    ],
  },
}

export const CAESAR_ROUNDS = [
  { plain: "SLIM", shift: 3 },
  { plain: "VEILIG", shift: 3 },
  { plain: "WACHTWOORD", shift: 3 },
]

export const BUILDER_TILES = ["Blauwe", "Draak", "Fiets", "Maan", "Regen", "42", "!", "#", "Mila", "Wachtwoord", "123", "7"]

export const BUILDER_RULES: { label: string; test: (value: string) => boolean }[] = [
  { label: "Minstens 14 tekens", test: (v) => v.length >= 14 },
  { label: "Bevat een cijfer", test: (v) => /\d/.test(v) },
  { label: "Bevat een teken (! of #)", test: (v) => /[!#]/.test(v) },
  { label: "Bevat een hoofdletter", test: (v) => /[A-Z]/.test(v) },
  { label: "Geen 'Mila', 'Wachtwoord' of '123'", test: (v) => !/Mila|Wachtwoord|123/.test(v) },
]
