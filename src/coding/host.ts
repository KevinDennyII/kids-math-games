/** Same Netlify deploy; two hostnames, two sites. */

export const MATH_HOST = 'dennymathgames.online'
export const CODING_HOST = 'coding.dennymathgames.online'

export function isCodingHost(hostname: string): boolean {
  return hostname === CODING_HOST || hostname.startsWith('coding.')
}

export function isLocalHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
}

type LocationBits = {
  protocol: string
  hostname: string
  port: string
}

/** Canonical Python Lab URL for the current environment. */
export function codingSiteUrl(loc: LocationBits): string {
  const port = loc.port ? `:${loc.port}` : ''
  if (isCodingHost(loc.hostname)) {
    return `${loc.protocol}//${loc.hostname}${port}/`
  }
  if (isLocalHost(loc.hostname)) {
    return `${loc.protocol}//${loc.hostname}${port}/coding`
  }
  return `${loc.protocol}//${CODING_HOST}/`
}

export function shouldPreviewPythonOnMathHost(
  hostname: string,
): boolean {
  return isLocalHost(hostname)
}
