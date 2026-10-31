export type Verdict = "reliable" | "fake" | "unverified"
export type ToolKey = "bron" | "auteur" | "datum" | "bewijs"

export type Story = {
  kind: "krant" | "post"
  headline: string
  body: string
  tools: Record<ToolKey, string>
  verdict: Verdict
  why: string
}

export const TOOL_LABEL: Record<ToolKey, string> = { bron: "Bron", auteur: "Schrijver", datum: "Datum", bewijs: "Bewijs" }

export const NEWS_LEVELS: Story[][] = [
  [
    {
      kind: "krant",
      headline: "SCHOOL KRIJGT NIEUWE GYMZAAL",
      body: "Basisschool De Regenboog krijgt volgend jaar een nieuwe gymzaal. De gemeente Dorpsburg heeft het budget goedgekeurd.",
      tools: { bron: "Dorpsburg Courant: een regionale krant met een echte redactie en een rubriek voor correcties.", auteur: "Anouk de Wit, verslaggever. Ze schrijft vaker over de gemeente.", datum: "Vorige week geplaatst, dus nog actueel.", bewijs: "De gemeente bevestigt het op haar eigen website en noemt het bedrag." },
      verdict: "reliable",
      why: "Bekende bron, echte schrijver, recente datum en de gemeente bevestigt het. Dat zijn goede tekenen.",
    },
    {
      kind: "krant",
      headline: "WETENSCHAPPERS: CHOCOLADE MAAKT JE 100% SLIMMER!!!",
      body: "Een geheim onderzoek bewijst: wie elke dag 5 repen eet, wordt een genie. Dokters haten dit trucje!",
      tools: { bron: "Een site vol advertenties, zonder redactie of contactgegevens.", auteur: "Geen schrijver vermeld.", datum: "Geen datum te vinden.", bewijs: "Er wordt geen onderzoek genoemd. '100% slimmer' kan niet bewezen worden." },
      verdict: "fake",
      why: "Overdreven kop, geen bron, geen schrijver en geen bewijs. Zo'n bericht kun je niet geloven.",
    },
    {
      kind: "post",
      headline: "Ik hoorde dat morgen alle scholen dicht zijn!",
      body: "Bram_2010 schrijft: 'Mijn buurjongen zei dat morgen alle scholen dicht zijn. Deel dit door!'",
      tools: { bron: "Een persoonlijk bericht van een leerling.", auteur: "Bram_2010, een gewone gebruiker.", datum: "Vandaag geplaatst.", bewijs: "Er is geen bericht van een school of de gemeente te vinden." },
      verdict: "unverified",
      why: "Het is niet bewezen dat het onwaar is, maar er is ook geen bevestiging. Wacht op een officiële bron voor je het deelt.",
    },
    {
      kind: "krant",
      headline: "ZWEMBAD WATERWIJK: KINDEREN DIT WEEKEND GRATIS",
      body: "Het zwembad nodigt alle kinderen tot 12 jaar uit voor een gratis zwemmiddag op zaterdag.",
      tools: { bron: "De officiële website van het zwembad.", auteur: "De marketingafdeling van het zwembad.", datum: "Deze week geplaatst.", bewijs: "Dezelfde actie staat ook op de website van de gemeente Waterwijk." },
      verdict: "reliable",
      why: "De afzender is het zwembad zelf en een tweede officiële bron zegt hetzelfde.",
    },
  ],
  [
    {
      kind: "krant",
      headline: "NIEUWE APP SNAPSTUDY BIJ 1 OP DE 3 SCHOLIEREN",
      body: "Uit een peiling blijkt dat veel scholieren de app SnapStudy gebruiken om te leren.",
      tools: { bron: "Onderwijsmonitor: een kleine, minder bekende site, maar met een redactie, contactgegevens en bronvermelding.", auteur: "Ruben Smit, onderwijsjournalist, met een profielpagina.", datum: "Twee weken geleden.", bewijs: "Het artikel noemt de peiling: 1.200 scholieren, uitgevoerd door een onderzoeksbureau, met link naar de cijfers." },
      verdict: "reliable",
      why: "Een onbekende bron is niet automatisch nep. Hier staan duidelijke bronnen, een schrijver en de gegevens zijn te controleren.",
    },
    {
      kind: "krant",
      headline: "BEWEZEN: 5G-MASTEN LATEN PLANTEN VERDORREN",
      body: "Een blog laat foto's zien van gele planten naast een mast. 'Dit bewijst het!'",
      tools: { bron: "Gezond-Leven-Nu: een blog dat vooral dure kruidenmiddelen verkoopt.", auteur: "Anoniem.", datum: "Foto's blijken uit de droge zomer van 2018 te komen.", bewijs: "Geen onderzoek. Experts zien geen verband tussen masten en planten." },
      verdict: "fake",
      why: "Twee dingen die samen voorkomen, hoeven niet door elkaar veroorzaakt te zijn. En de bron verkoopt er zelf iets bij.",
    },
    {
      kind: "post",
      headline: "Beroemde gamer stopt met streamen?",
      body: "Fanaccount @GameNieuwsDaily: 'Volgens mij stopt SuperZoë morgen met haar kanaal. Dit lijkt zeker!'",
      tools: { bron: "Een fanaccount, niet het kanaal van de gamer.", auteur: "Onbekend beheerder.", datum: "Vandaag.", bewijs: "Zoë zelf en haar kanaal hebben er niets over gezegd." },
      verdict: "unverified",
      why: "Een gerucht is nog geen feit. Zolang de gamer het zelf niet bevestigt, is het niet te controleren.",
    },
    {
      kind: "krant",
      headline: "HELFT VAN DE KINDEREN HAAT GROENTE",
      body: "Uit een enquête blijkt dat 5 op de 10 kinderen geen groente lust.",
      tools: { bron: "Een bekend kindermagazine.", auteur: "Redactie, met naam vermeld.", datum: "Recent.", bewijs: "In de kleine lettertjes: de enquête is gehouden onder maar 10 kinderen uit één klas." },
      verdict: "fake",
      why: "De bron lijkt goed, maar 10 kinderen zeggen niets over alle kinderen. De kop is misleidend, dus ook nep of misleidend.",
    },
  ],
  [
    {
      kind: "krant",
      headline: "STUDIE: KINDEREN DIE MINDER SLAPEN SCOREN LAGER",
      body: "Onderzoekers van een universiteit volgden 2.000 leerlingen en zagen dat weinig slaap samenhangt met lagere toetscijfers.",
      tools: { bron: "Nieuwssite met redactie, die de universiteit als bron noemt.", auteur: "Wetenschapsjournalist Lisa Haan.", datum: "Deze maand.", bewijs: "De studie is gepubliceerd. Er staat bij dat het een samenhang is, geen bewezen oorzaak." },
      verdict: "reliable",
      why: "De kop en de tekst kloppen met het onderzoek en het bericht blijft eerlijk over wat het wel en niet bewijst.",
    },
    {
      kind: "post",
      headline: "STORM TREFT DORPSBURG: ALLES GESLOTEN!",
      body: "Een bericht gaat rond met foto's van omgewaaide bomen en de tekst 'Vandaag in Dorpsburg!'",
      tools: { bron: "Een deelbericht zonder originele bron.", auteur: "Onbekend.", datum: "Het oorspronkelijke bericht blijkt 3 jaar oud.", bewijs: "Het weerbericht van vandaag meldt rustig weer. Alleen de datum was weggelaten." },
      verdict: "fake",
      why: "Een oud bericht dat als nieuw wordt gedeeld is misleidend. Controleer altijd de datum.",
    },
    {
      kind: "krant",
      headline: "BURGEMEESTER WIL VAKANTIE INKORTEN?",
      body: "Volgens een anonieme bron zou de burgemeester willen dat de zomervakantie een week korter wordt.",
      tools: { bron: "Eén krant, zonder tweede bevestiging.", auteur: "Redactie, maar de bron blijft anoniem.", datum: "Gisteren.", bewijs: "De gemeente reageert niet. Andere kranten melden er niets over." },
      verdict: "unverified",
      why: "Eén anonieme bron is te weinig. Het kan waar zijn, maar het is nog niet bevestigd door anderen.",
    },
    {
      kind: "krant",
      headline: "LOKALE BAKKER WINT PRIJS VOOR BESTE BROOD",
      body: "Bakkerij De Gouden Korst uit Waterwijk heeft de regionale broodprijs gewonnen.",
      tools: { bron: "Wijkblad Noord: klein, maar met een vaste redactie en adres.", auteur: "Joris Bakker, vaste wijkverslaggever.", datum: "Vorige week.", bewijs: "De organisatie van de broodprijs noemt dezelfde winnaar op haar website." },
      verdict: "reliable",
      why: "Een klein blad kan best betrouwbaar zijn. De organisatie van de prijs bevestigt het ook.",
    },
  ],
]
