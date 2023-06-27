import { assert } from 'std/testing/asserts.ts'
import { PageProps } from '$fresh/server.ts'
import { LoggedInHealthWorkerHandler } from '../../types.ts'
import HealthWorkerTable from '../../components/health_worker/Table.tsx'
import * as health_workers from '../../db/models/health_workers.ts'

export const handler: LoggedInHealthWorkerHandler<
  { isAdmin: boolean }
> = {
  async GET(_req, ctx) {
    const healthWorker = ctx.state.session.data
    assert(
      health_workers.isHealthWorkerWithGoogleTokens(healthWorker),
      'Invalid health worker',
    )
    const isAdmin = await health_workers.isAdmin(
      ctx.state.trx,
      { id: healthWorker.id },
    )
    return ctx.render({ isAdmin })
  },
}

export default function Table(
  props: PageProps<
    { isAdmin: boolean }
  >,
) {
  console.log('props.data', props.data)

  return (
    <HealthWorkerTable
      isAdmin={props.data.isAdmin}
      employees={[
        {
          name: 'jon doe',
          profession: 'nurse',
          email: '123@gmail.com',
          facility: 'clinicA',
        },
        {
          name: 'bob smith',
          profession: 'doctor',
          email: 'bob@gmail.com',
          facility: 'clinicB',
        },
      ]}
    />
  )
}
