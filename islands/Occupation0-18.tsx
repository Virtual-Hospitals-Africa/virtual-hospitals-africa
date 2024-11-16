import { useState } from 'preact/hooks'
import FormRow from '../components/library/FormRow.tsx'
import { Select } from './form/Inputs.tsx'
import SelectWithOther from './SelectWithOther.tsx'
import { YesNoGrid, YesNoQuestion } from './form/Inputs.tsx'
import { Occupation, School } from '../types.ts'

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
      <YesNoGrid>
        <YesNoQuestion
          name='omit.patient_goes_to_school'
          label='Does the patient go to school?'
          value={school.status === 'in school'}
          onChange={(value) => {
            const nextSchool: School = value
              ? {
                status: 'in school',
                current: {
                  grade: 'ECD 1',
                  grades_dropping_reason: null,
                  happy: true,
                  inappropriate_reason: null,
                },
              }
              : {
                status: 'never attended',
              }
            setSchool(nextSchool)
          }}
        />
        <input
          type='hidden'
          name='occupation.school.status'
          value={school.status}
        />
        {school.status !== 'in school' &&
          (
            <YesNoQuestion
              name='omit.school.patient_never'
              label='Has the patient ever gone to school?'
              value={school.status === 'stopped school'}
              onChange={(value) => {
                const nextSchool: School = value
                  ? {
                    status: 'stopped school',
                    past: {
                      stopped_last_grade: 'Grade 1',
                      stopped_reason: 'Problems at home',
                    },
                  }
                  : {
                    status: 'never attended',
                  }
                setSchool(nextSchool)
              }}
            />
          )}
        {school.status === 'in school' && (
          <YesNoQuestion
            name='omit.school.appropriate'
            label='Is class appropriate for their age?'
            value={!school.current.inappropriate_reason}
            onChange={(event) => {
              setSchool({
                ...school,
                current: {
                  ...school.current,
                  inappropriate_reason: event
                    ? null
                    : class_inappropriate_reason[0],
                },
              })
            }}
          />
        )}
        {school.status === 'in school' && (
          <YesNoQuestion
            name='omit.grades_dropping'
            label="Are the patient's grades dropping?"
            value={!!school.current.grades_dropping_reason}
            onChange={(event) => {
              setSchool({
                ...school,
                current: {
                  ...school.current,
                  grades_dropping_reason: event ? gradeDropReasons[0] : null,
                },
              })
            }}
          />
        )}
        {school.status === 'in school' && (
          <YesNoQuestion
            name='occupation.school.current.happy'
            label='Is the patient happy at school?'
            value={school.current.happy}
            onChange={(event) => {
              setSchool({
                ...school,
                current: {
                  ...school.current,
                  happy: event,
                },
              })
            }}
          />
        )}
      </YesNoGrid>

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
                <option
                  value={grade}
                  selected={grade === school.current.grade}
                >
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
              value={school.current.inappropriate_reason}
              required
              options={class_inappropriate_reason}
            />
          )}
        </FormRow>

        <FormRow>
          {/* last grade only applies to stopSchool */}

          {school.status === 'in school' &&
            school.current.grades_dropping_reason !== null && (
            <SelectWithOther
              label='If the grades are dropping, why?'
              name='occupation.school.current.grades_dropping_reason'
              value={school.current.grades_dropping_reason}
              options={gradeDropReasons}
            />
          )}
        </FormRow>
        <FormRow>
          {school.status === 'stopped school' && (
            <SelectWithOther
              label='If the patient stopped their education, why?'
              name='occupation.school.past.stopped_reason'
              options={stopEducationReasons}
              value={school.past.stopped_reason}
            />
          )}

          {school.status === 'stopped school' && (
            <Select
              label='What grade was the patient in last school term?'
              name='occupation.school.past.stopped_last_grade'
            >
              {grades.map((grade) => (
                <option
                  value={grade}
                  selected={grade === school.past.stopped_last_grade}
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
