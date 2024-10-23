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
import { FamilyRelation } from '../../../types.ts'
import { MajorSurgery, PastMedicalCondition } from '../../../types.ts'

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

function Relation({ relation }: { relation: FamilyRelation }) {
  return (
    <div className='mt-1.5 flex flex-col gap-1'>
      <span>{relation.patient_name}, {relation.family_relation_gendered}</span>
      <span>
        Phone:{' '}
        <PhoneDisplay phone_number={relation.patient_phone_number || 'N/A'} />
      </span>
    </div>
  )
}

function MedicalConditionSummary(
  { past_medical_conditions, major_surgeries }: {
    past_medical_conditions: PastMedicalCondition[]
    major_surgeries: MajorSurgery[]
  },
) {
  if (!past_medical_conditions.length && !major_surgeries.length) return null
  return (
    <div>
      {past_medical_conditions.map((condition) => (
        <div className='flex flex-col'>
          <span className='font-semibold'>{condition.name}</span>
          <DateRange {...condition} />
        </div>
      ))}
    </div>
  )
}

function MajorSurgerySummary(
  { major_surgeries }: {
    major_surgeries: MajorSurgery[]
  },
) {
  if (!major_surgeries.length) return null
  return (
    <div>
      {major_surgeries.map((surgery) => (
        <div className='flex flex-col'>
          <span className='font-semibold'>{surgery.name}</span>
          <DateRange {...surgery} />
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

      {family.guardians && family.guardians.length > 0 && (
        <div className='mt-4'>
          <span className='font-semibold'>Guardians</span>
          <div className='mt-2 flex flex-col gap-2 pl-4'>
            {family.guardians.map((guardian) => (
              <Relation key={guardian.relation_id} relation={guardian} />
            ))}
          </div>
        </div>
      )}

      {family.dependents && family.dependents.length > 0 && (
        <div className='mt-4'>
          <span className='font-semibold'>Dependents</span>
          <div className='mt-2 flex flex-col gap-2 pl-4'>
            {family.dependents.map((dependent) => (
              <Relation key={dependent.relation_id} relation={dependent} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function OccupationSummary(
  { occupation }: { occupation: IntakePatientSummary['occupation'] },
) {
  const renderSchoolInfo = () => {
    if (!occupation?.school) return null

    switch (occupation.school.status) {
      case 'never attended':
        return (
          <span className='mt-2 flex flex-col gap-2 pl-4'>
            Never attended school
          </span>
        )

      case 'in school':
        return (
          <span className='mt-2 flex flex-col gap-2 pl-4'>
            Currently in school: {occupation.school.current?.grade}
          </span>
        )

      case 'stopped school':
        return (
          <span className='mt-2 flex flex-col gap-2 pl-4'>
            Stopped school at: {occupation.school.past.stopped_last_grade}
          </span>
        )

      case 'adult in school':
        return (
          <span className='mt-2 flex flex-col gap-2 pl-4'>
            Education Level: {occupation.school.education_level}
          </span>
        )

      case 'adult stopped school':
        return (
          <>
            <span className='mt-2 flex flex-col gap-2 pl-4'>
              Education Level: {occupation.school.education_level}
            </span>
            <span className='mt-2 flex flex-col gap-2 pl-4'>
              Reason for stopping: {occupation.school.reason}
            </span>
            <span className='mt-2 flex flex-col gap-2 pl-4'>
              Desire to return:{' '}
              {occupation.school.desire_to_return ? 'Yes' : 'No'}
            </span>
          </>
        )

      default:
        return null
    }
  }

  return (
    <>
      {occupation?.school && (
        <div className='mt-4'>
          <span className='font-semibold'>School</span>
          {renderSchoolInfo()}
        </div>
      )}

      {occupation?.job && (
        <div className='mt-4'>
          <span className='font-semibold'>Job</span>
          {occupation?.job?.profession && (
            <span className='mt-2 flex flex-col gap-2 pl-4'>
              Profession: {occupation.job.profession}
            </span>
          )}
          {occupation?.job?.work_satisfaction && (
            <span className='mt-2 flex flex-col gap-2 pl-4'>
              Work Satisfaction: {occupation.job.work_satisfaction}
            </span>
          )}
        </div>
      )}
    </>
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
    console.log(patient.occupation),
      (
        <DescriptionList
          title='Summary Patient Details'
          items={[
            {
              label: 'Personal',
              children: <PersonalSummary patient={patient} />,
              edit_href: `${intake_href}/personal#focus=personal`,
            },
            {
              label: 'Address',
              children: patient.address,
              edit_href: `${intake_href}/address#focus=address`,
            },
            {
              label: 'Ethnicity',
              children: patient.ethnicity,
              edit_href: `${intake_href}/personal#focus=ethnicity`,
            },
            {
              label: 'Phone',
              children: patient.phone_number,
              edit_href: `${intake_href}/personal#focus=phone`,
            },
            {
              label: 'National ID',
              children: patient.national_id_number,
              edit_href: `${intake_href}/personal#focus=national_id_number`,
            },
            {
              label: 'Nearest Organization',
              children: patient.nearest_organization_name,
              edit_href:
                `${intake_href}/address#focus=nearest_organization_name`,
            },
            {
              label: 'Primary Doctor',
              children: patient.primary_doctor_name,
              edit_href: `${intake_href}/address#focus=primary_doctor_name`,
            },
            {
              label: 'Pre-existing Conditions',
              children: <PreExistingConditionsSummary {...patient} />,
              edit_href:
                `${intake_href}/conditions#focus=pre_existing_conditions`,
            },
            {
              label: 'Past Medical Conditions',
              children: <MedicalConditionSummary {...patient} />,
              edit_href: `${intake_href}/history`,
            },
            {
              label: 'Major Surgeries and Procedures',
              children: <MajorSurgerySummary {...patient} />,
              edit_href: `${intake_href}/history`,
            },
            {
              label: 'Family',
              children: <FamilySummary family={patient.family} />,
              edit_href: `${intake_href}/family#focus=family`,
            },
            {
              label: 'Occupation',
              children: <OccupationSummary occupation={patient.occupation} />,
              edit_href: `${intake_href}/family#focus=occupation`,
            },
          ]}
        />
      )
  )
}
