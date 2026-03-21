<template>
  <div>
    <SplashScreen      v-if="phase === 'splash'"         @done="onSplashDone" />
    <OnboardingScreen  v-else-if="phase === 'onboarding'" @done="onOnboardingDone" />
    <template v-else>
      <Transition name="app-fade">
        <div v-if="appVisible" class="contents">
          <NuxtLayout><NuxtPage /></NuxtLayout>
        </div>
      </Transition>
      <IdleLockScreen />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import SplashScreen     from '~/components/SplashScreen.vue'
import OnboardingScreen from '~/components/OnboardingScreen.vue'
import IdleLockScreen   from '~/components/IdleLockScreen.vue'
import { initDatabase } from '~/composables/useDatabase'
import { useDark }      from '~/composables/useDark'
import { initIdleLock } from '~/composables/useIdleLock'
import { settings }     from '~/composables/useStore'

type Phase = 'splash' | 'onboarding' | 'app'
const phase      = ref<Phase>('splash')
const appVisible = ref(false)
const ONBOARDING_KEY = 'orb_onboarding_done'

const { initDark } = useDark()
initDark()

// ── Accent color → inject/update a single <style> tag ─────
// This is the ONLY reliable way to make Tailwind's compiled
// static classes (bg-violet-500 etc.) respond to a dynamic color.
// We override every violet utility with the chosen hex at the
// :root level so every page gets it automatically.
let accentStyleEl: HTMLStyleElement | null = null

function buildAccentCSS(hex: string): string {
  const r = parseInt(hex.slice(1,3),16)
  const g = parseInt(hex.slice(3,5),16)
  const b = parseInt(hex.slice(5,7),16)
  // Derived shades: we approximate Tailwind's 50/100/.../950 scale
  // using the base hex with different opacities via rgba.
  // The key classes used across the app are listed explicitly.
  return `
:root {
  --accent:   ${hex};
  --accent-r: ${r};
  --accent-g: ${g};
  --accent-b: ${b};
}
/* ── Override all violet Tailwind utilities with --accent ── */

/* backgrounds */
.bg-violet-50,  .dark\\:bg-violet-950\\/40 { background-color: rgba(${r},${g},${b},0.08) !important; }
.bg-violet-100 { background-color: rgba(${r},${g},${b},0.15) !important; }
.bg-violet-400 { background-color: rgba(${r},${g},${b},0.75) !important; }
.bg-violet-500 { background-color: rgba(${r},${g},${b},1)    !important; }
.bg-violet-600 { background-color: rgba(${r},${g},${b},0.88) !important; }

/* background with opacity modifiers */
.bg-violet-500\\/10 { background-color: rgba(${r},${g},${b},0.10) !important; }
.bg-violet-500\\/20 { background-color: rgba(${r},${g},${b},0.20) !important; }
.bg-violet-500\\/30 { background-color: rgba(${r},${g},${b},0.30) !important; }
.bg-violet-950\\/40 { background-color: rgba(${r},${g},${b},0.08) !important; }

/* text */
.text-violet-300 { color: rgba(${r},${g},${b},0.75) !important; }
.text-violet-400 { color: rgba(${r},${g},${b},0.85) !important; }
.text-violet-500 { color: rgba(${r},${g},${b},1)    !important; }
.text-violet-600 { color: rgba(${r},${g},${b},0.88) !important; }

/* borders */
.border-violet-500       { border-color: rgba(${r},${g},${b},1)    !important; }
.border-violet-500\\/20  { border-color: rgba(${r},${g},${b},0.20) !important; }
.border-violet-500\\/25  { border-color: rgba(${r},${g},${b},0.25) !important; }

/* ring */
.ring-violet-400  { --tw-ring-color: rgba(${r},${g},${b},0.8) !important; }
.ring-violet-500  { --tw-ring-color: rgba(${r},${g},${b},1)   !important; }

/* shadows */
.shadow-violet-500\\/25 { --tw-shadow-color: rgba(${r},${g},${b},0.25) !important; }
.shadow-violet-500\\/30 { --tw-shadow-color: rgba(${r},${g},${b},0.30) !important; }
.shadow-violet-500\\/40 { --tw-shadow-color: rgba(${r},${g},${b},0.40) !important; }

/* accent (range slider etc.) */
.accent-violet-500 { accent-color: rgba(${r},${g},${b},1) !important; }

/* gradients used on balance card */
.from-violet-500 { --tw-gradient-from: rgba(${r},${g},${b},1) !important; }
.to-violet-600   { --tw-gradient-to:   rgba(${r},${g},${b},0.85) !important; }
  `.trim()
}

function injectAccent(hex: string) {
  if (typeof document === 'undefined') return
  if (!accentStyleEl) {
    accentStyleEl = document.createElement('style')
    accentStyleEl.id = 'orb-accent'
    document.head.appendChild(accentStyleEl)
  }
  accentStyleEl.textContent = buildAccentCSS(hex)
}

// Apply immediately from persisted settings (before any mount)
injectAccent(settings.value.accentColor)

// Re-apply whenever accent changes (from Settings page)
watch(() => settings.value.accentColor, (hex) => {
  injectAccent(hex)
}, { immediate: false })

onMounted(async () => {
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen')
    await SplashScreen.hide()
  } catch {}
  initDatabase().catch(e => console.warn('[Orb] DB init:', e))
})

async function onSplashDone() {
  let done = false
  try { done = localStorage.getItem(ONBOARDING_KEY) === 'true' } catch {}
  phase.value = done ? 'app' : 'onboarding'
  if (done) {
    initIdleLock()
    await nextTick()
    setTimeout(() => { appVisible.value = true }, 40)
  }
}

async function onOnboardingDone() {
  try { localStorage.setItem(ONBOARDING_KEY, 'true') } catch {}
  phase.value = 'app'
  initIdleLock()
  await nextTick()
  setTimeout(() => { appVisible.value = true }, 40)
}
</script>

<style>
.app-fade-enter-active {
  transition: opacity 0.55s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);
}
.app-fade-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.995);
}
.app-fade-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style>