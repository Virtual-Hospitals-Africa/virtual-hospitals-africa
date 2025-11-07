import { z } from 'zod'
import { LoggedInHealthWorkerContext } from '../../../../types.ts'
import * as message_drafts from '../../../../db/models/message_drafts.ts'
import { getRequiredUUIDParam } from '../../../../util/getParam.ts'
import { postHandler } from '../../../../util/postHandler.ts'
import Draft from '../../../../components/messaging/Draft.tsx'
import { HealthWorkerHomePageLayout } from '../../../app/_middleware.tsx'

const MessageDraftSchema = z.object({
  body: z.string().default(''),
  priority: z.string().nullable().optional(),
  concerning: z.boolean().default(false),
})

export const handler = postHandler(
  MessageDraftSchema,
  (ctx: LoggedInHealthWorkerContext, form_values) => {
    const message_id = getRequiredUUIDParam(ctx, 'message_id')

    // TODO: Actually send the message when ready
    console.log('Draft submitted:', { message_id, form_values })

    return new Response('Draft submitted (not yet implemented)', {
      status: 200,
    })
  },
)

export default HealthWorkerHomePageLayout(
  'Draft Message',
  async function DraftPage(
    ctx: LoggedInHealthWorkerContext,
  ) {
    const message_id = getRequiredUUIDParam(ctx, 'message_id')

    // Try to load existing draft
    const draft = await message_drafts.findById(ctx.state.trx, {
      draft_id: message_id,
    })

    return <Draft draft={draft || undefined} />
  },
)
