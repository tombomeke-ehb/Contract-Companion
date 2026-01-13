import * as preferenceService from "../services/preferences.service.js";
// GET /api/preferences/:userId
// PUT /api/preferences/:userId
// import other necessary modules if needed
export async function getPreferencesForUser(req, res, next) {
  try {
    const userId = Number(req.params.userId);
    const prefs = await preferenceService.findByUserId(userId);

    if (!prefs) {
      return res.status(404).json({ error: "No preferences found for this user" });
    }

    res.json({
      theme: prefs.THEME,
      language: prefs.LANG,
      region: prefs.REGION,
      sessionTimeout: prefs.SESSION_TIMEOUT,
      expiryReminderDays: prefs.EXPIRY_REMINDER_DAYS,
      autoDeleteDays: prefs.AUTO_DELETE_DAYS,
      riskAlerts: prefs.RISK_ALERTS,
      riskAlertsEmail: prefs.RISK_ALERTS_EMAIL
    });
  } catch (err) {
    next(err);
  }
}
// Update user preferences
export async function updatePreferencesForUser(req, res, next) {
  try {
    const userId = Number(req.params.userId);
    const { theme, language, region, sessionTimeout, expiryReminderDays, autoDeleteDays, riskAlerts, riskAlertsEmail } = req.body;
    const langCode = language === "nl" ? "nl" : "en";
    console.log('[preferences.controller] updatePreferencesForUser', { userId, theme, language, region, sessionTimeout, expiryReminderDays, autoDeleteDays, riskAlerts, riskAlertsEmail });

    await preferenceService.updateForUser(userId, {
      theme,
      language: langCode,
      region,
      sessionTimeout: sessionTimeout ? Number(sessionTimeout) : undefined,
      expiryReminderDays: expiryReminderDays ? Number(expiryReminderDays) : undefined,
      autoDeleteDays: autoDeleteDays ? Number(autoDeleteDays) : undefined,
      riskAlerts: riskAlerts !== undefined ? Number(riskAlerts) : undefined,
      riskAlertsEmail: riskAlertsEmail !== undefined ? Number(riskAlertsEmail) : undefined
    });

    res.json({ message: "Preferences updated" });
  } catch (err) {
    console.error('[preferences.controller] updatePreferencesForUser error', err);
    next(err);
  }
}
