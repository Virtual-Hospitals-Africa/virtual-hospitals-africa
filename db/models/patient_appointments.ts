import { sql } from 'kysely'
import { PatientSchedulingAppointmentRequest, TrxOrDb } from '../../types.ts'

export async function schedulingAppointmentRequest(
  trx: TrxOrDb,
  patient_id: string,
): Promise<null | PatientSchedulingAppointmentRequest> {
  // deno-lint-ignore no-explicit-any
  const result = await sql<any>`
      WITH aot_pre as (
        SELECT patient_appointment_offered_times.*,
               health_workers.name as health_worker_name,
               employment.profession
          FROM patient_appointment_offered_times
          JOIN employment ON patient_appointment_offered_times.provider_id = employment.id
          JOIN health_workers ON employment.health_worker_id = health_workers.id
      )

      SELECT patient_appointment_requests.id as patient_appointment_request_id,
             patient_appointment_requests.reason,
             json_agg(aot_pre.*) as offered_times
        FROM patient_appointment_requests
   LEFT JOIN aot_pre ON patient_appointment_requests.id = aot_pre.patient_appointment_request_id
       WHERE patient_appointment_requests.id is not null
         AND patient_id = ${patient_id}
    GROUP BY patient_appointment_requests.id, patient_appointment_requests.patient_id, patient_appointment_requests.reason
  `.execute(trx)

  return result.rows[0] || null
}

export function scheduledAppointments(
  trx: TrxOrDb,
  patient_id: string,
): Promise<{
  id: string
  reason: string
  provider_id: string
  gcal_event_id: string
  start: Date
  health_worker_name: string
}[]> {
  return trx.selectFrom('appointments')
    .innerJoin(
      'appointment_providers',
      'appointment_providers.appointment_id',
      'appointments.id',
    )
    .innerJoin(
      'employment',
      'employment.id',
      'appointment_providers.provider_id',
    )
    .innerJoin(
      'health_workers',
      'health_workers.id',
      'employment.health_worker_id',
    )
    .select([
      'appointments.id',
      'appointments.reason',
      'appointment_providers.provider_id',
      'appointments.gcal_event_id',
      'appointments.start',
      'health_workers.name as health_worker_name',
    ])
    .where('patient_id', '=', patient_id)
    .execute()
}
