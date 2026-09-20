import { describe, expect, it } from 'vitest'
import { gradePython, PYTHON_CHALLENGES } from './challenges'

describe('python graders', () => {
  it('accepts the hello print', () => {
    expect(gradePython(PYTHON_CHALLENGES.hello!, 'Hello, Basicbot!\n', false).ok).toBe(true)
    expect(gradePython(PYTHON_CHALLENGES.hello!, 'hi\n', false).ok).toBe(false)
  })

  it('requires the robot to reach the flag for drive', () => {
    const challenge = PYTHON_CHALLENGES.drive!
    expect(gradePython(challenge, '', false).ok).toBe(false)
    expect(gradePython(challenge, '', true).ok).toBe(true)
  })
})
