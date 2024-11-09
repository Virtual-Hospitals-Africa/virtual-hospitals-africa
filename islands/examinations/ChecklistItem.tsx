import { useEffect } from 'preact/hooks'
import { useSignal } from '@preact/signals'
import { addFinding, removeFinding } from '../patient-drawer/FindingsList.tsx'
import { CheckboxGridItem } from '../../islands/form/Inputs.tsx'
import { ExaminationFindingDialog } from './Dialog.tsx'
import type { ExaminationChecklistDefinition } from '../../types.ts'
import { positive_number } from '../../util/validators.ts'

type ExaminationChecklistProps = {
  checklist_item: ExaminationChecklistDefinition
  edit_href: string
  found?: {
    body_sites: {
      snomed_concept_id: number
      snomed_english_term: string
    }[]
    additional_notes: string | null
  }
}

const edit_hash = '#edit='
const add_hash = '#add='

// TODO handle body sites, href, and an interactive dialog
export function ExaminationChecklistItem(
  { edit_href, checklist_item, found }: ExaminationChecklistProps,
) {
  const item = useSignal(found)
  const editing = useSignal(false)
  const adding = useSignal(false)

  function isEditing(): boolean {
    const { hash } = self.location
    if (!hash.startsWith(edit_hash)) return false
    const snomed_concept_id = positive_number.parse(
      hash.slice(edit_hash.length),
    )
    return snomed_concept_id === checklist_item.snomed_concept_id
  }

  function isAdding(): boolean {
    const { hash } = self.location
    if (!hash.startsWith(add_hash)) return false
    const snomed_concept_id = positive_number.parse(hash.slice(add_hash.length))
    return snomed_concept_id === checklist_item.snomed_concept_id
  }

  function onHashChange() {
    editing.value = isEditing()
    adding.value = isAdding()
  }

  useEffect(() => {
    addEventListener('hashchange', onHashChange)
    return () => removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    if (adding.value && !item.value) {
      item.value = {
        body_sites: checklist_item.body_sites?.length
          ? [{
            snomed_concept_id: checklist_item.body_sites[0].snomed_concept_id,
            snomed_english_term:
              checklist_item.body_sites[0].snomed_english_term,
          }]
          : [],
        additional_notes: null,
      }
    }
  }, [adding.value, item.value])

  return (
    <CheckboxGridItem
      label={checklist_item.label}
      checked={!!item.value}
      onChange={(value) => {
        if (value) {
          self.location.hash = add_hash + checklist_item.snomed_concept_id
        } else {
          item.value = undefined
          removeFinding(checklist_item.snomed_concept_id)
        }
      }}
    >
      <ExaminationFindingDialog
        action={editing.value ? 'Edit' : 'Add'}
        open={(editing.value || adding.value) && !!item.value}
        checklist_item={checklist_item}
        found={item.value}
        close={() => {
          if (adding.value) {
            item.value = undefined
          }
          self.location.hash = ''
        }}
        save={(finding) => {
          item.value = finding

          let text = checklist_item.snomed_english_term
          // TODO handle multiple body sites
          if (finding.body_sites.length) {
            text += ` affecting ${finding.body_sites[0].snomed_english_term}`
          }

          addFinding({
            snomed_concept_id: checklist_item.snomed_concept_id,
            text,
            edit_href,
            additional_notes: finding.additional_notes,
            body_sites: finding.body_sites,
          })
          self.location.hash = ''
        }}
      />
    </CheckboxGridItem>
  )
}
