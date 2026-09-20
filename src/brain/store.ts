import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { applyAnswer } from '../shared/math/adaptive'
import {
  createAdaptiveState,
  normalizeAdaptiveState,
  type AdaptiveState,
} from '../shared/math/types'
import { BRAIN_GAME_IDS, BRAIN_MAX_LEVEL, type BrainGameId } from './catalog'

export type BrainProgress = {
  games: Record<BrainGameId, AdaptiveState>
  dailyDate: string | null
  dailyScore: number
  dailyComplete: boolean
}

const INITIAL_GAMES: Record<BrainGameId, AdaptiveState> = {
  flash: createAdaptiveState(),
  echo: createAdaptiveState(),
  color: createAdaptiveState(),
  hold: createAdaptiveState(),
  twist: createAdaptiveState(),
  pattern: createAdaptiveState(),
}

const INITIAL: BrainProgress = {
  games: INITIAL_GAMES,
  dailyDate: null,
  dailyScore: 0,
  dailyComplete: false,
}

export type BrainStore = BrainProgress & {
  recordAnswer: (id: BrainGameId, correct: boolean) => ReturnType<typeof applyAnswer>
  completeDaily: (score: number, date: string) => void
  reset: () => void
}

function emptyGames(): Record<BrainGameId, AdaptiveState> {
  return {
    flash: createAdaptiveState(),
    echo: createAdaptiveState(),
    color: createAdaptiveState(),
    hold: createAdaptiveState(),
    twist: createAdaptiveState(),
    pattern: createAdaptiveState(),
  }
}

function normalizeGames(
  partial?: Partial<Record<BrainGameId, Partial<AdaptiveState>>> | null,
): Record<BrainGameId, AdaptiveState> {
  const next = emptyGames()
  for (const id of BRAIN_GAME_IDS) {
    next[id] = normalizeAdaptiveState(partial?.[id] ?? next[id])
  }
  return next
}

export function localDateKey(now = new Date()): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export const useBrainStore = create<BrainStore>()(
  persist(
    (set, get) => ({
      ...INITIAL,
      games: emptyGames(),
      recordAnswer: (id, correct) => {
        const prev = get().games[id]
        const result = applyAnswer(prev, correct, {
          maxLevel: BRAIN_MAX_LEVEL,
          correctPerLevel: 4,
          wrongToDrop: 2,
        })
        set({
          games: { ...get().games, [id]: result.state },
        })
        return result
      },
      completeDaily: (score, date) => {
        set({
          dailyDate: date,
          dailyScore: score,
          dailyComplete: true,
        })
      },
      reset: () => set({ ...INITIAL, games: emptyGames() }),
    }),
    {
      name: 'brain-games-progress-v1',
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<BrainProgress>
        return {
          ...current,
          games: normalizeGames(p.games),
          dailyDate: p.dailyDate ?? null,
          dailyScore: typeof p.dailyScore === 'number' ? p.dailyScore : 0,
          dailyComplete: Boolean(p.dailyComplete),
        }
      },
    },
  ),
)
