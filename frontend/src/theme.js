// frontend/src/theme.js

export const STORAGE_KEYS = {
  theme: 'cc_theme_v2'
}

export const THEME_CLASS_MAP = {
  dark: 'theme-dark',
  'dark-purple': 'theme-dark-purple',
  'dark-blue': 'theme-dark-blue',
  light: 'theme-light',
  'light-blue': 'theme-light-blue',
  'high-contrast': 'theme-high-contrast'
}

export function applyTheme(themeKey) {
  const body = document.body

  // Remove any previously applied theme classes
  Object.values(THEME_CLASS_MAP).forEach((cls) => body.classList.remove(cls))

  // For light theme we default to no class (uses :root defaults)
  if (!themeKey || themeKey === 'light') {
    return
  }

  const cls = THEME_CLASS_MAP[themeKey]
  if (cls) body.classList.add(cls)
}

export function loadThemeFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.theme)
    return stored && THEME_CLASS_MAP[stored] ? stored : 'light'
  } catch {
    return 'light'
  }
}

export function persistThemeToStorage(themeKey) {
  try {
    localStorage.setItem(STORAGE_KEYS.theme, themeKey || 'light')
  } catch {
    // ignore
  }
}
