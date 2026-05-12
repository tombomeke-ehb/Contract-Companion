# Contract Companion 📄

> Een AI-gedreven platform voor het begrijpen, analyseren en beheren van contracten zonder juridische kennis

Contract Companion helpt gebruikers om complexe contracten automatisch te analyseren, te begrijpen en op te volgen. De combinatie van AI-analyse, risicodetectie, automatische herinneringen en een standaardcontracten-bibliotheek maakt het uniek.

**🔗 Quick Links:** [Figma Prototype](https://www.figma.com/design/VHRMdl77RiM7ZNSNLk8qwU/IT-project) | [Demo Video](https://youtu.be/lY44BLT9CS8) | [Trello Board](https://trello.com/invite/b/690c916e46c2d56e8293ef94/ATTI6bd7bded80f526987d803b12d400b904662B1CCA/it-project)

---

## 👥 Team

| Rol | Naam |
|-----|------|
| Product Owner | Tom Dekoning |
| Dev/Database | Lars Biczysko |
| Design/Dev | Ahmed Takadoumi |
| Dev | Waïl Zemouri |
| Dev | Fariss Boughaba |

---

## ❓ Probleemstelling

Mensen ondertekenen contracten zonder de inhoud te begrijpen. Belangrijke clausules zoals automatische verlengingen, lange opzegtermijnen en verborgen kosten worden vaak te laat ontdekt.

**Kernproblemen:**
- 🔍 Ingewikkeld juridisch taalgebruik en verborgen clausules
- 📁 Contracten verspreid over mail, drives en folders
- ⏰ Vergeten deadlines en automatische verlengingen

**Onze Oplossing:**
- Dedicated, veilige plaats voor contractopslag
- AI-analyse gespecialiseerd in contracten
- Automatische opvolging en herinneringen
- Vooraf geanalyseerde standaardcontracten
- Privacy-first: data wordt niet gebruikt voor training

---

## 🎨 Design Thinking

We volgden de **Design Thinking** methodologie:

1. **Empathize**: Onderzoek naar gebruikersproblemen (interviews, observaties)
2. **Define**: Probleem gekaderd - wie, wat, waar, waarom
3. **Ideate**: Brainstorm sessies → kernfuncties bepaald
4. **Prototype**: [Figma wireframes](https://www.figma.com/design/VHRMdl77RiM7ZNSNLk8qwU/IT-project) en [demo](https://youtu.be/lY44BLT9CS8)
5. **Test**: Iteratieve verbeteringen met gebruikerstests

**Doelgroep**: Freelancers, kleine ondernemers, huurders, studenten - mensen zonder juridische expertise die contracten moeten begrijpen en beheren.

---

## ⚙️ Kernfunctionaliteiten

| Functie | Beschrijving |
|---------|-------------|
| 🔍 **Automatische Analyse** | OCR voor PDF/Word/TXT • AI-samenvatting • Risico- en red-flag detectie |
| 📁 **Contractbeheer** | Dashboard met filters • Tags & notities • Zoekfunctie |
| 🔔 **Herinneringen** | Automatische notificaties • Kalenderintegratie (iCal) • E-mail alerts |
| 📚 **Standaardcontracten** | Vooraf geanalyseerde contracten (telecom, energie, fitness) • Directe vergelijking |
| 📊 **Monitoring** | Risicoscore per contract • Visuele weergave • Deadline overzicht |

---

## 🔄 Pipeline & Architectuur

### Contract Analyse Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                         GEBRUIKER                                   │
│                             ↓                                        │
│                    ┌────────────────┐                               │
│                    │  Upload Flow   │                               │
│                    └────────────────┘                               │
└─────────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Vue.js)                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   Upload     │  │  Dashboard   │  │   Kalender   │            │
│  │  Component   │  │  Component   │  │  Component   │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│         ↓                   ↓                  ↓                    │
│  ┌──────────────────────────────────────────────────┐             │
│  │         API Client (Axios)                       │             │
│  └──────────────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                     BACKEND (Express.js)                            │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                    API Layer                                   │ │
│  │  /auth  │  /contracts  │  /calendar  │  /preferences         │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                             ↓                                        │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │               Middleware Layer                                │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐            │ │
│  │  │    Auth    │  │   Upload   │  │  Validator │            │ │
│  │  │    (JWT)   │  │  (Multer)  │  │            │            │ │
│  │  └────────────┘  └────────────┘  └────────────┘            │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                             ↓                                        │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                    Services Layer                            │ │
│  │                                                               │ │
│  │  ┌────────────────────────────────────────────────────────┐ │ │
│  │  │         AI Orchestrator Service                        │ │ │
│  │  │  (Coördineert alle AI-verwerkingsstappen)            │ │ │
│  │  └────────────────────────────────────────────────────────┘ │ │
│  │         ↓                      ↓                      ↓       │ │
│  │  ┌──────────┐          ┌──────────┐          ┌──────────┐  │ │
│  │  │ Document │          │   Text   │          │   LLM    │  │ │
│  │  │   OCR    │    →     │Preprocess│    →     │Structurer│  │ │
│  │  │ Service  │          │ Service  │          │ Service  │  │ │
│  │  └──────────┘          └──────────┘          └──────────┘  │ │
│  │                                                               │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │         Report Mapper Service                        │  │ │
│  │  │  (Genereert eindrapport met alle analyses)          │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │                                                               │ │
│  │  ┌──────────┐   ┌──────────┐   ┌──────────────┐           │ │
│  │  │Contract  │   │  User    │   │ Preference   │           │ │
│  │  │ Service  │   │ Service  │   │   Service    │           │ │
│  │  └──────────┘   └──────────┘   └──────────────┘           │ │
│  └──────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    EXTERNE SERVICES                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   Google     │  │    OpenAI    │  │    Oracle    │            │
│  │ Document AI  │  │  GPT Model   │  │   Database   │            │
│  │     (OCR)    │  │  (Analyse)   │  │              │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
└─────────────────────────────────────────────────────────────────────┘
```

### Verwerkingsstappen

1. **Upload & Validatie**
   - Gebruiker uploadt contract (PDF/Word/TXT)
   - Frontend valideert bestandstype en grootte
   - Backend ontvangt via Multer middleware

2. **OCR & Text Extractie**
   - Google Document AI verwerkt het document
   - Tekst wordt geëxtraheerd uit PDF/afbeeldingen
   - Text preprocessing normaliseert de tekst

3. **AI-Analyse**
   - LLM Structurer analyseert contractstructuur
   - AI Orchestrator coördineert analyse
   - Risicodetectie, clausule-extractie, samenvatting

4. **Report Generatie**
   - Report Mapper combineert alle analyses
   - Risicoscore wordt berekend
   - Gestructureerd rapport wordt gegenereerd

5. **Opslag & Presentatie**
   - Contract metadata wordt opgeslagen in SQLite DB (lokaal)
   - Bestanden worden veilig opgeslagen
   - Dashboard toont resultaten aan gebruiker

6. **Monitoring & Herinneringen**
   - Belangrijke datums worden geëxtraheerd
   - Kalenderintegratie genereert ICS-bestanden
   - E-mailnotificaties bij naderende deadlines

---

## 💻 Technology Stack

**Frontend:** Vue.js 3 • Vite • Pinia • Vue Router  
**Backend:** Node.js • Express • JWT • Multer • bcryptjs  
**Database:** SQLite (lokaal) - vroeger Oracle  
**AI & OCR:** Google Document AI • OpenAI GPT  
**Security:** HTTPS/TLS • JWT auth • bcrypt encryption  
**Tools:** Git • GitHub • Trello • ESLint

---

## 📦 Installatie

### Vereisten
- Node.js versie 20.19.0 of hoger
- Git voor versiebeheer
- Optional: Google Cloud account met Document AI API toegang (voor contract analyse)

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

### Stap 3: Database setup
De applicatie gebruikte eerder Oracle Database, maar is nu omgezet naar **SQLite** voor eenvoudiger lokale development!

```bash
cd backend

# Maak de database schema aan
npm run db:setup

# Maak test accounts aan
npm run db:seed
```

Dit zal:
- 📁 Een `data/` directory aanmaken
- 📊 De SQLite database (`contracts.db`) initialiseren
- 👤 Test accounts aanmaken:
  - **Admin**: admin@test.com / Admin123!
  - **Normale user**: user@test.com / User123!

### Stap 4: Omgevingsvariabelen configureren
Een `.env` bestand is al aanwezig in de backend folder. De database is nu automatisch geconfigureerd!

```env
# Backend/.env
PORT=3000
HTTPS_PORT=3443
HTTPS_KEY=../certs/key.pem
HTTPS_CERT=../certs/cert.pem
JWT_SECRET=dev_secret_key_change_in_production

# Database: SQLite (geen configuratie nodig)
# Database file: ./data/contracts.db
```
DB_CONNECTION_STRING=your_oracle_connection_string
GOOGLE_APPLICATION_CREDENTIALS=./src/config/documentation-key.json
```

### Stap 5: Google Cloud Document AI configureren (Optional)
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
- **Frontend**: https://localhost:5173
- **Backend**: https://localhost:3443

### Reset Database (als iets fout gaat)
```bash
### Reset Database (als iets fout gaat)
```bash
cd backend

# Verwijder de bestaande database
rm -r data/contracts.db

# Maak schema en seed opnieuw aan
npm run db:setup
npm run db:seed
```

---

## 🔑 Login Credentials

Na het uitvoeren van `npm run db:seed` zijn de volgende test accounts beschikbaar:

| Email | Wachtwoord | Rol | Beschrijving |
|-------|-----------|-----|-------------|
| **admin@test.com** | **Admin123!** | Admin | Beheerder met volledige toegang |
| **user@test.com** | **User123!** | User | Normale gebruiker |

### Eerste keer inloggen
1. Go to https://localhost:5173
2. Klik op "Login"
3. Voer email en wachtwoord in
4. Je bent nu ingelogd!

---

## 🧪 Testing Guide

### 1. Backend API Testen

#### Login Test
```powershell
$body = @{
    email = "admin@test.com"
    password = "Admin123!"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://localhost:3443/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body `
  -SkipCertificateCheck
```

#### Registratie Test
```powershell
$body = @{
    name = "John"
    surname = "Doe"
    email = "john@example.com"
    password = "SecurePass123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://localhost:3443/api/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body `
  -SkipCertificateCheck
```

#### Contracten Ophalen (met token)
```powershell
# Eerst login om token te krijgen
$loginBody = @{
    email = "admin@test.com"
    password = "Admin123!"
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest -Uri "https://localhost:3443/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body $loginBody `
  -SkipCertificateCheck

$token = ($loginResponse.Content | ConvertFrom-Json).token

# Nu contracten ophalen
Invoke-WebRequest -Uri "https://localhost:3443/api/contracts" `
  -Method GET `
  -Headers @{ "Authorization" = "Bearer $token" } `
  -SkipCertificateCheck
```

### 2. Frontend Testen

1. **Open Frontend**: https://localhost:5173
2. **Login**: Gebruik admin@test.com / Admin123!
3. **Dashboard**: Bekijk lege contracten lijst
4. **Upload**: Probeer een PDF contract te uploaden
5. **Verifieer**: Contract moet verschijnen in dashboard

### 3. Database Controleren

```powershell
# SQLite database file
Get-Item -Path "backend/data/contracts.db"

# Check file grootte
(Get-Item -Path "backend/data/contracts.db").Length
```

---

## 🔌 API Endpoints

### Authenticatie
- `POST /api/auth/register` - Nieuwe gebruiker registreren
- `POST /api/auth/login` - Gebruiker inloggen
- `GET /api/auth/verify` - JWT token verifiëren

### Contracten
- `GET /api/contracts` - Lijst van alle contracten ophalen (authenticatie vereist)
- `POST /api/contracts/upload` - Nieuw contract uploaden en analyseren (authenticatie vereist)
- `POST /api/contracts/upload-raw` - Contract uploaden zonder AI-analyse (authenticatie vereist)
- `GET /api/contracts/:id` - Specifiek contract ophalen (authenticatie vereist)
- `PUT /api/contracts/:id` - Contract bijwerken (authenticatie vereist)
- `DELETE /api/contracts/:id` - Contract verwijderen (authenticatie vereist)

### Standaardcontracten-Bibliotheek
- `GET /api/contracts/common` - Lijst van vooraf geanalyseerde standaardcontracten (publiek)
- `GET /api/contracts/common/:id` - Specifiek standaardcontract ophalen (publiek)
- `POST /api/contracts/common` - Nieuw standaardcontract toevoegen (admin)
- `PUT /api/contracts/common/:id` - Standaardcontract bijwerken (admin)
- `DELETE /api/contracts/common/:id` - Standaardcontract verwijderen (admin)

### Kalender
- `GET /api/calendar/event.ics` - ICS-bestand genereren voor kalenderintegratie (authenticatie vereist)

### Voorkeuren
- `GET /api/preferences/:userId` - Gebruikersvoorkeuren ophalen (authenticatie vereist)
- `PUT /api/preferences/:userId` - Gebruikersvoorkeuren bijwerken (authenticatie vereist)

### Admin (alleen voor beheerders)
- `GET /api/people` - Alle gebruikers ophalen
- `POST /api/people` - Nieuwe gebruiker aanmaken
- `DELETE /api/people/:id` - Gebruiker verwijderen

### Data Formats
- **Request**: JSON / multipart/form-data (voor uploads)
- **Response**: JSON
- **Files**: PDF, Word, TXT (voor contracten)
- **Encoding**: UTF-8

---

## 🔒 Security

**Beveiliging:**
- 🔐 HTTPS/TLS voor alle communicatie
- 🔑 JWT authenticatie met sessie-timeout (2u)
- 🛡️ bcrypt wachtwoord hashing
- 🚫 Input validatie & sanitisatie
- 🔒 RBAC (Role-Based Access Control)
- ⚡ Rate limiting tegen brute force

**Privacy:**
- Versleutelde opslag van contracten
- Data wordt NIET gebruikt voor AI-training
- GDPR-compliant
- Gebruikers hebben volledige controle

---

## 📊 Market Analysis

**Concurrentie:** Enterprise tools (te complex/duur), ChatGPT (geen privacy/beheer), simpele opslag (geen analyse)

**Onze USP's:**
✅ Specifiek voor niet-juridische gebruikers  
✅ Privacy-first benadering  
✅ Combinatie analyse + beheer + herinneringen  
✅ Standaardcontracten-bibliotheek  
✅ Betaalbaar voor particulieren/KMO's

<details>
<summary><strong>SWOT Analyse</strong></summary>

**Strengths:** Unieke combinatie functies • Privacy-focus • Gebruiksvriendelijk  
**Weaknesses:** Afhankelijk van externe AI • Gebruikersvertrouwen opbouwen  
**Opportunities:** Groeiende markt (freelancers, KMO's) • Integraties • Internationalisatie  
**Threats:** Grote spelers • Regelgeving • Concurrentie AI-tools  
</details>

---
