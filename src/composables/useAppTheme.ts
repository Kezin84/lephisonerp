import { ref, computed } from 'vue'

export type AppThemeMode = 'dark' | 'light' | 'custom'
export type BinaryThemeMode = 'dark' | 'light'

const CANONICAL_THEME_KEY = 'nts_app_global_theme_v1'
const LEGACY_KEYS = [
  'nts_quote_theme_mode_v1',
  'baogia_theme_pref',
  'sonai_report_fb_theme_v2'
] as const

function normalizeFullTheme(raw: unknown): AppThemeMode | null {
  if (raw === 'dark' || raw === 'light' || raw === 'custom') return raw
  return null
}

function readInitialGlobalTheme(): AppThemeMode {
  if (typeof window === 'undefined') return 'dark'
  try {
    const canonical = normalizeFullTheme(localStorage.getItem(CANONICAL_THEME_KEY))
    if (canonical) return canonical

    for (const k of LEGACY_KEYS) {
      const val = normalizeFullTheme(localStorage.getItem(k))
      if (val) return val
    }
  } catch {}
  return 'dark'
}

// Module-level singleton reactive state shared across ALL pages (including <keep-alive> views)
const globalThemeState = ref<AppThemeMode>(readInitialGlobalTheme())

function syncDomAndStorage(mode: AppThemeMode): void {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.appTheme = mode
  }
  if (typeof window === 'undefined') return
  const binary: BinaryThemeMode = mode === 'light' ? 'light' : 'dark'
  try {
    localStorage.setItem(CANONICAL_THEME_KEY, mode)
    localStorage.setItem('sonai_report_fb_theme_v2', mode)
    localStorage.setItem('nts_quote_theme_mode_v1', binary)
    localStorage.setItem('baogia_theme_pref', binary)
  } catch {}
}

// Initialize DOM attribute & keep legacy keys aligned on boot
syncDomAndStorage(globalThemeState.value)

// Cross-tab synchronization
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (ev) => {
    if (!ev.key) return
    if (ev.key === CANONICAL_THEME_KEY || (LEGACY_KEYS as readonly string[]).includes(ev.key)) {
      const next = normalizeFullTheme(ev.newValue)
      if (next && next !== globalThemeState.value) {
        globalThemeState.value = next
        if (typeof document !== 'undefined') {
          document.documentElement.dataset.appTheme = next
        }
      }
    }
  })
}

export function setGlobalAppTheme(mode: AppThemeMode): void {
  const normalized = normalizeFullTheme(mode) || 'dark'
  if (globalThemeState.value !== normalized) {
    globalThemeState.value = normalized
  }
  syncDomAndStorage(normalized)
}

export function toggleGlobalBinaryTheme(): BinaryThemeMode {
  const next: BinaryThemeMode = globalThemeState.value === 'light' ? 'dark' : 'light'
  setGlobalAppTheme(next)
  return next
}

/**
 * Composable for 2-mode pages (Dark Navy <-> Enterprise Light Blue).
 * Returns a writable computed ref so existing `uiTheme.value = ...` and template reads work seamlessly
 * across all pages, including <keep-alive> cached views.
 */
export function useBinaryAppTheme() {
  const uiTheme = computed<BinaryThemeMode>({
    get: () => (globalThemeState.value === 'light' ? 'light' : 'dark'),
    set: (val: BinaryThemeMode) => {
      setGlobalAppTheme(val === 'light' ? 'light' : 'dark')
    }
  })

  const setUiTheme = (mode: BinaryThemeMode) => {
    setGlobalAppTheme(mode === 'light' ? 'light' : 'dark')
  }

  const toggleUiTheme = () => {
    toggleGlobalBinaryTheme()
  }

  return { uiTheme, setUiTheme, toggleUiTheme }
}

/**
 * Composable for 3-mode pages (Dark Navy <-> Enterprise Light Blue <-> Custom Glassify).
 * Choosing Light or Dark syncs instantly with every 2-mode and 3-mode page in the app.
 */
export function useFullAppTheme() {
  const uiTheme = computed<AppThemeMode>({
    get: () => globalThemeState.value,
    set: (val: AppThemeMode) => {
      setGlobalAppTheme(val)
    }
  })

  const setUiTheme = (mode: AppThemeMode) => {
    setGlobalAppTheme(mode)
  }

  return { uiTheme, setUiTheme }
}

export { globalThemeState }
