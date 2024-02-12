import { JSX } from 'preact'
import SectionHeader from '../../components/library/typography/SectionHeader.tsx'
import unsavedChangesWarning from '../../components/library/form/unsaved_changes_warning.tsx'
import { computed, useSignal } from '@preact/signals'
import { CheckboxGridItem } from '../../components/library/form/Inputs.tsx'
import { GeneralAssessmentCategory } from '../../types.ts'

function AssessmentCategory(
  { previously_filled, category }: {
    previously_filled: boolean
    category: GeneralAssessmentCategory
  },
) {
  const assessments = useSignal(category.assessments)

  // Only initially show the all normal as checked if the form was
  // previously filled and nothing was checked for this category
  const all_normal = useSignal(
    !!previously_filled && assessments.value.every((a) => !a.checked),
  )

  const something_checked = computed(() =>
    all_normal.value || assessments.value.some((a) => !!a.checked)
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
        onChange={(checked) => {
          all_normal.value = checked
          if (checked) {
            assessments.value = assessments.value.map((a) => ({
              assessment: a.assessment,
              checked: false,
            }))
          }
        }}
      />
      {assessments.value.map((assessment) => (
        <CheckboxGridItem
          name={assessment.assessment}
          label={assessment.assessment}
          checked={!!assessment.checked}
          onChange={(checked) => {
            const next_assessment = {
              checked,
              assessment: assessment.assessment,
            }
            assessments.value = assessments.value.map((a) =>
              a === assessment ? next_assessment : a
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

export default function GeneralAssessmentForm({
  previously_filled,
  categories,
}: {
  previously_filled: boolean
  categories: GeneralAssessmentCategory[]
}): JSX.Element {
  unsavedChangesWarning()

  return (
    <>
      <SectionHeader className='mb-3'>General Assessment</SectionHeader>
      <div className='grid grid-cols-1 sm:grid-cols-4 grid-flow-row-dense gap-5'>
        {categories.map((category) => (
          <AssessmentCategory
            key={category.category}
            previously_filled={previously_filled}
            category={category}
          />
        ))}
      </div>
    </>
  )
}
