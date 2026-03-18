import { PatientDrawerV4Props } from '../../types.ts'
import { DrawerCareTeam } from './CareTeam.tsx'
import { DrawerHistory } from './History.tsx'
import { DrawerPatientCard } from './PatientCard.tsx'
import { DrawerThisVisit } from './ThisVisit.tsx'

export default function PatientDrawerV4({
  patient,
  priority,
  this_visit_findings,
  this_visit_diagnoses,
  patient_history,
  care_team,
  organization_id,
}: PatientDrawerV4Props) {
  return (
    <div
      id='patient-drawer'
      className='bg-white box-border content-stretch flex flex-col gap-2.5 items-stretch justify-start relative size-full overflow-y-scroll w-60 xl:w-84 h-full border-l border-gray-200'
    >
      <DrawerPatientCard
        patient={patient}
        organization_id={organization_id}
        priority={priority}
      />
      <DrawerThisVisit
        this_visit_findings={this_visit_findings}
        this_visit_diagnoses={this_visit_diagnoses}
        organization_id={organization_id}
      />
      <DrawerHistory organization_id={organization_id} history={patient_history} />
      <DrawerCareTeam care_team={care_team} organization_id={organization_id} patient_id={patient.id} />
    </div>
  )
}
