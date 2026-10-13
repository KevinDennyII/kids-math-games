export type Fraction = {
  numerator: number
  denominator: number
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y !== 0) {
    const next = x % y
    x = y
    y = next
  }
  return x || 1
}

export function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b)
}

export function simplifyFraction(fraction: Fraction): Fraction {
  const divisor = gcd(fraction.numerator, fraction.denominator)
  return {
    numerator: fraction.numerator / divisor,
    denominator: fraction.denominator / divisor,
  }
}

export function addFractions(left: Fraction, right: Fraction): Fraction {
  const den = lcm(left.denominator, right.denominator)
  const numerator =
    left.numerator * (den / left.denominator) +
    right.numerator * (den / right.denominator)
  return simplifyFraction({ numerator, denominator: den })
}

export function formatFraction(fraction: Fraction): string {
  const simplified = simplifyFraction(fraction)
  if (simplified.denominator === 1) return String(simplified.numerator)
  return `${simplified.numerator}/${simplified.denominator}`
}

/** Parse kid answers like "3/4", "1", or "1 1/2". */
export function parseFractionInput(raw: string): Fraction | null {
  const text = raw.trim().replace(/\s+/g, ' ')
  if (!text) return null

  const mixed = text.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/)
  if (mixed) {
    const whole = Number(mixed[1])
    const numerator = Number(mixed[2])
    const denominator = Number(mixed[3])
    if (!denominator || Number.isNaN(whole + numerator)) return null
    return { numerator: whole * denominator + numerator, denominator }
  }

  const slash = text.match(/^(\d+)\s*\/\s*(\d+)$/)
  if (slash) {
    const numerator = Number(slash[1])
    const denominator = Number(slash[2])
    if (!denominator || Number.isNaN(numerator)) return null
    return { numerator, denominator }
  }

  if (/^\d+$/.test(text)) {
    return { numerator: Number(text), denominator: 1 }
  }

  return null
}

/** True when the typed value equals the expected fraction (any equivalent form). */
export function matchesFractionAnswer(
  value: string,
  expected: Fraction,
): boolean {
  const guess = parseFractionInput(value)
  if (!guess) return false
  return (
    guess.numerator * expected.denominator ===
    expected.numerator * guess.denominator
  )
}
