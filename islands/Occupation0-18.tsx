import { useState } from 'preact/hooks'
import FormRow from '../components/library/form/Row.tsx'
import { Select } from '../components/library/form/Inputs.tsx'
import SelectWithOther from './SelectWithOther.tsx'
import { assert } from 'std/assert/assert.ts'
import { CheckboxInput } from '../components/library/form/Inputs.tsx'

type School = {
  grade: string
  grades_dropping_reason: string | null
  happy: boolean
  sports: boolean
  inappropriate_reason: string | null
}
type stopSchool = {
  stopped_education_reason: string | null
}
export default function Occupation0_18() {
  const [school, setSchool] = useState<null | School>(null)

  const class_inappropriate_reason = [
    'Change of town',
    'Repeated a class',
    'Problems at home',
    'Loss of parent/s',
  ]
  const gradeDropReasons = [
    'Problems at Home',
    'Low self esteem',
    'Abuse',
    'Loss of parent/s',
    'Use of Harmful Substances',
    'Associating with Wrong Crowds',
  ]
  const stopEducationReasons = [
    'Problems at Home',
    'Low self esteem',
    'Lack of funds',
    'Had to be a breadwinner',
    'Lack of opportunity',
    'Loss of parent/s',
    'Substance misuse',
    'Happy with current level of education',
  ]
  const grades = [
    'ECD 1',
    'ECD 2',
    'Grade 1',
    'Grade 2',
    'Grade 3',
    'Grade 4',
    'Grade 5',
    'Grade 6',
    'Grade 7',
    'Form 1',
    'Form 2',
    'Form 3',
    'Form 4',
    'Form 5',
    'Form 6',
  ]
  return (
    <>
      <div class='flex right'>
        <div class='flex-1'>
          <text>Does the patient go to school?</text>
        </div>

        <div style={{ marginleft: 'auto' }}>
          <CheckboxInput
            name='in_school'
            label=''
            required={true}
            disabled={false}
            readonly={false}
            className='in_school_classname'
            onInput={(event) => {
              assert(event.target instanceof HTMLInputElement)
              const nextSchool: null | School = event.target.checked
                ? {
                  grade: 'ECD 1',
                  grades_dropping_reason: null,
                  happy: true,
                  sports: true,
                  inappropriate_reason: null,
                }
                : null
              setSchool(nextSchool)
            }}
          />
        </div>
      </div>

      {school && (
        <div class='flex right'>
          <div class='flex-1'>
            <text>Is class appopriate for their age?</text>
          </div>
          <div style={{ marginleft: 'auto' }}>
            <CheckboxInput
              name='class_appropriate'
              label=''
              required={true}
              checked={!school?.inappropriate_reason}
              disabled={false}
              readonly={false}
              className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
              onInput={(event) => {
                assert(event.target instanceof HTMLInputElement)
                setSchool({
                  ...school,
                  inappropriate_reason: event.target.checked
                    ? null
                    : class_inappropriate_reason[0],
                })
              }}
            />
          </div>
        </div>
      )}

      {school && (
        <div class='flex items-center'>
          <div class='flex-1'>
            <text>Are the patient's grades dropping?</text>
          </div>
          <div style={{ marginleft: 'auto' }}>
            <CheckboxInput
              name='grades_dropping'
              label=''
              required={true}
              checked={!!school?.grades_dropping_reason}
              disabled={false}
              readonly={false}
              className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
              onInput={(event) => {
                assert(event.target instanceof HTMLInputElement)
                setSchool({
                  ...school,
                  grades_dropping_reason: event.target.checked
                    ? gradeDropReasons[0]
                    : null,
                })
              }}
            />
          </div>
        </div>
      )}
      {school && (
        <div class='flex right'>
          <div class='flex-1'>
            <text>Is the patient happy at school?</text>
          </div>
          <div style={{ marginleft: 'auto' }}>
            <CheckboxInput
              name='school.happy'
              label=''
              required={false}
              checked={true}
              disabled={false}
              readonly={false}
              className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
            />
          </div>
        </div>
      )}
      <div class='flex right'>
        <div class='flex-1'>
          <text>Does the patient play any sports?</text>
        </div>
        <div style={{ marginleft: 'auto' }}>
          <CheckboxInput
            name='play_sports'
            label=''
            required={false}
            checked={false}
            disabled={false}
            readonly={false}
            className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
          />
        </div>
      </div>

      <section class='pt-6'>
        <FormRow>
          <Select
            label='Which class is the patient doing?'
            name='school.grade_level'
            selectClassName='w-full'
          >
            {grades.map((grade) => (
              <option value={grade}>
                {grade}
              </option>
            ))}
          </Select>
          {school?.inappropriate_reason && (
            <SelectWithOther
              label='If the class is not appropriate, what was the reason?'
              name='school.grade_inappropriate_reason'
            >
              {class_inappropriate_reason.map((reason) => (
                <option
                  value={reason}
                  selected={reason === school.inappropriate_reason}
                >
                  {reason}
                </option>
              ))}
            </SelectWithOther>
          )}
        </FormRow>

        <FormRow>
          <Select
            label='What grade was the patient in last school term?'
            name='grade'
          >
            {grades.map((grade) => (
              <option value={grade}>
                {grade}
              </option>
            ))}
          </Select>
          {school?.grades_dropping_reason && (
            <SelectWithOther
              label='If the grades are dropping, why?'
              name='school.grades_dropping_reason'
            >
              {gradeDropReasons.map((reason) => (
                <option value={reason}>
                  {reason}
                </option>
              ))}
            </SelectWithOther>
          )}
        </FormRow>
        <FormRow>
          <SelectWithOther
            label='If the patient stopped their education, why?'
            name='school.stopped_reason'
          >
            {stopEducationReasons.map((reason) => (
              <option value={reason}>
                {reason}
              </option>
            ))}
          </SelectWithOther>
        </FormRow>
      </section>
    </>
  )
}
