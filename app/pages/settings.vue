<template>
  <div class="bg-slate-100 dark:bg-zinc-950 pb-28" style="touch-action:pan-y;">

    <!-- Header -->
    <div class="flex items-center gap-3 px-5 pt-6 pb-4">
      <button @click="navigate('more')"
        class="w-9 h-9 rounded-2xl bg-white/80 dark:bg-zinc-800/80 backdrop-blur border border-slate-200/60 dark:border-zinc-700/60 flex items-center justify-center active:scale-90 transition-transform">
        <ChevronLeft :size="18" class="text-slate-600 dark:text-zinc-300" :stroke-width="2.5" />
      </button>
      <h2 class="text-2xl font-black text-slate-900 dark:text-zinc-50 tracking-tight">Settings</h2>
    </div>

    <!-- ══════════════════════════════════════
         PROFILE
    ══════════════════════════════════════ -->
    <div class="px-5 pb-2">
      <h3 class="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Profile</h3>
    </div>
    <div class="mx-4 mb-4 rounded-2xl overflow-hidden bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-slate-200/60 dark:border-zinc-800/60 shadow-sm">

      <!-- Display / edit name row -->
      <div class="flex items-center gap-3 px-4 py-3.5">
        <!-- Avatar circle -->
        <div class="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-white font-black text-[16px]"
          :style="{ background: accent, boxShadow: `0 4px 12px ${accent}44` }">
          {{ userInitial }}
        </div>
        <div class="flex-1 min-w-0">
          <template v-if="!editingName">
            <p class="text-[14px] font-bold text-slate-800 dark:text-zinc-100">{{ settings.userName || 'Add your name' }}</p>
            <p class="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">Tap to change</p>
          </template>
          <template v-else>
            <input
              v-model="nameInput"
              ref="nameInputEl"
              type="text"
              placeholder="Your name…"
              maxlength="32"
              @keydown.enter="saveName"
              @keydown.escape="cancelName"
              class="w-full bg-transparent text-[15px] font-bold text-slate-800 dark:text-zinc-100 outline-none placeholder:text-slate-300 dark:placeholder:text-zinc-600"
            />
            <p class="text-[10px] text-slate-400 dark:text-zinc-600 mt-0.5">Enter to save · Esc to cancel</p>
          </template>
        </div>
        <template v-if="!editingName">
          <button @click="startEditName"
            class="w-9 h-9 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center active:scale-90 transition-transform flex-shrink-0">
            <Pencil :size="15" class="text-slate-500 dark:text-zinc-400" :stroke-width="2" />
          </button>
        </template>
        <template v-else>
          <div class="flex gap-1.5 flex-shrink-0">
            <button @click="saveName"
              class="w-9 h-9 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
              :style="{ background: `${accent}20` }">
              <Check :size="15" :style="{ color: accent }" :stroke-width="2.5" />
            </button>
            <button @click="cancelName"
              class="w-9 h-9 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center active:scale-90 transition-transform">
              <X :size="15" class="text-slate-500 dark:text-zinc-400" :stroke-width="2" />
            </button>
          </div>
        </template>
      </div>
    </div>

    <!-- ══════════════════════════════════════
         APPEARANCE
    ══════════════════════════════════════ -->
    <div class="px-5 pb-2">
      <h3 class="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Appearance</h3>
    </div>
    <div class="mx-4 mb-4 rounded-2xl overflow-hidden bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-slate-200/60 dark:border-zinc-800/60 shadow-sm">

      <!-- Accent Color row — same height as other rows, expands on tap -->
      <div class="border-b border-slate-100 dark:border-zinc-800/60">
        <!-- Collapsed row -->
        <button @click="accentOpen = !accentOpen"
          class="w-full flex items-center gap-3 px-4 py-3.5 active:bg-slate-50 dark:active:bg-zinc-800 transition-colors">
          <div class="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            :style="{ background: `${accent}18` }">
            <!-- Mini swatch grid preview (4 dots) -->
            <div class="grid grid-cols-2 gap-1 p-1.5">
              <div v-for="col in ACCENT_COLORS.slice(0,4)" :key="col.hex"
                class="w-2.5 h-2.5 rounded-full"
                :style="{ background: col.hex, opacity: col.hex === accent ? 1 : 0.4 }"></div>
            </div>
          </div>
          <div class="flex-1 text-left">
            <p class="text-[14px] font-bold text-slate-800 dark:text-zinc-100">Accent Color</p>
            <p class="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5 flex items-center gap-1.5">
              <span class="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                :style="{ background: accent }"></span>
              {{ currentAccentLabel }} · {{ accent }}
            </p>
          </div>
          <ChevronDown :size="17"
            :class="['text-slate-400 dark:text-zinc-500 transition-transform duration-200 flex-shrink-0',
              accentOpen ? 'rotate-180' : '']"
            :stroke-width="2" />
        </button>

        <!-- Expanded panel -->
        <Transition name="dropdown">
          <div v-if="accentOpen"
            class="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-zinc-800/60">

            <!-- 6-col swatch grid -->
            <div class="grid grid-cols-6 gap-3 mb-3">
              <button
                v-for="col in ACCENT_COLORS" :key="col.hex"
                @click="setAccent(col.hex)"
                class="flex flex-col items-center gap-1 active:scale-90 transition-transform"
                :title="col.label">
                <div class="w-10 h-10 rounded-full transition-all duration-200 flex items-center justify-center"
                  :style="{
                    background: col.hex,
                    boxShadow: accent === col.hex ? `0 0 0 2.5px white, 0 0 0 4.5px ${col.hex}` : 'none',
                    transform:  accent === col.hex ? 'scale(1.18)' : 'scale(1)',
                  }">
                  <svg v-if="accent === col.hex" viewBox="0 0 12 12" width="13" height="13">
                    <polyline points="2,6 5,9 10,3" fill="none" stroke="white"
                      stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <span :class="['text-[9px] font-bold truncate w-full text-center leading-none',
                  accent === col.hex
                    ? 'text-slate-700 dark:text-zinc-200'
                    : 'text-slate-400 dark:text-zinc-600']">
                  {{ col.label }}
                </span>
              </button>
            </div>

            <!-- Custom hex row -->
            <div class="flex items-center gap-2.5 pt-2.5 border-t border-slate-100 dark:border-zinc-800">
              <span class="text-[11px] font-bold text-slate-400 dark:text-zinc-500 flex-shrink-0">Custom</span>
              <div class="relative w-7 h-7 rounded-full overflow-hidden flex-shrink-0 cursor-pointer shadow-sm"
                :style="{ background: customHex }">
                <input type="color" v-model="customHex" @input="onCustomInput"
                  class="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
              </div>
              <input v-model="customHex" placeholder="#8b5cf6" maxlength="7"
                @input="onCustomInput"
                class="flex-1 bg-slate-50 dark:bg-zinc-800 rounded-xl px-3 py-2 text-[12px] font-mono text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 outline-none transition-colors placeholder:text-slate-300 dark:placeholder:text-zinc-600" />
              <button @click="applyCustom"
                class="text-[12px] font-bold px-3 py-2 rounded-xl transition-colors flex-shrink-0"
                :style="{ background: `${accent}20`, color: accent }">
                Apply
              </button>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Theme row — Light / Dark / System / Adaptive -->
      <div class="flex items-center gap-3 px-4 py-3.5">
        <div class="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
          :style="{ background: `${accent}18` }">
          <component :is="darkModeIcon" :size="19" :style="{ color: accent }" :stroke-width="1.8" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[14px] font-bold text-slate-800 dark:text-zinc-100">Theme</p>
          <p class="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">{{ darkModeLabel }}</p>
        </div>
      </div>
      <!-- 4-pill selector -->
      <div class="grid grid-cols-4 gap-1.5 px-4 pb-3.5">
        <button v-for="opt in darkModeOptions" :key="opt.value"
          @click="setMode(opt.value)"
          class="flex flex-col items-center gap-1.5 py-2.5 rounded-xl border text-[11px] font-bold transition-all active:scale-95"
          :style="mode === opt.value ? { background: `${accent}18`, borderColor: accent, color: accent } : {}"
          :class="mode !== opt.value ? 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400' : ''">
          <component :is="opt.icon" :size="14" :stroke-width="2" />
          {{ opt.label }}
        </button>
      </div>
    </div>

    <!-- ══════════════════════════════════════
         CURRENCY
    ══════════════════════════════════════ -->
    <div class="px-5 pb-2">
      <h3 class="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Currency</h3>
    </div>
    <div class="mx-4 mb-4 rounded-2xl bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-slate-200/60 dark:border-zinc-800/60 shadow-sm">
      <button @click="currencyOpen = !currencyOpen"
        class="w-full flex items-center gap-3 px-4 py-3.5 active:bg-slate-50 dark:active:bg-zinc-800 transition-colors rounded-2xl">
        <div class="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
          :style="{ background: `${accent}18` }">
          <span class="text-[18px] font-black" :style="{ color: accent }">{{ selectedCurrency.symbol }}</span>
        </div>
        <div class="flex-1 text-left">
          <p class="text-[14px] font-bold text-slate-800 dark:text-zinc-100">{{ selectedCurrency.label }}</p>
          <p class="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">{{ selectedCurrency.code }}</p>
        </div>
        <ChevronDown :size="17"
          :class="['text-slate-400 dark:text-zinc-500 transition-transform flex-shrink-0', currencyOpen ? 'rotate-180' : '']"
          :stroke-width="2" />
      </button>
      <Transition name="dropdown">
        <div v-if="currencyOpen" class="border-t border-slate-100 dark:border-zinc-800/60">
          <button v-for="(cur, i) in CURRENCIES" :key="cur.code"
            @click="setCurrency(cur)"
            :class="['w-full flex items-center gap-3 px-4 py-3 transition-colors active:bg-slate-50 dark:active:bg-zinc-800',
              i < CURRENCIES.length - 1 ? 'border-b border-slate-50 dark:border-zinc-800/40' : '']">
            <span class="w-8 text-center text-[16px] font-black text-slate-500 dark:text-zinc-400 flex-shrink-0">{{ cur.symbol }}</span>
            <div class="flex-1 text-left">
              <p class="text-[13px] font-bold"
                :style="{ color: settings.currency === cur.code ? accent : '' }"
                :class="settings.currency !== cur.code ? 'text-slate-700 dark:text-zinc-200' : ''">
                {{ cur.label }}
              </p>
              <p class="text-[10px] text-slate-400 dark:text-zinc-500">{{ cur.code }}</p>
            </div>
            <div v-if="settings.currency === cur.code"
              class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              :style="{ background: accent }">
              <Check :size="11" color="white" :stroke-width="3" />
            </div>
          </button>
        </div>
      </Transition>
    </div>

    <!-- ══════════════════════════════════════
         SECURITY
    ══════════════════════════════════════ -->
    <div class="px-5 pb-2">
      <h3 class="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Security</h3>
    </div>
    <div class="mx-4 mb-4 rounded-2xl overflow-hidden bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-slate-200/60 dark:border-zinc-800/60 shadow-sm">
      <div class="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-zinc-800/60">
        <div class="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
          :style="{ background: `${accent}18` }">
          <Lock :size="19" :style="{ color: accent }" :stroke-width="1.8" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[14px] font-bold text-slate-800 dark:text-zinc-100">Idle Screen Lock</p>
          <p class="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">Blur & lock after inactivity</p>
        </div>
        <button @click="toggleIdleLock"
          class="w-12 h-6 rounded-full transition-all relative flex-shrink-0"
          :style="{ background: settings.idleLockEnabled ? accent : '' }"
          :class="!settings.idleLockEnabled ? 'bg-slate-200 dark:bg-zinc-700' : ''">
          <div :class="['absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all',
            settings.idleLockEnabled ? 'left-6' : 'left-0.5']"></div>
        </button>
      </div>
      <Transition name="dropdown">
        <div v-if="settings.idleLockEnabled" class="px-4 py-4">
          <p class="text-[12px] font-bold text-slate-500 dark:text-zinc-400 mb-3">
            Lock after
            <span :style="{ color: accent }">
              {{ settings.idleLockMinutes }} min{{ settings.idleLockMinutes > 1 ? 's' : '' }}
            </span>
            of inactivity
          </p>
          <div class="grid grid-cols-4 gap-2">
            <button v-for="m in [1, 2, 5, 10, 15, 20, 30, 60]" :key="m"
              @click="setIdleMinutes(m)"
              class="py-2 rounded-xl text-[12px] font-bold border transition-all"
              :style="settings.idleLockMinutes === m
                ? { background: `${accent}18`, borderColor: accent, color: accent }
                : {}"
              :class="settings.idleLockMinutes !== m
                ? 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400'
                : ''">
              {{ m }}m
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <!-- ══════════════════════════════════════
         PREFERENCES
    ══════════════════════════════════════ -->
    <div class="px-5 pb-2">
      <h3 class="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Preferences</h3>
    </div>
    <div class="mx-4 mb-4 rounded-2xl overflow-hidden bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-slate-200/60 dark:border-zinc-800/60 shadow-sm">
      <div class="flex items-center gap-3 px-4 py-3.5">
        <div class="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
          :style="{ background: `${accent}18` }">
          <Smartphone :size="19" :style="{ color: accent }" :stroke-width="1.8" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[14px] font-bold text-slate-800 dark:text-zinc-100">Shake to Add</p>
          <p class="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">Shake phone to open transaction sheet</p>
        </div>
        <button @click="toggleShake"
          class="w-12 h-6 rounded-full transition-all relative flex-shrink-0"
          :style="{ background: settings.shakeToAdd ? accent : '' }"
          :class="!settings.shakeToAdd ? 'bg-slate-200 dark:bg-zinc-700' : ''">
          <div :class="['absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all',
            settings.shakeToAdd ? 'left-6' : 'left-0.5']"></div>
        </button>
      </div>
    </div>

    <!-- About -->
    <div class="mx-4 rounded-2xl bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-slate-200/60 dark:border-zinc-800/60 shadow-sm px-4 py-4 flex items-center gap-3">
      <div class="relative flex-shrink-0" style="width:40px;height:40px;">
        <div class="absolute inset-0 rounded-full" style="animation:settings-cw 8s linear infinite;"
          :style="{ border: `1px solid ${accent}80` }"></div>
        <div class="absolute rounded-full"
          style="inset:7px;background:radial-gradient(circle at 40% 35%,#18181b 0%,#09090b 60%,#000 100%);"
          :style="{ boxShadow: `0 0 10px 2px ${accent}66` }"></div>
      </div>
      <div>
        <p class="text-[14px] font-black text-slate-800 dark:text-zinc-100">Orb Finance</p>
        <p class="text-[11px] text-slate-400 dark:text-zinc-500">Your Financial Universe · v1.0</p>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { ChevronLeft, ChevronDown, Check, X, Pencil, Smartphone, Moon, Sun, Monitor, Clock, Lock } from 'lucide-vue-next'
import { settings, saveSettings, CURRENCIES, ACCENT_COLORS, orbLog } from '../composables/useStore'
import { useNav }  from '../composables/useNav'
import { useDark, type DarkMode } from '../composables/useDark'

const { navigate }           = useNav()
const { mode, setMode } = useDark()

const accent = computed(() => settings.value.accentColor)
const userInitial = computed(() => (settings.value.userName || 'O').charAt(0).toUpperCase())

// ── Theme options ─────────────────────────────────────────
const darkModeOptions: Array<{ value: DarkMode; label: string; icon: any }> = [
  { value: 'light',    label: 'Light',    icon: Sun     },
  { value: 'dark',     label: 'Dark',     icon: Moon    },
  { value: 'system',   label: 'System',   icon: Monitor },
  { value: 'adaptive', label: 'Adaptive', icon: Clock   },
]
const darkModeIcon = computed(() =>
  darkModeOptions.find(o => o.value === mode.value)?.icon ?? Moon
)
const darkModeLabel = computed(() => {
  if (mode.value === 'light')    return 'Always light'
  if (mode.value === 'dark')     return 'Always dark'
  if (mode.value === 'system')   return 'Follows device setting'
  if (mode.value === 'adaptive') return 'Light 6am–8pm · Dark 8pm–6am'
  return ''
})

// ── Name editing ──────────────────────────────────────────
const editingName  = ref(false)
const nameInput    = ref('')
const nameInputEl  = ref<HTMLInputElement | null>(null)

function startEditName() {
  nameInput.value  = settings.value.userName
  editingName.value = true
  nextTick(() => nameInputEl.value?.focus())
}
function saveName() {
  const n = nameInput.value.trim()
  if (n.length > 0) {
    saveSettings({ userName: n })
    orbLog(`Name changed to ${n}`)
  }
  editingName.value = false
}
function cancelName() {
  editingName.value = false
}

// ── Accent ────────────────────────────────────────────────
const accentOpen  = ref(false)
const customHex   = ref(settings.value.accentColor)

const currentAccentLabel = computed(() =>
  ACCENT_COLORS.find(c => c.hex === settings.value.accentColor)?.label ?? 'Custom'
)

function setAccent(hex: string) {
  customHex.value = hex
  saveSettings({ accentColor: hex })
}
function onCustomInput() {
  if (/^#[0-9a-fA-F]{6}$/.test(customHex.value)) saveSettings({ accentColor: customHex.value })
}
function applyCustom() {
  if (/^#[0-9a-fA-F]{6}$/.test(customHex.value)) {
    saveSettings({ accentColor: customHex.value })
    orbLog(`Custom accent: ${customHex.value}`)
  }
}

// ── Currency ──────────────────────────────────────────────
const currencyOpen    = ref(false)
const selectedCurrency = computed(() =>
  CURRENCIES.find(c => c.code === settings.value.currency) ?? CURRENCIES[0]
)
function setCurrency(cur: typeof CURRENCIES[0]) {
  saveSettings({ currency: cur.code, currencySymbol: cur.symbol })
  currencyOpen.value = false
}

// ── Security / Preferences ────────────────────────────────
function toggleIdleLock() { saveSettings({ idleLockEnabled: !settings.value.idleLockEnabled }) }
function setIdleMinutes(m: number) { saveSettings({ idleLockMinutes: m }) }
function toggleShake()    { saveSettings({ shakeToAdd: !settings.value.shakeToAdd }) }
</script>

<style scoped>
@keyframes settings-cw {
  from { transform: rotate(0deg) }
  to   { transform: rotate(360deg) }
}
.dropdown-enter-active, .dropdown-leave-active { transition: all 0.22s ease; overflow: hidden; }
.dropdown-enter-from, .dropdown-leave-to       { opacity: 0; max-height: 0; }
.dropdown-enter-to,   .dropdown-leave-from     { opacity: 1; max-height: 700px; }
</style>