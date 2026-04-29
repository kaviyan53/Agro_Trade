export const THEME_STORAGE_KEY = 'agri-theme'

export function getSystemTheme() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function getStoredTheme() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(THEME_STORAGE_KEY)
}

export function getInitialTheme() {
  return getStoredTheme() || getSystemTheme()
}

export function applyTheme(theme) {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', theme)
}

export function persistTheme(theme) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(THEME_STORAGE_KEY, theme)
}
