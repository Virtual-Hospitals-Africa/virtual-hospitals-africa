import { LoggedInHealthWorkerContext } from '../../types.ts'
import * as messages from '../../db/models/messages.ts'
import ThreadList from '../../islands/messages/ThreadList.tsx'
import { HealthWorkerHomePageLayout } from './_middleware.tsx'

export default HealthWorkerHomePageLayout(
  'Messaging',
  async function MessagingPage(
    ctx: LoggedInHealthWorkerContext,
  ) {
    const threads = await messages.getThreadsWithMostRecentMessages(
      ctx.state.trx,
      messages.participantsQueryForHealthWorker(ctx.state.health_worker),
    )
    return <ThreadList threads={threads} />
  },
)
