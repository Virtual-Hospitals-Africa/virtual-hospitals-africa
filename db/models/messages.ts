import { assert } from 'std/assert/assert.ts'
import {
  EmployedHealthWorker,
  RenderedMessageThreadWithAllMessages,
  RenderedMessageThreadWithMostRecentMessage,
  TrxOrDb,
} from '../../types.ts'
import { jsonArrayFrom } from '../helpers.ts'
import { sql } from 'kysely/index.js'
import compact from '../../util/compact.ts'
import { promiseProps } from '../../util/promiseProps.ts'
import { assertOr404 } from '../../util/assertOr.ts'

async function appendMostRecentMessage(
  trx: TrxOrDb,
  thread: Awaited<
    ReturnType<typeof getThreads>
  >[number],
): Promise<RenderedMessageThreadWithMostRecentMessage> {
  const { sender_id, is_from_system, ...most_recent_message } = await trx
    .selectFrom('messages')
    .leftJoin(
      'message_reads as message_reads_by_me',
      (join) =>
        join.onRef('message_reads_by_me.message_id', '=', 'messages.id')
          .on('message_reads_by_me.participant_id', '=', thread.participant_id),
    )
    .where('messages.thread_id', '=', thread.id)
    .orderBy('messages.created_at desc')
    .selectAll('messages')
    .select('message_reads_by_me.created_at as read_by_me_at')
    .select((eb) => [
      eb('messages.sender_id', '=', thread.participant_id).as(
        'sent_by_me',
      ),
    ])
    .select((eb) =>
      jsonArrayFrom(
        eb.selectFrom('message_reads as message_reads_by_others')
          .whereRef('message_reads_by_others.message_id', '=', 'messages.id')
          .where(
            'message_reads_by_others.participant_id',
            '!=',
            thread.participant_id,
          )
          .select([
            'message_reads_by_others.participant_id',
            'message_reads_by_others.created_at as read_at',
          ]),
      ).as('read_by_others')
    )
    .executeTakeFirstOrThrow()

  const sender = is_from_system
    ? { is_system: true as const, name: 'System' as const }
    : thread.participants.find((p) => p.participant_id === sender_id)

  assert(sender, `Could not find participant ${sender_id}`)

  return {
    ...thread,
    most_recent_message: {
      ...most_recent_message,
      sender,
    },
  }
}

type ParticipantsQuery = {
  table_name: string
  row_id: string
}[]

function getThreads(
  trx: TrxOrDb,
  my_participants: ParticipantsQuery,
  opts?: {
    thread_ids?: string[]
  },
) {
  assert(
    my_participants.length,
    'Must provide at least one participant representing the person wishing to view the threads. Messages & partipants are marked as "sent_by_me" so the calling entity must be known.',
  )
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
          .leftJoin(
            'employment',
            (qb) =>
              qb.on('participants.table_name', '=', 'employment')
                .onRef('participants.row_id', '=', 'employment.id'),
          )
          .leftJoin(
            'health_workers',
            'employment.health_worker_id',
            'health_workers.id',
          )
          .leftJoin(
            'pharmacists',
            (qb) =>
              qb.on('participants.table_name', '=', 'pharmacists')
                .onRef('participants.row_id', '=', 'pharmacists.id'),
          )
          .select((eb) => [
            'participants.id as participant_id',
            'health_workers.avatar_url',

            eb.case()
              .when(eb('participants.table_name', '=', 'employment'))
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

            eb.or(my_participants.map((p) =>
              eb.and([
                eb('table_name', '=', p.table_name),
                eb('row_id', '=', p.row_id),
              ])
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
    .where(
      'message_threads.id',
      'in',
      trx.selectFrom('message_thread_participants')
        .where((eb) =>
          eb.or(my_participants.map((p) =>
            eb.and([
              eb('table_name', '=', p.table_name),
              eb('row_id', '=', p.row_id),
            ])
          ))
        )
        .select('thread_id')
        .distinct(),
    )
    .$if(
      !!opts?.thread_ids,
      (qb) => qb.where('message_threads.id', 'in', opts?.thread_ids!),
    )
    .execute()
}

export async function getThreadsWithMostRecentMessages(
  trx: TrxOrDb,
  my_participants: ParticipantsQuery,
): Promise<RenderedMessageThreadWithMostRecentMessage[]> {
  const threads = await getThreads(trx, my_participants)

  return Promise.all(
    threads.map((thread) => appendMostRecentMessage(trx, thread)),
  )
}

export async function createThread(
  trx: TrxOrDb,
  { sender, recipient, concerning, initial_message }: {
    sender: {
      table_name: string
      row_id: string
    }
    recipient: {
      table_name: string
      row_id: string
    }
    concerning: {
      patient_id: string
    }
    initial_message: {
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
      ...recipient,
    })
    .returning('id')
    .executeTakeFirstOrThrow()

  const message = await trx.insertInto('messages')
    .values({
      thread_id: thread.id,
      sender_id: sender_participant.id,
      body: initial_message.body,
    })
    .returning('id')
    .executeTakeFirstOrThrow()

  return {
    thread_id: thread.id,
    sender_participant_id: sender_participant.id,
    recipient_participant_id: recipient_participant.id,
    initial_message_id: message.id,
  }
}

type Sender = string | ParticipantsQuery

// Support finding whichever participant is already in the thread.
// Necessary as a health worker may have more than one employment
function senderId(trx: TrxOrDb, thread_id: string, sender: Sender) {
  if (typeof sender === 'string') return sender
  return trx.selectFrom('message_thread_participants')
    .where('thread_id', '=', thread_id)
    .where((eb) =>
      eb.or(
        sender.map((p) =>
          eb.and([
            eb('table_name', '=', p.table_name),
            eb('row_id', '=', p.row_id),
          ])
        ),
      )
    )
    .select('id')
}

export function send(
  trx: TrxOrDb,
  { thread_id, sender, body }: {
    thread_id: string
    body: string
    sender: Sender
  },
) {
  return trx.insertInto('messages')
    .values({
      thread_id,
      body,
      sender_id: senderId(trx, thread_id, sender),
    })
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function getThread(
  trx: TrxOrDb,
  my_participants: ParticipantsQuery,
  message_thread_id: string,
): Promise<RenderedMessageThreadWithAllMessages> {
  const { threads, raw_messages } = await promiseProps({
    threads: getThreads(trx, my_participants, {
      thread_ids: [message_thread_id],
    }),
    raw_messages: trx
      .selectFrom('messages')
      .where('messages.thread_id', '=', message_thread_id)
      .orderBy('messages.created_at desc')
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
      .execute(),
  })
  const [thread] = threads
  assertOr404(thread, `No thread ${message_thread_id}`)

  const messages = raw_messages.map((
    { reads, sender_id, is_from_system, ...m },
  ) => ({
    ...m,
    sent_by_me: sender_id === thread.participant_id,
    read_by_me_at:
      reads.find((read) => read.participant_id === thread.participant_id)
        ?.read_at || null,
    read_by_others: reads.filter((read) =>
      read.participant_id !== thread.participant_id
    ),
    sender: is_from_system
      ? { is_system: true as const, name: 'System' as const }
      : thread.participants.find((p) => p.participant_id === sender_id)!,
  }))

  return { ...thread, messages }
}

export function participantsQueryForHealthWorker(
  health_worker: EmployedHealthWorker,
): ParticipantsQuery {
  const employee_ids = health_worker.employment.flatMap((e) =>
    compact([
      e.roles.admin?.employment_id,
      e.roles.doctor?.employment_id,
      e.roles.nurse?.employment_id,
    ])
  )

  assert(employee_ids.length, 'Must complete onboarding first')

  return employee_ids.map((row_id) => ({
    table_name: 'employment',
    row_id,
  }))
}
