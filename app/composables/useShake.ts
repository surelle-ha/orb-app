// composables/useShake.ts
// Detects a deliberate device shake via accelerometer.
// Requires CONSECUTIVE hits above the threshold within a short window
// to avoid false triggers from normal phone handling.

import { onMounted, onUnmounted } from 'vue'

interface ShakeOptions {
  threshold?:        number  // per-axis delta to count as one hit (default 35)
  hitsRequired?:     number  // consecutive hits needed to fire (default 3)
  hitWindowMs?:      number  // window in which hits must occur (default 600ms)
  cooldownMs?:       number  // minimum ms between shake events (default 2000)
}

export function useShake(callback: () => void, options: ShakeOptions = {}) {
  const {
    threshold    = 35,    // raised — normal movement rarely exceeds this
    hitsRequired = 3,     // must shake hard 3 times in a row
    hitWindowMs  = 600,   // within 600 ms
    cooldownMs   = 2000,  // 2 s cooldown so it can't spam
  } = options

  let lastX: number | null = null
  let lastY: number | null = null
  let lastZ: number | null = null

  let hitCount   = 0
  let firstHitAt = 0
  let lastFiredAt = 0

  function handleMotion(e: DeviceMotionEvent) {
    const acc = e.accelerationIncludingGravity
    if (!acc) return

    const { x, y, z } = acc
    if (x === null || y === null || z === null) return

    if (lastX === null) { lastX = x ?? 0; lastY = y ?? 0; lastZ = z ?? 0; return }

    const deltaX = Math.abs((x ?? 0) - lastX)
    const deltaY = Math.abs((y ?? 0) - lastY)
    const deltaZ = Math.abs((z ?? 0) - lastZ)
    const total  = deltaX + deltaY + deltaZ

    lastX = x ?? 0; lastY = y ?? 0; lastZ = z ?? 0

    const now = Date.now()

    if (total > threshold) {
      if (hitCount === 0) {
        // Start a new hit window
        firstHitAt = now
        hitCount   = 1
      } else if (now - firstHitAt <= hitWindowMs) {
        // Another hit inside the window
        hitCount++
        if (hitCount >= hitsRequired) {
          if (now - lastFiredAt >= cooldownMs) {
            lastFiredAt = now
            callback()
          }
          // Reset so it doesn't fire again immediately
          hitCount = 0
        }
      } else {
        // Window expired — start fresh
        firstHitAt = now
        hitCount   = 1
      }
    }
  }

  onMounted(() => {
    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      window.addEventListener('devicemotion', handleMotion)
    }
  })

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('devicemotion', handleMotion)
    }
  })
}