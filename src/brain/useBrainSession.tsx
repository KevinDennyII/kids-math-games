import { useState } from 'react'
import { BurstParticles } from '../shared/motion/BurstParticles'
import { ScorePop } from '../shared/motion/ScorePop'
import { useBrainAudio } from './audio'
import type { BrainGameId } from './catalog'
import { useBrainStore } from './store'

export function useBrainSession(gameId: BrainGameId) {
  const state = useBrainStore((s) => s.games[gameId])
  const recordAnswer = useBrainStore((s) => s.recordAnswer)
  const { playSfx } = useBrainAudio()
  const [pop, setPop] = useState<{ points: number | null; key: number }>({
    points: null,
    key: 0,
  })
  const [burst, setBurst] = useState(0)
  const [feedback, setFeedback] = useState<'ok' | 'miss' | null>(null)

  function note(correct: boolean) {
    const result = recordAnswer(gameId, correct)
    playSfx(correct ? 'correct' : 'wrong')
    setFeedback(correct ? 'ok' : 'miss')
    if (correct) {
      setPop({ points: result.pointsEarned, key: result.state.solved })
      setBurst((key) => key + 1)
    } else {
      setPop({ points: null, key: 0 })
    }
    return result
  }

  const fx = (
    <>
      <BurstParticles trigger={burst} palette="brain" />
      <ScorePop points={pop.points} keyId={pop.key} />
    </>
  )

  return { state, note, feedback, setFeedback, fx, playSfx }
}
