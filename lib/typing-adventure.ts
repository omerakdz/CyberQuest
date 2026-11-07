export type Medal = "gold" | "silver" | "bronze"
export type Area = "Green Valley" | "Crystal Caves" | "Cyber City" | "Neon Desert" | "Digital Kingdom"
export type AdventureLevel = { id: number; area: Area; sentence: string; gold: number; silver: number }

const sentences = [
  "De kat zit op de mat.", "Ik lees een leuk boek.", "De zon schijnt vandaag.", "Mijn fiets staat buiten.", "Wij spelen in het park.", "De hond rent naar huis.", "Mama maakt warme soep.", "Ik teken een blauwe ster.", "De vogel zingt in de boom.", "Vandaag leer ik iets nieuws.",
  "De kleine boot vaart op het meer.", "Mijn beste vriend houdt van voetbal.", "In de tuin groeit een rode bloem.", "Wij drinken water na het rennen.", "De maan verschijnt boven de daken.", "Ik ruim mijn bureau netjes op.", "Een vrolijke bij zoekt nectar.", "De klas begint met een spannend verhaal.", "Mijn schoenen staan naast de deur.", "Samen maken wij de wereld mooier.",
  "De wind blaast zacht door het groene dal.", "Een slimme leerling stelt altijd vragen.", "Op zaterdag bakken we koekjes voor iedereen.", "De trein rijdt precies op tijd naar de stad.", "Vergeet je jas niet als het buiten koud is.", "De robot volgt het licht door de donkere gang.", "Iedereen krijgt een beurt om het spel te leiden.", "Een rustig ontbijt helpt mij goed te starten.", "De buurvrouw geeft haar plant genoeg water.", "Met geduld lukt bijna elke moeilijke opdracht.", "De sterren lijken kleine lampjes aan de hemel.", "Mijn broer bouwt een toren van houten blokken.", "We luisteren aandachtig naar de uitleg van de meester.", "Een eerlijk antwoord maakt een gesprek veel sterker.", "De rivier stroomt langs het oude dorp.", "Ik controleer mijn werk voordat ik het inlever.", "Een goede voorbereiding geeft vertrouwen bij een toets.", "De kinderen zoeken samen naar een verborgen schat.", "In de bibliotheek fluisteren bezoekers heel zacht.", "Een glimlach kan iemand een fijne dag geven.",
  "Wanneer de bel gaat, lopen we rustig naar buiten.", "De onderzoeker noteert elk klein detail in zijn boek.", "Een gezonde gewoonte begint met een eenvoudige keuze.", "Tijdens de pauze bespreken wij onze plannen voor morgen.", "De computer verwerkt de informatie stap voor stap.", "Een kaart helpt ons de kortste route te vinden.", "Soms is een fout juist de start van een goed idee.", "De trainer legt uit waarom samenwerken belangrijk is.", "Door rustig te blijven, zie je meer oplossingen.", "De fotograaf wacht tot het licht precies goed valt.", "In de werkplaats liggen schroeven, kabels en gereedschap.", "Een duidelijke vraag zorgt voor een beter antwoord.", "De wetenschapper vergelijkt de resultaten van elk experiment.", "Mijn agenda helpt mij om niets belangrijks te vergeten.", "De klas maakt een plan voor een duurzame schooltuin.", "Een veilige wachtwoordzin beschermt jouw online account.", "De gids vertelt hoe dit oude gebouw vroeger werkte.", "Wij delen de taken zodat iedereen kan helpen.", "Een onverwachte ontdekking maakt de reis extra bijzonder.", "De kapitein kijkt goed naar de golven en de wind.",
  "Als je aandachtig leest, ontdek je verborgen betekenissen.", "De programmeur test eerst kleine stukjes van de nieuwe code.", "Een slimme robot kan patronen herkennen in grote hoeveelheden data.", "De leerlingen vergelijken hun bronnen voordat ze een conclusie trekken.", "Met een kompas vinden we de juiste richting door het bos.", "De kunstenaar gebruikt schaduw om diepte in het landschap te maken.", "Een goed gesprek begint wanneer iedereen naar elkaar luistert.", "De archivaris bewaart oude kaarten op een droge, donkere plek.", "Wij onderzoeken welke oplossing het minst energie gebruikt.", "De journalist controleert elk bericht voordat het online verschijnt.", "Een plan werkt beter wanneer je onderweg kunt bijsturen.", "De monteurs zoeken rustig naar de oorzaak van het probleem.", "Tijdens het debat geven beide teams duidelijke voorbeelden.", "De wolken veranderen snel terwijl de storm dichterbij komt.", "Een kleine keuze kan later een groot verschil veroorzaken.", "De ontdekkingsreiziger tekent een onbekend eiland op de kaart.", "Onze groep verdeelt het werk eerlijk en controleert elkaars resultaten.", "De machine stopt automatisch wanneer een sensor gevaar merkt.", "Een foutmelding helpt ons begrijpen wat er precies misgaat.", "De stad gebruikt slimme systemen om verkeer veiliger te maken.",
  "In 2026 leren robots steeds beter van voorbeelden, maar ze denken niet zoals mensen.", "Bewaar nooit je wachtwoord in een openbaar bericht; kies liever een geheime zin.", "De code 42 betekent vandaag: blijf rustig, kijk goed en probeer opnieuw.", "Een betrouwbare bron noemt meestal de schrijver, datum en plaats van het nieuws.", "Wanneer een website haast maakt met een prijs, controleer dan eerst de afzender.", "De astronaut telt 3, 2, 1 voordat de raket langzaam opstijgt.", "AI kan helpen bij een taak, maar jij blijft verantwoordelijk voor het eindresultaat.", "Een sterk wachtwoord gebruikt woorden, cijfers en tekens zoals ! of ?.", "De digitale kaart zegt: ga links bij de blauwe brug en neem daarna route 7.", "Een bericht met de zin 'klik nu!' is niet automatisch betrouwbaar.", "De hacker probeert een fout te vinden, maar onze firewall blokkeert poort 8080.", "Mijn robot leert: eerst nadenken, dan testen, daarna pas op de grote knop drukken.", "Een slimme speurder vraagt: wie schreef dit, wanneer gebeurde het en klopt het bewijs?",
  "Als informatie vreemd klinkt, vergelijk je minstens twee betrouwbare bronnen met elkaar.", "De eindcode is CYBER-100; voer hem alleen in op de officiële trainingspagina.", "Een digitale voetafdruk blijft soms lang bestaan, zelfs nadat je een bericht verwijdert.", "De beste keuze is niet altijd de snelste: veiligheid en aandacht tellen ook mee.",
  "Tijdens het experiment schrijft Noor elke stap op en controleert ze haar uitkomst.", "De beste programmeurs testen hun oplossing rustig voordat ze verder bouwen.", "Level 100 bereikt! Jij hebt geoefend, volgehouden en de digitale wereld veroverd."
]

const areas: Area[] = ["Green Valley", "Crystal Caves", "Cyber City", "Neon Desert", "Digital Kingdom"]
export const adventureLevels: AdventureLevel[] = sentences.map((sentence, index) => {
  const id = index + 1
  const difficulty = id <= 10 ? 0 : id <= 20 ? 1 : id <= 40 ? 2 : id <= 60 ? 3 : id <= 80 ? 4 : 5
  return { id, area: areas[Math.floor(index / 20)], sentence, gold: 8 + id * 0.38 + difficulty * 0.8, silver: 12 + id * 0.48 + difficulty }
})

const endlessSubjects = ["De nieuwsgierige robot", "Onze jonge speurder", "Een slimme uitvinder", "Het team van CyberQuest", "De kleine satelliet", "Een vrolijke programmeur"]
const endlessActions = ["controleert rustig", "vergelijkt nauwkeurig", "ontwerpt vandaag", "onderzoekt stap voor stap", "onthoudt zorgvuldig", "berekent op tijd"]
const endlessObjects = ["de route naar de maan", "een patroon in de sterren", "de code van een raadsel", "een veilige digitale kaart", "de uitslag van een proef", "een verzameling kleurrijke knoppen"]
const endlessDetails = ["de computer klaarstaat", "iedereen goed samenwerkt", "de klok langzaam verder tikt", "de gegevens netjes bewaard blijven", "de juiste aanwijzing verschijnt", "de laatste test is afgerond"]

export function getAdventureLevel(id: number): AdventureLevel {
  if (!Number.isSafeInteger(id) || id < 1) throw new RangeError("Een levelnummer moet een positief geheel getal zijn.")
  const existing = adventureLevels[id - 1]
  if (existing) return existing

  const offset = id - adventureLevels.length - 1
  const stage = Math.floor(offset / 10)
  const subject = endlessSubjects[offset % endlessSubjects.length]
  const action = endlessActions[Math.floor(offset / endlessSubjects.length) % endlessActions.length]
  const object = endlessObjects[Math.floor(offset / (endlessSubjects.length * endlessActions.length)) % endlessObjects.length]
  const detail = endlessDetails[Math.floor(offset / (endlessSubjects.length * endlessActions.length * endlessObjects.length)) % endlessDetails.length]
  let sentence = `${subject} ${action} ${object}, terwijl ${detail}. Code ${id}.`

  if (stage >= 1) sentence = `Eerst maak je een plan. ${sentence}`
  if (stage >= 2) sentence = `Let op: ${sentence}`
  if (stage >= 3) sentence = `“${sentence.slice(0, -1)}; daarna controleert het team elke aanwijzing!”`
  if (stage >= 4) sentence = `Op route ${id - 100}, ${sentence[0].toLowerCase()}${sentence.slice(1)}`
  if (stage >= 5) sentence = `Controleer na elke stap zorgvuldig de uitkomst: ${sentence}`

  const difficulty = 6 + stage
  const gold = Math.max(14, sentence.length / 4.5 + difficulty)
  return {
    id,
    area: "Digital Kingdom",
    sentence,
    gold,
    silver: gold + Math.max(5, sentence.length / 10),
  }
}

export type LevelResult = { time: number; accuracy: number; medal: Medal }
export type AdventureProgress = { unlocked: number; results: Record<string, LevelResult> }
export const emptyProgress = (): AdventureProgress => ({ unlocked: 1, results: {} })
export function medalFor(level: AdventureLevel, time: number, accuracy: number): Medal | null {
  if (accuracy < 80) return null
  if (accuracy >= 98 && time <= level.gold) return "gold"
  if (accuracy >= 90 && time <= level.silver) return "silver"
  return "bronze"
}
export const medalRank: Record<Medal, number> = { bronze: 1, silver: 2, gold: 3 }
