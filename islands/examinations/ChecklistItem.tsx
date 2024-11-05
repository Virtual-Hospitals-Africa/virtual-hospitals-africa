import { useEffect } from 'preact/hooks'
import { useSignal } from '@preact/signals'
import { addFinding, removeFinding } from '../findings/Drawer.tsx'
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
    const code = hash.slice(edit_hash.length)
    return code === checklist_item.code
  }

  function isAdding(): boolean {
    const { hash } = self.location
    if (!hash.startsWith(add_hash)) return false
    const code = hash.slice(add_hash.length)
    return code === checklist_item.code
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
            snomed_code: checklist_item.body_sites[0].code,
            snomed_english_term: checklist_item.body_sites[0].english_term,
          }]
          : [],
        additional_notes: null,
      }
    }
  }, [adding.value, item.value])

  console.log('item', item.value)

  return (
    <CheckboxGridItem
      label={checklist_item.checklist_label}
      checked={!!item.value}
      onChange={(value) => {
        if (value) {
          self.location.hash = add_hash + checklist_item.code
        } else {
          item.value = undefined
          removeFinding(checklist_item.code)
        }
      }}
    >
      <ExaminationFindingDialog
        action={editing.value ? 'Edit' : 'Add'}
        open={(editing.value || adding.value) && !!item.value}
        checklist_item={checklist_item}
        found={item.value}
        close={() => {
          self.location.hash = ''
        }}
        save={(finding) => {
          console.log('welkwekllkwe', finding)
          let text = checklist_item.english_term
          // TODO handle multiple body sites
          if (finding.body_sites.length) {
            text += ` affecting ${finding.body_sites[0].snomed_english_term}`
          }

          addFinding({
            snomed_code: checklist_item.code,
            text,
            edit_href,
            additional_notes: finding.additional_notes,
          })
        }}
      />
    </CheckboxGridItem>
  )
}
