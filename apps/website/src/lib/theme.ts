export const THEME_KEY = 'theme';

export type ThemePreference = 'light' | 'dark';

function defaultFromOs(): ThemePreference {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function getStoredTheme(): ThemePreference {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return defaultFromOs();
}

export function applyTheme(preference: ThemePreference): void {
  document.documentElement.classList.toggle('dark', preference === 'dark');
  document.documentElement.dataset.theme = preference;
}

export function initTheme(): void {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'system') {
    localStorage.setItem(THEME_KEY, defaultFromOs());
  }
  applyTheme(getStoredTheme());
}

export function setTheme(preference: ThemePreference): void {
  localStorage.setItem(THEME_KEY, preference);
  initTheme();
}

export function getNextThemePreference(
  preference: ThemePreference = getStoredTheme(),
): ThemePreference {
  return preference === 'dark' ? 'light' : 'dark';
}
