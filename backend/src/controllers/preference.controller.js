import preferenceService from "../services/preference.service.js";

export async function getPreferences(req, res) {
  const userId = req.params.userId;

  try {
    const prefs = await preferenceService.getPreferences(userId);
    res.json(prefs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kon voorkeuren niet ophalen" });
  }
}

export async function updatePreferences(req, res) {
  const userId = req.params.userId;
  const { theme, lang } = req.body;

  try {
    await preferenceService.updatePreferences(userId, theme, lang);
    res.json({ message: "Voorkeuren opgeslagen" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kon voorkeuren niet opslaan" });
  }
}
