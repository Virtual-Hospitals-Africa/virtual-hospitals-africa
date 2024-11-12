import {
  type Maybe,
  RenderedPatientExaminationFinding,
  type Sendable,
} from '../../types.ts'
import { FindingsList } from './FindingsList.tsx'
import SectionHeader from '../../components/library/typography/SectionHeader.tsx'
import { SendToSelectedPatient } from '../SendTo/SelectedPatient.tsx'
import Menu from '../Menu.tsx'
import { HEADER_HEIGHT_PX } from '../../components/library/HeaderHeight.ts'

export function PatientDrawer(
  { patient, encounter, findings }: {
    form?: 'intake' | 'encounter'
    patient: {
      id: string
      name: string
      description: string | null
      avatar_url?: Maybe<string>
      actions: {
        view: string
      }
    }
    encounter: {
      notes: string | null
      reason: string
    }
    findings: RenderedPatientExaminationFinding[]
    sendables: Sendable[]
  },
) {
  return (
    <div className='flex h-full flex-col overflow-y-scroll bg-white shadow-xl px-2 sticky right-0 min-w-[300px]'>
      <div
        className='grid items-center justify-between border-b-2'
        style={{
          height: HEADER_HEIGHT_PX,
        }}
      >
        {/* <Person person={patient} size='lg' /> */}
        <SendToSelectedPatient patient={patient} />
      </div>

      <div className='border-b-2'>
        <div className='w-full py-2'>
          <SectionHeader>Reason for visit</SectionHeader>
          <p>{encounter.notes || encounter.reason}</p>
        </div>
        <div className='w-full py-2'>
          <SectionHeader>Basic Information</SectionHeader>
          TODO
        </div>
        <div className='w-full py-2'>
          <SectionHeader>Findings</SectionHeader>
          <FindingsList findings={findings} />
        </div>
      </div>
      <div className='flex flex-col'>
        <Menu
          icon='ChevronDownIcon'
          options={[{
            href: 'https://www.google.com',
            label: 'Google',
          }]}
          button_contents='Send to'
        >
        </Menu>
      </div>
      {
        /* <Button
        type='button'
        variant='outline'
        color='blue'
        className='flex-1 max-w-xl'
        onClick={handleClick}
      >
        Send to
      </Button>
      <SendableList
        form={form}
        sendables={sendables}
        selected={selected}
      /> */
      }
    </div>
  )
}
