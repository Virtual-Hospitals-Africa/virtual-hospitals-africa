import { JSX } from 'preact'
import { useSignal } from '@preact/signals'
import SectionHeader from '../../components/library/typography/SectionHeader.tsx'
import { CheckboxGridItem, TextArea } from '../form/Inputs.tsx'
import { RenderedPatientExamination } from '../../types.ts'
import {
  HEAD_TO_TOE_EXAMINATION_CATEGORIES,
  HEAD_TO_TOE_EXAMINATION_CHECKLIST_BY_SNOMED_CODE,
} from '../../shared/examinations.ts'
import { RemoveRow } from '../AddRemove.tsx'
import FormRow from '../../components/library/FormRow.tsx'
import { assert } from 'std/assert/assert.ts'
import AsyncSearch from '../AsyncSearch.tsx'

type ExaminationChecklistItem = {
  checklist_label: string
  english_term: string
  code: string
  body_sites: {
    code: string
    english_term: string
  }[]
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
    snomed_english_term: string
    body_site_snomed_code: string | null
    body_site_snomed_english_term: string | null
  }): void
  removeFinding(snomed_code: string): void
}

type ExaminationChecklistProps = {
  subcategory?: string
  checklist: ExaminationChecklistItem[]
  findings: RenderedPatientExamination['findings']
  addFinding(finding: {
    snomed_code: string
    snomed_english_term: string
    body_site_snomed_code: string | null
    body_site_snomed_english_term: string | null
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
          label={checklist_item.checklist_label}
          checked={findings.some((finding) =>
            finding.snomed_code === checklist_item.code
          )}
          onChange={(checked) => {
            if (checked) {
              addFinding({
                snomed_code: checklist_item.code,
                snomed_english_term: checklist_item.english_term,
                body_site_snomed_code: checklist_item.body_sites[0]?.code ??
                  null,
                body_site_snomed_english_term:
                  checklist_item.body_sites[0]?.english_term ?? null,
              })
            } else {
              removeFinding(checklist_item.code)
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

type FindingProps = {
  finding: {
    snomed_code: string
    snomed_english_term: string
    body_site_snomed_code: string | null
    body_site_snomed_english_term: string | null
  }
  removeFinding(snomed_code: string): void
}

function Finding({ finding, removeFinding }: FindingProps): JSX.Element {
  const examination = HEAD_TO_TOE_EXAMINATION_CHECKLIST_BY_SNOMED_CODE.get(
    finding.snomed_code,
  )
  assert(
    examination,
    `No examination found for snomed code ${finding.snomed_code}`,
  )
  const input_prefix = `findings.snomed_${finding.snomed_code}`
  return (
    <RemoveRow onClick={() => removeFinding(finding.snomed_code)}>
      <div className='flex flex-col mt-1 w-full'>
        <input
          type='hidden'
          name={`${input_prefix}.code`}
          value={finding.snomed_code}
        />
        <FormRow>
          {finding.snomed_english_term}
        </FormRow>
        {examination.body_sites?.length > 0 && (
          <FormRow className=''>
            <AsyncSearch
              label='Body site'
              required
              name={`${input_prefix}.body_site`}
              search_route={`/app/snomed/body_structures?parent_codes=${
                examination.body_sites.map((s) => s.code).join(',')
              }`}
              value={finding.body_site_snomed_code
                ? {
                  id: finding.body_site_snomed_code,
                  name: finding.body_site_snomed_english_term!,
                }
                : null}
            />
          </FormRow>
        )}

        <FormRow className=''>
          <TextArea
            name={`${input_prefix}.additional_notes`}
            label='Additional notes'
            rows={1}
          />
        </FormRow>
      </div>
    </RemoveRow>
  )
}

export function PatientExaminationForm({
  patient_examination,
}: {
  patient_examination: RenderedPatientExamination
}): JSX.Element {
  const findings = useSignal(patient_examination.findings)

  const removeFinding = (snomed_code: string) => {
    findings.value = findings.value.filter(
      (finding) => finding.snomed_code !== snomed_code,
    )
  }

  return (
    <div className='flex content-between p-4'>
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
            removeFinding={removeFinding}
          />
        ))}
      </div>
      <div className='w-[600px]'>
        <SectionHeader className='mb-1 text-[30px]'>
          Findings
        </SectionHeader>
        {findings.value.length === 0 && (
          <div className='text-[16px] italic'>
            None
          </div>
        )}
        {findings.value.map((finding) => (
          <Finding
            key={finding.snomed_code}
            finding={finding}
            removeFinding={removeFinding}
          />
        ))}
      </div>
    </div>
  )
}
