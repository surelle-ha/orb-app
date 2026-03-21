<template>
  <div class="bg-slate-100 dark:bg-zinc-950 pb-28" style="touch-action:pan-y;">

    <!-- Topbar -->
    <div class="flex items-center justify-between px-5 pt-6 pb-2">
      <div>
        <p class="text-xs font-semibold text-slate-400 dark:text-zinc-500 tracking-wide">Good {{ timeOfDay }}</p>
        <h1 class="text-2xl font-black text-slate-900 dark:text-zinc-50 tracking-tight mt-0.5">{{ userName }}</h1>
      </div>
      <button class="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm active:scale-90 transition-transform" :style="{ background: accent, boxShadow: `0 4px 16px ${accent}50` }">{{ userInitial }}</button>
    </div>

    <!-- ═══ BALANCE CARD ═══ -->
    <div v-if="totalBalance !== 0 || totalIncome > 0"
      class="mx-4 relative overflow-hidden rounded-3xl"
      :style="{ background:'#09090b', boxShadow: `0 8px 40px rgba(0,0,0,0.25), 0 0 0 1px ${accent}22` }">

      <!-- Starfield canvas -->
      <canvas ref="starsCanvas" class="absolute inset-0 pointer-events-none" style="width:100%;height:100%;"></canvas>

      <!-- Nebula glow -->
      <div class="absolute inset-0 pointer-events-none"
        :style="{ background: `radial-gradient(ellipse at 50% 30%, ${accent}38 0%, transparent 60%)` }"></div>

      <!-- Top row: Orb AI hint label -->
      <div class="relative flex items-center justify-between px-5 pt-4 pb-1">
        <p class="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Total Balance</p>
        <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          :style="{ background:`${accent}18`, border:`1px solid ${accent}33` }">
          <div class="w-1.5 h-1.5 rounded-full" :style="{ background:accent }"></div>
          <span class="text-[10px] font-bold" :style="{ color:accent }">Tap Orb to chat</span>
        </div>
      </div>

      <!-- ── CLICKABLE ORB SECTION ── -->
      <button @click="navigate('orb')"
        class="relative w-full flex flex-col items-center pt-2 pb-3 active:scale-[0.97] transition-transform duration-200"
        style="cursor:pointer;">

        <!-- Back ring halves -->
        <div class="absolute pointer-events-none"
          style="top:62px;left:50%;transform:translateX(-50%);width:1px;height:1px;">
          <svg class="absolute orb-h-ring-4" style="width:310px;height:68px;margin-left:-155px;margin-top:-34px;overflow:visible;">
            <path d="M 1,34 A 154,33 0 0,1 309,34" fill="none" :stroke="accent+'10'" stroke-width="1" style="filter:blur(1px);" />
          </svg>
          <svg class="absolute orb-h-ring-3" style="width:254px;height:52px;margin-left:-127px;margin-top:-26px;overflow:visible;">
            <path d="M 1,26 A 126,25 0 0,1 253,26" fill="none" :stroke="accent+'20'" stroke-width="1" style="filter:blur(0.5px);" />
          </svg>
          <svg class="absolute orb-h-ring-2" style="width:200px;height:36px;margin-left:-100px;margin-top:-18px;overflow:visible;">
            <path d="M 1,18 A 99,17 0 0,1 199,18" fill="none" :stroke="accent+'40'" stroke-width="1.5" />
          </svg>
          <svg class="absolute orb-h-ring-1" style="width:144px;height:24px;margin-left:-72px;margin-top:-12px;overflow:visible;">
            <path d="M 1,12 A 71,11 0 0,1 143,12" fill="none" :stroke="accent+'75'" stroke-width="2"
              :style="{ filter:`drop-shadow(0 0 4px ${accent}66)` }" />
          </svg>
          <div class="absolute rounded-full" :style="discGlowBack"></div>
        </div>

        <!-- Orb sphere -->
        <div class="relative mt-1" style="width:88px;height:88px;">
          <div class="absolute rounded-full" :style="orbOuterGlow"></div>
          <div class="absolute rounded-full" :style="orbLensRing"></div>
          <div class="absolute inset-0 rounded-full" :style="orbSphereShadow"></div>
          <div class="absolute inset-0 rounded-full"
            :style="{ background:`radial-gradient(circle at 28% 26%, ${accent}2E 0%, transparent 55%)` }"></div>
        </div>

        <!-- Front ring halves + particles -->
        <div class="absolute pointer-events-none"
          style="top:62px;left:50%;transform:translateX(-50%);width:1px;height:1px;">
          <svg class="absolute orb-h-ring-4" style="width:310px;height:68px;margin-left:-155px;margin-top:-34px;overflow:visible;">
            <path d="M 1,34 A 154,33 0 0,0 309,34" fill="none" :stroke="accent+'10'" stroke-width="1" style="filter:blur(1px);" />
          </svg>
          <svg class="absolute orb-h-ring-3" style="width:254px;height:52px;margin-left:-127px;margin-top:-26px;overflow:visible;">
            <path d="M 1,26 A 126,25 0 0,0 253,26" fill="none" :stroke="accent+'20'" stroke-width="1" style="filter:blur(0.5px);" />
          </svg>
          <svg class="absolute orb-h-ring-2" style="width:200px;height:36px;margin-left:-100px;margin-top:-18px;overflow:visible;">
            <path d="M 1,18 A 99,17 0 0,0 199,18" fill="none" :stroke="accent+'55'" stroke-width="1.5" />
          </svg>
          <svg class="absolute orb-h-ring-1" style="width:144px;height:24px;margin-left:-72px;margin-top:-12px;overflow:visible;">
            <path d="M 1,12 A 71,11 0 0,0 143,12" fill="none" :stroke="accent+'BB'" stroke-width="2.5"
              :style="{ filter:`drop-shadow(0 0 6px ${accent}99)` }" />
          </svg>
          <div class="absolute rounded-full" :style="discGlowFront"></div>
          <div class="absolute rounded-full orb-h-p1" style="width:3px;height:3px;top:0;left:0;"
            :style="{ background:accent, opacity:0.9 }"></div>
          <div class="absolute rounded-full orb-h-p2" style="width:2px;height:2px;top:0;left:0;"
            :style="{ background:accent, opacity:0.7 }"></div>
        </div>

        <!-- Orb insight label (small, below orb) -->
        <div class="relative mt-10 mx-5 px-3.5 py-1.5 rounded-xl text-center max-w-[260px]"
          style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);">
          <p class="text-[11px] font-medium leading-snug" style="color:rgba(255,255,255,0.55);">{{ orbInsight }}</p>
        </div>
      </button>

      <!-- Balance text + income/expense row -->
      <div class="relative flex flex-col items-center pb-5 px-5">
        <div class="flex items-baseline gap-1.5">
          <span class="text-[17px] font-bold" :style="{ color:accent }">{{ sym }}</span>
          <span :class="['text-[42px] font-black tracking-tight leading-none', totalBalance < 0 ? 'text-rose-300' : 'text-white']">
            {{ showBalance ? formatAmount(totalBalance) : '•••,•••' }}
          </span>
          <button @click.stop="showBalance = !showBalance" class="mb-1 active:scale-90 transition-transform">
            <Eye    v-if="showBalance" :size="15" class="text-zinc-600" :stroke-width="2" />
            <EyeOff v-else             :size="15" class="text-zinc-600" :stroke-width="2" />
          </button>
        </div>
        <div class="flex items-center gap-3 mt-2.5">
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <TrendingUp :size="11" class="text-emerald-400" :stroke-width="2.5" />
            <span class="text-[12px] font-bold text-emerald-400">{{ sym }}{{ formatAmount(totalIncome) }}</span>
          </div>
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20">
            <TrendingDown :size="11" class="text-rose-400" :stroke-width="2.5" />
            <span class="text-[12px] font-bold text-rose-400">{{ sym }}{{ formatAmount(totalExpenses) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ EMPTY STATE (no transactions) ═══ -->
    <div v-else class="mx-4 rounded-3xl bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-slate-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col items-center gap-3 py-10">
      <div class="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center">
        <Wallet :size="24" class="text-violet-400" :stroke-width="1.5" />
      </div>
      <p class="text-[15px] font-black text-slate-800 dark:text-zinc-100">No balance yet</p>
      <p class="text-[12px] text-slate-400 dark:text-zinc-500 text-center px-6">Add your first income or expense to get started.</p>
      <button @click="quickAddOpen = true"
        class="flex items-center gap-1.5 bg-violet-500 text-white text-[13px] font-bold px-5 py-2.5 rounded-full active:scale-95 transition-transform shadow-lg shadow-violet-500/30">
        <Plus :size="14" :stroke-width="2.5" /> Add Transaction
      </button>
    </div>

    <!-- ═══ QUICK ACTIONS ═══ -->
    <div class="px-5 pt-5 pb-2">
      <h3 class="text-[13px] font-bold text-slate-500 dark:text-zinc-400">Actions</h3>
    </div>
    <div class="flex gap-3 px-4 overflow-x-auto scrollbar-hide pb-1">
      <button v-for="a in quickActions" :key="a.label"
        @click="a.fn()"
        class="flex flex-col items-center gap-2 flex-shrink-0 active:scale-90 transition-transform duration-150">
        <div class="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur border border-slate-200/60 dark:border-zinc-800/60 shadow-sm">
          <component :is="a.icon" :size="21" class="text-violet-500" :stroke-width="2" />
        </div>
        <span class="text-[11px] font-semibold text-slate-500 dark:text-zinc-500">{{ a.label }}</span>
      </button>
    </div>

    <!-- ═══ SPENDING (real data) ═══ -->
    <div class="flex items-center justify-between px-5 pt-5 pb-2">
      <h3 class="text-[13px] font-bold text-slate-500 dark:text-zinc-400">Spending</h3>
    </div>

    <!-- Empty spending state -->
    <div v-if="spendingByCategory.length === 0"
      class="mx-4 rounded-2xl bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-slate-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col items-center gap-2 py-8">
      <BarChart2 :size="28" class="text-slate-300 dark:text-zinc-700" :stroke-width="1.5" />
      <p class="text-[13px] font-bold text-slate-400 dark:text-zinc-600">No expenses logged yet</p>
    </div>

    <!-- Spending card -->
    <div v-else class="mx-4 rounded-2xl bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-slate-200/60 dark:border-zinc-800/60 shadow-sm p-4">
      <!-- Bar chart -->
      <div class="flex items-end gap-1.5 mb-4" style="height:72px">
        <div v-for="bar in chartBars" :key="bar.label"
          class="flex flex-col items-center gap-1.5 flex-1 h-full justify-end">
          <div class="w-full bg-slate-100 dark:bg-zinc-800 rounded-lg overflow-hidden flex items-end" style="height:56px">
            <div class="w-full rounded-lg bg-violet-500 transition-all duration-700"
              :style="{ height: bar.pct + '%', opacity: bar.opacity }"></div>
          </div>
          <span class="text-[9px] font-semibold text-slate-400 dark:text-zinc-600 truncate w-full text-center">{{ bar.label }}</span>
        </div>
      </div>
      <!-- Category breakdown -->
      <div class="space-y-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
        <div v-for="(cat, idx) in topSpend" :key="cat.category" class="flex items-center gap-2.5">
          <div class="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0"
            :style="{ opacity: idx === 0 ? 1 : idx === 1 ? 0.65 : 0.4 }"></div>
          <span class="flex-1 text-[13px] font-semibold text-slate-500 dark:text-zinc-400">{{ cat.category }}</span>
          <span class="text-[13px] font-bold text-slate-800 dark:text-zinc-200">{{ sym }}{{ cat.total.toLocaleString() }}</span>
        </div>
        <div v-if="otherTotal > 0" class="flex items-center gap-2.5">
          <div class="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0" style="opacity:0.2"></div>
          <span class="flex-1 text-[13px] font-semibold text-slate-500 dark:text-zinc-400">Other</span>
          <span class="text-[13px] font-bold text-slate-800 dark:text-zinc-200">{{ sym }}{{ otherTotal.toLocaleString() }}</span>
        </div>
      </div>
    </div>

    <!-- ═══ ACTIVITY HEATMAP ═══ -->
    <div class="flex items-center justify-between px-5 pt-5 pb-2">
      <h3 class="text-[13px] font-bold text-slate-500 dark:text-zinc-400">Activity</h3>
      <span class="text-[11px] font-semibold text-slate-400 dark:text-zinc-600">Last 15 weeks</span>
    </div>
    <div class="mx-4 rounded-2xl bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-slate-200/60 dark:border-zinc-800/60 shadow-sm p-4">

      <!-- Month labels row -->
      <div class="relative mb-1.5" :style="{ height: '14px', display: 'grid', gridTemplateColumns: `repeat(${HEATMAP_WEEKS}, 1fr)` }">
        <template v-for="lbl in heatmapMonthLabels" :key="lbl.col">
          <span class="text-[9px] font-bold text-slate-400 dark:text-zinc-600 absolute"
            :style="{ left: `calc(${lbl.col} / ${HEATMAP_WEEKS} * 100%)` }">
            {{ lbl.label }}
          </span>
        </template>
      </div>

      <!-- Grid: day-label col + 15-week columns -->
      <div class="flex gap-[3px] items-start">
        <!-- Day-of-week labels -->
        <div class="flex flex-col gap-[3px] mr-1 flex-shrink-0">
          <span v-for="(lbl, i) in heatmapDayLabels" :key="i"
            class="text-[9px] font-bold text-slate-300 dark:text-zinc-700 leading-none"
            style="height:12px;line-height:12px;">
            {{ i % 2 === 0 ? lbl : '' }}
          </span>
        </div>

        <!-- Week columns -->
        <div class="flex gap-[3px] flex-1 overflow-hidden">
          <div v-for="w in HEATMAP_WEEKS" :key="w" class="flex flex-col gap-[3px] flex-1">
            <div
              v-for="day in 7" :key="day"
              :class="'rounded-[3px] flex-shrink-0'"
              style="height:12px;"
              :style="{
                backgroundColor: cellColor(heatmapData[(w-1)*7+(day-1)].intensity, heatmapData[(w-1)*7+(day-1)].isFuture, heatmapData[(w-1)*7+(day-1)].hasExpense, heatmapData[(w-1)*7+(day-1)].hasIncome),
                boxShadow: heatmapData[(w-1)*7+(day-1)].isToday ? `0 0 0 1.5px ${settings.accentColor}` : 'none',
              }"
              :title="`${heatmapData[(w-1)*7+(day-1)].key}: ${heatmapData[(w-1)*7+(day-1)].count} txn(s)`"
            />
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div class="flex items-center gap-3 mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800">
        <span class="text-[10px] font-semibold text-slate-400 dark:text-zinc-600">Less</span>
        <div class="flex gap-1">
          <div v-for="i in 5" :key="i" class="w-3 h-3 rounded-[3px]"
            :style="{ backgroundColor: legendColor(i) }" />
        </div>
        <span class="text-[10px] font-semibold text-slate-400 dark:text-zinc-600">More</span>
        <div class="ml-auto flex items-center gap-2.5">
          <div class="flex items-center gap-1">
            <div class="w-3 h-3 rounded-[3px]" style="background:rgba(52,211,153,0.55)"></div>
            <span class="text-[10px] font-semibold text-slate-400 dark:text-zinc-600">Income</span>
          </div>
          <div class="flex items-center gap-1">
            <div class="w-3 h-3 rounded-[3px]" :style="{ background: legendColor(4) }"></div>
            <span class="text-[10px] font-semibold text-slate-400 dark:text-zinc-600">Expense</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ RECENT TRANSACTIONS ═══ -->
    <div class="flex items-center justify-between px-5 pt-5 pb-2">
      <h3 class="text-[13px] font-bold text-slate-500 dark:text-zinc-400">Recent</h3>
      <button @click="navigate('transactions')" class="flex items-center gap-0.5 text-[13px] font-bold text-violet-500 active:opacity-60">
        See all <ChevronRight :size="14" :stroke-width="2.5" />
      </button>
    </div>
    <div class="mx-4 rounded-2xl overflow-hidden bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-slate-200/60 dark:border-zinc-800/60 shadow-sm">
      <div v-if="recentTx.length === 0" class="flex flex-col items-center gap-2 py-10 text-center px-6">
        <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
          <ArrowLeftRight :size="20" class="text-zinc-600" :stroke-width="1.5" />
        </div>
        <p class="text-[13px] font-bold text-slate-400 dark:text-zinc-600">No transactions yet</p>
        <p class="text-[11px] text-slate-400 dark:text-zinc-700">Tap + to add your first one</p>
      </div>
      <div v-for="(tx, i) in recentTx.slice(0, 4)" :key="tx.id"
        :class="['flex items-center gap-3 px-4 py-3.5 active:bg-slate-50 dark:active:bg-zinc-800/80 transition-colors',
          i < Math.min(3, recentTx.length - 1) ? 'border-b border-slate-100 dark:border-zinc-800/60' : '']">
        <div class="w-11 h-11 rounded-2xl bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center flex-shrink-0">
          <component :is="tx.icon" :size="19" class="text-violet-500" :stroke-width="1.8" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[14px] font-bold text-slate-800 dark:text-zinc-100 truncate">{{ tx.name }}</p>
          <p class="text-[11px] text-slate-400 dark:text-zinc-500 font-medium mt-0.5">{{ tx.category }} · {{ tx.date }}</p>
        </div>
        <span :class="['text-[14px] font-bold flex-shrink-0', tx.amount > 0 ? 'text-emerald-500' : 'text-slate-700 dark:text-zinc-300']">
          {{ tx.amount > 0 ? '+' : '−' }}{{ sym }}{{ formatAmount(Math.abs(tx.amount)) }}
        </span>
      </div>
    </div>

    <div class="h-4"></div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import {
  Eye, EyeOff, TrendingUp, TrendingDown,
  CreditCard, ShoppingCart, Zap, BarChart2,
  ChevronRight, ArrowLeftRight, Wallet, Plus,
} from 'lucide-vue-next'
import { useNav }   from '../composables/useNav'
import {
  recentTx, quickAddOpen,
  totalBalance, totalIncome, totalExpenses,
  spendingByCategory, transactions,
  settings,
} from '../composables/useStore'

const { navigate } = useNav()

const currentHour = ref(new Date().getHours())
// Update greeting every minute so it stays accurate
let greetingTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  greetingTimer = setInterval(() => { currentHour.value = new Date().getHours() }, 60_000)
})
onUnmounted(() => { if (greetingTimer) clearInterval(greetingTimer) })

const timeOfDay = computed(() => {
  const h = currentHour.value
  if (h >= 5  && h < 12) return 'morning'
  if (h >= 12 && h < 17) return 'afternoon'
  if (h >= 17 && h < 21) return 'evening'
  return 'night'
})
const showBalance = ref(true)
const sym         = computed(() => settings.value.currencySymbol)
const accent      = computed(() => settings.value.accentColor)
const userName    = computed(() => settings.value.userName || 'You')
const userInitial = computed(() => (settings.value.userName || 'O').charAt(0).toUpperCase())

// ── Accent-driven style objects (avoids backticks in templates) ──
const discGlowBack  = computed(() => ({
  width:'230px', height:'44px', marginLeft:'-115px', marginTop:'-22px',
  background:`radial-gradient(ellipse, ${accent.value}24 0%, transparent 70%)`,
  filter:'blur(10px)',
}))
const discGlowFront = computed(() => ({
  width:'180px', height:'30px', marginLeft:'-90px', marginTop:'-8px',
  background:`radial-gradient(ellipse, ${accent.value}1A 0%, transparent 65%)`,
  filter:'blur(6px)',
}))
const orbOuterGlow  = computed(() => ({
  inset:'-20px',
  background:`radial-gradient(circle, ${accent.value}38 0%, transparent 70%)`,
  filter:'blur(14px)',
}))
const orbLensRing   = computed(() => ({
  inset:'-8px',
  border:`1px solid ${accent.value}4D`,
  boxShadow:`0 0 20px 6px ${accent.value}29`,
}))
const orbSphereShadow = computed(() => ({
  background:'radial-gradient(circle at 38% 32%,#1a1a2e 0%,#09090b 45%,#000 100%)',
  boxShadow:`inset 0 0 22px rgba(0,0,0,1), 0 0 0 1px ${accent.value}59`,
}))
const miniRing2   = computed(() => ({ inset:'4px',  border:`0.5px solid ${accent.value}4D` }))
const miniRing3   = computed(() => ({ inset:'9px',  border:`0.5px solid ${accent.value}26` }))
const miniOrbGlow = computed(() => ({
  inset:'10px',
  boxShadow:`0 0 16px 4px ${accent.value}80, 0 0 32px 8px ${accent.value}40`,
}))

function formatAmount(n: number): string {
  const abs = Math.abs(n)
  const s = abs >= 1_000_000
    ? (abs / 1_000_000).toFixed(2).replace(/\.?0+$/, '') + 'M'
    : abs.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  return s
}

// ── Starfield ─────────────────────────────────────────────
const starsCanvas = ref<HTMLCanvasElement | null>(null)
let animFrame = 0
let starsRO: ResizeObserver | null = null

interface Star { x: number; y: number; r: number; a: number; da: number; dx: number; dy: number }

function initStarfield(canvas: HTMLCanvasElement) {
  if (animFrame) cancelAnimationFrame(animFrame)
  const ctx = canvas.getContext('2d')!
  const dpr = window.devicePixelRatio || 1
  const W   = canvas.clientWidth  || canvas.parentElement?.clientWidth  || 340
  const H   = canvas.clientHeight || canvas.parentElement?.clientHeight || 260
  canvas.width  = W * dpr
  canvas.height = H * dpr
  ctx.scale(dpr, dpr)

  const stars: Star[] = Array.from({ length: 90 }, () => ({
    x:  Math.random() * W,
    y:  Math.random() * H,
    r:  Math.random() * 1.2 + 0.2,
    a:  Math.random(),
    da: (Math.random() * 0.004 + 0.001) * (Math.random() > 0.5 ? 1 : -1),
    dx: (Math.random() - 0.5) * 0.06,
    dy: (Math.random() - 0.5) * 0.06,
  }))

  function draw() {
    ctx.clearRect(0, 0, W, H)
    for (const s of stars) {
      s.a += s.da
      if (s.a > 1 || s.a < 0) s.da *= -1
      s.x = (s.x + s.dx + W) % W
      s.y = (s.y + s.dy + H) % H
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(200,190,255,${Math.max(0, Math.min(1, s.a))})`
      ctx.fill()
    }
    animFrame = requestAnimationFrame(draw)
  }
  draw()
}

onMounted(() => {
  // nextTick ensures Vue has flushed the DOM, then rAF waits for the browser
  // to complete its first layout paint so clientWidth/Height are non-zero.
  nextTick(() => {
    requestAnimationFrame(() => {
      const canvas = starsCanvas.value
      if (!canvas) return
      if (canvas.clientWidth > 0) {
        initStarfield(canvas)
        return
      }
      // Fallback: ResizeObserver fires once real dimensions arrive
      starsRO = new ResizeObserver((entries) => {
        for (const e of entries) {
          if (e.contentRect.width > 0) {
            starsRO!.disconnect()
            starsRO = null
            initStarfield(canvas)
            break
          }
        }
      })
      starsRO.observe(canvas)
    })
  })
})
onUnmounted(() => {
  cancelAnimationFrame(animFrame)
  starsRO?.disconnect()
})

// ── Spending data ─────────────────────────────────────────
const TOP_N = 3
const topSpend = computed(() => spendingByCategory.value.slice(0, TOP_N))
const otherTotal = computed(() =>
  spendingByCategory.value.slice(TOP_N).reduce((s, c) => s + c.total, 0)
)

const chartBars = computed(() => {
  const cats = spendingByCategory.value.slice(0, 7)
  if (cats.length === 0) return []
  const maxVal = cats[0].total
  return cats.map((c, i) => ({
    label:   c.category,
    pct:     maxVal > 0 ? Math.max(6, Math.round((c.total / maxVal) * 100)) : 0,
    opacity: i === 0 ? 1 : Math.max(0.3, 1 - i * 0.12),
  }))
})

// ── Heatmap colour helpers ─────────────────────────────────
function hexToRgb(hex: string): [number,number,number] {
  const h = hex.replace('#','')
  return [
    parseInt(h.slice(0,2),16),
    parseInt(h.slice(2,4),16),
    parseInt(h.slice(4,6),16),
  ]
}
function cellColor(intensity: number, isFuture: boolean, hasExpense: boolean, hasIncome: boolean): string {
  const dark = document.documentElement.classList.contains('dark')
  const acc = settings.value.accentColor
  const [r,g,b] = hexToRgb(acc)
  if (isFuture)        return dark ? 'rgba(39,39,42,0.4)' : 'rgba(226,232,240,0.5)'
  if (intensity === 0) return dark ? 'rgba(39,39,42,0.9)' : 'rgba(226,232,240,0.8)'
  const v = Math.min(1, intensity)
  if (hasIncome && hasExpense) return `rgba(${r},${g},${b},${(0.3 + v * 0.55).toFixed(2)})`
  if (hasIncome)               return `rgba(52,211,153,${(0.25 + v * 0.55).toFixed(2)})`
  return                              `rgba(${r},${g},${b},${(0.15 + v * 0.7).toFixed(2)})`
}
function legendColor(step: number): string {
  const acc = settings.value.accentColor
  const [r,g,b] = hexToRgb(acc)
  const alpha = [0.1, 0.25, 0.42, 0.6, 0.82][step - 1]
  return `rgba(${r},${g},${b},${alpha})`
}

// ── Activity Heatmap (15 weeks × 7 days) ──────────────────
const HEATMAP_WEEKS = 15
const heatmapData = computed(() => {
  type DayData = { income: number; expense: number; count: number }
  const map = new Map<string, DayData>()
  for (const tx of transactions.value) {
    const key = tx.isoDate.slice(0, 10)
    const d = map.get(key) || { income: 0, expense: 0, count: 0 }
    if (tx.amount > 0) d.income  += tx.amount
    else               d.expense += Math.abs(tx.amount)
    d.count++
    map.set(key, d)
  }
  const today = new Date(); today.setHours(0,0,0,0)
  const todayKey = today.toISOString().slice(0,10)
  const dow   = (today.getDay() + 6) % 7   // 0=Mon
  const anchor = new Date(today); anchor.setDate(anchor.getDate() - dow)
  const start  = new Date(anchor); start.setDate(start.getDate() - (HEATMAP_WEEKS - 1) * 7)
  let maxTotal = 0
  map.forEach(d => { const t = d.income + d.expense; if (t > maxTotal) maxTotal = t })
  const cells: Array<{ key:string; intensity:number; isToday:boolean; isFuture:boolean; count:number; hasExpense:boolean; hasIncome:boolean }> = []
  for (let w = 0; w < HEATMAP_WEEKS; w++) {
    for (let day = 0; day < 7; day++) {
      const cell = new Date(start); cell.setDate(cell.getDate() + w * 7 + day)
      const key     = cell.toISOString().slice(0,10)
      const data    = map.get(key)
      const total   = data ? data.income + data.expense : 0
      const isFuture = key > todayKey
      cells.push({
        key, isFuture,
        intensity:  isFuture ? 0 : maxTotal > 0 ? total / maxTotal : 0,
        isToday:    key === todayKey,
        count:      data ? data.count : 0,
        hasExpense: !!(data?.expense),
        hasIncome:  !!(data?.income),
      })
    }
  }
  return cells
})
const heatmapDayLabels = ['M','T','W','T','F','S','S']
const heatmapMonthLabels = computed(() => {
  const labels: Array<{ col:number; label:string }> = []
  const seen = new Set<string>()
  for (let w = 0; w < HEATMAP_WEEKS; w++) {
    const cell = heatmapData.value[w * 7]
    if (!cell) continue
    const month = cell.key.slice(0, 7)
    if (!seen.has(month)) {
      seen.add(month)
      const d = new Date(cell.key + 'T00:00:00')
      labels.push({ col: w, label: d.toLocaleDateString('en-US', { month:'short' }) })
    }
  }
  return labels
})

// ── Quick actions ─────────────────────────────────────────
const quickActions = [
  { icon: CreditCard,   label: 'Accounts', fn: () => navigate('cards')    },
  { icon: ShoppingCart, label: 'Grocery',  fn: () => navigate('grocery')  },
  { icon: Zap,          label: 'Bills',    fn: () => navigate('bills')    },
  { icon: BarChart2,    label: 'More',     fn: () => navigate('more')     },
]

// ── Orb insight (speech bubble on balance card) ───────────
const orbInsight = computed(() => {
  if (recentTx.value.length === 0)
    return 'Add your first transaction to get started.'
  const exp = totalExpenses.value, inc = totalIncome.value
  if (inc > 0 && exp / inc > 0.8)
    return `Heads up — you've spent ${Math.round(exp / inc * 100)}% of income.`
  const top = spendingByCategory.value[0]
  if (top)
    return `Top expense: ${top.category} · ${sym.value}${top.total.toLocaleString()}`
  return `Balance looks good. Keep tracking!`
})
</script>

<style>
/* ── Horizon orbit ring spin ─────────────────────────── */
@keyframes orb-h-spin-cw  { from{transform:rotate(0deg)}   to{transform:rotate(360deg)}  }
@keyframes orb-h-spin-ccw { from{transform:rotate(0deg)}   to{transform:rotate(-360deg)} }

/*
  Particles travel an elliptical orbit: rx≈72px, ry≈12px (matching ring-1).
  opacity fades at the back half (25%–75%) to sell depth.
*/
@keyframes orb-h-orbit-1 {
  0%   { transform:rotate(0deg)   translate(72px,0) rotate(0deg);    opacity:0.95; }
  24%  { opacity:0.9; }
  25%  { transform:rotate(90deg)  translate(72px,0) rotate(-90deg);  opacity:0.3;  }
  50%  { transform:rotate(180deg) translate(72px,0) rotate(-180deg); opacity:0.2;  }
  75%  { transform:rotate(270deg) translate(72px,0) rotate(-270deg); opacity:0.3;  }
  76%  { opacity:0.9; }
  100% { transform:rotate(360deg) translate(72px,0) rotate(-360deg); opacity:0.95; }
}
@keyframes orb-h-orbit-2 {
  0%   { transform:rotate(180deg) translate(90px,0) rotate(-180deg); opacity:0.7;  }
  24%  { opacity:0.25; }
  25%  { transform:rotate(270deg) translate(90px,0) rotate(-270deg); opacity:0.25; }
  50%  { transform:rotate(360deg) translate(90px,0) rotate(-360deg); opacity:0.7;  }
  74%  { opacity:0.7; }
  75%  { transform:rotate(450deg) translate(90px,0) rotate(-450deg); opacity:0.25; }
  100% { transform:rotate(540deg) translate(90px,0) rotate(-540deg); opacity:0.7;  }
}

/* SVG arcs rotate in place — spin-cw / spin-ccw applied as class */
.orb-h-ring-1 { animation:orb-h-spin-cw  14s linear infinite; transform-origin:72px 12px; }
.orb-h-ring-2 { animation:orb-h-spin-ccw 22s linear infinite; transform-origin:100px 18px; }
.orb-h-ring-3 { animation:orb-h-spin-cw  35s linear infinite; transform-origin:127px 26px; }
.orb-h-ring-4 { animation:orb-h-spin-ccw 50s linear infinite; transform-origin:155px 34px; }
.orb-h-p1     { animation:orb-h-orbit-1   4s  linear infinite; }
.orb-h-p2     { animation:orb-h-orbit-2   7s  linear infinite; }

/* ── Mini-orb in AI panel ───────────────────────────── */
@keyframes orb-spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
.orb-ring-1 { animation:orb-spin  8s linear infinite; }
.orb-ring-2 { animation:orb-spin 12s linear infinite reverse; }
.orb-ring-3 { animation:orb-spin 18s linear infinite; }
@keyframes orb-orbit-p1 {
  0%  {transform:rotate(0deg)   translateX(20px) rotate(0deg);}
  100%{transform:rotate(360deg) translateX(20px) rotate(-360deg);}
}
@keyframes orb-orbit-p2 {
  0%  {transform:rotate(140deg) translateX(26px) rotate(-140deg);}
  100%{transform:rotate(500deg) translateX(26px) rotate(-500deg);}
}
.orb-p1 { animation:orb-orbit-p1 4s   linear infinite; }
.orb-p2 { animation:orb-orbit-p2 6.5s linear infinite; }

@keyframes orb-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }
.orb-pulse { animation:orb-pulse 2s ease-in-out infinite; }

@keyframes dot-bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }
.orb-dot1 { animation:dot-bounce 1.2s ease-in-out infinite; }
.orb-dot2 { animation:dot-bounce 1.2s ease-in-out infinite 0.15s; }
.orb-dot3 { animation:dot-bounce 1.2s ease-in-out infinite 0.3s; }

.fade-enter-active,.fade-leave-active{transition:opacity .3s ease;}
.fade-enter-from,.fade-leave-to{opacity:0;}
</style>