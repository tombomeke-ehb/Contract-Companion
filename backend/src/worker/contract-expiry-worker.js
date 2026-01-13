// backend/src/worker/contract-expiry-worker.js
// Worker voor contractverval-notificaties en automatisch verwijderen
import dotenv from 'dotenv'
dotenv.config({ path: new URL('../../.env', import.meta.url) })

import { query } from '../config/db.js'
import { sendNotification, sendEmail } from '../services/notification.service.js'

// Helper: haal alle gebruikers met hun voorkeuren op
globalThis.console = console // voor sommige omgevingen

async function getUsersWithPreferences() {
  const sql = `
    SELECT u.ID_USER, u.EMAIL, p.EXPIRY_REMINDER_DAYS
    FROM USERS u
    LEFT JOIN PREFERENCES p ON p.ID_USER = u.ID_USER
  `
  const res = await query(sql)
  return res.rows || []
}

// Haal alle documenten op die binnenkort verlopen of al verlopen zijn
async function getExpiringDocuments(userId, daysBefore = 7) {
  const sql = `
    SELECT d.ID_DOC, d.TITEL, d.EIND_DATE, d.ID_USER, u.EMAIL
    FROM DOCUMENTEN d
    JOIN USERS u ON u.ID_USER = d.ID_USER
    WHERE d.ID_USER = :userId
      AND d.EIND_DATE IS NOT NULL
      AND d.STATUS != 'deleted'
      AND d.EIND_DATE BETWEEN TRUNC(SYSDATE) AND (TRUNC(SYSDATE) + :daysBefore)
  `
  const res = await query(sql, { userId, daysBefore })
  return res.rows || []
}

// Haal verlopen documenten op die verwijderd moeten worden
async function getExpiredDocumentsToDelete(daysAfter = 30) {
  const sql = `
    SELECT ID_DOC, TITEL, EIND_DATE, ID_USER
    FROM DOCUMENTEN
    WHERE EIND_DATE IS NOT NULL
      AND STATUS != 'deleted'
      AND EIND_DATE < (TRUNC(SYSDATE) - :daysAfter)
  `
  const res = await query(sql, { daysAfter })
  return res.rows || []
}

// Verwijder document (soft delete)
async function softDeleteDocument(idDoc) {
  await query(`UPDATE DOCUMENTEN SET STATUS = 'deleted' WHERE ID_DOC = :idDoc`, { idDoc })
}

// Haal risk alerts voorkeuren op
async function getRiskAlertPreference(userId) {
  const sql = `SELECT RISK_ALERTS FROM PREFERENCES WHERE ID_USER = :userId`;
  const res = await query(sql, { userId });
  if (!res.rows.length) return true; // default: alerts aan
  return res.rows[0].RISK_ALERTS !== 0;
}

// Haal high-risk contracten op zonder bestaande risk alert notificatie
async function getHighRiskContractsWithoutAlert(userId) {
  const sql = `
    SELECT d.ID_DOC, d.TITEL, s.RISK_SCORE, d.ID_USER, u.EMAIL
    FROM DOCUMENTEN d
    JOIN SAMENVATTING s ON s.ID_DOC = d.ID_DOC
    JOIN USERS u ON u.ID_USER = d.ID_USER
    WHERE d.ID_USER = :userId
      AND d.STATUS != 'deleted'
      AND s.RISK_SCORE >= 7
      AND NOT EXISTS (
        SELECT 1 FROM NOTIFICATIONS n
        WHERE n.USER_ID = d.ID_USER AND n.CONTRACT_ID = d.ID_DOC AND n.VARIANT = 'risk' AND n.IS_READ = 0
      )
  `;
  const res = await query(sql, { userId });
  return res.rows || [];
}

async function processContractExpiry() {
  // 1. Notificaties voor bijna verlopen contracten
  const users = await getUsersWithPreferences()
  for (const user of users) {
    const daysBefore = user.EXPIRY_REMINDER_DAYS || 7
    const docs = await getExpiringDocuments(user.ID_USER, daysBefore)
    for (const doc of docs) {
      // Check of er al een notificatie is voor dit contract en deze variant
      const existing = await query(
        `SELECT 1 FROM NOTIFICATIONS WHERE USER_ID = :userId AND CONTRACT_ID = :docId AND VARIANT = 'expiry' AND IS_READ = 0`,
        { userId: user.ID_USER, docId: doc.ID_DOC }
      )
      if (existing.rows.length === 0) {
        await sendNotification(user.ID_USER, {
          title: 'Contract verloopt binnenkort',
          message: `Je contract "${doc.TITEL}" verloopt op ${doc.EIND_DATE.toISOString().slice(0,10)}.`,
          contractId: doc.ID_DOC,
          variant: 'expiry'
        })
        // Optioneel: stuur e-mail
        if (user.EMAIL) {
          await sendEmail(user.EMAIL, {
            subject: 'Contract verloopt binnenkort',
            body: `Je contract "${doc.TITEL}" verloopt op ${doc.EIND_DATE.toISOString().slice(0,10)}. Log in op Contract Companion voor details.`
          })
        }
      }
    }
  }

  // 2. Automatisch verwijderen van verlopen contracten
  const expiredDocs = await getExpiredDocumentsToDelete(30)
  for (const doc of expiredDocs) {
    await softDeleteDocument(doc.ID_DOC)
    await sendNotification(doc.ID_USER, {
      title: 'Contract verwijderd',
      message: `Je contract "${doc.TITEL}" is automatisch verwijderd omdat het meer dan 30 dagen verlopen is.`,
      contractId: doc.ID_DOC,
      variant: 'deleted'
    })
  }

  // 3. Risk alerts voor high-risk contracten
  for (const user of users) {
    const riskAlertsOn = await getRiskAlertPreference(user.ID_USER);
    if (!riskAlertsOn) continue;
    const highRiskDocs = await getHighRiskContractsWithoutAlert(user.ID_USER);
    for (const doc of highRiskDocs) {
      await sendNotification(user.ID_USER, {
        title: 'High-risk contract gevonden',
        message: `Je contract "${doc.TITEL}" bevat een high-risk clausule (score: ${doc.RISK_SCORE}). Bekijk het rapport!`,
        contractId: doc.ID_DOC,
        variant: 'risk'
      });
      if (user.EMAIL) {
        await sendEmail(user.EMAIL, {
          subject: 'High-risk contract gevonden',
          body: `Je contract "${doc.TITEL}" bevat een high-risk clausule (score: ${doc.RISK_SCORE}). Log in op Contract Companion voor details.`
        });
      }
    }
  }
}

// Start interval (1x per dag)
setInterval(processContractExpiry, 24 * 60 * 60 * 1000)
// Direct bij opstarten ook uitvoeren
processContractExpiry()
