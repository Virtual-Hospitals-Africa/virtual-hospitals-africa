import {
  type Maybe,
  Measurement,
  Measurements,
  RenderedPatientExaminationFinding,
} from '../../types.ts'
import { SendToSelectedPatient } from '../SendTo/SelectedPatient.tsx'
import { HEADER_HEIGHT_PX } from '../../components/library/HeaderHeight.ts'
import { PatientDrawerAccordion } from './Accordion.tsx'
import Badge from '../../components/library/Badge.tsx'

/* TODO
  - PatientHeader - Done for now
    - PatientCard
    - In Treatment Status Badge (<Badge />)
  - General Accordion
    - using location hash to save which accordions are open
  - CurrentVisitSection ( Seeking Treatment)
  - Conditions & Medications Section
  - History Section
  - Care Team Section
    - Primary Doctor
    - Those recently seen

    - We need the following form the medcal team
      - Avatar URL
      - Name
      - Clinic they saw the patient as a member of
      - Their role in the patient care
    */

export function PatientDrawerV2(
  {
    patient,
    encounter,
    // findings,
    // measurements,
    // flaggedVitals = new Map(),
    care_team,
  }: {
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
      reason: string
      notes: string | null
    }
    // deno-lint-ignore no-explicit-any
    care_team: any[]
    findings: RenderedPatientExaminationFinding[]
    measurements: Measurement<keyof Measurements>[]
    flaggedVitals?: Map<string, Measurement<keyof Measurements>>
  },
) {
  return (
    <div className='flex h-full flex-col overflow-y-scroll bg-white shadow-xl sticky right-0 min-w-[300px]'>
      <div
        className='w-full flex flex-row items-center justify-between border-b-2'
        style={{
          height: HEADER_HEIGHT_PX,
        }}
      >
        {/* <Person person={patient} size='lg' /> */}
        <SendToSelectedPatient patient={patient} />

        <Badge content='In Treatment' color='yellow' />
      </div>

      <div className='border-b-2 px-4'>
        <PatientDrawerAccordion
          encounter_reason={encounter.reason}
          care_team={care_team}
        />
        {
          /* <div className='w-full py-2'>
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
        <div className='w-full py-2'>
          <SectionHeader>Vitals</SectionHeader>
          <VitalsList
            measurements={measurements}
            vitals={flaggedVitals}
          />
        </div> */
        }
      </div>
    </div>
  )
}
