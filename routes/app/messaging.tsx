import { FreshContext } from '$fresh/server.ts'
import { LoggedInHealthWorker } from '../../types.ts'
import * as messages from '../../db/models/messages.ts'
import ThreadList from '../../islands/messages/ThreadList.tsx'
import { HealthWorkerHomePageLayout } from './_middleware.tsx'

export default HealthWorkerHomePageLayout(
  'Messaging',
  async function MessagingPage(
    _req: Request,
    ctx: FreshContext<LoggedInHealthWorker>,
  ) {
    const threads = await messages.getThreadsWithMostRecentMessages(
      ctx.state.trx,
      messages.participantsQueryForHealthWorker(ctx.state.healthWorker),
    )
    return <ThreadList threads={threads} />
  },
)
