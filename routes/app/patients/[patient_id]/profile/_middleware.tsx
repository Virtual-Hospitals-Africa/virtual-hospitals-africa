import { JSX } from 'preact'
import Layout from '../../../../../components/library/Layout.tsx'
import { Person } from '../../../../../components/library/Person.tsx'
import { Tabs } from '../../../../../components/library/Tabs.tsx'
import { replaceParams } from '../../../../../util/replaceParams.ts'
import { PatientContext } from '../_middleware.tsx'
import type { FreshContext } from '$fresh/server.ts'
import { assertOrRedirect } from '../../../../../util/assertOr.ts'
import { Button } from '../../../../../components/library/Button.tsx'
import { PatientDrawer } from '../../../../../islands/patient-drawer/Drawer.tsx'

export type PatientPageProps = {
  ctx: PatientContext
}

export function handler(
  _req: Request,
  ctx: FreshContext,
) {
  return ctx.next()
}

export function PatientPage(
  render: (props: PatientPageProps) => JSX.Element | Promise<JSX.Element>,
) {
  return async function (
    _req: Request,
    ctx: PatientContext,
  ) {
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
    ]

    const rendered = await render({
      ctx,
    })
    return (
      <Layout
        title='Patient Profile'
        route={ctx.route}
        url={ctx.url}
        health_worker={ctx.state.healthWorker}
        variant='practitioner home page'
        // Show a patient drawer if I am a provider for an open encounter for this patient
        drawer={ctx.state.patient.open_encounter?.providers.some((p) =>
          p.health_worker_id === ctx.state.healthWorker.id
        ) && (
          <PatientDrawer
            patient={ctx.state.patient}
            encounter={ctx.state.patient.open_encounter}
            findings={[]}
            sendables={[]}
            measurements={[]}
          />
        )}
      >
        <div className='container my-4 mx-6'>
          <Person person={ctx.state.patient} />

          <div className='mt-4'>
            {'Nearest Clinic: ' + ctx.state.patient.nearest_organization}
            <br />
            {`Primary Provider: Dr. ` +
              (ctx.state.patient.open_encounter &&
                ctx.state.patient.open_encounter.providers[0]
                  .health_worker_name)}
          </div>
          <Tabs
            tabs={tabs.map((tab) => ({
              tab,
              href: replaceParams('/app/patients/:patient_id/profile/:tab', {
                ...ctx.params,
                tab,
              }),
              active: ctx.url.pathname.endsWith('/' + tab),
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
      </Layout>
    )
  }
}
