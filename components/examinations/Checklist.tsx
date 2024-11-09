import SectionHeader from '../library/typography/SectionHeader.tsx'
import { RenderedPatientExamination } from '../../types.ts'
import { ExaminationChecklistItem } from '../../islands/examinations/ChecklistItem.tsx'

export type ExaminationChecklistItem = {
  label: string
  snomed_english_term: string
  code: string
  body_sites: {
    code: string
    snomed_english_term: string
  }[]
}

type ExaminationChecklistProps = {
  patient_examination_href: string
  subcategory?: string
  checklist: ExaminationChecklistItem[]
  findings: RenderedPatientExamination['findings']
}

export function ExaminationChecklist(
  { patient_examination_href, checklist, subcategory, findings }:
    ExaminationChecklistProps,
) {
  return (
    <>
      {subcategory && (
        <SectionHeader className='mb-1 text-[16px]'>
          {subcategory}
        </SectionHeader>
      )}
      {checklist.map((checklist_item) => (
        <ExaminationChecklistItem
          key={checklist_item.code}
          checklist_item={checklist_item}
          edit_href={`${patient_examination_href}#edit=${checklist_item.code}`}
          found={findings.find((finding) =>
            finding.snomed_concept_id === checklist_item.code
          )}
        />
      ))}
    </>
  )
}
