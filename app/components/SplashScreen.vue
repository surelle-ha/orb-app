<template>
  <Transition name="splash-out">
    <div v-if="visible"
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-zinc-950 overflow-hidden">

      <!-- Ambient background glow -->
      <div class="absolute inset-0">
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full glow-blob"
             :class="glowActive ? 'opacity-30' : 'opacity-0'"></div>
      </div>

      <!-- Blackhole wrapper — transition targets this element via ref -->
      <div ref="logoRef" class="relative flex items-center justify-center logo-wrap" :class="logoScale">

        <!-- Accretion disc rings -->
        <div
          v-for="ring in rings"
          :key="ring.id"
          class="absolute rounded-full ring-el"
          :style="{
            width:        ring.size + 'px',
            height:       ring.size + 'px',
            opacity:      ring.opacity,
            borderWidth:  ring.thick + 'px',
            borderStyle:  'solid',
            borderColor:  `rgba(139,92,246,${ring.alpha})`,
            animationName:     ring.dir === 'reverse' ? 'orb-spin-r' : 'orb-spin',
            animationDuration: ring.dur + 's',
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            animationDelay: ring.delay + 's',
          }"
        ></div>

        <!-- Lensing glow -->
        <div class="absolute rounded-full lens-glow" style="width:88px;height:88px"></div>

        <!-- Event horizon -->
        <div class="relative w-20 h-20 rounded-full flex items-center justify-center horizon">
          <div class="absolute inset-0 rounded-full shimmer"></div>
          <span class="relative z-10 orb-wordmark">ORB</span>
        </div>

        <!-- Orbiting particles -->
        <div
          v-for="p in particles"
          :key="'p' + p.id"
          class="absolute rounded-full bg-violet-400 particle"
          :style="{
            width:   p.size + 'px',
            height:  p.size + 'px',
            opacity: p.alpha,
            animationName:     'orb-orbit-' + p.id,
            animationDuration: p.dur + 's',
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
          }"
        ></div>

      </div>

      <!-- Tagline -->
      <div
        class="absolute bottom-20 flex flex-col items-center gap-1 tagline-wrap"
        :class="textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'"
      >
        <p class="text-[11px] font-bold text-zinc-600 tracking-[0.3em] uppercase">Your Financial Universe</p>
      </div>

    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['done'])

const visible     = ref(true)
const glowActive  = ref(false)
const textVisible = ref(false)
const logoScale   = ref('scale-75 opacity-0')

const rings = [
  { id:1, size:130, thick:1,   alpha:0.6,  opacity:0.8,  dur:8,  dir:'normal',  delay:0    },
  { id:2, size:160, thick:0.5, alpha:0.35, opacity:0.6,  dur:12, dir:'reverse', delay:-3   },
  { id:3, size:195, thick:1,   alpha:0.2,  opacity:0.5,  dur:18, dir:'normal',  delay:-6   },
  { id:4, size:230, thick:0.5, alpha:0.12, opacity:0.35, dur:25, dir:'reverse', delay:-10  },
  { id:5, size:270, thick:0.5, alpha:0.07, opacity:0.25, dur:35, dir:'normal',  delay:-15  },
]

const particles = [
  { id:1, size:2.5, alpha:0.9, dur:4  },
  { id:2, size:1.5, alpha:0.7, dur:6  },
  { id:3, size:2,   alpha:0.5, dur:9  },
  { id:4, size:1,   alpha:0.6, dur:13 },
  { id:5, size:1.5, alpha:0.4, dur:7  },
]

onMounted(async () => {
  await delay(120)
  glowActive.value = true
  logoScale.value  = 'scale-100 opacity-100'
  await delay(600)
  textVisible.value = true
  await delay(1800)
  visible.value = false
  await delay(650)
  emit('done')
})

function delay(ms) {
  return new Promise(r => setTimeout(r, ms))
}
</script>

<style scoped>
/* ── Font ─────────────────────────────────── */
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@900&display=swap');

/* ── Keyframes ────────────────────────────── */
@keyframes orb-spin {
  from { transform: rotate(0deg);   }
  to   { transform: rotate(360deg); }
}
@keyframes orb-spin-r {
  from { transform: rotate(360deg); }
  to   { transform: rotate(0deg);   }
}

/* Particle orbits — each on its own radius/phase */
@keyframes orb-orbit-1 {
  0%   { transform: rotate(0deg)   translateX(54px)  rotate(0deg);    }
  100% { transform: rotate(360deg) translateX(54px)  rotate(-360deg); }
}
@keyframes orb-orbit-2 {
  0%   { transform: rotate(120deg) translateX(70px)  rotate(-120deg); }
  100% { transform: rotate(480deg) translateX(70px)  rotate(-480deg); }
}
@keyframes orb-orbit-3 {
  0%   { transform: rotate(240deg) translateX(90px)  rotate(-240deg); }
  100% { transform: rotate(600deg) translateX(90px)  rotate(-600deg); }
}
@keyframes orb-orbit-4 {
  0%   { transform: rotate(60deg)  translateX(110px) rotate(-60deg);  }
  100% { transform: rotate(420deg) translateX(110px) rotate(-420deg); }
}
@keyframes orb-orbit-5 {
  0%   { transform: rotate(180deg) translateX(130px) rotate(-180deg); }
  100% { transform: rotate(540deg) translateX(130px) rotate(-540deg); }
}

/* ── Elements ─────────────────────────────── */
.glow-blob {
  background: radial-gradient(circle, #7c3aed 0%, #4c1d95 40%, transparent 70%);
  transition: opacity 1.2s ease;
}

.logo-wrap {
  transition: transform 1.2s cubic-bezier(0.34, 1.1, 0.64, 1),
              opacity   1.2s ease;
}

.lens-glow {
  box-shadow:
    0 0 40px 12px rgba(139, 92, 246, 0.5),
    0 0 80px 24px rgba(109, 40, 217, 0.25);
}

.horizon {
  background: radial-gradient(circle at 40% 35%, #18181b 0%, #09090b 60%, #000 100%);
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.9);
}

.shimmer {
  background: radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 60%);
}

.orb-wordmark {
  font-family: 'Nunito', sans-serif;
  font-weight: 900;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 0.25em;
}

.tagline-wrap {
  transition: opacity 0.8s cubic-bezier(0.34, 1.1, 0.64, 1),
              transform 0.8s cubic-bezier(0.34, 1.1, 0.64, 1);
}

/* ── Splash exit transition ───────────────── */
.splash-out-leave-active {
  transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.splash-out-leave-to {
  opacity: 0;
  transform: scale(1.06);
}
</style>