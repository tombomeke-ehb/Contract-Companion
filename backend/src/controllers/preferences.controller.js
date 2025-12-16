import * as preferenceService from "../services/preferences.service.js";

export async function getPreferencesForUser(req, res, next) {
  try {
    const userId = Number(req.params.userId);
    const prefs = await preferenceService.findByUserId(userId);

    if (!prefs) {
      return res.status(404).json({ error: "No preferences found for this user" });
    }

    res.json(prefs);
  } catch (err) {
    next(err);
  }
}

export async function updatePreferencesForUser(req, res, next) {
  try {
    const userId = Number(req.params.userId);
    const { theme, language, region } = req.body;
    const langCode = language === "nl" ? "nl" : "en";

    await preferenceService.updateForUser(userId, {
      theme,
      language: langCode,
      region,
    });

    res.json({ message: "Preferences updated" });
  } catch (err) {
    next(err);
  }
}
