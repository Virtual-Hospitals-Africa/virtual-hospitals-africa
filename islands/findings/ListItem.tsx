import { JSX } from 'preact'
import { RenderedPatientExaminationFinding } from '../../types.ts'

export function FindingsListItem(
  { finding }: {
    finding: RenderedPatientExaminationFinding
  },
): JSX.Element {
  return (
    <li>
      <a href={finding.edit_href}>
        {finding.text}
      </a>
    </li>
  )
}
