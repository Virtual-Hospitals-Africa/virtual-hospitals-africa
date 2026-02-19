import { JSX } from 'preact'
import { appointments } from '../../../../../../../db/models/appointments.ts'
import { patients } from '../../../../../../../db/models/patients.ts'
import { patient_primary_doctor } from '../../../../../../../db/models/patient_primary_doctor.ts'
import { patient_nearest_organization } from '../../../../../../../db/models/patient_nearest_organization.ts'
import { patient_encounters } from '../../../../../../../db/models/patient_encounters.ts'
import { Person } from '../../../../../../../components/library/Person.tsx'
import { Tabs } from '../../../../../../../components/library/Tabs.tsx'
import { replaceParams } from '../../../../../../../util/replaceParams.ts'
import { assertOr405 } from '../../../../../../../util/assertOr.ts'
import { HealthWorkerHomePage } from '../../../../../_middleware.tsx'
import { promiseProps } from '../../../../../../../util/promiseProps.ts'
import { OrganizationContext } from '../../../_middleware.ts'
import { getRequiredUUIDParam } from '../../../../../../../util/getParam.ts'
import { waiting_room } from '../../../../../../../db/models/waiting_room.ts'
import { RenderedPatient } from '../../../../../../../types.ts'
import { ActionButton } from '../../../../../../../components/library/ActionButton.tsx'
import { assert } from 'std/assert/assert.ts'
import { hasName } from '../../../../../../../util/haveNames.ts'
import { employeeDisplay } from '../../../../../../../util/healthWorkerDisplay.ts'

export type PatientProfileState = {
  patient: RenderedPatient & {
    completed_registration: true
  }
}

export type PatientProfileContext = OrganizationContext & {
  state: PatientProfileState
}

export function handler(
  ctx: OrganizationContext,
) {
  return ctx.next()
}

export const PatientProfilePage = (
  title: string,
  render: (
    ctx: PatientProfileContext,
  ) => JSX.Element | Promise<JSX.Element>,
) =>
  HealthWorkerHomePage<PatientProfileContext>(
    title,
    async function PatientContents(ctx) {
      const patient_id = getRequiredUUIDParam(ctx, 'patient_id')
      const { trx, organization_employment } = ctx.state

      const {
        patient,
        upcoming_appointments,
        open_encounter,
        primary_doctor,
        nearest_organization,
      } = await promiseProps({
        patient: patients.getById(trx, patient_id, { include_incomplete_registration: true }),
        upcoming_appointments: appointments.getForPatient(
          trx,
          {
            patient_id,
            time_range: 'future',
          },
        ),
        open_encounter: patient_encounters.getFirstOpen(trx, {
          patient_id,
        }),
        primary_doctor: patient_primary_doctor.get(
          trx,
          {
            patient_id,
          },
        ),
        nearest_organization: patient_nearest_organization.get(
          trx,
          {
            patient_id,
          },
        ),
      })

      assertOr405(
        patient.completed_registration,
        `Patient hasn't completed registration yet`,
      )
      assert(hasName(patient))

      const as_waiting_room = open_encounter ? waiting_room.asWaitingRoom(open_encounter, organization_employment) : null

      const action = as_waiting_room?.actions[0]

      const tabs = [
        'summary',
        'profile',
        'visits',
        'history',
        'appointments',
        'review',
        'orders',
        'patient_information',
      ]

      const drawer = undefined
      const rendered = await render(ctx)

      return {
        drawer,
        children: (
          <>
            <div className='container mx-6 my-4'>
              <Person
                person={{
                  ...patient,
                  description: (
                    <>
                      {patient.description && (
                        <>
                          {patient.description}
                          <br />
                        </>
                      )}

                      {primary_doctor && (
                        <a
                          href={primary_doctor.href}
                          title={`View details of Dr. ${primary_doctor.name}`}
                          className='text-blue-600 hover:underline'
                        >
                          {employeeDisplay(primary_doctor).display_name}
                        </a>
                      )}
                      {nearest_organization && (
                        <a
                          href={`/app/organizations/${nearest_organization.id}`}
                          title={`View details of ${nearest_organization}`}
                          className='text-blue-600 hover:underline'
                        >
                          {nearest_organization.name}
                        </a>
                      )}
                    </>
                  ),
                }}
              />
              <Tabs
                tabs={tabs.map((tab) => ({
                  tab,
                  href: replaceParams(
                    '/app/organizations/:organization_id/patients/:patient_id/profile/:tab',
                    {
                      ...ctx.params,
                      tab,
                    },
                  ),
                  active: ctx.url.pathname.includes('/' + tab),
                  rightIcon: tab === 'appointments' &&
                    upcoming_appointments.length > 0 && (
                    <span className='flex items-center justify-center w-5 h-5 text-xs text-white bg-indigo-600 rounded-md'>
                      {upcoming_appointments.length}
                    </span>
                  ),
                }))}
              />
              {rendered}
            </div>

            {action && (
              <ActionButton
                action={action}
                variant='primary'
              />
            )}
          </>
        ),
      }
    },
  )
