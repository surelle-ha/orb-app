<template>
  <div class="bg-slate-100 dark:bg-zinc-950 pb-28" style="touch-action:pan-y;">

    <!-- Header -->
    <div class="flex items-center justify-between px-5 pt-6 pb-3">
      <div>
        <h2 class="text-2xl font-black text-slate-900 dark:text-zinc-50 tracking-tight">Bills & Dues</h2>
        <p v-if="overdueBillsCount > 0" class="text-[11px] font-bold text-rose-500 mt-0.5">
          {{ overdueBillsCount }} overdue
        </p>
      </div>
      <button @click="showAdd = true"
        class="flex items-center gap-1.5 bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[13px] font-bold px-4 py-2.5 rounded-full active:scale-95 transition-transform shadow-sm">
        <Plus :size="14" :stroke-width="2.5" /> Add Bill
      </button>
    </div>

    <!-- Summary bar -->
    <div class="mx-4 mb-4 rounded-2xl bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-slate-200/60 dark:border-zinc-800/60 shadow-sm px-4 py-3 flex items-center justify-between">
      <div>
        <p class="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Total Due</p>
        <p class="text-[22px] font-black text-slate-900 dark:text-zinc-50 tracking-tight mt-0.5">
          {{ sym }}{{ totalBillsDue.toLocaleString() }}
        </p>
      </div>
      <div class="flex gap-3 text-right">
        <div>
          <p class="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Pending</p>
          <p class="text-[16px] font-black text-amber-500">{{ pendingCount }}</p>
        </div>
        <div>
          <p class="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Overdue</p>
          <p class="text-[16px] font-black text-rose-500">{{ overdueBillsCount }}</p>
        </div>
        <div>
          <p class="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Paid</p>
          <p class="text-[16px] font-black text-emerald-500">{{ paidCount }}</p>
        </div>
      </div>
    </div>

    <!-- Filter chips -->
    <div class="flex gap-2 px-4 overflow-x-auto scrollbar-hide pb-3">
      <button v-for="f in filters" :key="f.val"
        @click="activeFilter = f.val"
        :class="['flex-shrink-0 px-4 py-1.5 rounded-full text-[12px] font-bold border transition-all',
          activeFilter === f.val
            ? 'bg-violet-500 border-violet-500 text-white shadow-lg shadow-violet-500/25'
            : 'bg-white/70 dark:bg-zinc-900/60 backdrop-blur border-slate-200/60 dark:border-zinc-800/60 text-slate-500 dark:text-zinc-400']">
        {{ f.label }}
      </button>
    </div>

    <!-- Bills list -->
    <div v-if="filteredBills.length === 0"
      class="mx-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-zinc-700 flex flex-col items-center gap-3 py-12">
      <div class="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center">
        <Receipt :size="22" class="text-violet-400" :stroke-width="1.5" />
      </div>
      <p class="text-[14px] font-bold text-slate-400 dark:text-zinc-600">No bills here</p>
    </div>

    <div class="mx-4 rounded-2xl overflow-hidden bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-slate-200/60 dark:border-zinc-800/60 shadow-sm">
      <div v-for="(bill, i) in filteredBills" :key="bill.id"
        :class="['flex items-center gap-3 px-4 py-3.5 transition-colors',
          i < filteredBills.length - 1 ? 'border-b border-slate-100 dark:border-zinc-800/60' : '']">

        <!-- Icon -->
        <div :class="['w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0',
          bill.status === 'overdue' ? 'bg-rose-50 dark:bg-rose-950/40' :
          bill.status === 'paid'    ? 'bg-emerald-50 dark:bg-emerald-950/40' :
                                      'bg-violet-50 dark:bg-violet-950/40']">
          <component :is="billIcon(bill.icon)" :size="19"
            :class="bill.status === 'overdue' ? 'text-rose-500' : bill.status === 'paid' ? 'text-emerald-500' : 'text-violet-500'"
            :stroke-width="1.8" />
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5">
            <p class="text-[14px] font-bold text-slate-800 dark:text-zinc-100">{{ bill.name }}</p>
            <span v-if="bill.recurring"
              class="flex-shrink-0 text-[9px] font-black text-violet-500 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
              ↻ monthly
            </span>
          </div>
          <p class="text-[11px] font-medium mt-0.5"
            :class="bill.status === 'overdue' ? 'text-rose-400' : 'text-slate-400 dark:text-zinc-500'">
            {{ bill.status === 'overdue' ? '⚠ Overdue' : bill.status === 'paid' ? '✓ Paid' : `Due ${dayLabel(bill.dueDay)}` }}
          </p>
        </div>

        <!-- Amount -->
        <p class="text-[15px] font-black text-slate-800 dark:text-zinc-100 flex-shrink-0">
          {{ sym }}{{ bill.amount.toLocaleString() }}
        </p>

        <!-- Actions -->
        <div class="flex items-center gap-1 flex-shrink-0">
          <button v-if="bill.status !== 'paid'"
            @click="markPaid(bill.id)"
            class="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center active:scale-90 transition-transform"
            title="Mark as paid">
            <Check :size="15" class="text-emerald-500" :stroke-width="2.5" />
          </button>
          <button @click="confirmDelete(bill)"
            class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center active:scale-90 transition-transform"
            title="Delete">
            <Trash2 :size="14" class="text-slate-400 dark:text-zinc-500" :stroke-width="2" />
          </button>
        </div>
      </div>
    </div>

    <div class="h-4"></div>
  </div>

  <!-- ── Add Bill Sheet ── -->
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="showAdd"
        class="fixed inset-0 z-[200] flex items-end justify-center"
        style="background:rgba(0,0,0,0.5);backdrop-filter:blur(8px)"
        @click.self="showAdd = false">
        <div class="w-full max-w-[430px] bg-white dark:bg-zinc-900 rounded-t-[28px] border-t border-slate-200/60 dark:border-zinc-800"
          :style="{ paddingBottom:'calc(32px + env(safe-area-inset-bottom))' }">
          <div class="flex flex-col gap-3 px-5 pt-4">
            <div class="w-10 h-1 bg-slate-200 dark:bg-zinc-700 rounded-full self-center mb-1"></div>
            <h3 class="text-[18px] font-black text-center text-slate-900 dark:text-zinc-50">Add Bill</h3>

            <!-- Name -->
            <input v-model="form.name" placeholder="Bill name (e.g. Netflix, Rent)"
              class="w-full bg-slate-50 dark:bg-zinc-800 rounded-2xl px-4 py-3.5 text-[15px] font-semibold text-slate-900 dark:text-zinc-50 placeholder:text-slate-300 dark:placeholder:text-zinc-600 border-2 border-transparent focus:border-violet-500 outline-none transition-colors" />

            <!-- Amount -->
            <div class="flex items-center gap-3 bg-slate-50 dark:bg-zinc-800 rounded-2xl px-4 py-3.5 border-2 border-transparent focus-within:border-violet-500 transition-colors">
              <span class="text-[20px] font-black text-violet-500">{{ sym }}</span>
              <input v-model="form.amount" type="number" inputmode="decimal" placeholder="0.00"
                class="flex-1 bg-transparent text-[20px] font-black text-slate-900 dark:text-zinc-50 placeholder:text-slate-300 dark:placeholder:text-zinc-700 outline-none" />
            </div>

            <!-- Due day with validation -->
            <div>
              <div :class="['flex items-center gap-3 rounded-2xl px-4 py-3.5 border-2 transition-colors',
                dayError ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-400' : 'bg-slate-50 dark:bg-zinc-800 border-transparent focus-within:border-violet-500']">
                <Calendar :size="18" class="text-violet-500 flex-shrink-0" :stroke-width="2" />
                <input v-model="form.dueDay" type="number" inputmode="numeric"
                  placeholder="Due day of month (1–31)" min="1" max="31"
                  @input="validateDay"
                  class="flex-1 bg-transparent text-[15px] font-semibold text-slate-900 dark:text-zinc-50 placeholder:text-slate-400 dark:placeholder:text-zinc-600 outline-none" />
              </div>
              <p v-if="dayError" class="text-[11px] font-bold text-rose-500 mt-1 px-1">{{ dayError }}</p>
            </div>

            <!-- Recurring toggle -->
            <button @click="form.recurring = !form.recurring"
              :class="['flex items-center gap-3 p-4 rounded-2xl border-2 transition-all',
                form.recurring ? 'bg-violet-500/10 border-violet-500' : 'bg-slate-50 dark:bg-zinc-800 border-transparent']">
              <div :class="['w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                form.recurring ? 'bg-violet-500' : 'bg-slate-200 dark:bg-zinc-700']">
                <RefreshCw :size="18" :color="form.recurring ? 'white' : '#94a3b8'" :stroke-width="2" />
              </div>
              <div class="flex-1 text-left">
                <p :class="['text-[14px] font-bold', form.recurring ? 'text-violet-600 dark:text-violet-400' : 'text-slate-700 dark:text-zinc-300']">
                  Recurring Monthly
                </p>
                <p class="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">Resets to pending each month automatically</p>
              </div>
              <div :class="['w-12 h-6 rounded-full transition-all relative flex-shrink-0',
                form.recurring ? 'bg-violet-500' : 'bg-slate-200 dark:bg-zinc-700']">
                <div :class="['absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all',
                  form.recurring ? 'left-6' : 'left-0.5']"></div>
              </div>
            </button>

            <!-- Icon pick -->
            <div>
              <p class="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-2 px-1">Category</p>
              <div class="grid grid-cols-4 gap-2">
                <button v-for="ic in iconOptions" :key="ic.key"
                  @click="form.icon = ic.key"
                  :class="['flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all',
                    form.icon === ic.key ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/40' : 'border-transparent bg-slate-50 dark:bg-zinc-800']">
                  <component :is="ic.icon" :size="22"
                    :class="form.icon === ic.key ? 'text-violet-500' : 'text-slate-400 dark:text-zinc-600'"
                    :stroke-width="1.8" />
                  <span :class="['text-[10px] font-bold', form.icon === ic.key ? 'text-violet-500' : 'text-slate-400 dark:text-zinc-600']">{{ ic.label }}</span>
                </button>
              </div>
            </div>

            <button @click="submitAdd" :disabled="!canSubmit"
              :class="['w-full py-4 rounded-2xl text-[16px] font-black active:scale-[0.98] transition-all mb-2',
                canSubmit ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30' : 'bg-slate-100 dark:bg-zinc-800 text-slate-300 dark:text-zinc-600']">
              Add Bill
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- ── Delete Confirm ── -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="deleteTarget"
        class="fixed inset-0 z-[300] flex items-end justify-center"
        style="background:rgba(0,0,0,0.6);backdrop-filter:blur(12px)"
        @click.self="deleteTarget = null">
        <div class="w-full max-w-[430px] bg-white dark:bg-zinc-900 rounded-t-[28px] border-t border-slate-200/60 dark:border-zinc-800 pb-10 px-5 pt-5">
          <div class="w-10 h-1 bg-slate-200 dark:bg-zinc-700 rounded-full self-center mx-auto mb-5"></div>
          <p class="text-[16px] font-black text-slate-900 dark:text-zinc-50 text-center mb-1">Delete "{{ deleteTarget?.name }}"?</p>
          <p class="text-[13px] text-slate-400 text-center mb-6">This bill will be permanently removed.</p>
          <button @click="doDelete" class="w-full py-4 rounded-2xl bg-rose-500 text-white text-[16px] font-black active:scale-[0.98] shadow-lg shadow-rose-500/30 mb-3">Delete</button>
          <button @click="deleteTarget = null" class="w-full py-3.5 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-[15px] font-bold active:scale-[0.98]">Cancel</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { Plus, Check, Trash2, Calendar, Receipt, Zap, Smartphone, Wifi, Building2, Tv2, CreditCard, MoreHorizontal, RefreshCw } from 'lucide-vue-next'
import { bills, billIcon, addBill, markBillPaid, deleteBill, refreshBillStatuses, totalBillsDue, overdueBillsCount, settings } from '../composables/useStore'

const sym = computed(() => settings.value.currencySymbol)
onMounted(() => refreshBillStatuses())

const pendingCount = computed(() => bills.value.filter(b => b.status === 'pending').length)
const paidCount    = computed(() => bills.value.filter(b => b.status === 'paid').length)

const filters = [
  { val:'all',     label:'All'     },
  { val:'pending', label:'Pending' },
  { val:'overdue', label:'Overdue' },
  { val:'paid',    label:'Paid'    },
]
const activeFilter = ref('all')

const filteredBills = computed(() =>
  activeFilter.value === 'all' ? bills.value : bills.value.filter(b => b.status === activeFilter.value)
)

function dayLabel(day: number): string {
  const now = new Date()
  const due = new Date(now.getFullYear(), now.getMonth(), day)
  const todayMs = new Date().setHours(0,0,0,0)
  const diff = Math.ceil((due.getTime() - todayMs) / 86400000)
  if (diff === 0) return 'today'
  if (diff === 1) return 'tomorrow'
  if (diff < 0)  return `${Math.abs(diff)}d ago`
  return `in ${diff}d (${day}${daySuffix(day)})`
}
function daySuffix(d: number) {
  if (d >= 11 && d <= 13) return 'th'
  return ['st','nd','rd'][((d % 10) - 1)] ?? 'th'
}

function markPaid(id: number) { markBillPaid(id) }

const deleteTarget = ref<typeof bills.value[0] | null>(null)
function confirmDelete(bill: typeof bills.value[0]) { deleteTarget.value = bill }
function doDelete() {
  if (deleteTarget.value) deleteBill(deleteTarget.value.id)
  deleteTarget.value = null
}

// ── Add form ──────────────────────────────────────────────
const showAdd  = ref(false)
const dayError = ref('')
const form = reactive({ name:'', amount:'', dueDay:'', icon:'other', recurring:false })

function validateDay() {
  const n = parseInt(form.dueDay)
  if (!form.dueDay) { dayError.value = ''; return }
  if (isNaN(n) || n < 1 || n > 31) {
    dayError.value = 'Day must be between 1 and 31'
  } else {
    dayError.value = ''
  }
}

const canSubmit = computed(() =>
  form.name.trim().length > 0 &&
  !!form.amount && parseFloat(form.amount) > 0 &&
  !!form.dueDay && !dayError.value &&
  parseInt(form.dueDay) >= 1 && parseInt(form.dueDay) <= 31
)

const iconOptions = [
  { key:'zap',        icon:Zap,           label:'Electric'  },
  { key:'smartphone', icon:Smartphone,    label:'Mobile'    },
  { key:'wifi',       icon:Wifi,          label:'Internet'  },
  { key:'building2',  icon:Building2,     label:'Rent'      },
  { key:'tv2',        icon:Tv2,           label:'Streaming' },
  { key:'creditcard', icon:CreditCard,    label:'Card'      },
  { key:'other',      icon:MoreHorizontal,label:'Other'     },
]

function submitAdd() {
  validateDay()
  if (!canSubmit.value) return
  addBill({
    name:      form.name.trim(),
    amount:    parseFloat(form.amount),
    dueDay:    parseInt(form.dueDay),
    icon:      form.icon,
    recurring: form.recurring,
  })
  Object.assign(form, { name:'', amount:'', dueDay:'', icon:'other', recurring:false })
  dayError.value = ''
  showAdd.value = false
}
</script>

<style scoped>
.sheet-enter-active,.sheet-leave-active{transition:opacity .28s ease;}
.sheet-enter-active>div,.sheet-leave-active>div{transition:transform .32s cubic-bezier(.32,1.1,.64,1);}
.sheet-enter-from,.sheet-leave-to{opacity:0;}
.sheet-enter-from>div,.sheet-leave-to>div{transform:translateY(100%);}
.fade-enter-active,.fade-leave-active{transition:opacity .25s ease;}
.fade-enter-from,.fade-leave-to{opacity:0;}
</style>