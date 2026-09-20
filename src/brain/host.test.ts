import { describe, expect, it } from 'vitest'
import {
  brainPath,
  brainSiteUrl,
  isBrainHost,
  isLocalHost,
  shouldPreviewBrainOnMathHost,
} from './host'

describe('brain host', () => {
  it('treats the braingames subdomain as the Brain Games site', () => {
    expect(isBrainHost('braingames.dennymathgames.online')).toBe(true)
    expect(isBrainHost('braingames.localhost')).toBe(true)
    expect(isBrainHost('dennymathgames.online')).toBe(false)
    expect(isBrainHost('coding.dennymathgames.online')).toBe(false)
    expect(isBrainHost('localhost')).toBe(false)
  })

  it('sends production math-host visitors to the brain subdomain', () => {
    expect(
      brainSiteUrl({
        protocol: 'https:',
        hostname: 'dennymathgames.online',
        port: '',
      }),
    ).toBe('https://braingames.dennymathgames.online/')
  })

  it('keeps a local preview path on localhost', () => {
    expect(isLocalHost('localhost')).toBe(true)
    expect(shouldPreviewBrainOnMathHost('localhost')).toBe(true)
    expect(shouldPreviewBrainOnMathHost('dennymathgames.online')).toBe(false)
    expect(
      brainSiteUrl({
        protocol: 'http:',
        hostname: 'localhost',
        port: '5173',
      }),
    ).toBe('http://localhost:5173/brain')
  })

  it('uses site-root paths when window is not present', () => {
    expect(brainPath()).toBe('/')
    expect(brainPath('flash')).toBe('/flash')
  })
})
