import { useState } from 'preact/hooks'
import FormRow from '../components/library/form/Row.tsx'
import { Select } from '../components/library/form/Inputs.tsx'
import SelectWithOther from './SelectWithOther.tsx'
import { assert } from 'std/assert/assert.ts'
import { CheckboxInput } from '../components/library/form/Inputs.tsx'
import { Maybe, Occupation, PatientOccupation, School } from '../types.ts'

export default function Occupation0_18({
  occupation = {
    school: {
      status: 'never attended',
    },
  },
}: {
  occupation?: Occupation
}) {
  const [school, setSchool] = useState<School>(
    occupation.school || {
      status: 'never attended',
    },
  )

  const school_status = [
    'in school',
    'never attended',
    'stopped school',
  ]
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
    'Health issues',
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
        <div style={{ marginLeft: 'auto' }}>
          <CheckboxInput
            name={null} //If we could put school.status here it would be ideal but it would be a boolean
            label=''
            checked={school.status !== 'never attended'}
            onInput={(event) => {
              assert(event.target instanceof HTMLInputElement)
              const nextSchool: School = event.target.checked
                ? {
                  status: 'in school',
                  current: {
                    grade: 'ECD 1',
                    grades_dropping_reason: null,
                    happy: true,
                    //sports: true,
                    inappropriate_reason: null,
                  },
                }
                : {
                  status: 'never attended',
                }
              setSchool(nextSchool)
            }}
          />
        </div>
        <input
          type='hidden'
          name='occupation.school.status'
          value={school.status}
        />
      </div>
      {
        school.status !== 'in school' && (
          <div class='flex right'>
            <div class='flex-1'>
              <text>Has the patient ever gone to school?</text>
            </div>
            <div style={{ marginleft: 'auto' }}>
              <CheckboxInput
                name={null}
                label=''
                checked={school.status === 'stopped school'}
                onInput={(event) => {
                  assert(event.target instanceof HTMLInputElement)
                  const nextSchool: School = event.target.checked
                    ? {
                      status: 'stopped school',
                      past: {
                        last_grade: 'Grade 1',
                        reason: 'Problems at home',
                      },
                    }
                    : {
                      status: 'never attended',
                    }
                  setSchool(nextSchool)
                }}
              />
            </div>
          </div>
        )
        //If no, condition add another checkbox that asks "Has the patient ever been to school?"
      }
      {school.status === 'in school' && (
        <div class='flex right'>
          <div class='flex-1'>
            <text>Is class appropriate for their age?</text>
          </div>
          <div style={{ marginleft: 'auto' }}>
            <CheckboxInput
              name={null}
              label=''
              checked={school.current.inappropriate_reason === null}
              className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
              onInput={(event) => {
                assert(event.target instanceof HTMLInputElement)
                setSchool({
                  ...school,
                  current: {
                    ...school.current,
                    inappropriate_reason: event.target.checked
                      ? null
                      : class_inappropriate_reason[0],
                  },
                })
              }}
            />
          </div>
        </div>
      )}

      {school.status === 'in school' && (
        <div class='flex items-center'>
          <div class='flex-1'>
            <text>Are the patient's grades dropping?</text>
          </div>
          <div style={{ marginleft: 'auto' }}>
            <CheckboxInput
              name={null}
              label=''
              checked={!!school.current.grades_dropping_reason}
              className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
              onInput={(event) => {
                assert(event.target instanceof HTMLInputElement)
                setSchool({
                  ...school,
                  current: {
                    ...school.current,
                    grades_dropping_reason: event.target.checked
                      ? gradeDropReasons[0]
                      : null,
                  },
                })
              }}
            />
          </div>
        </div>
      )}
      {school.status === 'in school' && (
        <div class='flex right'>
          <div class='flex-1'>
            <text>Is the patient happy at school?</text>
          </div>
          <div style={{ marginleft: 'auto' }}>
            <CheckboxInput
              name='occupation.school.current.happy'
              label=''
              checked={school.current.happy}
              className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
            />
          </div>
        </div>
      )}
      {occupation && (
        <div class='flex right'>
          <div class='flex-1'>
            <text>Does the patient play any sports?</text>
          </div>
          <div style={{ marginleft: 'auto' }}>
            <CheckboxInput
              name='occupation.sport'
              label=''
              className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
              checked={occupation.sport}
            />
          </div>
        </div>
      )}
      {!occupation && (
        <div class='flex right'>
          <div class='flex-1'>
            <text>Does the patient play any sports?</text>
          </div>
          <div style={{ marginleft: 'auto' }}>
            <CheckboxInput
              name='occupation.sport'
              label=''
              className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
            />
          </div>
        </div>
      )}

      <section class='pt-6'>
        <FormRow>
          {school.status === 'in school' && (
            <Select
              label='Which class is the patient doing?'
              name='occupation.school.current.grade'
              selectClassName='w-full'
              required
            >
              {grades.map((grade) => (
                <option value={grade} selected={grade === school.current.grade}>
                  {grade}
                </option>
              ))}
            </Select>
          )}

          {school.status === 'in school' &&
            school.current.inappropriate_reason !== null && (
            <SelectWithOther
              label='If the class is not appropriate, what was the reason?'
              name='occupation.school.current.inappropriate_reason'
            >
              {class_inappropriate_reason.map((reason) => (
                <option
                  value={reason}
                  selected={reason === school.current.inappropriate_reason}
                >
                  {reason}
                </option>
              ))}
            </SelectWithOther>
          )}
        </FormRow>

        <FormRow>
          {/* last grade only applies to stopSchool */}

          {school.status === 'in school' &&
            school.current.grades_dropping_reason !== null && (
            <SelectWithOther
              label='If the grades are dropping, why?'
              name='occupation.school.current.grades_dropping_reason'
            >
              {gradeDropReasons.map((reason) => (
                <option
                  value={reason}
                  selected={reason === school.current.grades_dropping_reason}
                >
                  {reason}
                </option>
              ))}
            </SelectWithOther>
          )}
        </FormRow>
        <FormRow>
          {school.status === 'stopped school' && (
            <SelectWithOther
              label='If the patient stopped their education, why?'
              name='occupation.school.past.stopped_reason'
            >
              {stopEducationReasons.map((reason) => (
                <option
                  value={reason}
                  selected={reason === school?.past.reason}
                >
                  {reason}
                </option>
              ))}
            </SelectWithOther>
          )}

          {school.status === 'stopped school' && (
            <Select
              label='What grade was the patient in last school term?'
              name='occupation.past.stopped_last_grade'
            >
              {grades.map((grade) => (
                <option
                  value={grade}
                  selected={grade === school.past.last_grade}
                >
                  {grade}
                </option>
              ))}
            </Select>
          )}
        </FormRow>
      </section>
    </>
  )
}
