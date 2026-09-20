import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CodingProgress = {
  completed: string[]
}

const INITIAL: CodingProgress = {
  completed: [],
}

export type CodingStore = CodingProgress & {
  completeMission: (id: string) => void
  reset: () => void
}

function normalize(partial?: Partial<CodingProgress> | null): CodingProgress {
  return {
    completed: Array.isArray(partial?.completed) ? [...partial.completed] : [],
  }
}

export const useCodingStore = create<CodingStore>()(
  persist(
    (set, get) => ({
      ...INITIAL,
      completeMission: (id) => {
        const { completed } = get()
        if (completed.includes(id)) return
        set({ completed: [...completed, id] })
      },
      reset: () => set({ ...INITIAL }),
    }),
    {
      name: 'kids-coding-progress-v1',
      merge: (persisted, current) => ({
        ...current,
        ...normalize(persisted as Partial<CodingProgress> | null),
      }),
    },
  ),
)
