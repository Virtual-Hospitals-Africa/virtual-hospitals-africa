import { InsertResult, sql, UpdateResult } from "kysely";
import db from "../db.ts";
import {
  ConversationState,
  ReturnedSqlRow,
  UnhandledPatientMessage,
} from "../types.ts";

export function updateReadStatus(
  opts: { whatsapp_id: string; read_status: string },
): Promise<UpdateResult[]> {
  return db
    .updateTable("whatsapp_messages_sent")
    .set({ read_status: opts.read_status })
    .where("whatsapp_id", "=", opts.whatsapp_id)
    .execute();
}

export async function insertMessageReceived(
  opts: { patient_phone_number: string; whatsapp_id: string; body: string },
): Promise<
  ReturnedSqlRow<{
    patient_id: number;
    whatsapp_id: string;
    body: string;
    started_responding_at: Date | null | undefined;
    conversation_state: ConversationState | "initial_message";
  }>
> {
  try {
    const [inserted] = await db.transaction().execute(async (trx) => {
      console.log("IN trx");
      const [patient] = await trx
        .insertInto("patients")
        .values({ phone_number: opts.patient_phone_number })
        .onConflict((oc) => oc.column("phone_number").doNothing())
        .returningAll()
        .execute();

      console.log("patient", patient);
      return trx
        .insertInto("whatsapp_messages_received")
        .values({
          patient_id: patient.id,
          whatsapp_id: opts.whatsapp_id,
          body: opts.body,
          conversation_state: patient.conversation_state || "initial_message",
        })
        .onConflict((oc) => oc.column("whatsapp_id").doNothing())
        .returningAll()
        .execute();
    });
    return inserted;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export function insertMessageSent(
  opts: {
    patient_id: number;
    responding_to_id: number;
    whatsapp_id: string;
    body: string;
  },
): Promise<InsertResult[]> {
  return db.insertInto("whatsapp_messages_sent").values({
    ...opts,
    read_status: "sent",
  }).execute();
}

export async function getUnhandledPatientMessages(): Promise<
  UnhandledPatientMessage[]
> {
  const result = await sql<UnhandledPatientMessage>`
    WITH responding_to_messages as (
           UPDATE whatsapp_messages_received
              SET started_responding_at = now()
            WHERE started_responding_at is null
        RETURNING id
    ),

    aot_pre as (
         SELECT appointment_offered_times.*,
                doctors.name as doctor_name,
                appointment_scheduled.id is not null as scheduled
           FROM appointment_offered_times
           JOIN doctors ON appointment_offered_times.doctor_id = doctors.id
      LEFT JOIN appointment_scheduled ON appointment_offered_times.id = appointment_scheduled.appointment_offered_time_id
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
  `.execute(db);

  return result.rows;
}
