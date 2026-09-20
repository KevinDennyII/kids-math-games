import { type ReactNode } from 'react'
import { Navigate, Route } from 'react-router-dom'
import { BrainHub } from './BrainHub'
import { ColorCatchPlay } from './play/ColorCatch'
import { DailySpark } from './play/DailySpark'
import { EchoPathPlay } from './play/EchoPath'
import { FlashFindPlay } from './play/FlashFind'
import { HoldFastPlay } from './play/HoldFast'
import { PatternPeekPlay } from './play/PatternPeek'
import { ShapeTwistPlay } from './play/ShapeTwist'

export function brainGameRouteNodes(unknownTarget: string): ReactNode {
  return (
    <>
      <Route index element={<BrainHub />} />
      <Route path="daily" element={<DailySpark />} />
      <Route path="flash" element={<FlashFindPlay />} />
      <Route path="echo" element={<EchoPathPlay />} />
      <Route path="color" element={<ColorCatchPlay />} />
      <Route path="hold" element={<HoldFastPlay />} />
      <Route path="twist" element={<ShapeTwistPlay />} />
      <Route path="pattern" element={<PatternPeekPlay />} />
      <Route path="*" element={<Navigate to={unknownTarget} replace />} />
    </>
  )
}
