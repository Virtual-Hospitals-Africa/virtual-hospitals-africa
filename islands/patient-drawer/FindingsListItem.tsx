import { JSX } from 'preact'
import type { Finding } from './FindingsListItemSchema.ts'

export function FindingsListItem(
  { finding }: {
    finding: Finding
  },
): JSX.Element {
  return (
    <li>
      <a href={finding.edit_href}>
        {finding.text}
        {finding.additional_notes && <p>{finding.additional_notes}</p>}
      </a>
    </li>
  )
}
