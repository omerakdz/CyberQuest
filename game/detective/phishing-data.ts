export type PhishKind = "mail" | "chat" | "popup"

export type PhishMessage = {
  kind: PhishKind
  from: string
  addr: string
  subj: string
  body: string
  link?: { label: string; url: string }
  file?: string
  bad: boolean
  why: string
}

const m = (kind: PhishKind, from: string, addr: string, subj: string, body: string, bad: boolean, why: string, extra: { link?: { label: string; url: string }; file?: string } = {}): PhishMessage => ({ kind, from, addr, subj, body, bad, why, ...extra })

export const PHISHING_LEVELS: PhishMessage[][] = [
  [
    m("mail", "Gratis Prijs Team", "winner@gratis-prijs-claim.top", "🎉 JE HEBT EEN iPHONE GEWONNEN!!!", "Gefeliciteerd! Jij bent de 1.000.000e bezoeker. Klik NU om je gratis iPhone te claimen, anders vervalt je prijs binnen 10 minuten!", true, "Je hebt nergens aan meegedaan en er is haast. Dat zijn typische tekenen van phishing.", { link: { label: "Claim je prijs", url: "http://gratis-prijs-claim.top/win?id=88213" } }),
    m("mail", "Juf Maaike", "m.jansen@basisschool-dewereld.nl", "Excursie naar het museum", "Hoi allemaal, volgende week donderdag gaan we naar het museum. Vergeet je lunchpakket niet. Groetjes, juf Maaike", false, "Bekende afzender, normaal onderwerp en geen link of vreemd verzoek."),
    m("popup", "Systeemmelding", "pop-up op een website", "⚠ JE COMPUTER HEEFT 7 VIRUSSEN!", "Bel direct 0900-123456 of download onze gratis scanner om je computer te redden!", true, "Echte virusmeldingen komen niet als pop-up op een website. Dit wil je bang maken.", { file: "virus-scanner-gratis.exe" }),
    m("chat", "Oma", "oma@familie.nl", "Zondag eten", "Dag lieverd! Kom je zondag om 5 uur eten? Ik maak pannenkoeken 🥞", false, "Een gewoon bericht van iemand die je kent, zonder link of verzoek om gegevens."),
    m("chat", "Roblox Support", "support@robIox-help.com", "Je account wordt geblokkeerd", "Stuur ons je wachtwoord om je account te redden. Doe het binnen 5 minuten!", true, "Echte bedrijven vragen nooit om je wachtwoord. Kijk ook naar de naam: robIox heeft een hoofdletter I.") ,
  ].map((x) => x),
  [
    m("mail", "Netflix", "info@netfIix-billing.com", "Betaling mislukt", "Je betaling is mislukt. Update je betaalgegevens binnen 24 uur, anders wordt je account verwijderd.", true, "Kijk goed naar het adres: netfIix met een hoofdletter I, en een vreemd domein.", { link: { label: "Betaalgegevens bijwerken", url: "http://netfIix-billing.com/login" } }),
    m("mail", "PostNL", "no-reply@postnl-pakket.info", "Je pakket wacht op betaling", "Je pakket kan niet bezorgd worden. Betaal €1,95 aan verzendkosten om de levering te plannen.", true, "Echte pakketdiensten vragen geen betaling via een link. Het domein .info is ook niet van het bedrijf.", { link: { label: "Betaal €1,95", url: "http://postnl-pakket.info/betaal" } }),
    m("mail", "School ICT", "ict@basisschool-dewereld.nl", "Nieuwe inlog voor Teams", "Beste leerling, je krijgt van de juf een briefje met je nieuwe inlog. Heb je die nog niet? Vraag het in de klas.", false, "De afzender klopt, er is geen link, en je wordt verwezen naar je juf."),
    m("chat", "Minecraft Gratis", "mc-gratis@freeminecoins.xyz", "Gratis Minecoins", "Vul je gebruikersnaam en wachtwoord in en krijg 5000 Minecoins gratis!", true, "Gratis geld in ruil voor je wachtwoord is altijd een val.", { link: { label: "Haal je coins", url: "http://freeminecoins.xyz/get" } }),
    m("mail", "Bibliotheek", "service@debibliotheek.nl", "Je boek moet terug", "Je leent 'De Gouden Kompas' nog tot vrijdag. Verlengen kan via de website van de bibliotheek.", false, "Geen haast, geen link naar een vreemde site en een logisch bericht."),
  ],
  [
    m("chat", "Epic Games", "support@epicgames-trade.com", "Gratis skins voor jouw account", "Log in via deze link en je krijgt een zeldzame skin. Alleen vandaag!", true, "Het domein epicgames-trade.com is niet van Epic Games. Gratis skins zijn een bekende truc.", { link: { label: "Log in en claim", url: "http://epicgames-trade.com/login" } }),
    m("popup", "Cookie-melding", "website van je favoriete krant", "Wij gebruiken cookies", "Deze website gebruikt cookies. Je kunt accepteren of instellingen aanpassen.", false, "Een gewone cookie-melding zonder haast. Er wordt niets geïnstalleerd of om je wachtwoord gevraagd."),
    m("chat", "Daan (klasgenoot)", "daan.vriend@gmail.com", "Check deze video!!", "Hé kijk, ik sta in deze video 😂 Log even in met je Google account om hem te zien.", true, "Je vriend kan gehackt zijn. Een video bekijken hoeft nooit met je wachtwoord.", { link: { label: "Bekijk video", url: "http://video-bekijken.click/google-login" } }),
    m("mail", "Steam", "noreply@steampowered.com", "Nieuwe inlog op je account", "Er is ingelogd op een nieuw apparaat. Was jij dit niet? Ga zelf naar steampowered.com en verander je wachtwoord.", false, "Het adres klopt en je moet zelf naar de officiële site gaan, niet via een link."),
    m("mail", "Discord Nitro", "nitro@dlscord-gifts.com", "Een vriend gaf je Nitro", "Een vriend heeft je Nitro cadeau gedaan! Accepteer binnen 1 uur.", true, "dlscord is geen discord (een l in plaats van een i). Haast is een waarschuwing.", { link: { label: "Accepteer cadeau", url: "http://dlscord-gifts.com/accept" } }),
    m("chat", "Mama", "mama@familie.nl", "Boodschappen", "Kun je na school brood meenemen? Dank je!", false, "Een normaal bericht van een bekende zonder link."),
  ],
  [
    m("mail", "Jouw Bank", "klantenservice@mijnbank.nl.com", "Beste klant, verdachte activiteit", "Beste klant, wij zien verdachte activiteit. Bevestig je gegevens om je rekening te beschermen.", true, "Je wordt niet bij naam aangesproken ('Beste klant') en het adres eindigt op .nl.com, niet op .nl.", { link: { label: "Bevestig gegevens", url: "http://mijnbank.nl.com/verify" } }),
    m("chat", "Onbekend nummer", "+31 6 99 12 34 56", "Hoi, wat is je code?", "Hoi! Ik stuurde per ongeluk een code naar jouw telefoon. Kun je die doorsturen?", true, "Codes zijn geheim. Wie ze doorstuurt geeft toegang tot zijn account."),
    m("mail", "Gamestudio Mods", "download@cool-mods-hub.net", "Je gevraagde mod", "Hier is de mod die je wilde. Pak hem uit en start het programma.", true, "Mods horen geen .exe te zijn. Zo'n programma kan een virus zijn.", { file: "super-mod-installer.exe" }),
    m("mail", "School", "info@basisschool-dewereld.nl", "Ouderavond 12 mei", "Beste ouders en leerlingen, op 12 mei is de ouderavond. De uitnodiging vind je in de schoolagenda.", false, "Normaal bericht van de school zonder link of haast."),
    m("mail", "Spotify", "no-reply@spotify.com", "Je maandoverzicht", "Hier is je overzicht van deze maand. Bekijk je favoriete nummers in de app.", false, "Officieel adres en geen verzoek om gegevens."),
    m("chat", "Gamevriend", "xX_Pro_Xx@gmail.com", "Trade even?", "Ik geef je 3 skins als jij eerst jouw account deelt, ik ben betrouwbaar echt!", true, "Je account delen doe je nooit, ook niet met 'betrouwbare' mensen online."),
  ],
  [
    m("mail", "Schoolportaal", "no-reply@schoolportaal.nl", "Nieuw cijfer beschikbaar", "Er is een nieuw cijfer toegevoegd. Open zelf de app van school om het te bekijken.", false, "Het adres klopt en je gaat via de officiële app, niet via een link."),
    m("mail", "Schoolportaal", "no-reply@schoolportaal.nl", "Je wachtwoord verloopt", "Je wachtwoord verloopt vandaag. Klik hier om het te verlengen.", true, "De afzender lijkt goed, maar de link gaat naar een nepsite met koppelteken. Controleer altijd de link!", { link: { label: "Wachtwoord verlengen", url: "http://schoolportaal-inloggen.nl/reset" } }),
    m("chat", "Nieuw nummer van oom", "+31 6 12 00 00 11", "Hoi, nieuwe telefoon", "Hoi, dit is mijn nieuwe nummer. Kun je een cadeaubon van €50 kopen? Ik betaal je terug.", true, "Oplichters doen zich voor als familie. Bel het oude nummer terug om te checken."),
    m("popup", "Browser", "pop-up op een website", "Je browser is verouderd", "Download de nieuwe update nu om veilig te blijven.", true, "Updates doe je via de instellingen van je browser, niet via een pop-up.", { file: "chrome-update.exe" }),
    m("mail", "Google", "no-reply@accounts.google.com", "Beveiligingsmelding", "Er is ingelogd op je account. Was jij dit niet? Ga zelf naar je Google-account.", false, "Officieel adres en je wordt niet via een link gestuurd."),
    m("mail", "Vriend Sem", "sem@gmail.com", "Foto's van het feest", "Hier zijn de foto's van het feest. Veel plezier! (zie bijlage)", false, "Verwachte mail van een vriend, bijlage is een gewone afbeelding.", { file: "feest-fotos.jpg" }),
  ],
]
