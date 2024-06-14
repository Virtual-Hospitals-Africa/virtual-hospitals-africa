import { InsertResult, sql, UpdateResult } from 'kysely'
import {
  HasStringId,
  PatientState,
  TrxOrDb,
  WhatsAppMessageContents,
  WhatsAppMessageReceived,
} from '../../types.ts'
import compact from '../../util/compact.ts'
import { sendToEngineeringChannel } from '../../external-clients/slack.ts';

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
  if (!contents || typeof contents !== 'object') {
    return false
  }
  if (
    !('has_media' in contents) || !('media_id' in contents) ||
    !('body' in contents)
  ) {
    return false
  }
  if (contents.has_media) {
    return !!contents.media_id && typeof contents.media_id === 'string' &&
      !contents.body
  }
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
  HasStringId<Omit<WhatsAppMessageReceived, 'started_responding_at'>>
> {
  const { patient_phone_number, ...message_data } = data

  const patient = (await trx
    .insertInto('patients')
    .values({
      phone_number: patient_phone_number,
      conversation_state: 'initial_message',
      completed_intake: false,
    })
    .onConflict((oc) => oc.column('phone_number').doNothing())
    .returningAll()
    .executeTakeFirst()) || (
      await trx.selectFrom('patients').where(
        'phone_number',
        '=',
        patient_phone_number,
      ).selectAll().executeTakeFirstOrThrow()
    )

  const inserted = await trx
    .insertInto('whatsapp_messages_received')
    .values({
      patient_id: patient.id,
      conversation_state: patient.conversation_state,
      ...message_data,
    })
    .returningAll()
    .executeTakeFirstOrThrow()

  return inserted
}

export function insertMessageSent(
  trx: TrxOrDb,
  opts: {
    patient_id: string
    responding_to_id: string
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
  { commitHash, phone_number }: { commitHash: string; phone_number?: string },
): Promise<
  PatientState[]
> {
  // deno-lint-ignore no-explicit-any
  const result = await sql<any>`
    WITH eligible_messages as (
      SELECT whatsapp_messages_received.id
        FROM whatsapp_messages_received
        JOIN patients ON patients.id = whatsapp_messages_received.patient_id
       WHERE (started_responding_at is null
              OR (error_commit_hash IS NOT NULL AND error_commit_hash != ${commitHash})
             )
         AND (${
    phone_number ? sql`patients.phone_number = ${phone_number}` : sql`true`
  })
    ),

    responding_to_messages as (
         UPDATE whatsapp_messages_received
            SET started_responding_at = now()
              , error_commit_hash = NULL
              , error_message = NULL
          WHERE (id IN (SELECT id FROM eligible_messages))
      RETURNING id
    ),

    aot_pre as (
      SELECT patient_appointment_offered_times.*,
             health_workers.name as health_worker_name,
             employment.profession
        FROM patient_appointment_offered_times
        JOIN employment ON patient_appointment_offered_times.provider_id = employment.id
        JOIN health_workers ON employment.health_worker_id = health_workers.id
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
            , whatsapp_messages_received.media_id
            , patients.id
            , patients.name
            , patients.phone_number
            , patients.location
            , patients.gender
            , TO_CHAR(patients.date_of_birth, 'FMDD FMMonth YYYY') as dob_formatted
            , patients.national_id_number
            , patients.conversation_state
            , concat('/app/patients/', patients.id::text) as href
            , patient_nearest_organizations.nearest_organizations AS nearest_organizations
            , aot.patient_appointment_request_id as scheduling_appointment_request_id
            , aot.reason as scheduling_appointment_reason
            , aot.offered_times as scheduling_appointment_offered_times
            , appointments.id as scheduled_appointment_id
            , appointments.reason as scheduled_appointment_reason
            , appointment_providers.provider_id as scheduled_appointment_provider_id
            , health_workers.name as scheduled_appointment_health_worker_name
            , appointments.gcal_event_id as scheduled_appointment_gcal_event_id
            , appointments.start as scheduled_appointment_start

         FROM whatsapp_messages_received
         JOIN patients ON patients.id = whatsapp_messages_received.patient_id
    LEFT JOIN aot ON aot.patient_id = patients.id
    LEFT JOIN patient_nearest_organizations ON patient_nearest_organizations.patient_id = patients.id AND patients.conversation_state = 'find_nearest_organization:got_location'
    LEFT JOIN appointments ON appointments.patient_id = patients.id
    LEFT JOIN appointment_providers ON appointment_providers.appointment_id = appointments.id
    LEFT JOIN employment ON employment.id = appointment_providers.provider_id
    LEFT JOIN health_workers ON health_workers.id = employment.health_worker_id
        WHERE whatsapp_messages_received.id in (SELECT id FROM responding_to_messages)
  `.execute(trx)

  return result.rows.map((row) => {
    const {
      scheduling_appointment_request_id,
      scheduling_appointment_reason,
      scheduling_appointment_offered_times,
      scheduled_appointment_id,
      scheduled_appointment_reason,
      scheduled_appointment_provider_id,
      scheduled_appointment_health_worker_name,
      scheduled_appointment_gcal_event_id,
      scheduled_appointment_start,
      ...rest
    } = row
    const patient_state: PatientState = { ...rest }
    if (scheduling_appointment_request_id) {
      patient_state.scheduling_appointment_request = {
        id: scheduling_appointment_request_id,
        reason: scheduling_appointment_reason,
        offered_times: compact(scheduling_appointment_offered_times),
      }
    }
    if (scheduled_appointment_id) {
      patient_state.scheduled_appointment = {
        id: scheduled_appointment_id,
        reason: scheduled_appointment_reason,
        provider_id: scheduled_appointment_provider_id,
        health_worker_name: scheduled_appointment_health_worker_name,
        gcal_event_id: scheduled_appointment_gcal_event_id,
        start: scheduled_appointment_start,
      }
    }

    return patient_state
  })
}

export function markChatbotError(
  trx: TrxOrDb,
  opts: {
    whatsapp_message_received_id: string
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
    patient_id: string
  },
): Promise<string[]> {
  const result = await trx
    .selectFrom('whatsapp_messages_received')
    .where('patient_id', '=', opts.patient_id)
    .where('has_media', '=', true)
    .select((eb) => [
      eb.ref('media_id').$notNull().as('media_id'),
    ])
    .execute()
  return result.map((r) => r.media_id)
}
