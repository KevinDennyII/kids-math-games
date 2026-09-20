/** Same Netlify deploy; Brain Games is its own hostname. */

export const BRAIN_HOST = 'braingames.dennymathgames.online'

export function isBrainHost(hostname: string): boolean {
  return hostname === BRAIN_HOST || hostname.startsWith('braingames.')
}

export function isLocalHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
}

type LocationBits = {
  protocol: string
  hostname: string
  port: string
}

/** Canonical Brain Games URL for the current environment. */
export function brainSiteUrl(loc: LocationBits): string {
  const port = loc.port ? `:${loc.port}` : ''
  if (isBrainHost(loc.hostname)) {
    return `${loc.protocol}//${loc.hostname}${port}/`
  }
  if (isLocalHost(loc.hostname)) {
    return `${loc.protocol}//${loc.hostname}${port}/brain`
  }
  return `${loc.protocol}//${BRAIN_HOST}/`
}

export function shouldPreviewBrainOnMathHost(hostname: string): boolean {
  return isLocalHost(hostname)
}

/** Hub or a game path that works on the brain host and the local /brain preview. */
export function brainPath(gameId?: string): string {
  if (typeof window === 'undefined') {
    return gameId ? `/${gameId}` : '/'
  }
  const home = isBrainHost(window.location.hostname) ? '/' : '/brain'
  if (!gameId) return home
  return home === '/' ? `/${gameId}` : `${home}/${gameId}`
}
