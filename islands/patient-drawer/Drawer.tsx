import { type Maybe, RenderedPatientExaminationFinding } from '../../types.ts'
import { FindingsList } from './FindingsList.tsx'
import { Person } from '../../components/library/Person.tsx'
import SectionHeader from '../../components/library/typography/SectionHeader.tsx'

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
    encounter: {
      reason: string
    }
    findings: RenderedPatientExaminationFinding[]
  },
) {
  return (
    <div className='flex h-full flex-col overflow-y-scroll bg-white shadow-xl px-2'>
      <div className='py-5 border-b-2'>
        <div className='h-16 grid items-center justify-between'>
          <Person person={props.patient} size='lg' />
        </div>
      </div>
      <div className='w-full py-2'>
        <SectionHeader>Reason for visit</SectionHeader>
        <p>{props.encounter.reason}</p>
      </div>
      <div className='w-full py-2'>
        <SectionHeader>Basic Information</SectionHeader>
        <FindingsList findings={props.findings} />
      </div>
      <div className='w-full py-2'>
        <SectionHeader>Findings</SectionHeader>
        <FindingsList findings={props.findings} />
      </div>
    </div>
  )
}
