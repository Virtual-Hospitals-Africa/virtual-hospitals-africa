import { PatientDrawerV4Props } from '../../types.ts'
import { DrawerCareTeam } from './CareTeam.tsx'
import { DrawerHistory } from './History.tsx'
import { DrawerPatientCard } from './PatientCard.tsx'
import { DrawerThisVisit } from './ThisVisit.tsx'

export default function PatientDrawerV4({
  patient,
  encounter,
  this_visit_records,
  patient_history,
  care_team,
  current_workflow_state,
}: PatientDrawerV4Props) {
  return (
    <div
      id='patient-drawer'
      className='bg-white box-border content-stretch flex flex-col gap-[10px] items-center justify-start p-[16px] relative size-full'
    >
      <div className='absolute border-[0px_0px_0px_1.5px] border-gray-200 border-solid inset-0 pointer-events-none shadow-[0px_60px_90px_0px_rgba(75,85,99,0.1)]' />
      <div className='box-border content-stretch flex flex-col gap-[24px] items-center justify-start pb-[80px] pt-0 px-0 relative shrink-0'>
        <div className='content-stretch flex flex-col gap-[24px] items-start justify-start relative shrink-0'>
          <DrawerPatientCard
            patient={patient}
            priority={encounter.priority?.name}
          />
          <DrawerThisVisit
            this_visit_records={this_visit_records}
            encounter={encounter}
            current_workflow_state={current_workflow_state}
          />
          <DrawerHistory history={patient_history} />
          <DrawerCareTeam care_team={care_team} />
        </div>
      </div>
    </div>
  )
}
