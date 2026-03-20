<template>
  <div>
    <!-- 1. Splash (always shown first) -->
    <SplashScreen v-if="phase === 'splash'" @done="onSplashDone" />

    <!-- 2. Onboarding (only on first run) -->
    <OnboardingScreen v-else-if="phase === 'onboarding'" @done="onOnboardingDone" />

    <!-- 3. Main app -->
    <template v-else>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SplashScreen     from '~/components/SplashScreen.vue'
import OnboardingScreen from '~/components/OnboardingScreen.vue'
import { initDatabase, isOnboardingDone } from '~/composables/useDatabase'
import { useDark } from '~/composables/useDark'

type Phase = 'splash' | 'onboarding' | 'app'
const phase = ref<Phase>('splash')

// Init dark-mode from OS preference immediately
const { initDark } = useDark()
initDark()

onMounted(async () => {
  // Hide the Capacitor native splash immediately so our Vue
  // SplashScreen takes over. Must be called even when
  // launchShowDuration is 0 in capacitor.config.ts.
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen')
    await SplashScreen.hide()
  } catch {
    // Not in Capacitor (web/dev) — safe to ignore
  }

  // DB init runs in background while Vue splash is animating
  try {
    await initDatabase()
  } catch (e) {
    console.warn('[Orb] DB init failed (probably web/dev):', e)
  }
})

async function onSplashDone() {
  // Splash finished — decide what comes next
  let done = false
  try {
    done = await isOnboardingDone()
  } catch {
    // On web/dev without SQLite, skip onboarding
    done = !!localStorage.getItem('orb_onboarding_done')
  }
  phase.value = done ? 'app' : 'onboarding'
}

function onOnboardingDone() {
  // Fallback for web/dev
  try { localStorage.setItem('orb_onboarding_done', 'true') } catch {}
  phase.value = 'app'
}
</script>