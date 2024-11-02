import { JSX } from 'preact'
import { useSignal } from '@preact/signals'
import SectionHeader from '../../components/library/typography/SectionHeader.tsx'
import { CheckboxGridItem } from '../form/Inputs.tsx'
import { RenderedPatientExamination } from '../../types.ts'
import {
  HEAD_TO_TOE_EXAMINATION_CATEGORIES,
  HEAD_TO_TOE_EXAMINATION_CHECKLIST_BY_SNOMED_CODE,
} from '../../shared/examinations.ts'

type ExaminationChecklistItem = {
  label: string
  snomed_code: string
  body_sites: string[]
}

type ExaminationCategoryProps = {
  category: string
  checklist: ExaminationChecklistItem[]
  subcategories: {
    subcategory: string
    checklist: ExaminationChecklistItem[]
  }[]
  findings: RenderedPatientExamination['findings']
  addFinding(finding: {
    snomed_code: string
    snomed_english_description: string
    body_site_snomed_code: string | null
    body_site_snomed_english_description: string | null
  }): void
  removeFinding(snomed_code: string): void
}

type ExaminationChecklistProps = {
  subcategory?: string
  checklist: ExaminationChecklistItem[]
  findings: RenderedPatientExamination['findings']
  addFinding(finding: {
    snomed_code: string
    snomed_english_description: string
    body_site_snomed_code: string | null
    body_site_snomed_english_description: string | null
  }): void
  removeFinding(snomed_code: string): void
}

function ExaminationChecklist(
  { checklist, subcategory, findings, addFinding, removeFinding }:
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
        <CheckboxGridItem
          label={checklist_item.label}
          checked={findings.some((finding) =>
            finding.snomed_code === checklist_item.snomed_code
          )}
          onChange={(checked) => {
            if (checked) {
              addFinding({
                snomed_code: checklist_item.snomed_code,
                snomed_english_description: checklist_item.label,
                body_site_snomed_code: checklist_item.body_sites[0] ?? null,
                body_site_snomed_english_description: null,
              })
            } else {
              removeFinding(checklist_item.snomed_code)
            }
          }}
        />
      ))}
    </>
  )
}

function ExaminationCategory(
  { category, checklist, subcategories, ...rest }: ExaminationCategoryProps,
) {
  return (
    <div className='flex flex-col mb-5'>
      <SectionHeader className='mb-1 text-[20px]'>
        {category}
      </SectionHeader>
      <ExaminationChecklist
        checklist={checklist}
        {...rest}
      />
      {subcategories.map(({ subcategory, checklist }) => (
        <ExaminationChecklist
          key={subcategory}
          subcategory={subcategory}
          checklist={checklist}
          {...rest}
        />
      ))}
    </div>
  )
}

export function PatientExaminationForm({
  patient_examination,
}: {
  patient_examination: RenderedPatientExamination
}): JSX.Element {
  const findings = useSignal(patient_examination.findings)

  console.log('findings', findings.value)

  return (
    <div
      className='grid'
      style={{
        gridTemplateColumns: '1fr 300px',
      }}
    >
      <div className='sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6'>
        {HEAD_TO_TOE_EXAMINATION_CATEGORIES.map((
          { category, subcategories, checklist },
        ) => (
          <ExaminationCategory
            key={category}
            category={category}
            subcategories={subcategories}
            checklist={checklist}
            findings={findings.value}
            addFinding={(finding) => {
              findings.value = [...findings.value, { ...finding, value: true }]
            }}
            removeFinding={(snomed_code: string) => {
              findings.value = findings.value.filter(
                (finding) => finding.snomed_code !== snomed_code,
              )
            }}
          />
        ))}
      </div>
      <div>
        <SectionHeader className='mb-1 text-[30px]'>
          Findings
        </SectionHeader>
        {findings.value.map((finding) => (
          <div key={finding.snomed_code}>
            {finding.snomed_english_description}
          </div>
        ))}
      </div>
    </div>
  )
}
