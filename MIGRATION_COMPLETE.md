# 🎉 Contract Companion - SQLite Migration Complete!

## ✅ What Was Done

Your Contract Companion application has been successfully migrated from **Oracle Database** to **SQLite** for local development. This fixes the "NetworkError when attempting to fetch resource" issue you were experiencing.

### Changes Made:

1. **Database Migration**
   - Replaced Oracle (`oracledb` package) with SQLite (`sqlite3` package)
   - Created SQLite schema at `/backend/db/schema.sql`
   - SQLite database file: `/backend/data/contracts.db`

2. **Backend Configuration**
   - Updated `/backend/src/config/db.js` - New SQLite adapter with parameter mapping
   - Updated `/backend/src/services/user.service.js` - Simplified for SQLite
   - Updated `/backend/src/services/commonContract.service.js` - Removed Oracle dependencies
   - Updated `/backend/src/services/report.service.js` - Simplified for SQLite
   - Fixed `/backend/src/controllers/auth.controller.js` - Column name mapping

3. **Setup Scripts**
   - Created `/backend/db/setup.js` - Initializes database schema
   - Created `/backend/db/seed.js` - Creates test accounts
   - Added npm scripts: `npm run db:setup` and `npm run db:seed`

4. **Package Configuration**
   - Updated `package.json` with new dependencies
   - Added `.gitignore` for `data/` directory (database not in git)
   - Updated `.env` - Removed Oracle credentials

5. **Documentation**
   - Updated `README.md` with new setup instructions

---

## 🚀 Quick Start

### 1️⃣ Setup Database (One-time)
```bash
cd backend
npm run db:setup    # Creates schema
npm run db:seed     # Creates test accounts
```

### 2️⃣ Start the Application
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 3️⃣ Access the Application
- **Frontend**: https://localhost:5173
- **Backend API**: https://localhost:3443

---

## 🔑 Test Accounts

After running `npm run db:seed`, you have:

| Email | Password | Role |
|-------|----------|------|
| admin@test.com | Admin123! | Admin |
| user@test.com | User123! | User |

---

## ✨ Features Now Working

✅ User Registration  
✅ User Login  
✅ Admin Account  
✅ User Preferences  
✅ Common Contracts Library  
✅ Contract Storage & Management  

---

## 🔄 Reset Database

If you need to start fresh:

```bash
cd backend
rm -r data/contracts.db
npm run db:setup
npm run db:seed
```

---

## 📝 API Testing

### Login (cURL)
```bash
curl -X POST https://localhost:3443/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Admin123!"}' \
  -k
```

### Register (cURL)
```bash
curl -X POST https://localhost:3443/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","surname":"Doe","email":"john@example.com","password":"SecurePass123"}' \
  -k
```

---

## 🛠️ Technical Details

### Database Schema
- `USERS` - User accounts
- `DOCUMENTEN` - Contract uploads
- `CONTRACT_REPORTS` - Analysis reports
- `SAMENVATTING` - Contract summaries
- `KALENDER` - Important dates
- `PREFERENCES` - User settings
- `COMMON_CONTRACTS` - Example contracts library

### Parameter Mapping
The database adapter automatically converts:
- Oracle's `:paramName` → SQLite's `$paramName`
- Column names to UPPERCASE for API compatibility
- Oracle functions like `NVL()` → `COALESCE()`

---

## ⚠️ Notes

- **SQLite** is perfect for local development but may need scaling for production
- All data is stored locally at `./backend/data/contracts.db`
- The data directory is in `.gitignore` - won't be committed to git
- For production, consider PostgreSQL or MySQL

---

## 🐛 Troubleshooting

**Port already in use?**
```bash
Stop-Process -Name "node" -Force
```

**Database errors?**
```bash
rm -r data/contracts.db
npm run db:setup
npm run db:seed
```

**Still seeing NetworkError?**
- Make sure both backend and frontend are running
- Check console errors in browser DevTools
- Verify certificates exist in `/certs/`

---

## ✅ Verification Checklist

- [x] SQLite database created
- [x] Test accounts seeded
- [x] Backend API responding
- [x] Login working
- [x] Registration working
- [x] Authentication tokens generating
- [x] Frontend connecting to backend

---

**You're all set! 🎊 Happy coding!**
