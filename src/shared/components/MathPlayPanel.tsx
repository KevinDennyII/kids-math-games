import type { Problem } from '../math/types'
import { BurstParticles } from '../motion/BurstParticles'
import { ScorePop } from '../motion/ScorePop'
import { NumberPad } from './NumberPad'
import { ProblemPanel } from './ProblemPanel'

type Props = {
  className: string
  bannerClassName: string
  palette: 'race' | 'academy'
  problem: Problem
  value: string
  onChange: (next: string) => void
  onSubmit: () => void
  feedback: 'idle' | 'correct' | 'wrong'
  hint: string | null
  locked: boolean
  banner: string | null
  burstKey: number
  popPoints: number | null
  popKey: number
}

/** Shared problem + pad panel used by both math games. */
export function MathPlayPanel({
  className,
  bannerClassName,
  palette,
  problem,
  value,
  onChange,
  onSubmit,
  feedback,
  hint,
  locked,
  banner,
  burstKey,
  popPoints,
  popKey,
}: Props) {
  return (
    <section className={className}>
      <BurstParticles trigger={burstKey} palette={palette} />
      <ScorePop points={popPoints} keyId={popKey} />
      <ProblemPanel
        problem={problem}
        value={value}
        onChange={onChange}
        onSubmit={onSubmit}
        feedback={feedback}
        hint={hint}
        disabled={locked}
      />
      {banner ? <p className={bannerClassName}>{banner}</p> : null}
      <NumberPad
        value={value}
        onChange={onChange}
        onSubmit={onSubmit}
        disabled={locked}
      />
    </section>
  )
}
