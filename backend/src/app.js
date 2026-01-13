// backend/src/app.js
// Main application setup for the backend server

import express from "express";
import cors from "cors";
import path from "path";
import contractRoutes from "./routes/contract.routes.js";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import preferencesRoutes from "./routes/preferences.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import calendarRoutes from "./routes/calendar.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import peopleRoutes from "./routes/people.routes.js";
import commonContractRoutes from './routes/commonContract.routes.js';

const app = express();

// Simpele CORS: alleen je frontend origins toestaan, geen regex/dynamisch
const allowedOrigins = [
  "http://localhost:5173",
  "https://localhost:5173",
  "https://ehbcontractcompanion.tombomeke.com"
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    preflightContinue: false,
    optionsSuccessStatus: 200,
  })
);

app.use(express.json());

// --- SSE support for contract analysis events, direct in app.js to bypass CORS middleware ---
let sseClients = [];
app.options('/api/contracts/events', (req, res) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
    return res.sendStatus(200);
  }
  return res.sendStatus(403);
});
app.get('/api/contracts/events', (req, res) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  sseClients.push(res);

  // Stuur direct een eerste ping
  res.write('event: ping\ndata: {}\n\n');

  // Keep-alive ping elke 5 minuten (300000 ms)
  const ping = setInterval(() => {
    res.write('event: ping\ndata: {}\n\n');
  }, 300000);

  req.on('close', () => {
    clearInterval(ping);
    sseClients = sseClients.filter(client => client !== res);
  });
});
app.broadcastContractAnalyzed = function(contractId) {
  sseClients.forEach(res => {
    res.write(`event: contractAnalyzed\ndata: ${JSON.stringify({ contractId })}\n\n`);
  });
};

app.post('/api/contracts/notify-analyzed', express.json(), (req, res) => {
  const { contractId } = req.body;
  if (typeof app.broadcastContractAnalyzed === 'function' && contractId) {
    app.broadcastContractAnalyzed(contractId);
    res.json({ ok: true });
  } else {
    res.status(400).json({ error: 'Missing contractId' });
  }
});

// static files
app.use("/public", express.static(path.join(process.cwd(), "public")));

// API routes
app.use("/api/contracts", contractRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/preferences", preferencesRoutes);
app.use("/api", adminRoutes);
app.use("/api/people", peopleRoutes);
app.use("/api", calendarRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/common-contracts', commonContractRoutes);

// Global error handler (should be last middleware)
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message || 'Internal server error', details: err.stack });
});

export default app;
