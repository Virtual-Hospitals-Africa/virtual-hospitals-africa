import { FreshContext } from '$fresh/server.ts'
import { z } from 'zod'
import { LoggedInHealthWorker } from '../../../../types.ts'
import * as messages from '../../../../db/models/messages.ts'
import {
  EmployedHealthWorker,
  LoggedInHealthWorkerHandlerWithProps,
} from '../../../../types.ts'
import { parseRequest } from '../../../../util/parseForm.ts'
import { HealthWorkerHomePageLayout } from '../../_middleware.tsx'
import { getRequiredUUIDParam } from '../../../../util/getParam.ts'
import { ChatThread } from '../../../../islands/messages/ChatThread.tsx'

type MessagingProps = {
  healthWorker: EmployedHealthWorker
}

const MessageSchema = z.object({
  message: z.string(),
})

export const handler: LoggedInHealthWorkerHandlerWithProps<
  MessagingProps
> = {
  async POST(req, ctx) {
    const message_thread_id = getRequiredUUIDParam(ctx, 'message_thread_id')

    const form_values = await parseRequest(
      ctx.state.trx,
      req,
      MessageSchema.parse,
    )

    const message = await messages.send(ctx.state.trx, {
      thread_id: message_thread_id,
      body: form_values.message,
      sender: messages.participantsQueryForHealthWorker(ctx.state.healthWorker),
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
    _req: Request,
    ctx: FreshContext<LoggedInHealthWorker>,
  ) {
    const thread_id = getRequiredUUIDParam(ctx, 'message_thread_id')
    const thread = await messages.getThread(
      ctx.state.trx,
      messages.participantsQueryForHealthWorker(ctx.state.healthWorker),
      thread_id,
    )

    return <ChatThread thread={thread} />
  },
)
