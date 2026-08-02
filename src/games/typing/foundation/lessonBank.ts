/** Core finger-placement curriculum for Fox Rockets Finger Practice. */

export type LessonKind = 'key' | 'word'

export type FoundationLesson = {
  id: string
  title: string
  subtitle: string
  intro: string
  kind: LessonKind
  /** Correct hits needed to finish the lesson. */
  targetHits: number
  /** Letter or word prompts (cycled / shuffled lightly). */
  prompts: string[]
}

const HOME_ROW = ['a', 's', 'd', 'f', 'j', 'k', 'l', ';']

const LEFT_HAND = [
  'q',
  'a',
  'z',
  'w',
  's',
  'x',
  'e',
  'd',
  'c',
  'r',
  'f',
  'v',
  't',
  'g',
  'b',
]

const RIGHT_HAND = [
  'y',
  'h',
  'n',
  'u',
  'j',
  'm',
  'i',
  'k',
  ',',
  'o',
  'l',
  '.',
  'p',
  ';',
  "'",
  '/',
  '[',
  ']',
]

/** Short words built from home / near-home keys. */
const SHORT_WORDS = [
  'as',
  'ad',
  'if',
  'is',
  'dad',
  'sad',
  'fad',
  'lad',
  'ask',
  'all',
  'jak',
  'add',
  'jade',
  'lake',
  'fade',
  'kids',
  'sail',
  'fail',
  'said',
  'desk',
]

export const FOUNDATION_LESSONS: FoundationLesson[] = [
  {
    id: 'home-base',
    title: 'Home Base',
    subtitle: 'Find the bumps',
    intro:
      'Rest your fingers on A S D F and J K L ; — left pinky on A (near caps/shift), right pinky on ;. Feel the bumps on F and J!',
    kind: 'key',
    targetHits: 8,
    prompts: ['f', 'j', 'f', 'j', 'f', 'j', 'd', 'k'],
  },
  {
    id: 'home-row',
    title: 'Home Row',
    subtitle: 'ASDF · JKL;',
    intro: 'Keep fingers on the home row. Type the glowing letter with the matching finger.',
    kind: 'key',
    targetHits: 10,
    prompts: HOME_ROW,
  },
  {
    id: 'left-hand',
    title: 'Left Hand',
    subtitle: 'Reach left keys',
    intro: 'Left hand stays near home base. Reach up or down, then return to ASDF.',
    kind: 'key',
    targetHits: 12,
    prompts: LEFT_HAND,
  },
  {
    id: 'right-hand',
    title: 'Right Hand',
    subtitle: 'Reach right keys',
    intro: 'Right hand stays near home base. Reach up or down, then return to JKL.',
    kind: 'key',
    targetHits: 12,
    prompts: RIGHT_HAND,
  },
  {
    id: 'short-words',
    title: 'Short Words',
    subtitle: 'Put it together',
    intro: 'Type each short word one letter at a time. Keep fingers near home base!',
    kind: 'word',
    targetHits: 8,
    prompts: SHORT_WORDS,
  },
]

export type TypingFoundationState = {
  /** Next recommended lesson index (0-based). */
  lessonIndex: number
  /** How many lessons finished at least once. */
  completedLessons: number
  lastCompletedAt?: number
}

export function createTypingFoundationState(): TypingFoundationState {
  return {
    lessonIndex: 0,
    completedLessons: 0,
  }
}

export function pickPrompt(
  lesson: FoundationLesson,
  avoid: string | null = null,
): string {
  const pool =
    avoid && lesson.prompts.length > 1
      ? lesson.prompts.filter((p) => p !== avoid)
      : lesson.prompts
  const source = pool.length > 0 ? pool : lesson.prompts
  return source[Math.floor(Math.random() * source.length)]!
}

export function isLessonUnlocked(
  lessonIndex: number,
  completedLessons: number,
): boolean {
  return lessonIndex <= completedLessons
}

export function advanceFoundationProgress(
  prev: TypingFoundationState,
  finishedLessonIndex: number,
): TypingFoundationState {
  const completedLessons = Math.max(prev.completedLessons, finishedLessonIndex + 1)
  const lessonIndex = Math.min(completedLessons, FOUNDATION_LESSONS.length - 1)
  return {
    lessonIndex,
    completedLessons,
    lastCompletedAt: Date.now(),
  }
}
