import { RenderedPatientExaminationFinding } from '../../types.ts'
import { FindingsHeader } from './Header.tsx'
import { FindingsList } from './List.tsx'
import { useSignal } from '@preact/signals'
import { useEffect } from 'preact/hooks'
import { assert } from 'std/assert/assert.ts'
import { assertHasNonEmptyString } from '../../util/isString.ts'

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

export function removeFinding(snomed_code: string) {
  self.dispatchEvent(
    new CustomEvent(REMOVE_EXAMINATION_FINDING_EVENT_NAME, {
      detail: { snomed_code },
    }),
  )
}

export function FindingsDrawer(
  props: { findings: RenderedPatientExaminationFinding[] },
) {
  const findings = useSignal(props.findings)

  function onAdd(event: unknown) {
    assert(event instanceof CustomEvent)
    assertHasNonEmptyString(event.detail, 'snomed_code')
    assertHasNonEmptyString(event.detail, 'text')
    assertHasNonEmptyString(event.detail, 'edit_href')
    const additional_notes = 'additional_notes' in event.detail &&
        typeof event.detail.additional_notes === 'string'
      ? event.detail.additional_notes
      : null

    const finding = { ...event.detail, additional_notes }

    const existing_finding_of_code = findings.value.findIndex(
      (finding) => finding.snomed_code === event.detail.snomed_code,
    )

    findings.value = existing_finding_of_code === -1
      ? [...findings.value, finding]
      : findings.value.map((f, index) =>
        index === existing_finding_of_code ? finding : f
      )
  }

  function onRemove(event: unknown) {
    assert(event instanceof CustomEvent)
    assertHasNonEmptyString(event.detail, 'snomed_code')
    findings.value = findings.value?.filter(
      (finding) => finding.snomed_code !== event.detail.snomed_code,
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

  return (
    <div className='flex h-full flex-col overflow-y-scroll bg-white shadow-xl'>
      <FindingsHeader />
      <FindingsList findings={findings.value} />
    </div>
  )
}
