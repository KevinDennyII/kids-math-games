export type BadgeId =
  | 'dirt'
  | 'wood'
  | 'cobble'
  | 'iron'
  | 'emerald'
  | 'gold'
  | 'redstone'
  | 'diamond'

export type MissionKind = 'lesson' | 'project' | 'playground'

export type Mission = {
  id: string
  level: number
  title: string
  skill: string
  badge: BadgeId
  badgeLabel: string
  kind: MissionKind
  /** Short readable lesson, Codecademy-style. */
  steps: string[]
  /** What to do in the editor / project. */
  task: string
}

export const PYTHON_MISSIONS: Mission[] = [
  {
    id: 'hello',
    level: 1,
    title: 'Print a message',
    skill: 'print',
    badge: 'dirt',
    badgeLabel: 'Dirt Block',
    kind: 'lesson',
    steps: [
      'Python is a language you type, like a story the computer follows line by line.',
      'print() shows words on the screen. Put the words in quotes inside the parentheses.',
      'Click Run. Your result shows in the Output panel under the code — that panel is the computer talking back.',
    ],
    task: 'Use print to say hello. Hello, Python! is fine — or Hello with your name.',
  },
  {
    id: 'variables',
    level: 2,
    title: 'Save a number',
    skill: 'variables',
    badge: 'wood',
    badgeLabel: 'Oak Log',
    kind: 'lesson',
    steps: [
      'A variable is a name that holds a value, like putting 3 in a box labeled speed.',
      'Write speed = 3 to store it. Then print(speed) to see what is inside the box.',
      'The Output panel prints the number, not the word speed.',
    ],
    task: 'Make a variable named speed with the value 3, then print it.',
  },
  {
    id: 'branch',
    level: 3,
    title: 'Make a choice',
    skill: 'if / else',
    badge: 'cobble',
    badgeLabel: 'Cobblestone',
    kind: 'lesson',
    steps: [
      'if means: only run these lines when something is true.',
      'else means: run these other lines when it is not true.',
      'Indent the lines under if and else with a tab or four spaces. Python cares about that.',
    ],
    task: 'If armor is "walls", print defense. Otherwise print attack.',
  },
  {
    id: 'loops',
    level: 4,
    title: 'Repeat it',
    skill: 'for loops',
    badge: 'iron',
    badgeLabel: 'Iron Ingot',
    kind: 'lesson',
    steps: [
      'A loop repeats lines so you do not copy the same code over and over.',
      'for i in range(4): means “do the indented lines 4 times.”',
      'The Output panel should show the same word once per repeat.',
    ],
    task: 'Use a for loop with range(4) that prints the word forward each time.',
  },
  {
    id: 'memory',
    level: 5,
    title: 'Memory Squares',
    skill: 'first app',
    badge: 'emerald',
    badgeLabel: 'Emerald',
    kind: 'project',
    steps: [
      'You finished the first four skills. Now you build a tiny app: Memory Squares.',
      'A list holds several values in order, like tiles = ["creeper", "chicken", "creeper", "chicken"].',
      'Run your list code to power the game. Then flip the four tiles — match both pairs to win your Emerald badge.',
    ],
    task: 'Print a list with creeper and chicken each appearing twice. Then play Memory Squares and match both pairs.',
  },
  {
    id: 'lists',
    level: 6,
    title: 'Build a chest',
    skill: 'lists',
    badge: 'gold',
    badgeLabel: 'Gold Ingot',
    kind: 'lesson',
    steps: [
      'Lists can hold more than game tiles. chest = ["torch", "pick", "bread"] stores three items.',
      'print(chest[0]) shows the first item. In Python, counting starts at 0.',
      'print(len(chest)) shows how many items are in the chest.',
    ],
    task: 'Make a list named chest with three items: torch, pick, bread. Print the first item, then print how many items.',
  },
  {
    id: 'drive',
    level: 7,
    title: 'Drive with code',
    skill: 'functions',
    badge: 'redstone',
    badgeLabel: 'Redstone',
    kind: 'lesson',
    steps: [
      'These helpers move a bot: forward(), forward(n), left(), right().',
      'The bot starts facing right. Orange tiles hurt. Gray tiles are walls. The green flag is the goal.',
      'The computer does exactly what you typed — even if you meant a different turn.',
    ],
    task: 'Write moves that get the bot to the green flag without dying.',
  },
  {
    id: 'craft',
    level: 8,
    title: 'Crafting table',
    skill: 'free code',
    badge: 'diamond',
    badgeLabel: 'Diamond',
    kind: 'playground',
    steps: [
      'This is your crafting table — no checklist. Mix print, lists, loops, or bot moves.',
      'If something looks wrong, read the Output panel. That is how programmers debug.',
      'Earn the Diamond badge the first time you Run anything here.',
    ],
    task: 'Try anything. Watch Output after each Run.',
  },
]

const PYTHON_ORDER = PYTHON_MISSIONS.map((m) => m.id)

export function missionById(id: string): Mission | undefined {
  return PYTHON_MISSIONS.find((m) => m.id === id)
}

export function isMissionUnlocked(
  id: string,
  completed: readonly string[],
): boolean {
  const index = PYTHON_ORDER.indexOf(id)
  if (index <= 0) return true
  const prev = PYTHON_ORDER[index - 1]
  return prev != null && completed.includes(prev)
}

export function firstOpenMissionIndex(completed: readonly string[]): number {
  const index = PYTHON_MISSIONS.findIndex(
    (m) => !completed.includes(m.id) && isMissionUnlocked(m.id, completed),
  )
  return index >= 0 ? index : Math.max(0, PYTHON_MISSIONS.length - 1)
}
