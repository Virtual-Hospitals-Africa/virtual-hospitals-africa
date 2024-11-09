import { RenderedPatientExaminationFinding } from '../../types.ts'
import { useSignal } from '@preact/signals'
import { useEffect } from 'preact/hooks'
import { assert } from 'std/assert/assert.ts'
import { assertHasNonEmptyString } from '../../util/isString.ts'
import { FindingsListItem } from './FindingsListItem.tsx'
import { z } from 'zod'
import { positive_number } from '../../util/validators.ts'

// TODO remove/edit events

const ADD_EXAMINATION_FINDING_EVENT_NAME = 'add_examination_finding'
const REMOVE_EXAMINATION_FINDING_EVENT_NAME = 'remove_examination_finding'

// Rather than prop drilling, we use a custom event to add a finding to the list.
// edit_href navigates to somewhere where you can edit/remove the finding.
export function addFinding(finding: RenderedPatientExaminationFinding) {
  self.dispatchEvent(
    new CustomEvent(ADD_EXAMINATION_FINDING_EVENT_NAME, { detail: finding }),
  )
}

export function removeFinding(snomed_concept_id: number) {
  self.dispatchEvent(
    new CustomEvent(REMOVE_EXAMINATION_FINDING_EVENT_NAME, {
      detail: { snomed_concept_id },
    }),
  )
}

const FindingSchema = z.object({
  snomed_concept_id: positive_number,
  text: z.string(),
  edit_href: z.string(),
  additional_notes: z.string().optional().transform((notes) => notes || null),
  body_sites: z.object({
    snomed_concept_id: positive_number,
    snomed_english_term: z.string(),
  }).array(),
})

export function FindingsList(
  props: { findings: RenderedPatientExaminationFinding[] },
) {
  const findings = useSignal(props.findings)

  function onAdd(event: unknown) {
    assert(event instanceof CustomEvent)
    const finding = FindingSchema.parse(event.detail)

    const existing_finding_of_code = findings.value.findIndex(
      (finding) => finding.snomed_concept_id === event.detail.snomed_concept_id,
    )

    findings.value = existing_finding_of_code === -1
      ? [...findings.value, finding]
      : findings.value.map((f, index) =>
        index === existing_finding_of_code ? finding : f
      )
  }

  function onRemove(event: unknown) {
    assert(event instanceof CustomEvent)
    assertHasNonEmptyString(event.detail, 'snomed_concept_id')
    findings.value = findings.value?.filter(
      (finding) => finding.snomed_concept_id !== event.detail.snomed_concept_id,
    )
  }

  useEffect(() => {
    addEventListener(ADD_EXAMINATION_FINDING_EVENT_NAME, onAdd)
    addEventListener(REMOVE_EXAMINATION_FINDING_EVENT_NAME, onRemove)

    return () => {
      removeEventListener(ADD_EXAMINATION_FINDING_EVENT_NAME, onAdd)
      removeEventListener(REMOVE_EXAMINATION_FINDING_EVENT_NAME, onRemove)
    }
  }, [])

  if (findings.value.length === 0) {
    return (
      <i>
        No findings so far. Clinical notes will appear here as you make them.
      </i>
    )
  }

  return (
    <ul
      role='list'
      className='overflow-y-auto'
    >
      {findings.value.map((finding) => (
        <FindingsListItem
          key={finding.edit_href}
          finding={finding}
        />
      ))}
    </ul>
  )
}
