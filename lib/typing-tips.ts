export const TYPING_TIPS = [
  "Houd je vingers op de middelste rij: Q S D F en J K L M.",
  "Kijk naar het scherm, niet naar je toetsenbord.",
  "Sneller worden? Eerst netjes typen, dan pas versnellen.",
  "Gebruik al je vingers, ook je pinken.",
  "Je duimen zijn voor de spatiebalk.",
  "Een fout is niet erg. Blijf rustig en typ door.",
  "Zit rechtop en houd je polsen ontspannen.",
  "Typ in een vast ritme, niet in snelle stootjes.",
  "Lees het woord helemaal voordat je begint.",
  "Je wijsvingers voelen de kleine bultjes op F en J.",
  "Een combo bouw je op met goede woorden achter elkaar.",
  "Adem rustig in en uit, dat helpt tegen zenuwen.",
  "Oefen elke dag even: 10 minuten werkt beter dan een uur.",
  "Shift doe je met de pink aan de andere kant van de letter.",
]

export function tipForRound(round: number) {
  return TYPING_TIPS[(Math.max(1, round) - 1) % TYPING_TIPS.length]
}
