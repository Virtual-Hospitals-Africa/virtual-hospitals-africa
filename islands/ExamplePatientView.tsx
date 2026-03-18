// =============================================================================
// FILE: /islands/ExamplePatientView.tsx
// Example patient view using OpenEncounterWorkflowLayout
// =============================================================================

import { OpenEncounterWorkflowLayout } from '../components/OpenEncounterWorkflowLayout.tsx'
import type { MockPatientCase } from '../mocks/data/patients.ts'
import { EmergencyCallButton } from './EmergencyCallButton.tsx'
import { SidebarHealthWorkerMenu } from './sidebar/HealthWorkerMenu.tsx'

// Nav links for the example triage workflow
const EXAMPLE_NAV_LINKS = [
  { step: 'warning_signs', route: '#warning_signs', title: 'Warning Signs' },
  { step: 'brief_history', route: '#brief_history', title: 'Brief History' },
  { step: 'vitals', route: '#vitals', title: 'Vitals' },
  { step: 'additional_tasks', route: '#additional_tasks', title: 'Additional Tasks' },
  { step: 'assign_priority', route: '#assign_priority', title: 'Assign Priority' },
  { step: 'route_patient', route: '#route_patient', title: 'Route Patient' },
]

// Mock employee for the sidebar
const EXAMPLE_EMPLOYEE = {
  display_name: 'Example Health Worker',
  description: 'Nurse - Primary care',
  avatar_url: '/images/avatars/random/female/6.png',
}

type Props = {
  url: URL
  route: string
  mock_patient: MockPatientCase
}

export function ExamplePatientView({ url, route, mock_patient }: Props) {
  return (
    <OpenEncounterWorkflowLayout
      id='example-warning-signs'
      url={url}
      route={route}
      params={{}}
      nav_links={EXAMPLE_NAV_LINKS}
      patient={mock_patient.patient}
      priority={mock_patient.priority}
      organization_id='example-org-001'
      this_visit_findings={mock_patient.this_visit_findings}
      this_visit_diagnoses={mock_patient.this_visit_diagnoses}
      steps_completed={['warning_signs']}
      patient_history={mock_patient.patient_history}
      ContainerTag='div'
      workflow='triage'
      care_team={mock_patient.care_team}
      sidebar_bottom={
        <div className='space-y-3'>
          <EmergencyCallButton href='#emergency' />
          <SidebarHealthWorkerMenu {...EXAMPLE_EMPLOYEE} />
        </div>
      }
      buttons={
        <a
          href='/example/patients'
          className='inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50'
        >
          Back to Patient List
        </a>
      }
      onSubmit={(e) => e.preventDefault()}
    >
      <WarningSignsContent mock_patient={mock_patient} />
    </OpenEncounterWorkflowLayout>
  )
}

function WarningSignsContent({ mock_patient }: { mock_patient: MockPatientCase }) {
  return (
    <div className='space-y-6'>
      {/* Page Header */}
      <div>
        <h1 className='text-xl font-semibold text-gray-900'>Warning Signs Assessment</h1>
        <p className='text-sm text-gray-500 mt-1'>{mock_patient.description}</p>
      </div>

      {/* Priority Badge */}
      {mock_patient.priority && (
        <div>
          <span
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
              mock_patient.priority === 'Emergency'
                ? 'bg-red-100 text-red-800'
                : mock_patient.priority === 'Very urgent'
                ? 'bg-orange-100 text-orange-800'
                : mock_patient.priority === 'Urgent'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            Priority: {mock_patient.priority}
          </span>
        </div>
      )}

      {/* Key Clinical Findings */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <h2 className='text-base font-medium text-gray-900 mb-4'>Key Clinical Findings</h2>

        {/* Pre-existing Conditions */}
        {mock_patient.patient_history.pre_existing_conditions.length > 0 && (
          <div className='mb-4'>
            <h3 className='text-sm font-medium text-gray-700 mb-2'>Pre-existing Conditions</h3>
            <div className='flex flex-wrap gap-2'>
              {mock_patient.patient_history.pre_existing_conditions.map((condition) => (
                <span
                  key={condition.id}
                  className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800'
                >
                  {condition.displays.finding}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Allergies */}
        {mock_patient.patient_history.allergies.length > 0 && (
          <div className='mb-4'>
            <h3 className='text-sm font-medium text-gray-700 mb-2'>Allergies</h3>
            <div className='flex flex-wrap gap-2'>
              {mock_patient.patient_history.allergies.map((allergy) => (
                <span
                  key={allergy.id}
                  className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'
                >
                  {allergy.displays.finding}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Current Medications */}
        {mock_patient.patient_history.medications.length > 0 && (
          <div className='mb-4'>
            <h3 className='text-sm font-medium text-gray-700 mb-2'>Current Medications</h3>
            <div className='flex flex-wrap gap-2'>
              {mock_patient.patient_history.medications.map((medication) => (
                <span
                  key={medication.id}
                  className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'
                >
                  {medication.displays.full}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lab Results */}
      {mock_patient.patient_history.lab_results && mock_patient.patient_history.lab_results.length > 0 && (
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <h2 className='text-base font-medium text-gray-900 mb-4'>Recent Lab Results</h2>
          <div className='divide-y divide-gray-100'>
            {mock_patient.patient_history.lab_results.map((result) => (
              <div key={result.id} className='py-3 flex justify-between items-center'>
                <span className='text-sm text-gray-600'>{result.displays.finding}</span>
                <span className='text-sm font-medium text-gray-900'>{result.displays.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents */}
      {mock_patient.patient_history.documents && mock_patient.patient_history.documents.length > 0 && (
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <h2 className='text-base font-medium text-gray-900 mb-4'>Documents & Reports</h2>
          <ul className='space-y-3'>
            {mock_patient.patient_history.documents.map((doc) => (
              <li key={doc.id} className='flex items-center'>
                <svg
                  className='w-5 h-5 text-gray-400 mr-3'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    stroke-width='2'
                    d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                  />
                </svg>
                <span className='text-sm text-blue-600 hover:text-blue-800'>
                  {doc.displays.full}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
