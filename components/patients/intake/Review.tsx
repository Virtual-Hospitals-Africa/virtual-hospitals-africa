import { assert } from 'std/assert/assert.ts'
import {
  MedicationReview,
  PreExistingConditionReview,
} from '../../../db/models/patient_conditions.ts'
import { getIntakeReview } from '../../../db/models/patients.ts'
import { dosageDisplay, IntakeFrequencies } from '../../../shared/medication.ts'
import { Maybe, PreExistingConditionWithDrugs } from '../../../types.ts'
import {
  durationEndDate,
  prettyPatientDateOfBirth,
} from '../../../util/date.ts'
import { DescriptionList } from '../../library/DescriptionList.tsx'
import { Person } from '../../library/Person.tsx'
import { Prescriptions } from '../../library/icons/SeekingTreatment.tsx'

function DateRange(
  { start_date, end_date }: { start_date: string; end_date?: Maybe<string> },
) {
  return (
    <span>
      {prettyPatientDateOfBirth(start_date)} —{' '}
      {end_date ? prettyPatientDateOfBirth(end_date) : 'Present'}
    </span>
  )
}

// TODO: Move this to a shared component or make model logic?
function Medication({ medication }: { medication: MedicationReview }) {
  let current_date = medication.start_date

  const display_schedules = medication.schedules.map((schedule) => {
    const dosage = dosageDisplay({
      dosage: schedule.dosage,
      ...medication,
    })
    const frequency = IntakeFrequencies[
      schedule.frequency as unknown as keyof typeof IntakeFrequencies
    ]
    const start_date = current_date

    const end_date = durationEndDate(current_date, schedule)

    if (end_date) current_date = end_date

    return { dosage, frequency, start_date, end_date }
  })

  assert(display_schedules.length > 0)
  const multiple_schedules = display_schedules.length > 1

  return (
    <div className='flex flex-row'>
      <Prescriptions className='w-6 h-6 mr-1' />
      <div className='flex flex-col'>
        <span className='font-semibold'>{medication.name}</span>
        <span>{medication.form}; {medication.route}</span>
        {display_schedules.map((schedule) => (
          <span>
            {schedule.dosage} {schedule.frequency}
            {multiple_schedules && (
              <>
                {' from '}
                <DateRange {...schedule} />
              </>
            )}
          </span>
        ))}
        {!multiple_schedules && <DateRange {...display_schedules[0]} />}
        {medication.special_instructions && (
          <span className='text-xs'>
            {medication.special_instructions}
          </span>
        )}
      </div>
    </div>
  )
}

function PreExistingConditionsReview(
  { pre_existing_conditions }: {
    pre_existing_conditions: PreExistingConditionReview[]
  },
) {
  if (!pre_existing_conditions.length) return null

  return (
    <div>
      {pre_existing_conditions.map((condition) => (
        <div className='flex flex-col'>
          <span className='font-semibold'>{condition.name}</span>
          <DateRange {...condition} />
          {condition.medications.length > 0 && (
            <div className='mt-1.5 flex flex-col gap-1'>
              {condition.medications.map((medication) => (
                <Medication medication={medication} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function PatientReview(
  { patient }: {
    patient: Awaited<ReturnType<typeof getIntakeReview>>
  },
) {
  return (
    <DescriptionList
      title='Review Patient Details'
      items={[
        { label: 'Name', children: <Person person={patient} /> },
        { label: 'Gender', children: patient.gender },
        { label: 'Date of Birth', children: patient.date_of_birth },
        { label: 'Ethnicity', children: patient.ethnicity },
        { label: 'Phone', children: patient.phone_number },
        { label: 'National ID', children: patient.national_id_number },
        { label: 'Address', children: patient.address },
        {
          label: 'Nearest Facility',
          children: patient.nearest_facility_name,
        },
        { label: 'Primary Doctor', children: patient.primary_doctor_name },
        {
          label: 'Pre-existing Conditions',
          children: <PreExistingConditionsReview {...patient} />,
        },
      ]}
    />
  )
}
