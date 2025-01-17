import { assert } from 'std/assert/assert.ts'
import {
  RenderedMessageThread,
  RenderedMessageThreadOtherParticipant,
  TrxOrDb,
} from '../../types.ts'
import { jsonArrayFrom } from '../helpers.ts'
import { sql } from 'kysely/index.js'

function toRenderedParticipant(
  { health_worker_id, pharmacist_id, ...participant }: Awaited<
    ReturnType<typeof getThreadsForHealthWorker>
  >[number]['other_participants_raw'][number],
): RenderedMessageThreadOtherParticipant {
  if (pharmacist_id) {
    return {
      ...participant,
      pharmacist_id,
      health_worker_id: null,
      type: 'pharmacist',
    }
  }
  if (health_worker_id) {
    return {
      ...participant,
      health_worker_id,
      pharmacist_id: null,
      type: 'health_worker',
    }
  }
  throw new Error('Nope!')
}

async function appendMostRecentMessage(
  trx: TrxOrDb,
  { other_participants_raw, ...thread }: Awaited<
    ReturnType<typeof getThreadsForHealthWorker>
  >[number],
): Promise<RenderedMessageThread> {
  const other_participants = other_participants_raw.map(toRenderedParticipant)
  const { sender_id, ...most_recent_message } = await trx
    .selectFrom('messages')
    .leftJoin(
      'message_read_status',
      'message_read_status.message_id',
      'messages.id',
    )
    .where('messages.thread_id', '=', thread.id)
    .orderBy('messages.created_at desc')
    .selectAll('messages')
    .select('message_read_status.read_at')
    .select((eb) => [
      eb('messages.sender_id', '=', thread.participant_id).as(
        'sent_by_me',
      ),
    ])
    .executeTakeFirstOrThrow()

  const sender = other_participants.find((p) => p.participant_id === sender_id)
  assert(sender)
  return {
    ...thread,
    other_participants,
    most_recent_message: {
      ...most_recent_message,
      sender,
    },
  }
}

// TODO: support system messages
function getThreadsForHealthWorker(
  trx: TrxOrDb,
  health_worker_id: string,
) {
  return trx
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
          .leftJoin(
            'health_workers',
            'other_participants.health_worker_id',
            'health_workers.id',
          )
          .leftJoin(
            'employment',
            'health_workers.id',
            'employment.health_worker_id',
          )
          .leftJoin(
            'pharmacists',
            'other_participants.pharmacist_id',
            'pharmacists.id',
          )
          .select((eb_x) => [
            'other_participants.id as participant_id',
            'other_participants.health_worker_id',
            'other_participants.pharmacist_id',
            'health_workers.avatar_url',
            eb_x.fn.coalesce(
              'health_workers.name',
              sql<
                string
              >`(pharmacists.given_name || ' ' || pharmacists.family_name)`,
            ).as('name'),
            eb_x.case()
              .when('employment.profession', '=', 'doctor')
              .then('Doctor')
              .when('employment.profession', '=', 'nurse')
              .then('nurse')
              .else('Pharmacist')
              .end()
              .as('description'),
          ])
          .where('employment.profession', 'in', ['doctor', 'nurse'])
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
      ).as('other_participants_raw'),
    ])
    .where(
      'message_thread_participants.health_worker_id',
      '=',
      health_worker_id,
    )
    .execute()
}

export async function getAllThreadsForHealthWorker(
  trx: TrxOrDb,
  health_worker_id: string,
): Promise<RenderedMessageThread[]> {
  const threads = await getThreadsForHealthWorker(trx, health_worker_id)

  return Promise.all(
    threads.map((thread) => appendMostRecentMessage(trx, thread)),
  )
}

export async function createThread(
  trx: TrxOrDb,
  { sender, recipient, concerning, initial_message }: {
    sender: {
      health_worker_id?: string
      pharmacist_id?: string
    }
    recipient: {
      health_worker_id?: string
      pharmacist_id?: string
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

type Sender =
  | { participant_id: string; health_worker_id?: never; pharmacist_id?: never }
  | { participant_id?: never; health_worker_id: string; pharmacist_id?: never }
  | { participant_id?: never; health_worker_id?: never; pharmacist_id: string }

function senderId(trx: TrxOrDb, sender: Sender) {
  if (sender.participant_id) return sender.participant_id
  if (sender.health_worker_id) {
    return trx.selectFrom('message_thread_participants')
      .where('health_worker_id', '=', sender.health_worker_id)
      .select('id')
  }
  assert(sender.pharmacist_id, 'Sender must include an id')
  return trx.selectFrom('message_thread_participants')
    .where('pharmacist_id', '=', sender.pharmacist_id)
    .select('id')
}

export function send(
  trx: TrxOrDb,
  { thread_id, sender, body }: {
    thread_id: string
    sender: Sender
    body: string
  },
) {
  return trx.insertInto('messages')
    .values({
      thread_id,
      sender_id: senderId(trx, sender),
      body,
    })
    .returningAll()
    .executeTakeFirstOrThrow()
}
