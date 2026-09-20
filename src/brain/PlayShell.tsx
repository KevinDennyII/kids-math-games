import { type ReactNode } from 'react'
import { BrainHeader } from './BrainHeader'
import { useBrainAudio } from './audio'
import { brainGameById, type BrainGameId } from './catalog'
import { brainPath } from './host'

type Props = {
  title?: string
  gameId?: BrainGameId
  children: ReactNode
  hideBack?: boolean
  embed?: boolean
}

export function PlayShell({
  title,
  gameId,
  children,
  hideBack = false,
  embed = false,
}: Props) {
  const { muted, setMuted } = useBrainAudio()
  const game = gameId ? brainGameById(gameId) : undefined
  const heading = title ?? game?.title ?? 'Brain Games'

  const body = children

  if (embed) {
    return <>{body}</>
  }

  return (
    <section className="brain-play">
      <BrainHeader
        title={heading}
        muted={muted}
        onToggleMute={() => setMuted(!muted)}
        backTo={hideBack ? undefined : brainPath()}
      />
      {game ? (
        <>
          <p className="brain-skill">{game.skill}</p>
          <p className="brain-why">{game.why}</p>
        </>
      ) : null}
      {body}
    </section>
  )
}
