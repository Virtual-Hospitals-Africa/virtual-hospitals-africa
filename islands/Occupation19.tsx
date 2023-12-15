import { useState } from 'preact/hooks'
import FormRow from '../components/library/form/Row.tsx'
import { TextInput } from '../components/library/form/Inputs.tsx'
import SelectWithOther from './SelectWithOther.tsx'

export default function Occupation19() {
  const [Education, setEducation] = useState<boolean>(false)
  const [Appropriate, setAppropriate] = useState<boolean>(true)
  const [GradesDropping, setGradesDropping] = useState<boolean>(false)

  const setEducationHandler = () => {
    setSchool((prevEducation) => !prevEducation)
  }

  const setAppropriateHandler = () => {
    setAppropriate((prevAppropriate) => !prevAppropriate)
  }

  const setGradesDroppingHandler = () => {
    setGradesDropping((prevGrade) => !prevGrade)
  }
  const class_inappropriate_reason = [
    'Reason 1',
    'Reason 2',
    'Reason 3',
  ]

  return (
    <>
      <div class='flex right'>
        <div class='flex-1'>
          <text>Is the patient advancing their education?</text>
        </div>

        <div style={{ marginleft: 'auto' }}>
          <input
            id='advancing_education'
            type='checkbox'
            value=''
            class='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
            onClick={setEducationHandler}
          >
          </input>
        </div>
      </div>

      {Education && (
        <div class='flex right'>
          <div class='flex-1'>
            <text>Is the class not appopriate for their Age?</text>
          </div>
          <div style={{ marginleft: 'auto' }}>
            <input
              id='class_appropriate'
              type='checkbox'
              
              value=''
              class='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
              onClick={setAppropriateHandler}
            >
            </input>
          </div>
        </div>
      )}
      {School && (
        <div class='flex items-center'>
          <div class='flex-1'>
            <text>Are the patient's grades dropping?</text>
          </div>
          <div style={{ marginleft: 'auto' }}>
            <input
              id='grades_dropping'
              type='checkbox'
              value=''
              class='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
              onClick={setGradesDroppingHandler}
            >
            </input>
          </div>
        </div>
      )}
      {School && (
        <div class='flex right'>
          <div class='flex-1'>
            <text>Is the patient happy at school?</text>
          </div>
          <div style={{ marginleft: 'auto' }}>
            <input
              id='patient_happy_at_school'
              type='checkbox'
              value=''
              class='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
            >
            </input>
          </div>
        </div>
      )}
      <div class='flex right'>
        <div class='flex-1'>
          <text>Does the patient play any sports?</text>
        </div>
        <div style={{ marginleft: 'auto' }}>
          <input
            id='play_sports'
            type='checkbox'
            value=''
            class='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
          >
          </input>
        </div>
      </div>

      <div style={{ height: '20px' }}></div>
      <section>
        <FormRow>
          <TextInput
            label='Which class is the patient doing?'
            name='patient_class'
          />
          {!Appropriate && School &&(
            <SelectWithOther
              label='If the class is not appropriate, what was the reason?'
              name='class_inappropriate_reason'
            >
              {class_inappropriate_reason.map((reason) => (
                <option value={reason}>
                  {reason}
                </option>
              ))}
            </SelectWithOther>
          )}
        </FormRow>
        <FormRow>
          <TextInput
            label='What grade was the patient in last school term?'
            name='grade'
          />
          {GradesDropping && (
            <TextInput
              label='If the grades are dropping, why?'
              name='grades_dropping_reason'
            />
          )}
        </FormRow>
        <FormRow>
          <SelectWithOther
            label='If the patient stopped their education, why?'
            name='stopped_education_reason'
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
