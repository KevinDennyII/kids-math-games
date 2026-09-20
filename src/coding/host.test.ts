import { describe, expect, it } from 'vitest'
import {
  codingSiteUrl,
  isCodingHost,
  isLocalHost,
  shouldPreviewPythonOnMathHost,
} from './host'

describe('coding host', () => {
  it('treats the coding subdomain as the Python site', () => {
    expect(isCodingHost('coding.dennymathgames.online')).toBe(true)
    expect(isCodingHost('coding.localhost')).toBe(true)
    expect(isCodingHost('dennymathgames.online')).toBe(false)
    expect(isCodingHost('localhost')).toBe(false)
  })

  it('sends production math-host visitors to the coding subdomain', () => {
    expect(
      codingSiteUrl({
        protocol: 'https:',
        hostname: 'dennymathgames.online',
        port: '',
      }),
    ).toBe('https://coding.dennymathgames.online/')
  })

  it('keeps a local preview path on localhost', () => {
    expect(isLocalHost('localhost')).toBe(true)
    expect(shouldPreviewPythonOnMathHost('localhost')).toBe(true)
    expect(shouldPreviewPythonOnMathHost('dennymathgames.online')).toBe(false)
    expect(
      codingSiteUrl({
        protocol: 'http:',
        hostname: 'localhost',
        port: '5173',
      }),
    ).toBe('http://localhost:5173/coding')
  })
})
