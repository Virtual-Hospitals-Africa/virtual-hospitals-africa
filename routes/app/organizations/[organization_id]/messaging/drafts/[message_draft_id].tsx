import { z, ZodObject, ZodTypeAny } from 'zod'
import { RenderedMessageDraft } from '../../../../../../types.ts'
import { message_drafts } from '../../../../../../db/models/message_drafts.ts'
import { message_targets } from '../../../../../../db/models/message_targets.ts'
import { getRequiredUUIDParam } from '../../../../../../util/getParam.ts'
import { postHandler } from '../../../../../../backend/postHandler.ts'
import MessageDraft from '../../../../../../components/messaging/Draft.tsx'
import { HealthWorkerHomePage } from '../../../../_middleware.tsx'
import { MessageTargetType } from '../../../../../../db.d.ts'
import { parseRequest } from '../../../../../../backend/parseForm.ts'
import { OrganizationContext } from '../../_middleware.ts'

const MessageTargetSchema = z.record(z.string(), z.literal(true)).transform(
  (value) => Object.keys(value),
).optional()

const MessageDraftSchema = z.object({
  body: z.string(),
  priority: z.enum([
    'Non-urgent',
    'Urgent',
    'Very urgent',
    'Emergency',
  ]),
  action: z.enum([
    'save_draft',
    'send_message',
  ]),
  targets: z.object({
    organization: MessageTargetSchema,
    employee: MessageTargetSchema,
    role: MessageTargetSchema,
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

const PartialMessageDraftSchema = MessageDraftSchema.partial()

export const handler = postHandler(
  MessageDraftSchema,
  async (ctx: OrganizationContext, form_values) => {
    const message_draft_id = getRequiredUUIDParam(ctx, 'message_draft_id')

    if (form_values.action === 'save_draft') {
      await message_drafts.save(
        ctx.state.trx,
        {
          ...form_values,
          message_draft_id,
          employment_id: ctx.state.organization_employment.employment_id,
        },
      )
    }

    return new Response('Draft submitted (not yet implemented)', {
      status: 200,
    })
  },
)

async function draftFromFormValues(
  ctx: OrganizationContext,
): Promise<RenderedMessageDraft> {
  const form_values = await parseRequest(
    ctx.req,
    PartialMessageDraftSchema.parse,
  )
  console.log({ form_values })
  const targets = await message_targets.getMany(
    ctx.state.trx,
    form_values.targets ?? {},
  )
  return {
    id: getRequiredUUIDParam(ctx, 'message_draft_id'),
    employment_id: ctx.state.organization_employment.employment_id,
    body: form_values.body ?? '',
    priority: form_values.priority ?? 'Non-urgent',
    targets,
    created_at: new Date(),
    updated_at: new Date(),
  }
}

export default HealthWorkerHomePage(
  'Draft Message',
  async function DraftPage(
    ctx: OrganizationContext,
  ) {
    const message_draft_id = getRequiredUUIDParam(ctx, 'message_draft_id')

    // Try to load existing draft
    const draft = (await message_drafts.findById(ctx.state.trx, {
      draft_id: message_draft_id,
    })) || (
      await draftFromFormValues(ctx)
    )

    console.log({ draft })

    return <MessageDraft draft={draft} />
  },
)
