import { FreshContext } from '$fresh/server.ts'
import { z } from 'zod'
import * as events from '../../../../db/models/events.ts'
import { LoggedInHealthWorker } from '../../../../types.ts'
import redirect from '../../../../util/redirect.ts'
import * as messages from '../../../../db/models/messages.ts'
import {
  EmployedHealthWorker,
  LoggedInHealthWorkerHandlerWithProps,
} from '../../../../types.ts'
import ThreadList from '../../../../islands/messages/ThreadList.tsx'
import Form from '../../../../components/library/Form.tsx'
import { parseRequest } from '../../../../util/parseForm.ts'
import { HealthWorkerHomePageLayout } from '../../_middleware.tsx'
import { getRequiredUUIDParam } from '../../../../util/getParam.ts'

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
    const { healthWorker } = ctx.state
    const message_thread_id = getRequiredUUIDParam(ctx, 'message_thread_id')

    const form_values = await parseRequest(
      ctx.state.trx,
      req,
      MessageSchema.parse,
    )

    const message = await messages.send(ctx.state.trx, {
      thread_id: message_thread_id,
      body: form_values.message,
      sender: {
        health_worker_id: healthWorker.id,
      },
    })

    await events.insert(ctx.state.trx, {
      type: 'HealthWorkerMessageSent',
      data: { message_id: message.id },
    })

    return redirect('/app/messaging')
  },
}

export default HealthWorkerHomePageLayout(
  'Messaging',
  async function MessagingPage(
    _req: Request,
    ctx: FreshContext<LoggedInHealthWorker>,
  ) {
    const threads = await messages.getAllThreadsForHealthWorker(
      ctx.state.trx,
      ctx.state.healthWorker.id,
    )

    return (
      <div>
        <ThreadList threads={threads} />
        <Form method='POST' className='mt-5'>
          <label className='block' for='message'>Testing: Post a message</label>
          <textarea
            className='border p-2'
            placeholder='Type your message here'
            name='message'
            id='message'
          />
          <button
            className='bg-blue-500 text-white p-2 rounded-md'
            type='submit'
          >
            Send
          </button>
        </Form>
      </div>
    )
  },
)
