<template>
  <div class="bg-slate-100 dark:bg-zinc-950">

    <!-- Header -->
    <div class="flex items-center justify-between px-5 pt-6 pb-4">
      <h2 class="text-2xl font-black text-slate-900 dark:text-zinc-50 tracking-tight">My Cards</h2>
      <button
        @click="showAddCard = true"
        class="flex items-center gap-1.5 bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[13px] font-bold px-4 py-2.5 rounded-full active:scale-95 transition-transform shadow-sm"
      >
        <Plus :size="14" :stroke-width="2.5" /> Add Card
      </button>
    </div>

    <!-- ── Single swipeable card ── -->
    <div class="px-5">
      <!-- Empty state -->
      <div v-if="cards.length === 0"
        class="h-[190px] rounded-3xl border-2 border-dashed border-slate-300 dark:border-zinc-700 flex flex-col items-center justify-center gap-2"
      >
        <CreditCard :size="28" class="text-slate-300 dark:text-zinc-700" :stroke-width="1.5" />
        <p class="text-[13px] font-bold text-slate-400 dark:text-zinc-600">No cards yet. Tap Add Card.</p>
      </div>

      <!-- Card -->
      <div
        v-else
        class="relative h-[190px] rounded-3xl overflow-hidden select-none touch-pan-y"
        :style="{ background: currentCard.gradient, boxShadow: '0 20px 50px rgba(0,0,0,0.28)' }"
        @touchstart="onTouchStart"
        @touchmove.prevent="onTouchMove"
        @touchend="onTouchEnd"
        @mousedown="onMouseDown"
      >
        <!-- Noise texture -->
        <div class="absolute inset-0 opacity-[0.05] pointer-events-none"
          style="background-image:url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22/></filter><rect width=%22200%22 height=%22200%22 filter=%22url(%23n)%22 opacity=%221%22/></svg>')">
        </div>

        <!-- Slide transition layer -->
        <Transition :name="slideDir">
          <div :key="activeCard" class="absolute inset-0 p-5 flex flex-col justify-between">

            <!-- Top row -->
            <div class="flex justify-between items-start">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-widest text-white/40">
                  {{ cardTypeLabel(currentCard.type) }}
                </span>
                <p class="text-base font-black text-white/90 mt-0.5">{{ currentCard.bank }}</p>
              </div>
              <div class="flex items-center gap-2">
                <!-- NFC button -->
                <button
                  @click.stop="handleNfcTap(currentCard)"
                  class="relative w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
                  :class="currentCard.nfcEnabled ? 'bg-white/15 active:bg-white/25' : 'bg-white/5'"
                >
                  <Wifi
                    :size="17"
                    :color="currentCard.nfcEnabled ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.25)'"
                    :stroke-width="2"
                    style="transform: rotate(90deg)"
                  />
                  <!-- Strike-through when NFC disabled -->
                  <div v-if="!currentCard.nfcEnabled"
                    class="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <div class="w-[20px] h-[1.5px] bg-white/50 rounded-full" style="transform: rotate(-45deg)"></div>
                  </div>
                </button>
                <span class="text-[12px] font-black text-white/40 tracking-wide">{{ currentCard.network }}</span>
              </div>
            </div>

            <!-- Card number -->
            <div class="text-[15px] font-mono tracking-[0.18em] text-white/70">
              {{ currentCard.number }}
            </div>

            <!-- Bottom row -->
            <div class="flex items-end gap-4">
              <div>
                <div class="text-[9px] text-white/30 uppercase tracking-widest">Card Holder</div>
                <div class="text-[12px] font-bold text-white/80 mt-0.5">{{ currentCard.holder }}</div>
              </div>
              <div v-if="currentCard.expiry">
                <div class="text-[9px] text-white/30 uppercase tracking-widest">Expires</div>
                <div class="text-[12px] font-bold text-white/80 mt-0.5">{{ currentCard.expiry }}</div>
              </div>
              <!-- Swipe hint -->
              <div v-if="cards.length > 1 && showSwipeHint"
                class="ml-auto flex items-center gap-1 text-white/30 text-[10px] font-semibold pointer-events-none"
              >
                <ChevronLeft :size="11" /> swipe <ChevronRight :size="11" />
              </div>
            </div>

          </div>
        </Transition>
      </div>
    </div>

    <!-- Pip indicators -->
    <div v-if="cards.length > 1" class="flex justify-center gap-1.5 mt-3 mb-1">
      <button v-for="(_, i) in cards" :key="i" @click="goTo(i)"
        :class="['h-1.5 rounded-full transition-all duration-300',
          activeCard === i ? 'w-5 bg-violet-500' : 'w-1.5 bg-slate-300 dark:bg-zinc-700']"
      />
    </div>

    <!-- NFC / info banner -->
    <Transition name="fade">
      <div v-if="nfcBanner"
        :class="['mx-4 mt-3 rounded-2xl px-4 py-3 flex items-center gap-3 text-[13px] font-semibold border',
          nfcBanner.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' :
          nfcBanner.type === 'error'   ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-500 border-rose-200 dark:border-rose-800' :
                                         'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800']"
      >
        <component :is="nfcBanner.icon" :size="18" :stroke-width="2" class="flex-shrink-0" />
        <span class="flex-1 leading-snug">{{ nfcBanner.msg }}</span>
      </div>
    </Transition>

    <!-- Card Stats -->
    <div v-if="cards.length > 0 && currentCard" class="grid grid-cols-2 gap-2.5 mx-4 mt-3">
      <div class="rounded-2xl bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-slate-200/60 dark:border-zinc-800/60 shadow-sm p-4">
        <p class="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 mb-1.5">
          {{ currentCard.type === 'credit' ? 'Credit Limit' : 'Balance' }}
        </p>
        <p class="text-[19px] font-black text-slate-800 dark:text-zinc-100 tracking-tight">
          ₱{{ (currentCard.type === 'credit' ? currentCard.limit ?? 0 : currentCard.balance ?? 0).toLocaleString() }}
        </p>
      </div>

      <div class="rounded-2xl bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-slate-200/60 dark:border-zinc-800/60 shadow-sm p-4">
        <p class="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 mb-1.5">
          {{ currentCard.type === 'credit' ? 'Outstanding' : 'Spent this month' }}
        </p>
        <p :class="['text-[19px] font-black tracking-tight',
          currentCard.type === 'credit' ? 'text-rose-500' : 'text-slate-800 dark:text-zinc-100']">
          ₱{{ (currentCard.type === 'credit' ? currentCard.outstanding ?? 0 : currentCard.spent ?? 0).toLocaleString() }}
        </p>
      </div>

      <!-- Credit utilization bar -->
      <div v-if="currentCard.type === 'credit'"
        class="col-span-2 rounded-2xl bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-slate-200/60 dark:border-zinc-800/60 shadow-sm p-4"
      >
        <div class="flex justify-between items-center mb-3">
          <p class="text-[11px] font-semibold text-slate-400 dark:text-zinc-500">Utilization</p>
          <p class="text-[15px] font-black text-slate-800 dark:text-zinc-100">
            {{ Math.round((currentCard.outstanding ?? 0) / Math.max(currentCard.limit ?? 1, 1) * 100) }}%
          </p>
        </div>
        <div class="h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-2.5">
          <div class="h-full rounded-full bg-violet-500 transition-all duration-700"
            :style="{ width: Math.min(100, Math.round((currentCard.outstanding ?? 0) / Math.max(currentCard.limit ?? 1, 1) * 100)) + '%' }">
          </div>
        </div>
        <div class="flex justify-between text-[11px] font-semibold text-slate-400 dark:text-zinc-500">
          <span>Due {{ currentCard.due }}</span>
          <span class="text-emerald-500">
            ₱{{ ((currentCard.limit ?? 0) - (currentCard.outstanding ?? 0)).toLocaleString() }} available
          </span>
        </div>
      </div>

      <!-- Debit/Prepaid balance bar -->
      <div v-else
        class="col-span-2 rounded-2xl bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-slate-200/60 dark:border-zinc-800/60 shadow-sm p-4"
      >
        <div class="flex justify-between items-center mb-3">
          <p class="text-[11px] font-semibold text-slate-400 dark:text-zinc-500">Monthly Usage</p>
          <p class="text-[15px] font-black text-slate-800 dark:text-zinc-100">
            ₱{{ (currentCard.spent ?? 0).toLocaleString() }}
          </p>
        </div>
        <div class="h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div class="h-full rounded-full bg-violet-500 transition-all duration-700"
            :style="{ width: Math.min(100, Math.round(((currentCard.spent ?? 0) / Math.max(currentCard.balance ?? 1, 1)) * 100)) + '%' }">
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Charges -->
    <div class="flex items-center justify-between px-5 pt-5 pb-3">
      <h3 class="text-[15px] font-bold text-slate-800 dark:text-zinc-200">Recent Charges</h3>
    </div>
    <div class="mx-4 rounded-2xl overflow-hidden bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-slate-200/60 dark:border-zinc-800/60 shadow-sm">
      <div v-for="(tx, i) in expenses.slice(0, 4)" :key="tx.id"
        :class="['flex items-center gap-3 px-4 py-3.5 transition-colors active:bg-slate-50 dark:active:bg-zinc-800',
          i < Math.min(3, expenses.length - 1) ? 'border-b border-slate-100 dark:border-zinc-800/60' : '']"
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

  <!-- ── Modals via Teleport so they don't break page root ── -->

  <!-- Add Card Sheet -->
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="showAddCard"
        class="fixed inset-0 z-[200] flex items-end justify-center"
        style="background:rgba(0,0,0,0.5);backdrop-filter:blur(8px)"
        @click.self="showAddCard = false"
      >
        <div class="w-full max-w-[430px] bg-white dark:bg-zinc-900 rounded-t-[28px] border-t border-slate-200/60 dark:border-zinc-800"
          :style="{ paddingBottom:'calc(32px + env(safe-area-inset-bottom))' }"
        >
          <div class="flex flex-col gap-3 px-5 pt-4 max-h-[88vh] overflow-y-auto pb-2">

            <div class="w-10 h-1 bg-slate-200 dark:bg-zinc-700 rounded-full self-center mb-1 flex-shrink-0"></div>
            <h3 class="text-[18px] font-black text-center text-slate-900 dark:text-zinc-50">Add Card</h3>

            <!-- Type -->
            <div class="flex bg-slate-100 dark:bg-zinc-800 rounded-2xl p-1 gap-1">
              <button v-for="t in cardTypes" :key="t.val" @click="newCard.type = t.val"
                :class="['flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-bold transition-all',
                  newCard.type === t.val ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-zinc-50 shadow-sm' : 'text-slate-400 dark:text-zinc-600']"
              >
                <component :is="t.icon" :size="13" :stroke-width="2" />{{ t.label }}
              </button>
            </div>

            <input v-model="newCard.bank" placeholder="Bank / Issuer (e.g. BDO, GCash)"
              class="w-full bg-slate-50 dark:bg-zinc-800 rounded-2xl px-4 py-3.5 text-[15px] font-semibold text-slate-900 dark:text-zinc-50 placeholder:text-slate-300 dark:placeholder:text-zinc-600 border-2 border-transparent focus:border-violet-500 outline-none transition-colors" />

            <input v-model="newCard.holder" placeholder="Card holder name"
              class="w-full bg-slate-50 dark:bg-zinc-800 rounded-2xl px-4 py-3.5 text-[15px] font-semibold text-slate-900 dark:text-zinc-50 placeholder:text-slate-300 dark:placeholder:text-zinc-600 border-2 border-transparent focus:border-violet-500 outline-none transition-colors" />

            <input v-model="newCard.number" placeholder="Last 4 digits" maxlength="4" inputmode="numeric"
              class="w-full bg-slate-50 dark:bg-zinc-800 rounded-2xl px-4 py-3.5 text-[15px] font-semibold text-slate-900 dark:text-zinc-50 placeholder:text-slate-300 dark:placeholder:text-zinc-600 border-2 border-transparent focus:border-violet-500 outline-none transition-colors" />

            <!-- Network + Expiry -->
            <div class="flex gap-2">
              <div class="flex bg-slate-100 dark:bg-zinc-800 rounded-2xl p-1 gap-0.5 flex-1">
                <button v-for="n in networks" :key="n" @click="newCard.network = n"
                  :class="['flex-1 py-2 rounded-xl text-[11px] font-bold transition-all',
                    newCard.network === n ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-zinc-50 shadow-sm' : 'text-slate-400 dark:text-zinc-600']"
                >{{ n }}</button>
              </div>
              <input v-if="newCard.type === 'credit' || newCard.type === 'debit'"
                v-model="newCard.expiry" placeholder="MM/YY" maxlength="5"
                class="w-24 bg-slate-50 dark:bg-zinc-800 rounded-2xl px-3 py-3.5 text-[14px] font-semibold text-slate-900 dark:text-zinc-50 placeholder:text-slate-300 dark:placeholder:text-zinc-600 border-2 border-transparent focus:border-violet-500 outline-none transition-colors text-center" />
            </div>

            <!-- Amount -->
            <div class="flex items-center gap-3 bg-slate-50 dark:bg-zinc-800 rounded-2xl px-4 py-3.5 border-2 border-transparent focus-within:border-violet-500 transition-colors">
              <span class="text-[20px] font-black text-violet-500">₱</span>
              <input v-model="newCard.limitOrBalance" type="number"
                :placeholder="newCard.type === 'credit' ? 'Credit limit' : 'Current balance'"
                class="flex-1 bg-transparent text-[20px] font-black text-slate-900 dark:text-zinc-50 placeholder:text-slate-300 dark:placeholder:text-zinc-700 outline-none" />
            </div>

            <!-- NFC toggle -->
            <button @click="newCard.nfcEnabled = !newCard.nfcEnabled"
              :class="['flex items-center gap-3 p-4 rounded-2xl border-2 transition-all',
                newCard.nfcEnabled ? 'bg-violet-500/10 border-violet-500' : 'bg-slate-50 dark:bg-zinc-800 border-transparent']"
            >
              <div :class="['w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                newCard.nfcEnabled ? 'bg-violet-500' : 'bg-slate-200 dark:bg-zinc-700']">
                <Wifi :size="18" :color="newCard.nfcEnabled ? 'white' : '#94a3b8'" :stroke-width="2" style="transform:rotate(90deg)" />
              </div>
              <div class="flex-1 text-left">
                <p :class="['text-[14px] font-bold', newCard.nfcEnabled ? 'text-violet-600 dark:text-violet-400' : 'text-slate-700 dark:text-zinc-300']">
                  Enable NFC / Tap to Pay
                </p>
                <p class="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">Opens Google Pay / Samsung Pay on tap</p>
              </div>
              <div :class="['w-12 h-6 rounded-full transition-all relative flex-shrink-0',
                newCard.nfcEnabled ? 'bg-violet-500' : 'bg-slate-200 dark:bg-zinc-700']">
                <div :class="['absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all',
                  newCard.nfcEnabled ? 'left-6' : 'left-0.5']"></div>
              </div>
            </button>

            <!-- Gradient picker -->
            <div>
              <p class="text-[12px] font-semibold text-slate-400 dark:text-zinc-500 mb-2 px-1">Card Color</p>
              <div class="flex gap-2 flex-wrap">
                <button v-for="(g, idx) in gradients" :key="idx" @click="newCard.gradientIdx = idx"
                  :class="['w-10 h-10 rounded-xl transition-all active:scale-95',
                    newCard.gradientIdx === idx ? 'ring-2 ring-offset-2 ring-violet-500 scale-110' : '']"
                  :style="{ background: g }"
                />
              </div>
            </div>

            <button @click="submitAddCard" :disabled="!canSubmit"
              :class="['w-full py-4 rounded-2xl text-[16px] font-black active:scale-[0.98] transition-all mb-2',
                canSubmit ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30' : 'bg-slate-100 dark:bg-zinc-800 text-slate-300 dark:text-zinc-600']"
            >Add Card</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- NFC Pay Modal -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="nfcModal"
        class="fixed inset-0 z-[300] flex items-center justify-center"
        style="background:rgba(0,0,0,0.78);backdrop-filter:blur(14px)"
        @click.self="nfcModal = false"
      >
        <div class="flex flex-col items-center gap-6 p-10 text-center max-w-[320px]">
          <div class="relative w-32 h-32 flex items-center justify-center">
            <div class="absolute inset-0 rounded-full bg-violet-500/20 animate-ping"></div>
            <div class="absolute inset-4 rounded-full bg-violet-500/30 animate-ping" style="animation-delay:0.15s"></div>
            <div class="w-20 h-20 rounded-full bg-violet-500 flex items-center justify-center shadow-2xl shadow-violet-500/50">
              <Wifi :size="36" color="white" :stroke-width="1.8" style="transform:rotate(90deg)" />
            </div>
          </div>
          <div>
            <p class="text-white text-[20px] font-black">Tap to Pay</p>
            <p class="text-white/50 text-[13px] font-medium mt-2 leading-relaxed">
              Real NFC payment uses your bank's tokenized card via Google Pay or Samsung Pay.
              Open your payment app and hold your phone near the terminal.
            </p>
          </div>
          <button @click="openPayApp"
            class="w-full py-3.5 rounded-2xl bg-white text-zinc-900 text-[15px] font-black active:scale-95 transition-all shadow-lg"
          >Open Payment App</button>
          <button @click="nfcModal = false" class="text-white/40 text-[13px] font-semibold active:text-white/70">Cancel</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import {
  Plus, Wifi, ChevronLeft, ChevronRight,
  CreditCard, Landmark, Wallet, CheckCircle, XCircle, Info,
} from 'lucide-vue-next'
import { recentTx } from '../composables/useStore'

interface Card {
  id:           number
  type:         'credit' | 'debit' | 'prepaid' | 'atm'
  bank:         string
  network:      string
  number:       string
  holder:       string
  expiry?:      string
  gradient:     string
  nfcEnabled:   boolean
  limit?:       number
  outstanding?: number
  due?:         string
  balance?:     number
  spent?:       number
}

const cards = ref<Card[]>([
  { id:1, type:'credit',  bank:'BDO',       network:'VISA', number:'•••• •••• •••• 4812', holder:'Harold S.', expiry:'09/27', gradient:'linear-gradient(135deg,#1e1b4b,#3730a3)', nfcEnabled:true,  limit:50000,  outstanding:18500, due:'Apr 5'  },
  { id:2, type:'credit',  bank:'BPI',       network:'MC',   number:'•••• •••• •••• 3371', holder:'Harold S.', expiry:'12/26', gradient:'linear-gradient(135deg,#1a1a2e,#16213e)', nfcEnabled:false, limit:80000,  outstanding:32000, due:'Apr 10' },
  { id:3, type:'debit',   bank:'UnionBank', network:'VISA', number:'•••• •••• •••• 9204', holder:'Harold S.', gradient:'linear-gradient(135deg,#0f2027,#203a43)',                nfcEnabled:true,  balance:24000, spent:8400  },
  { id:4, type:'prepaid', bank:'GCash',     network:'MC',   number:'•••• •••• •••• 0011', holder:'Harold S.', gradient:'linear-gradient(135deg,#065f46,#059669)',                nfcEnabled:false, balance:1500,  spent:500   },
])

const activeCard  = ref(0)
const currentCard = computed(() => cards.value[activeCard.value])
const expenses    = computed(() => recentTx.value.filter(t => t.amount < 0))

function cardTypeLabel(type: string) {
  const m: Record<string,string> = { credit:'Credit Card', debit:'Debit Card', prepaid:'Prepaid', atm:'ATM Card' }
  return m[type] ?? type
}

// ── Swipe ────────────────────────────────────────────────
let touchStartX   = 0
let touchStartY   = 0
const slideDir      = ref('card-left')
const showSwipeHint = ref(true)

function onTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
}
function onTouchMove(e: TouchEvent) {
  const dx = Math.abs(e.touches[0].clientX - touchStartX)
  const dy = Math.abs(e.touches[0].clientY - touchStartY)
  if (dx > dy) e.preventDefault()
}
function onTouchEnd(e: TouchEvent) {
  const dx = e.changedTouches[0].clientX - touchStartX
  if (dx < -50 && activeCard.value < cards.value.length - 1) {
    slideDir.value = 'card-left'; activeCard.value++
  } else if (dx > 50 && activeCard.value > 0) {
    slideDir.value = 'card-right'; activeCard.value--
  }
  showSwipeHint.value = false
}
function onMouseDown(e: MouseEvent) {
  const startX = e.clientX
  const onUp = (ev: MouseEvent) => {
    const dx = ev.clientX - startX
    if (Math.abs(dx) > 50) {
      if (dx < 0 && activeCard.value < cards.value.length - 1) {
        slideDir.value = 'card-left'; activeCard.value++
      } else if (dx > 0 && activeCard.value > 0) {
        slideDir.value = 'card-right'; activeCard.value--
      }
    }
    window.removeEventListener('mouseup', onUp)
  }
  window.addEventListener('mouseup', onUp)
}
function goTo(i: number) {
  slideDir.value = i > activeCard.value ? 'card-left' : 'card-right'
  activeCard.value = i
}

// ── NFC ─────────────────────────────────────────────────
const nfcModal = ref(false)
interface Banner { type: 'success'|'error'|'info'; msg: string; icon: any }
const nfcBanner = ref<Banner | null>(null)
let bannerTimer: ReturnType<typeof setTimeout> | null = null

function showBanner(type: Banner['type'], msg: string) {
  if (bannerTimer) clearTimeout(bannerTimer)
  nfcBanner.value = { type, msg, icon: type === 'success' ? CheckCircle : type === 'error' ? XCircle : Info }
  bannerTimer = setTimeout(() => { nfcBanner.value = null }, 5000)
}

function handleNfcTap(card: Card) {
  if (!card.nfcEnabled) {
    showBanner('info', 'NFC is not enabled for this card. Edit the card to enable Tap to Pay.')
    return
  }
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
  if (isIos) {
    showBanner('error', 'NFC payments on iOS require Apple Pay and cannot be accessed from this app.')
    return
  }
  const hasNfc = 'NDEFReader' in window
  if (!hasNfc) {
    showBanner('info', 'Cannot confirm NFC support on this device. Opening payment app…')
    setTimeout(openPayApp, 1200)
    return
  }
  nfcModal.value = true
}

function openPayApp() {
  nfcModal.value = false
  window.location.href = 'googlepay://'
  setTimeout(() => { window.location.href = 'samsungpay://' }, 1200)
}

// ── Add Card ─────────────────────────────────────────────
const showAddCard = ref(false)

const gradients = [
  'linear-gradient(135deg,#1e1b4b,#3730a3)',
  'linear-gradient(135deg,#1a1a2e,#16213e)',
  'linear-gradient(135deg,#0f2027,#203a43)',
  'linear-gradient(135deg,#065f46,#059669)',
  'linear-gradient(135deg,#7c2d12,#c2410c)',
  'linear-gradient(135deg,#4a044e,#86198f)',
  'linear-gradient(135deg,#0c4a6e,#0284c7)',
  'linear-gradient(135deg,#1c1917,#44403c)',
  'linear-gradient(135deg,#134e4a,#0891b2)',
]

const cardTypes = [
  { val:'credit',  label:'Credit',  icon: CreditCard },
  { val:'debit',   label:'Debit',   icon: Landmark   },
  { val:'prepaid', label:'Prepaid', icon: Wallet      },
  { val:'atm',     label:'ATM',     icon: Landmark    },
]
const networks = ['VISA', 'MC', 'JCB', 'Amex']

const newCard = reactive({
  type: 'credit' as Card['type'],
  bank: '', number: '', holder: '', expiry: '',
  network: 'VISA', limitOrBalance: '',
  nfcEnabled: false, gradientIdx: 0,
})

const canSubmit = computed(() =>
  newCard.bank.trim().length > 0 && newCard.number.trim().length > 0 && newCard.holder.trim().length > 0
)

function submitAddCard() {
  if (!canSubmit.value) return
  const amount = parseFloat(newCard.limitOrBalance) || 0
  cards.value.push({
    id:          Date.now(),
    type:        newCard.type,
    bank:        newCard.bank.trim(),
    network:     newCard.network,
    number:      `•••• •••• •••• ${newCard.number.slice(-4).padStart(4,'•')}`,
    holder:      newCard.holder.trim(),
    expiry:      newCard.expiry || undefined,
    gradient:    gradients[newCard.gradientIdx],
    nfcEnabled:  newCard.nfcEnabled,
    ...(newCard.type === 'credit'
      ? { limit: amount, outstanding: 0, due: '—' }
      : { balance: amount, spent: 0 }),
  })
  goTo(cards.value.length - 1)
  showAddCard.value = false
  Object.assign(newCard, { type:'credit', bank:'', number:'', holder:'', expiry:'', network:'VISA', limitOrBalance:'', nfcEnabled:false, gradientIdx:0 })
}
</script>

<style scoped>
/* Card swipe transitions */
.card-left-enter-active,
.card-left-leave-active,
.card-right-enter-active,
.card-right-leave-active {
  transition: transform 0.3s cubic-bezier(0.35, 0, 0.15, 1), opacity 0.3s ease;
  position: absolute;
  inset: 0;
}
.card-left-enter-from  { transform: translateX(100%); opacity: 0; }
.card-left-leave-to    { transform: translateX(-100%); opacity: 0; }
.card-right-enter-from { transform: translateX(-100%); opacity: 0; }
.card-right-leave-to   { transform: translateX(100%); opacity: 0; }

/* Sheet modal */
.sheet-enter-active, .sheet-leave-active { transition: opacity .28s ease; }
.sheet-enter-active > div, .sheet-leave-active > div { transition: transform .32s cubic-bezier(.32,1.1,.64,1); }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
.sheet-enter-from > div, .sheet-leave-to > div { transform: translateY(100%); }

/* Fade */
.fade-enter-active, .fade-leave-active { transition: opacity .25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>