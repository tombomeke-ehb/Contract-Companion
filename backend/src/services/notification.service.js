// Notification service stub
import nodemailer from 'nodemailer'
import db from '../config/db.js'
import dotenv from 'dotenv'
dotenv.config({ path: new URL('../.env', import.meta.url) })

export async function sendNotification(userId, payload) {
  await db.query(
    `INSERT INTO NOTIFICATIONS (USER_ID, TITLE, MESSAGE, CONTRACT_ID, VARIANT) VALUES (:userId, :title, :message, :contractId, :variant)`,
    { userId, title: payload.title, message: payload.message, contractId: payload.contractId, variant: payload.variant }
  )
}

export async function getUserNotifications(userId) {
  const res = await db.query(
    `SELECT * FROM NOTIFICATIONS WHERE USER_ID = :userId AND IS_READ = 0 ORDER BY CREATED_AT DESC`,
    { userId }
  )
  return res.rows
}

export async function markNotificationRead(id) {
  await db.query(`UPDATE NOTIFICATIONS SET IS_READ = 1 WHERE ID = :id`, { id })
}

export async function sendEmail(to, { subject, body }) {
  // Detecteer settings uit .env (MAIL_*)
  const host = process.env.MAIL_HOST || process.env.SMTP_HOST
  const port = Number(process.env.MAIL_PORT || process.env.SMTP_PORT || 587)
  // Als host niet is ingevuld, log een duidelijke foutmelding
  if (!host) throw new Error('MAIL_HOST of SMTP_HOST ontbreekt in .env')
  const user = process.env.MAIL_USERNAME || process.env.SMTP_USER
  const pass = process.env.MAIL_PASSWORD || process.env.SMTP_PASS
  const from = `${process.env.MAIL_FROM_NAME || 'Contract Companion'} <${process.env.MAIL_FROM_ADDRESS || process.env.SMTP_FROM || user}>`
  const secure = (process.env.MAIL_ENCRYPTION || '').toLowerCase() === 'ssl' || (process.env.SMTP_SECURE === 'true')
  const tls = (process.env.MAIL_ENCRYPTION || '').toLowerCase() === 'tls'

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: tls ? { rejectUnauthorized: false } : undefined
  })
  await transporter.sendMail({
    from,
    to,
    subject,
    text: body
  })
  console.log('[notify] Email sent to', to)
}

// Testfunctie voor mailer
export async function sendTestEmail(to) {
  await sendEmail(to, {
    subject: 'Testmail Contract Companion',
    body: 'Dit is een testmail vanuit de Contract Companion backend.'
  })
}
