import {
  PatientDrawerRecordDisplay,
  PatientDrawerV3Props,
  RenderedCareTeamHealthWorker,
  RenderedPatient,
  RenderedPatientHistory,
} from '../../types.ts'

// Individual chip component for triage levels
function TriageChip({ record }: { record: PatientDrawerRecordDisplay }) {
  const priorityStyles = {
    'Emergency': 'bg-red-100 text-red-800',
    'Very urgent': 'bg-orange-100 text-orange-700',
    'Urgent': 'bg-yellow-100 text-yellow-800',
    'Non-urgent': 'bg-green-100 text-green-800',
    'Normal': 'bg-gray-100 text-gray-600',
    'Deceased': 'bg-blue-100 text-blue-800',
  }

  const styleClass = priorityStyles[record.priority] ||
    'bg-gray-100 text-gray-600'

  return (
    <div
      className={`box-border content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[2px] relative rounded-[60px] shrink-0 ${styleClass}`}
    >
      <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[12px] text-nowrap whitespace-pre">
        {record.display}
      </p>
    </div>
  )
}

// Patient's drawer card component with avatar, name, DOB, and triage
function PatientDrawerCard({ patient }: { patient: RenderedPatient }) {
  const avatar_url = patient.avatar_url || '/static/images/default-avatar.png'

  return (
    <div className='bg-red-100 relative rounded-[8px] shrink-0'>
      <div className='box-border content-stretch flex flex-col gap-[12px] items-center justify-start overflow-clip p-[16px] relative'>
        <div className='content-stretch flex gap-[12px] h-[56px] items-center justify-start relative shrink-0 w-[336px]'>
          <div
            className='bg-center bg-cover bg-no-repeat relative rounded-[200px] shrink-0 size-[56px]'
            style={{ backgroundImage: `url('${avatar_url}')` }}
          >
            <div className='absolute border border-gray-200 border-solid inset-0 pointer-events-none rounded-[200px]' />
          </div>
          <div className='basis-0 content-stretch flex flex-col gap-[4px] grow items-start justify-start min-h-px min-w-px relative shrink-0'>
            <div className='content-stretch flex gap-[8px] items-center justify-start relative shrink-0 w-full'>
              <div className="basis-0 flex flex-col font-['Inter:Semi_Bold',_sans-serif] font-semibold grow justify-center leading-[0] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[18px] text-gray-800 text-nowrap">
                <p className='[white-space-collapse:collapse] leading-[26px] overflow-ellipsis overflow-hidden'>
                  {patient.name}
                </p>
              </div>
              <div className='bg-gray-50 box-border content-stretch flex gap-[10px] items-center justify-start p-[12px] relative rounded-[6px] shrink-0 size-[24px]'>
                <div className='absolute border border-gray-200 border-solid inset-0 pointer-events-none rounded-[6px]' />
                <div className='absolute inset-1/4 overflow-clip'>
                  <div className='absolute inset-[6.25%]'>
                    <svg
                      className='block max-w-none size-full'
                      viewBox='0 0 16 16'
                      fill='none'
                    >
                      <path
                        d='M8 3V13M3 8H13'
                        stroke='currentColor'
                        strokeWidth='1.5'
                        strokeLinecap='round'
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className='content-stretch flex gap-[16px] items-center justify-start relative shrink-0'>
              <div className='box-border content-stretch flex gap-[4px] items-start justify-start px-0 py-[4px] relative rounded-[5px] shrink-0'>
                <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#29313d] text-[12px] text-center text-nowrap whitespace-pre">
                  {patient.sex || 'Unknown'}
                </p>
              </div>
              <div className='box-border content-stretch flex gap-[4px] items-start justify-start px-0 py-[4px] relative rounded-[5px] shrink-0'>
                <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#29313d] text-[12px] text-center text-nowrap whitespace-pre">
                  {patient.dob_formatted}{' '}
                  {patient.age_display && `(${patient.age_display})`}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className='relative w-full h-0 shrink-0'>
          <div className='absolute bottom-[-0.5px] left-0 right-0 top-[-0.5px]'>
            <svg
              className='block max-w-none size-full'
              viewBox='0 0 336 1'
              fill='none'
            >
              <line x1='0' y1='0.5' x2='336' y2='0.5' stroke='#e5e7eb' />
            </svg>
          </div>
        </div>
        <div className='relative flex items-center justify-between w-full content-stretch shrink-0'>
          <div className='relative flex flex-col items-start justify-start content-stretch shrink-0'>
            <p className="font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-[24px] not-italic relative shrink-0 text-[16px] text-center text-nowrap text-red-800 whitespace-pre">
              Emergency
            </p>
          </div>
          <div className='bg-gray-100 box-border content-stretch flex gap-[8px] h-[32px] items-center justify-start px-[16px] py-[8px] relative rounded-[6px] shrink-0'>
            <div className='absolute border border-gray-200 border-solid inset-0 pointer-events-none rounded-[6px]' />
            <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-center text-gray-600 text-nowrap">
              <p className='leading-[20px] whitespace-pre'>Change</p>
            </div>
          </div>
        </div>
      </div>
      <div className='absolute border border-gray-100 border-solid inset-0 pointer-events-none rounded-[8px]' />
    </div>
  )
}

// This Visit component showing encounter steps
function ThisVisit({ records, current_consultation_step }: {
  records: PatientDrawerV3Props['this_visit_records']
  current_consultation_step: PatientDrawerV3Props['current_consultation_step']
}) {
  const encounterSteps = [
    {
      key: 'chief_complaint',
      label: 'Chief Complaint',
      records: records.chief_complaint,
    },
    { key: 'vitals', label: 'Vitals', records: records.vitals },
    { key: 'symptoms', label: 'Symptoms', records: records.symptoms },
    {
      key: 'examinations',
      label: 'Examinations',
      records: records.examinations,
    },
    {
      key: 'diagnostic_tests',
      label: 'Diagnostic Tests',
      records: records.diagnostic_tests,
    },
    { key: 'diagnoses', label: 'Diagnosis', records: records.diagnoses },
  ]

  return (
    <div className='bg-white content-stretch flex flex-col items-start justify-start relative shrink-0 w-[368px]'>
      <div className='content-stretch flex flex-col h-[46px] items-start justify-start relative shrink-0 w-full'>
        <div className='box-border content-stretch flex gap-[16px] h-[46px] isolate items-center justify-start px-[16px] py-[8px] relative shrink-0 w-full'>
          <p className="font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-[22px] not-italic relative shrink-0 text-[#29313d] text-[16px] text-nowrap whitespace-pre z-[2]">
            This Visit
          </p>
        </div>
      </div>

      {encounterSteps.map((step) => (
        <div
          key={step.key}
          className='box-border content-stretch flex flex-col gap-[8px] items-start justify-start px-[16px] py-[8px] relative shrink-0 w-[368px]'
        >
          <div className='box-border content-stretch flex flex-col gap-[8px] items-start justify-start overflow-clip pb-[16px] pt-0 px-0 relative shrink-0 w-[342px]'>
            <div className='content-stretch flex gap-[8px] items-center justify-center relative shrink-0'>
              <p
                className={`font-['Inter:Medium',_sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[14px] text-nowrap whitespace-pre ${
                  step.records.length === 0 ? 'text-[#959ca9]' : 'text-gray-600'
                }`}
              >
                {step.label}
              </p>
              {current_consultation_step === step.key && (
                <div className='relative flex items-start justify-start content-stretch shrink-0'>
                  <div className='box-border content-stretch flex gap-[8px] items-center justify-start px-0 py-[2px] relative rounded-[60px] shrink-0 w-[93px]'>
                    <p className="font-['Inter:Medium_Italic',_sans-serif] font-medium italic leading-[16px] relative shrink-0 text-[#959ca9] text-[12px] text-nowrap whitespace-pre">
                      In Progress
                    </p>
                  </div>
                </div>
              )}
            </div>
            {step.records.length > 0 && (
              <div className='box-border content-center flex flex-wrap gap-[8px] items-center justify-start px-px py-0 relative shrink-0 w-full'>
                {step.records.map((record) => (
                  <TriageChip key={record.record_id} record={record} />
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// History component with medical history sections
function History({ history }: { history: RenderedPatientHistory }) {
  const historyItems = [
    {
      key: 'pre_existing_conditions',
      label: 'Pre-existing Conditions',
      icon: 'symptom',
      records: history.pre_existing_conditions,
    },
    {
      key: 'allergies',
      label: 'Allergies',
      icon: 'allergy',
      records: history.allergies,
    },
    {
      key: 'family_history',
      label: 'Family History',
      icon: 'group',
      records: history.family_history,
    },
    {
      key: 'major_surgeries',
      label: 'Major Surgeries',
      icon: 'surgery',
      records: history.major_surgeries,
    },
    {
      key: 'medications',
      label: 'Medications',
      icon: 'pharmacy',
      records: history.medications,
    },
    {
      key: 'lifestyle',
      label: 'Lifestyle',
      icon: 'heart-rate',
      records: history.lifestyle,
    },
  ]

  return (
    <div className='bg-white content-stretch flex flex-col items-start justify-start relative shrink-0 w-[368px]'>
      <div className='content-stretch flex h-[46px] items-start justify-between relative shrink-0 w-full'>
        <div className='basis-0 box-border content-stretch flex gap-[16px] grow h-[46px] isolate items-center justify-start min-h-px min-w-px px-[16px] py-[8px] relative shrink-0'>
          <p className="font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-[22px] not-italic relative shrink-0 text-[#29313d] text-[16px] text-nowrap whitespace-pre z-[2]">
            History
          </p>
        </div>
      </div>

      <div className='relative flex flex-col items-start justify-start content-stretch shrink-0'>
        {historyItems.map((item) => (
          <div
            key={item.key}
            className='box-border content-stretch flex flex-col gap-[8px] items-start justify-start px-[16px] py-[8px] relative shrink-0 w-[368px]'
          >
            <div className='box-border content-stretch flex flex-col gap-[8px] items-start justify-start overflow-clip pb-[16px] pt-0 px-0 relative shrink-0 w-[342px]'>
              <div className='content-stretch flex gap-[8px] items-center justify-center relative shrink-0'>
                <div className='overflow-clip relative shrink-0 size-[16px]'>
                  <div className='absolute inset-[6.25%]'>
                    <svg
                      className='block max-w-none size-full'
                      viewBox='0 0 16 16'
                      fill='currentColor'
                    >
                      <path
                        d='M8 3V13M3 8H13'
                        stroke='currentColor'
                        strokeWidth='1.5'
                        strokeLinecap='round'
                      />
                    </svg>
                  </div>
                </div>
                <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[14px] text-gray-600 text-nowrap whitespace-pre">
                  {item.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Care Team component with provider cards
function CareTeam(
  { care_team }: { care_team: RenderedCareTeamHealthWorker[] },
) {
  return (
    <div className='content-stretch flex flex-col gap-[8px] items-center justify-start relative shrink-0 w-full'>
      <div className='relative flex flex-col items-start justify-start w-full content-stretch shrink-0'>
        <div className='box-border content-stretch flex gap-[4px] isolate items-center justify-start px-[16px] py-0 relative shrink-0 w-full'>
          <p className="font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-[22px] not-italic relative shrink-0 text-[#29313d] text-[16px] text-nowrap whitespace-pre z-[3]">
            Care Team
          </p>
        </div>
        <div className='box-border content-stretch flex flex-col gap-[16px] items-start justify-start px-[16px] py-[8px] relative shrink-0 w-full'>
          <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-gray-600 w-full">
            See a list of all the doctors who have had contact with the patient
            in the recent past.
          </p>
        </div>
      </div>

      <div className='box-border content-stretch flex flex-col gap-[16px] items-start justify-start px-[16px] py-0 relative shrink-0 w-full'>
        {care_team.map((provider) => (
          <div
            key={provider.health_worker_id}
            className='bg-gray-50 box-border content-stretch flex flex-col gap-[16px] items-start justify-start p-[16px] relative rounded-[8px] shrink-0 w-full'
          >
            <div className='absolute border border-gray-100 border-solid inset-0 pointer-events-none rounded-[8px]' />
            <div className='content-stretch flex gap-[16px] items-start justify-start relative shrink-0 w-full'>
              <div className='basis-0 content-stretch flex flex-col gap-[8px] grow items-start justify-start min-h-px min-w-px relative shrink-0'>
                <div className='box-border content-stretch flex gap-[4px] h-[20px] items-center justify-start px-[2px] py-0 relative rounded-[4px] shrink-0 w-full'>
                  <div className="flex flex-col font-['Inter:Semi_Bold',_sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-center text-gray-800 text-nowrap">
                    <p className='leading-[20px] whitespace-pre'>
                      {provider.name}
                    </p>
                  </div>
                  <div className='overflow-clip relative shrink-0 size-[16px]'>
                    <svg
                      className='block max-w-none size-full'
                      viewBox='0 0 16 16'
                      fill='currentColor'
                    >
                      <path
                        d='M8 3V13M3 8H13'
                        stroke='currentColor'
                        strokeWidth='1.5'
                        strokeLinecap='round'
                      />
                    </svg>
                  </div>
                </div>
                <div className='relative flex flex-col items-start justify-start w-full content-stretch shrink-0'>
                  <div className='box-border content-stretch flex gap-[4px] h-[20px] items-center justify-start px-[2px] py-0 relative rounded-[4px] shrink-0 w-full'>
                    <div className='overflow-clip relative shrink-0 size-[16px]'>
                      <svg
                        className='block max-w-none size-full'
                        viewBox='0 0 16 16'
                        fill='currentColor'
                      >
                        <path
                          d='M8 3V13M3 8H13'
                          stroke='currentColor'
                          strokeWidth='1.5'
                          strokeLinecap='round'
                        />
                      </svg>
                    </div>
                    <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#473fce] text-[12px] text-center text-nowrap">
                      <p className='leading-[16px] whitespace-pre'>
                        {provider.profession === 'doctor'
                          ? 'Primary Care RenderedCareTeamHealthWorker'
                          : 'Nurse'}
                      </p>
                    </div>
                  </div>
                  <div className='box-border content-stretch flex gap-[4px] h-[20px] items-center justify-start px-[2px] py-0 relative rounded-[4px] shrink-0 w-full'>
                    <div className='overflow-clip relative shrink-0 size-[16px]'>
                      <svg
                        className='block max-w-none size-full'
                        viewBox='0 0 16 16'
                        fill='currentColor'
                      >
                        <path
                          d='M8 3V13M3 8H13'
                          stroke='currentColor'
                          strokeWidth='1.5'
                          strokeLinecap='round'
                        />
                      </svg>
                    </div>
                    <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-center text-gray-600 text-nowrap">
                      <p className='leading-[16px] whitespace-pre'>
                        Medical Clinic
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className='bg-center bg-cover bg-no-repeat relative rounded-[200px] shrink-0 size-[48px]'
                style={{
                  backgroundImage: `url('${
                    provider.avatar_url || '/static/images/default-avatar.png'
                  }')`,
                }}
              >
                <div className='absolute bottom-[-1px] overflow-clip right-[-1px] size-[14px]'>
                  <div className='absolute inset-[8.333%]'>
                    <div className='bg-green-500 rounded-full size-full'></div>
                  </div>
                </div>
              </div>
            </div>
            <div className='relative flex items-center justify-between w-full content-stretch shrink-0'>
              <div className='bg-indigo-700 box-border content-stretch flex gap-[8px] h-[32px] items-center justify-start px-[16px] py-[8px] relative rounded-[6px] shrink-0'>
                <div className='overflow-clip relative shrink-0 size-[16px]'>
                  <svg
                    className='block max-w-none size-full'
                    viewBox='0 0 16 16'
                    fill='white'
                  >
                    <path d='M2 6h12v7H2V6zm10-2V3a2 2 0 00-2-2H6a2 2 0 00-2 2v1H2v2h12V4h-2zm-6 0V3h4v1H6z' />
                  </svg>
                </div>
                <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-center text-nowrap text-white">
                  <p className='leading-[16px] whitespace-pre'>Message</p>
                </div>
              </div>
              <div className='box-border content-stretch flex gap-[4px] h-[20px] items-center justify-start px-[2px] py-0 relative rounded-[4px] shrink-0'>
                <div className="flex flex-col font-['Inter:Italic',_sans-serif] font-normal italic justify-center leading-[0] relative shrink-0 text-[12px] text-center text-gray-600 text-nowrap">
                  <p className='leading-[16px] whitespace-pre'>
                    Last visit 2 months ago
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PatientDrawerV3({
  patient,
  this_visit_records,
  current_consultation_step,
  patient_history,
  care_team,
}: PatientDrawerV3Props) {
  return (
    <div className='bg-white box-border content-stretch flex flex-col gap-[10px] items-center justify-start p-[16px] relative size-full'>
      <div className='absolute border-[0px_0px_0px_1.5px] border-gray-200 border-solid inset-0 pointer-events-none shadow-[0px_60px_90px_0px_rgba(75,85,99,0.1)]' />
      <div className='box-border content-stretch flex flex-col gap-[24px] items-center justify-start pb-[80px] pt-0 px-0 relative shrink-0'>
        <div className='content-stretch flex flex-col gap-[24px] items-start justify-start relative shrink-0'>
          <PatientDrawerCard patient={patient} />
          <ThisVisit
            records={this_visit_records}
            current_consultation_step={current_consultation_step}
          />
          <History history={patient_history} />
          <CareTeam care_team={care_team} />
        </div>
      </div>
    </div>
  )
}
