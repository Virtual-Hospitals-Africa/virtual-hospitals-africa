import { PatientDrawerV4Props } from '../../types.ts'
import { DrawerCareTeam } from './CareTeam.tsx'
import { DrawerHistory } from './History.tsx'
import { DrawerPatientCard } from './PatientCard.tsx'
import { DrawerThisVisit } from './ThisVisit.tsx'

export default function PatientDrawerV4({
  patient,
  encounter,
  this_visit_findings,
  patient_history,
  care_team,
  current_workflow_state,
  organization_id,
}: PatientDrawerV4Props) {
  return (
    <div
      id='patient-drawer'
      className='bg-white box-border content-stretch flex flex-col gap-2.5 items-stretch justify-start relative size-full overflow-y-scroll w-84 h-full border-l border-gray-200'
    >
      <DrawerPatientCard
        patient={patient}
        organization_id={organization_id}
        priority={encounter.priority?.name}
      />
      <DrawerThisVisit
        this_visit_findings={this_visit_findings}
        encounter={encounter}
        current_workflow_state={current_workflow_state}
        organization_id={organization_id}
      />
      <DrawerHistory history={patient_history} />
      <DrawerCareTeam care_team={care_team} />
    </div>
  )
}
