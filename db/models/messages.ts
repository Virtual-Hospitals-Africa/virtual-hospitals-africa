import { IdSelection, TrxOrDb } from '../../types.ts'
import { jsonArrayFrom } from '../helpers.ts'
import { events } from './events.ts'
import { base, QueryResult } from './_base.ts'
import isString from '../../util/isString.ts'

function baseQuery(
  trx: TrxOrDb,
) {
  return trx
    .selectFrom('messages')
    .orderBy('messages.created_at', 'desc')
    .selectAll('messages')
    .select((eb) =>
      jsonArrayFrom(
        eb.selectFrom('message_reads')
          .whereRef('message_reads.message_id', '=', 'messages.id')
          .select([
            'message_reads.participant_id',
            'message_reads.created_at as read_at',
          ]),
      ).as('reads')
    )
}

export type IntermediateMessage = QueryResult<typeof baseQuery>

export const messages = base({
  top_level_table: 'messages' as const,
  baseQuery,
  formatResult: (x: IntermediateMessage): IntermediateMessage => x,
  handleSearch(
    qb,
    opts: { thread_id?: string | string[] | IdSelection },
  ) {
    if (opts.thread_id) {
      qb = qb.where(
        'messages.thread_id',
        isString(opts.thread_id) ? '=' : 'in',
        opts.thread_id,
      )
    }
    return qb
  },
  async send(
    trx: TrxOrDb,
    { thread_id, sender_participant_id, body }: {
      thread_id: string
      body: string
      sender_participant_id: string | IdSelection
    },
  ) {
    const message = await trx.insertInto('messages')
      .values({
        thread_id,
        body,
        sender_participant_id,
      })
      .returningAll()
      .executeTakeFirstOrThrow()

    await events.insert(trx, {
      type: 'MessageSend',
      data: {
        message_id: message.id,
      },
    })
    return message
  },
  sendFromSystem(
    trx: TrxOrDb,
    values: {
      thread_id: string
      body: string
      created_at?: Date
    },
  ) {
    return trx.insertInto('messages')
      .values({
        ...values,
        is_from_system: true,
      })
      .returningAll()
      .executeTakeFirstOrThrow()
  },
})
