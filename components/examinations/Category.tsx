import SectionHeader from '../library/typography/SectionHeader.tsx'
import { RenderedPatientExamination } from '../../types.ts'
import type { ChecklistItem } from '../../islands/examinations/ChecklistItem.tsx'
import { ExaminationChecklist } from './Checklist.tsx'

type ExaminationCategoryProps = {
  patient_examination_href: string
  category: string
  checklist: ChecklistItem[]
  subcategories: {
    subcategory: string
    checklist: ChecklistItem[]
  }[]
  findings: RenderedPatientExamination['findings']
}

export function ExaminationCategory(
  { patient_examination_href, category, checklist, subcategories, ...rest }:
    ExaminationCategoryProps,
) {
  return (
    <div className='flex flex-col mb-5'>
      <SectionHeader className='mb-1 text-[20px]'>
        {category}
      </SectionHeader>
      <ExaminationChecklist
        patient_examination_href={patient_examination_href}
        checklist={checklist}
        {...rest}
      />
      {subcategories.map(({ subcategory, checklist }) => (
        <ExaminationChecklist
          key={subcategory}
          subcategory={subcategory}
          checklist={checklist}
          patient_examination_href={patient_examination_href}
          {...rest}
        />
      ))}
    </div>
  )
}
