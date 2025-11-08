import { z } from 'zod'
import { LoggedInHealthWorkerContext } from '../../../../types.ts'
import * as messages from '../../../../db/models/messages.ts'
import { parseRequest } from '../../../../util/parseForm.ts'
import { HealthWorkerHomePageLayout } from '../../_middleware.tsx'
import { getRequiredUUIDParam } from '../../../../util/getParam.ts'
import { ChatThread } from '../../../../islands/messages/ChatThread.tsx'

const MessageSchema = z.object({
  message: z.string(),
})

export const handler = {
  async POST(ctx: LoggedInHealthWorkerContext) {
    const req = ctx.req
    const message_thread_id = getRequiredUUIDParam(ctx, 'message_thread_id')

    const form_values = await parseRequest(
      ctx.state.trx,
      req,
      MessageSchema.parse,
    )

    const message = await messages.send(ctx.state.trx, {
      thread_id: message_thread_id,
      body: form_values.message,
      sender: messages.participantsQueryForHealthWorker(
        ctx.state.health_worker,
      ),
    })

    console.log('message', message)
    return new Response('Message Created', {
      status: 201,
    })
  },
}

export default HealthWorkerHomePageLayout(
  'Messaging',
  async function MessagingPage(
    ctx: LoggedInHealthWorkerContext,
  ) {
    const thread_id = getRequiredUUIDParam(ctx, 'message_thread_id')
    const thread = await messages.getThread(
      ctx.state.trx,
      messages.participantsQueryForHealthWorker(ctx.state.health_worker),
      thread_id,
    )

    return <ChatThread thread={thread} />
  },
)
