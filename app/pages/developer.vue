<template>
  <div class="bg-slate-100 dark:bg-zinc-950 pb-28" style="touch-action:pan-y;">

    <!-- Header -->
    <div class="flex items-center gap-3 px-5 pt-6 pb-4">
      <button @click="navigate('more')"
        class="w-9 h-9 rounded-2xl bg-white/80 dark:bg-zinc-800/80 backdrop-blur border border-slate-200/60 dark:border-zinc-700/60 flex items-center justify-center active:scale-90 transition-transform">
        <ChevronLeft :size="18" class="text-slate-600 dark:text-zinc-300" :stroke-width="2.5" />
      </button>
      <div>
        <h2 class="text-2xl font-black text-rose-500 tracking-tight">Developer</h2>
        <p class="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">Internal tools &amp; diagnostics</p>
      </div>
    </div>

    <!-- Storage inspector -->
    <div class="px-5 pb-2">
      <h3 class="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Storage — tap to inspect</h3>
    </div>
    <div class="mx-4 mb-4 rounded-2xl overflow-hidden bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-slate-200/60 dark:border-zinc-800/60 shadow-sm">
      <button v-for="(row, i) in storageRows" :key="row.key"
        @click="openInspector(row)"
        :class="['w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-slate-50 dark:active:bg-zinc-800',
          i < storageRows.length - 1 ? 'border-b border-slate-100 dark:border-zinc-800/60' : '']">
        <div :class="['w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
            row.exists ? 'bg-violet-50 dark:bg-violet-950/40' : 'bg-slate-100 dark:bg-zinc-800']">
          <component :is="row.icon" :size="17"
            :class="row.exists ? 'text-violet-500' : 'text-slate-400 dark:text-zinc-600'"
            :stroke-width="1.8" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[13px] font-bold text-slate-700 dark:text-zinc-200">{{ row.label }}</p>
          <p class="text-[10px] text-slate-400 dark:text-zinc-500 font-mono mt-0.5 truncate">{{ row.key }}</p>
        </div>
        <div class="text-right flex-shrink-0">
          <p :class="['text-[12px] font-bold', row.exists ? 'text-violet-500' : 'text-slate-300 dark:text-zinc-700']">{{ row.size }}</p>
          <p class="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">{{ row.count }}</p>
        </div>
        <ChevronRight :size="14" class="text-slate-300 dark:text-zinc-700 flex-shrink-0" :stroke-width="2" />
      </button>
    </div>

    <!-- Actions -->
    <div class="px-5 pb-2">
      <h3 class="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Actions</h3>
    </div>
    <div class="mx-4 mb-4 rounded-2xl overflow-hidden bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-slate-200/60 dark:border-zinc-800/60 shadow-sm">
      <button @click="handleReset" :disabled="busy"
        class="w-full flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-zinc-800/60 active:bg-rose-50 dark:active:bg-rose-950/20 transition-colors disabled:opacity-50">
        <div class="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center flex-shrink-0">
          <RotateCcw :size="19" :class="['text-rose-500', busy ? 'animate-spin' : '']" :stroke-width="1.8" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[14px] font-bold text-rose-500">Reset All Data</p>
          <p class="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">{{ busy ? 'Wiping…' : 'Clears all data & shows onboarding' }}</p>
        </div>
        <ChevronRight :size="17" class="text-slate-300 dark:text-zinc-700" :stroke-width="2" />
      </button>
      <button @click="exportLogs"
        class="w-full flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-zinc-800/60 active:bg-slate-50 dark:active:bg-zinc-800 transition-colors">
        <div class="w-11 h-11 rounded-2xl bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center flex-shrink-0">
          <Download :size="19" class="text-violet-500" :stroke-width="1.8" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[14px] font-bold text-slate-800 dark:text-zinc-100">Export Logs</p>
          <p class="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">Copy log to clipboard</p>
        </div>
      </button>
      <button @click="appLogs.splice(0)"
        class="w-full flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-zinc-800/60 active:bg-slate-50 dark:active:bg-zinc-800 transition-colors">
        <div class="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
          <Trash2 :size="19" class="text-slate-500 dark:text-zinc-400" :stroke-width="1.8" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[14px] font-bold text-slate-800 dark:text-zinc-100">Clear Logs</p>
          <p class="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">{{ appLogs.length }} entries in memory</p>
        </div>
      </button>
      <!-- Idle lock test -->
      <button @click="testIdleLock"
        class="w-full flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-zinc-800/60 active:bg-amber-50 dark:active:bg-amber-950/20 transition-colors">
        <div class="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center flex-shrink-0">
          <Lock :size="19" class="text-amber-500" :stroke-width="1.8" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[14px] font-bold text-amber-500">Test Idle Lock</p>
          <p class="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
            {{ idleLockEnabled ? `Enabled · ${idleLockMinutes}min timeout` : 'Currently disabled in Settings' }}
          </p>
        </div>
        <ChevronRight :size="17" class="text-slate-300 dark:text-zinc-700" :stroke-width="2" />
      </button>
      <!-- Orbit Recap -->
      <button @click="showRecap = true"
        class="w-full flex items-center gap-3 px-4 py-3.5 active:bg-violet-50 dark:active:bg-violet-950/20 transition-colors">
        <div class="w-11 h-11 rounded-2xl bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center flex-shrink-0">
          <Sparkles :size="19" class="text-violet-500" :stroke-width="1.8" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[14px] font-bold text-violet-500">Orbit Recap</p>
          <p class="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">{{ new Date().getFullYear() }} annual financial review</p>
        </div>
        <ChevronRight :size="17" class="text-slate-300 dark:text-zinc-700" :stroke-width="2" />
      </button>
    </div>

  <!-- Orbit Recap overlay -->
  <OrbitRecap :visible="showRecap" @close="showRecap = false" />

    <!-- Live log -->
    <div class="px-5 pb-2 flex items-center justify-between">
      <h3 class="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Live Log</h3>
      <span class="text-[10px] font-bold text-violet-500">{{ appLogs.length }} entries</span>
    </div>
    <div class="mx-4 mb-4 rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden">
      <div class="max-h-56 overflow-y-auto p-3 space-y-1" style="-webkit-overflow-scrolling:touch;">
        <div v-if="appLogs.length === 0" class="text-zinc-600 text-[11px] font-mono py-2 text-center">No logs yet</div>
        <div v-for="(log, i) in appLogs" :key="i" class="flex items-start gap-2 text-[10px] font-mono leading-relaxed">
          <span class="text-zinc-600 flex-shrink-0">{{ log.ts }}</span>
          <span :class="['flex-shrink-0 uppercase font-bold w-8',
            log.level==='error'?'text-rose-400':log.level==='warn'?'text-amber-400':'text-emerald-400']">{{ log.level }}</span>
          <span class="text-zinc-300 break-all">{{ log.msg }}</span>
        </div>
      </div>
    </div>

    <div v-if="resetOutput.length" class="mx-4 mb-4 rounded-2xl bg-zinc-950 border border-zinc-800 p-3">
      <p v-for="line in resetOutput" :key="line" class="text-[10px] font-mono text-emerald-400 leading-relaxed">{{ line }}</p>
    </div>

  </div>

  <!-- ── Storage Inspector Modal ── -->
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="inspector"
        class="fixed inset-0 z-[200] flex flex-col"
        style="background:rgba(0,0,0,0.7);backdrop-filter:blur(12px)">

        <!-- Inspector header -->
        <div class="flex-shrink-0 flex items-center justify-between px-5 pt-6 pb-4"
          style="padding-top:calc(24px + env(safe-area-inset-top))">
          <div>
            <p class="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Storage Inspector</p>
            <h3 class="text-[18px] font-black text-white mt-0.5">{{ inspector.label }}</h3>
            <p class="text-[10px] font-mono text-zinc-500 mt-0.5">{{ inspector.key }} · {{ inspector.size }}</p>
          </div>
          <div class="flex items-center gap-2">
            <!-- View toggle -->
            <div class="flex bg-zinc-800 rounded-xl p-0.5 gap-0.5">
              <button v-for="v in (['pretty','raw'] as const)" :key="v"
                @click="inspectorView = v"
                :class="['text-[11px] font-bold px-2.5 py-1.5 rounded-[8px] transition-all',
                  inspectorView===v?'bg-zinc-700 text-zinc-100':'text-zinc-500']">
                {{ v }}
              </button>
            </div>
            <button @click="inspector = null" class="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center active:scale-90">
              <X :size="15" color="white" :stroke-width="2.5" />
            </button>
          </div>
        </div>

        <!-- Inspector content -->
        <div class="flex-1 overflow-y-auto px-4 pb-6" style="-webkit-overflow-scrolling:touch;">

          <!-- PRETTY view: structured cards per entry -->
          <div v-if="inspectorView === 'pretty'">

            <!-- Transactions pretty view -->
            <div v-if="inspector.parsedType === 'transactions'" class="space-y-2">
              <div v-if="!inspector.parsed?.length" class="text-zinc-500 text-[13px] font-mono text-center py-8">Empty</div>
              <div v-for="(tx, i) in inspector.parsed" :key="tx.id ?? i"
                class="rounded-2xl bg-zinc-900 border border-zinc-800 px-4 py-3">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">#{{ i+1 }}</span>
                  <span :class="['text-[14px] font-black', tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400']">
                    {{ tx.amount > 0 ? '+' : '' }}{{ tx.amount?.toLocaleString() }}
                  </span>
                </div>
                <p class="text-[14px] font-bold text-white mb-1">{{ tx.name }}</p>
                <div class="grid grid-cols-2 gap-x-4 gap-y-0.5">
                  <span class="text-[10px] text-zinc-500">Category</span><span class="text-[10px] text-zinc-300 font-mono">{{ tx.category }}</span>
                  <span class="text-[10px] text-zinc-500">Date</span><span class="text-[10px] text-zinc-300 font-mono">{{ tx.date }}</span>
                  <span class="text-[10px] text-zinc-500">Account ID</span><span class="text-[10px] text-zinc-300 font-mono">{{ tx.accountId ?? 'cash' }}</span>
                  <span class="text-[10px] text-zinc-500">ID</span><span class="text-[10px] text-zinc-300 font-mono truncate">{{ tx.id }}</span>
                </div>
              </div>
            </div>

            <!-- Accounts/cards pretty view -->
            <div v-else-if="inspector.parsedType === 'accounts'" class="space-y-2">
              <div v-if="!inspector.parsed?.length" class="text-zinc-500 text-[13px] font-mono text-center py-8">Empty</div>
              <div v-for="(acc, i) in inspector.parsed" :key="acc.id ?? i"
                class="rounded-2xl border border-zinc-800 overflow-hidden">
                <div class="px-4 py-2.5 flex items-center gap-3" :style="{ background: acc.gradient ?? '#1e1b4b' }">
                  <p class="text-[14px] font-black text-white flex-1">{{ acc.name ?? acc.bank }}</p>
                  <span class="text-[10px] font-bold text-white/50 uppercase">{{ acc.type }}</span>
                </div>
                <div class="bg-zinc-900 px-4 py-2.5 grid grid-cols-2 gap-x-4 gap-y-0.5">
                  <template v-for="(val, key) in acc" :key="key">
                    <span v-if="key !== 'gradient'" class="text-[10px] text-zinc-500 capitalize">{{ key }}</span>
                    <span v-if="key !== 'gradient'" class="text-[10px] text-zinc-300 font-mono truncate">{{ typeof val === 'boolean' ? (val ? 'yes' : 'no') : val }}</span>
                  </template>
                </div>
              </div>
            </div>

            <!-- Settings pretty view -->
            <div v-else-if="inspector.parsedType === 'settings'"
              class="rounded-2xl bg-zinc-900 border border-zinc-800 px-4 py-3 space-y-2">
              <div v-if="!inspector.parsed" class="text-zinc-500 text-[13px] font-mono text-center py-4">Empty</div>
              <div v-for="(val, key) in inspector.parsed" :key="String(key)"
                class="flex items-center justify-between py-1.5 border-b border-zinc-800/60 last:border-0">
                <span class="text-[12px] font-bold text-zinc-400 capitalize">{{ key }}</span>
                <span class="text-[12px] font-mono text-violet-300">{{ String(val) }}</span>
              </div>
            </div>

            <!-- Generic key-value pretty view -->
            <div v-else class="rounded-2xl bg-zinc-900 border border-zinc-800 px-4 py-3">
              <p class="text-[12px] font-mono text-zinc-300">{{ inspector.raw }}</p>
            </div>

          </div>

          <!-- RAW view: syntax-highlighted JSON -->
          <div v-else class="rounded-2xl bg-zinc-950 border border-zinc-800 p-3">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[10px] font-bold text-zinc-600 uppercase">Raw JSON</span>
              <button @click="copyRaw"
                class="flex items-center gap-1 text-[10px] font-bold text-violet-400 active:opacity-60">
                <Copy :size="11" :stroke-width="2" /> Copy
              </button>
            </div>
            <pre class="text-[10px] font-mono text-zinc-300 whitespace-pre-wrap break-all leading-relaxed overflow-x-auto">{{ inspector.prettyRaw }}</pre>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ChevronLeft, ChevronRight, RotateCcw, Download, Trash2, X,
  CreditCard, ArrowLeftRight, Settings2, Key, Copy, Lock, Sparkles,
} from 'lucide-vue-next'
import { useNav } from '../composables/useNav'
import { appLogs, orbLog, TXNS_KEY, CARDS_KEY, SETTINGS_KEY, BILLS_KEY, settings } from '../composables/useStore'
import { useDevControl } from '../composables/useDevControl'
import { triggerLockNow } from '../composables/useIdleLock'
import OrbitRecap from '../components/OrbitRecap.vue'

const { navigate } = useNav()
const { resetAll }  = useDevControl()

const busy        = ref(false)
const resetOutput = ref<string[]>([])
const showRecap   = ref(false)

const idleLockEnabled = computed(() => settings.value.idleLockEnabled)
const idleLockMinutes = computed(() => settings.value.idleLockMinutes)

function testIdleLock() {
  orbLog('Dev: idle lock triggered manually')
  triggerLockNow()
}

// ── Storage key metadata ───────────────────────────────────
const LS_KEY_META = [
  { key: TXNS_KEY,              label: 'Transactions',    icon: ArrowLeftRight, type: 'transactions' },
  { key: CARDS_KEY,             label: 'Accounts / Cards',icon: CreditCard,     type: 'accounts'     },
  { key: BILLS_KEY,             label: 'Bills',           icon: Lock,           type: 'settings'     },
  { key: SETTINGS_KEY,          label: 'Settings',        icon: Settings2,      type: 'settings'     },
  { key: 'orb_onboarding_done', label: 'Onboarding Flag', icon: Key,            type: 'flag'         },
]

function getStorageRow(meta: typeof LS_KEY_META[0]) {
  try {
    const raw = localStorage.getItem(meta.key)
    if (!raw) return { ...meta, exists: false, size: '0 B', count: 'empty', raw: null }
    const bytes = new Blob([raw]).size
    const sizeStr = bytes > 1024 ? `${(bytes/1024).toFixed(1)} KB` : `${bytes} B`
    let count = ''
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) count = `${parsed.length} items`
      else if (typeof parsed === 'object') count = `${Object.keys(parsed).length} keys`
      else count = String(parsed)
    } catch { count = raw.slice(0, 20) }
    return { ...meta, exists: true, size: sizeStr, count, raw }
  } catch { return { ...meta, exists: false, size: 'N/A', count: 'error', raw: null } }
}

const storageRows = computed(() => LS_KEY_META.map(getStorageRow))

// ── Inspector ──────────────────────────────────────────────
interface InspectorData {
  key: string; label: string; size: string
  raw: string | null; prettyRaw: string
  parsedType: string; parsed: any
}
const inspector     = ref<InspectorData | null>(null)
const inspectorView = ref<'pretty'|'raw'>('pretty')

function openInspector(row: ReturnType<typeof getStorageRow>) {
  if (!row.raw) {
    orbLog(`Inspector: ${row.label} is empty`)
    return
  }
  let parsed: any = null
  let parsedType  = row.type
  let prettyRaw   = row.raw
  try {
    parsed = JSON.parse(row.raw)
    prettyRaw = JSON.stringify(parsed, null, 2)
  } catch {
    parsed = row.raw
    parsedType = 'flag'
  }
  inspector.value = {
    key: row.key, label: row.label, size: row.size,
    raw: row.raw, prettyRaw,
    parsedType, parsed,
  }
  inspectorView.value = 'pretty'
  orbLog(`Inspector opened: ${row.label}`)
}

function copyRaw() {
  if (!inspector.value?.prettyRaw) return
  navigator.clipboard?.writeText(inspector.value.prettyRaw)
    .then(() => orbLog('Raw JSON copied to clipboard'))
    .catch(() => orbLog('Clipboard copy failed', 'warn'))
}

// ── Actions ────────────────────────────────────────────────
async function handleReset() {
  busy.value = true
  resetOutput.value = []
  try {
    resetOutput.value = await resetAll()
    setTimeout(() => window.location.reload(), 1500)
  } finally {
    busy.value = false
  }
}

function exportLogs() {
  const txt = appLogs.value.map(l => `[${l.ts}] ${l.level.toUpperCase()} ${l.msg}`).join('\n')
  navigator.clipboard?.writeText(txt)
    .then(() => orbLog('Logs copied to clipboard'))
    .catch(() => orbLog('Clipboard copy failed', 'warn'))
}
</script>

<style scoped>
.sheet-enter-active,.sheet-leave-active{transition:opacity .3s ease;}
.sheet-enter-from,.sheet-leave-to{opacity:0;}
</style>