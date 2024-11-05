import { useEffect } from 'preact/hooks'
import { useSignal } from '@preact/signals'
import { removeFinding } from '../findings/Drawer.tsx'
import { CheckboxGridItem } from '../../islands/form/Inputs.tsx'
import { ExaminationFindingDialog } from './Dialog.tsx'

export type ChecklistItem = {
  checklist_label: string
  code: string
  english_term: string

  body_sites: {
    code: string
    english_term: string
  }[]
}

type ExaminationChecklistProps = {
  checklist_item: ChecklistItem
  edit_href: string
  found?: {
    body_sites: {
      snomed_code: string
      snomed_english_term: string
    }[]
    additional_notes: string | null
  }
}

const edit_hash = '#edit='

// TODO handle body sites, href, and an interactive dialog
export function ExaminationChecklistItem(
  { edit_href, checklist_item, found }: ExaminationChecklistProps,
) {
  const past_item = useSignal(found)
  const item = useSignal(found)
  const editing = useSignal(false)

  function isEditing(): boolean {
    const { hash } = self.location
    if (!hash.startsWith(edit_hash)) return false
    const code = hash.slice(edit_hash.length)
    return code === checklist_item.code
  }

  function onHashChange() {
    editing.value = isEditing()
  }

  useEffect(() => {
    addEventListener('hashchange', onHashChange)
    return () => removeEventListener('hashchange', onHashChange)
  }, [])

  return (
    <CheckboxGridItem
      label={checklist_item.checklist_label}
      checked={!!item.value}
      onChange={(value) => {
        if (value) {
          past_item.value = item.value
          item.value = {
            body_sites: !checklist_item.body_sites.length ? [] : [{
              snomed_code: checklist_item.body_sites[0].code,
              snomed_english_term: checklist_item.body_sites[0].english_term,
            }],
            additional_notes: null,
          }
          self.location.hash = edit_hash + checklist_item.code
        } else {
          item.value = undefined
          removeFinding(checklist_item.code)
        }
      }}
    >
      <ExaminationFindingDialog
        open={editing.value && !!item.value}
        checklist_item={checklist_item}
        edit_href={edit_href}
        found={item}
        close={() => {
          self.location.hash = ''
        }}
        cancel={() => {
          item.value = past_item.value
          self.location.hash = ''
        }}
      />
    </CheckboxGridItem>
  )
}
