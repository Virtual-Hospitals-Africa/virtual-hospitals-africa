import { RenderedPatientExaminationFinding } from '../../types.ts'
import { FindingsListItem } from './ListItem.tsx'

export function FindingsList(
  { findings }: { findings: RenderedPatientExaminationFinding[] },
) {
  return (
    <ul
      role='list'
      className='overflow-y-auto'
    >
      {findings.map((finding) => (
        <FindingsListItem
          key={finding.edit_href}
          finding={finding}
        />
      ))}
    </ul>
  )
}
