import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  createAdaptiveState,
  createMathGameProgress,
  createMathOpProgress,
  mathOpFromProblemType,
  type AdaptiveState,
  type GameId,
  type MathGameId,
  type MathGameProgress,
  type MathOpMode,
  type MathOpProgress,
  type ProblemType,
} from '../math/types'
import { applyAnswer } from '../math/adaptive'
import {
  createTypingFoundationState,
  type TypingFoundationState,
} from '../../games/typing/foundation/lessonBank'
import { CLOCK_MAX_LEVEL } from '../../games/clock/timeTypes'

export type ProgressStore = {
  race: AdaptiveState
  academy: AdaptiveState
  clock: AdaptiveState
  math: Record<MathGameId, MathGameProgress>
  typing: AdaptiveState
  typingFoundation: TypingFoundationState
  recordAnswer: (
    game: GameId,
    correct: boolean,
    problemType?: ProblemType,
  ) => ReturnType<typeof applyAnswer>
  recordClockAnswer: (correct: boolean) => ReturnType<typeof applyAnswer>
  setOpMode: (game: MathGameId, mode: MathOpMode) => void
  setTyping: (state: AdaptiveState) => void
  setTypingFoundation: (state: TypingFoundationState) => void
  resetGame: (game: GameId) => void
}

export function selectMathDisplayState(
  store: ProgressStore,
  game: MathGameId,
): AdaptiveState {
  const progress = store.math[game]
  if (progress.opMode === 'mixed') return progress.mixed
  return progress.ops[progress.opMode]
}

function mergeOps(persisted: Partial<MathOpProgress> | undefined): MathOpProgress {
  const base = createMathOpProgress()
  if (!persisted) return base
  return {
    addition: persisted.addition ?? base.addition,
    subtraction: persisted.subtraction ?? base.subtraction,
    multiplication: persisted.multiplication ?? base.multiplication,
    division: persisted.division ?? base.division,
  }
}

type LegacyMathPersist = Partial<ProgressStore> & {
  raceOpMode?: MathOpMode
  raceOps?: Partial<MathOpProgress>
  raceMixed?: AdaptiveState
}

function mergeMath(persisted: LegacyMathPersist, current: ProgressStore['math']) {
  const raceLegacyOps = persisted.raceOps ?? persisted.math?.race?.ops
  return {
    race: {
      opMode: persisted.math?.race?.opMode ?? persisted.raceOpMode ?? current.race.opMode,
      ops: mergeOps(raceLegacyOps),
      mixed:
        persisted.math?.race?.mixed ?? persisted.raceMixed ?? current.race.mixed,
    },
    academy: {
      opMode: persisted.math?.academy?.opMode ?? current.academy.opMode,
      ops: mergeOps({
        ...persisted.math?.academy?.ops,
        addition:
          persisted.math?.academy?.ops?.addition ??
          persisted.academy ??
          current.academy.ops.addition,
      }),
      mixed: persisted.math?.academy?.mixed ?? current.academy.mixed,
    },
  }
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      race: createAdaptiveState(),
      academy: createAdaptiveState(),
      clock: createAdaptiveState(),
      math: {
        race: createMathGameProgress('mixed'),
        academy: createMathGameProgress('addition'),
      },
      typing: createAdaptiveState(),
      typingFoundation: createTypingFoundationState(),
      recordAnswer: (game, correct, problemType) => {
        if (game === 'race' || game === 'academy') {
          const op = mathOpFromProblemType(problemType ?? 'addition')
          const progress = get().math[game]
          const opResult = applyAnswer(progress.ops[op], correct)
          const nextProgress: MathGameProgress = {
            ...progress,
            ops: { ...progress.ops, [op]: opResult.state },
          }

          if (progress.opMode === 'mixed') {
            const mixedResult = applyAnswer(progress.mixed, correct)
            nextProgress.mixed = mixedResult.state
            set({ math: { ...get().math, [game]: nextProgress } })
            return {
              ...mixedResult,
              leveledUp: opResult.leveledUp,
              leveledDown: opResult.leveledDown,
            }
          }

          set({
            math: { ...get().math, [game]: nextProgress },
            [game]: opResult.state,
          })
          return opResult
        }

        if (game === 'clock') {
          return get().recordClockAnswer(correct)
        }

        const prev = get()[game]
        const result = applyAnswer(prev, correct)
        set({ [game]: result.state })
        return result
      },
      recordClockAnswer: (correct) => {
        const prev = get().clock
        const result = applyAnswer(prev, correct, {
          maxLevel: CLOCK_MAX_LEVEL,
          correctPerLevel: 3,
        })
        set({ clock: result.state })
        return result
      },
      setOpMode: (game, mode) => {
        const progress = get().math[game]
        if (progress.opMode === mode) return
        set({
          math: { ...get().math, [game]: { ...progress, opMode: mode } },
        })
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
        if (game === 'race' || game === 'academy') {
          const opMode = game === 'academy' ? 'addition' : 'mixed'
          set({
            [game]: createAdaptiveState(),
            math: {
              ...get().math,
              [game]: createMathGameProgress(opMode),
            },
          })
          return
        }
        set({ [game]: createAdaptiveState() })
      },
    }),
    {
      name: 'kids-math-progress-v1',
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as LegacyMathPersist
        return {
          ...current,
          ...p,
          race: p.race ?? current.race,
          academy: p.academy ?? current.academy,
          clock: p.clock ?? current.clock,
          math: mergeMath(p, current.math),
          typing: p.typing ?? current.typing,
          typingFoundation: p.typingFoundation ?? current.typingFoundation,
        }
      },
    },
  ),
)
