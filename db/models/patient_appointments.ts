import { PatientSchedulingAppointmentRequest, TrxOrDb, TrxOrDbOrQueryCreator } from '../../types.ts'
import { jsonArrayFrom } from '../helpers.ts'

export const patient_appointments = {
  schedulingAppointmentRequest(
    trx: TrxOrDb,
    patient_id: string,
  ): Promise<undefined | PatientSchedulingAppointmentRequest> {
    return trx.selectFrom('patient_appointment_requests')
      .select((eb) => [
        'patient_appointment_requests.id as patient_appointment_request_id',
        eb.ref('patient_appointment_requests.reason').$notNull().as('reason'),
        jsonArrayFrom(
          eb.selectFrom('patient_appointment_offered_times')
            .innerJoin('employment', 'employment.id', 'patient_appointment_offered_times.employee_id')
            .innerJoin('health_workers', 'health_workers.id', 'employment.health_worker_id')
            .select([
              'patient_appointment_offered_times.id',
              'patient_appointment_offered_times.patient_appointment_request_id',
              'patient_appointment_offered_times.employee_id',
              'patient_appointment_offered_times.start',
              'patient_appointment_offered_times.end',
              'patient_appointment_offered_times.duration_minutes',
              'patient_appointment_offered_times.declined',
              'health_workers.name as health_worker_name',
              'employment.role',
              'employment.is_admin',
            ])
            .whereRef('patient_appointment_offered_times.patient_appointment_request_id', '=', 'patient_appointment_requests.id')
            .orderBy('patient_appointment_offered_times.start', 'asc'),
        ).as('offered_times'),
      ])
      .where('patient_appointment_requests.patient_id', '=', patient_id)
      .executeTakeFirst()
  },
  scheduledAppointments(
    trx: TrxOrDbOrQueryCreator,
    patient_id: string,
  ): Promise<{
    id: string
    reason: string
    employee_id: string
    gcal_event_id: string
    start: Date
    health_worker_name: string
  }[]> {
    return trx.selectFrom('appointments')
      .innerJoin(
        'appointment_employees',
        'appointment_employees.appointment_id',
        'appointments.id',
      )
      .innerJoin(
        'employment',
        'employment.id',
        'appointment_employees.employee_id',
      )
      .innerJoin(
        'health_workers',
        'health_workers.id',
        'employment.health_worker_id',
      )
      .select([
        'appointments.id',
        'appointments.reason',
        'appointment_employees.employee_id',
        'appointments.gcal_event_id',
        'appointments.start',
        'health_workers.name as health_worker_name',
      ])
      .where('patient_id', '=', patient_id)
      .execute()
  },
}
