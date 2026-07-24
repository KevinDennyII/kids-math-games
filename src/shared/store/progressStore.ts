import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  createAdaptiveState,
  type AdaptiveState,
  type GameId,
} from '../math/types'
import { applyAnswer } from '../math/adaptive'

type ProgressStore = {
  race: AdaptiveState
  academy: AdaptiveState
  typing: AdaptiveState
  recordAnswer: (game: GameId, correct: boolean) => ReturnType<typeof applyAnswer>
  setTyping: (state: AdaptiveState) => void
  resetGame: (game: GameId) => void
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      race: createAdaptiveState(),
      academy: createAdaptiveState(),
      typing: createAdaptiveState(),
      recordAnswer: (game, correct) => {
        const prev = get()[game]
        const result = applyAnswer(prev, correct)
        set({ [game]: result.state })
        return result
      },
      setTyping: (state) => set({ typing: state }),
      resetGame: (game) => set({ [game]: createAdaptiveState() }),
    }),
    {
      name: 'kids-math-progress-v1',
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<ProgressStore>
        return {
          ...current,
          ...p,
          race: p.race ?? current.race,
          academy: p.academy ?? current.academy,
          typing: p.typing ?? current.typing,
        }
      },
    },
  ),
)
