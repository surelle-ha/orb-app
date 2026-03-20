<template>
  <div
    class="relative flex flex-col w-full max-w-[430px] min-h-dvh mx-auto overflow-hidden bg-slate-100 dark:bg-zinc-950 transition-colors duration-300"
    :style="{ paddingTop: 'env(safe-area-inset-top)' }"
  >

    <!-- ── Page area ── -->
    <div class="relative flex-1 overflow-hidden">
      <Transition :name="transitionName">
        <component :is="currentPage" :key="activePage" class="page" />
      </Transition>
    </div>

    <!-- ── Bottom Nav ── -->
    <nav
      class="flex-shrink-0 flex items-center bg-white/80 dark:bg-zinc-950/90 backdrop-blur-xl border-t border-slate-200/60 dark:border-zinc-800/60 z-50"
      :style="{ paddingBottom: 'calc(8px + env(safe-area-inset-bottom))' }"
    >
      <!-- Left two tabs -->
      <button
        v-for="tab in leftTabs"
        :key="tab.id"
        class="flex-1 flex flex-col items-center gap-1 pt-2 pb-1 active:scale-90 transition-transform"
        @click="navigate(tab.id)"
      >
        <div
          :class="['w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200',
            activePage === tab.id ? 'bg-violet-500 shadow-lg shadow-violet-500/30' : '']"
        >
          <component
            :is="tab.icon"
            :size="20"
            :color="activePage === tab.id ? 'white' : isDark ? '#52525b' : '#94a3b8'"
            :stroke-width="activePage === tab.id ? 2.2 : 1.8"
          />
        </div>
        <span
          :class="['text-[10px] font-bold transition-colors',
            activePage === tab.id ? 'text-violet-500' : 'text-slate-400 dark:text-zinc-600']"
        >
          {{ tab.label }}
        </span>
      </button>

      <!-- Center FAB -->
      <div class="flex-1 flex flex-col items-center pt-1 pb-1">
        <button
          @click="quickAddOpen = true"
          class="relative -mt-6 w-14 h-14 rounded-full bg-violet-500 flex items-center justify-center shadow-xl shadow-violet-500/40 active:scale-90 transition-all duration-200 border-4 border-white dark:border-zinc-950"
        >
          <Plus :size="26" color="white" :stroke-width="2.5" />
        </button>
        <span class="text-[10px] font-bold text-slate-400 dark:text-zinc-600 mt-1">Add</span>
      </div>

      <!-- Right two tabs -->
      <button
        v-for="tab in rightTabs"
        :key="tab.id"
        class="flex-1 flex flex-col items-center gap-1 pt-2 pb-1 active:scale-90 transition-transform"
        @click="navigate(tab.id)"
      >
        <div
          :class="['w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200',
            activePage === tab.id ? 'bg-violet-500 shadow-lg shadow-violet-500/30' : '']"
        >
          <component
            :is="tab.icon"
            :size="20"
            :color="activePage === tab.id ? 'white' : isDark ? '#52525b' : '#94a3b8'"
            :stroke-width="activePage === tab.id ? 2.2 : 1.8"
          />
        </div>
        <span
          :class="['text-[10px] font-bold transition-colors',
            activePage === tab.id ? 'text-violet-500' : 'text-slate-400 dark:text-zinc-600']"
        >
          {{ tab.label }}
        </span>
      </button>
    </nav>

  </div>

  <!-- Quick-add sheet lives outside the max-width box so overlay is full-screen -->
  <AddTransactionSheet />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Home, CreditCard, ShoppingCart, ArrowLeftRight, MoreHorizontal, Plus,
} from 'lucide-vue-next'

import { useNav }   from '../composables/useNav'
import { useDark }  from '../composables/useDark'
import { quickAddOpen } from '../composables/useStore'
import Index         from '../pages/index.vue'
import Cards        from '../pages/cards.vue'
import Grocery      from '../pages/grocery.vue'
import Transactions from '../pages/transaction.vue'
import More         from '../pages/more.vue'

const { activePage, transitionName, navigate } = useNav()
const { isDark } = useDark()

const PAGE_MAP = {
  home:         Index,
  cards:        Cards,
  grocery:      Grocery,
  transactions: Transactions,
  more:         More,
}

const currentPage = computed(() => PAGE_MAP[activePage.value])

const leftTabs = [
  { id: 'home',         icon: Home,           label: 'Home'    },
  { id: 'cards',        icon: CreditCard,     label: 'Cards'   },
]

const rightTabs = [
  { id: 'transactions', icon: ArrowLeftRight, label: 'History' },
  { id: 'more',         icon: MoreHorizontal, label: 'More'    },
]
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');

.font-nunito { font-family: 'Nunito', sans-serif; }

.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

.page {
  position: absolute;
  inset: 0;
  overflow-y: scroll;
  overflow-x: hidden;
  padding-bottom: 96px;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  overscroll-behavior-y: contain;
  will-change: transform;
  background: transparent;
}
.page::-webkit-scrollbar { display: none; }

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform .32s cubic-bezier(.35, 0, .15, 1),
              opacity   .32s cubic-bezier(.35, 0, .15, 1);
}
.slide-left-enter-from  { transform: translateX(100%);  opacity: 0; }
.slide-left-leave-to    { transform: translateX(-25%);  opacity: 0; }
.slide-right-enter-from { transform: translateX(-100%); opacity: 0; }
.slide-right-leave-to   { transform: translateX(25%);   opacity: 0; }
</style>