<template>
  <div class="flex flex-col" style="height:100%;position:relative;background:#09090b;">

    <!-- Ambient nebula -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div class="absolute rounded-full" :style="nebula1"></div>
      <div class="absolute rounded-full" :style="nebula2"></div>
    </div>

    <!-- HEADER -->
    <div class="flex-shrink-0 flex items-center gap-3 px-4 py-3 z-10"
      style="background:rgba(9,9,11,0.6);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,0.07);">

      <button @click="navigate('home')"
        class="w-9 h-9 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
        style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);">
        <ChevronLeft :size="18" class="text-zinc-300" :stroke-width="2.5" />
      </button>

      <!-- Mini orb -->
      <div class="relative flex-shrink-0" style="width:38px;height:38px;">
        <div class="absolute inset-0 rounded-full" :style="miniGlow"></div>
        <div class="absolute rounded-full orb-spin-cw"  :style="miniRing1"></div>
        <div class="absolute rounded-full orb-spin-ccw" :style="miniRing2"></div>
        <div class="absolute rounded-full" :style="miniCore">
          <div class="absolute inset-0 rounded-full"
            :style="{ background:'radial-gradient(circle at 30% 28%, ' + accent + '33 0%, transparent 60%)' }"></div>
        </div>
        <!-- Online dot -->
        <div class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
          :style="{ background: aiIsReady ? '#34d399' : aiLoading ? '#f59e0b' : '#52525b', borderColor:'#09090b' }"></div>
      </div>

      <div class="flex-1 min-w-0">
        <p class="text-[15px] font-black text-white leading-none">Orb AI</p>
        <p class="text-[11px] font-medium mt-0.5" :style="{ color: accent + 'BB' }">
          <span v-if="isTyping">Thinking…</span>
          <span v-else-if="aiLoading">Warming up…</span>
          <span v-else-if="aiIsReady">Private mode</span>
          <span v-else>Enable AI in Settings</span>
        </p>
      </div>

      <!-- Status badge -->
      <div v-if="aiIsReady || aiLoading" class="flex items-center gap-1 px-2 py-1 rounded-full flex-shrink-0"
        :style="{ background: accent + '18', border: `1px solid ${accent}33` }">
        <Cpu v-if="aiIsReady" :size="10" :style="{ color: accent }" :stroke-width="2" />
        <Loader v-else :size="10" :style="{ color: accent }" :stroke-width="2" class="animate-spin" />
        <span class="text-[9px] font-bold uppercase tracking-wide" :style="{ color: accent }">
          {{ aiIsReady ? 'Private' : 'Loading' }}
        </span>
      </div>

      <button @click="clearChat"
        class="w-9 h-9 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
        style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);">
        <Trash2 :size="15" class="text-zinc-500" :stroke-width="2" />
      </button>
    </div>

    <!-- MESSAGES AREA -->
    <div ref="scrollEl"
      class="flex-1 overflow-y-auto px-4 py-5 space-y-4 z-10"
      style="overscroll-behavior:contain;-webkit-overflow-scrolling:touch;">

      <!-- WELCOME -->
      <div v-if="messages.length === 0" class="flex flex-col items-center gap-6 pt-8 pb-4">

        <div class="relative" style="width:110px;height:110px;">
          <div class="absolute rounded-full" :style="bigGlow"></div>
          <svg class="absolute orb-spin-cw"
            style="width:172px;height:32px;top:50%;left:50%;margin-left:-86px;margin-top:-16px;overflow:visible;">
            <path d="M 2,16 A 84,15 0 0,1 170,16" fill="none" :stroke="accent + '66'" stroke-width="1.5" />
            <path d="M 2,16 A 84,15 0 0,0 170,16" fill="none" :stroke="accent + 'BB'" stroke-width="2" />
          </svg>
          <div class="absolute inset-0 rounded-full" :style="bigCore"></div>
          <div class="absolute inset-0 rounded-full"
            :style="{ background:'radial-gradient(circle at 28% 26%, ' + accent + '22 0%, transparent 55%)' }"></div>
        </div>

        <div class="text-center px-6">
          <p class="text-[22px] font-black text-white mb-2">Hey, I'm Orb!</p>
          <p class="text-[13px] leading-relaxed" style="color:rgba(161,161,170,0.9);">
            {{ aiIsReady
              ? 'Your private Orb AI. Everything runs on your phone — nothing is sent to any server.'
              : aiLoading
                ? 'Loading Orb AI on your device… this may take a moment the first time.'
                : 'Your personal finance assistant. Enable Orb AI in Settings for fully private offline responses.' }}
          </p>
          <!-- Mode indicator -->
          <div class="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full"
            :style="{ background: accent + '14', border: `1px solid ${accent}25` }">
            <Cpu v-if="aiIsReady" :size="11" :style="{ color: accent }" :stroke-width="2" />
            <Loader v-else-if="aiLoading" :size="11" :style="{ color: accent }" :stroke-width="2" class="animate-spin" />
            <span class="text-[10px] font-bold" :style="{ color: accent + 'CC' }">
              {{ aiIsReady ? 'Private mode' : aiLoading ? 'Warming up…' : 'Basic mode · Enable AI in Settings' }}
            </span>
          </div>
        </div>

        <!-- AI offline prompt to go to settings -->
        <div v-if="!aiIsReady && !aiLoading"
          class="w-full flex items-start gap-3 px-4 py-3.5 rounded-2xl"
          style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);">
          <span class="text-[18px] flex-shrink-0">⚡</span>
          <div class="flex-1 min-w-0">
            <p class="text-[12px] font-bold text-amber-400 mb-0.5">AI not enabled</p>
            <p class="text-[11px] text-zinc-500 leading-relaxed">Go to Settings → Orb AI to download the Orb AI. You can still get basic balance info below.</p>
          </div>
          <button @click="navigate('settings')"
            class="flex-shrink-0 text-[11px] font-bold text-amber-400 px-2.5 py-1.5 rounded-xl active:opacity-60"
            style="background:rgba(245,158,11,0.12);">
            Settings
          </button>
        </div>

        <!-- Loading progress pill -->
        <div v-if="aiLoading"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl"
          :style="{ background: accent + '0D', border: `1px solid ${accent}25` }">
          <div class="relative flex-shrink-0" style="width:28px;height:28px;">
            <svg class="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 28 28">
              <circle cx="14" cy="14" r="10" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="2"/>
              <circle cx="14" cy="14" r="10" fill="none" :stroke="accent" stroke-width="2" stroke-linecap="round"
                :stroke-dasharray="`${aiProgress * 0.628} 62.8`"
                style="transition:stroke-dasharray 0.7s ease;"/>
            </svg>
            <div class="absolute rounded-full" style="inset:6px;background:#09090b;"></div>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-[11px] font-bold leading-none mb-0.5" :style="{ color: accent }">Loading Orb AI…</p>
            <p class="text-[10px] text-zinc-600 truncate">{{ aiProgressMsg || `${aiProgress}%` }}</p>
          </div>
        </div>

        <div class="flex flex-col gap-2.5 w-full">
          <button v-for="chip in chips" :key="chip"
            @click="sendMessage(chip)"
            class="w-full text-left px-4 py-3.5 rounded-2xl text-[13px] font-semibold transition-all active:scale-[0.97]"
            :style="chipStyle">
            {{ chip }}
          </button>
        </div>
      </div>

      <!-- MESSAGES -->
      <template v-else>
        <div v-for="(msg, i) in messages" :key="i"
          :class="['flex items-end gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start']">

          <div v-if="msg.role === 'assistant'" class="flex-shrink-0 mb-0.5">
            <div class="w-7 h-7 rounded-full flex items-center justify-center"
              :style="{ background: accent + '1E', border: '1px solid ' + accent + '44' }">
              <div class="w-3 h-3 rounded-full"
                :style="{ background: 'radial-gradient(circle at 40% 35%, ' + accent + 'CC, ' + accent + '55)' }"></div>
            </div>
          </div>

          <div class="max-w-[82%] flex flex-col"
            :class="msg.role === 'user' ? 'items-end' : 'items-start'">
            <div class="px-4 py-3 text-[14px] leading-relaxed w-full"
              :class="msg.role === 'user'
                ? 'rounded-2xl rounded-br-sm text-white font-medium'
                : 'rounded-2xl rounded-bl-sm font-normal'"
              :style="msg.role === 'user'
                ? { background: accent, boxShadow: '0 4px 20px ' + accent + '44' }
                : bubbleAssistantStyle">
              <!-- Empty streaming bubble: show animated dots until tokens arrive -->
              <template v-if="msg.role === 'assistant' && msg.content === '' && msg.streaming">
                <div class="flex items-center gap-1.5 py-0.5">
                  <div class="w-2 h-2 rounded-full chat-dot-1" :style="{ background: accent }"></div>
                  <div class="w-2 h-2 rounded-full chat-dot-2" :style="{ background: accent }"></div>
                  <div class="w-2 h-2 rounded-full chat-dot-3" :style="{ background: accent }"></div>
                </div>
              </template>
              <!-- Content with blinking cursor while still streaming -->
              <template v-else>
                {{ msg.content }}<span v-if="msg.role === 'assistant' && msg.streaming"
                  class="inline-block w-0.5 h-3.5 ml-0.5 align-text-bottom rounded-full animate-pulse"
                  :style="{ background: accent }"></span>
              </template>
            </div>
            <span v-if="msg.ts" class="text-[9px] font-medium mt-1 px-1"
              style="color:rgba(113,113,122,0.7)">{{ msg.ts }}</span>
          </div>
        </div>

        <!-- Typing indicator (shows while waiting for AI to start / non-AI path) -->
        <div v-if="isTyping" class="flex items-end gap-2 justify-start">
          <div class="flex-shrink-0 mb-0.5">
            <div class="w-7 h-7 rounded-full flex items-center justify-center"
              :style="{ background: accent + '1E', border: '1px solid ' + accent + '44' }">
              <div class="w-3 h-3 rounded-full"
                :style="{ background: 'radial-gradient(circle at 40% 35%, ' + accent + 'CC, ' + accent + '55)' }"></div>
            </div>
          </div>
          <div class="px-4 py-3.5 rounded-2xl rounded-bl-sm flex flex-col gap-1"
            :style="bubbleAssistantStyle">
            <div class="flex items-center gap-1.5">
              <div class="w-2 h-2 rounded-full chat-dot-1" :style="{ background: accent }"></div>
              <div class="w-2 h-2 rounded-full chat-dot-2" :style="{ background: accent }"></div>
              <div class="w-2 h-2 rounded-full chat-dot-3" :style="{ background: accent }"></div>
            </div>
            <span class="text-[10px] font-medium" :style="{ color: accent + '99' }">{{ typingLabel }}</span>
          </div>
        </div>
      </template>
    </div>

    <!-- INPUT BAR -->
    <div class="flex-shrink-0 px-4 pb-4 pt-3 z-10"
      style="background:rgba(9,9,11,0.55);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-top:1px solid rgba(255,255,255,0.07);">
      <div class="flex items-end gap-2">
        <div class="flex-1 min-h-[46px] rounded-2xl px-4 py-3 transition-all" :style="inputContainerStyle">
          <textarea
            ref="inputEl"
            v-model="inputText"
            @focus="inputFocused = true"
            @blur="inputFocused = false"
            @keydown.enter.prevent="handleEnter"
            :placeholder="aiIsReady ? 'Ask Orb anything…' : aiLoading ? 'AI loading…' : 'AI not available — enable in Settings'"
            rows="1"
            class="w-full bg-transparent text-[14px] font-medium text-white placeholder:text-zinc-600 outline-none resize-none leading-snug"
            style="max-height:100px;overflow-y:auto;"
          ></textarea>
        </div>
        <button @click="submitInput"
          :disabled="!inputText.trim() || isTyping || (!aiIsReady && !aiLoading)"
          class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
          :style="sendBtnStyle">
          <ArrowUp :size="18" color="white" :stroke-width="2.5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { ChevronLeft, Trash2, ArrowUp, Cpu, Loader } from 'lucide-vue-next'
import { useNav } from '../composables/useNav'
import { settings, totalBalance, totalIncome, totalExpenses, spendingByCategory, recentTx } from '../composables/useStore'
import { useNativeLLM } from '../composables/useNativeLLM'

// ── AI: Orb AI (native on-device) ───────────────────────────────────────────
const { isReady: aiIsReady, isLoading: aiLoading, progress: aiProgress, progressMsg: aiProgressMsg, initModel, generate } = useNativeLLM()
const AI_ENABLED_KEY = 'orb_ai_enabled_v1'
const aiEnabled = () => {
  try { return localStorage.getItem(AI_ENABLED_KEY) !== 'false' } catch { return true }
}

const { navigate } = useNav()
const accent = computed(() => settings.value.accentColor)
const sym    = computed(() => settings.value.currencySymbol)



// Auto-warm model when chat opens if AI is enabled but not yet loaded
onMounted(() => {
  if (aiEnabled() && !aiIsReady.value && !aiLoading.value) {
    initModel().catch(() => {})
  }
  inputEl.value?.focus()
})

onUnmounted(() => { stopTypingCycle() })

// ── Style computeds ─────────────────────────────────────────
const nebula1 = computed(() => ({
  width:'320px', height:'320px', top:'-80px', left:'-60px',
  background: 'radial-gradient(circle, ' + accent.value + '1A 0%, transparent 65%)',
  filter: 'blur(40px)',
}))
const nebula2 = computed(() => ({
  width:'280px', height:'280px', bottom:'-40px', right:'-60px',
  background: 'radial-gradient(circle, ' + accent.value + '12 0%, transparent 60%)',
  filter: 'blur(50px)',
}))
const miniGlow  = computed(() => ({ borderRadius:'50%', boxShadow: '0 0 16px 4px ' + accent.value + '33', pointerEvents:'none' }))
const miniRing1 = computed(() => ({ inset:'-5px',  borderRadius:'50%', border:'1px solid ' + accent.value + '55', pointerEvents:'none' }))
const miniRing2 = computed(() => ({ inset:'-10px', borderRadius:'50%', border:'0.5px solid ' + accent.value + '2A', pointerEvents:'none' }))
const miniCore  = computed(() => ({
  inset:'1px', borderRadius:'50%',
  background:'radial-gradient(circle at 38% 32%,#1a1a2e 0%,#09090b 55%,#000 100%)',
  boxShadow:'inset 0 0 14px rgba(0,0,0,1), 0 0 0 1px ' + accent.value + '44',
}))
const bigGlow = computed(() => ({
  inset:'-20px', borderRadius:'50%',
  background:'radial-gradient(circle, ' + accent.value + '2A 0%, transparent 65%)',
  filter:'blur(16px)',
}))
const bigCore = computed(() => ({
  borderRadius:'50%',
  background:'radial-gradient(circle at 38% 32%,#1a1a2e 0%,#09090b 55%,#000 100%)',
  boxShadow:'inset 0 0 28px rgba(0,0,0,1), 0 0 0 1px ' + accent.value + '55, 0 0 36px ' + accent.value + '33',
}))
const chipStyle = computed(() => ({
  background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
  backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)', color: accent.value + 'DD',
}))
const bubbleAssistantStyle = computed(() => ({
  background:'rgba(39,39,42,0.55)', backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)',
  border:'1px solid rgba(255,255,255,0.08)', color:'rgba(228,228,231,0.95)',
}))
const inputFocused = ref(false)
const inputContainerStyle = computed(() => ({
  background: inputFocused.value ? 'rgba(39,39,42,0.7)' : 'rgba(39,39,42,0.5)',
  backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)',
  border: inputFocused.value ? '1px solid ' + accent.value + '66' : '1px solid rgba(255,255,255,0.08)',
}))
const sendBtnStyle = computed(() => {
  const active = inputText.value.trim() && !isTyping.value && (aiIsReady.value || aiLoading.value)
  return {
    background: active ? accent.value : 'rgba(39,39,42,0.6)',
    border: active ? 'none' : '1px solid rgba(255,255,255,0.08)',
    opacity: active ? '1' : '0.45',
    boxShadow: active ? '0 4px 20px ' + accent.value + '44' : 'none',
  }
})

const chips = [
  "💰 How's my balance looking?",
  '📊 Where am I spending the most?',
  '💡 Give me a savings tip',
  '📉 Am I on track this month?',
]

// ── Chat state ──────────────────────────────────────────────
interface Message { role: 'user' | 'assistant'; content: string; ts: string; streaming?: boolean }
const messages  = ref<Message[]>([])
const isTyping  = ref(false)
const inputText = ref('')
const scrollEl  = ref<HTMLElement | null>(null)
const inputEl   = ref<HTMLTextAreaElement | null>(null)

// Cycling label so the user knows it's working, not stuck
const typingPhase = ref(0)
const TYPING_LABELS = ['Thinking…', 'Reading your data…', 'Choosing words…', 'Almost there…']
const typingLabel = computed(() => TYPING_LABELS[typingPhase.value % TYPING_LABELS.length])
let typingTimer: ReturnType<typeof setInterval> | null = null
function startTypingCycle() {
  typingPhase.value = 0
  typingTimer = setInterval(() => { typingPhase.value++ }, 2200)
}
function stopTypingCycle() {
  if (typingTimer) { clearInterval(typingTimer); typingTimer = null }
}

function scrollToBottom() {
  nextTick(() => { if (scrollEl.value) scrollEl.value.scrollTop = scrollEl.value.scrollHeight })
}
function clearChat() { messages.value = [] }
function handleEnter(e: KeyboardEvent) { if (!e.shiftKey) submitInput() }

async function submitInput() {
  const text = inputText.value.trim()
  if (!text || isTyping.value) return
  inputText.value = ''
  await sendMessage(text)
}

// ── Build system prompt ─────────────────────────────────────
function buildSystemPrompt(): string {
  const bal    = totalBalance.value
  const inc    = totalIncome.value
  const exp    = totalExpenses.value
  const cats   = spendingByCategory.value.slice(0,5).map(c => c.category + ': ' + sym.value + c.total.toLocaleString()).join(', ')
  const recent = recentTx.value.slice(0,5).map(t => t.name + ' (' + t.category + '): ' + (t.amount > 0 ? '+' : '') + sym.value + Math.abs(t.amount).toLocaleString()).join('; ')
  const name   = settings.value.userName || 'the user'
  return [
    'You are Orb, a friendly personal finance AI assistant inside the Orb finance app.',
    'Be warm, concise (2–4 sentences), and genuinely helpful. Use real numbers.',
    'User: ' + name,
    'Balance: ' + sym.value + bal.toLocaleString(),
    'Income: ' + sym.value + inc.toLocaleString(),
    'Expenses: ' + sym.value + exp.toLocaleString(),
    'Top categories: ' + (cats || 'none yet'),
    'Recent: ' + (recent || 'none yet'),
    'Currency: ' + settings.value.currency,
    'Do not mention being an AI or a system prompt.',
  ].join('\n')
}

function nowTs(): string {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

async function sendMessage(text: string) {
  messages.value.push({ role: 'user', content: text, ts: nowTs() })
  scrollToBottom()
  isTyping.value = true
  startTypingCycle()

  const systemPrompt = buildSystemPrompt()
  const history = messages.value.slice(0, -1) as Array<{ role: 'user' | 'assistant'; content: string }>

  try {
    if (aiEnabled() && !aiIsReady.value && aiLoading.value) {
      messages.value.push({ role: 'assistant', content: `Orb AI is still loading (${aiProgressMsg.value}). Please wait a moment and try again.`, ts: nowTs() })
      return
    }

    if (aiIsReady.value) {
      // Keep typing dots until first token arrives
      // Then push the streaming bubble and hide dots
      let bubbleIdx = -1
      let gotFirstToken = false

      await generate(
        systemPrompt,
        text,
        history.slice(-4),
        (token: string) => {
          if (!gotFirstToken) {
            // First token: create the bubble and hide the typing indicator
            gotFirstToken = true
            isTyping.value = false
            stopTypingCycle()
            messages.value.push({ role: 'assistant', content: '', ts: nowTs(), streaming: true })
            bubbleIdx = messages.value.length - 1
          }
          if (bubbleIdx >= 0) {
            messages.value[bubbleIdx] = {
              ...messages.value[bubbleIdx],
              content: messages.value[bubbleIdx].content + token,
            }
            scrollToBottom()
          }
        }
      )

      // Mark streaming done
      if (bubbleIdx >= 0) {
        messages.value[bubbleIdx] = { ...messages.value[bubbleIdx], streaming: false }
      }

      // Fallback: if no tokens came back at all, show local reply
      if (!gotFirstToken) {
        messages.value.push({ role: 'assistant', content: localReply(text), ts: nowTs() })
      }

    } else {
      // Small delay so typing dots actually show
      await new Promise(r => setTimeout(r, 600))
      messages.value.push({ role: 'assistant', content: localReply(text), ts: nowTs() })
    }

  } catch {
    messages.value.push({ role: 'assistant', content: localReply(text), ts: nowTs() })
  } finally {
    isTyping.value = false
    stopTypingCycle()
    scrollToBottom()
  }
}

function localReply(q: string): string {
  const l   = q.toLowerCase()
  const s   = sym.value
  const top = spendingByCategory.value[0]
  if (l.includes('balance'))
    return 'Your balance is ' + s + totalBalance.value.toLocaleString() + ' — income ' + s + totalIncome.value.toLocaleString() + ' minus expenses ' + s + totalExpenses.value.toLocaleString() + '.'
  if (l.includes('spend') || l.includes('most'))
    return top ? 'Your top spending category is ' + top.category + ' at ' + s + top.total.toLocaleString() + '.' : 'No expenses logged yet.'
  if (l.includes('save') || l.includes('tip'))
    return 'Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings. Even small amounts compound fast.'
  if (l.includes('track') || l.includes('month'))
    return totalExpenses.value < totalIncome.value
      ? "You're spending less than you earn — you're on track!"
      : 'Your expenses exceed income this period. Look for categories to trim.'
  return 'Your balance is ' + s + totalBalance.value.toLocaleString() + '. Log more transactions for deeper insights!'
}


</script>

<style scoped>
.orb-spin-cw  { animation: chat-cw  9s  linear infinite; transform-origin: center center; }
.orb-spin-ccw { animation: chat-ccw 15s linear infinite; transform-origin: center center; }
@keyframes chat-cw  { from{transform:rotate(0deg)}   to{transform:rotate(360deg)}  }
@keyframes chat-ccw { from{transform:rotate(0deg)}   to{transform:rotate(-360deg)} }
@keyframes chat-bounce { 0%,80%,100%{transform:translateY(0);opacity:0.35} 40%{transform:translateY(-5px);opacity:1} }
.chat-dot-1 { animation:chat-bounce 1.2s ease-in-out 0s   infinite; }
.chat-dot-2 { animation:chat-bounce 1.2s ease-in-out 0.2s infinite; }
.chat-dot-3 { animation:chat-bounce 1.2s ease-in-out 0.4s infinite; }
</style>