import './scorePop.css'

type Props = {
  points: number | null
  keyId: number
}

export function ScorePop({ points, keyId }: Props) {
  if (points == null || points <= 0) return null
  return (
    <div key={keyId} className="score-pop" aria-live="polite">
      +{points}
    </div>
  )
}
