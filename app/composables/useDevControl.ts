/**
 * useDevControl.ts
 * ─────────────────────────────────────────────────────────
 * Dev/testing helper to wipe all local data.
 *
 * NOTE: We check !import.meta.env.PROD instead of import.meta.env.DEV
 * so this also shows on a device when running a non-production build
 * (e.g. `cap run android` with a dev build). Pure production builds
 * (import.meta.env.PROD === true) will still hide it.
 *
 * To force-hide in all builds, flip IS_DEV to: false
 */

import { ref } from 'vue'
import { initDatabase } from './useDatabase'

// Show in dev AND in device debug builds (anything that isn't a prod build)
export const IS_DEV = !import.meta.env.PROD

export const resetLog = ref<string[]>([])

function log(msg: string) {
  const ts = new Date().toISOString().slice(11, 19)
  resetLog.value.unshift(`[${ts}] ${msg}`)
  console.log('[OrbDev]', msg)
}

export async function resetAll() {
  resetLog.value = []
  log('Starting full data reset…')

  // ── 1. SQLite (native Capacitor) ──────────────────────
  try {
    const { CapacitorSQLite, SQLiteConnection } = await import('@capacitor-community/sqlite')
    const sqlite = new SQLiteConnection(CapacitorSQLite)

    const db = await sqlite.createConnection('orb', false, 'no-encryption', 1, false)
    await db.open()

    const tables = ['transactions', 'budgets', 'goals', 'user_profile']
    for (const t of tables) {
      await db.execute(`DELETE FROM ${t};`)
      log(`Cleared table: ${t}`)
    }

    await db.close()
    await sqlite.closeAllConnections()
    log('SQLite wiped ✓')

    await initDatabase()
    log('DB re-initialised ✓')
  } catch (e: any) {
    log(`SQLite: ${e?.message ?? e}`)
  }

  // ── 2. localStorage ───────────────────────────────────
  try {
    const keysToRemove = Object.keys(localStorage).filter(k =>
      k.startsWith('orb_') || k.startsWith('capacitor') || k === 'orb_onboarding_done'
    )
    keysToRemove.forEach(k => localStorage.removeItem(k))
    log(`localStorage: removed ${keysToRemove.length} key(s) ✓`)
  } catch {
    log('localStorage not available')
  }

  // ── 3. sessionStorage ─────────────────────────────────
  try {
    sessionStorage.clear()
    log('sessionStorage cleared ✓')
  } catch {}

  // ── 4. IndexedDB (jeep-sqlite web fallback) ───────────
  try {
    const dbs = await indexedDB.databases?.()
    if (dbs?.length) {
      await Promise.all(
        dbs.map(db =>
          new Promise<void>((res, rej) => {
            if (!db.name) return res()
            const req = indexedDB.deleteDatabase(db.name)
            req.onsuccess = () => { log(`IndexedDB deleted: ${db.name}`); res() }
            req.onerror   = () => rej(req.error)
          })
        )
      )
      log('IndexedDB wiped ✓')
    }
  } catch {
    log('IndexedDB enum not supported')
  }

  log('✅ Reset complete — reloading…')
  return resetLog.value
}

export function useDevControl() {
  if (typeof window !== 'undefined') {
    ;(window as any).__orbReset = resetAll
  }
  return { resetAll, resetLog, IS_DEV }
}