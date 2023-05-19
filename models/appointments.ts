import { DeleteResult, sql } from "kysely";
import db from "../external-clients/db.ts";
import {
  Appointment,
  AppointmentOfferedTime,
  FullScheduledAppointment,
  ReturnedSqlRow,
  TrxOrDb,
} from "../types.ts";

export async function addOfferedTime(
  trx: TrxOrDb,
  opts: { appointment_id: number; doctor_id: number; start: string }
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
  `.execute(trx);

  return result.rows[0];
}

export async function newOfferedTime(
  trx: TrxOrDb,
  opts: { appointment_id: number; doctor_id: number; start: string }
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
      JOIN appointment_offered_times.appointment_id = ${opts.appointment_id}
  `.execute(trx);

  return result.rows[0];
}

export async function declineOfferedTime(trx: TrxOrDb, opts: { id: number }) {
  const writeResult = await trx
    .updateTable("appointment_offered_times")
    .set({ patient_declined: true })
    .where("id", "=", opts.id)
    .execute();

  return writeResult;
}

export async function getPatientDeclinedTimes(
  trx: TrxOrDb,
  opts: { appointment_id: number }
): Promise<string[]> {
  const readResult = await trx
    .selectFrom("appointment_offered_times")
    .where("appointment_id", "=", opts.appointment_id)
    .where("patient_declined", "=", true)
    .select("start")
    .execute();
  console.log("Read result for get declined time.");
  console.log(readResult);
  const declinedTimes = [];

  for (const { start } of readResult) {
    declinedTimes.push(start);
  }

  return declinedTimes;
}

export async function getAppointmentIdFromEventId(
  trx: TrxOrDb,
  opts: { event_id: string }
): Promise<number | null> {
  const readResult = await trx
    .selectFrom("appointment_offered_times")
    .where("scheduled_gcal_event_id", "=", opts.event_id)
    .select("appointment_id")
    .execute();
  console.log(opts.event_id);
  console.log("Retrieve appointment_id from event_id");
  console.log(readResult);
  return readResult[0] ? readResult[0].appointment_id : null;
}

export async function getAppointmentStatusFromId(
  trx: TrxOrDb,
  opts: { appointment_id: number }
): Promise<string> {
  const readResult = await trx
    .selectFrom("appointments")
    .where("id", "=", opts.appointment_id)
    .select("status")
    .execute();
  console.log("Retrieve appointment status from id");
  console.log(readResult);
  const { status } = readResult[0];
  return status ? status : "pending";
}

export async function getAppointmentStatusFromEventId(
  trx: TrxOrDb,
  opts: { event_id: string }
): Promise<string | null> {
  console.log("test1", opts);
  const appointment_id = await getAppointmentIdFromEventId(trx, opts);
  if (appointment_id) {
    const status = await getAppointmentStatusFromId(trx, { appointment_id });
    return status ? status : "pending";
  } else {
    return null;
  }
}

// export function get(
//   query: { patient_id: number },
// ): Promise<ReturnedSqlRow<Appointment>[]> {
//   return db
//     .selectFrom("appointments")
//     .selectAll()
//     .where("patient_id", "=", query.patient_id)
//     .execute();
// }

export function clear(): Promise<DeleteResult[]> {
  return db.deleteFrom("appointments").execute();
}

export function createNew(
  trx: TrxOrDb,
  opts: { patient_id: number }
): Promise<ReturnedSqlRow<Appointment>[]> {
  return trx
    .insertInto("appointments")
    .values({ patient_id: opts.patient_id })
    .returningAll()
    .execute();
}

export async function upsert(
  trx: TrxOrDb,
  info: Appointment
): Promise<ReturnedSqlRow<Appointment>> {
  const [appointment] = await trx
    .insertInto("appointments")
    .values(info)
    .onConflict((oc) => oc.column("id").doUpdateSet(info))
    .returningAll()
    .execute();

  return appointment;
}

// TODO: just update the offered time
export async function schedule(
  trx: TrxOrDb,
  opts: {
    appointment_offered_time_id: number;
    scheduled_gcal_event_id: string;
  }
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
    `.execute(trx);

  return result.rows[0];
}
