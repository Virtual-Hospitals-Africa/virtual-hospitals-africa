import { assert } from 'std/assert/assert.ts'
import { CheckboxInput } from '../components/library/form/Inputs.tsx'
import FormRow from '../components/library/form/Row.tsx'
import SelectWithOther from './SelectWithOther.tsx'
import { Job, Occupation, School } from '../types.ts'
import { useState } from 'preact/hooks'

export default function Occupation19({
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
      status: 'adult stopped school',
    },
  )
  console.log('School Status', school.status)
  const [job, setJob] = useState<Job>(
    occupation.job || {
      happy: false,
      descendants_employed: false,
      require_assistance: false,
      profession: 'None',
      work_satisfaction: 'None',
    },
  )

  //const example_answers = ['answer 1', 'answer 2', 'answer 3']
  const professions = [
    'Accountant',
    'Assistant',
    'Bookkeeper',
    'Electrician',
    'Janitor',
    'Lawyer',
    'Mechanic',
    'Nurse',
    'Police Officer',
    'Retail',
    'Server',
    'Teacher',
  ]
  const job_satisfaction = ['Excellent', 'Good', 'Neutral', 'Bad', 'Worst']
  const stop_education_reasons = [
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

  const education_levels = [
    'Elementary School',
    'Middle School',
    'High School Graduate',
    'Some College, No Degree',
    "Associate's Degree",
    "Bachelor's Degree",
    "Master's Degree",
    'Doctoral Degree',
    'Professional Degree',
  ]

  return (
    <>
      <div class='flex right'>
        <div class='flex 1'>
          <text>Is the patient advancing their education?</text>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <CheckboxInput
            name={null}
            label=''
            checked={school.status === 'adult in school'}
            onInput={(event) => {
              assert(event.target instanceof HTMLInputElement)
              const thisSchool: School = event.target.checked
                ? {
                  status: 'adult in school',
                  education_level: '',
                }
                : {
                  status: 'never attended',
                }
              setSchool(thisSchool)
            }}
          />
        </div>
        <input
          type='hidden'
          name='occupation.school.status'
          value={school.status}
        />
      </div>
      {school.status !== 'adult in school' && (
        <div class='flex right'>
          <div class='flex-1'>
            <text>Has the patient ever gone to school?</text>
          </div>
          <div style={{ marginleft: 'auto' }}>
            <CheckboxInput
              name={null}
              label=''
              checked={school.status === 'adult stopped school'}
              onInput={(event) => {
                assert(event.target instanceof HTMLInputElement)
                const nextSchool: School = event.target.checked
                  ? {
                    status: 'adult stopped school',
                    education_level: 'grade 1',
                    reason: 'Home life',
                    desire_to_return: false,
                  }
                  : {
                    status: 'never attended',
                  }
                setSchool(nextSchool)
              }}
            />
          </div>
        </div>
      )}
      {school.status === 'adult stopped school' &&
        (
          <div class='flex right'>
            <div class='flex-1'>
              <text>Do they want to return to education if they left?</text>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <CheckboxInput
                name='occupation.school.desire_to_return'
                label=''
                checked={school.desire_to_return}
                onInput={(event) => {
                  assert(event.target instanceof HTMLInputElement)
                  setSchool({
                    ...school,
                    desire_to_return: event.target.checked ? true : false,
                  })
                }}
              />
            </div>
          </div>
        )}
      <div class='flex right'>
        <div class='flex-1'>
          <text>Is the patient happy with life and achievements?</text>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <CheckboxInput
            name='occupation.job.happy'
            label=''
            checked={job.happy}
            onInput={(event) => {
              assert(event.target instanceof HTMLInputElement)
              setJob({
                ...job,
                happy: event.target.checked ? true : false,
              })
            }}
          />
        </div>
      </div>
      <div class='flex right'>
        <div class='flex-1'>
          <text>Are patient's descendants employed or in the diaspora?</text>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <CheckboxInput
            name='occupation.job.descendants_employed'
            label=''
            checked={job.descendants_employed}
            onInput={(event) => {
              assert(event.target instanceof HTMLInputElement)
              setJob({
                ...job,
                descendants_employed: event.target.checked ? true : false,
              })
            }}
          />
        </div>
      </div>
      <div class='flex right'>
        <div class='flex-1'>
          <text>Does the patient need assistance with daily activities?</text>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <CheckboxInput
            name='occupation.job.require_assistance'
            label=''
            checked={job.require_assistance}
            onInput={(event) => {
              assert(event.target instanceof HTMLInputElement)
              setJob({
                ...job,
                require_assistance: event.target.checked ? true : false,
              })
            }}
          />
        </div>
      </div>
      <section>
        <FormRow>
          <SelectWithOther
            label='Profession'
            name='occupation.job.profession'
          >
            {professions.map((profession) => (
              <option
                value={profession}
                selected={profession === job.profession}
              >
                {profession}
              </option>
            ))}
          </SelectWithOther>
          <SelectWithOther
            label='Work Environment/Job Satisfaction'
            name='occupation.job.work_satisfaction'
          >
            {job_satisfaction.map((answer) => (
              <option
                value={answer}
                selected={answer === job.work_satisfaction}
              >
                {answer}
              </option>
            ))}
          </SelectWithOther>
        </FormRow>
        <FormRow>
          {(school.status === 'adult stopped school' ||
            school.status === 'adult in school') &&
            (
              <SelectWithOther
                label='Education level'
                name='occupation.school.education_level'
              >
                {education_levels.map((education_level) => (
                  <option
                    value={education_level}
                    selected={education_level === school.education_level}
                  >
                    {education_level}
                  </option>
                ))}
              </SelectWithOther>
            )}
          {school.status === 'adult stopped school' &&
            (
              <SelectWithOther
                label='Why did the patient stop their education?'
                name='occupation.school.reason'
              >
                {stop_education_reasons.map((reason) => (
                  <option
                    value={reason}
                    selected={reason === school.reason}
                  >
                    {reason}
                  </option>
                ))}
              </SelectWithOther>
            )}
        </FormRow>
      </section>
    </>
  )
}
