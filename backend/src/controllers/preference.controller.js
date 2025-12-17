import preferenceService from "../services/preference.service.js";

export async function getPreferences(req, res) {
  const userId = req.params.userId;

  // Alleen eigen preferences bekijken, tenzij admin
  if (!req.user?.isAdmin && String(req.user?.id) !== String(userId)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const prefs = await preferenceService.getPreferences(userId);
    res.json(prefs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch preferences" });
  }
}

export async function updatePreferences(req, res) {
  const userId = req.params.userId;
  const { theme, lang } = req.body;

  // Alleen eigen preferences wijzigen, tenzij admin
  if (!req.user?.isAdmin && String(req.user?.id) !== String(userId)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    await preferenceService.updatePreferences(userId, theme, lang);
    res.json({ message: "Preferences saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not save preferences" });
  }
}
