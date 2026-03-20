<template>
  <div class="fixed inset-0 z-[9998] bg-zinc-950 flex flex-col font-nunito"
       :style="{ paddingTop:'env(safe-area-inset-top)', paddingBottom:'env(safe-area-inset-bottom)' }">

    <!-- Progress bar -->
    <div class="h-0.5 bg-zinc-800 mx-6 mt-4 rounded-full overflow-hidden">
      <div class="h-full bg-violet-500 rounded-full transition-all duration-500"
           :style="{ width: ((currentStep / steps.length) * 100) + '%' }"></div>
    </div>

    <!-- Step counter -->
    <div class="flex justify-between items-center px-6 pt-3 pb-1">
      <span class="text-[11px] font-semibold text-zinc-600 tracking-widest uppercase">
        {{ currentStep }} of {{ steps.length }}
      </span>
      <button v-if="currentStep < steps.length"
        @click="skipAll"
        class="text-[12px] font-semibold text-zinc-600 active:text-zinc-400 transition-colors">
        Skip
      </button>
    </div>

    <!-- Question area -->
    <div class="flex-1 flex flex-col justify-center px-6">
      <Transition :name="stepTransition" mode="out-in">
        <div :key="currentStep" class="flex flex-col gap-6">

          <!-- Icon -->
          <div class="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <component :is="currentStepData.icon" :size="24" class="text-violet-400" :stroke-width="1.8" />
          </div>

          <!-- Question -->
          <div>
            <p class="text-[13px] font-semibold text-zinc-500 mb-1.5 tracking-wide uppercase">{{ currentStepData.category }}</p>
            <h2 class="text-[26px] font-black text-white leading-tight tracking-tight">{{ currentStepData.question }}</h2>
            <p v-if="currentStepData.hint" class="text-[13px] text-zinc-600 font-medium mt-2">{{ currentStepData.hint }}</p>
          </div>

          <!-- Input area -->

          <!-- Single choice grid -->
          <div v-if="currentStepData.type === 'choice'" class="grid grid-cols-2 gap-2.5">
            <button v-for="opt in currentStepData.options" :key="opt.value"
              @click="selectChoice(opt.value)"
              :class="['flex flex-col items-start gap-2 p-4 rounded-2xl border transition-all active:scale-[0.97]',
                answers[currentStepData.key] === opt.value
                  ? 'bg-violet-500/10 border-violet-500 text-violet-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-300']">
              <span class="text-[22px]">{{ opt.emoji }}</span>
              <span class="text-[13px] font-bold">{{ opt.label }}</span>
            </button>
          </div>

          <!-- Multi choice -->
          <div v-else-if="currentStepData.type === 'multi'" class="flex flex-col gap-2">
            <button v-for="opt in currentStepData.options" :key="opt.value"
              @click="toggleMulti(currentStepData.key, opt.value)"
              :class="['flex items-center gap-3 p-4 rounded-2xl border transition-all active:scale-[0.98]',
                (answers[currentStepData.key] || []).includes(opt.value)
                  ? 'bg-violet-500/10 border-violet-500'
                  : 'bg-zinc-900 border-zinc-800']">
              <div :class="['w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all',
                (answers[currentStepData.key] || []).includes(opt.value)
                  ? 'bg-violet-500 border-violet-500'
                  : 'border-zinc-700']">
                <Check v-if="(answers[currentStepData.key] || []).includes(opt.value)"
                  :size="11" color="white" :stroke-width="3" />
              </div>
              <span :class="['text-[14px] font-semibold',
                (answers[currentStepData.key] || []).includes(opt.value) ? 'text-violet-300' : 'text-zinc-300']">
                {{ opt.label }}
              </span>
            </button>
          </div>

          <!-- Number input -->
          <div v-else-if="currentStepData.type === 'number'">
            <div :class="['flex items-center gap-3 bg-zinc-900 border rounded-2xl px-5 py-4 transition-colors',
              answers[currentStepData.key] ? 'border-violet-500' : 'border-zinc-800']">
              <span v-if="currentStepData.prefix" class="text-[20px] font-black text-violet-400">{{ currentStepData.prefix }}</span>
              <input
                v-model="answers[currentStepData.key]"
                :type="'number'"
                :placeholder="currentStepData.placeholder || '0'"
                class="flex-1 bg-transparent text-[32px] font-black text-white placeholder:text-zinc-700 outline-none tracking-tight"
              />
              <span v-if="currentStepData.suffix" class="text-[13px] font-semibold text-zinc-600">{{ currentStepData.suffix }}</span>
            </div>
          </div>

          <!-- Slider -->
          <div v-else-if="currentStepData.type === 'slider'" class="flex flex-col gap-4">
            <div class="flex justify-between items-center">
              <span class="text-[13px] font-semibold text-zinc-600">{{ currentStepData.labels[0] }}</span>
              <span class="text-[20px] font-black text-violet-300">{{ sliderLabel }}</span>
              <span class="text-[13px] font-semibold text-zinc-600">{{ currentStepData.labels[1] }}</span>
            </div>
            <input
              type="range"
              :min="currentStepData.min"
              :max="currentStepData.max"
              :step="currentStepData.step || 1"
              v-model="answers[currentStepData.key]"
              class="slider w-full accent-violet-500 h-1.5"
            />
            <div class="grid grid-cols-3 gap-1.5 mt-1">
              <button v-for="preset in currentStepData.presets" :key="preset.value"
                @click="answers[currentStepData.key] = preset.value"
                :class="['py-2 rounded-xl text-[12px] font-bold border transition-all',
                  answers[currentStepData.key] == preset.value
                    ? 'bg-violet-500/10 border-violet-500 text-violet-300'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-500']">
                {{ preset.label }}
              </button>
            </div>
          </div>

        </div>
      </Transition>
    </div>

    <!-- CTA -->
    <div class="px-6 pb-6">
      <button @click="next"
        :class="['w-full py-4 rounded-2xl text-[16px] font-black tracking-tight transition-all active:scale-[0.97]',
          canProceed
            ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30'
            : 'bg-zinc-900 text-zinc-700 border border-zinc-800']">
        {{ isLast ? '✦ Enter Orb' : 'Continue' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import {
  User, DollarSign, Target, TrendingUp, CreditCard,
  Briefcase, PiggyBank, ShieldCheck, Check, Sparkles,
  BarChart2, Clock
} from 'lucide-vue-next'

const emit = defineEmits(['done'])

// ─── STEPS ───────────────────────────────────────────────
const steps = [
  {
    key:      'age_range',
    type:     'choice',
    category: 'About You',
    icon:     User,
    question: 'How old are you?',
    hint:     'Helps personalize advice for your life stage.',
    options: [
      { value:'18-24', label:'18–24', emoji:'🌱' },
      { value:'25-34', label:'25–34', emoji:'🚀' },
      { value:'35-44', label:'35–44', emoji:'💼' },
      { value:'45+',   label:'45+',   emoji:'🏆' },
    ],
  },
  {
    key:      'employment',
    type:     'choice',
    category: 'Income',
    icon:     Briefcase,
    question: 'What\'s your work situation?',
    hint:     'We\'ll adjust cash flow tracking accordingly.',
    options: [
      { value:'employed',   label:'Employed',    emoji:'🏢' },
      { value:'freelance',  label:'Freelance',   emoji:'💻' },
      { value:'business',   label:'Business',    emoji:'🏪' },
      { value:'student',    label:'Student',     emoji:'🎓' },
    ],
  },
  {
    key:         'monthly_income',
    type:        'number',
    category:    'Income',
    icon:        DollarSign,
    question:    'Monthly income?',
    hint:        'Approximate is fine. Used to set realistic budget limits.',
    prefix:      '₱',
    placeholder: '0',
    suffix:      '/ month',
  },
  {
    key:      'financial_goals',
    type:     'multi',
    category: 'Goals',
    icon:     Target,
    question: 'What are you working toward?',
    hint:     'Pick all that apply.',
    options: [
      { value:'emergency_fund',  label:'Build emergency fund'    },
      { value:'debt_payoff',     label:'Pay off debt'            },
      { value:'savings',         label:'Grow savings'            },
      { value:'investment',      label:'Start investing'         },
      { value:'big_purchase',    label:'Save for big purchase'   },
      { value:'retirement',      label:'Plan for retirement'     },
    ],
  },
  {
    key:      'biggest_challenge',
    type:     'choice',
    category: 'Habits',
    icon:     BarChart2,
    question: 'Biggest money challenge?',
    options: [
      { value:'overspending',  label:'Overspending',     emoji:'💸' },
      { value:'no_budget',     label:'No budget plan',   emoji:'📊' },
      { value:'impulse',       label:'Impulse buying',   emoji:'🛒' },
      { value:'debt',          label:'Managing debt',    emoji:'📉' },
    ],
  },
  {
    key:      'savings_rate',
    type:     'slider',
    category: 'Savings',
    icon:     PiggyBank,
    question: 'Current savings rate?',
    hint:     'What % of income do you save each month?',
    min:      0,
    max:      60,
    step:     5,
    labels:   ['0%','60%'],
    presets:  [
      { value:0,  label:'None yet'  },
      { value:10, label:'10%'       },
      { value:20, label:'20%'       },
    ],
  },
  {
    key:      'credit_cards',
    type:     'choice',
    category: 'Debt',
    icon:     CreditCard,
    question: 'Do you carry credit card balances?',
    options: [
      { value:'never',      label:'Never carry', emoji:'✅' },
      { value:'sometimes',  label:'Sometimes',   emoji:'⚠️' },
      { value:'always',     label:'Always',      emoji:'🔴' },
      { value:'none',       label:'No cards',    emoji:'🚫' },
    ],
  },
  {
    key:      'risk_tolerance',
    type:     'choice',
    category: 'Investing',
    icon:     TrendingUp,
    question: 'Investment comfort level?',
    hint:     'Affects savings goal and tip recommendations.',
    options: [
      { value:'conservative', label:'Conservative', emoji:'🏦' },
      { value:'moderate',     label:'Moderate',     emoji:'⚖️' },
      { value:'aggressive',   label:'Aggressive',   emoji:'📈' },
      { value:'unsure',       label:'Not sure yet', emoji:'🤔' },
    ],
  },
]

// ─── STATE ────────────────────────────────────────────────
const currentStep  = ref(1)
const stepTransition = ref('step-forward')
const answers      = reactive({})

// Initialize slider defaults
steps.forEach(s => {
  if (s.type === 'slider') answers[s.key] = s.min
})

const currentStepData = computed(() => steps[currentStep.value - 1])
const isLast          = computed(() => currentStep.value === steps.length)

const canProceed = computed(() => {
  const key = currentStepData.value.key
  const val = answers[key]
  if (currentStepData.value.type === 'multi')   return (val?.length ?? 0) > 0
  if (currentStepData.value.type === 'number')  return val && parseFloat(val) >= 0
  if (currentStepData.value.type === 'slider')  return true
  return !!val
})

const sliderLabel = computed(() => {
  const s = currentStepData.value
  if (s.type !== 'slider') return ''
  const val = answers[s.key] ?? s.min
  return val + '%'
})

// ─── ACTIONS ─────────────────────────────────────────────
function selectChoice(value) {
  answers[currentStepData.value.key] = value
  // Auto-advance on choice select after brief pause
  setTimeout(() => { if (canProceed.value) next() }, 320)
}

function toggleMulti(key, value) {
  if (!answers[key]) answers[key] = []
  const idx = answers[key].indexOf(value)
  if (idx > -1) answers[key].splice(idx, 1)
  else          answers[key].push(value)
}

async function next() {
  if (!canProceed.value) return

  if (isLast.value) {
    await saveAndFinish()
    return
  }

  stepTransition.value = 'step-forward'
  currentStep.value++
}

async function skipAll() {
  await saveAndFinish()
}

async function saveAndFinish() {
  // Persist all answers to SQLite
  for (const [key, value] of Object.entries(answers)) {
    const str = Array.isArray(value) ? value.join(',') : String(value)
    await setProfile(key, str).catch(() => {})
  }
  await markOnboardingDone().catch(() => {})
  emit('done', answers)
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');

.font-nunito { font-family: 'Nunito', sans-serif; }

/* Step transition */
.step-forward-enter-active { transition: all 0.35s cubic-bezier(0.34,1.1,0.64,1); }
.step-forward-leave-active { transition: all 0.25s ease; }
.step-forward-enter-from   { opacity: 0; transform: translateX(40px); }
.step-forward-leave-to     { opacity: 0; transform: translateX(-30px); }

/* Slider track */
.slider {
  -webkit-appearance: none;
  appearance: none;
  background: #27272a;
  border-radius: 99px;
  cursor: pointer;
}
.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 22px; height: 22px;
  border-radius: 50%;
  background: #8b5cf6;
  box-shadow: 0 0 0 4px rgba(139,92,246,0.2);
  cursor: pointer;
}
</style>