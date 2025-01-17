import { RenderedMessageThread, TrxOrDb } from '../../types.ts'
import { jsonArrayFrom } from '../helpers.ts'

export async function getAllThreadsForHealthWorker(
  trx: TrxOrDb,
  health_worker_id: string,
): Promise<RenderedMessageThread[]> {
  const threads = await trx
    .selectFrom('message_threads')
    .innerJoin(
      'message_thread_participants',
      'message_thread_participants.thread_id',
      'message_threads.id',
    )
    .selectAll('message_threads')
    .select('message_thread_participants.id as participant_id')
    .select((eb) => [
      jsonArrayFrom(
        eb
          .selectFrom('message_thread_participants as other_participants')
          .select([
            'health_worker_id',
            'pharmacist_id',
          ])
          .whereRef(
            'other_participants.thread_id',
            '=',
            'message_threads.id',
          )
          .whereRef(
            'other_participants.health_worker_id',
            '!=',
            'message_thread_participants.health_worker_id',
          ),
      ).as('other_participants'),
    ])
    .where(
      'message_thread_participants.health_worker_id',
      '=',
      health_worker_id,
    )
    .execute()

  return Promise.all(threads.map(async (thread) => {
    const most_recent_message = await trx
      .selectFrom('messages')
      .where('messages.thread_id', '=', thread.id)
      .orderBy('messages.created_at desc')
      .selectAll()
      .executeTakeFirstOrThrow()
    return {
      ...thread,
      most_recent_message,
    }
  }))
}

export async function createThread(
  trx: TrxOrDb,
  { sender, recipient, concerning, initial_message }: {
    sender: {
      health_worker_id?: string
      pharmacist?: string
    }
    recipient: {
      health_worker_id?: string
      pharmacist?: string
    }
    concerning: {
      patient_id: string
    }
    initial_message?: {
      body: string
    }
  },
) {
  const thread = await trx.insertInto('message_threads')
    .values(concerning)
    .returning('id')
    .executeTakeFirstOrThrow()

  const sender_participant = await trx.insertInto('message_thread_participants')
    .values({
      thread_id: thread.id,
      ...sender,
    })
    .returning('id')
    .executeTakeFirstOrThrow()

  const recipient_participant = await trx.insertInto(
    'message_thread_participants',
  )
    .values({
      thread_id: thread.id,
      ...recipient,
    })
    .returning('id')
    .executeTakeFirstOrThrow()

  if (initial_message?.body) {
    await trx.insertInto('messages')
      .values({
        thread_id: thread.id,
        sender_id: sender_participant.id,
        body: initial_message.body,
      })
      .executeTakeFirstOrThrow()
  }

  return {
    thread_id: thread.id,
    sender_participant_id: sender_participant.id,
    recipient_participant_id: recipient_participant.id,
  }
}

export function send(
  trx: TrxOrDb,
  { thread_id, sender_id, message }: {
    thread_id: string
    sender_id: string
    message: {
      body: string
    }
  },
) {
  return trx.insertInto('messages')
    .values({
      thread_id,
      sender_id,
      body: message.body,
    })
    .returning('id')
    .executeTakeFirstOrThrow()
}
