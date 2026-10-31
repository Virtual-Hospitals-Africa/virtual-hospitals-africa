import { PatientDrawerBottomSheet } from '../components/drawer-v4/PatientDrawerBottomSheet.tsx'
import { DrawerCareTeam } from '../components/drawer-v4/CareTeam.tsx'
import { DrawerHistory } from '../components/drawer-v4/History.tsx'
import { DrawerThisVisit } from '../components/drawer-v4/ThisVisit.tsx'
import { PatientDrawerV4Props, RenderedPatient } from '../types.ts'
import capitalize from '../util/capitalize.ts'
import compact from '../util/compact.ts'
import { DrawerPatientCard } from './DrawerPatientCard.tsx'

function identityLabel(patient: RenderedPatient): string | null {
  const { sex, gender } = patient
  if (sex && gender) {
    const aligned = (sex === 'female' && gender === 'woman') || (sex === 'male' && gender === 'man')
    if (aligned) return capitalize(sex)
    return `${capitalize(sex)} · ${capitalize(gender)}`
  }
  if (sex) return capitalize(sex)
  if (gender) return capitalize(gender)
  return null
}

function dobAndAge(patient: RenderedPatient): string | null {
  if (patient.dob_formatted && patient.age_display) {
    return `${patient.dob_formatted} (${patient.age_display})`
  }
  return patient.dob_formatted || patient.age_display || null
}

function summaryDetail(patient: RenderedPatient): string | null {
  const parts = compact([identityLabel(patient), dobAndAge(patient)])
  if (parts.length) return parts.join(' · ')
  return patient.description
}

export function PatientDrawerV4({
  patient,
  priority,
  priority_evaluation,
  current_workflow,
  this_visit_findings,
  this_visit_diagnoses,
  patient_history,
  care_team,
  organization_id,
  escalation_candidates,
  nearest_hospital,
  refer_route,
}: PatientDrawerV4Props) {
  return (
    <PatientDrawerBottomSheet
      patient_name={patient.name}
      patient_detail={summaryDetail(patient)}
      priority_name={priority?.name ?? null}
    >
      <div
        id='patient-drawer'
        className='bg-white box-border content-stretch flex flex-col gap-2.5 items-stretch justify-start relative size-full overflow-y-scroll w-60 xl:w-84 h-full border-l border-gray-200 max-md:w-full! max-md:min-h-0 max-md:border-l-0! max-md:overscroll-contain'
      >
        <DrawerPatientCard
          patient={patient}
          organization_id={organization_id}
          priority={priority}
          priority_evaluation={priority_evaluation}
          escalation_candidates={escalation_candidates}
          nearest_hospital={nearest_hospital}
          refer_route={refer_route}
        />
        <DrawerThisVisit
          current_workflow={current_workflow}
          this_visit_findings={this_visit_findings}
          this_visit_diagnoses={this_visit_diagnoses}
          organization_id={organization_id}
        />
        <DrawerHistory organization_id={organization_id} history={patient_history} />
        <DrawerCareTeam care_team={care_team} organization_id={organization_id} patient_id={patient.id} />
      </div>
    </PatientDrawerBottomSheet>
  )
}
