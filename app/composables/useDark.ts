// composables/useDark.ts
// Persists dark mode preference to localStorage so it survives app restarts.
// Falls back to OS preference on very first launch.

import { ref, watch } from 'vue'

const STORAGE_KEY = 'orb_dark_mode'

// Read persisted value immediately (before any reactivity)
function readPersistedDark(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) return stored === 'true'
  } catch {}
  // First launch — respect OS preference
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {}
  return false
}

// Module-level singleton so state is shared across all callers
const isDark = ref(false) // initialised properly in initDark()

function applyDark(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark)
}

watch(isDark, (dark) => {
  applyDark(dark)
  try { localStorage.setItem(STORAGE_KEY, String(dark)) } catch {}
})

export function useDark() {
  function initDark() {
    const dark = readPersistedDark()
    isDark.value = dark
    // Apply immediately (before Vue's watch fires) to avoid flash
    applyDark(dark)
  }

  function toggleDark() {
    isDark.value = !isDark.value
  }

  return { isDark, toggleDark, initDark }
}