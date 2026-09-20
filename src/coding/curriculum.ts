export type ListenCheck = {
  question: string
  options: string[]
  answer: string
}

export type Mission = {
  id: string
  title: string
  subtitle: string
  /** Spoken / on-screen briefing. Kid must hear or read this first. */
  briefing: string[]
  check: ListenCheck
  /** What to ask him after (parent prompt). */
  askAfter: string
}

export const PYTHON_MISSIONS: Mission[] = [
  {
    id: 'hello',
    title: 'Say hello',
    subtitle: 'print',
    briefing: [
      'Python is a language people type, not drag as blocks.',
      'print tells the computer to show a message.',
      'Quotes wrap the words you want to say.',
      'The computer only does what you actually typed.',
    ],
    check: {
      question: 'Which command shows a message on the screen?',
      options: ['print', 'armor', 'wheel'],
      answer: 'print',
    },
    askAfter: 'What did your program print, and what line made that happen?',
  },
  {
    id: 'variables',
    title: 'Name a number',
    subtitle: 'variables',
    briefing: [
      'A variable is a name that holds a value, like speed = 3.',
      'You can print the name to see what is inside.',
      'If you change the number, the next print shows the new one.',
    ],
    check: {
      question: 'What is a variable?',
      options: [
        'A name that holds a value',
        'A kind of wheel',
        'A 3D printer',
      ],
      answer: 'A name that holds a value',
    },
    askAfter: 'What did you name your variable, and what number did you store?',
  },
  {
    id: 'branch',
    title: 'If this, then that',
    subtitle: 'if / else',
    briefing: [
      'if means: only do this when something is true.',
      'else means: do this other thing when it is not true.',
      'This is how a program picks a path.',
    ],
    check: {
      question: 'When does an else block run?',
      options: [
        'When the if is not true',
        'Always, even if if is true',
        'Only on Tuesdays',
      ],
      answer: 'When the if is not true',
    },
    askAfter: 'What happens in your code when the if is true versus when it is not?',
  },
  {
    id: 'loops',
    title: 'Repeat it',
    subtitle: 'for loops',
    briefing: [
      'A loop repeats instructions so you do not type the same line four times.',
      'for i in range(4) means do the body four times.',
      'If the count is wrong, the program overshoots.',
    ],
    check: {
      question: 'What does for i in range(4) do?',
      options: [
        'Repeats the indented lines 4 times',
        'Deletes your robot',
        'Prints the number 4 only',
      ],
      answer: 'Repeats the indented lines 4 times',
    },
    askAfter: 'Why is a loop better than writing the same line four times by hand?',
  },
  {
    id: 'drive',
    title: 'Code the robot',
    subtitle: 'forward, left, right',
    briefing: [
      'Now the code drives a little bot. You are not holding the sticks.',
      'forward(), left(), and right() queue moves. The bot then follows that list.',
      'It will do exactly what you typed — even if you meant something else.',
      'Plan the path around hazards, then run it.',
    ],
    check: {
      question: 'If you type the wrong turn, what does the robot do?',
      options: [
        'It guesses what you meant',
        'It follows the typed turn anyway',
        'It shuts off forever',
      ],
      answer: 'It follows the typed turn anyway',
    },
    askAfter: 'Walk me through the path your program took to the flag.',
  },
  {
    id: 'sandbox',
    title: 'Free lab',
    subtitle: 'Try your own scripts',
    briefing: [
      'This is your workshop. print, math, loops, and robot moves all work here.',
      'If the program hangs, you can stop and try again.',
      'Read your output. That is how programmers debug.',
      'Have a plan before you mash Run.',
    ],
    check: {
      question: 'What should you do before you hit Run?',
      options: [
        'Have a plan for what the code should do',
        'Close your eyes',
        'Delete all the lines',
      ],
      answer: 'Have a plan for what the code should do',
    },
    askAfter: 'What did you try, and what did the output tell you?',
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
  if (id === 'sandbox') return true
  const index = PYTHON_ORDER.indexOf(id)
  if (index <= 0) return true
  const prev = PYTHON_ORDER[index - 1]
  return prev != null && completed.includes(prev)
}

export function checkAnswer(mission: Mission, choice: string): boolean {
  return choice === mission.check.answer
}
