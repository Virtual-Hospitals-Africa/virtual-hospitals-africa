import { JSX } from 'preact'
import * as appointments from '../../../../../db/models/appointments.ts'
import { Person } from '../../../../../components/library/Person.tsx'
import { Tabs } from '../../../../../components/library/Tabs.tsx'
import { replaceParams } from '../../../../../util/replaceParams.ts'
import { PatientContext } from '../_middleware.tsx'
import type { FreshContext } from '$fresh/server.ts'
import { assertOrRedirect } from '../../../../../util/assertOr.ts'
import { Button } from '../../../../../components/library/Button.tsx'
import { HealthWorkerHomePageLayout } from '../../../_middleware.tsx'

export function handler(
  _req: Request,
  ctx: FreshContext,
) {
  return ctx.next()
}

export const PatientPage = (
  title: string,
  render: (
    req: Request,
    ctx: PatientContext,
  ) => JSX.Element | Promise<JSX.Element>,
) =>
  HealthWorkerHomePageLayout<PatientContext>(
    title,
    async function PatientContents(req, ctx) {
      const upcoming_appointments = await appointments.getForPatient(
        ctx.state.trx,
        {
          patient_id: ctx.state.patient.id,
          time_range: 'future',
        },
      )

      assertOrRedirect(
        ctx.state.patient.completed_intake,
        `/app/patients/${ctx.state.patient.id}/intake`,
      )

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

      const rendered = await render(req, ctx)

      return {
        drawer,
        children: (
          <>
            <div className='container my-4 mx-6'>
              <Person
                person={{
                  ...ctx.state.patient,
                  description: (
                    <>
                      {ctx.state.patient.description && (
                        <>
                          {ctx.state.patient.description}
                          <br />
                        </>
                      )}

                      {(ctx.state.patient.nearest_organization ||
                        ctx.state.patient.primary_provider_health_worker_id) &&
                        (
                          <>
                            {ctx.state.patient
                              .primary_provider_health_worker_id &&
                              (
                                <a
                                  href={`/app/organizations/${ctx.state.patient.nearest_organization_id}/employees/${ctx.state.patient.primary_provider_health_worker_id}`}
                                  title={`View details of Dr. ${ctx.state.patient.primary_provider_name}`}
                                  className='hover:underline text-blue-600'
                                >
                                  Dr. {ctx.state.patient.primary_provider_name}
                                </a>
                              )}
                            {ctx.state.patient.nearest_organization &&
                              ctx.state.patient
                                .primary_provider_health_worker_id &&
                              ', '}
                            {ctx.state.patient.nearest_organization && (
                              <a
                                href={`/app/organizations/${ctx.state.patient.nearest_organization_id}`}
                                title={`View details of ${ctx.state.patient.nearest_organization}`}
                                className='hover:underline text-blue-600'
                              >
                                {ctx.state.patient.nearest_organization}
                              </a>
                            )}
                            <br />
                          </>
                        )}
                    </>
                  ),
                }}
              />
              <Tabs
                tabs={tabs.map((tab) => ({
                  tab,
                  href: replaceParams(
                    '/app/patients/:patient_id/profile/:tab',
                    {
                      ...ctx.params,
                      tab,
                    },
                  ),
                  // 'https://localhost:8000/app/patients/04811b0f-6907-41ae-80b1-399d7ba8cbe5/profile/patient_information/general'.endsWith('/patient_information')

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

            {ctx.state.patient.open_encounter && (
              <Button
                href={replaceParams(
                  '/app/patients/:patient_id/encounters/open',
                  ctx.params,
                )}
              >
                Go to open encounter
              </Button>
            )}
          </>
        ),
      }
    },
  )
