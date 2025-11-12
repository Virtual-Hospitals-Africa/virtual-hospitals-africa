import { z, ZodObject, ZodTypeAny } from 'zod'
import { LoggedInHealthWorkerContext } from '../../../../types.ts'
import * as message_drafts from '../../../../db/models/message_drafts.ts'
import { getRequiredUUIDParam } from '../../../../util/getParam.ts'
import { postHandler } from '../../../../util/postHandler.ts'
import MessageDraft from '../../../../components/messaging/Draft.tsx'
import { HealthWorkerHomePageLayout } from '../../_middleware.tsx'
import { MessageTargetType } from '../../../../db.d.ts'

const MessageTargetSchema = z.record(z.string(), z.literal(true)).optional()

const MessageDraftSchema = z.object({
  body: z.string(),
  priority: z.enum([
    'Non-urgent',
    'Urgent',
    'Very urgent',
    'Emergency',
  ]),
  targets: z.object({
    organization: MessageTargetSchema,
    employee: MessageTargetSchema,
    profession: MessageTargetSchema,
    organization_category: MessageTargetSchema,
    locality: MessageTargetSchema,
    administrative_area_level_1: MessageTargetSchema,
    administrative_area_level_2: MessageTargetSchema,
  }) satisfies ZodObject<
    {
      [t in MessageTargetType]: ZodTypeAny
    }
  >,
})

export const handler = postHandler(
  MessageDraftSchema,
  (ctx: LoggedInHealthWorkerContext, form_values) => {
    const message_draft_id = getRequiredUUIDParam(ctx, 'message_draft_id')

    // TODO: Actually send the message when ready
    console.log('Draft submitted:', { message_draft_id, form_values })

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
    const message_draft_id = getRequiredUUIDParam(ctx, 'message_draft_id')

    // Try to load existing draft
    const draft = await message_drafts.findById(ctx.state.trx, {
      draft_id: message_draft_id,
    })

    return <MessageDraft draft={draft || undefined} />
  },
)
