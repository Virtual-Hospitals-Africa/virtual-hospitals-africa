import { assert } from 'std/assert/assert.ts'
import {
  EmployedHealthWorker,
  IdSelection,
  RenderedEmployee,
  RenderedMessage,
  RenderedMessageThreadParticipant,
  RenderedMessageThreadWithAllMessages,
  RenderedMessageThreadWithMostRecentMessage,
  RenderedPharmacist,
  TrxOrDb,
} from '../../types.ts'
import { jsonArrayFrom, success_true } from '../helpers.ts'
// import * as events from './events.ts'
import * as employees from './employees.ts'
import * as pharmacists from './pharmacists.ts'

import * as messages from './messages.ts'
import { promiseProps } from '../../util/promiseProps.ts'
import { assertOr404 } from '../../util/assertOr.ts'
import { base, QueryResult } from './_base.ts'
import generateUUID from '../../util/uuid.ts'
import isString from '../../util/isString.ts'
import { exists } from '../../util/exists.ts'
import matching from '../../util/matching.ts'
import { employeeDisplay } from '../../util/healthWorkerDisplay.ts'
import { pharmacistDisplay } from '../../shared/pharmacistDisplay.ts'
import { pMap } from '../../util/inParallel.ts'
import zip from '../../util/zip.ts'

function baseQuery(
  trx: TrxOrDb,
) {
  return trx
    .selectFrom('message_threads')
    .selectAll('message_threads')
    .select((eb) => [
      jsonArrayFrom(
        eb.selectFrom('message_thread_participants as participants')
          .select([
            'participants.id as participant_id',
            'participants.table_name',
            'participants.row_id',
          ]),
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
}

type IntermediateMessageThread = QueryResult<typeof baseQuery>

const model = base({
  top_level_table: 'message_threads' as const,
  baseQuery,
  formatResult: (x: IntermediateMessageThread): IntermediateMessageThread => x,
  handleSearch(
    qb,
    opts: {
      thread_id?: string | string[] | IdSelection
      message_id?: string | string[] | IdSelection
      employee_ids?: string[]
    },
    trx,
  ) {
    if (opts.thread_id) {
      qb = qb.where(
        'message_threads.id',
        'in',
        isString(opts.thread_id) ? [opts.thread_id] : opts.thread_id,
      )
    }
    if (opts.message_id) {
      qb = qb.where(
        'message_threads.id',
        'in',
        trx.selectFrom('messages')
          .where(
            'messages.id',
            'in',
            isString(opts.message_id) ? [opts.message_id] : opts.message_id,
          )
          .select('thread_id')
          .distinct(),
      )
    }
    if (opts.employee_ids) {
      const distinct_thread_ids_of_health_worker = trx.selectFrom(
        'message_thread_participants',
      ).where(
        (eb) =>
          eb.or(
            opts.employee_ids!.map((employee_id) =>
              eb.and([
                eb('message_thread_participants.table_name', '=', 'employment'),
                eb('message_thread_participants.row_id', '=', employee_id),
              ])
            ),
          ),
      )
        .select('message_thread_participants.thread_id')
        .distinct()

      qb = qb.where(
        'message_threads.id',
        'in',
        distinct_thread_ids_of_health_worker,
      )
    }
    return qb
  },
})

export const search = model.search
export const getById = model.getById
export const getByIds = model.getByIds
export const findAll = model.findAll
export const findOne = model.findOne

export async function create(
  trx: TrxOrDb,
  { sender, recipient, subjects, initial_message }: {
    sender: {
      table_name: string
      row_id: string
    }
    recipient: {
      table_name: string
      row_id: string
    }
    subjects: {
      table_name: string
      row_id: string
    }[]
    initial_message: {
      body: string
    }
  },
) {
  const thread_id = generateUUID()
  const sender_participant_id = generateUUID()
  const recipient_participant_id = generateUUID()
  const initial_message_id = generateUUID()

  const { success } = await trx.with(
    'inserting_thread',
    (qb) =>
      qb.insertInto('message_threads')
        .values({ id: thread_id }),
  ).with(
    'inserting_thread_subjects',
    (qb) =>
      qb.insertInto('message_thread_subjects')
        .values(subjects.map((s) => ({
          ...s,
          thread_id,
        }))),
  ).with(
    'inserting_sender',
    (qb) =>
      qb.insertInto('message_thread_participants')
        .values({
          thread_id,
          ...sender,
          id: sender_participant_id,
        }),
  ).with('inserting_recipient', (qb) =>
    qb.insertInto(
      'message_thread_participants',
    )
      .values({
        thread_id,
        ...recipient,
      })).with('inserting_message', (qb) =>
      qb.insertInto('messages')
        .values({
          id: initial_message_id,
          thread_id,
          sender_participant_id: sender_participant_id,
          body: initial_message.body,
        })).selectNoFrom([
      success_true,
    ])
    .executeTakeFirstOrThrow()

  assert(success)

  return {
    thread_id,
    sender_participant_id,
    recipient_participant_id,
    initial_message_id,
  }
}

function renderedParticipants(
  participants: IntermediateMessageThread['participants'],
  my_participant: IntermediateMessageThread['participants'][0],
  employees: RenderedEmployee[],
  pharmacists: RenderedPharmacist[],
): RenderedMessageThreadParticipant[] {
  return participants.map((participant) => {
    if (participant.table_name === 'employment') {
      const employee = exists(
        employees.find(matching({ id: participant.row_id })),
      )
      return {
        participant_type: 'employee',
        participant_id: participant.participant_id,
        href: employee.href,
        is_me: participant === my_participant,
        is_system: false,
        ...employeeDisplay(employee),
      }
    }
    if (participant.table_name === 'pharmacists') {
      const pharmacist = exists(
        pharmacists.find(matching({ id: participant.row_id })),
      )
      return {
        participant_type: 'pharmacist',
        participant_id: participant.participant_id,
        href: '/app/pharmacists',
        is_me: false,
        is_system: false,
        ...pharmacistDisplay(pharmacist),
      }
    }
    throw new Error(`Unrecognized table name ${participant.table_name}`)
  })
}

function renderedMessage(
  { reads, is_from_system, sender_participant_id, ...message }:
    messages.IntermediateMessage,
  my_participant: IntermediateMessageThread['participants'][0],
  rendered_participants: RenderedMessageThreadParticipant[],
): RenderedMessage {
  return {
    ...message,
    read_by_me_at:
      reads.find((read) =>
        read.participant_id === my_participant.participant_id
      )
        ?.read_at || null,
    read_by_others: reads.filter((read) =>
      read.participant_id !== my_participant.participant_id
    ),
    sender: is_from_system
      ? {
        is_system: true as const,
        display_name: 'System',
        participant_type: 'system' as const,
      }
      : rendered_participants.find((p) =>
        p.participant_id === sender_participant_id
      )!,
  }
}

export async function getOneForHealthWorker(
  trx: TrxOrDb,
  health_worker: EmployedHealthWorker,
  message_thread_id: string | IdSelection,
): Promise<RenderedMessageThreadWithAllMessages> {
  const employee_ids = health_worker.organizations.flatMap((e) =>
    e.roles.map((role) => role.employment_id)
  )

  assert(employee_ids.length, 'Must complete onboarding first')

  const { thread, raw_messages, raw_employees, raw_pharmacists } =
    await promiseProps({
      thread: findOne(trx, {
        employee_ids,
        thread_id: message_thread_id,
      }),
      raw_messages: messages.findAll(trx, {
        thread_id: message_thread_id,
      }),
      raw_employees: employees.getByIds(
        trx,
        trx.selectFrom('message_thread_participants')
          .where(
            'message_thread_participants.thread_id',
            '=',
            message_thread_id,
          )
          .where('message_thread_participants.table_name', '=', 'employment')
          .select('message_thread_participants.row_id as id')
          .distinct(),
      ),
      raw_pharmacists: pharmacists.getByIds(
        trx,
        trx.selectFrom('message_thread_participants')
          .where(
            'message_thread_participants.thread_id',
            '=',
            message_thread_id,
          )
          .where('message_thread_participants.table_name', '=', 'pharmacists')
          .select('message_thread_participants.row_id as id')
          .distinct(),
      ),
    })

  assertOr404(thread, `No thread ${message_thread_id}`)

  const my_participant = exists(thread.participants.find(
    (participant) => employee_ids.includes(participant.row_id),
  ))

  const rendered_participants = renderedParticipants(
    thread.participants,
    my_participant,
    raw_employees,
    raw_pharmacists,
  )

  const rendered_messages = raw_messages.map(
    (message) =>
      renderedMessage(message, my_participant, rendered_participants),
  )

  const last_message_read_by_everyone_else = rendered_messages.find((m) =>
    m.read_by_others.length === thread.participants.length - 1
  )

  return {
    ...thread,
    participant_id: my_participant.participant_id,
    participants: rendered_participants,
    messages: rendered_messages,
    last_message_read_by_everyone_else_id: last_message_read_by_everyone_else
      ?.id,
  }
}

export async function getForHealthWorker(
  trx: TrxOrDb,
  health_worker: EmployedHealthWorker,
): Promise<RenderedMessageThreadWithMostRecentMessage[]> {
  const employee_ids = health_worker.organizations.flatMap((e) =>
    e.roles.map((role) => role.employment_id)
  )

  assert(employee_ids.length, 'Must complete onboarding first')

  const threads = await findAll(trx, { employee_ids })
  const thread_ids = threads.map((t) => t.id)

  const { most_recent_messages_raw, raw_employees, raw_pharmacists } =
    await promiseProps({
      // TODO: do this via rank and get all of this down to one round trip
      most_recent_messages_raw: pMap(
        threads,
        (thread) => messages.findFirst(trx, { thread_id: thread.id }),
      ),
      raw_employees: employees.getByIds(
        trx,
        trx.selectFrom('message_thread_participants')
          .where('message_thread_participants.thread_id', 'in', thread_ids)
          .where('message_thread_participants.table_name', '=', 'employment')
          .select('message_thread_participants.row_id as id')
          .distinct(),
      ),
      raw_pharmacists: pharmacists.getByIds(
        trx,
        trx.selectFrom('message_thread_participants')
          .where('message_thread_participants.thread_id', 'in', thread_ids)
          .where('message_thread_participants.table_name', '=', 'pharmacists')
          .select('message_thread_participants.row_id as id')
          .distinct(),
      ),
    })

  return Array.from(
    zip(threads, most_recent_messages_raw).map(
      ([thread, message]): RenderedMessageThreadWithMostRecentMessage => {
        const my_participant = exists(thread.participants.find(
          (participant) => employee_ids.includes(participant.row_id),
        ))

        const rendered_participants = renderedParticipants(
          thread.participants,
          my_participant,
          raw_employees,
          raw_pharmacists,
        )

        const most_recent_message = renderedMessage(
          message,
          my_participant,
          rendered_participants,
        )

        return {
          ...thread,
          participant_id: my_participant.participant_id,
          participants: rendered_participants,
          most_recent_message,
        }
      },
    ),
  )
}
