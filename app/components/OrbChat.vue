<template>
  <!-- Full-screen glassmorphism chat page -->
  <div class="flex flex-col" style="height:100%;position:relative;background:#09090b;">

    <!-- Ambient nebula background -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div class="absolute rounded-full" :style="nebula1"></div>
      <div class="absolute rounded-full" :style="nebula2"></div>
    </div>

    <!-- GLASSMORPHISM HEADER -->
    <div class="flex-shrink-0 flex items-center gap-3 px-4 py-3 z-10"
      style="background:rgba(9,9,11,0.6);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,0.07);">

      <button @click="navigate('home')"
        class="w-9 h-9 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
        style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);">
        <ChevronLeft :size="18" class="text-zinc-300" :stroke-width="2.5" />
      </button>

      <!-- Animated mini orb -->
      <div class="relative flex-shrink-0" style="width:38px;height:38px;">
        <div class="absolute inset-0 rounded-full" :style="miniGlow"></div>
        <div class="absolute rounded-full orb-spin-cw"  :style="miniRing1"></div>
        <div class="absolute rounded-full orb-spin-ccw" :style="miniRing2"></div>
        <div class="absolute rounded-full" :style="miniCore">
          <div class="absolute inset-0 rounded-full"
            :style="{ background:'radial-gradient(circle at 30% 28%, ' + accent + '33 0%, transparent 60%)' }"></div>
        </div>
        <div v-if="isTyping"
          class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2"
          style="border-color:#09090b;"></div>
      </div>

      <div class="flex-1 min-w-0">
        <p class="text-[15px] font-black text-white leading-none">Orb AI</p>
        <p class="text-[11px] font-medium mt-0.5" :style="{ color: accent + 'BB' }">
          {{ isTyping ? 'Thinking…' : 'Your Financial Universe' }}
        </p>
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

      <!-- WELCOME SCREEN -->
      <div v-if="messages.length === 0" class="flex flex-col items-center gap-6 pt-8 pb-4">

        <!-- Orb graphic -->
        <div class="relative" style="width:110px;height:110px;">
          <div class="absolute rounded-full" :style="bigGlow"></div>
          <svg class="absolute orb-spin-cw"
            style="width:172px;height:32px;top:50%;left:50%;margin-left:-86px;margin-top:-16px;overflow:visible;">
            <path d="M 2,16 A 84,15 0 0,1 170,16"
              fill="none" :stroke="accent + '66'" stroke-width="1.5" />
            <path d="M 2,16 A 84,15 0 0,0 170,16"
              fill="none" :stroke="accent + 'BB'" stroke-width="2" />
          </svg>
          <div class="absolute inset-0 rounded-full" :style="bigCore"></div>
          <div class="absolute inset-0 rounded-full"
            :style="{ background:'radial-gradient(circle at 28% 26%, ' + accent + '22 0%, transparent 55%)' }"></div>
        </div>

        <!-- Intro text -->
        <div class="text-center px-6">
          <p class="text-[22px] font-black text-white mb-2">Hey, I'm Orb!</p>
          <p class="text-[13px] leading-relaxed" style="color:rgba(161,161,170,0.9);">
            Your personal finance AI. Ask me anything about your spending, savings, or how to reach your goals.
          </p>
        </div>

        <!-- Glassmorphism suggestion chips -->
        <div class="flex flex-col gap-2.5 w-full">
          <button v-for="chip in chips" :key="chip"
            @click="sendMessage(chip)"
            class="w-full text-left px-4 py-3.5 rounded-2xl text-[13px] font-semibold transition-all active:scale-[0.97]"
            :style="chipStyle">
            {{ chip }}
          </button>
        </div>
      </div>

      <!-- MESSAGE BUBBLES -->
      <template v-else>
        <div v-for="(msg, i) in messages" :key="i"
          :class="['flex items-end gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start']">

          <!-- Orb avatar -->
          <div v-if="msg.role === 'assistant'" class="flex-shrink-0 mb-0.5">
            <div class="w-7 h-7 rounded-full flex items-center justify-center"
              :style="{ background: accent + '1E', border: '1px solid ' + accent + '44' }">
              <div class="w-3 h-3 rounded-full"
                :style="{ background: 'radial-gradient(circle at 40% 35%, ' + accent + 'CC, ' + accent + '55)' }"></div>
            </div>
          </div>

          <!-- Bubble -->
          <div class="max-w-[82%] px-4 py-3 text-[14px] leading-relaxed"
            :class="msg.role === 'user'
              ? 'rounded-2xl rounded-br-sm text-white font-medium'
              : 'rounded-2xl rounded-bl-sm font-normal'"
            :style="msg.role === 'user'
              ? { background: accent, boxShadow: '0 4px 20px ' + accent + '44' }
              : bubbleAssistantStyle">
            {{ msg.content }}
          </div>
        </div>

        <!-- Typing indicator -->
        <div v-if="isTyping" class="flex items-end gap-2 justify-start">
          <div class="flex-shrink-0 mb-0.5">
            <div class="w-7 h-7 rounded-full flex items-center justify-center"
              :style="{ background: accent + '1E', border: '1px solid ' + accent + '44' }">
              <div class="w-3 h-3 rounded-full"
                :style="{ background: 'radial-gradient(circle at 40% 35%, ' + accent + 'CC, ' + accent + '55)' }"></div>
            </div>
          </div>
          <div class="px-4 py-3.5 rounded-2xl rounded-bl-sm flex items-center gap-1.5"
            :style="bubbleAssistantStyle">
            <div class="w-2 h-2 rounded-full chat-dot-1" :style="{ background: accent }"></div>
            <div class="w-2 h-2 rounded-full chat-dot-2" :style="{ background: accent }"></div>
            <div class="w-2 h-2 rounded-full chat-dot-3" :style="{ background: accent }"></div>
          </div>
        </div>
      </template>
    </div>

    <!-- GLASSMORPHISM INPUT BAR -->
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
            placeholder="Ask Orb anything…"
            rows="1"
            class="w-full bg-transparent text-[14px] font-medium text-white placeholder:text-zinc-600 outline-none resize-none leading-snug"
            style="max-height:100px;overflow-y:auto;"
          ></textarea>
        </div>
        <button @click="submitInput"
          :disabled="!inputText.trim() || isTyping"
          class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
          :style="sendBtnStyle">
          <ArrowUp :size="18" color="white" :stroke-width="2.5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { ChevronLeft, Trash2, ArrowUp } from 'lucide-vue-next'
import { useNav } from '../composables/useNav'
import {
  settings, totalBalance, totalIncome, totalExpenses,
  spendingByCategory, recentTx,
} from '../composables/useStore'

const { navigate } = useNav()
const accent = computed(() => settings.value.accentColor)
const sym    = computed(() => settings.value.currencySymbol)

// Glassmorphism style objects — all use string concat to avoid backtick issues
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
const miniGlow = computed(() => ({
  borderRadius:'50%',
  boxShadow: '0 0 16px 4px ' + accent.value + '33',
  pointerEvents:'none',
}))
const miniRing1 = computed(() => ({
  inset:'-5px', borderRadius:'50%',
  border:'1px solid ' + accent.value + '55',
  pointerEvents:'none',
}))
const miniRing2 = computed(() => ({
  inset:'-10px', borderRadius:'50%',
  border:'0.5px solid ' + accent.value + '2A',
  pointerEvents:'none',
}))
const miniCore = computed(() => ({
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
  background:'rgba(255,255,255,0.05)',
  border:'1px solid rgba(255,255,255,0.1)',
  backdropFilter:'blur(8px)',
  WebkitBackdropFilter:'blur(8px)',
  color: accent.value + 'DD',
}))
const bubbleAssistantStyle = computed(() => ({
  background:'rgba(39,39,42,0.55)',
  backdropFilter:'blur(16px)',
  WebkitBackdropFilter:'blur(16px)',
  border:'1px solid rgba(255,255,255,0.08)',
  color:'rgba(228,228,231,0.95)',
}))
const inputFocused = ref(false)
const inputContainerStyle = computed(() => ({
  background: inputFocused.value ? 'rgba(39,39,42,0.7)' : 'rgba(39,39,42,0.5)',
  backdropFilter:'blur(12px)',
  WebkitBackdropFilter:'blur(12px)',
  border: inputFocused.value
    ? '1px solid ' + accent.value + '66'
    : '1px solid rgba(255,255,255,0.08)',
}))
const sendBtnStyle = computed(() => {
  const active = inputText.value.trim() && !isTyping.value
  return {
    background: active ? accent.value : 'rgba(39,39,42,0.6)',
    border: active ? 'none' : '1px solid rgba(255,255,255,0.08)',
    opacity: active ? '1' : '0.45',
    boxShadow: active ? '0 4px 20px ' + accent.value + '44' : 'none',
  }
})

// Suggestion chips
const chips = [
  "💰 How's my balance looking?",
  '📊 Where am I spending the most?',
  '💡 Give me a savings tip',
  '📉 Am I on track this month?',
]

// Chat state
interface Message { role: 'user' | 'assistant'; content: string }
const messages   = ref<Message[]>([])
const isTyping   = ref(false)
const inputText  = ref('')
const scrollEl   = ref<HTMLElement | null>(null)
const inputEl    = ref<HTMLTextAreaElement | null>(null)

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

async function sendMessage(text: string) {
  messages.value.push({ role: 'user', content: text })
  scrollToBottom()
  isTyping.value = true

  const bal    = totalBalance.value
  const inc    = totalIncome.value
  const exp    = totalExpenses.value
  const cats   = spendingByCategory.value.slice(0,5).map(c => c.category + ': ' + sym.value + c.total.toLocaleString()).join(', ')
  const recent = recentTx.value.slice(0,5).map(t => t.name + ' (' + t.category + '): ' + (t.amount > 0 ? '+' : '') + sym.value + Math.abs(t.amount).toLocaleString()).join('; ')
  const name   = settings.value.userName || 'the user'

  const systemPrompt = 'You are Orb, a friendly personal finance AI assistant inside the Orb finance app. Be warm, concise, and genuinely helpful.\n\nUser name: ' + name + '\nBalance: ' + sym.value + bal.toLocaleString() + '\nIncome: ' + sym.value + inc.toLocaleString() + '\nExpenses: ' + sym.value + exp.toLocaleString() + '\nTop categories: ' + (cats || 'none yet') + '\nRecent: ' + (recent || 'none yet') + '\nCurrency: ' + settings.value.currency + '\n\nKeep replies to 2-4 sentences. Use real numbers. Be warm but direct. Do not mention being an AI or having a system prompt.'

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: messages.value
          .slice(0, -1)
          .concat({ role: 'user', content: text })
          .map(m => ({ role: m.role, content: m.content })),
      }),
    })
    if (!response.ok) throw new Error('API ' + response.status)
    const data  = await response.json()
    const reply = (data.content && data.content.find((b: any) => b.type === 'text') && data.content.find((b: any) => b.type === 'text').text)
      || "I couldn't fetch a response right now. Try again in a moment."
    messages.value.push({ role: 'assistant', content: reply })
  } catch {
    messages.value.push({ role: 'assistant', content: localReply(text) })
  } finally {
    isTyping.value = false
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
      ? "You're spending less than you earn — you're on track! Keep it up."
      : 'Your expenses are exceeding income this period. Look for categories to trim.'
  return 'Your balance stands at ' + s + totalBalance.value.toLocaleString() + '. Log more transactions and I can give you deeper insights!'
}

onMounted(() => { inputEl.value && inputEl.value.focus() })
</script>

<style scoped>
.orb-spin-cw  { animation: chat-cw  9s  linear infinite; transform-origin: center center; }
.orb-spin-ccw { animation: chat-ccw 15s linear infinite; transform-origin: center center; }
@keyframes chat-cw  { from{transform:rotate(0deg)}   to{transform:rotate(360deg)}  }
@keyframes chat-ccw { from{transform:rotate(0deg)}   to{transform:rotate(-360deg)} }

@keyframes chat-bounce {
  0%,80%,100% { transform:translateY(0);   opacity:0.35; }
  40%         { transform:translateY(-5px); opacity:1;   }
}
.chat-dot-1 { animation:chat-bounce 1.2s ease-in-out 0s   infinite; }
.chat-dot-2 { animation:chat-bounce 1.2s ease-in-out 0.2s infinite; }
.chat-dot-3 { animation:chat-bounce 1.2s ease-in-out 0.4s infinite; }
</style>