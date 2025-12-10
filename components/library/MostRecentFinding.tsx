import { LocalTime } from '../../islands/LocalTime.tsx'
import { Maybe, RenderedFindingRelativeToHealthWorker } from '../../types.ts'
import { cls } from '../../util/cls.ts'
import { FindingPanel } from './FindingPanel.tsx'

export function MostRecentFinding(
  { finding, organization_id }: {
    finding: Maybe<RenderedFindingRelativeToHealthWorker>
    organization_id: string
  },
) {
  if (!finding) return null
  return (
    <span
      className={cls(
        'relative text-gray-500 group pb-2',
        {
          'opacity-50': finding.existence !== 'yes',
        },
      )}
      id={`most-recent-finding-${
        finding.pertaining_to_key || finding.record_id
      }`}
    >
      <a
        href={`#most-recent-finding-${
          finding.pertaining_to_key || finding.record_id
        }`}
        className='text-blue-500'
      >
        {finding.value_display}
      </a>
      &nbsp;recorded&nbsp;
      <LocalTime timestamp={finding.created_at} />

      <div className='absolute left-0 z-50 hidden pt-2 top-full group-hover:block hover:block opacity-100'>
        <FindingPanel finding={finding} organization_id={organization_id} />
      </div>
    </span>
  )
}
