import { DeleteResult, sql } from "kysely";
import db from "../db.ts";
import {
  Appointment,
  AppointmentOfferedTime,
  FullScheduledAppointment,
  // InsertSqlRow,
  Maybe,
  ReturnedSqlRow,
} from "../types.ts";

// TODO: get the doctor_name too
export async function addOfferedTime(
  opts: { appointment_id: number; doctor_id: number; start: string },
): Promise<ReturnedSqlRow<AppointmentOfferedTime & { doctor_name: string }>> {
  const result = await sql<
    ReturnedSqlRow<AppointmentOfferedTime & { doctor_name: string }>
  >`
    WITH inserted_offered_time as (
      INSERT INTO appointment_offered_times(appointment_id, doctor_id, start)
          VALUES (${opts.appointment_id}, ${opts.doctor_id}, ${opts.start})
        RETURNING *
    )

    SELECT inserted_offered_time.*,
           doctors.name as doctor_name
      FROM inserted_offered_time
      JOIN doctors ON inserted_offered_time.doctor_id = doctors.id
  `.execute(db);

  return result.rows[0];
}

export function get(
  query: { patient_id: number },
): Promise<{
  id: number;
  created_at: Date;
  updated_at: Date;
  patient_id: number;
  reason: Maybe<string>;
}[]> {
  return db
    .selectFrom("appointments")
    .selectAll()
    .where("patient_id", "=", query.patient_id)
    .execute();
}

export function clear(): Promise<DeleteResult[]> {
  return db.deleteFrom("appointments").execute();
}

export function createNew(opts: { patient_id: number }): Promise<{
  id: number;
  created_at: Date;
  updated_at: Date;
  patient_id: number;
  reason: Maybe<string>;
}[]> {
  return db
    .insertInto("appointments")
    .values({ patient_id: opts.patient_id })
    .returningAll()
    .execute();
}

export async function upsert(info: Appointment): Promise<{
  id: number;
  patient_id: number;
  reason: Maybe<string>;
  created_at: Date;
  updated_at: Date;
}> {
  const [appointment] = await db
    .insertInto("appointments")
    .values(info)
    .onConflict((oc) => oc.column("id").doUpdateSet(info))
    .returningAll()
    .execute();

  return appointment;
}

// TODO: just update the offered time
export async function schedule(
  opts: {
    appointment_offered_time_id: number;
    scheduled_gcal_event_id: string;
  },
): Promise<FullScheduledAppointment> {
  const result = await sql<FullScheduledAppointment>`
    WITH appointment_offered_time_scheduled as (
         UPDATE appointment_offered_times
            SET scheduled_gcal_event_id = ${opts.scheduled_gcal_event_id}
          WHERE id = ${opts.appointment_offered_time_id}
      RETURNING id, appointment_id, doctor_id, start
    )

    SELECT appointment_offered_time_scheduled.id as id,
           appointments.reason as reason,
           doctors.name as doctor_name,
           appointment_offered_time_scheduled.start
      FROM appointment_offered_time_scheduled
      JOIN appointments ON appointment_offered_time_scheduled.appointment_id = appointments.id
      JOIN patients ON appointments.patient_id = patients.id
      JOIN doctors ON appointment_offered_time_scheduled.doctor_id = doctors.id
    `.execute(db);

  return result.rows[0];
}
