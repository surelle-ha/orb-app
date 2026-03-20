<template>
  <div class="bg-slate-100 dark:bg-zinc-950">

    <!-- Topbar -->
    <div class="flex items-center justify-between px-5 pt-6 pb-4">
      <div>
        <p class="text-xs font-semibold text-slate-400 dark:text-zinc-500 tracking-wide">Good {{ timeOfDay }}</p>
        <h1 class="text-2xl font-black text-slate-900 dark:text-zinc-50 tracking-tight mt-0.5">Harold</h1>
      </div>
      <div class="flex items-center gap-2.5">
        <button @click="toggleDark"
          class="w-9 h-9 rounded-full flex items-center justify-center bg-white/80 dark:bg-zinc-800/80 backdrop-blur border border-slate-200/60 dark:border-zinc-700/60 text-slate-500 dark:text-zinc-400 shadow-sm active:scale-90 transition-transform">
          <Sun v-if="isDark" :size="15" :stroke-width="2" />
          <Moon v-else :size="15" :stroke-width="2" />
        </button>
        <button
          class="w-10 h-10 rounded-full flex items-center justify-center bg-violet-500 text-white font-black text-sm shadow-lg shadow-violet-500/30 active:scale-90 transition-transform">
          H
        </button>
      </div>
    </div>

    <!-- Balance Card -->
    <div class="mx-4 rounded-3xl overflow-hidden relative"
      style="background:linear-gradient(135deg,#4c1d95 0%,#5b21b6 45%,#6d28d9 100%);box-shadow:0 20px 60px rgba(109,40,217,0.35)">
      <!-- Noise texture -->
      <div class="absolute inset-0 opacity-[0.06]"
        style="background-image:url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22/></filter><rect width=%22200%22 height=%22200%22 filter=%22url(%23n)%22 opacity=%221%22/></svg>')">
      </div>
      <!-- Glow blobs -->
      <div class="absolute w-48 h-48 rounded-full -top-16 -right-10 bg-violet-300/20 blur-3xl pointer-events-none">
      </div>
      <div class="absolute w-32 h-32 rounded-full -bottom-10 -left-8 bg-purple-400/20 blur-3xl pointer-events-none">
      </div>

      <div class="relative p-6">
        <div class="flex items-center justify-between mb-3">
          <span class="text-[11px] font-semibold text-white/40 uppercase tracking-widest">Total Balance</span>
          <button @click="showBalance = !showBalance"
            class="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white/60 active:scale-90 transition-transform backdrop-blur">
            <Eye v-if="showBalance" :size="15" :stroke-width="2" />
            <EyeOff v-else :size="15" :stroke-width="2" />
          </button>
        </div>
        <div class="flex items-end gap-1.5 mb-5">
          <span class="text-2xl font-bold text-violet-300 leading-none">₱</span>
          <span class="text-[42px] font-black text-white leading-none tracking-tight">
            {{ showBalance ? '248,500' : '•••,•••' }}
          </span>
        </div>
        <div class="h-px bg-white/10 mb-4"></div>
        <div class="flex items-center gap-4">
          <!-- Income -->
          <div class="flex items-center gap-3 flex-1">
            <div class="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <TrendingUp :size="14" color="white" :stroke-width="2.5" />
            </div>
            <div>
              <p class="text-[10px] text-white/40 font-semibold uppercase tracking-wide">Income</p>
              <p class="text-[15px] font-bold text-emerald-300 mt-0.5">₱45,000</p>
            </div>
          </div>
          <div class="w-px h-8 bg-white/10"></div>
          <!-- Expenses -->
          <div class="flex items-center gap-3 flex-1">
            <div class="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <TrendingDown :size="14" color="white" :stroke-width="2.5" />
            </div>
            <div>
              <p class="text-[10px] text-white/40 font-semibold uppercase tracking-wide">Expenses</p>
              <p class="text-[15px] font-bold text-rose-300 mt-0.5">₱28,340</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="flex items-center justify-between px-5 pt-5 pb-3">
      <h3 class="text-[15px] font-bold text-slate-800 dark:text-zinc-200">Actions</h3>
    </div>
    <div class="flex gap-3 px-4 overflow-x-auto scrollbar-hide pb-1">
      <button v-for="a in quickActions" :key="a.label"
        class="flex flex-col items-center gap-2 flex-shrink-0 active:scale-90 transition-transform duration-150"
        @click="a.fn()">
        <div
          class="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/80 dark:bg-zinc-800/80 backdrop-blur border border-slate-200/60 dark:border-zinc-700/50 shadow-sm">
          <component :is="a.icon" :size="21" class="text-violet-500" :stroke-width="2" />
        </div>
        <span class="text-[11px] font-semibold text-slate-500 dark:text-zinc-500">{{ a.label }}</span>
      </button>
    </div>

    <!-- Spending Overview -->
    <div class="flex items-center justify-between px-5 pt-5 pb-3">
      <h3 class="text-[15px] font-bold text-slate-800 dark:text-zinc-200">Spending</h3>
      <div class="flex bg-slate-200/70 dark:bg-zinc-800 rounded-xl p-0.5 gap-0.5">
        <button v-for="p in ['W', 'M', 'Y']" :key="p" @click="period = p"
          :class="['text-[11px] font-bold px-3 py-1.5 rounded-[9px] transition-all',
            period === p ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-zinc-100 shadow-sm' : 'text-slate-400 dark:text-zinc-600']">
          {{ p }}
        </button>
      </div>
    </div>
    <div
      class="mx-4 rounded-2xl bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-slate-200/60 dark:border-zinc-800/60 shadow-sm p-4">
      <div class="flex items-end gap-2 mb-4" style="height:80px">
        <div v-for="bar in spendBars" :key="bar.label"
          class="flex flex-col items-center gap-1.5 flex-1 h-full justify-end">
          <div class="w-full bg-slate-100 dark:bg-zinc-800 rounded-lg overflow-hidden flex items-end"
            style="height:64px">
            <div class="w-full rounded-lg bg-violet-500 transition-all duration-500"
              :style="{ height: bar.pct + '%', opacity: bar.opacity }"></div>
          </div>
          <span class="text-[9px] font-semibold text-slate-400 dark:text-zinc-600">{{ bar.label }}</span>
        </div>
      </div>
      <div class="space-y-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
        <div v-for="c in topCats" :key="c.name" class="flex items-center gap-2.5">
          <div class="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0" :style="{ opacity: c.opacity }"></div>
          <span class="flex-1 text-[13px] font-semibold text-slate-500 dark:text-zinc-400">{{ c.name }}</span>
          <span class="text-[13px] font-bold text-slate-800 dark:text-zinc-200">₱{{ c.amount.toLocaleString() }}</span>
        </div>
      </div>
    </div>

    <!-- Recent Transactions -->
    <div class="flex items-center justify-between px-5 pt-5 pb-3">
      <h3 class="text-[15px] font-bold text-slate-800 dark:text-zinc-200">Recent</h3>
      <button @click="navigate('transactions')"
        class="flex items-center gap-0.5 text-[13px] font-bold text-violet-500 active:opacity-60">
        See all
        <ChevronRight :size="14" :stroke-width="2.5" />
      </button>
    </div>
    <div
      class="mx-4 rounded-2xl overflow-hidden bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-slate-200/60 dark:border-zinc-800/60 shadow-sm">
      <div v-for="(tx, i) in recentTx.slice(0, 4)" :key="tx.id" :class="['flex items-center gap-3 px-4 py-3.5 active:bg-slate-50 dark:active:bg-zinc-800/80 transition-colors',
        i < 3 ? 'border-b border-slate-100 dark:border-zinc-800/60' : '']">
        <div
          class="w-11 h-11 rounded-2xl bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center flex-shrink-0">
          <component :is="tx.icon" :size="19" class="text-violet-500" :stroke-width="1.8" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[14px] font-bold text-slate-800 dark:text-zinc-100 truncate">{{ tx.name }}</p>
          <p class="text-[11px] text-slate-400 dark:text-zinc-500 font-medium mt-0.5">{{ tx.category }} · {{ tx.date }}
          </p>
        </div>
        <span
          :class="['text-[14px] font-bold flex-shrink-0', tx.amount > 0 ? 'text-emerald-500' : 'text-slate-700 dark:text-zinc-300']">
          {{ tx.amount > 0 ? '+' : '−' }}₱{{ Math.abs(tx.amount).toLocaleString() }}
        </span>
      </div>
    </div>

    <div class="h-6"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Sun, Moon, Eye, EyeOff, TrendingUp, TrendingDown,
  Plus, CreditCard, ShoppingCart, Zap, BarChart2, ChevronRight,
} from 'lucide-vue-next'
import { useDark } from '../composables/useDark'
import { useNav } from '../composables/useNav'
import { recentTx, quickAddOpen } from '../composables/useStore'

const { isDark, toggleDark } = useDark()
const { navigate } = useNav()

const now = new Date()
const hour = now.getHours()
const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'

const showBalance = ref(true)
const period = ref('M')

const quickActions = [
  { icon: Plus, label: 'Add', fn: () => { quickAddOpen.value = true } },
  { icon: CreditCard, label: 'Cards', fn: () => navigate('cards') },
  { icon: ShoppingCart, label: 'Grocery', fn: () => navigate('grocery') },
  { icon: Zap, label: 'Bills', fn: () => navigate('more') },
  { icon: BarChart2, label: 'Reports', fn: () => navigate('more') },
]

const spendBars = [
  { label: 'Food', pct: 80, opacity: '1' },
  { label: 'Trans', pct: 45, opacity: '0.65' },
  { label: 'Utils', pct: 60, opacity: '0.8' },
  { label: 'Shop', pct: 35, opacity: '0.5' },
  { label: 'Health', pct: 22, opacity: '0.35' },
  { label: 'Fun', pct: 55, opacity: '0.7' },
]

const topCats = [
  { name: 'Food & Dining', amount: 8200, opacity: '1' },
  { name: 'Utilities', amount: 5100, opacity: '0.7' },
  { name: 'Groceries', amount: 4300, opacity: '0.5' },
]
</script>