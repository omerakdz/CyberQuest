export type ClaimVerdict = "supported" | "contradicted" | "unverified"
export type Trust = "high" | "unknown" | "low"

export type ClaimSource = { name: string; trust: Trust; text: string }
export type Claim = { claim: string; sources: ClaimSource[]; verdict: ClaimVerdict; why: string }

export const TRUST_LABEL: Record<Trust, string> = { high: "🟢 betrouwbaar", unknown: "🟡 onbekend", low: "🔴 belanghebbend" }

export const FRENZY_LEVELS: { seconds: number; claims: Claim[] }[] = [
  {
    seconds: 40,
    claims: [
      {
        claim: "De nieuwe bibliotheek van Dorpsburg opent op 1 maart.",
        sources: [
          { name: "Gemeente Dorpsburg", trust: "high", text: "Persbericht: de bibliotheek opent op 1 maart om 10.00 uur." },
          { name: "Dorpsburg Courant", trust: "high", text: "De opening op 1 maart is bevestigd door de wethouder." },
        ],
        verdict: "supported",
        why: "Twee betrouwbare bronnen bevestigen dezelfde datum.",
      },
      {
        claim: "De zon draait in een jaar om de aarde heen.",
        sources: [
          { name: "Schoolboek natuurkunde", trust: "high", text: "De aarde draait in een jaar om de zon." },
          { name: "Science Centre", trust: "high", text: "Alle planeten draaien om de zon, niet andersom." },
        ],
        verdict: "contradicted",
        why: "Betrouwbare bronnen zeggen het tegenovergestelde. De claim klopt niet.",
      },
      {
        claim: "Volgend jaar komt er een nieuw deel van het spel BlokWereld.",
        sources: [
          { name: "Fanforum", trust: "unknown", text: "Iemand schrijft: 'Mijn neef werkt daar en zegt dat het zo is.'" },
          { name: "Website van de studio", trust: "high", text: "Er is geen aankondiging van een nieuw deel." },
        ],
        verdict: "unverified",
        why: "Niets is bevestigd en niets is weerlegd. Voor een bevestiging heb je een betrouwbare bron nodig.",
      },
      {
        claim: "Het zwembad Waterwijk is zaterdag open van 10.00 tot 17.00 uur.",
        sources: [
          { name: "Website zwembad", trust: "high", text: "Zaterdag: 10.00 - 17.00 uur geopend." },
          { name: "Gemeente Waterwijk", trust: "high", text: "Openingstijden zwembad: zaterdag 10-17 uur." },
        ],
        verdict: "supported",
        why: "Beide officiële bronnen geven dezelfde tijden.",
      },
    ],
  },
  {
    seconds: 30,
    claims: [
      {
        claim: "Snoep 'Fruitbliksem' geneest verkoudheid.",
        sources: [
          { name: "Persbericht van de snoepfabriek", trust: "low", text: "Onze snoepjes helpen tegen verkoudheid!" },
          { name: "Huisartsenwebsite", trust: "high", text: "Er is geen bewijs dat snoep een verkoudheid geneest." },
        ],
        verdict: "contradicted",
        why: "De fabriek wil het snoep verkopen. De onafhankelijke artsen zeggen dat er geen bewijs is.",
      },
      {
        claim: "Dorpsburg heeft het grootste skatepark van de regio.",
        sources: [
          { name: "Gemeente Dorpsburg", trust: "high", text: "Het skatepark is 2.400 m² groot." },
          { name: "Regio-overzicht sport", trust: "high", text: "Grootste skatepark van de regio: Waterwijk, 3.000 m²." },
        ],
        verdict: "contradicted",
        why: "Het park in Waterwijk is groter, dus de claim klopt niet.",
      },
      {
        claim: "De school krijgt volgend jaar een nieuw dak.",
        sources: [
          { name: "Brief van de school", trust: "high", text: "De dakrenovatie is gepland voor de zomer van volgend jaar." },
          { name: "Buurtgroep", trust: "unknown", text: "Ik heb ook gehoord dat het dak vernieuwd wordt." },
        ],
        verdict: "supported",
        why: "De officiële brief bevestigt het. De buurtgroep zegt hetzelfde, maar de brief is het belangrijkste bewijs.",
      },
      {
        claim: "Er komt een tweede brug over de rivier.",
        sources: [
          { name: "Begroting gemeente", trust: "high", text: "Er wordt onderzocht of een tweede brug mogelijk is. Er is nog geen besluit." },
          { name: "Dorpsburg Courant", trust: "high", text: "De plannen voor een brug zijn nog niet definitief." },
        ],
        verdict: "unverified",
        why: "Het wordt onderzocht, maar er is nog niets besloten. Het is dus nog niet bevestigd.",
      },
    ],
  },
  {
    seconds: 25,
    claims: [
      {
        claim: "Een nieuw onderzoek bewijst dat gamen de concentratie verbetert.",
        sources: [
          { name: "Universiteit (studie)", trust: "high", text: "Kleine studie met 30 kinderen. Effect alleen bij bepaalde spellen, vervolgonderzoek nodig." },
          { name: "Gamesite", trust: "low", text: "Wetenschap bewijst: gamen is goed voor je!" },
        ],
        verdict: "unverified",
        why: "De studie zegt niet dat het bewezen is. De gamesite overdrijft.",
      },
      {
        claim: "Het Dorpsburg Festival is afgelast.",
        sources: [
          { name: "Festivalaccount (officieel)", trust: "high", text: "Het festival gaat door: zaterdag om 14.00 uur." },
          { name: "Oud nieuwsbericht (2 jaar geleden)", trust: "unknown", text: "Festival afgelast wegens storm." },
        ],
        verdict: "contradicted",
        why: "Het afgelasten ging over twee jaar geleden. De organisatie zegt dat het dit jaar gewoon doorgaat.",
      },
      {
        claim: "De rivier is op het laagste punt in 20 jaar.",
        sources: [
          { name: "Waterschap", trust: "high", text: "Meetgegevens: laagste waterstand sinds 20 jaar." },
          { name: "Regionale krant", trust: "high", text: "Waterschap meldt laagste stand in twintig jaar." },
        ],
        verdict: "supported",
        why: "Meetgegevens van het waterschap en een tweede betrouwbare bron bevestigen het.",
      },
      {
        claim: "Een beroemde acteur heeft Dorpsburg bezocht.",
        sources: [
          { name: "Onbekend Instagram-account", trust: "unknown", text: "Foto zonder datum of plaats." },
          { name: "Ander account", trust: "unknown", text: "Dezelfde foto, zonder bron." },
        ],
        verdict: "unverified",
        why: "Twee accounts met dezelfde foto zijn nog steeds één bewijs. Er is geen betrouwbare bron.",
      },
    ],
  },
]
