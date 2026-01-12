import { InsertObject } from 'kysely'
import { DB, MessagePriority } from '../../db.d.ts'
import { BY_TARGET_UUID } from '../../shared/message_targets.ts'
import { RenderedMessageDraft, RenderedMessageTarget, TrxOrDb } from '../../types.ts'
import entries from '../../util/entries.ts'
import { pMap } from '../../util/inParallel.ts'
import { blankSelection, jsonArrayFrom, success_true } from '../helpers.ts'
import { QueryResult } from './_base.ts'
import { message_targets } from './message_targets.ts'

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

export const message_drafts = {
  async findById(
    trx: TrxOrDb,
    { draft_id }: { draft_id: string },
  ): Promise<undefined | RenderedMessageDraft> {
    const draft = await baseQuery(trx)
      .where('message_drafts.id', '=', draft_id)
      .executeTakeFirst()

    if (!draft) return

    const targets: RenderedMessageTarget[] = await pMap(
      draft.targets,
      (t) => message_targets.getTarget(trx, t),
    )

    return {
      ...draft,
      targets,
    }
  },
  removeById(
    trx: TrxOrDb,
    draft_id: string,
  ) {
    return trx
      .deleteFrom('message_drafts')
      .where('id', '=', draft_id)
      .execute()
  },
  save(
    trx: TrxOrDb,
    {
      message_draft_id,
      targets = {},
      ...updates
    }: {
      message_draft_id: string
      body: string
      priority: MessagePriority
      targets?: {
        organization?: string[]
        employee?: string[]
        profession?: string[]
        organization_category?: string[]
        locality?: string[]
        administrative_area_level_1?: string[]
        administrative_area_level_2?: string[]
      }
      employment_id: string
    },
  ): Promise<{ success: true }> {
    const draft_targets: InsertObject<DB, 'message_draft_targets'>[] = entries(
      targets,
    )
      .flatMap(([target_type, target_strings = []]) => {
        const by_uuid = BY_TARGET_UUID.has(target_type)
        return target_strings.map((target_string) => ({
          message_draft_id,
          target_type,
          target_uuid: by_uuid ? target_string : null,
          target_value: by_uuid ? null : target_string,
        }))
      })

    return trx.with('inserting_draft', (qb) =>
      qb.insertInto('message_drafts')
        .values({
          id: message_draft_id,
          ...updates,
        })
        .onConflict((oc) => oc.column('id').doUpdateSet(updates)))
      .with(
        'removing_existing_targets',
        (qb) =>
          qb.deleteFrom('message_draft_targets')
            .where('message_draft_id', '=', message_draft_id),
      ).with(
        'inserting_new_targets',
        (qb) => draft_targets.length ? qb.insertInto('message_draft_targets').values(draft_targets) : blankSelection(qb),
      )
      .selectNoFrom([
        success_true,
      ])
      .executeTakeFirstOrThrow()
  },
}
