import { MessagePriority, MessageTargetType } from '../../db.d.ts'
import {
  RenderedMessageDraft,
  RenderedMessageTarget,
  TrxOrDb,
} from '../../types.ts'
import { pMap } from '../../util/inParallel.ts'
import { jsonArrayFrom } from '../helpers.ts'
import { QueryResult } from './_base.ts'
import { getTarget } from './message_targets.ts'

export type MessageDraftTarget = {
  target_type: MessageTargetType
  target_uuid?: string
  target_value?: unknown
}

export type MessageDraftInsert = {
  employment_id: string
  body: string
  priority: MessagePriority
  targets?: MessageDraftTarget[]
}

export type MessageDraftUpdate = {
  body?: string
  priority?: MessagePriority
}

function baseQuery(trx: TrxOrDb) {
  return trx
    .selectFrom('message_drafts')
    .select((eb) => [
      'message_drafts.id',
      'message_drafts.employment_id',
      'message_drafts.body',
      'message_drafts.priority',
      'message_drafts.created_at',
      'message_drafts.updated_at',
      jsonArrayFrom(
        eb.selectFrom('message_draft_targets')
          .whereRef(
            'message_draft_targets.message_draft_id',
            '=',
            'message_drafts.id',
          )
          .select([
            'message_draft_targets.id',
            'message_draft_targets.target_type',
            'message_draft_targets.target_uuid',
            'message_draft_targets.target_value',
          ]),
      ).as('targets'),
    ])
}

type IntermediateDraftResult = QueryResult<typeof baseQuery>
type IntermediateTargetResult = IntermediateDraftResult['targets'][number]

export async function findById(
  trx: TrxOrDb,
  { draft_id }: { draft_id: string },
): Promise<undefined | RenderedMessageDraft> {
  const draft = await baseQuery(trx)
    .where('message_drafts.id', '=', draft_id)
    .executeTakeFirst()
  if (!draft) return

  const targets: RenderedMessageTarget[] = await pMap(
    draft.targets,
    (t) => getTarget(trx, t),
  )

  return {
    ...draft,
    targets,
  }
}

export async function create(
  trx: TrxOrDb,
  insert: MessageDraftInsert,
) {
  const { targets, ...draft_data } = insert

  const draft = await trx
    .insertInto('message_drafts')
    .values(draft_data)
    .returningAll()
    .executeTakeFirstOrThrow()

  if (targets?.length) {
    await trx
      .insertInto('message_draft_targets')
      .values(
        targets.map((target) => ({
          message_draft_id: draft.id,
          target_type: target.target_type,
          target_uuid: target.target_uuid,
          target_value: target.target_value
            ? JSON.stringify(target.target_value)
            : undefined,
        })),
      )
      .execute()
  }

  return findById(trx, { draft_id: draft.id })
}

export async function update(
  trx: TrxOrDb,
  { draft_id, ...update_data }: { draft_id: string } & MessageDraftUpdate,
) {
  await trx
    .updateTable('message_drafts')
    .set(update_data)
    .where('id', '=', draft_id)
    .execute()

  return findById(trx, { draft_id })
}

export async function updateTargets(
  trx: TrxOrDb,
  { draft_id, targets }: { draft_id: string; targets: MessageDraftTarget[] },
) {
  // Delete existing targets
  await trx
    .deleteFrom('message_draft_targets')
    .where('message_draft_id', '=', draft_id)
    .execute()

  // Insert new targets
  if (targets.length) {
    await trx
      .insertInto('message_draft_targets')
      .values(
        targets.map((target) => ({
          message_draft_id: draft_id,
          target_type: target.target_type,
          target_uuid: target.target_uuid,
          target_value: target.target_value
            ? JSON.stringify(target.target_value)
            : undefined,
        })),
      )
      .execute()
  }

  return findById(trx, { draft_id })
}

export function removeById(
  trx: TrxOrDb,
  draft_id: string,
) {
  return trx
    .deleteFrom('message_drafts')
    .where('id', '=', draft_id)
    .execute()
}
