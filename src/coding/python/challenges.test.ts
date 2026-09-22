import { describe, expect, it } from 'vitest'
import { gradePython, PYTHON_CHALLENGES } from './challenges'

describe('python graders', () => {
  it('accepts the hello print', () => {
    expect(gradePython(PYTHON_CHALLENGES.hello!, 'Hello, Python!\n', false).ok).toBe(true)
    expect(gradePython(PYTHON_CHALLENGES.hello!, 'hi\n', false).ok).toBe(false)
  })

  it('accepts the memory tile list with two of each name', () => {
    const challenge = PYTHON_CHALLENGES.memory!
    expect(
      gradePython(challenge, "['creeper', 'chicken', 'creeper', 'chicken']\n", false).ok,
    ).toBe(true)
    expect(gradePython(challenge, "['creeper', 'chicken']\n", false).ok).toBe(false)
  })

  it('accepts the chest list lesson', () => {
    expect(gradePython(PYTHON_CHALLENGES.lists!, 'torch\n3\n', false).ok).toBe(true)
  })

  it('requires the robot to reach the flag for drive', () => {
    const challenge = PYTHON_CHALLENGES.drive!
    expect(gradePython(challenge, '', false).ok).toBe(false)
    expect(gradePython(challenge, '', true).ok).toBe(true)
  })
})
