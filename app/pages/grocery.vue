<template>
  <div class="bg-slate-100 dark:bg-zinc-950">

    <!-- Header -->
    <div class="flex items-center justify-between px-5 pt-6 pb-4">
      <h2 class="text-2xl font-black text-slate-900 dark:text-zinc-50 tracking-tight">Grocery</h2>
      <button class="flex items-center gap-1.5 bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[13px] font-bold px-4 py-2.5 rounded-full active:scale-95 transition-transform shadow-sm">
        <Plus :size="14" :stroke-width="2.5" /> List
      </button>
    </div>

    <!-- Budget card (glass) -->
    <div class="mx-4 rounded-2xl bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-slate-200/60 dark:border-zinc-800/60 shadow-sm p-5 flex justify-between items-center mb-4">
      <div>
        <p class="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 mb-1">Monthly Budget</p>
        <p class="text-[26px] font-black text-slate-900 dark:text-zinc-50 tracking-tight mb-3">₱5,000</p>
        <div class="w-40 h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-2">
          <div class="h-full w-[62%] bg-violet-500 rounded-full"></div>
        </div>
        <p class="text-[11px] font-semibold text-slate-400 dark:text-zinc-500">
          ₱3,100 spent · <span class="text-emerald-500">₱1,900 left</span>
        </p>
      </div>
      <!-- Ring -->
      <div class="relative w-[72px] h-[72px] flex-shrink-0">
        <svg viewBox="0 0 72 72" class="w-full h-full">
          <circle cx="36" cy="36" r="28" fill="none" class="stroke-slate-100 dark:stroke-zinc-800" stroke-width="6"/>
          <circle cx="36" cy="36" r="28" fill="none" stroke="#8b5cf6" stroke-width="6"
            stroke-linecap="round" stroke-dasharray="109.5 175.9" stroke-dashoffset="44"
            transform="rotate(-90 36 36)"/>
        </svg>
        <span class="absolute inset-0 flex items-center justify-center text-[14px] font-black text-violet-500">62%</span>
      </div>
    </div>

    <!-- List tabs -->
    <div class="flex gap-2 px-4 overflow-x-auto scrollbar-hide pb-3">
      <button
        v-for="list in groceryLists" :key="list.name"
        @click="activeList = list.name"
        :class="['flex items-center gap-2 flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-bold border transition-all',
          activeList === list.name
            ? 'bg-violet-500 border-violet-500 text-white shadow-lg shadow-violet-500/25'
            : 'bg-white/70 dark:bg-zinc-900/60 backdrop-blur border-slate-200/60 dark:border-zinc-800/60 text-slate-500 dark:text-zinc-400']"
      >
        {{ list.name }}
        <span :class="['text-[10px] font-bold px-1.5 py-0.5 rounded-full',
          activeList === list.name ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500']">
          {{ list.items.length }}
        </span>
      </button>
    </div>

    <!-- Items list (glass card) -->
    <div class="mx-4 rounded-2xl overflow-hidden bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-slate-200/60 dark:border-zinc-800/60 shadow-sm">
      <div
        v-for="(item, i) in currentGroceryItems" :key="item.name"
        @click="item.checked = !item.checked"
        :class="['flex items-center gap-3.5 px-4 py-3.5 cursor-pointer transition-all active:bg-slate-50 dark:active:bg-zinc-800/80',
          item.checked ? 'opacity-40' : '',
          i < currentGroceryItems.length - 1 ? 'border-b border-slate-100 dark:border-zinc-800/60' : '']"
      >
        <!-- Checkbox -->
        <div :class="['w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all',
          item.checked ? 'bg-violet-500 border-violet-500' : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800']">
          <Check v-if="item.checked" :size="13" color="white" :stroke-width="3" />
        </div>
        <div class="flex-1 min-w-0">
          <p :class="['text-[14px] font-bold text-slate-800 dark:text-zinc-100', item.checked ? 'line-through' : '']">
            {{ item.name }}
          </p>
          <p class="text-[11px] text-slate-400 dark:text-zinc-500 font-medium mt-0.5">{{ item.qty }}</p>
        </div>
        <span class="text-[14px] font-bold text-violet-500 flex-shrink-0">₱{{ item.price }}</span>
      </div>
    </div>

    <!-- Total footer (dark glass) -->
    <div
      class="mx-4 mt-3 rounded-2xl overflow-hidden relative"
      style="background:linear-gradient(135deg,#4c1d95,#5b21b6);box-shadow:0 8px 24px rgba(109,40,217,0.3)"
    >
      <div class="absolute inset-0 opacity-[0.06]"
           style="background-image:url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22/></filter><rect width=%22200%22 height=%22200%22 filter=%22url(%23n)%22 opacity=%221%22/></svg>')"></div>
      <div class="relative flex justify-between items-center px-5 py-4">
        <span class="text-[13px] font-semibold text-white/50">Estimated Total</span>
        <span class="text-[22px] font-black text-violet-200 tracking-tight">₱{{ groceryTotal.toLocaleString() }}</span>
      </div>
    </div>

    <div class="h-6"></div>
  </div>
</template>

<script setup lang="ts">
import { Plus, Check } from 'lucide-vue-next'
import { activeList, groceryLists, currentGroceryItems, groceryTotal } from '../composables/useStore'
</script>