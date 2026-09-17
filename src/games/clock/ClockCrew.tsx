import { CharacterSprite } from '../../shared/characters/CharacterSprite'
import { SPRITES } from '../../shared/characters/sprites'
import { ClockMascot } from './ClockMascot'

type Props = {
  celebrating?: boolean
}

/** Shared Zap + clock mascot + Fox chrome for menu and play. */
export function ClockCrew({ celebrating = false }: Props) {
  return (
    <div className="clock-stage" aria-hidden="true">
      <div className="clock-crew">
        <div className="clock-buddy">
          <CharacterSprite
            src={SPRITES.bunny}
            alt=""
            size="sm"
            motion="hop"
            celebrate={celebrating}
          />
          <span>Zap</span>
        </div>
        <div className={`clock-hero ${celebrating ? 'is-happy' : ''}`}>
          <ClockMascot className="clock-hero-mascot" />
        </div>
        <div className="clock-buddy">
          <CharacterSprite
            src={SPRITES.fox}
            alt=""
            size="sm"
            motion="sway"
            celebrate={celebrating}
          />
          <span>Fox</span>
        </div>
      </div>
    </div>
  )
}
