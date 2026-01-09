# Contract Companion

Contract Companion helpt gebruikers om complexe contracten automatisch te analyseren, te begrijpen en op te volgen. Het richt zich op zowel mensen die een contract voor ondertekening willen controleren als op gebruikers die lopende contracten willen beheren.

Wat het uniek maakt, is de combinatie van AI-analyse, risicodetectie, automatische herinneringen en een geïntegreerde bibliotheek met veelvoorkomende standaardcontracten (zoals telecom- en energiecontracten) die vooraf al geanalyseerd zijn. Hierdoor krijgen gebruikers onmiddellijk inzicht in zowel persoonlijke als standaardcontracten, zonder juridische kennis nodig te hebben.

---

## Team

- Product Owner: Tom Dekoning
- Dev/Database: Lars Biczysko
- Design/Dev: Ahmed Takadoumi
- Dev: Waïl Zemouri
- Dev: Fariss Boughaba

---

## Probleemstelling

Veel mensen ondertekenen contracten zonder de inhoud volledig te begrijpen. Belangrijke clausules zoals automatische verlengingen, lange opzegtermijnen en verborgen kosten worden vaak pas ontdekt wanneer het te laat is.

Daarnaast mist er een eenvoudige manier om lopende contracten op te volgen: documenten zitten verspreid, opzegdatums worden vergeten en gebruikers verliezen overzicht.

Ook bij standaardcontracten (zoals telecom of energie) ontbreekt een plaats waar consumenten in één oogopslag kunnen zien wat ze precies tekenen.

Contract Companion lost dit op door zowel persoonlijke contracten te analyseren als standaardcontracten vooraf duidelijk samen te vatten. Hierdoor kunnen gebruikers een contract begrijpen voor ze tekenen en georganiseerd blijven nadat het contract actief is.

---

## Doelstellingen

- Contracten begrijpelijk maken voor mensen zonder juridische kennis
- Gebruikers helpen risico's en belangrijke clausules sneller te herkennen
- Een veilige en centrale plaats bieden om contracten op te slaan en te beheren
- Voorkomen dat gebruikers belangrijke deadlines, opzegtermijnen of verlengingen vergeten
- Inzicht geven in standaardcontracten voor ondertekening
- Het vertrouwen en de controle van gebruikers over hun contracten vergroten

---

## Kernfunctionaliteiten  

  ### Automatische Analyse
    - OCR wordt geondersteund voor **PDF, Word, TXT**  
    - Detectie van kerninformatie (looptijd, opzegtermijn, verlengingen)  
    - Duidelijke samenvatting in duidelijke taal 
    - Automatische **risico- en red-flag detectie**

  ### Contractbeheer  
    - Dashboard met alle geüploade contracten  
    - Filters: actief, opzegbaar, verlopen  
    - Tags, notities, markeringen  
    - Bekijken van individuele analyse-resultaten

  ### Herinneringen  
    - Automatische notificaties voor:  
      - Opzegdeadlines  
      - Proefperiodes  
      - Vervaldatums

  ### Overzicht & Monitoring  
    - Heldere visuele weergave van risico’s  
    - Filter- en sorteeropties  
    - Snel inzicht in deadlines
---

## Doelgroep

Contract Companion richt zich op particulieren, starters, huurders, freelancers en kleine ondernemingen die regelmatig contracten ondertekenen, maar niet de tijd of juridische expertise hebben om alle clausules volledig te interpreteren.

De applicatie ondersteunt twee belangrijke gebruikssituaties:
1. Voor ondertekening: gebruikers willen inzicht in nieuwe contracten voordat ze tekenen, om risico's en voorwaarden te begrijpen
2. Na ondertekening: gebruikers willen lopende contracten beheren, deadlines volgen en automatische verlengingen voorkomen

---

## Gebruikersflow

### 1. Registratie en Login
Gebruiker maakt een account aan of logt in met bestaande credentials.

### 2. Contract Upload
Gebruiker uploadt een contractbestand via de upload-interface. Ondersteunde formaten zijn PDF, Word en TXT. Gebruikers kunnen ook de standaardcontracten-bibliotheek raadplegen voor vooraf geanalyseerde contracten.

### 3. Automatische Analyse
Het systeem verwerkt het document met OCR en AI-analyse. De structuur wordt geëxtraheerd, kerninformatie wordt geïdentificeerd en risico's worden gedetecteerd.

### 4. Resultaten Bekijken
Contract verschijnt in het persoonlijke dashboard met een gedetailleerde analyse, inclusief risicoscore, belangrijke clausules en duidelijke samenvatting in begrijpelijke taal.

### 5. Beheer en Monitoring
Gebruiker kan het contract aanvullen met metadata, tags en notities toevoegen. Belangrijke datums worden automatisch gevolgd via de kalender.

### 6. Herinneringen en Opvolging
Het systeem stuurt automatische notificaties voor naderende deadlines, opzegtermijnen en belangrijke datums via e-mail of kalenderintegratie.

---

## Technology Stack

### Frontend
- Vue.js 3 met Composition API - Voor het bouwen van een snelle en gebruiksvriendelijke webinterface
- Vite als build tool - Voor efficiënte ontwikkeling en bundeling
- Pinia voor state management - Voor centraal beheer van applicatiestatus
- Vue Router voor navigatie - Voor routing binnen de applicatie
- Vue I18n voor meertalige ondersteuning - Voor internationalisatie
- CSS voor consistente styling

### Backend
- Node.js met Express framework - Voor server-side logica en API's
- JWT authenticatie - Voor veilig inloggen en sessiebeheer
- Multer voor bestandsupload - Voor veilige verwerking van geüploade contracten
- bcryptjs voor wachtwoordencryptie - Voor veilige opslag van gebruikersgegevens

### Database & Opslag
- Oracle Database - Voor opslag van gebruikersgegevens en contractmetadata
- Cloud storage (AWS S3 of vergelijkbaar) - Voor veilige opslag van contractbestanden

### AI & Documentverwerking
- Google Document AI - Voor OCR-technologie om tekst uit gescande PDF's en afbeeldingen te halen
- AI/Language Model - Voor automatische samenvattingen en risicodetectie in contracten
- Text preprocessing services - Voor voorbereiding van tekst voor analyse

### Beveiliging
- HTTPS-ondersteuning met zelfondertekende certificaten
- JWT-gebaseerde authenticatie
- Encryptie voor bescherming van gevoelige contractgegevens
- Beveiligde bestandsupload met validatie

### Notificaties & Integraties
- E-mailnotificaties voor herinneringen rond verval- en opzegdata
- Kalenderintegratie (Google Calendar, Outlook) voor het toevoegen van belangrijke contractmomenten

### Ontwikkeltools & Samenwerking
- Git & GitHub voor versiebeheer en teamsamenwerking
- Pipelining voor consistente ontwikkel- en testomgevingen
- ESLint voor code kwaliteit
- Nodemon voor automatische server-restarts tijdens ontwikkeling

---

## Installatie

### Vereisten
- Node.js versie 20.19.0 of hoger
- Oracle Database
- Google Cloud account met Document AI API toegang
- Git voor versiebeheer

### Stap 1: Repository klonen
```bash
git clone <repository-url>
cd Contract-Companion
```

### Stap 2: Dependencies installeren
```bash
# Installeer alle dependencies (backend en frontend)
npm run install:all

# Of afzonderlijk:
npm run install:backend
npm run install:frontend
```

### Stap 3: Omgevingsvariabelen configureren
Maak een `.env` bestand aan in de backend map met de volgende variabelen:
```
PORT=3000
HTTPS_PORT=3443
HTTPS_KEY=../certs/key.pem
HTTPS_CERT=../certs/cert.pem
JWT_SECRET=your_jwt_secret_here
DB_USER=your_oracle_user
DB_PASSWORD=your_oracle_password
DB_CONNECTION_STRING=your_oracle_connection_string
GOOGLE_APPLICATION_CREDENTIALS=./src/config/documentation-key.json
```

### Stap 4: Database setup
Voer het DDL-script uit in je Oracle Database:
```bash
sqlplus user/password@connection_string @backend/db/COMMON_CONTRACTS_ddl.sql
```

### Stap 5: Google Cloud Document AI configureren
1. Maak een Google Cloud project aan
2. Activeer de Document AI API
3. Maak een service account aan en download de JSON key
4. Plaats de key in `backend/src/config/documentation-key.json`

### Stap 6: Applicatie starten
```bash
# Start backend en frontend tegelijkertijd
npm run start:all

# Of afzonderlijk:
cd backend && npm run dev
cd frontend && npm run dev
```

De applicatie is nu beschikbaar op:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000 of https://localhost:3443

---

## API Endpoints

### Authenticatie
- `POST /api/auth/register` - Nieuwe gebruiker registreren
- `POST /api/auth/login` - Gebruiker inloggen
- `GET /api/auth/verify` - JWT token verifiëren

### Contracten
- `GET /api/contracts` - Lijst van alle contracten ophalen
- `POST /api/contracts` - Nieuw contract uploaden en analyseren
- `GET /api/contracts/:id` - Specifiek contract ophalen
- `PUT /api/contracts/:id` - Contract bijwerken
- `DELETE /api/contracts/:id` - Contract verwijderen

### Standaardcontracten-Bibliotheek
- `GET /api/common-contracts` - Lijst van vooraf geanalyseerde voorbeeldcontracten
- `GET /api/common-contracts/:key` - Specifiek voorbeeldcontract ophalen

### Kalender
- `GET /api/calendar` - Kalenderoverzicht met belangrijke contractdatums
- `GET /api/calendar/events` - Alle gebeurtenissen ophalen

### Voorkeuren
- `GET /api/preferences` - Gebruikersvoorkeuren ophalen
- `PUT /api/preferences` - Gebruikersvoorkeuren bijwerken

### Admin (alleen voor beheerders)
- `GET /api/admin/users` - Alle gebruikers beheren
- `POST /api/admin/common-contracts` - Nieuw voorbeeldcontract toevoegen aan bibliotheek
- `PUT /api/admin/common-contracts/:id` - Voorbeeldcontract bijwerken
- `DELETE /api/admin/common-contracts/:id` - Voorbeeldcontract verwijderen