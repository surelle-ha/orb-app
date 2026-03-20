<template>
  <div class="bg-slate-100 dark:bg-zinc-950">

    <!-- Header -->
    <div class="px-5 pt-6 pb-4">
      <h2 class="text-2xl font-black text-slate-900 dark:text-zinc-50 tracking-tight">More</h2>
    </div>

    <!-- Bills & Dues -->
    <div class="flex items-center justify-between px-5 pb-3">
      <h3 class="text-[15px] font-bold text-slate-800 dark:text-zinc-200">Bills & Dues</h3>
      <button class="flex items-center gap-0.5 text-[13px] font-bold text-violet-500 active:opacity-60">
        Manage <ChevronRight :size="14" :stroke-width="2.5" />
      </button>
    </div>
    <div class="mx-4 rounded-2xl overflow-hidden bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-slate-200/60 dark:border-zinc-800/60 shadow-sm">
      <div
        v-for="(bill, i) in bills" :key="bill.name"
        :class="['flex items-center gap-3 px-4 py-3.5',
          i < bills.length - 1 ? 'border-b border-slate-100 dark:border-zinc-800/60' : '']"
      >
        <div class="w-11 h-11 rounded-2xl bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center flex-shrink-0">
          <component :is="bill.icon" :size="19" class="text-violet-500" :stroke-width="1.8" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[14px] font-bold text-slate-800 dark:text-zinc-100">{{ bill.name }}</p>
          <p class="text-[11px] text-slate-400 dark:text-zinc-500 font-medium mt-0.5">Due {{ bill.due }}</p>
        </div>
        <div class="flex flex-col items-end gap-1 flex-shrink-0">
          <p class="text-[14px] font-bold text-slate-800 dark:text-zinc-100">₱{{ bill.amount.toLocaleString() }}</p>
          <span :class="['text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full',
            bill.status === 'paid'    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500' :
            bill.status === 'overdue' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-500' :
                                        'bg-amber-50 dark:bg-amber-950/40 text-amber-500']">
            {{ bill.status }}
          </span>
        </div>
      </div>
    </div>

    <!-- Savings Goals -->
    <div class="flex items-center justify-between px-5 pt-6 pb-3">
      <h3 class="text-[15px] font-bold text-slate-800 dark:text-zinc-200">Savings Goals</h3>
      <button class="flex items-center gap-0.5 text-[13px] font-bold text-violet-500 active:opacity-60">
        <Plus :size="14" :stroke-width="2.5" /> Add
      </button>
    </div>
    <div class="flex gap-2.5 px-4 overflow-x-auto scrollbar-hide">
      <div
        v-for="g in goals" :key="g.label"
        class="flex flex-col items-center gap-2 flex-shrink-0 min-w-[88px] bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-slate-200/60 dark:border-zinc-800/60 rounded-2xl p-4 shadow-sm"
      >
        <div class="relative">
          <svg viewBox="0 0 52 52" class="w-[52px] h-[52px]">
            <circle cx="26" cy="26" r="20" fill="none" class="stroke-slate-100 dark:stroke-zinc-800" stroke-width="4"/>
            <circle cx="26" cy="26" r="20" fill="none" stroke="#8b5cf6" stroke-width="4"
              stroke-linecap="round"
              :stroke-dasharray="`${(g.pct / 100) * 125.7} 125.7`"
              stroke-dashoffset="31.4"
              transform="rotate(-90 26 26)"/>
          </svg>
          <span class="absolute inset-0 flex items-center justify-center text-[11px] font-black text-slate-800 dark:text-zinc-100">
            {{ g.pct }}%
          </span>
          <!-- Icon pin -->
          <div class="absolute -top-1.5 -right-2 w-5 h-5 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-zinc-800">
            <component :is="g.icon" :size="11" class="text-violet-500" :stroke-width="2.5" />
          </div>
        </div>
        <p class="text-[12px] font-bold text-slate-800 dark:text-zinc-100 text-center">{{ g.label }}</p>
        <p class="text-[10px] font-semibold text-slate-400 dark:text-zinc-600">₱{{ (g.saved / 1000).toFixed(0) }}k</p>
      </div>
    </div>

    <!-- Tools -->
    <div class="px-5 pt-6 pb-3">
      <h3 class="text-[15px] font-bold text-slate-800 dark:text-zinc-200">Tools</h3>
    </div>
    <div class="mx-4 rounded-2xl overflow-hidden bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-slate-200/60 dark:border-zinc-800/60 shadow-sm">
      <button
        v-for="(tool, i) in tools" :key="tool.label"
        :class="['w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-slate-50 dark:active:bg-zinc-800 transition-colors',
          i < tools.length - 1 ? 'border-b border-slate-100 dark:border-zinc-800/60' : '']"
      >
        <div class="w-11 h-11 rounded-2xl bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center flex-shrink-0">
          <component :is="tool.icon" :size="19" class="text-violet-500" :stroke-width="1.8" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[14px] font-bold text-slate-800 dark:text-zinc-100">{{ tool.label }}</p>
          <p class="text-[11px] text-slate-400 dark:text-zinc-500 font-medium mt-0.5">{{ tool.sub }}</p>
        </div>
        <ChevronRight :size="17" class="text-slate-300 dark:text-zinc-700 flex-shrink-0" :stroke-width="2" />
      </button>
    </div>

    <div class="h-6"></div>
  </div>
</template>

<script setup lang="ts">
import { Plus, ChevronRight, Sliders, BarChart2, PieChart, Settings } from 'lucide-vue-next'
import { bills, goals } from '../composables/useStore'

const tools = [
  { icon: Sliders,   label: 'Budget Limits', sub: 'Set monthly spending caps' },
  { icon: BarChart2, label: 'Reports',       sub: 'Analytics & insights'      },
  { icon: PieChart,  label: 'Net Worth',     sub: 'Track your total assets'   },
  { icon: Settings,  label: 'Settings',      sub: 'Preferences & account'     },
]
</script>