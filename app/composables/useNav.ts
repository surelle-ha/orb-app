// composables/useNav.ts
// Single source of truth for navigation.
// Import this in any page or component that needs to switch tabs.

import { ref, readonly } from 'vue'

export type PageId = 'home' | 'cards' | 'grocery' | 'transactions' | 'more'

const TAB_ORDER: PageId[] = ['home', 'cards', 'grocery', 'transactions', 'more']

const activePage     = ref<PageId>('home')
const transitionName = ref<'slide-left' | 'slide-right'>('slide-left')

export function useNav() {
  function navigate(to: PageId) {
    const from = TAB_ORDER.indexOf(activePage.value)
    const dest = TAB_ORDER.indexOf(to)
    transitionName.value = dest >= from ? 'slide-left' : 'slide-right'
    activePage.value = to
  }

  return {
    activePage:     readonly(activePage),
    transitionName: readonly(transitionName),
    navigate,
    TAB_ORDER,
  }
}