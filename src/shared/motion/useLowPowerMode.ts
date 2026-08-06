import { useState } from 'react'

/**
 * Heuristic for machines that struggle with animated CSS/WebAudio games
 * (Raspberry Pi + Firefox is the main target).
 */
export function detectLowPowerDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false
  }

  try {
    if (new URLSearchParams(window.location.search).get('lite') === '1') {
      return true
    }
    if (localStorage.getItem('kids-math-lite') === '1') {
      return true
    }
  } catch {
    // ignore
  }

  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return true
    }
  } catch {
    // ignore
  }

  const cores = navigator.hardwareConcurrency || 0
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
  const ua = navigator.userAgent
  const isFirefox = /\bFirefox\b/i.test(ua)
  const isLinux = /\bLinux\b/i.test(ua)
  const isArm =
    /\baarch64\b|\barmv\d+\b|\bARM\b/i.test(ua) ||
    /\bRaspberry\b/i.test(ua)

  // Pi-class: few cores and/or little reported RAM
  if (cores > 0 && cores <= 4 && memory != null && memory <= 4) return true
  if (cores > 0 && cores <= 4 && isFirefox && isLinux) return true
  if (isArm && isFirefox) return true
  if (cores > 0 && cores <= 2) return true

  return false
}

export function useLowPowerMode(): boolean {
  const [lowPower] = useState(detectLowPowerDevice)
  return lowPower
}
