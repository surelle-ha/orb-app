<template>
  <Transition name="lock-fade">
    <div v-if="isLocked"
      class="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style="backdrop-filter:blur(28px) brightness(0.35);background:rgba(0,0,0,0.55);">

      <!-- Orb -->
      <div class="relative mb-8" style="width:72px;height:72px;">
        <div class="absolute inset-0 rounded-full" style="border:1px solid rgba(139,92,246,0.5);animation:lock-spin 8s linear infinite;"></div>
        <div class="absolute rounded-full" style="inset:4px;border:0.5px solid rgba(139,92,246,0.3);animation:lock-spin 12s linear infinite reverse;"></div>
        <div class="absolute rounded-full" style="inset:10px;box-shadow:0 0 20px 6px rgba(139,92,246,0.5),0 0 40px 10px rgba(109,40,217,0.25);"></div>
        <div class="absolute rounded-full" style="inset:10px;background:radial-gradient(circle at 38% 32%,#1a1a2e 0%,#09090b 55%,#000 100%);box-shadow:inset 0 0 16px rgba(0,0,0,1);"></div>
      </div>

      <div class="flex flex-col items-center gap-3 px-8 text-center mb-10">
        <div class="flex items-center gap-2 mb-1">
          <Lock :size="16" class="text-violet-400" :stroke-width="2" />
          <span class="text-[12px] font-bold text-violet-400 uppercase tracking-widest">Orb is locked</span>
        </div>
        <p class="text-[22px] font-black text-white leading-tight">Session paused</p>
        <p class="text-[13px] text-zinc-400 font-medium leading-relaxed">
          You were away for a while. Tap anywhere to continue.
        </p>
      </div>

      <button @click="unlock"
        class="flex items-center gap-2 px-7 py-4 rounded-2xl bg-violet-500 text-white text-[15px] font-black shadow-xl shadow-violet-500/40 active:scale-95 transition-all">
        <Unlock :size="17" :stroke-width="2.5" />
        Resume Session
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { Lock, Unlock } from 'lucide-vue-next'
import { isLocked, unlock } from '../composables/useIdleLock'
</script>

<style scoped>
.lock-fade-enter-active { transition:opacity 0.5s ease, backdrop-filter 0.5s ease; }
.lock-fade-leave-active { transition:opacity 0.4s ease; }
.lock-fade-enter-from, .lock-fade-leave-to { opacity:0; }

@keyframes lock-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
</style>