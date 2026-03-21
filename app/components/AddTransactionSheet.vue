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

          <!-- Expense / Income toggle -->
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
            <span class="text-[26px] font-black text-violet-500">{{ sym }}</span>
            <input
              :value="form.amountDisplay"
              @input="onAmountInput"
              @keydown="onAmountKeydown"
              inputmode="decimal"
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

          <!-- Account selector -->
          <div>
            <p class="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-2 px-1">Account</p>
            <div class="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              <button
                @click="form.accountId = null"
                :class="['flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 text-[13px] font-bold transition-all',
                  form.accountId === null
                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-300'
                    : 'border-transparent bg-slate-50 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400']"
              >
                <Banknote :size="15" :stroke-width="2" />
                Cash
              </button>
              <button
                v-for="card in savedCards" :key="card.id"
                @click="form.accountId = card.id"
                :class="['flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 text-[13px] font-bold transition-all',
                  form.accountId === card.id
                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-300'
                    : 'border-transparent bg-slate-50 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400']"
              >
                <CreditCard :size="15" :stroke-width="2" />
                <span class="max-w-[100px] truncate">{{ card.bank }}</span>
                <span class="text-[10px] opacity-60">{{ card.number.slice(-4) }}</span>
              </button>
            </div>
          </div>

          <!-- Category (only for expense) -->
          <div v-if="form.type === 'expense'">
            <p class="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-2 px-1">Category</p>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="cat in expenseCategories" :key="cat.label"
                @click="form.category = cat.label"
                :class="['flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all',
                  form.category === cat.label
                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/40'
                    : 'border-transparent bg-slate-50 dark:bg-zinc-800']"
              >
                <component :is="cat.icon" :size="22"
                  :class="form.category === cat.label ? 'text-violet-500' : 'text-slate-400 dark:text-zinc-600'"
                  :stroke-width="1.8" />
                <span :class="['text-[10px] font-bold',
                  form.category === cat.label ? 'text-violet-500' : 'text-slate-400 dark:text-zinc-600']">
                  {{ cat.label }}
                </span>
              </button>
            </div>
          </div>

          <!-- Submit -->
          <button
            @click="submit"
            :disabled="!canSubmit"
            :class="['w-full py-4 rounded-2xl text-[16px] font-black transition-all',
              canSubmit
                ? 'bg-violet-500 text-white active:scale-[0.98] shadow-lg shadow-violet-500/30'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-300 dark:text-zinc-600']"
          >
            Add Transaction
          </button>

        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted, ref, watch } from 'vue'
import {
  ArrowDownCircle, ArrowUpCircle,
  Utensils, ShoppingBag, Car, Zap, ShoppingCart,
  Gamepad2, MoreHorizontal, Banknote, CreditCard,
} from 'lucide-vue-next'
import { quickAddOpen, addTx, cardsVersion, settings } from '../composables/useStore'

const CARDS_KEY = 'orb_cards_v1'
const sym = computed(() => settings.value.currencySymbol)

interface SavedCard { id: number; bank: string; number: string; type: string }
const savedCards = ref<SavedCard[]>([])

function loadCards() {
  try {
    const raw = localStorage.getItem(CARDS_KEY)
    if (raw) savedCards.value = JSON.parse(raw) as SavedCard[]
  } catch {}
}

onMounted(loadCards)
watch(cardsVersion, loadCards)
watch(quickAddOpen, v => { if (v) loadCards() })

const typeOptions = [
  { val: 'expense', icon: ArrowDownCircle, label: 'Expense' },
  { val: 'income',  icon: ArrowUpCircle,   label: 'Income'  },
]

const expenseCategories = [
  { icon: Utensils,       label: 'Food'      },
  { icon: ShoppingBag,    label: 'Groceries' },
  { icon: Car,            label: 'Transport' },
  { icon: Zap,            label: 'Utilities' },
  { icon: ShoppingCart,   label: 'Shopping'  },
  { icon: Gamepad2,       label: 'Leisure'   },
  { icon: MoreHorizontal, label: 'Other'     },
]

const form = reactive({
  type:          'expense',
  desc:          '',
  amountDisplay: '',   // formatted string shown to user e.g. "1,234.56"
  amountRaw:     '',   // raw numeric string e.g. "1234.56"
  category:      'Food',
  accountId:     null as number | null,
})

// Format a raw string to comma-separated display
function formatDisplay(raw: string): string {
  if (!raw) return ''
  const parts = raw.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

function onAmountInput(e: Event) {
  const el = e.target as HTMLInputElement
  let cleaned = el.value.replace(/[^0-9.]/g, '')
  const firstDot = cleaned.indexOf('.')
  if (firstDot !== -1)
    cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '')
  if (cleaned.indexOf('.') !== -1 && cleaned.length - cleaned.indexOf('.') > 3)
    cleaned = cleaned.slice(0, cleaned.indexOf('.') + 3)
  form.amountRaw     = cleaned
  form.amountDisplay = formatDisplay(cleaned)
  el.value = form.amountDisplay
}

function onAmountKeydown(e: KeyboardEvent) {
  if ([8,9,27,37,38,39,40,46,35,36].includes(e.keyCode)) return
  if (e.ctrlKey || e.metaKey) return
  if (!/[0-9.]/.test(e.key)) e.preventDefault()
}

const canSubmit = computed(() =>
  form.desc.trim().length > 0 && form.amountRaw && parseFloat(form.amountRaw) > 0
)

function submit() {
  if (!canSubmit.value) return
  const amt = parseFloat(form.amountRaw)
  addTx({
    name:      form.desc.trim(),
    amount:    form.type === 'income' ? amt : -amt,
    category:  form.type === 'income' ? 'Income' : form.category,
    accountId: form.accountId,
  })
  Object.assign(form, { type:'expense', desc:'', amountDisplay:'', amountRaw:'', category:'Food', accountId:null })
  quickAddOpen.value = false
}
</script>

<style>
.sheet-enter-active, .sheet-leave-active { transition: opacity .28s ease; }
.sheet-enter-active > div, .sheet-leave-active > div { transition: transform .32s cubic-bezier(.32,1.1,.64,1); }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
.sheet-enter-from > div, .sheet-leave-to > div { transform: translateY(100%); }
</style>