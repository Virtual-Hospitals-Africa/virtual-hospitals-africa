import { JSX } from 'preact'
import { computed, useSignal } from '@preact/signals'
import SectionHeader from '../../components/library/typography/SectionHeader.tsx'
import unsavedChangesWarning from '../form/unsaved_changes_warning.tsx'
import { CheckboxGridItem } from '../form/Inputs.tsx'
import {
  RenderedPatientExamination,
  RenderedPatientExaminationCategory,
} from '../../types.ts'

function ExaminationCategory(
  { previously_completed, skipped, category }: {
    previously_completed: boolean
    skipped: boolean
    category: RenderedPatientExaminationCategory
  },
) {
  const findings = useSignal(category.findings)

  // Only initially show the all normal as checked if the form was
  // previously filled and nothing was checked for this category
  const all_normal = useSignal(
    !!previously_completed && findings.value.every((finding) => !finding.value),
  )

  const something_checked = computed(() =>
    all_normal.value || findings.value.some((finding) => !!finding.value)
  )
  return (
    <div className='flex flex-col'>
      <SectionHeader className='mt-5 mb-1 text-[20px]'>
        {category.category}
      </SectionHeader>
      <CheckboxGridItem
        label='all normal'
        checked={all_normal.value}
        required={!something_checked.value}
        disabled={skipped}
        onChange={(checked) => {
          all_normal.value = checked
          if (checked) {
            findings.value = findings.value.map((finding) => ({
              ...finding,
              value: null,
            }))
          }
        }}
      />
      {findings.value.map((finding) => (
        <CheckboxGridItem
          name={`${category.category}.${finding.name}`}
          label={finding.label}
          checked={!!finding.value}
          disabled={skipped}
          onChange={(checked) => {
            const next_finding = {
              ...finding,
              value: checked ? true : null,
            }
            findings.value = findings.value.map((f) =>
              f === finding ? next_finding : f
            )
            if (checked) {
              all_normal.value = false
            }
          }}
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
  unsavedChangesWarning()

  const skipped = useSignal(patient_examination.skipped)

  return (
    <>
      <CheckboxGridItem
        label='skip'
        checked={skipped.value}
        onChange={(checked) => skipped.value = checked}
      />
      <div className='grid grid-cols-1 sm:grid-cols-4 grid-flow-row-dense gap-5'>
        {patient_examination.categories.map((category) => (
          <ExaminationCategory
            key={category.category}
            previously_completed={patient_examination.completed}
            category={category}
            skipped={skipped.value}
          />
        ))}
      </div>
    </>
  )
}
