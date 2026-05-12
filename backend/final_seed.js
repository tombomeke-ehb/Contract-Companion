import sqlite3 from 'sqlite3';

const dbPath = './data/contracts.db';
const db = new sqlite3.Database(dbPath);

async function seed() {
  console.log('🚀 Seeding HIGH-DETAIL realistic demo data (Dutch)...');

  // 1. Clear existing data
  await new Promise(r => db.run("DELETE FROM COMMON_CONTRACTS", r));
  await new Promise(r => db.run("DELETE FROM CONTRACT_REPORTS", r));
  await new Promise(r => db.run("DELETE FROM DOCUMENTEN", r));
  await new Promise(r => db.run("DELETE FROM SAMENVATTING", r));

  const createDetailedReport = (name, type, risk, details) => {
    const riskScore = risk === 'High' ? 8.4 : (risk === 'Medium' ? 5.8 : 2.1);
    return {
      title: name,
      contractType: type,
      analyzedAt: new Date().toISOString(),
      overallRiskScore: riskScore,
      overallRisk: risk.toLowerCase(),
      overallRiskLabel: `${risk} risk`,
      humanSummary: details.humanSummary,
      keySummary: details.keySummary,
      executiveSummary: details.executiveSummary,
      focusTags: details.focusTags,
      keyFindings: details.keyFindings,
      clauseBreakdown: {
        highRiskClauses: details.breakdown.high,
        mediumRiskClauses: details.breakdown.medium,
        lowRiskClauses: details.breakdown.low
      },
      clauses: details.clauses,
      recommendedActions: details.actions
    };
  };

  const commonContractsData = [
    {
      key: 'netflix-terms',
      name: 'Netflix Servicevoorwaarden',
      cat: 'Subscriptions',
      risk: 'Low',
      details: {
        humanSummary: 'Dit zijn de standaardgebruiksvoorwaarden voor de streamingdienst van Netflix. Het contract regelt de toegang tot de content, de maandelijkse facturatie en de regels voor accountgebruik binnen één huishouden.',
        keySummary: 'Geen significante juridische risico\'s voor de gemiddelde consument. De belangrijkste beperkingen liggen bij het delen van wachtwoorden buiten het eigen huishouden en de automatische maandelijkse verlenging.',
        executiveSummary: 'Deze overeenkomst tussen de gebruiker en Netflix regelt de levering van digitale streamingcontent. Het contract is van onbepaalde duur en wordt maandelijks stilzwijgend verlengd. Gebruikers hebben een licentie voor persoonlijk, niet-commercieel gebruik. Netflix behoudt zich het recht voor om prijzen te wijzigen met een opzegtermijn van 30 dagen. Het delen van accounts is technisch en juridisch beperkt tot personen die op hetzelfde adres wonen als de accounthouder.',
        focusTags: ['Streaming', 'Abonnement', 'Consumentenrecht', 'Privacy', 'Account-sharing'],
        keyFindings: [
          { title: 'Huishouden Beperking', body: 'Netflix dwingt strikt af dat accounts alleen gedeeld mogen worden met personen die fysiek op hetzelfde adres wonen. Dit wordt gecontroleerd via IP-adressen en apparaat-ID\'s.' },
          { title: 'Prijsaanpassingen', body: 'Netflix kan de abonnementsprijs eenzijdig wijzigen. Hoewel ze een kennisgeving van 30 dagen beloven, heeft de gebruiker bij een prijsverhoging enkel de optie om op te zeggen.' },
          { title: 'Automatische Verlenging', body: 'Het abonnement wordt elke maand automatisch afgeschreven van de gekoppelde betaalmethode totdat de gebruiker expliciet opzegt.' }
        ],
        breakdown: { high: 0, medium: 1, low: 6 },
        clauses: {
          'Betaling': { 
            present: true, 
            text: 'De lidmaatschapskosten voor de Netflix-dienst en alle andere kosten die je maakt in verband met je gebruik van de dienst worden maandelijks in rekening gebracht op je Betaalmethode.', 
            risk: 'low', 
            issues: [] 
          },
          'Opzegging': { 
            present: true, 
            text: 'Je kunt je Netflix-lidmaatschap op elk moment opzeggen. Je houdt toegang tot de dienst tot het einde van je maandelijkse factureringsperiode.', 
            risk: 'low', 
            issues: [] 
          },
          'Aansprakelijkheid': { 
            present: true, 
            text: 'Netflix is niet aansprakelijk voor indirecte schade of gevolgschade. De totale aansprakelijkheid is beperkt tot het bedrag dat je voor de dienst hebt betaald.', 
            risk: 'low', 
            issues: [] 
          },
          'Accountgebruik': {
            present: true,
            text: 'De Netflix-dienst en de content die via de dienst wordt bekeken, zijn alleen voor je persoonlijke en niet-commerciële gebruik en mogen niet worden gedeeld met personen buiten je huishouden.',
            risk: 'medium',
            issues: ['Beperkt de flexibiliteit voor families die niet op hetzelfde adres wonen.']
          }
        },
        actions: [
          { title: 'Controleer Gekoppelde Apparaten', body: 'Bekijk regelmatig de lijst met actieve apparaten in je instellingen om ongeautoriseerd gebruik te voorkomen.' },
          { title: 'Beheer Betaalmethode', body: 'Zorg dat er altijd een actieve back-up betaalmethode is om onderbreking van de dienst te vermijden.' }
        ]
      }
    },
    {
      key: 'huur-vlaanderen-standaard',
      name: 'Huurovereenkomst Woning (Vlaanderen)',
      cat: 'Housing',
      risk: 'Medium',
      details: {
        humanSummary: 'Een uitgebreid huurcontract voor een hoofdverblijfplaats in het Vlaams Gewest. Het volgt de dwingende regels van het Vlaams Woninghuurdecreet en bevat bepalingen over huurprijs, indexatie, waarborg en onderhoud.',
        keySummary: 'Dit is een juridisch bindend document met lange termijn gevolgen. Let vooral op de regels rondom vroegtijdige opzegging en de verplichtingen bij het einde van de huur.',
        executiveSummary: 'Dit contract regelt de huur van een onroerend goed bestemd als hoofdverblijfplaats voor een periode van negen jaar (het standaard 3-6-9 contract). De huurprijs wordt maandelijks betaald en kan jaarlijks worden geïndexeerd op de verjaardag van de inwerkingtreding. Een huurwaarborg van drie maanden is vereist en moet op een geblokkeerde rekening op naam van de huurder worden geplaatst. Er is een strikte scheiding tussen kosten voor de huurder (onderhoud, kleine herstellingen) en de verhuurder (structurele werken).',
        focusTags: ['Vastgoed', 'Vlaanderen', '3-6-9 Contract', 'Woninghuur', 'Indexatie'],
        keyFindings: [
          { title: 'Indexatieclausule', body: 'De verhuurder mag de huurprijs jaarlijks aanpassen aan de index der consumptie-prijzen. Dit gebeurt niet automatisch; de verhuurder moet dit schriftelijk aanvragen.' },
          { title: 'Opzegging door Huurder', body: 'De huurder kan op elk moment opzeggen met een termijn van drie maanden. Bij opzeg tijdens de eerste drie jaar is echter een schadevergoeding verschuldigd (3, 2 of 1 maand huur).' },
          { title: 'Plaatsbeschrijving', body: 'Een gedetailleerde omstandige plaatsbeschrijving bij aanvang is verplicht. Zonder dit document wordt de huurder geacht de woning in dezelfde staat terug te geven als ontvangen.' },
          { title: 'Huurwaarborg', body: 'De waarborg mag maximaal 3 maanden huur bedragen. Het is illegaal voor de verhuurder om dit bedrag op een persoonlijke rekening te vragen.' }
        ],
        breakdown: { high: 0, medium: 3, low: 10 },
        clauses: {
          'Duur en Beëindiging': { 
            present: true, 
            text: 'De huurovereenkomst wordt gesloten voor een duur van negen jaar. De huurder kan de overeenkomst op elk tijdstip beëindigen mits een opzeggingstermijn van drie maanden.', 
            risk: 'medium', 
            issues: ['Schadevergoeding verschuldigd bij opzeg in de eerste drie jaar.'] 
          },
          'Indexatie': { 
            present: true, 
            text: 'De huurprijs kan eenmaal per huurjaar worden aangepast aan de kosten van levensonderhoud op de verjaardag van de inwerkingtreding van de overeenkomst.', 
            risk: 'low', 
            issues: [] 
          },
          'Huurwaarborg': { 
            present: true, 
            text: 'Om de naleving van zijn verplichtingen te waarborgen, vestigt de huurder een waarborg ten belope van een bedrag van drie maanden huur.', 
            risk: 'low', 
            issues: [] 
          },
          'Onderhoud en Herstellingen': {
            present: true,
            text: 'De huurder staat in voor de huurherstellingen en het dagelijks onderhoud. De verhuurder is verantwoordelijk voor de grote herstellingen en structurele werken.',
            risk: 'medium',
            issues: ['De grens tussen "kleine herstelling" en "grote herstelling" kan voer voor discussie zijn.']
          },
          'Overdracht en Onderverhuur': {
            present: true,
            text: 'De huurder mag de huur van de woning niet overdragen of de woning onderverhuren zonder schriftelijke toestemming van de verhuurder.',
            risk: 'low',
            issues: []
          }
        },
        actions: [
          { title: 'Check Registratie', body: 'Controleer of de verhuurder het contract binnen de 2 maanden registreert. Zo niet, kan de huurder opzeggen zonder termijn of vergoeding.' },
          { title: 'Foto-documentatie', body: 'Maak bij de intrede gedetailleerde foto\'s van elk gebrek, hoe klein ook, en voeg deze bij de plaatsbeschrijving.' },
          { title: 'Brandverzekering', body: 'Het is wettelijk verplicht voor de huurder om een brandverzekering af te sluiten voor de gehuurde woning.' }
        ]
      }
    },
    {
      key: 'arbeid-bediende-fulltime',
      name: 'Arbeidsovereenkomst Bediende',
      cat: 'Employment',
      risk: 'Low',
      details: {
        humanSummary: 'Een standaard contract voor een voltijdse bediende van onbepaalde duur. Het bevat details over het loon, de functie, werkuren en secundaire arbeidsvoorwaarden.',
        keySummary: 'Een evenwichtig en wettelijk conform contract. Geen ongebruikelijke clausules gevonden. Focus op de nevenactiviteiten en de intellectuele eigendom.',
        executiveSummary: 'Deze overeenkomst regelt de tewerkstelling als bediende. De werknemer treedt in dienst voor een onbepaalde tijd. Het salaris is marktconform en omvat extra-legale voordelen zoals maaltijdcheques, een groepsverzekering en een hospitalisatieverzekering. De werkweek bedraagt 38 uur. Er is een strikte geheimhoudingsplicht en een clausule over de overdracht van intellectuele eigendomsrechten op al het werk dat tijdens de diensturen wordt geproduceerd.',
        focusTags: ['HR', 'Arbeidsrecht', 'Bediende', 'Loonpakket', 'IP-Rechten'],
        keyFindings: [
          { title: 'Intellectuele Eigendom', body: 'Alle rechten op creaties, software of ontwerpen gemaakt tijdens de uitvoering van het contract worden automatisch overgedragen aan de werkgever.' },
          { title: 'Nevenactiviteiten', body: 'De werknemer mag geen andere professionele activiteiten uitoefenen zonder voorafgaande schriftelijke toestemming van de werkgever.' },
          { title: 'Opzegtermijn', body: 'De opzegtermijnen zijn vastgelegd volgens de wettelijke bepalingen van het Eenheidsstatuut, wat zorgt voor een eerlijke bescherming voor beide partijen.' }
        ],
        breakdown: { high: 0, medium: 1, low: 12 },
        clauses: {
          'Functieomschrijving': { 
            present: true, 
            text: 'De werknemer wordt aangenomen in de functie van Senior Consultant. De taken omvatten adviesverlening, projectmanagement en klantenondersteuning.', 
            risk: 'low', 
            issues: [] 
          },
          'Loon en Voordelen': { 
            present: true, 
            text: 'Het bruto maandsalaris bedraagt €3.800. Daarnaast heeft de werknemer recht op maaltijdcheques van €8 per gewerkte dag.', 
            risk: 'low', 
            issues: [] 
          },
          'Geheimhouding': { 
            present: true, 
            text: 'De werknemer verbindt zich ertoe om zowel tijdens als na de overeenkomst geen vertrouwelijke informatie van de werkgever aan derden bekend te maken.', 
            risk: 'low', 
            issues: [] 
          },
          'Intellectuele Eigendom': {
            present: true,
            text: 'Alle resultaten van de werkzaamheden van de werknemer komen uitsluitend en onvoorwaardelijk toe aan de werkgever.',
            risk: 'low',
            issues: []
          },
          'Niet-concurrentie': {
            present: true,
            text: 'Geen niet-concurrentiebeding opgenomen in de huidige versie.',
            risk: 'low',
            issues: []
          }
        },
        actions: [
          { title: 'Check Arbeidsreglement', body: 'Vraag een kopie van het arbeidsreglement op; dit bevat cruciale details over vakantiedagen, ziekte en interne procedures.' },
          { title: 'Pensioenopbouw', body: 'Controleer de voorwaarden van de groepsverzekering voor je aanvullend pensioen.' }
        ]
      }
    }
  ];

  for (const c of commonContractsData) {
    const report = createDetailedReport(c.name, c.cat, c.risk, c.details);
    const reportJson = JSON.stringify(report);
    
    const reportId = await new Promise((resolve) => {
      db.run("INSERT INTO CONTRACT_REPORTS (REPORT_JSON) VALUES (?)", [reportJson], function() {
        resolve(this.lastID);
      });
    });

    await new Promise((resolve) => {
      db.run(`INSERT INTO COMMON_CONTRACTS (CONTRACT_KEY, NAME, CATEGORY, SUMMARY, RISK_HIGH, RISK_MEDIUM, RISK_LOW, SAMPLE_REPORT_ID) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [c.key, c.name, c.cat, report.humanSummary, 
               report.clauseBreakdown.highRiskClauses, report.clauseBreakdown.mediumRiskClauses, report.clauseBreakdown.lowRiskClauses, 
               reportId], resolve);
    });
  }

  // 2. Dashboard data for User (John Doe)
  const users = await new Promise(r => db.all("SELECT ID_USER, EMAIL FROM USERS", (e, rows) => r(rows)));
  const testUser = users.find(u => u.EMAIL === 'user@test.com');

  if (testUser) {
    const userDocsData = [
      {
        name: 'Freelance Software Development Agreement - Project Phoenix',
        type: 'Legal',
        risk: 'High',
        details: {
          humanSummary: 'Een complexe samenwerkingsovereenkomst voor de ontwikkeling van een op maat gemaakte bedrijfsapplicatie. Bevat strikte deadlines, zware boeteclausules en specifieke regels over de broncode.',
          keySummary: 'Hoge risico\'s gedetecteerd in de aansprakelijkheid en de boeteclausules. De intellectuele eigendom wordt pas overgedragen na volledige betaling, wat een bescherming is voor de ontwikkelaar.',
          executiveSummary: 'Dit contract betreft de ontwikkeling van "Project Phoenix" door de freelancer voor de klant. De totale projectwaarde bedraagt €45.000, te betalen in vier mijlpalen. De freelancer behoudt alle rechten op de broncode totdat de laatste factuur is voldaan. Er is een bugfix-periode van slechts 30 dagen na oplevering voorzien. Het contract bevat een non-sollicitatiebeding met een hoge boete bij overtreding. De aansprakelijkheid van de freelancer is beperkt, maar er zijn uitzonderingen voor grove nalatigheid.',
          focusTags: ['Software Development', 'Freelance', 'IP-recht', 'Aansprakelijkheid', 'Boetes'],
          keyFindings: [
            { title: 'Intellectuele Eigendom', body: 'Eigendom van de broncode gaat pas over op de klant NA volledige betaling van alle facturen. Dit is een sterk drukkingsmiddel voor de freelancer bij betalingsproblemen.' },
            { title: 'Aansprakelijkheid', body: 'De aansprakelijkheid is beperkt tot het totale projectbedrag. Echter, de formulering rond "grove fout" is vaag en kan leiden tot onbeperkte claims in geval van juridische discussie.' },
            { title: 'Garantieperiode', body: 'Een bugfix-periode van slechts 30 dagen is extreem kort voor een complex softwareproject. Dit verhoogt het risico op extra kosten voor de klant na de initiële oplevering.' },
            { title: 'Boeteclausule Non-sollicitatie', body: 'Een boete van €25.000 per overtreding als de freelancer personeel van de klant zou benaderen. Dit is een zeer zware sanctie.' }
          ],
          breakdown: { high: 3, medium: 4, low: 8 },
          clauses: {
            'Betalingstermijn': { 
              present: true, 
              text: 'Facturen dienen binnen 14 kalenderdagen na factuurdatum voldaan te worden via bankoverschrijving.', 
              risk: 'low', 
              issues: [] 
            },
            'Non-sollicitatie': { 
              present: true, 
              text: 'Gedurende de overeenkomst en 12 maanden daarna mag de opdrachtnemer geen werknemers van de opdrachtgever in dienst nemen, op straffe van een boete van €25.000.', 
              risk: 'high', 
              issues: ['De boete is disproportioneel hoog voor een freelance opdracht.'] 
            },
            'Intellectueel Eigendom': {
              present: true,
              text: 'De overdracht van alle intellectuele eigendomsrechten vindt plaats onder de opschortende voorwaarde van volledige betaling van de overeengekomen prijs.',
              risk: 'low',
              issues: []
            },
            'Aansprakelijkheid': {
              present: true,
              text: 'De aansprakelijkheid van de ontwikkelaar is beperkt tot de factuurwaarde van het project, behoudens in geval van opzet of grove schuld.',
              risk: 'medium',
              issues: ['Definitie van "grove schuld" is niet nader bepaald in de overeenkomst.']
            },
            'Acceptatiecriteria': {
              present: true,
              text: 'De klant heeft 5 werkdagen om de software te testen na oplevering van een mijlpaal. Indien geen reactie, wordt de mijlpaal geacht te zijn geaccepteerd.',
              risk: 'medium',
              issues: ['5 dagen is erg krap voor een grondige acceptatietest.']
            }
          },
          actions: [
            { title: 'Onderhandel de Garantie', body: 'Probeer de bugfix-periode te verlengen naar 90 dagen om verborgen gebreken op te vangen.' },
            { title: 'Verduidelijk Aansprakelijkheid', body: 'Vraag om een expliciete lijst van wat onder "grove schuld" valt om juridische onzekerheid te verkleinen.' },
            { title: 'Check Beroepsaansprakelijkheid', body: 'Zorg dat je verzekering de contractuele aansprakelijkheid tot de projectwaarde volledig dekt.' }
          ]
        }
      },
      {
        name: 'Telenet Business Internet & TV Pack',
        type: 'Subscriptions',
        risk: 'Low',
        details: {
          humanSummary: 'Zakelijk abonnement voor internet, vaste telefonie en digitale TV. Bevat garanties over uptime en technische ondersteuning voor bedrijven.',
          keySummary: 'Standaard zakelijk contract met redelijke voorwaarden. De focus ligt op de gegarandeerde serviceniveaus (SLA) en de opzegtermijn.',
          executiveSummary: 'Dit abonnement biedt breedband internet met een downloadsnelheid tot 1Gbps, inclusief een 4G back-up router. Er is een gegarandeerde uptime van 99.8% tijdens kantooruren. Bij storingen belooft Telenet een interventie binnen de 4 uur. Het contract heeft een minimale duur van 6 maanden, waarna het maandelijks opzegbaar is. De prijzen kunnen jaarlijks worden aangepast aan de index.',
          focusTags: ['Telecom', 'Zakelijk', 'SLA', 'Connectiviteit', 'Service'],
          keyFindings: [
            { title: 'Service Level Agreement (SLA)', body: 'Telenet garandeert een snelle hersteltijd bij storingen. Indien de hersteltijd wordt overschreden, heeft de klant recht op een kleine creditnota.' },
            { title: '4G Back-up', body: 'Inbegrepen in de prijs is een modem die automatisch overschakelt op het mobiele netwerk bij een kabelbreuk, wat cruciaal is voor de bedrijfscontinuïteit.' },
            { title: 'Opzegging', body: 'Na de initiële periode van 6 maanden is er een opzegtermijn van slechts één maand, wat veel flexibiliteit biedt aan de ondernemer.' }
          ],
          breakdown: { high: 0, medium: 1, low: 9 },
          clauses: {
            'Opzegging': { 
              present: true, 
              text: 'De overeenkomst wordt gesloten voor een minimumduur van 6 maanden. Nadien kan de klant de overeenkomst op elk moment opzeggen met een opzegtermijn van één maand.', 
              risk: 'low', 
              issues: [] 
            },
            'Serviceniveau': { 
              present: true, 
              text: 'Telenet streeft naar een beschikbaarheid van de dienst van 99,8% op jaarbasis. Interventie bij defecten vindt plaats binnen de 4 werkuren na melding.', 
              risk: 'low', 
              issues: [] 
            },
            'Facturatie': {
              present: true,
              text: 'Betaling dient te geschieden via domiciliëring of overschrijving binnen 15 dagen na factuurdatum.',
              risk: 'low',
              issues: []
            }
          },
          actions: [
            { title: 'Test de Back-up', body: 'Voer bij installatie een test uit door de coax-kabel te verwijderen en te kijken of de 4G back-up correct overneemt.' },
            { title: 'Beheer Gebruikers', body: 'Zorg dat enkel geautoriseerde personen extra opties kunnen toevoegen aan het zakelijke account via het portaal.' }
          ]
        }
      }
    ];

    for (const d of userDocsData) {
      const report = createDetailedReport(d.name, d.type, d.risk, d.details);
      const reportJson = JSON.stringify(report);

      await new Promise((resolve) => {
        db.run(`INSERT INTO DOCUMENTEN (ID_USER, FILE_NAME, FILE_PATH, FILE_TYPE, TITLE, DESCRIPTION, RISK_SCORE, STATUS) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
                [testUser.ID_USER, `${d.name}.pdf`, `uploads/contracts/demo-${d.name.toLowerCase().replace(/ /g, '-')}.pdf`, d.type, d.name, d.details.humanSummary, report.overallRiskScore, 'done'], 
                function() {
                  const docId = this.lastID;
                  db.run(`INSERT INTO SAMENVATTING (ID_DOC, SUMMARY, KEY_CLAUSES, RED_FLAGS) VALUES (?, ?, ?, ?)`,
                          [docId, report.humanSummary, JSON.stringify(report.clauses), JSON.stringify(report.keyFindings)]);
                  db.run(`INSERT INTO CONTRACT_REPORTS (ID_DOC, REPORT_JSON) VALUES (?, ?)`,
                          [docId, reportJson], resolve);
                });
      });
    }
  }

  console.log('✅ HIGH-DETAIL Detailed Demo Data seeded successfully.');
  db.close();
}

seed();
