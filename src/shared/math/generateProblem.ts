import type {
  MathOp,
  MathOpLevels,
  MathOpMode,
  Problem,
  ProblemIcon,
} from './types'
import { MATH_OPS, PROBLEM_ICON_LABELS } from './types'

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function clampLevel(level: number): number {
  return Math.min(3, Math.max(1, level))
}

export function pickMixedOp(): MathOp {
  return MATH_OPS[randomInt(0, MATH_OPS.length - 1)]!
}

export function generateMathProblem(
  generateOp: (op: MathOp, level: number) => Problem,
  mode: MathOpMode,
  opLevels: MathOpLevels,
): Problem {
  const op = mode === 'mixed' ? pickMixedOp() : mode
  return generateOp(op, opLevels[op])
}

/** Two-digit+ addends; L1 stays in the teens so it starts easy. */
function generateRaceAddition(level: number): Problem {
  const range =
    level <= 1
      ? { min: 10, max: 19 }
      : level === 2
        ? { min: 20, max: 49 }
        : { min: 40, max: 99 }
  const a = randomInt(range.min, range.max)
  const b = randomInt(range.min, range.max)
  return {
    id: uid(),
    type: 'addition',
    prompt: `${a} + ${b}`,
    answer: a + b,
    hint: `Add the ones, then the tens. ${a} + ${b}.`,
    operands: [a, b],
    layout: 'vertical',
  }
}

function generateRaceSubtraction(level: number): Problem {
  let minuend: number
  let subtrahend: number

  if (level <= 1) {
    minuend = randomInt(11, 20)
    subtrahend = randomInt(1, Math.min(9, minuend - 1))
  } else if (level === 2) {
    minuend = randomInt(21, 50)
    subtrahend = randomInt(10, Math.min(20, minuend - 2))
  } else {
    minuend = randomInt(40, 99)
    subtrahend = randomInt(15, Math.min(60, minuend - 5))
  }

  return {
    id: uid(),
    type: 'subtraction',
    prompt: `${minuend} − ${subtrahend}`,
    answer: minuend - subtrahend,
    hint: `Start at ${minuend} and count back ${subtrahend}.`,
    operands: [minuend, subtrahend],
    layout: level >= 2 ? 'vertical' : undefined,
  }
}

function generateRaceMultiplication(level: number): Problem {
  if (level <= 1) {
    const a = randomInt(2, 5)
    const b = randomInt(2, 9)
    return {
      id: uid(),
      type: 'multiplication',
      prompt: `${a} × ${b}`,
      answer: a * b,
      hint: `Try counting by ${a}, ${b} times.`,
      operands: [a, b],
    }
  }

  if (level === 2) {
    const a = randomInt(2, 9)
    const b = randomInt(2, 9)
    return {
      id: uid(),
      type: 'multiplication',
      prompt: `${a} × ${b}`,
      answer: a * b,
      hint: `Try counting by ${a}, ${b} times.`,
      operands: [a, b],
    }
  }

  const a = randomInt(11, 20)
  const b = randomInt(2, 9)
  const tens = a - (a % 10)
  const ones = a % 10
  return {
    id: uid(),
    type: 'multiplication',
    prompt: `${a} × ${b}`,
    answer: a * b,
    hint: `${a} × ${b} = (${tens} × ${b}) + (${ones} × ${b})`,
    operands: [a, b],
    layout: 'vertical',
  }
}

function generateRaceDivision(level: number): Problem {
  let divisor: number
  let quotient: number

  if (level <= 1) {
    divisor = randomInt(2, 5)
    quotient = randomInt(2, 5)
  } else if (level === 2) {
    divisor = randomInt(2, 9)
    quotient = randomInt(2, 9)
  } else {
    divisor = randomInt(2, 9)
    const minQuotient = Math.ceil(40 / divisor)
    const maxQuotient = Math.floor(99 / divisor)
    quotient = randomInt(minQuotient, maxQuotient)
  }

  const dividend = divisor * quotient
  return {
    id: uid(),
    type: 'division',
    prompt: `${dividend} ÷ ${divisor}`,
    answer: quotient,
    hint: `How many groups of ${divisor} fit into ${dividend}?`,
    operands: [dividend, divisor],
    layout: level >= 3 ? 'vertical' : undefined,
  }
}

export function generateRaceOpProblem(op: MathOp, level: number): Problem {
  const clamped = clampLevel(level)
  if (op === 'addition') return generateRaceAddition(clamped)
  if (op === 'subtraction') return generateRaceSubtraction(clamped)
  if (op === 'multiplication') return generateRaceMultiplication(clamped)
  return generateRaceDivision(clamped)
}

function generateAcademyAddition(level: number): Problem {
  if (level <= 1) {
    const a = randomInt(1, 9)
    const b = randomInt(1, 10 - a)
    return {
      id: uid(),
      type: 'addition',
      prompt: `${a} + ${b}`,
      answer: a + b,
      hint: `Start at ${a} and count up ${b} more.`,
      operands: [a, b],
    }
  }

  if (level === 2) {
    const a = randomInt(6, 9)
    const b = randomInt(10 - a + 1, 9)
    return {
      id: uid(),
      type: 'addition',
      prompt: `${a} + ${b}`,
      answer: a + b,
      hint: `Make a 10: ${a} needs ${10 - a} more, then add the rest.`,
      operands: [a, b],
    }
  }

  const a = randomInt(2, 5)
  const b = randomInt(2, 5)

  if (Math.random() < 0.5) {
    return {
      id: uid(),
      type: 'addition',
      prompt: `${a} + ${b}`,
      answer: a + b,
      hint: `Start at ${a} and count up ${b} more.`,
      operands: [a, b],
    }
  }

  const icons = Object.keys(PROBLEM_ICON_LABELS) as ProblemIcon[]
  const icon = icons[randomInt(0, icons.length - 1)]!
  const label = PROBLEM_ICON_LABELS[icon]
  return {
    id: uid(),
    type: 'word-addition',
    prompt: `${a} ${label} + ${b} ${label}`,
    answer: a + b,
    hint: `Count all the pictures together: ${a} and ${b}.`,
    operands: [a, b],
    visualIcon: icon,
  }
}

function generateAcademySubtraction(level: number): Problem {
  let minuend: number
  let subtrahend: number

  if (level <= 1) {
    minuend = randomInt(3, 9)
    subtrahend = randomInt(1, minuend - 1)
  } else if (level === 2) {
    minuend = randomInt(10, 15)
    subtrahend = randomInt(1, 5)
  } else {
    minuend = randomInt(12, 20)
    subtrahend = randomInt(2, Math.min(9, minuend - 1))
  }

  return {
    id: uid(),
    type: 'subtraction',
    prompt: `${minuend} − ${subtrahend}`,
    answer: minuend - subtrahend,
    hint: `Start at ${minuend} and count back ${subtrahend}.`,
    operands: [minuend, subtrahend],
  }
}

function generateAcademyMultiplication(level: number): Problem {
  const a = level <= 1 ? 2 : randomInt(2, 5)
  const b = level <= 1 ? randomInt(2, 5) : level === 2 ? randomInt(2, 5) : randomInt(2, 9)
  return {
    id: uid(),
    type: 'multiplication',
    prompt: `${a} × ${b}`,
    answer: a * b,
    hint: `Try counting by ${a}, ${b} times.`,
    operands: [a, b],
  }
}

function generateAcademyDivision(level: number): Problem {
  const divisor = level <= 1 ? 2 : randomInt(2, 5)
  const quotient =
    level <= 1 ? randomInt(2, 5) : level === 2 ? randomInt(2, 5) : randomInt(2, 8)
  const dividend = divisor * quotient
  return {
    id: uid(),
    type: 'division',
    prompt: `${dividend} ÷ ${divisor}`,
    answer: quotient,
    hint: `How many groups of ${divisor} fit into ${dividend}?`,
    operands: [dividend, divisor],
  }
}

/** Ages 6+: each operation starts tiny and grows on its own track. */
export function generateAcademyOpProblem(op: MathOp, level: number): Problem {
  const clamped = clampLevel(level)
  if (op === 'addition') return generateAcademyAddition(clamped)
  if (op === 'subtraction') return generateAcademySubtraction(clamped)
  if (op === 'multiplication') return generateAcademyMultiplication(clamped)
  return generateAcademyDivision(clamped)
}
