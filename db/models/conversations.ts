import { InsertResult, sql, UpdateResult } from 'kysely'
import * as clinics from './clinics.ts'
import {
  LocationMessage,
  PatientConversationState,
  PatientState,
  ReturnedSqlRow,
  TrxOrDb,
} from '../../types.ts'

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
  let [patient] = await trx
    .insertInto('patients')
    .values({
      phone_number: opts.patient_phone_number,
      conversation_state: 'initial_message',
    })
    .onConflict((oc) => oc.column('phone_number').doNothing())
    .returningAll()
    .execute()

  // TODO: Eliminate this in favor of getting the above to return the existing patient
  if (!patient) {
    const patients = await trx.selectFrom('patients').where(
      'phone_number',
      '=',
      opts.patient_phone_number,
    ).selectAll().execute()
    patient = patients[0]
  }
  console.log('patient', patient)
  const [inserted] = await trx
    .insertInto('whatsapp_messages_received')
    .values({
      patient_id: patient.id,
      whatsapp_id: opts.whatsapp_id,
      body: opts.body,
      conversation_state: patient.conversation_state,
    })
    .onConflict((oc) => oc.column('whatsapp_id').doNothing())
    .returningAll()
    .execute()

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
): Promise<InsertResult[]> {
  return trx.insertInto('whatsapp_messages_sent').values({
    ...opts,
    read_status: 'sent',
  }).execute()
}

export async function getUnhandledPatientMessages(
  trx: TrxOrDb,
  { commitHash }: { commitHash: string },
): Promise<
  PatientState[]
> {
  const result = await sql<PatientState>`
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
         SELECT appointment_offered_times.*,
                health_workers.name as health_worker_name
           FROM appointment_offered_times
           JOIN health_workers ON appointment_offered_times.health_worker_id = health_workers.id
    ),

    aot as (
         SELECT appointments.id as appointment_id,
                appointments.patient_id,
                appointments.reason,
                json_agg(aot_pre.*) as offered_times
           FROM appointments
      LEFT JOIN aot_pre ON appointments.id = aot_pre.appointment_id
          WHERE appointments.id is not null
       GROUP BY appointments.id, appointments.patient_id, appointments.reason
    )

       SELECT whatsapp_messages_received.id as message_id,
              whatsapp_messages_received.patient_id,
              whatsapp_messages_received.whatsapp_id,
              whatsapp_messages_received.body,
              patients.*,
              aot.appointment_id as scheduling_appointment_id,
              aot.reason as scheduling_appointment_reason,
              aot.offered_times as appointment_offered_times
         FROM whatsapp_messages_received
         JOIN patients ON patients.id = whatsapp_messages_received.patient_id
    LEFT JOIN aot ON aot.patient_id = patients.id
        WHERE whatsapp_messages_received.id in (SELECT id FROM responding_to_messages)
  `.execute(trx)

  const rows: PatientState[] = []
  for (const row of result.rows) {
    // TODO do this all in the above query
    if (
      row.conversation_state === 'find_nearest_clinic:got_location'
    ) {
      const location: LocationMessage = JSON.parse(row.body)
      row.nearest_clinics = await clinics.nearest(trx, location)
    }

    rows.push({
      ...row,
      appointment_offered_times: row.appointment_offered_times
        ? row.appointment_offered_times.filter((aot) => aot)
        : [],
    })
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
    .execute()
}
