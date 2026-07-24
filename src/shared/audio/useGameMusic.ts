import { useEffect, useState } from 'react'
import { musicEngine, type MusicTheme, type SfxKind } from './musicEngine'

const MUTE_KEY = 'kids-math-music-muted'

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

function writeMuted(muted: boolean) {
  try {
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0')
  } catch {
    // ignore quota / private mode
  }
}

export function useGameMusic(theme: MusicTheme) {
  const [muted, setMutedState] = useState(readMuted)

  useEffect(() => {
    musicEngine.setMuted(muted)
  }, [muted])

  useEffect(() => {
    const start = () => {
      void musicEngine.playTheme(theme)
    }

    // Browsers often block autoplay until a gesture.
    start()
    const unlock = () => {
      start()
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
    window.addEventListener('pointerdown', unlock)
    window.addEventListener('keydown', unlock)

    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
      musicEngine.stop()
    }
  }, [theme])

  const setMuted = (next: boolean) => {
    setMutedState(next)
    writeMuted(next)
    musicEngine.setMuted(next)
    if (!next) {
      void musicEngine.playTheme(theme)
    }
  }

  const playSfx = (kind: SfxKind) => {
    void musicEngine.playSfx(kind)
  }

  return { muted, setMuted, playSfx }
}
