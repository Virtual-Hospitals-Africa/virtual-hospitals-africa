import { JSX } from 'preact'
import SectionHeader from '../../components/library/typography/SectionHeader.tsx'
import { GeneralAssessment } from '../../types.ts'
import { CheckboxList } from '../../components/library/form/Inputs.tsx'
import unsavedChangesWarning from '../../components/library/form/unsaved_changes_warning.tsx'

export default function GeneralAssessmentForm({
  selectedItems,
  assessmentList,
}: {
  selectedItems: { id: string }[]
  assessmentList: GeneralAssessment[]
}): JSX.Element {
  unsavedChangesWarning()
  const selectedIds = selectedItems?.map((c) => c.id) ?? []

  assessmentList.push({
    category: 'Patient state',
    assessment: 'All Normal',
  })
  const getCheckBoxValues = (
    items: GeneralAssessment[],
  ): Record<string, { value: string; checked: boolean }> => {
    const records: Record<string, { value: string; checked: boolean }> = {}
    items.forEach((c) => {
      records[c.assessment] = {
        value: c.assessment,
        checked: selectedIds.includes(c.assessment),
      }
    })

    return records
  }

  const assessmentGroups = Object.groupBy(
    assessmentList,
    ({ category }) => category,
  )
  let indexCounter = 0

  return (
    <div>
      <div class='col-row'>
        <SectionHeader className='mb-3'>General Assessment</SectionHeader>
        {Object.keys(assessmentGroups).map((key) => (
          <div key={key}>
            <div>
              <SectionHeader className='my-5 text-[20px]'>
                {key}
              </SectionHeader>
              <CheckboxList
                name={'patient_assessments'}
                values={getCheckBoxValues(assessmentGroups[key]!)}
                startIndex={(indexCounter += assessmentGroups[key]!.length) - assessmentGroups[key]!.length}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement
                  if (target.value && target.value === 'All Normal') {
                    const checkboxes = document.querySelectorAll(
                      'input[type="checkbox"]',
                    )
                    if (target.checked) {
                      checkboxes.forEach(function (cb: Element) {
                        const input = cb as HTMLInputElement
                        if (cb !== target) {
                          input.checked = false
                          input.disabled = true
                        }
                      })
                    } else {
                      checkboxes.forEach(function (cb: Element) {
                        const input = cb as HTMLInputElement
                        if (cb !== target) {
                          input.disabled = false
                        }
                      })
                    }
                  }
                }}
              />
              <hr />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
