<template>
  <div class="bg-slate-100 dark:bg-zinc-950">

    <!-- Header -->
    <div class="flex items-center justify-between px-5 pt-6 pb-4">
      <h2 class="text-2xl font-black text-slate-900 dark:text-zinc-50 tracking-tight">History</h2>
      <button
        @click="quickAddOpen = true"
        class="flex items-center gap-1.5 bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[13px] font-bold px-4 py-2.5 rounded-full active:scale-95 transition-transform shadow-sm"
      >
        <Plus :size="14" :stroke-width="2.5" /> Add
      </button>
    </div>

    <!-- Search (glass) -->
    <div class="mx-4 mb-3 flex items-center gap-2.5 bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-slate-200/60 dark:border-zinc-800/60 rounded-2xl px-4 py-3 shadow-sm">
      <Search :size="16" class="text-slate-400 dark:text-zinc-600 flex-shrink-0" :stroke-width="2" />
      <input
        v-model="txSearch"
        placeholder="Search transactions…"
        class="flex-1 bg-transparent text-[14px] font-semibold text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 outline-none"
      />
      <button v-if="txSearch" @click="txSearch = ''" class="flex items-center text-slate-400 dark:text-zinc-600 active:opacity-60">
        <X :size="15" :stroke-width="2.5" />
      </button>
    </div>

    <!-- Filter chips -->
    <div class="flex gap-2 px-4 overflow-x-auto scrollbar-hide pb-3">
      <button
        v-for="f in filters" :key="f.val"
        @click="txFilter = f.val"
        :class="['flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-bold border transition-all',
          txFilter === f.val
            ? 'bg-violet-500 border-violet-500 text-white shadow-lg shadow-violet-500/25'
            : 'bg-white/70 dark:bg-zinc-900/60 backdrop-blur border-slate-200/60 dark:border-zinc-800/60 text-slate-500 dark:text-zinc-400']"
      >
        {{ f.label }}
      </button>
    </div>

    <!-- Grouped transaction list -->
    <div v-for="grp in groupedTx" :key="grp.date" class="mb-3">
      <p class="text-[11px] font-bold text-slate-400 dark:text-zinc-600 uppercase tracking-widest px-5 pb-2 pt-1">
        {{ grp.date }}
      </p>
      <div class="mx-4 rounded-2xl overflow-hidden bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-slate-200/60 dark:border-zinc-800/60 shadow-sm">
        <div
          v-for="(tx, i) in grp.items" :key="tx.id"
          :class="['flex items-center gap-3 px-4 py-3.5 transition-colors active:bg-slate-50 dark:active:bg-zinc-800',
            i < grp.items.length - 1 ? 'border-b border-slate-100 dark:border-zinc-800/60' : '']"
        >
          <div class="w-11 h-11 rounded-2xl bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center flex-shrink-0">
            <component :is="tx.icon" :size="19" class="text-violet-500" :stroke-width="1.8" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-[14px] font-bold text-slate-800 dark:text-zinc-100 truncate">{{ tx.name }}</p>
            <p class="text-[11px] text-slate-400 dark:text-zinc-500 font-medium mt-0.5">{{ tx.category }}</p>
          </div>
          <span :class="['text-[14px] font-bold flex-shrink-0',
            tx.amount > 0 ? 'text-emerald-500' : 'text-slate-700 dark:text-zinc-300']">
            {{ tx.amount > 0 ? '+' : '−' }}₱{{ Math.abs(tx.amount).toLocaleString() }}
          </span>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="groupedTx.length === 0" class="flex flex-col items-center gap-3 pt-20 px-8 text-center">
      <div class="w-14 h-14 rounded-2xl bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-slate-200/60 dark:border-zinc-800/60 flex items-center justify-center">
        <Search :size="22" class="text-slate-300 dark:text-zinc-700" :stroke-width="1.5" />
      </div>
      <p class="text-[14px] font-bold text-slate-400 dark:text-zinc-600">No transactions found</p>
    </div>

    <div class="h-6"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Search, X } from 'lucide-vue-next'
import { recentTx, quickAddOpen } from '../composables/useStore'

const txSearch = ref('')
const txFilter = ref('all')

const filters = [
  { val:'all',     label:'All'     },
  { val:'income',  label:'Income'  },
  { val:'expense', label:'Expense' },
]

const filteredTx = computed(() =>
  recentTx.value
    .filter(t => txFilter.value === 'all' || (txFilter.value === 'income' ? t.amount > 0 : t.amount < 0))
    .filter(t => t.name.toLowerCase().includes(txSearch.value.toLowerCase()))
)

const groupedTx = computed(() => {
  const g: Record<string, typeof recentTx.value> = {}
  filteredTx.value.forEach(t => {
    if (!g[t.date]) g[t.date] = []
    g[t.date].push(t)
  })
  return Object.entries(g).map(([date, items]) => ({ date, items }))
})
</script>