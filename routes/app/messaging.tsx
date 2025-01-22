import { FreshContext } from '$fresh/server.ts'
import { LoggedInHealthWorker } from '../../types.ts'
import * as messages from '../../db/models/messages.ts'
import ThreadList from '../../islands/messages/ThreadList.tsx'
import { HealthWorkerHomePageLayout } from './_middleware.tsx'
import compact from '../../util/compact.ts'

export default HealthWorkerHomePageLayout(
  'Messaging',
  async function MessagingPage(
    _req: Request,
    ctx: FreshContext<LoggedInHealthWorker>,
  ) {
    const employee_ids = ctx.state.healthWorker.employment.flatMap((e) =>
      compact([
        e.roles.admin?.employment_id,
        e.roles.doctor?.employment_id,
        e.roles.nurse?.employment_id,
      ])
    )

    const threads = !employee_ids.length
      ? []
      : await messages.getThreadsWithMostRecentMessages(
        ctx.state.trx,
        {
          employee_ids,
        },
      )

    return <ThreadList threads={threads} />
  },
)
