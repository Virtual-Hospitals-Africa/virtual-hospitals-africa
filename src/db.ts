import "https://deno.land/x/dotenv@v3.2.2/load.ts";
import {
  Kysely,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
} from "kysely";
import {
  Appointment,
  AppointmentOfferedTime,
  Doctor,
  DoctorGoogleToken,
  Patient,
  WhatsappMessageReceived,
  WhatsappMessageSent,
} from "./types.ts";
import { PostgreSQLDriver } from "https://raw.githubusercontent.com/will-weiss/kysely-deno-postgres/main/mod.ts";

export type DatabaseSchema = {
  appointments: Appointment;
  appointment_offered_times: AppointmentOfferedTime;
  doctors: Doctor;
  doctor_google_tokens: DoctorGoogleToken;
  patients: Patient;
  whatsapp_messages_received: WhatsappMessageReceived;
  whatsapp_messages_sent: WhatsappMessageSent;
};

const db = new Kysely<DatabaseSchema>({
  dialect: {
    createAdapter() {
      return new PostgresAdapter();
    },
    createDriver() {
      return new PostgreSQLDriver({
        hostname: Deno.env.get("DB_HOST")!,
        password: Deno.env.get("DB_PASS")!,
        user: Deno.env.get("DB_USER")!,
        database: Deno.env.get("DB_NAME")!,
      }) as any;
    },
    createIntrospector(db: Kysely<unknown>) {
      return new PostgresIntrospector(db);
    },
    createQueryCompiler() {
      return new PostgresQueryCompiler();
    },
  },
});

export default db;
