import { useSignal } from '@preact/signals'
import { DrawerCareTeam } from '../components/drawer-v4/CareTeam.tsx'
import { DrawerHistory } from '../components/drawer-v4/History.tsx'
import { DrawerThisVisit } from '../components/drawer-v4/ThisVisit.tsx'
import { PatientDrawerV4Props } from '../types.ts'
import { DrawerPatientCard } from './DrawerPatientCard.tsx'
import { cls } from '../util/cls.ts'

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
  const opened = useSignal(true) // on mobile false to start
  console.log({z: opened.value})
  return (
    <div
      id='patient-drawer'
      className='hide md:show bg-white box-border content-stretch flex flex-col gap-2.5 items-stretch justify-start relative size-full overflow-y-scroll w-60 xl:w-84 h-full border-l border-gray-200'
    >
      <DrawerPatientCard
        patient={patient}
        organization_id={organization_id}
        priority={priority}
        priority_evaluation={priority_evaluation}
        escalation_candidates={escalation_candidates}
        nearest_hospital={nearest_hospital}
        refer_route={refer_route}
        onClick={() => opened.value = !opened.value}
      />
      <div className={cls('drawer-contents', {
        invisible: !opened.value,
        visible: opened.value
      })}>
        <DrawerThisVisit
          current_workflow={current_workflow}
          this_visit_findings={this_visit_findings}
          this_visit_diagnoses={this_visit_diagnoses}
          organization_id={organization_id}
        />
        <DrawerHistory organization_id={organization_id} history={patient_history} />
        <DrawerCareTeam care_team={care_team} organization_id={organization_id} patient_id={patient.id} />
      </div>
    </div>
  )
}
