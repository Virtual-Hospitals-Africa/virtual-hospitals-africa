import { type Maybe, RenderedPatientExaminationFinding } from '../../types.ts'
import { FindingsList } from './FindingsList.tsx'
import { Person } from '../../components/library/Person.tsx'

export function PatientDrawer(
  props: {
    patient: {
      id: string
      name: string
      description: string | null
      avatar_url?: Maybe<string>
      actions: {
        chart: string
      }
    }
    findings: RenderedPatientExaminationFinding[]
  },
) {
  return (
    <div className='flex h-full flex-col overflow-y-scroll bg-white shadow-xl'>
      <Person person={props.patient} />
      <FindingsList findings={props.findings} />
    </div>
  )
}
