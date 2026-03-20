// composables/useDark.ts
// Toggles Tailwind's dark class on <html> so dark: variants work globally.
// Call once anywhere — the state is module-level so it's shared.

import { ref, watch, onMounted } from 'vue'

const isDark = ref(false)

watch(isDark, (dark) => {
  document.documentElement.classList.toggle('dark', dark)
}, { immediate: true })

export function useDark() {
  function initDark() {
    // Respect OS preference on first load
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  function toggleDark() {
    isDark.value = !isDark.value
  }

  return { isDark, toggleDark, initDark }
}