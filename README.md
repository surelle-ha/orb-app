# Orb — Setup Guide

## File Structure

```
src/
├── App.vue                        ← Root: splash → onboarding → app
├── components/
│   ├── SplashScreen.vue           ← Blackhole boot animation
│   ├── OnboardingScreen.vue       ← 8-step finance questionnaire
│   └── MainApp.vue                ← Full dashboard (dark mode fixed)
└── db/
    └── useDatabase.ts             ← Capacitor SQLite composable
tailwind.config.js                 ← darkMode: 'class' (required)
```

---

## 1. Splash Screen
Animated blackhole with:
- Accretion disc rings spinning at different speeds
- Orbiting dust particles
- Gaussian glow blobs
- "ORB" wordmark in the event horizon
- Graceful fade-out after ~2.5s, then emits `@done`

No dependencies — pure CSS animations + SVG.

---

## 2. Onboarding (First Run)
8 questions covering: age, employment, monthly income, goals, challenges, savings rate, credit card habits, risk tolerance.

All answers are saved to SQLite via `setProfile(key, value)`.
After completion, `onboarding_done = 'true'` is stored so it never shows again.

The collected data is available via `getAllProfile()` — feed directly into your AI system prompt.

**AI context example:**
```ts
import { getAllProfile } from './db/useDatabase'

const profile = await getAllProfile()
const systemPrompt = `
  You are Orb, a personal finance AI.
  User profile:
  - Age range: ${profile.age_range}
  - Employment: ${profile.employment}
  - Monthly income: ₱${profile.monthly_income}
  - Goals: ${profile.financial_goals}
  - Biggest challenge: ${profile.biggest_challenge}
  - Savings rate: ${profile.savings_rate}%
  - Credit cards: ${profile.credit_cards}
  - Risk tolerance: ${profile.risk_tolerance}
`
```

---

## 3. Dark Mode Fix
Previous issue: `dark:` classes were applied to a scoped `<div>`, but Tailwind's
`darkMode: 'class'` checks `document.documentElement` (the `<html>` tag).

**Fix in MainApp.vue:**
```ts
watch(isDark, (dark) => {
  document.documentElement.classList.toggle('dark', dark)
}, { immediate: true })

onMounted(() => {
  // Respect OS preference on first load
  isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
})
```

**tailwind.config.js must have:**
```js
darkMode: 'class'   // NOT 'media'
```

---

## 4. SQLite Setup (Capacitor)

### Install
```bash
npm install @capacitor-community/sqlite
npx cap sync
```

### Android — MainActivity.kt
```kotlin
import com.getcapacitor.community.database.sqlite.CapacitorSQLitePlugin

class MainActivity : BridgeActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    registerPlugin(CapacitorSQLitePlugin::class.java)
  }
}
```

### iOS — AppDelegate.swift
No extra code needed — Capacitor handles it automatically.

### Usage
```ts
import {
  initDatabase,
  addTransaction,
  getTransactions,
  setBudget,
  addGoal,
} from './db/useDatabase'

// Call once at app start (App.vue does this)
await initDatabase()

// Add a transaction
await addTransaction({
  name: 'SM Supermarket',
  amount: -1240,
  category: 'Groceries',
})

// Fetch last 50
const txs = await getTransactions(50)
```

### Tables created automatically
| Table | Purpose |
|---|---|
| `user_profile` | Key-value store (onboarding answers, preferences) |
| `transactions` | Income & expense records |
| `budgets` | Per-category monthly caps |
| `goals` | Savings goals with progress |

---

## 5. Tailwind config

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Replace generated `tailwind.config.js` with the one in this package.
The critical line is `darkMode: 'class'`.