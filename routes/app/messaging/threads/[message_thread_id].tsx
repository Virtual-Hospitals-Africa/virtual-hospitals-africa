import { z } from 'zod'
import { LoggedInHealthWorkerContext } from '../../../../types.ts'
import * as messages from '../../../../db/models/messages.ts'
import * as message_threads from '../../../../db/models/message_threads.ts'
import * as message_thread_participants from '../../../../db/models/message_thread_participants.ts'
import { HealthWorkerHomePageLayout } from '../../_middleware.tsx'
import { getRequiredUUIDParam } from '../../../../util/getParam.ts'
import { ChatThread } from '../../../../islands/messages/ChatThread.tsx'
import { postHandler } from '../../../../util/postHandler.ts'
import { assert } from 'std/assert/assert.ts'

const MessageSchema = z.object({
  message: z.string(),
})

export const handler = postHandler(
  MessageSchema,
  async (ctx: LoggedInHealthWorkerContext, form_values) => {
    const thread_id = getRequiredUUIDParam(ctx, 'message_thread_id')
    const employee_ids = ctx.state.health_worker.organizations.flatMap((e) =>
      e.roles.map((role) => role.employment_id)
    )

    assert(employee_ids.length, 'Must complete onboarding first')

    const message = await messages.send(ctx.state.trx, {
      thread_id,
      body: form_values.message,
      sender_participant_id: message_thread_participants.distinctIds(
        ctx.state.trx,
        { thread_id, employee_ids },
      ),
    })

    console.log('message', message)
    return new Response('Message Created', {
      status: 201,
    })
  },
)

export default HealthWorkerHomePageLayout(
  'Messaging',
  async function MessagingPage(
    ctx: LoggedInHealthWorkerContext,
  ) {
    const thread_id = getRequiredUUIDParam(ctx, 'message_thread_id')
    const thread = await message_threads.getOneForHealthWorker(
      ctx.state.trx,
      ctx.state.health_worker,
      thread_id,
    )

    return <ChatThread thread={thread} />
  },
)
