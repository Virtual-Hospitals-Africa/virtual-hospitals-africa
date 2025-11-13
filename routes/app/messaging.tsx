import { LoggedInHealthWorkerContext } from '../../types.ts'
import * as message_threads from '../../db/models/message_threads.ts'
import ThreadList from '../../islands/messages/ThreadList.tsx'
import { HealthWorkerHomePageLayout } from './_middleware.tsx'

export default HealthWorkerHomePageLayout(
  'Messaging',
  async function MessagingPage(
    ctx: LoggedInHealthWorkerContext,
  ) {
    const threads = await message_threads.getForHealthWorker(
      ctx.state.trx,
      ctx.state.health_worker,
    )
    return <ThreadList threads={threads} />
  },
)
