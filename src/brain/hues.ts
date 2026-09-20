import type { CSSProperties } from 'react'

export const HUE_HEX: Record<string, string> = {
  coral: '#fb7185',
  gold: '#fbbf24',
  sky: '#38bdf8',
  mint: '#34d399',
  violet: '#c4b5fd',
  red: '#ef4444',
  blue: '#60a5fa',
  green: '#34d399',
}

export function inkStyle(ink: string): CSSProperties {
  return { color: HUE_HEX[ink] ?? ink }
}
