import { OrganizationContext } from '../../../_middleware.ts'
import { getRequiredUUIDParam } from '../../../../../../../util/getParam.ts'
import { patient_encounters } from '../../../../../../../db/models/patient_encounters.ts'
import { assertOr404 } from '../../../../../../../util/assertOr.ts'
import { presentWithPatient } from '../../../../../../../shared/patient_encounters.ts'
import { Person } from '../../../../../../../components/library/Person.tsx'
import { employeeDisplay } from '../../../../../../../util/healthWorkerDisplay.ts'
import { HealthWorkerHomePageLayout } from '../../../../../_middleware.tsx'
import capitalize from '../../../../../../../util/capitalize.ts'
import Form from '../../../../../../../components/library/Form.tsx'
import { Button } from '../../../../../../../components/library/Button.tsx'

export default HealthWorkerHomePageLayout<OrganizationContext>(
  'Immediate Triage Request',
  async function RespondToImmediateTriageRequestPage(
    ctx: OrganizationContext,
  ) {
    const { trx, organization } = ctx.state
    const patient_id = getRequiredUUIDParam(ctx, 'patient_id')

    const patient_encounter = await patient_encounters.getFirstOpen(trx, {
      patient_id,
    })

    assertOr404(
      patient_encounter,
      'No open encounter for this patient at this organization',
    )

    const { patient } = patient_encounter

    const present_with_patient = presentWithPatient(patient_encounter)

    return {
      drawer: (
        <div className='p-6'>
          <h3 className='text-lg font-semibold mb-4'>Patient Information</h3>
          <div className='space-y-4'>
            <div className='flex items-center pb-4 border-b border-gray-200'>
              <Person
                person={{
                  ...patient,
                  display_name: patient.name || '[Unnamed Patient]',
                }}
              />
            </div>
            {patient.date_of_birth && (
              <div>
                <span className='text-sm font-medium text-gray-700'>
                  Date of Birth
                </span>
                <p className='text-sm text-gray-900 mt-1'>
                  {patient.dob_formatted}
                </p>
              </div>
            )}
            {patient.sex && (
              <div>
                <span className='text-sm font-medium text-gray-700'>Sex</span>
                <p className='text-sm text-gray-900 mt-1'>
                  {capitalize(patient.sex)}
                </p>
              </div>
            )}
            {patient.age_display && (
              <div>
                <span className='text-sm font-medium text-gray-700'>Age</span>
                <p className='text-sm text-gray-900 mt-1'>
                  {patient.age_display}
                </p>
              </div>
            )}
            {patient.national_id_number && (
              <div>
                <span className='text-sm font-medium text-gray-700'>
                  National ID
                </span>
                <p className='text-sm text-gray-900 mt-1'>
                  {patient.national_id_number}
                </p>
              </div>
            )}
            {patient_encounter.reason && (
              <div>
                <span className='text-sm font-medium text-gray-700'>
                  Reason for Visit
                </span>
                <p className='text-sm text-gray-900 mt-1'>
                  {capitalize(patient_encounter.reason)}
                </p>
              </div>
            )}
            {patient_encounter.notes && (
              <div>
                <span className='text-sm font-medium text-gray-700'>Notes</span>
                <p className='text-sm text-gray-900 mt-1'>{patient_encounter.notes}</p>
              </div>
            )}
          </div>
        </div>
      ),
      children: (
        <div className='p-6 max-w-4xl'>
          <div className='mb-6'>
            <h2 className='text-2xl font-semibold mb-2'>
              Immediate Triage Request
            </h2>
            <p className='text-gray-600'>
              A health worker has requested immediate triage for this patient.
            </p>
          </div>

          <div className='mb-6'>
            <h3 className='text-lg font-semibold mb-4'>Patient Summary</h3>
            <div className='bg-white shadow rounded-lg p-6'>
              <div className='flex items-center'>
                {patient.avatar_url && (
                  <img
                    src={patient.avatar_url}
                    alt={patient.name || 'Patient'}
                    className='w-16 h-16 rounded-full mr-4'
                  />
                )}
                <div>
                  <h4 className='text-xl font-semibold'>
                    {patient.name || '[Unnamed Patient]'}
                  </h4>
                  <p className='text-gray-600'>{patient.description}</p>
                </div>
              </div>
            </div>
          </div>

          {present_with_patient.length > 0 && (
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
              <h3 className='text-lg font-semibold mb-3 text-blue-900'>
                Already Responding
              </h3>
              <p className='text-sm text-blue-700 mb-3'>
                The following health workers are currently with this patient:
              </p>
              <div className='space-y-2'>
                {present_with_patient.map((employee) => (
                  <div
                    key={employee.patient_encounter_employee_id}
                    className='flex items-center bg-white rounded px-3 py-2'
                  >
                    <Person
                      person={{
                        ...employee,
                        ...employeeDisplay(employee),
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {present_with_patient.length === 0 && (
            <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6'>
              <h3 className='text-lg font-semibold mb-2 text-yellow-900'>
                No One Responding Yet
              </h3>
              <p className='text-sm text-yellow-700'>
                No health workers are currently responding to this request.
              </p>
            </div>
          )}

          <div className='flex gap-4'>
            <Form
              method='POST'
              action={`/app/organizations/${organization.id}/patients/${patient_id}/open_encounter/start-workflow`}
            >
              <Button
                type='submit'
                variant='primary'
                name='workflow'
                value='triage'
                className='px-6 py-3'
              >
                Start Triage
              </Button>
            </Form>
            <a
              href={`/app/organizations/${organization.id}/waiting_room`}
              className='inline-flex justify-center rounded-md bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
            >
              Back to Waiting Room
            </a>
          </div>
        </div>
      ),
    }
  },
)
