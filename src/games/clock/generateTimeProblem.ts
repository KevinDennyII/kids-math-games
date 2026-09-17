import {
  skillForLevel,
  type ClockMode,
  type ClockProblem,
  type ClockSkill,
} from './timeTypes'

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(items: readonly T[]): T {
  return items[randInt(0, items.length - 1)]!
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = randInt(0, i)
    ;[next[i], next[j]] = [next[j]!, next[i]!]
  }
  return next
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

export function formatDigital(hours: number, minutes: number) {
  return `${hours}:${pad2(minutes)}`
}

/** Kid-friendly spoken forms used in early levels. */
export function formatWords(hours: number, minutes: number): string {
  if (minutes === 0) return `${hours} o’clock`
  if (minutes === 15) return `quarter past ${hours}`
  if (minutes === 30) return `half past ${hours}`
  if (minutes === 45) {
    const next = hours === 12 ? 1 : hours + 1
    return `quarter to ${next}`
  }
  if (minutes < 30) return `${minutes} past ${hours}`
  const to = 60 - minutes
  const next = hours === 12 ? 1 : hours + 1
  return `${to} to ${next}`
}

function eventPrompt(hours: number, minutes: number, mode: ClockMode): string {
  const digital = formatDigital(hours, minutes)
  const events = [
    'puppy snack',
    'kitty cuddle',
    'unicorn stretch',
    'fox cheer',
    'bunny boost',
    'pit stop',
    'nitro lap',
    'friendship parade',
  ]
  const event = pick(events)
  if (mode === 'read') {
    return `What time is it for the ${event}?`
  }
  return `Set the track clock to ${digital} for the ${event}.`
}

function minutesForSkill(skill: ClockSkill): number {
  switch (skill) {
    case 'oclock':
      return 0
    case 'half':
      return 30
    case 'quarter':
      return pick([15, 45])
    case 'five':
      return pick([5, 10, 20, 25, 35, 40, 50, 55])
    case 'mixed':
      return pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55])
  }
}

function modeForSkill(skill: ClockSkill): ClockMode {
  // Research: both reading and positioning hands; start with read, then mix in set.
  if (skill === 'oclock') return 'read'
  if (skill === 'half') return Math.random() < 0.55 ? 'read' : 'set'
  return Math.random() < 0.5 ? 'read' : 'set'
}

/**
 * Common clock-reading mistakes from classroom research
 * (numeral-as-minutes, hand swaps, hour not advanced on half/quarter).
 */
function buildDistractors(
  hours: number,
  minutes: number,
  skill: ClockSkill,
): string[] {
  const correct = formatDigital(hours, minutes)
  const nextHour = hours === 12 ? 1 : hours + 1
  const prevHour = hours === 1 ? 12 : hours - 1
  const minuteNumeral = minutes === 0 ? 12 : minutes / 5
  const candidates = new Set<string>()

  candidates.add(formatDigital(hours, 0))
  candidates.add(formatDigital(nextHour, 0))
  candidates.add(formatDigital(prevHour, minutes))
  candidates.add(formatDigital(hours, minutes === 30 ? 0 : 30))
  candidates.add(formatDigital(hours, minutes === 15 ? 45 : 15))
  candidates.add(formatDigital(nextHour, minutes))
  // Classic error: read the minute-hand numeral as the hour
  if (Number.isInteger(minuteNumeral) && minuteNumeral >= 1 && minuteNumeral <= 12) {
    candidates.add(formatDigital(minuteNumeral, 0))
    candidates.add(formatDigital(minuteNumeral, minutes))
  }
  // Hand-swap style distractor: treat hour numeral as minutes × 5
  const swapMinutes = hours === 12 ? 0 : Math.min(55, hours * 5)
  const swapHour = Math.max(1, Math.min(12, Math.round(minutes / 5) || 12))
  candidates.add(formatDigital(swapHour, swapMinutes))

  if (skill === 'quarter' || skill === 'mixed') {
    candidates.add(formatDigital(hours, 45))
    candidates.add(formatDigital(nextHour, 15))
  }
  if (skill === 'five' || skill === 'mixed') {
    const nearby = [minutes - 5, minutes + 5, minutes - 10, minutes + 10]
      .map((m) => ((m % 60) + 60) % 60)
    for (const m of nearby) candidates.add(formatDigital(hours, m))
  }

  candidates.delete(correct)
  const list = shuffle([...candidates]).filter((c) => /^\d{1,2}:\d{2}$/.test(c))
  return list.slice(0, 3)
}

function hintFor(hours: number, minutes: number, skill: ClockSkill, mode: ClockMode) {
  if (mode === 'set') {
    if (minutes === 0) {
      return `Short hour hand on ${hours}. Long minute hand straight up at 12.`
    }
    if (minutes === 30) {
      return `Long hand straight down at 6. Short hand halfway past ${hours}.`
    }
    if (minutes === 15) {
      return `Long hand on 3 (quarter past). Short hand a little past ${hours}.`
    }
    if (minutes === 45) {
      const next = hours === 12 ? 1 : hours + 1
      return `Long hand on 9 (quarter to ${next}). Short hand almost at ${next}.`
    }
    const jumps = minutes / 5
    return `Count by 5s to ${minutes}: the long hand lands on ${jumps}. Short hand creeps past ${hours}.`
  }

  switch (skill) {
    case 'oclock':
      return `When the long hand is on 12, the short hand tells the hour — here it’s ${hours}.`
    case 'half':
      return `Long hand on 6 means half past. The short hand sits between ${hours} and the next hour.`
    case 'quarter':
      return minutes === 15
        ? `Long hand on 3 → quarter past ${hours}.`
        : `Long hand on 9 → quarter to the next hour.`
    case 'five':
    case 'mixed':
      return `Count by 5s around the clock for minutes. Each number is 5 minutes.`
  }
}

export function generateTimeProblem(level: number): ClockProblem {
  const skill = skillForLevel(level)
  const mode = modeForSkill(skill)
  const hours = randInt(1, 12)
  const minutes = minutesForSkill(skill)
  const answerDigital = formatDigital(hours, minutes)
  const answerWords = formatWords(hours, minutes)
  const distractors = buildDistractors(hours, minutes, skill)
  const choices = shuffle([answerDigital, ...distractors]).slice(0, 4)
  if (!choices.includes(answerDigital)) {
    choices[randInt(0, choices.length - 1)] = answerDigital
  }

  return {
    id: `${Date.now()}-${hours}-${minutes}-${mode}`,
    mode,
    skill,
    hours,
    minutes,
    prompt: eventPrompt(hours, minutes, mode),
    hint: hintFor(hours, minutes, skill, mode),
    answerDigital,
    answerWords,
    choices,
  }
}

/** Snap dragged minute angle to the nearest 5-minute mark (levels 1–4). */
export function snapMinutes(rawMinutes: number, level: number) {
  const clamped = ((rawMinutes % 60) + 60) % 60
  if (level >= 5) return Math.round(clamped)
  return (Math.round(clamped / 5) * 5) % 60
}

export function anglesFromTime(hours: number, minutes: number) {
  const minuteAngle = minutes * 6
  const hourAngle = (hours % 12) * 30 + minutes * 0.5
  return { hourAngle, minuteAngle }
}

/** Generous kid-friendly tolerance for set-the-hands checks. */
export function isSetCorrect(
  targetH: number,
  targetM: number,
  guessH: number,
  guessM: number,
  level: number,
) {
  const minuteSlack = level >= 5 ? 2 : 0
  const minuteOk =
    Math.min(
      Math.abs(guessM - targetM),
      60 - Math.abs(guessM - targetM),
    ) <= minuteSlack

  // Hour must match, allowing the continuous hand to sit between numerals.
  const hourOk = guessH === targetH
  return minuteOk && hourOk
}
