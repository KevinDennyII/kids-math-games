import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home'
import { RaceGame } from './games/race/RaceGame'
import { AcademyGame } from './games/academy/AcademyGame'
import { TypingGame } from './games/typing/TypingGame'
import { ClockGame } from './games/clock/ClockGame'
import { PythonLab } from './coding/CodeTrack'
import {
  CODING_HOST,
  isCodingHost,
  shouldPreviewPythonOnMathHost,
} from './coding/host'
import {
  BrainLayout,
  MathBrainLayout,
} from './brain/BrainApp'
import { brainGameRouteNodes } from './brain/brainRoutes'
import { isBrainHost } from './brain/host'

function RedirectToCodingSite() {
  useEffect(() => {
    window.location.replace(`${window.location.protocol}//${CODING_HOST}/`)
  }, [])
  return <p>Opening Python Lab…</p>
}

function MathCodingPath() {
  if (shouldPreviewPythonOnMathHost(window.location.hostname)) {
    return <PythonLab />
  }
  return <RedirectToCodingSite />
}

export default function App() {
  if (isCodingHost(window.location.hostname)) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PythonLab />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    )
  }

  if (isBrainHost(window.location.hostname)) {
    return (
      <BrowserRouter>
        <Routes>
          <Route element={<BrainLayout />}>{brainGameRouteNodes('/')}</Route>
        </Routes>
      </BrowserRouter>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/race" element={<RaceGame />} />
        <Route path="/academy" element={<AcademyGame />} />
        <Route path="/clock" element={<ClockGame />} />
        <Route path="/typing" element={<TypingGame />} />
        <Route path="/coding" element={<MathCodingPath />} />
        <Route path="/coding/*" element={<MathCodingPath />} />
        <Route path="/brain" element={<MathBrainLayout />}>
          {brainGameRouteNodes('/brain')}
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
