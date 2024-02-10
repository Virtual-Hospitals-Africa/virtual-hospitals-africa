import { JSX } from 'preact'
import SectionHeader from '../../components/library/typography/SectionHeader.tsx'
import { GeneralAssessment } from '../../types.ts'
import {
  CheckboxInput,
  CheckboxList,
} from '../../components/library/form/Inputs.tsx'

export default function GeneralAssessmentForm({
  selectedItems,
  assessmentList,
}: {
  selectedItems: { id: number }[]
  assessmentList: GeneralAssessment[]
}): JSX.Element {
  globalThis.onbeforeunload = function () {
    if (document.URL.includes('general_assessments')) {
      const submitButton = document.querySelector('button[type="submit"]');
      (submitButton as HTMLButtonElement).click()
    }
  }
  const selectedIds = selectedItems?.map((c) => c.id) ?? []
  const getCheckBoxValues = (
    values: GeneralAssessment[],
    type: string,
  ): Record<string, { value: string; checked: boolean }> => {
    const records: Record<string, { value: string; checked: boolean }> = {}
    values.filter((c) => c.type === type).forEach((c) => {
      records[c.name] = {
        value: c.id.toString(),
        checked: selectedIds.includes(c.id),
      }
    })
    return records
  }
  return (
    <div>
      <div class='col-row'>
        <SectionHeader className='mb-3'>General Assessment</SectionHeader>
        <div>
          <SectionHeader className='my-5 text-[20px]'>
            General
          </SectionHeader>
          <div>
            <CheckboxInput
              name={`all_normal`}
              label='All Normal'
              onInput={(event) => {
                const target = event.target as HTMLInputElement
                target.value = String(target.checked)
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
                      input.disabled = true
                    }
                  })
                }
              }}
            />
          </div>
          <div>
            <SectionHeader className='my-5 text-[20px]'>
              Patient state
            </SectionHeader>
            <CheckboxList
              name={'patient_assessments'}
              values={getCheckBoxValues(assessmentList, 'Patient state')}
            />
          </div>
          <div>
            <SectionHeader className='my-5 text-[20px]'>
              Hands
            </SectionHeader>
            <CheckboxList
              name={'patient_assessments'}
              values={getCheckBoxValues(assessmentList, 'Hands')}
            />
          </div>
          <div>
            <SectionHeader className='my-5 text-[20px]'>
              Nails
            </SectionHeader>
            <CheckboxList
              name={'patient_assessments'}
              values={getCheckBoxValues(assessmentList, 'Nails')}
            />
          </div>
          <div>
            <SectionHeader className='my-5 text-[20px]'>
              Palms
            </SectionHeader>
            <CheckboxList
              name={'patient_assessments'}
              values={getCheckBoxValues(assessmentList, 'Palms')}
            />
          </div>
        </div>
        <hr />
        <div>
          <SectionHeader className='my-5 text-[20px]'>
            Skin
          </SectionHeader>
          <div>
            <SectionHeader className='my-5 text-[20px]'>
              Colour
            </SectionHeader>
            <CheckboxList
              name={'patient_assessments'}
              values={getCheckBoxValues(assessmentList, 'Colour')}
            />
          </div>
          <div>
            <SectionHeader className='my-5 text-[20px]'>
              Texture
            </SectionHeader>
            <CheckboxList
              name={'patient_assessments'}
              values={getCheckBoxValues(assessmentList, 'Texture')}
            />
          </div>
          <SectionHeader className='my-5 text-[20px]'>
            Lesions
          </SectionHeader>
          <div>
            <SectionHeader className='my-5 text-[20px]'>
              Distribution
            </SectionHeader>
            <CheckboxList
              name={'patient_assessments'}
              values={getCheckBoxValues(assessmentList, 'Distribution')}
            />
          </div>
          <div>
            <SectionHeader className='my-5 text-[20px]'>
              Pattern
            </SectionHeader>
            <CheckboxList
              name={'patient_assessments'}
              values={getCheckBoxValues(assessmentList, 'Pattern')}
            />
          </div>
          <div>
            <SectionHeader className='my-5 text-[20px]'>
              Surface
            </SectionHeader>
            <CheckboxList
              name={'patient_assessments'}
              values={getCheckBoxValues(assessmentList, 'Surface')}
            />
          </div>
          <div>
            <SectionHeader className='my-5 text-[20px]'>
              Character
            </SectionHeader>
            <CheckboxList
              name={'patient_assessments'}
              values={getCheckBoxValues(assessmentList, 'Character')}
            />
          </div>
        </div>
        <hr />
        <div>
          <SectionHeader className='my-5 text-[20px]'>
            Mouth
          </SectionHeader>
          <div>
            <SectionHeader className='my-5 text-[20px]'>
              Tongue
            </SectionHeader>
            <CheckboxList
              name={'patient_assessments'}
              values={getCheckBoxValues(assessmentList, 'Tongue')}
            />
          </div>
          <div>
            <SectionHeader className='my-5 text-[20px]'>
              Teeth
            </SectionHeader>
            <CheckboxList
              name={'patient_assessments'}
              values={getCheckBoxValues(assessmentList, 'Teeth')}
            />
          </div>
          <div>
            <SectionHeader className='my-5 text-[20px]'>
              Gums
            </SectionHeader>
            <CheckboxList
              name={'patient_assessments'}
              values={getCheckBoxValues(assessmentList, 'Gums')}
            />
          </div>
          <div>
            <SectionHeader className='my-5 text-[20px]'>
              Tonsils
            </SectionHeader>
            <CheckboxList
              name={'patient_assessments'}
              values={getCheckBoxValues(assessmentList, 'Tonsils')}
            />
          </div>
          <div>
            <SectionHeader className='my-5 text-[20px]'>
              Pharynx
            </SectionHeader>
            <CheckboxList
              name={'patient_assessments'}
              values={getCheckBoxValues(assessmentList, 'Pharynx')}
            />
          </div>
          <div>
            <SectionHeader className='my-5 text-[20px]'>
              Breath
            </SectionHeader>
            <CheckboxList
              name={'patient_assessments'}
              values={getCheckBoxValues(assessmentList, 'Breath')}
            />
          </div>
        </div>
        <hr />
        <div>
          <SectionHeader className='my-5 text-[20px]'>
            Eyes
          </SectionHeader>
          <div>
            <SectionHeader className='my-5 text-[20px]'>
              Sclera
            </SectionHeader>
            <CheckboxList
              name={'patient_assessments'}
              values={getCheckBoxValues(assessmentList, 'Sclera')}
            />
          </div>
          <div>
            <SectionHeader className='my-5 text-[20px]'>
              Conjunctiva
            </SectionHeader>
            <CheckboxList
              name={'patient_assessments'}
              values={getCheckBoxValues(assessmentList, 'Conjunctiva')}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
