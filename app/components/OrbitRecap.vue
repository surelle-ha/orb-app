<template>
  <!-- Full-screen overlay -->
  <Teleport to="body">
    <Transition name="recap-slide">
      <div v-if="visible"
        class="fixed inset-0 z-[500] overflow-hidden"
        style="background:#09090b;">

        <!-- ─── SCROLL CONTAINER ─── -->
        <div ref="scrollEl"
          class="h-full overflow-y-scroll"
          style="-webkit-overflow-scrolling:touch;overscroll-behavior:contain;">

          <!-- ══ HERO SECTION ══ -->
          <div class="relative flex flex-col items-center justify-center overflow-hidden"
            style="min-height:100dvh;padding-top:env(safe-area-inset-top)">

            <!-- Starfield canvas -->
            <canvas ref="starsCanvas" class="absolute inset-0 pointer-events-none" style="width:100%;height:100%;"></canvas>

            <!-- Violet nebula -->
            <div class="absolute inset-0 pointer-events-none"
              style="background:radial-gradient(ellipse at 50% 40%,rgba(109,40,217,0.28) 0%,transparent 65%);"></div>

            <!-- Close -->
            <button @click="$emit('close')"
              class="absolute top-4 right-5 z-10 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-transform"
              :style="{ top:'calc(16px + env(safe-area-inset-top))' }">
              <X :size="17" class="text-white/70" :stroke-width="2" />
            </button>

            <!-- Orb -->
            <div class="relative mb-8" style="width:96px;height:96px;">
              <div class="absolute rounded-full orb-ring-a"
                style="inset:-14px;border:1px solid rgba(139,92,246,0.12);"></div>
              <div class="absolute rounded-full orb-ring-b"
                style="inset:-6px;border:1px solid rgba(139,92,246,0.25);"></div>
              <div class="absolute rounded-full"
                style="inset:0;background:radial-gradient(circle at 38% 32%,#1a1a2e 0%,#09090b 55%,#000 100%);box-shadow:inset 0 0 24px rgba(0,0,0,1),0 0 0 1px rgba(139,92,246,0.4),0 0 30px 8px rgba(139,92,246,0.18);"></div>
              <div class="absolute rounded-full"
                style="inset:0;background:radial-gradient(circle at 28% 26%,rgba(139,92,246,0.2) 0%,transparent 55%);"></div>
              <!-- Particles -->
              <div class="absolute rounded-full bg-violet-300 recap-p1"
                style="width:3px;height:3px;top:50%;left:50%;margin:-1.5px;opacity:0.9;"></div>
              <div class="absolute rounded-full bg-violet-400 recap-p2"
                style="width:2px;height:2px;top:50%;left:50%;margin:-1px;opacity:0.65;"></div>
            </div>

            <!-- Title -->
            <div class="text-center px-8 z-10">
              <p class="text-[11px] font-bold text-violet-400 uppercase tracking-[0.3em] mb-3">{{ year }} · Annual Review</p>
              <h1 class="text-[38px] font-black text-white leading-none tracking-tight mb-2">Orbit Recap</h1>
              <p class="text-[15px] text-zinc-400 font-medium leading-relaxed">
                Your complete financial universe<br>from {{ yearStart }} to {{ yearEnd }}
              </p>
            </div>

            <!-- Scroll cue -->
            <div class="absolute bottom-10 flex flex-col items-center gap-2 opacity-60">
              <p class="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Scroll to explore</p>
              <div class="recap-bounce">
                <ChevronDown :size="18" class="text-zinc-500" :stroke-width="2" />
              </div>
            </div>
          </div>

          <!-- ══ STAT CARDS STRIP ══ -->
          <div class="px-5 pt-10 pb-6">
            <p class="text-[11px] font-bold text-violet-400 uppercase tracking-widest mb-4">The Numbers</p>
            <div class="grid grid-cols-2 gap-3">
              <!-- Net -->
              <div class="col-span-2 rounded-3xl p-5 relative overflow-hidden"
                :style="{ background: netBalance >= 0
                  ? 'linear-gradient(135deg,#064e3b,#065f46)'
                  : 'linear-gradient(135deg,#450a0a,#7f1d1d)' }">
                <p class="text-[11px] font-bold uppercase tracking-widest mb-1"
                  :class="netBalance >= 0 ? 'text-emerald-300/60' : 'text-rose-300/60'">
                  Net Balance
                </p>
                <p class="text-[36px] font-black leading-none tracking-tight"
                  :class="netBalance >= 0 ? 'text-emerald-300' : 'text-rose-300'">
                  {{ netBalance >= 0 ? '+' : '' }}{{ sym }}{{ fmt(Math.abs(netBalance)) }}
                </p>
                <p class="text-[12px] mt-1.5"
                  :class="netBalance >= 0 ? 'text-emerald-400/70' : 'text-rose-400/70'">
                  {{ netBalance >= 0 ? '🎉 You saved more than you spent!' : '⚠ Spent more than earned this year' }}
                </p>
              </div>

              <div class="rounded-2xl p-4" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);">
                <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Income</p>
                <p class="text-[22px] font-black text-emerald-400 leading-none">{{ sym }}{{ fmt(totalInc) }}</p>
                <p class="text-[11px] text-zinc-600 mt-1">{{ incomeCount }} transaction{{ incomeCount !== 1 ? 's' : '' }}</p>
              </div>

              <div class="rounded-2xl p-4" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);">
                <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Spent</p>
                <p class="text-[22px] font-black text-rose-400 leading-none">{{ sym }}{{ fmt(totalExp) }}</p>
                <p class="text-[11px] text-zinc-600 mt-1">{{ expenseCount }} transaction{{ expenseCount !== 1 ? 's' : '' }}</p>
              </div>

              <div class="rounded-2xl p-4" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);">
                <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Transactions</p>
                <p class="text-[22px] font-black text-white leading-none">{{ allTxCount }}</p>
                <p class="text-[11px] text-zinc-600 mt-1">~{{ avgPerMonth }}/month</p>
              </div>

              <div class="rounded-2xl p-4" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);">
                <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Savings Rate</p>
                <p class="text-[22px] font-black leading-none"
                  :class="savingsRate >= 20 ? 'text-emerald-400' : savingsRate >= 10 ? 'text-amber-400' : 'text-rose-400'">
                  {{ savingsRate }}%
                </p>
                <p class="text-[11px] text-zinc-600 mt-1">{{ savingsRateLabel }}</p>
              </div>
            </div>
          </div>

          <!-- ══ MONTHLY ACTIVITY ══ -->
          <div class="px-5 pb-8">
            <p class="text-[11px] font-bold text-violet-400 uppercase tracking-widest mb-4">Monthly Activity</p>
            <div class="rounded-3xl p-5" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);">
              <!-- Bar chart -->
              <div class="flex items-end gap-1.5 mb-3" style="height:80px;">
                <div v-for="m in monthlyBars" :key="m.label"
                  class="flex-1 flex flex-col items-center justify-end gap-1 h-full">
                  <div class="w-full rounded-t-md overflow-hidden flex flex-col justify-end" style="height:64px;">
                    <!-- Income bar -->
                    <div v-if="m.incPct > 0" class="w-full rounded-t-sm bg-emerald-500/30 transition-all duration-700"
                      :style="{ height: m.incPct + '%' }"></div>
                    <!-- Expense bar -->
                    <div class="w-full rounded-t-sm bg-violet-500 transition-all duration-700"
                      :style="{ height: m.expPct + '%', marginTop: m.incPct > 0 ? '2px' : '0' }"></div>
                  </div>
                  <span class="text-[8px] font-bold text-zinc-600">{{ m.label }}</span>
                </div>
              </div>
              <!-- Legend -->
              <div class="flex items-center gap-4 pt-2 border-t border-white/5">
                <div class="flex items-center gap-1.5">
                  <div class="w-2.5 h-2.5 rounded-sm bg-emerald-500/50"></div>
                  <span class="text-[11px] font-semibold text-zinc-500">Income</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <div class="w-2.5 h-2.5 rounded-sm bg-violet-500"></div>
                  <span class="text-[11px] font-semibold text-zinc-500">Expenses</span>
                </div>
              </div>
            </div>
          </div>

          <!-- ══ TOP SPENDING CATEGORIES ══ -->
          <div v-if="topCategories.length" class="px-5 pb-8">
            <p class="text-[11px] font-bold text-violet-400 uppercase tracking-widest mb-4">Where You Spent Most</p>
            <div class="space-y-2.5">
              <div v-for="(cat, i) in topCategories" :key="cat.category"
                class="rounded-2xl p-4 flex items-center gap-4"
                style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);">
                <!-- Rank -->
                <div class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  :class="i === 0 ? 'bg-violet-500/20' : i === 1 ? 'bg-violet-500/12' : 'bg-white/5'">
                  <span class="text-[14px] font-black"
                    :class="i === 0 ? 'text-violet-300' : i === 1 ? 'text-violet-400/70' : 'text-zinc-500'">
                    #{{ i + 1 }}
                  </span>
                </div>
                <!-- Info + bar -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-1.5">
                    <p class="text-[13px] font-bold text-zinc-200">{{ cat.category }}</p>
                    <p class="text-[13px] font-bold text-zinc-300">{{ sym }}{{ fmt(cat.total) }}</p>
                  </div>
                  <div class="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div class="h-full rounded-full bg-violet-500 transition-all duration-700"
                      :style="{ width: cat.pct + '%', opacity: 1 - i * 0.12 }"></div>
                  </div>
                  <p class="text-[10px] text-zinc-600 mt-1">{{ cat.pct }}% of total spending</p>
                </div>
              </div>
            </div>
          </div>

          <!-- ══ BIGGEST TRANSACTIONS ══ -->
          <div class="px-5 pb-8">
            <p class="text-[11px] font-bold text-violet-400 uppercase tracking-widest mb-4">Biggest Moments</p>

            <!-- Biggest income -->
            <div v-if="biggestIncome" class="rounded-2xl p-4 mb-3"
              style="background:rgba(5,46,22,0.4);border:1px solid rgba(16,185,129,0.15);">
              <p class="text-[10px] font-bold text-emerald-400/60 uppercase tracking-widest mb-1">Largest Income</p>
              <p class="text-[18px] font-black text-emerald-300">+{{ sym }}{{ fmt(biggestIncome.amount) }}</p>
              <p class="text-[12px] text-zinc-500 mt-0.5">{{ biggestIncome.name }} · {{ biggestIncome.date }}</p>
            </div>

            <!-- Biggest expense -->
            <div v-if="biggestExpense" class="rounded-2xl p-4"
              style="background:rgba(69,10,10,0.4);border:1px solid rgba(239,68,68,0.15);">
              <p class="text-[10px] font-bold text-rose-400/60 uppercase tracking-widest mb-1">Largest Expense</p>
              <p class="text-[18px] font-black text-rose-300">−{{ sym }}{{ fmt(Math.abs(biggestExpense.amount)) }}</p>
              <p class="text-[12px] text-zinc-500 mt-0.5">{{ biggestExpense.name }} · {{ biggestExpense.date }}</p>
            </div>

            <!-- Best month -->
            <div v-if="bestMonth" class="rounded-2xl p-4 mt-3"
              style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);">
              <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Best Savings Month</p>
              <p class="text-[18px] font-black text-violet-300">{{ bestMonth.label }}</p>
              <p class="text-[12px] text-zinc-500 mt-0.5">Saved {{ sym }}{{ fmt(bestMonth.net) }} that month</p>
            </div>
          </div>

          <!-- ══ STREAK & HABITS ══ -->
          <div class="px-5 pb-8">
            <p class="text-[11px] font-bold text-violet-400 uppercase tracking-widest mb-4">Habits & Streaks</p>
            <div class="grid grid-cols-2 gap-3">
              <div class="rounded-2xl p-4"
                style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);">
                <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Active Months</p>
                <p class="text-[28px] font-black text-white leading-none">{{ activeMonths }}<span class="text-[14px] text-zinc-500">/12</span></p>
                <p class="text-[11px] text-zinc-600 mt-1">months with entries</p>
              </div>
              <div class="rounded-2xl p-4"
                style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);">
                <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Avg Daily</p>
                <p class="text-[28px] font-black text-white leading-none">{{ sym }}{{ fmt(avgDaily) }}</p>
                <p class="text-[11px] text-zinc-600 mt-1">spent per active day</p>
              </div>
              <div class="col-span-2 rounded-2xl p-4"
                style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);">
                <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Activity Heatmap</p>
                <!-- 12 month dots -->
                <div class="flex gap-1.5 flex-wrap">
                  <div v-for="m in heatmapMonths" :key="m.label"
                    class="flex flex-col items-center gap-1">
                    <div class="w-6 h-6 rounded-md transition-all"
                      :style="{ background: m.intensity > 0 ? `rgba(139,92,246,${0.15 + m.intensity * 0.75})` : 'rgba(255,255,255,0.05)' }"></div>
                    <span class="text-[8px] font-bold text-zinc-700">{{ m.label }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ══ ORB INSIGHT ══ -->
          <div class="px-5 pb-8">
            <p class="text-[11px] font-bold text-violet-400 uppercase tracking-widest mb-4">Orb Says</p>
            <div class="rounded-3xl p-6"
              style="background:linear-gradient(135deg,rgba(109,40,217,0.2),rgba(139,92,246,0.08));border:1px solid rgba(139,92,246,0.2);">
              <div class="flex items-start gap-4">
                <!-- Mini orb -->
                <div class="relative flex-shrink-0" style="width:44px;height:44px;">
                  <div class="absolute inset-0 rounded-full" style="border:1px solid rgba(139,92,246,0.5);animation:recap-spin 8s linear infinite;"></div>
                  <div class="absolute rounded-full" style="inset:8px;background:radial-gradient(circle at 38%32%,#18181b 0%,#000 100%);box-shadow:0 0 12px 3px rgba(139,92,246,0.4);"></div>
                </div>
                <div>
                  <p class="text-[13px] font-semibold text-zinc-300 leading-relaxed">{{ orbInsight }}</p>
                  <p class="text-[11px] text-violet-400/60 font-bold mt-3 uppercase tracking-wide">— Orb AI · {{ year }} Review</p>
                </div>
              </div>
            </div>
          </div>

          <!-- ══ FOOTER ══ -->
          <div class="flex flex-col items-center gap-4 pb-16 px-8"
            :style="{ paddingBottom:'calc(64px + env(safe-area-inset-bottom))' }">
            <div class="h-px w-full bg-white/5"></div>
            <p class="text-[12px] text-zinc-600 text-center font-medium">
              {{ year }} Orbit Recap · Generated by Orb Finance
            </p>
            <button @click="$emit('close')"
              class="flex items-center gap-2 px-8 py-4 rounded-2xl bg-violet-500 text-white text-[15px] font-black shadow-xl shadow-violet-500/30 active:scale-95 transition-all">
              Close Recap
            </button>
          </div>

        </div><!-- end scroll -->
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { X, ChevronDown } from 'lucide-vue-next'
import { transactions, settings } from '../composables/useStore'

const props = defineProps<{ visible: boolean }>()
defineEmits<{ close: [] }>()

const sym = computed(() => settings.value.currencySymbol)

// ── year scope ─────────────────────────────────────────
const year      = new Date().getFullYear()
const yearStart = `Jan 1, ${year}`
const yearEnd   = `Dec 31, ${year}`

const yearTxns = computed(() =>
  transactions.value.filter(t => new Date(t.isoDate).getFullYear() === year)
)

// ── top-level stats ────────────────────────────────────
const totalInc   = computed(() => yearTxns.value.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0))
const totalExp   = computed(() => yearTxns.value.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0))
const netBalance = computed(() => totalInc.value - totalExp.value)
const incomeCount  = computed(() => yearTxns.value.filter(t => t.amount > 0).length)
const expenseCount = computed(() => yearTxns.value.filter(t => t.amount < 0).length)
const allTxCount   = computed(() => yearTxns.value.length)
const avgPerMonth  = computed(() => Math.round(allTxCount.value / 12))

const savingsRate = computed(() => {
  if (!totalInc.value) return 0
  return Math.max(0, Math.round(((totalInc.value - totalExp.value) / totalInc.value) * 100))
})
const savingsRateLabel = computed(() => {
  const r = savingsRate.value
  if (r >= 30) return '🏆 Excellent discipline!'
  if (r >= 20) return '✅ Great — above the 20% rule'
  if (r >= 10) return '👍 Decent, aim for 20%'
  if (r >= 0)  return '⚠ Room to improve'
  return '🔴 Spending exceeded income'
})

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'k'
  return Math.round(n).toLocaleString()
}

// ── monthly breakdown ──────────────────────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

interface MonthStat { label: string; income: number; expense: number; net: number; count: number }

const monthlyStats = computed((): MonthStat[] =>
  MONTHS.map((label, idx) => {
    const mTx = yearTxns.value.filter(t => new Date(t.isoDate).getMonth() === idx)
    const income  = mTx.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)
    const expense = mTx.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)
    return { label, income, expense, net: income - expense, count: mTx.length }
  })
)

const monthlyBars = computed(() => {
  const maxVal = Math.max(...monthlyStats.value.map(m => Math.max(m.income, m.expense)), 1)
  return monthlyStats.value.map(m => ({
    label:  m.label,
    incPct: Math.round((m.income  / maxVal) * 100),
    expPct: Math.round((m.expense / maxVal) * 100),
  }))
})

// ── top categories ─────────────────────────────────────
const topCategories = computed(() => {
  const map = new Map<string, number>()
  yearTxns.value.filter(t => t.amount < 0).forEach(t => {
    map.set(t.category, (map.get(t.category) ?? 0) + Math.abs(t.amount))
  })
  const sorted = Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
  const grandTotal = sorted.reduce((s, [, v]) => s + v, 0) || 1
  return sorted.map(([category, total]) => ({
    category, total,
    pct: Math.round((total / grandTotal) * 100),
  }))
})

// ── biggest transactions ───────────────────────────────
const biggestIncome = computed(() => {
  const inc = yearTxns.value.filter(t => t.amount > 0)
  if (!inc.length) return null
  return inc.reduce((best, t) => t.amount > best.amount ? t : best, inc[0])
})
const biggestExpense = computed(() => {
  const exp = yearTxns.value.filter(t => t.amount < 0)
  if (!exp.length) return null
  return exp.reduce((worst, t) => t.amount < worst.amount ? t : worst, exp[0])
})

const bestMonth = computed(() => {
  const best = [...monthlyStats.value]
    .filter(m => m.net > 0)
    .sort((a, b) => b.net - a.net)[0]
  return best ?? null
})

// ── habits ─────────────────────────────────────────────
const activeMonths = computed(() => monthlyStats.value.filter(m => m.count > 0).length)

const avgDaily = computed(() => {
  const activeDays = new Set(yearTxns.value.filter(t => t.amount < 0).map(t => t.isoDate.slice(0, 10))).size
  if (!activeDays) return 0
  return totalExp.value / activeDays
})

const heatmapMonths = computed(() => {
  const maxCount = Math.max(...monthlyStats.value.map(m => m.count), 1)
  return monthlyStats.value.map(m => ({
    label: m.label.slice(0, 1),
    intensity: m.count / maxCount,
  }))
})

// ── Orb insight ────────────────────────────────────────
const orbInsight = computed(() => {
  if (!allTxCount.value)
    return `No transactions recorded for ${year} yet. Start logging your income and expenses — every entry shapes a clearer financial picture.`

  const top = topCategories.value[0]
  const sr  = savingsRate.value
  const best = bestMonth.value

  const parts: string[] = []

  if (netBalance.value > 0)
    parts.push(`You ended ${year} with a positive balance of ${sym.value}${fmt(netBalance.value)} — that's a real win.`)
  else
    parts.push(`${year} ended with a deficit of ${sym.value}${fmt(Math.abs(netBalance.value))}. Every year is a chance to reset.`)

  if (top)
    parts.push(`Your heaviest category was ${top.category} at ${sym.value}${fmt(top.total)} — worth reviewing if that aligns with your priorities.`)

  if (sr >= 20)
    parts.push(`A savings rate of ${sr}% puts you ahead of most — you're building real financial resilience.`)
  else if (sr > 0)
    parts.push(`Pushing your savings rate above 20% would significantly compound your wealth over time.`)

  if (best)
    parts.push(`Your best month was ${best.label}, where you saved ${sym.value}${fmt(best.net)}. Bottle that energy for next year.`)

  return parts.join(' ')
})

// ── starfield ──────────────────────────────────────────
const starsCanvas  = ref<HTMLCanvasElement | null>(null)
const scrollEl     = ref<HTMLElement | null>(null)
let animFrame = 0

interface Star { x: number; y: number; r: number; a: number; da: number; dx: number; dy: number }

function initStars() {
  const canvas = starsCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')!
  const W = canvas.offsetWidth, H = canvas.offsetHeight
  canvas.width = W; canvas.height = H

  const stars: Star[] = Array.from({ length: 120 }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    r: Math.random() * 1.3 + 0.2,
    a: Math.random(),
    da: (Math.random() * 0.003 + 0.001) * (Math.random() > 0.5 ? 1 : -1),
    dx: (Math.random() - 0.5) * 0.05,
    dy: (Math.random() - 0.5) * 0.05,
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
      ctx.fillStyle = `rgba(210,200,255,${Math.max(0, Math.min(1, s.a))})`
      ctx.fill()
    }
    animFrame = requestAnimationFrame(draw)
  }
  draw()
}

watch(() => props.visible, (v) => {
  if (v) {
    cancelAnimationFrame(animFrame)
    // let DOM render first
    setTimeout(initStars, 80)
    if (scrollEl.value) scrollEl.value.scrollTop = 0
  } else {
    cancelAnimationFrame(animFrame)
  }
})

onUnmounted(() => cancelAnimationFrame(animFrame))
</script>

<style scoped>
.recap-slide-enter-active { transition: transform 0.48s cubic-bezier(0.32, 1.1, 0.64, 1), opacity 0.4s ease; }
.recap-slide-leave-active { transition: transform 0.38s cubic-bezier(0.4, 0, 1, 1), opacity 0.3s ease; }
.recap-slide-enter-from   { transform: translateY(100%); opacity: 0; }
.recap-slide-leave-to     { transform: translateY(100%); opacity: 0; }

@keyframes recap-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes orb-ring-a { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes orb-ring-b { from{transform:rotate(360deg)} to{transform:rotate(0deg)} }
@keyframes recap-orbit-1 {
  0%  { transform:rotate(0deg)   translateX(58px) rotate(0deg);    }
  100%{ transform:rotate(360deg) translateX(58px) rotate(-360deg); }
}
@keyframes recap-orbit-2 {
  0%  { transform:rotate(180deg) translateX(74px) rotate(-180deg); }
  100%{ transform:rotate(540deg) translateX(74px) rotate(-540deg); }
}
@keyframes recap-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(6px)} }

.orb-ring-a { animation: orb-ring-a 14s linear infinite; }
.orb-ring-b { animation: orb-ring-b 22s linear infinite; }
.recap-p1   { animation: recap-orbit-1 4s  linear infinite; }
.recap-p2   { animation: recap-orbit-2 7s  linear infinite; }
.recap-bounce { animation: recap-bounce 1.8s ease-in-out infinite; }
</style>