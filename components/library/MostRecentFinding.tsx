import { LocalTime } from '../../islands/LocalTime.tsx'
import { Maybe, RenderedFindingRelativeToHealthWorker } from '../../types.ts'
import { FindingPanel } from './FindingPanel.tsx'

export function MostRecentFinding(
  { finding }: { finding: Maybe<RenderedFindingRelativeToHealthWorker> },
) {
  if (!finding) return null
  return (
    <div className='relative flex text-gray-500 group'>
      <a href='#' className='text-blue-500'>
        {finding.name}
      </a>
      &nbsp;
      <LocalTime timestamp={finding.created_at} />

      <div className='absolute left-0 z-50 hidden mt-2 top-full group-hover:block'>
        <FindingPanel finding={finding} />
      </div>
    </div>
  )
}
