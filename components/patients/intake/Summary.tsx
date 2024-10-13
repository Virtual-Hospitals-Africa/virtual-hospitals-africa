import { assert } from 'std/assert/assert.ts'
import {
  MedicationSummary,
  PreExistingConditionSummary,
} from '../../../db/models/patient_conditions.ts'
import { getSummaryById } from '../../../db/models/patient_intake.ts'
import { dosageDisplay, IntakeFrequencies } from '../../../shared/medication.ts'
import { Maybe } from '../../../types.ts'
import {
  durationEndDate,
  prettyPatientDateOfBirth,
} from '../../../util/date.ts'
import { DescriptionList } from '../../library/DescriptionList.tsx'
import { Person } from '../../library/Person.tsx'
import { Prescriptions } from '../../library/icons/SeekingTreatment.tsx'

type IntakePatientSummary = Awaited<ReturnType<typeof getSummaryById>>

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
function Medication({ medication }: { medication: MedicationSummary }) {
  let current_date = medication.start_date

  const display_schedules = medication.schedules.map((schedule) => {
    const dosage = dosageDisplay({
      ...medication,
      dosage: schedule.dosage,
      strength_numerator: Number(medication.strength),
      strength_denominator: Number(medication.strength_denominator),
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

function PreExistingConditionsSummary(
  { pre_existing_conditions }: {
    pre_existing_conditions: PreExistingConditionSummary[]
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

function FamilySummary(
  { family }: {
    family: IntakePatientSummary['family']
  },
) {
  return (
    <div className='flex flex-col'>
      {family.marital_status && (
        <>
          <span className='font-semibold'>Marital Status:</span>
          <span>{family.marital_status}</span>
        </>
      )}

      {family.religion && (
        <>
          <span className='font-semibold mt-2'>Religion:</span>
          <span>{family.religion}</span>
        </>
      )}

      {family.family_type && (
        <>
          <span className='font-semibold mt-2'>Family Type:</span>
          <span>{family.family_type}</span>
        </>
      )}
    </div>
  )
}

// Do something for displaying international phone numbers
function PhoneDisplay({ phone_number }: { phone_number: string }) {
  return <span>{phone_number}</span>
}

function PersonalSummary({ patient }: { patient: IntakePatientSummary }) {
  return (
    <div className='flex flex-col'>
      <Person person={patient} />
      {
        /* {patient.phone_number && (
        <PhoneDisplay phone_number={patient.phone_number} />
      )} */
      }
      <PhoneDisplay phone_number={patient.phone_number || '+263 XXX'} />
    </div>
  )
}

export default function PatientSummary(
  { patient }: {
    patient: IntakePatientSummary
  },
) {
  const intake_href = `/app/patients/${patient.id}/intake`

  return (
    <DescriptionList
      title='Summary Patient Details'
      items={[
        {
          label: 'Personal',
          children: <PersonalSummary patient={patient} />,
          edit_href: `${intake_href}/personal`,
        },
        {
          label: 'Address',
          children: patient.address,
          edit_href: `${intake_href}/address`,
        },
        { label: 'Ethnicity', children: patient.ethnicity, edit_href: 'TODO' },
        { label: 'Phone', children: patient.phone_number, edit_href: 'TODO' },
        {
          label: 'National ID',
          children: patient.national_id_number,
          edit_href: 'TODO',
        },
        { label: 'Address', children: patient.address, edit_href: 'TODO' },
        {
          label: 'Nearest Organization',
          children: patient.nearest_organization_name,
          edit_href: 'TODO',
        },
        {
          label: 'Primary Doctor',
          children: patient.primary_doctor_name,
          edit_href: 'TODO',
        },
        {
          label: 'Pre-existing Conditions',
          children: <PreExistingConditionsSummary {...patient} />,
          edit_href: 'TODO',
        },
        {
          label: 'Family',
          children: <FamilySummary family={patient.family} />,
          edit_href: `${intake_href}/family`,
        },
      ]}
    />
  )
}
