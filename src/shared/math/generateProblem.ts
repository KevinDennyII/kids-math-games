import type { Problem } from './types'

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/** Son (8): multiplication → simple fractions */
export function generateRaceProblem(level: number): Problem {
  const clamped = Math.min(3, Math.max(1, level))

  if (clamped === 1) {
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

  if (clamped === 2) {
    const a = randomInt(11, 25)
    const b = randomInt(2, 9)
    return {
      id: uid(),
      type: 'multiplication',
      prompt: `${a} × ${b}`,
      answer: a * b,
      hint: `${a} × ${b} = (${a - (a % 10)} × ${b}) + (${a % 10} × ${b})`,
      operands: [a, b],
    }
  }

  const wholes = [20, 40, 48, 50, 60, 80, 100]
  const whole = wholes[randomInt(0, wholes.length - 1)]!
  const isHalf = Math.random() < 0.5
  if (isHalf) {
    return {
      id: uid(),
      type: 'fraction',
      prompt: `Half of ${whole}`,
      answer: whole / 2,
      hint: `Half means divide by 2. ${whole} ÷ 2 = ?`,
      operands: [whole, 2],
    }
  }
  return {
    id: uid(),
    type: 'fraction',
    prompt: `Quarter of ${whole}`,
    answer: whole / 4,
    hint: `A quarter means divide by 4. ${whole} ÷ 4 = ?`,
    operands: [whole, 4],
  }
}

/** Daughter (6): addition within 10 → crossing 10 → word problems */
export function generateAcademyProblem(level: number): Problem {
  const clamped = Math.min(3, Math.max(1, level))

  if (clamped === 1) {
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

  if (clamped === 2) {
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

  // Level 3: mix picture counts with plain number sums
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

  const themes = [
    { icon: 'dog' as const, label: 'puppies' },
    { icon: 'cat' as const, label: 'kitties' },
    { icon: 'unicorn' as const, label: 'unicorns' },
    { icon: 'fox' as const, label: 'fox friends' },
  ]
  const theme = themes[randomInt(0, themes.length - 1)]!
  return {
    id: uid(),
    type: 'word-addition',
    prompt: `${a} ${theme.label} + ${b} ${theme.label}`,
    answer: a + b,
    hint: `Count all the pictures together: ${a} and ${b}.`,
    operands: [a, b],
    visualIcon: theme.icon,
  }
}
