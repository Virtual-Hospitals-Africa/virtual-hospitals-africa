import { assert } from 'std/testing/asserts.ts'
import { InsertResult, sql, UpdateResult } from 'kysely'
import {
  PatientState,
  ReturnedSqlRow,
  TrxOrDb,
  WhatsAppMessageContents,
  WhatsAppMessageReceived,
} from '../../types.ts'
// import { assert } from 'https://deno.land/std@0.188.0/testing/asserts.ts'
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

export function isWhatsAppContents(
  contents: unknown,
): contents is WhatsAppMessageContents {
  console.log('contents passed to check', contents)
  if (!contents || typeof contents !== 'object') {
    console.log('failed in here, contents is unknown')
    return false
  }
  if (
    !('has_media' in contents) || !('media_id' in contents) ||
    !('body' in contents)
  ) {
    console.log(`failed because has_media / media_id / body not in contents`)
    return false
  }
  if (contents.has_media) {
    console.log(
      `checking here is ${
        !!contents.media_id && typeof contents.media_id === 'string' &&
        !contents.body
      } `,
    )
    return !!contents.media_id && typeof contents.media_id === 'string' &&
      !contents.body
  }
  console.log(`last branch, ${
    contents.media_id === null && !!contents.body &&
    typeof contents.body === 'string'
  }`)
  return contents.media_id === null && !!contents.body &&
    typeof contents.body === 'string'
}

export async function insertMessageReceived(
  trx: TrxOrDb,
  data:
    & {
      patient_phone_number: string
    }
    & Pick<
      WhatsAppMessageReceived,
      'whatsapp_id' | 'has_media' | 'body' | 'media_id'
    >,
): Promise<
  ReturnedSqlRow<Omit<WhatsAppMessageReceived, 'started_responding_at'>>
> {
  const patient = (await trx
    .insertInto('patients')
    .values({
      phone_number: data.patient_phone_number,
      conversation_state: 'initial_message',
    })
    .onConflict((oc) => oc.column('phone_number').doNothing())
    .returningAll()
    .executeTakeFirst()) || (
      await trx.selectFrom('patients').where(
        'phone_number',
        '=',
        data.patient_phone_number,
      ).selectAll().executeTakeFirstOrThrow()
    )

  const { patient_phone_number, ...message_data } = data
  console.log(patient_phone_number)
  const inserted = await trx
    .insertInto('whatsapp_messages_received')
    .values({
      patient_id: patient.id,
      conversation_state: patient.conversation_state,
      ...message_data,
    })
    .returningAll()
    .executeTakeFirstOrThrow()

  // console.log('inserted stuff', inserted)
  // assert(
  //   isWhatsAppContents(inserted),
  //   'assertion error occured, what happened?',
  // )

  return inserted
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
            , whatsapp_messages_received.has_media
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
    LEFT JOIN patient_nearest_facilities ON patient_nearest_facilities.patient_id = patients.id AND patients.conversation_state = 'find_nearest_facility:got_location'
    LEFT JOIN appointments ON appointments.patient_id = patients.id
    LEFT JOIN appointment_health_worker_attendees ON appointment_health_worker_attendees.appointment_id = appointments.id
    LEFT JOIN health_workers ON health_workers.id = appointment_health_worker_attendees.health_worker_id
        WHERE whatsapp_messages_received.id in (SELECT id FROM responding_to_messages)
  `.execute(trx)

  const rows: PatientState[] = await Promise.all(result.rows.map((row) => {
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

    return toPush
  }))

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

export async function getMediaIdByPatientId(
  trx: TrxOrDb,
  opts: {
    patient_id: number
  },
): Promise<number[]> {
  const queryResult = await trx.selectFrom('whatsapp_messages_received').where(
    'patient_id',
    '=',
    opts.patient_id,
  ).where('has_media', '=', true).select('media_id').execute()
  const mediaIds = []
  for (const { media_id } of queryResult) {
    assert(media_id, `No media found for patient${opts.patient_id}`)
    mediaIds.push(media_id)
  }
  return mediaIds
}
