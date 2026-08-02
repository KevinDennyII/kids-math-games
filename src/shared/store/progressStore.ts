import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  createAdaptiveState,
  type AdaptiveState,
  type GameId,
} from '../math/types'
import { applyAnswer } from '../math/adaptive'
import {
  createTypingFoundationState,
  type TypingFoundationState,
} from '../../games/typing/foundation/lessonBank'

type ProgressStore = {
  race: AdaptiveState
  academy: AdaptiveState
  typing: AdaptiveState
  typingFoundation: TypingFoundationState
  recordAnswer: (game: GameId, correct: boolean) => ReturnType<typeof applyAnswer>
  setTyping: (state: AdaptiveState) => void
  setTypingFoundation: (state: TypingFoundationState) => void
  resetGame: (game: GameId) => void
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      race: createAdaptiveState(),
      academy: createAdaptiveState(),
      typing: createAdaptiveState(),
      typingFoundation: createTypingFoundationState(),
      recordAnswer: (game, correct) => {
        const prev = get()[game]
        const result = applyAnswer(prev, correct)
        set({ [game]: result.state })
        return result
      },
      setTyping: (state) => set({ typing: state }),
      setTypingFoundation: (state) => set({ typingFoundation: state }),
      resetGame: (game) => {
        if (game === 'typing') {
          set({
            typing: createAdaptiveState(),
            typingFoundation: createTypingFoundationState(),
          })
          return
        }
        set({ [game]: createAdaptiveState() })
      },
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
          typingFoundation: p.typingFoundation ?? current.typingFoundation,
        }
      },
    },
  ),
)
