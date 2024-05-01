import { useSignal } from '@preact/signals'
import { SelectWithOptions, YesNoGrid, YesNoQuestion } from '../form/Inputs.tsx'
import { LabelledListboxMulti } from '../form/Listbox.tsx'
import { Lifestyle } from '../../types.ts'
import SectionHeader from '../../components/library/typography/SectionHeader.tsx'

const FREQUENCIES = [
  'Once per month or less' as const,
  '2-3 times per month' as const,
  '1-2 times per week' as const,
  '3-4 times per week' as const,
  '5-6 times per week' as const,
  '5-15 minutes per day' as const,
  '15-30 minutes per day' as const,
  'About 1 hour per day' as const,
  '2-4 hours per day' as const,
  'More than 4 hours per day' as const,
]

type ExerciseFrequency = typeof FREQUENCIES[number]

const PHYSICAL_ACTIVITIES = [
  'Walking',
  'Brisk walking',
  'Jogging',
  'Running',
  'Biking',
  'Household work',
  'Yard work (mowing, raking)',
  'Dancing',
  'Skipping',
  'Climbing stairs or hills or rocks (hiking)',
  'Physical or recreational games',
  'Yoga',
  'Body lifting exercise',
  'Weight lifting exercise',
  'Exercise with machines',
  'Aerobics',
  'Prescribed exercise',
].map((name) => ({
  id: name,
  name,
}))

const SPORTS = [
  'Swimming',
  'Tennis',
  'Basketball',
  'Football or soccer',
  'Netball',
  'Rugby',
  'Hockey',
  'Cricket',
  'Volleyball',
  'Gymnastics',
  'Sport aerobics',
  'Other sport',
].map((name) => ({
  id: name,
  name,
}))

const TYPES_OF_EXERCISES_OPTIONS = [
  'Endurance',
  'Strength',
  'Balance',
  'Flexibility',
  'Stretching',
  'Aerobics',
].map((name) => ({
  id: name,
  name,
}))

const INJURIES_DISABILITIES_LIST = [
  'Cerebral palsy',
  'Spinal cord injuries',
  'Amputation',
  'Spina bifida',
  'Stroke',
  'Arthritis',
  'Muscular dystrophy',
  'Musculoskeletal injuries',
].map((name) => ({
  id: name,
  name,
}))

const LIMITATIONS_LIST = [
  'Lack of time',
  'Lack of interest',
  'Lack of transport',
  'Lack of safe exercise areas',
  'Lack of exercise equipment and resources',
  'Lack of exercise organizations',
  'Shortness of breath',
  'Joint pain',
  'Lack of exercise partner',
  'Lack of exercise or sport groups',
  'Lack of fitness',
  'Lack of energy',
  'Lacks confidence and capacity to be physically active',
  'Fear of exercise injuries',
  'Lacks exercise self management',
  'Lacks support from friends and family',
  'Views exercise as an inconvenience',
  'Doubtful of the benefits of exercise',
  'Structural conditions',
  'Medical conditions',
].map((name) => ({
  id: name,
  name,
}))
const STRUCTURAL_CONDITIONS_LIST = [
  'Improper body alignment',
  'Locking of joints',
  'Rapid, jerky, & uncontrolled movements',
  'Hyperextension',
  'Overstretching',
  'Excessive compression of structures',
].map((name) => ({
  id: name,
  name,
}))

const MEDICAL_CONDITIONS_LIST = [
  'Unstable angina',
  'Systolic blood pressure higher than 180, and/or diastolic blood pressure over 100mmHg',
  'Blood pressure drops below 20mmHg during exercise tolerance test',
  'Resting heart rate above 100bpm',
  'Uncontrolled arrhythmias',
  'Heart failure',
  'Unstable diabetes',
  'Illnesses accompanied by fever',
  'Deep vein thrombosis',
  'Severe hypertension',
  'Severe electrolyte imbalance',
  'Severe hyperthyroidism',
  'Aortic stenosis',
  'Coronary artery stenosis',
  'Insufficiently controlled arrhythmias',
  'Stroke within the past one month',
].map((name) => ({
  id: name,
  name,
}))
const MUSCULOSKELETAL_INJURIES = [ //Make all caps
  'Fractures',
  'Joint dislocation',
  'Muscle injuries',
  'Sprains and strains',
  'Concussion',
  'Sports injuries',
  'Work related injuries',
  'Work related injuries',
].map((name) => ({
  id: name,
  name,
}))

export default function exerciseSection(
  { lifestyle }: { lifestyle?: Lifestyle },
) {
  const currently_exercises = useSignal<null | boolean>(
    lifestyle?.exercise?.currently_exercises ?? null,
  )
  const physical_activities = useSignal<{ name: string; frequency: string }[]>(
    lifestyle?.exercise?.currently_exercises
      ? (lifestyle.exercise.physical_activities || [])
      : [],
  )
  const sports = useSignal<{ name: string; frequency: string }[]>(
    lifestyle?.exercise?.currently_exercises
      ? (lifestyle.exercise.sports || [])
      : [],
  )
  const types_of_exercises = useSignal<string[]>(
    lifestyle?.exercise?.currently_exercises
      ? (lifestyle.exercise.types_of_exercises || [])
      : [],
  )
  const disabilities = useSignal<string[]>(
    lifestyle?.exercise?.currently_exercises
      ? (lifestyle.exercise.physical_injuries_or_disability.disabilities || [])
      : [],
  )

  const musculoskeletal_injuries = useSignal<string[]>(
    lifestyle?.exercise?.currently_exercises
      ? (lifestyle.exercise.physical_injuries_or_disability
        .musculoskeletal_injuries || [])
      : [],
  )

  const limitations = useSignal<string[]>(
    lifestyle?.exercise?.currently_exercises
      ? (lifestyle.exercise.limitations.limits || [])
      : [],
  )
  const structural = useSignal<string[]>(
    lifestyle?.exercise?.currently_exercises
      ? (lifestyle.exercise.limitations.structural_conditions || [])
      : [],
  )
  const medical = useSignal<string[]>(
    lifestyle?.exercise?.currently_exercises
      ? (lifestyle.exercise.limitations.medical_conditions || [])
      : [],
  )
  return (
    <section className='mb-7'>
      <SectionHeader className='mb-3'>Exercise Questions</SectionHeader>
      <YesNoGrid>
        <YesNoQuestion
          name='lifestyle.exercise.currently_exercises'
          label='Does the patient currently exercise?'
          value={currently_exercises.value}
          onChange={(value) => currently_exercises.value = value}
        />
      </YesNoGrid>
      {currently_exercises.value && (
        <>
          <LabelledListboxMulti
            label='Which physical activities does the patient engage in?'
            name='lifestyle.exercise.physical_activities'
            options={PHYSICAL_ACTIVITIES}
            selected={physical_activities.value.map(({ name }) => name)}
            onChange={(selected_physical_activities) => {
              physical_activities.value = selected_physical_activities.map(
                (name) => {
                  const matching_physical_activity = physical_activities.value
                    .find((activity) => activity.name === name)
                  return matching_physical_activity || {
                    name: name,
                    frequency: FREQUENCIES[0],
                  }
                },
              )
            }}
          />
          {physical_activities.value.map((activity, i) => (
            <SelectWithOptions
              label={activity.name}
              name={`lifestyle.exercise.physical_activity_frequencies.${i}`}
              value={activity.frequency}
              options={FREQUENCIES}
            />
          ))}
          <LabelledListboxMulti
            label={'Which sports do the patient engage in?'}
            name={'lifestyle.exercise.sports'}
            options={SPORTS}
            selected={sports.value.map(({ name }) => name)}
            onChange={(selected_sports) => {
              sports.value = selected_sports.map((name) => {
                const matching_sport = sports.value.find((activity) =>
                  activity.name === name
                )
                return matching_sport || {
                  name: name,
                  frequency: FREQUENCIES[0],
                }
              })
            }}
          />
          {sports.value.map((activity, i) => (
            <SelectWithOptions
              label={activity.name}
              name={`lifestyle.exercise.sport_frequencies.${i}`}
              value={activity.frequency}
              options={FREQUENCIES}
            />
          ))}
          <LabelledListboxMulti
            label={'Does the patient engage in any of these exercise types? Select all that apply'}
            name={'lifestyle.exercise.types_of_exercises'}
            options={TYPES_OF_EXERCISES_OPTIONS}
            selected={types_of_exercises.value}
            onChange={(type_of_exercise) => {
              types_of_exercises.value = type_of_exercise
            }}
          />
          <LabelledListboxMulti
            label={'Does the patient have physical injuries or disability that may limit their physical activity?'}
            name={'lifestyle.exercise.physical_injuries_or_disability.disabilities'}
            options={INJURIES_DISABILITIES_LIST}
            selected={disabilities.value}
            onChange={(selected) => disabilities.value = selected}
          />
          {disabilities.value.includes('Musculoskeletal injuries') && (
            <LabelledListboxMulti
              key={'musculoskeletal_injuries'}
              label={'Which musculoskeletal injuries afflict the patient? Select all that apply'}
              name={'lifestyle.exercise.physical_injuries_or_disability.musculoskeletal_injuries'}
              options={MUSCULOSKELETAL_INJURIES}
              selected={musculoskeletal_injuries.value}
              onChange={(selected) => musculoskeletal_injuries.value = selected}
            />
          )}
          <LabelledListboxMulti
            label={'Does the patient have any exercise limitations? Select all that apply'}
            name={'lifestyle.exercise.limitations.limits'}
            options={LIMITATIONS_LIST}
            selected={limitations.value}
            onChange={(selectedValues) => {
              limitations.value = selectedValues
            }}
          />

          {limitations.value.includes('Structural conditions') && (
            <LabelledListboxMulti
              key={'structural_conditions'}
              label={'Which structural conditions afflict the patient? Select all that apply'}
              name={'lifestyle.exercise.limitations.structural_conditions'}
              options={STRUCTURAL_CONDITIONS_LIST}
              selected={structural.value}
              onChange={(selectedValues) => {
                structural.value = selectedValues
              }}
            />
          )}
          {limitations.value.includes('Medical conditions') && (
            <LabelledListboxMulti
              key={'medical_conditions'}
              label={'Which medical conditions afflict the patient? Select all that apply'}
              name={'lifestyle.exercise.limitations.medical_conditions'}
              options={MEDICAL_CONDITIONS_LIST}
              selected={medical.value}
              onChange={(selectedValues) => {
                medical.value = selectedValues
              }}
            />
          )}
        </>
      )}
    </section>
  )
}
