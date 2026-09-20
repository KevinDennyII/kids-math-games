import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useGameMusic } from '../shared/audio/useGameMusic'
import { BrainAudioContext } from './audio'
import { BRAIN_HOST, shouldPreviewBrainOnMathHost } from './host'
import './brain.css'

export function BrainLayout() {
  const audio = useGameMusic('brain')

  useEffect(() => {
    document.title = 'Brain Games'
  }, [])

  return (
    <BrainAudioContext.Provider value={audio}>
      <div className="brain-shell">
        <div className="brain-glow" aria-hidden="true" />
        <Outlet />
      </div>
    </BrainAudioContext.Provider>
  )
}

function RedirectToBrainSite() {
  useEffect(() => {
    window.location.replace(`${window.location.protocol}//${BRAIN_HOST}/`)
  }, [])
  return <p>Opening Brain Games…</p>
}

export function MathBrainLayout() {
  if (shouldPreviewBrainOnMathHost(window.location.hostname)) {
    return <BrainLayout />
  }
  return <RedirectToBrainSite />
}
