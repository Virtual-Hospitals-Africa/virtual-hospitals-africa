import { IdSelection, TrxOrDb } from '../../types.ts'
import { base, QueryResult } from './_base.ts'
import isString from '../../util/isString.ts'

function baseQuery(
  trx: TrxOrDb,
) {
  return trx
    .selectFrom('message_thread_participants')
    .select([
      'message_thread_participants.id as participant_id',
      'message_thread_participants.table_name',
      'message_thread_participants.row_id',
    ])
}

type IntermediateMessageThreadParticipant = QueryResult<typeof baseQuery>

export const message_thread_participants = base({
  top_level_table: 'message_thread_participants' as const,
  baseQuery,
  formatResult: (
    x: IntermediateMessageThreadParticipant,
  ): IntermediateMessageThreadParticipant => x,
  handleSearch(
    qb,
    opts: {
      thread_id?: string | string[] | IdSelection
      employee_ids?: string[]
    },
  ) {
    if (opts.thread_id) {
      qb = qb.where(
        'message_thread_participants.thread_id',
        'in',
        isString(opts.thread_id) ? [opts.thread_id] : opts.thread_id,
      )
    }
    if (opts.employee_ids) {
      qb = qb.where(
        'message_thread_participants.table_name',
        '=',
        'employment',
      ).where(
        'row_id',
        'in',
        opts.employee_ids,
      )
    }
    return qb
  },
})
