import { z } from 'zod'
import JustLogoLayout from '../../components/library/JustLogoLayout.tsx'
import { Button } from '../../components/library/Button.tsx'
import Form from '../../components/library/Form.tsx'
import PageHeader from '../../components/library/typography/PageHeader.tsx'
import { postHandler } from '../../backend/postHandler.ts'
import redirect from '../../util/redirect.ts'
import { employment } from '../../db/models/employment.ts'
import { health_worker_licences } from '../../db/models/health_worker_licences.ts'
import { SERVER_COUNTRY } from '../../db/models/countries.ts'
import { organizationDepartmentIdsOfProfession } from '../../shared/departments.ts'

import { organizations_with_departments } from '../../db/models/organizations_with_departments.ts'
import { createTestOrganization } from '../../test/_helpers/organizations.ts'
import { addTestEmployee } from '../../mocks/testEmployee.ts'
import { insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest } from '../../test/_helpers/workflows.ts'
import { assert } from 'std/assert/assert.ts'
import { TestingTriageOnboardingContext } from './_middleware.tsx'
import { sessions } from '../../db/models/sessions.ts'
import { setCookie } from 'std/http/cookie.ts'
import { session_key } from '../../shared/session_cookie.ts'
import range from '../../util/range.ts'
import { pMap } from '../../util/inParallel.ts'
import { promiseProps } from '../../util/promiseProps.ts'

export const handler = postHandler(
  z.object({}),
  async (ctx: TestingTriageOnboardingContext) => {
    const { trx } = ctx.state
    const organization = await createTestOrganization(trx)

    const { response } = await promiseProps({
      response: adSelfAsTriageNurse(),
      adding_receptionist_and_patients: addReceptionistAndPatients(),
      adding_primary_care_nurse: addTestEmployee(trx, {
        role: 'nurse',
        specialty: 'Primary care',
        organization_id: organization.id,
      }).then((primary_care_nurse) =>
        trx.insertInto('employment_presence')
          .values({
            id: primary_care_nurse.employee_id,
            at_work: true,
          }).execute()
      ),
    })
    return response

    async function addReceptionistAndPatients() {
      const receptionist = await addTestEmployee(trx, {
        role: 'receptionist',
        organization_id: organization.id,
      })

      await pMap(range(3), () =>
        insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
          trx,
          organization.id,
          {
            employment_id: receptionist.employee_id,
            patient_demographics: {
              date_of_birth: '1990-01-01',
            },
            is_tutorial: true,
          },
        ))
    }

    async function adSelfAsTriageNurse() {
      const full_organization = await organizations_with_departments.getById(trx, organization.id)
      const department_ids = organizationDepartmentIdsOfProfession(full_organization, 'nurse', 'Triage')

      const health_worker = await addTestEmployee(trx, {
        specialty: 'Triage',
        organization_id: organization.id,
      })
      const session_id = await sessions.insertOne(trx, {
        entity_type: 'health_worker',
        entity_id: health_worker.id,
      })

      const result = await employment.addOne(trx, {
        department_ids,
        organization_id: organization.id,
        role: 'nurse',
        health_worker_id: health_worker.id,
        is_admin: false,
      })
      assert(result.id)

      await Promise.all([
        health_worker_licences.insertTest(trx, {
          health_worker_id: result.health_worker_id,
          country: SERVER_COUNTRY,
          role: 'nurse',
          specialty: 'Triage',
        }),
        trx.insertInto('employment_presence')
          .values({
            id: result.id,
            at_work: true,
          }).execute(),
      ])

      const response = redirect(`/app/organizations/${organization.id}/waiting_room`)

      setCookie(response.headers, {
        name: session_key,
        value: session_id,
      })
      setCookie(response.headers, {
        name: 'health_worker_id',
        value: health_worker.id,
      })

      return response
    }
  },
)

export default function TestingTriageOnboardingPage(
  ctx: TestingTriageOnboardingContext,
) {
  return (
    <JustLogoLayout url={ctx.url} title='Virtual Hospitals Africa'>
      <div className='py-12 overflow-hidden bg-white'>
        <div className='px-6 mx-auto max-w-7xl lg:flex lg:px-8'>
          <div className='grid max-w-2xl grid-cols-1 mx-auto gap-x-12 gap-y-16 lg:mx-0 lg:min-w-full lg:max-w-none lg:flex-none lg:gap-y-8'>
            <div className='lg:col-end-1 lg:w-full lg:max-w-lg lg:pb-8'>
              <PageHeader className='h1'>Welcome to VHA Triage!</PageHeader>
              <p className='mt-6 text-xl leading-8 text-gray-600'>
                We'll set up a test clinic for you with three patients already in the waiting room — ready for triage.
              </p>
              <Form method='POST' className='mt-10'>
                <div className='flex'>
                  <Button type='submit'>
                    Set up my triage demo<span aria-hidden='true'>&nbsp;&nbsp;&rarr;</span>
                  </Button>
                </div>
              </Form>
            </div>
            <div className='flex flex-wrap items-start justify-end gap-6 sm:gap-8 lg:contents'>
              <div className='flex-auto w-0 lg:ml-auto lg:w-auto lg:flex-none lg:self-end'>
                <img
                  src='/doctor-holding-phone.png'
                  alt='Welcome'
                  className='aspect-7/5 w-148 max-w-none rounded-2xl bg-gray-50 object-cover'
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </JustLogoLayout>
  )
}
