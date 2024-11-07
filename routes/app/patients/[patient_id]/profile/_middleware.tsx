import { JSX } from 'preact'
import Layout from '../../../../../components/library/Layout.tsx'
import { Person } from '../../../../../components/library/Person.tsx'
import { Tabs } from '../../../../../components/library/Tabs.tsx'
import { replaceParams } from '../../../../../util/replaceParams.ts'
import { PatientContext } from '../_middleware.tsx'
import type { FreshContext } from '$fresh/server.ts'
import { assertOrRedirect } from '../../../../../util/assertOr.ts'
import { Button } from '../../../../../components/library/Button.tsx'

type PatientPageProps = {
  who: 'knows'
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
      who: 'knows',
    })

    return (
      <Layout
        title='Patient Profile'
        route={ctx.route}
        url={ctx.url}
        health_worker={ctx.state.healthWorker}
        variant='practitioner home page'
      >
        <div className='container my-4 mx-6'>
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
          <Person person={ctx.state.patient} />

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
      </Layout>
    )
  }
}
