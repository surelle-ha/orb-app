<template>
  <Transition name="sheet">
    <div
      v-if="quickAddOpen"
      class="fixed inset-0 z-[200] flex items-end justify-center"
      style="background:rgba(0,0,0,0.45);backdrop-filter:blur(8px)"
      @click.self="quickAddOpen = false"
    >
      <div
        class="w-full max-w-[430px] bg-white dark:bg-zinc-900 rounded-t-[28px] border-t border-slate-200/60 dark:border-zinc-800"
        :style="{ paddingBottom:'calc(32px + env(safe-area-inset-bottom))' }"
      >
        <div class="flex flex-col gap-4 px-5 pt-4">

          <!-- Handle -->
          <div class="w-10 h-1 bg-slate-200 dark:bg-zinc-700 rounded-full self-center mb-1"></div>
          <h3 class="text-[18px] font-black text-center text-slate-900 dark:text-zinc-50">Add Transaction</h3>

          <!-- Type toggle -->
          <div class="flex bg-slate-100 dark:bg-zinc-800 rounded-2xl p-1 gap-1">
            <button
              v-for="t in typeOptions" :key="t.val"
              @click="form.type = t.val"
              :class="['flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-bold transition-all',
                form.type === t.val
                  ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-zinc-50 shadow-sm'
                  : 'text-slate-400 dark:text-zinc-600']"
            >
              <component :is="t.icon" :size="16" :stroke-width="2" />
              {{ t.label }}
            </button>
          </div>

          <!-- Amount -->
          <div class="flex items-center gap-2 bg-slate-50 dark:bg-zinc-800 rounded-2xl px-4 py-3.5 border-2 border-transparent focus-within:border-violet-500 transition-colors">
            <span class="text-[26px] font-black text-violet-500">₱</span>
            <input
              v-model="form.amount"
              type="number"
              placeholder="0.00"
              class="flex-1 bg-transparent text-[32px] font-black text-slate-900 dark:text-zinc-50 placeholder:text-slate-200 dark:placeholder:text-zinc-700 outline-none tracking-tight"
            />
          </div>

          <!-- Description -->
          <input
            v-model="form.desc"
            placeholder="Description…"
            class="w-full bg-slate-50 dark:bg-zinc-800 rounded-2xl px-4 py-3.5 text-[15px] font-semibold text-slate-900 dark:text-zinc-50 placeholder:text-slate-300 dark:placeholder:text-zinc-600 border-2 border-transparent focus:border-violet-500 outline-none transition-colors"
          />

          <!-- Categories -->
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="cat in categories" :key="cat.label"
              @click="form.category = cat.label"
              :class="['flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all',
                form.category === cat.label
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/40'
                  : 'border-transparent bg-slate-50 dark:bg-zinc-800']"
            >
              <component
                :is="cat.icon"
                :size="22"
                :class="form.category === cat.label ? 'text-violet-500' : 'text-slate-400 dark:text-zinc-600'"
                :stroke-width="1.8"
              />
              <span :class="['text-[10px] font-bold',
                form.category === cat.label ? 'text-violet-500' : 'text-slate-400 dark:text-zinc-600']">
                {{ cat.label }}
              </span>
            </button>
          </div>

          <!-- Submit -->
          <button
            @click="submit"
            class="w-full py-4 rounded-2xl bg-violet-500 text-white text-[16px] font-black active:scale-[0.98] transition-transform shadow-lg shadow-violet-500/30"
          >
            Add Transaction
          </button>

        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import {
  ArrowDownCircle, ArrowUpCircle,
  Utensils, ShoppingBag, Car, Zap, ShoppingCart,
  Gamepad2, Banknote, MoreHorizontal,
} from 'lucide-vue-next'
import { quickAddOpen, addTx } from '../composables/useStore'

const typeOptions = [
  { val: 'expense', icon: ArrowDownCircle, label: 'Expense' },
  { val: 'income',  icon: ArrowUpCircle,   label: 'Income'  },
]

const categories = [
  { icon: Utensils,      label: 'Food'      },
  { icon: ShoppingBag,   label: 'Groceries' },
  { icon: Car,           label: 'Transport' },
  { icon: Zap,           label: 'Utilities' },
  { icon: ShoppingCart,  label: 'Shopping'  },
  { icon: Gamepad2,      label: 'Leisure'   },
  { icon: Banknote,      label: 'Income'    },
  { icon: MoreHorizontal,label: 'Other'     },
]

const form = reactive({ type: 'expense', desc: '', amount: '', category: 'Food' })

function submit() {
  if (!form.desc || !form.amount) return
  const amt = parseFloat(form.amount)
  addTx({
    name:     form.desc,
    amount:   form.type === 'income' ? amt : -amt,
    category: form.category,
  })
  Object.assign(form, { type:'expense', desc:'', amount:'', category:'Food' })
  quickAddOpen.value = false
}
</script>

<style>
.sheet-enter-active,
.sheet-leave-active { transition: opacity .28s ease; }

.sheet-enter-active > div > div,
.sheet-leave-active > div > div {
  transition: transform .32s cubic-bezier(.32, 1.1, .64, 1);
}
.sheet-enter-from,
.sheet-leave-to { opacity: 0; }

.sheet-enter-from > div > div,
.sheet-leave-to  > div > div { transform: translateY(100%); }
</style>