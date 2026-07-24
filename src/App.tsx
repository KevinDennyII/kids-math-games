import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home'
import { RaceGame } from './games/race/RaceGame'
import { AcademyGame } from './games/academy/AcademyGame'
import { TypingGame } from './games/typing/TypingGame'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/race" element={<RaceGame />} />
        <Route path="/academy" element={<AcademyGame />} />
        <Route path="/typing" element={<TypingGame />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
