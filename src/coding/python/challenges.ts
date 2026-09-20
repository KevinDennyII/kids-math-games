export type PythonChallenge = {
  id: string
  starter: string
  hint: string
  /** Substrings that must appear in stdout (after strip). */
  stdoutIncludes?: string[]
  /** If set, robot must reach the goal. */
  mustReachGoal?: boolean
  /** Exact stdout lines (trimmed), in order. */
  stdoutLines?: string[]
}

export function normalizeStdout(stdout: string): string {
  return stdout.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
}

export function stdoutContainsAll(
  stdout: string,
  needles: readonly string[],
): boolean {
  const text = normalizeStdout(stdout)
  return needles.every((needle) => text.includes(needle))
}

export function stdoutEqualsLines(
  stdout: string,
  lines: readonly string[],
): boolean {
  const got = normalizeStdout(stdout)
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line, index, arr) => line.length > 0 || index < arr.length - 1)
    .filter((line) => line.length > 0)
  if (got.length !== lines.length) return false
  return got.every((line, index) => line === lines[index])
}

export function gradePython(
  challenge: PythonChallenge,
  stdout: string,
  reachedGoal: boolean,
): { ok: boolean; message: string } {
  if (challenge.stdoutLines) {
    if (!stdoutEqualsLines(stdout, challenge.stdoutLines)) {
      return {
        ok: false,
        message: 'Almost — check what print showed. Listen to the briefing again if you need the target.',
      }
    }
  }
  if (challenge.stdoutIncludes) {
    if (!stdoutContainsAll(stdout, challenge.stdoutIncludes)) {
      return {
        ok: false,
        message: 'The program ran, but the message is not quite right yet.',
      }
    }
  }
  if (challenge.mustReachGoal && !reachedGoal) {
    return {
      ok: false,
      message: 'The bot did not reach the green flag. Plan the turns, then try again.',
    }
  }
  return { ok: true, message: 'Yes! That is what the computer heard.' }
}

export const PYTHON_CHALLENGES: Record<string, PythonChallenge> = {
  hello: {
    id: 'hello',
    starter: `print("Hello, Basicbot!")
`,
    hint: 'Use print with quotes around the words Hello, Basicbot!',
    stdoutIncludes: ['Hello, Basicbot!'],
  },
  variables: {
    id: 'variables',
    starter: `speed = 3
print(speed)
`,
    hint: 'Keep a variable named speed, set it to 3, then print(speed).',
    stdoutLines: ['3'],
  },
  branch: {
    id: 'branch',
    starter: `armor = "walls"
if armor == "walls":
    print("defense")
else:
    print("attack")
`,
    hint: 'If armor is walls, print defense. Otherwise print attack.',
    stdoutLines: ['defense'],
  },
  loops: {
    id: 'loops',
    starter: `for i in range(4):
    print("forward")
`,
    hint: 'Use a for loop with range(4) and print the word forward each time.',
    stdoutLines: ['forward', 'forward', 'forward', 'forward'],
  },
  drive: {
    id: 'drive',
    starter: `# The bot starts facing right.
# H is a hazard. # is a wall. G is the goal.
# Commands: forward(), forward(n), left(), right()

forward(7)
right()
forward(3)
`,
    hint: 'Drive around the orange hazards and the wall block to the green flag.',
    mustReachGoal: true,
  },
  sandbox: {
    id: 'sandbox',
    starter: `print("Workshop is open.")
# Try: speed = 2
# Try: forward(2)
# Try: left()
`,
    hint: 'Anything goes. Read the output after you run.',
  },
}
