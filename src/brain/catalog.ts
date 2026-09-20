export const BRAIN_GAME_IDS = [
  'flash',
  'echo',
  'color',
  'hold',
  'twist',
  'pattern',
] as const

export type BrainGameId = (typeof BRAIN_GAME_IDS)[number]

export type BrainGameInfo = {
  id: BrainGameId
  title: string
  kicker: string
  blurb: string
  skill: string
  why: string
  sparkTrials: number
}

/**
 * Workouts mapped to lab paradigms — not medical treatments.
 * Speed-of-processing: ACTIVE / UFOV (Ball and colleagues).
 * Spatial working memory: Corsi block-tapping.
 * Inhibition: Stroop; Go/No-Go (executive function, Diamond and others).
 * Spatial: mental rotation (Shepard & Metzler).
 * Fluid reasoning: matrix problems in the spirit of Raven.
 */
export const BRAIN_GAMES: BrainGameInfo[] = [
  {
    id: 'flash',
    title: 'Flash Find',
    kicker: 'Speed + focus',
    blurb: 'A crowd of shapes blinks. Tap the odd one out.',
    skill: 'Processing speed & useful field of view',
    why: 'Speed-of-processing drills like UFOV were the ACTIVE trial’s strongest everyday-skill arm.',
    sparkTrials: 4,
  },
  {
    id: 'echo',
    title: 'Echo Path',
    kicker: 'Working memory',
    blurb: 'Watch the path light up, then tap it back.',
    skill: 'Spatial working memory',
    why: 'The Corsi block-tapping test is still how labs measure visuospatial memory across ages.',
    sparkTrials: 2,
  },
  {
    id: 'color',
    title: 'Color Catch',
    kicker: 'Self-control',
    blurb: 'Tap the ink color, not the word. Your brain will try to read first.',
    skill: 'Inhibitory control (Stroop)',
    why: 'Naming ink instead of the word is a classic prefrontal “stop the habit” workout.',
    sparkTrials: 6,
  },
  {
    id: 'hold',
    title: 'Hold Fast',
    kicker: 'Go / wait',
    blurb: 'Tap the star. Freeze on the stop. Fast and careful both count.',
    skill: 'Response inhibition (Go/No-Go)',
    why: 'Go/No-Go tasks track the pause-before-you-act skill from childhood through older age.',
    sparkTrials: 1,
  },
  {
    id: 'twist',
    title: 'Shape Twist',
    kicker: 'Mind’s eye',
    blurb: 'Is it the same piece turned, or a flipped mirror?',
    skill: 'Mental rotation',
    why: 'Shepard & Metzler showed we literally rotate pictures in our heads — a spatial skill that grows in kids.',
    sparkTrials: 4,
  },
  {
    id: 'pattern',
    title: 'Pattern Peek',
    kicker: 'Fluid thinking',
    blurb: 'Find the missing tile that completes the pattern.',
    skill: 'Fluid reasoning',
    why: 'Matrix puzzles (Raven-style) ask you to spot a rule, then apply it — flexible problem solving.',
    sparkTrials: 3,
  },
]

export const DAILY_SPARK_ORDER: BrainGameId[] = [...BRAIN_GAME_IDS]

export function brainGameById(id: string): BrainGameInfo | undefined {
  return BRAIN_GAMES.find((game) => game.id === id)
}

export const BRAIN_MAX_LEVEL = 10
