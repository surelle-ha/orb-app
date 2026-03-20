// composables/useStore.ts
// All reactive app data lives here — import in any page that needs it.

import { ref, computed } from 'vue'
import {
  ShoppingBag, Car, Banknote, Utensils, Zap,
  Smartphone, Gamepad2, Wifi, Building2, Tv2,
  Plane, Shield, Laptop, BarChart2,
} from 'lucide-vue-next'

// ─── TRANSACTIONS ─────────────────────────────────────────
export const recentTx = ref([
  { id:1, icon:ShoppingBag, name:'SM Supermarket', date:'Today',  amount:-1240, category:'Groceries' },
  { id:2, icon:Car,         name:'Grab',           date:'Today',  amount:-180,  category:'Transport' },
  { id:3, icon:Banknote,    name:'Salary Deposit', date:'Mar 15', amount:45000, category:'Income'    },
  { id:4, icon:Utensils,    name:'Jollibee',       date:'Mar 14', amount:-320,  category:'Food'      },
  { id:5, icon:Zap,         name:'Meralco Bill',   date:'Mar 13', amount:-2100, category:'Utilities' },
  { id:6, icon:Smartphone,  name:'Globe Postpaid', date:'Mar 12', amount:-999,  category:'Utilities' },
  { id:7, icon:Gamepad2,    name:'Steam Purchase', date:'Mar 10', amount:-750,  category:'Leisure'   },
])

export function addTx(tx: {
  name: string; amount: number; category: string; icon?: any
}) {
  recentTx.value.unshift({
    id:       Date.now(),
    icon:     tx.icon ?? (tx.amount > 0 ? Banknote : ShoppingBag),
    name:     tx.name,
    date:     'Just now',
    amount:   tx.amount,
    category: tx.category,
  })
}

// ─── CREDIT CARDS ─────────────────────────────────────────
export const activeCard = ref(0)

export const creditCards = [
  { id:1, bank:'BDO',       network:'VISA', number:'•••• •••• •••• 4812', holder:'Harold S.', expiry:'09/27', gradient:'linear-gradient(135deg,#1e1b4b,#3730a3)' },
  { id:2, bank:'BPI',       network:'MC',   number:'•••• •••• •••• 3371', holder:'Harold S.', expiry:'12/26', gradient:'linear-gradient(135deg,#1a1a2e,#16213e)' },
  { id:3, bank:'Metrobank', network:'VISA', number:'•••• •••• •••• 9204', holder:'Harold S.', expiry:'06/28', gradient:'linear-gradient(135deg,#0f2027,#203a43)' },
]

export const cardDetails: Record<number, { limit: number; outstanding: number; due: string }> = {
  0: { limit:50000,  outstanding:18500, due:'Apr 5'  },
  1: { limit:80000,  outstanding:32000, due:'Apr 10' },
  2: { limit:120000, outstanding:5400,  due:'Apr 18' },
}

export const selectedCard = computed(() => ({
  ...creditCards[activeCard.value],
  ...cardDetails[activeCard.value],
}))

// ─── GROCERY ──────────────────────────────────────────────
export const activeList = ref('Weekly Essentials')

export const groceryLists = ref([
  {
    name: 'Weekly Essentials',
    items: [
      { name:'Rice (5kg)',       qty:'1 bag',    price:280, checked:false },
      { name:'Eggs (1 tray)',    qty:'1 tray',   price:180, checked:true  },
      { name:'Chicken breast',   qty:'1 kg',     price:220, checked:false },
      { name:'Mixed Vegetables', qty:'assorted', price:150, checked:false },
      { name:'Fresh Milk 1L',    qty:'2 pcs',    price:160, checked:true  },
      { name:'Cooking Oil',      qty:'1L',       price:85,  checked:false },
    ],
  },
  {
    name: 'Monthly Stock',
    items: [
      { name:'Detergent',  qty:'2 packs', price:240, checked:false },
      { name:'Shampoo',    qty:'1 btl',   price:180, checked:false },
      { name:'Toothpaste', qty:'3 tubes', price:120, checked:false },
    ],
  },
])

export const currentGroceryItems = computed(() =>
  groceryLists.value.find(l => l.name === activeList.value)?.items ?? []
)

export const groceryTotal = computed(() =>
  currentGroceryItems.value.reduce((s, i) => s + i.price, 0)
)

// ─── BILLS ────────────────────────────────────────────────
export const bills = ref([
  { icon:Zap,       name:'Meralco',       due:'Mar 25', amount:2100,  status:'pending' },
  { icon:Smartphone,name:'Globe Postpaid',due:'Mar 28', amount:999,   status:'pending' },
  { icon:Wifi,      name:'Converge',      due:'Apr 1',  amount:1500,  status:'pending' },
  { icon:Building2, name:'Rent',          due:'Apr 5',  amount:14000, status:'paid'    },
  { icon:Tv2,       name:'Netflix',       due:'Mar 12', amount:549,   status:'overdue' },
])

// ─── GOALS ────────────────────────────────────────────────
export const goals = ref([
  { icon:Plane,    label:'Japan',     pct:68, saved:34000, target:50000  },
  { icon:Shield,   label:'Emergency', pct:45, saved:45000, target:100000 },
  { icon:Laptop,   label:'Laptop',    pct:82, saved:41000, target:50000  },
  { icon:BarChart2,label:'Invest',    pct:30, saved:15000, target:50000  },
])

// ─── QUICK ADD SHEET ──────────────────────────────────────
export const quickAddOpen = ref(false)