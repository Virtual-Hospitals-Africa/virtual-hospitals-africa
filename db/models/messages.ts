import { assert } from 'std/assert/assert.ts'
import {
  RenderedMessageThreadWithMostRecentMessage,
  TrxOrDb,
} from '../../types.ts'
import { jsonArrayFrom } from '../helpers.ts'
import { sql } from 'kysely/index.js'

async function appendMostRecentMessage(
  trx: TrxOrDb,
  { participants, ...thread }: Awaited<
    ReturnType<typeof getThreads>
  >[number],
): Promise<RenderedMessageThreadWithMostRecentMessage> {
  const { sender_id, is_from_system, ...most_recent_message } = await trx
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

  const sender = is_from_system
    ? 'system'
    : participants.find((p) => p.participant_id === sender_id)

  assert(sender)

  return {
    ...thread,
    participants,
    most_recent_message: {
      ...most_recent_message,
      sender,
    },
  }
}

function getThreads(
  trx: TrxOrDb,
  opts: {
    employee_ids?: string[]
    thread_ids?: string[]
    pharmacist_id?: string
  },
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
          .selectFrom('message_thread_participants as participants')
          .leftJoin('employment', 'participants.employee_id', 'employment.id')
          .leftJoin(
            'health_workers',
            'employment.health_worker_id',
            'health_workers.id',
          )
          .leftJoin(
            'pharmacists',
            'participants.pharmacist_id',
            'pharmacists.id',
          )
          .select((eb) => [
            'participants.id as participant_id',
            'health_workers.avatar_url',

            eb.case()
              .when(eb('participants.employee_id', 'is not', null))
              .then(
                sql<
                  string
                >`'/app/organizations/' || employment.organization_id || '/employees/ || employment.health_worker_id'`,
              )
              .else(
                sql<string>`'/app/pharmacists/' || participants.pharmacist_id`,
              )
              .end()
              .as('href'),

            (opts.employee_ids
              ? eb(
                'participants.employee_id',
                'in',
                opts.employee_ids,
              )
              : eb(
                'participants.pharmacist_id',
                '=',
                opts.pharmacist_id!,
              ))
              .as('is_me'),
            eb.fn.coalesce(
              'health_workers.name',
              sql<
                string
              >`(pharmacists.given_name || ' ' || pharmacists.family_name)`,
            ).as('name'),
            eb.case()
              .when('employment.profession', '=', 'doctor')
              .then('Doctor')
              .when('employment.profession', '=', 'nurse')
              .then('Nurse')
              .else('Pharmacist')
              .end()
              .as('description'),
          ])
          .whereRef(
            'participants.thread_id',
            '=',
            'message_threads.id',
          ),
      ).as('participants'),
      jsonArrayFrom(
        eb
          .selectFrom('message_thread_subjects')
          .select(['table_name', 'row_id'])
          .whereRef(
            'message_thread_subjects.thread_id',
            '=',
            'message_threads.id',
          ),
      ).as('subjects'),
    ])
    .$if(!!opts.employee_ids, (qb) =>
      qb.where(
        'message_thread_participants.employee_id',
        'in',
        opts.employee_ids!,
      ))
    .$if(!!opts.pharmacist_id, (qb) =>
      qb.where(
        'message_thread_participants.pharmacist_id',
        '=',
        opts.pharmacist_id!,
      ))
    .$if(
      !!opts?.thread_ids,
      (qb) => qb.where('message_threads.id', 'in', opts?.thread_ids!),
    )
    .execute()
}

export async function getThreadsWithMostRecentMessages(
  trx: TrxOrDb,
  { employee_ids }: { employee_ids: string[] },
): Promise<RenderedMessageThreadWithMostRecentMessage[]> {
  const threads = await getThreads(trx, {
    employee_ids,
  })

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
      employee_id?: string
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
    .values({})
    .returning('id')
    .executeTakeFirstOrThrow()

  await trx.insertInto('message_thread_subjects')
    .values({
      thread_id: thread.id,
      table_name: 'patients',
      row_id: concerning.patient_id,
    })
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
      pharmacist_id: recipient.pharmacist_id,
      employee_id: recipient.employee_id,
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
  | { participant_id: string; employee_id?: never; pharmacist_id?: never }
  | { participant_id?: never; employee_id: string; pharmacist_id?: never }
  | { participant_id?: never; employee_id?: never; pharmacist_id: string }

function senderId(trx: TrxOrDb, sender: Sender) {
  if (sender.participant_id) return sender.participant_id
  if (sender.employee_id) {
    return trx.selectFrom('message_thread_participants')
      .where('employee_id', '=', sender.employee_id)
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

export function getThread(
  trx: TrxOrDb,
  message_thread_id,
) {
}
