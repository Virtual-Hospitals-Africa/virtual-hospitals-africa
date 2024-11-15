import FormRow from '../components/library/FormRow.tsx'
import SelectWithOther from './SelectWithOther.tsx'
import { Job, Occupation, School } from '../types.ts'
import { useState } from 'preact/hooks'
import { YesNoGrid, YesNoQuestion } from './form/Inputs.tsx'

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

  const [job, setJob] = useState<Job>(
    occupation.job || {
      happy: false,
      descendants_employed: false,
      require_assistance: false,
      profession: 'None',
      work_satisfaction: 'None',
    },
  )

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
    'Unemployed',
    'College Student',
    'Graduate Student',
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
      <YesNoGrid>
        <YesNoQuestion
          name='omit.patient_goes_to_school'
          label='Is the patient advancing their education?'
          value={school.status === 'adult in school'}
          onChange={(value) => {
            const thisSchool: School = value
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
        <input
          type='hidden'
          name='occupation.school.status'
          value={school.status}
        />
        {school.status !== 'adult in school' && (
          <YesNoQuestion
            name='omit.school.never_gone'
            label='Has the patient ever gone to school?'
            value={school.status === 'adult stopped school'}
            onChange={(value) => {
              const nextSchool: School = value
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
        )}
        {school.status === 'adult stopped school' &&
          (
            <YesNoQuestion
              name='occupation.school.desire_to_return'
              label='Do they want to return to education if they left?'
              value={school.desire_to_return}
              onChange={(value) => {
                setSchool({
                  ...school,
                  desire_to_return: value ? true : false,
                })
              }}
            />
          )}
        <YesNoQuestion
          name='occupation.job.happy'
          label='Is the patient happy with life and achievements?'
          value={job.happy}
          onChange={(value) => {
            setJob({
              ...job,
              happy: value ? true : false,
            })
          }}
        />
        <YesNoQuestion
          name='occupation.job.descendants_employed'
          label="Are patient's descendants employed or in the diaspora?"
          value={job.descendants_employed}
          onChange={(value) => {
            setJob({
              ...job,
              descendants_employed: value ? true : false,
            })
          }}
        />
        <YesNoQuestion
          name='occupation.job.require_assistance'
          label='Does the patient need assistance with daily activities?'
          value={job.require_assistance}
          onChange={(value) => {
            setJob({
              ...job,
              require_assistance: value ? true : false,
            })
          }}
        />
      </YesNoGrid>
      <section>
        <FormRow>
          <SelectWithOther
            label='Profession'
            name='occupation.job.profession'
            value={job.profession}
            options={professions}
          />
          <SelectWithOther
            label='Work Environment/Job Satisfaction'
            name='occupation.job.work_satisfaction'
            value={job.work_satisfaction}
            options={job_satisfaction}
          />
        </FormRow>
        <FormRow>
          {(school.status === 'adult stopped school' ||
            school.status === 'adult in school') &&
            (
              <SelectWithOther
                label='Education level'
                name='occupation.school.education_level'
                options={education_levels}
                value={school.education_level}
              />
            )}
          {school.status === 'adult stopped school' &&
            (
              <SelectWithOther
                label='Why did the patient stop their education?'
                name='occupation.school.reason'
                value={school.reason}
                options={stop_education_reasons}
              />
            )}
        </FormRow>
      </section>
    </>
  )
}
