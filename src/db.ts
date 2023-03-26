import { Kysely } from "kysely";
import { PostgresDialect } from "https://deno.land/x/kysely_postgres@v0.0.3/mod.ts";
import {
  Appointment,
  AppointmentOfferedTime,
  Doctor,
  DoctorGoogleToken,
  Patient,
  WhatsappMessageReceived,
  WhatsappMessageSent,
} from "./types.ts";

export type DatabaseSchema = {
  appointments: Appointment;
  appointment_offered_times: AppointmentOfferedTime;
  doctors: Doctor;
  doctor_google_tokens: DoctorGoogleToken;
  patients: Patient;
  whatsapp_messages_received: WhatsappMessageReceived;
  whatsapp_messages_sent: WhatsappMessageSent;
};

export default new Kysely<DatabaseSchema>({
  dialect: new PostgresDialect({
    hostname: Deno.env.get("DB_HOST")!,
    password: Deno.env.get("DB_PASS")!,
    user: Deno.env.get("DB_USER")!,
    database: Deno.env.get("DB_NAME")!,
    tls: {
      enabled: true,
      enforce: true,
    },
  }),
});
