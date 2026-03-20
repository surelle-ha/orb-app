<template>
  <div class="bg-slate-100 dark:bg-zinc-950">

    <!-- Header -->
    <div class="flex items-center justify-between px-5 pt-6 pb-4">
      <h2 class="text-2xl font-black text-slate-900 dark:text-zinc-50 tracking-tight">My Cards</h2>
      <button class="flex items-center gap-1.5 bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[13px] font-bold px-4 py-2.5 rounded-full active:scale-95 transition-transform shadow-sm">
        <Plus :size="14" :stroke-width="2.5" /> Add
      </button>
    </div>

    <!-- Card stack -->
    <div class="relative mx-5" style="height:190px; perspective:1200px">
      <div
        v-for="(cc, i) in creditCards" :key="cc.id"
        class="absolute inset-0 rounded-3xl p-5 cursor-pointer"
        :style="{
          background: cc.gradient,
          transform:  activeCard === i
            ? 'translateY(0) scale(1)'
            : `translateY(${(i - activeCard) * -16}px) scale(${0.92 - Math.abs(activeCard - i) * 0.03})`,
          zIndex:     creditCards.length - Math.abs(activeCard - i),
          opacity:    Math.abs(activeCard - i) > 1 ? 0.35 : 1,
          boxShadow:  '0 16px 40px rgba(0,0,0,0.25)',
          transition: 'all 380ms cubic-bezier(0.34,1.1,0.64,1)',
        }"
        @click="activeCard = i"
      >
        <div class="flex justify-between items-center">
          <span class="text-base font-black text-white/90">{{ cc.bank }}</span>
          <Cpu :size="20" color="rgba(255,255,255,0.4)" :stroke-width="1.5" />
        </div>
        <div class="my-4 text-[15px] font-mono tracking-[0.18em] text-white/70">{{ cc.number }}</div>
        <div class="flex items-end gap-5">
          <div>
            <div class="text-[9px] text-white/30 uppercase tracking-widest">Card Holder</div>
            <div class="text-[12px] font-bold text-white/80 mt-0.5">{{ cc.holder }}</div>
          </div>
          <div>
            <div class="text-[9px] text-white/30 uppercase tracking-widest">Expires</div>
            <div class="text-[12px] font-bold text-white/80 mt-0.5">{{ cc.expiry }}</div>
          </div>
          <div class="ml-auto text-[12px] font-black text-white/40 tracking-wide">{{ cc.network }}</div>
        </div>
      </div>
    </div>

    <!-- Pip indicators -->
    <div class="flex justify-center gap-1.5 mt-4 mb-2">
      <button
        v-for="(_, i) in creditCards" :key="i"
        @click="activeCard = i"
        :class="['h-1.5 rounded-full transition-all duration-300',
          activeCard === i ? 'w-5 bg-violet-500' : 'w-1.5 bg-slate-300 dark:bg-zinc-700']"
      />
    </div>

    <!-- Card stats (glass) -->
    <div v-if="selectedCard" class="grid grid-cols-2 gap-2.5 mx-4 mt-2">
      <div class="rounded-2xl bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-slate-200/60 dark:border-zinc-800/60 shadow-sm p-4">
        <p class="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 mb-1.5">Credit Limit</p>
        <p class="text-[19px] font-black text-slate-800 dark:text-zinc-100 tracking-tight">₱{{ selectedCard.limit.toLocaleString() }}</p>
      </div>
      <div class="rounded-2xl bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-slate-200/60 dark:border-zinc-800/60 shadow-sm p-4">
        <p class="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 mb-1.5">Outstanding</p>
        <p class="text-[19px] font-black text-rose-500 tracking-tight">₱{{ selectedCard.outstanding.toLocaleString() }}</p>
      </div>
      <div class="col-span-2 rounded-2xl bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-slate-200/60 dark:border-zinc-800/60 shadow-sm p-4">
        <div class="flex justify-between items-center mb-3">
          <p class="text-[11px] font-semibold text-slate-400 dark:text-zinc-500">Utilization</p>
          <p class="text-[15px] font-black text-slate-800 dark:text-zinc-100">
            {{ Math.round(selectedCard.outstanding / selectedCard.limit * 100) }}%
          </p>
        </div>
        <div class="h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-2.5">
          <div
            class="h-full rounded-full bg-violet-500 transition-all duration-700"
            :style="{ width: (selectedCard.outstanding / selectedCard.limit * 100) + '%' }"
          ></div>
        </div>
        <div class="flex justify-between text-[11px] font-semibold text-slate-400 dark:text-zinc-500">
          <span>Due {{ selectedCard.due }}</span>
          <span class="text-emerald-500">₱{{ (selectedCard.limit - selectedCard.outstanding).toLocaleString() }} available</span>
        </div>
      </div>
    </div>

    <!-- Recent charges -->
    <div class="flex items-center justify-between px-5 pt-5 pb-3">
      <h3 class="text-[15px] font-bold text-slate-800 dark:text-zinc-200">Recent Charges</h3>
    </div>
    <div class="mx-4 rounded-2xl overflow-hidden bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-slate-200/60 dark:border-zinc-800/60 shadow-sm">
      <div
        v-for="(tx, i) in expenses.slice(0, 4)" :key="tx.id"
        :class="['flex items-center gap-3 px-4 py-3.5 transition-colors active:bg-slate-50 dark:active:bg-zinc-800',
          i < 3 ? 'border-b border-slate-100 dark:border-zinc-800/60' : '']"
      >
        <div class="w-11 h-11 rounded-2xl bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center flex-shrink-0">
          <component :is="tx.icon" :size="19" class="text-violet-500" :stroke-width="1.8" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[14px] font-bold text-slate-800 dark:text-zinc-100 truncate">{{ tx.name }}</p>
          <p class="text-[11px] text-slate-400 dark:text-zinc-500 font-medium mt-0.5">{{ tx.date }}</p>
        </div>
        <span class="text-[14px] font-bold text-slate-700 dark:text-zinc-300 flex-shrink-0">
          −₱{{ Math.abs(tx.amount).toLocaleString() }}
        </span>
      </div>
    </div>

    <div class="h-6"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Plus, Cpu } from 'lucide-vue-next'
import { activeCard, creditCards, selectedCard, recentTx } from '../composables/useStore'

const expenses = computed(() => recentTx.value.filter(t => t.amount < 0))
</script>