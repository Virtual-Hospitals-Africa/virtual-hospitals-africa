import { InsertResult, sql, UpdateResult } from 'kysely'
import {
  PatientConversationState,
  PatientState,
  ReturnedSqlRow,
  TrxOrDb,
} from '../../types.ts'
import compact from '../../util/compact.ts'

export function updateReadStatus(
  trx: TrxOrDb,
  opts: { whatsapp_id: string; read_status: string },
): Promise<UpdateResult[]> {
  return trx
    .updateTable('whatsapp_messages_sent')
    .set({ read_status: opts.read_status })
    .where('whatsapp_id', '=', opts.whatsapp_id)
    .execute()
}

export async function insertMessageReceived(
  trx: TrxOrDb,
  opts: { patient_phone_number: string; whatsapp_id: string; body: string },
): Promise<
  ReturnedSqlRow<{
    patient_id: number
    whatsapp_id: string
    body: string
    started_responding_at: Date | null | undefined
    conversation_state: PatientConversationState
  }>
> {
  const patient = (
    await trx
      .insertInto('patients')
      .values({
        phone_number: opts.patient_phone_number,
        conversation_state: 'initial_message',
      })
      .onConflict((oc) => oc.column('phone_number').doNothing())
      .returningAll()
      .executeTakeFirst()
  ) || (
    await trx.selectFrom('patients').where(
      'phone_number',
      '=',
      opts.patient_phone_number,
    ).selectAll().executeTakeFirstOrThrow()
  )

  return trx
    .insertInto('whatsapp_messages_received')
    .values({
      patient_id: patient.id,
      whatsapp_id: opts.whatsapp_id,
      body: opts.body,
      conversation_state: patient.conversation_state,
    })
    .onConflict((oc) => oc.column('whatsapp_id').doNothing())
    .returningAll()
    .executeTakeFirstOrThrow()
}

export function insertMessageSent(
  trx: TrxOrDb,
  opts: {
    patient_id: number
    responding_to_id: number
    whatsapp_id: string
    body: string
  },
): Promise<InsertResult> {
  return trx.insertInto('whatsapp_messages_sent').values({
    ...opts,
    read_status: 'sent',
  }).executeTakeFirstOrThrow()
}

export async function getUnhandledPatientMessages(
  trx: TrxOrDb,
  { commitHash }: { commitHash: string },
): Promise<
  PatientState[]
> {
  // deno-lint-ignore no-explicit-any
  const result = await sql<any>`
    WITH responding_to_messages as (
          UPDATE whatsapp_messages_received
             SET started_responding_at = now()
               , error_commit_hash = NULL
               , error_message = NULL
           WHERE (started_responding_at is null
             OR (error_commit_hash IS NOT NULL AND error_commit_hash != ${commitHash}))
      RETURNING id
    ),

    aot_pre as (
      SELECT patient_appointment_offered_times.*,
             health_workers.name as health_worker_name
        FROM patient_appointment_offered_times
        JOIN health_workers ON patient_appointment_offered_times.health_worker_id = health_workers.id
    ),

    aot as (
         SELECT patient_appointment_requests.id as patient_appointment_request_id,
                patient_appointment_requests.patient_id,
                patient_appointment_requests.reason,
                json_agg(aot_pre.*) as offered_times
           FROM patient_appointment_requests
      LEFT JOIN aot_pre ON patient_appointment_requests.id = aot_pre.patient_appointment_request_id
          WHERE patient_appointment_requests.id is not null
       GROUP BY patient_appointment_requests.id, patient_appointment_requests.patient_id, patient_appointment_requests.reason
    )

       SELECT whatsapp_messages_received.id as message_id
            , whatsapp_messages_received.patient_id
            , whatsapp_messages_received.whatsapp_id
            , whatsapp_messages_received.body
            , patients.*
            , patient_nearest_facilities.nearest_facilities AS nearest_facilities
            , aot.patient_appointment_request_id as scheduling_appointment_request_id
            , aot.reason as scheduling_appointment_reason
            , aot.offered_times as scheduling_appointment_offered_times
            , appointments.id as scheduled_appointment_id
            , appointments.reason as scheduled_appointment_reason
            , appointment_health_worker_attendees.health_worker_id as scheduled_appointment_health_worker_id
            , health_workers.name as scheduled_appointment_health_worker_name
            , appointments.gcal_event_id as scheduled_appointment_gcal_event_id
            , appointments.start as scheduled_appointment_start

         FROM whatsapp_messages_received
         JOIN patients ON patients.id = whatsapp_messages_received.patient_id
    LEFT JOIN aot ON aot.patient_id = patients.id
    LEFT JOIN patient_nearest_facilities ON patient_nearest_facilities.patient_id = patients.id
    LEFT JOIN appointments ON appointments.patient_id = patients.id
    LEFT JOIN appointment_health_worker_attendees ON appointment_health_worker_attendees.appointment_id = appointments.id
    LEFT JOIN health_workers ON health_workers.id = appointment_health_worker_attendees.health_worker_id
        WHERE whatsapp_messages_received.id in (SELECT id FROM responding_to_messages)
  `.execute(trx)

  const rows: PatientState[] = []

  for (const row of result.rows) {
    const {
      scheduling_appointment_request_id,
      scheduling_appointment_reason,
      scheduling_appointment_offered_times,
      scheduled_appointment_id,
      scheduled_appointment_reason,
      scheduled_appointment_health_worker_id,
      scheduled_appointment_health_worker_name,
      scheduled_appointment_gcal_event_id,
      scheduled_appointment_start,
      ...rest
    } = row
    const toPush = { ...rest }
    if (scheduling_appointment_request_id) {
      toPush.scheduling_appointment_request = {
        id: scheduling_appointment_request_id,
        reason: scheduling_appointment_reason,
        offered_times: compact(scheduling_appointment_offered_times),
      }
    }
    if (scheduled_appointment_id) {
      toPush.scheduled_appointment = {
        id: scheduled_appointment_id,
        reason: scheduled_appointment_reason,
        health_worker_id: scheduled_appointment_health_worker_id,
        health_worker_name: scheduled_appointment_health_worker_name,
        gcal_event_id: scheduled_appointment_gcal_event_id,
        start: scheduled_appointment_start,
      }
    }
    console.log('message', toPush)
    rows.push(toPush)
  }

  return rows
}

export function markChatbotError(
  trx: TrxOrDb,
  opts: {
    whatsapp_message_received_id: number
    commitHash: string
    errorMessage: string
  },
) {
  return trx
    .updateTable('whatsapp_messages_received')
    .set({
      error_commit_hash: opts.commitHash,
      error_message: opts.errorMessage,
    })
    .where('id', '=', opts.whatsapp_message_received_id)
    .executeTakeFirstOrThrow()
}
