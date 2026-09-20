import { createContext, useContext } from 'react'
import type { SfxKind } from '../shared/audio/musicEngine'

export type BrainAudioValue = {
  muted: boolean
  setMuted: (muted: boolean) => void
  playSfx: (kind: SfxKind) => void
}

export const BrainAudioContext = createContext<BrainAudioValue | null>(null)

export function useBrainAudio(): BrainAudioValue {
  const value = useContext(BrainAudioContext)
  if (!value) {
    throw new Error('useBrainAudio needs BrainLayout')
  }
  return value
}
