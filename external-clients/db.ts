import { DatabaseSchema } from './db';
import "dotenv";
import {
  Kysely,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
  sql
} from "kysely";
import {
  Appointment,
  AppointmentOfferedTime,
  Doctor,
  DoctorGoogleToken,
  Patient,
  SqlRow,
  WhatsappMessageReceived,
  WhatsappMessageSent,
} from "../types.ts";
import { PostgreSQLDriver } from "kysely-deno-postgres";

export type DatabaseSchema = {
  appointments: SqlRow<Appointment>;
  appointment_offered_times: SqlRow<AppointmentOfferedTime>;
  doctors: SqlRow<Doctor>;
  doctor_google_tokens: SqlRow<DoctorGoogleToken>;
  patients: SqlRow<Patient>;
  whatsapp_messages_received: SqlRow<WhatsappMessageReceived>;
  whatsapp_messages_sent: SqlRow<WhatsappMessageSent>;
};

// deno-lint-ignore no-explicit-any
const uri = Deno.env.get("DATABASE_URL") + "?sslmode=require" as any;

const db = new Kysely<DatabaseSchema>({
  dialect: {
    createAdapter() {
      return new PostgresAdapter();
    },
    createDriver() {
      return new PostgreSQLDriver(
        uri || {
          hostname: Deno.env.get("DB_HOST")!,
          password: Deno.env.get("DB_PASS")!,
          user: Deno.env.get("DB_USER")!,
          database: Deno.env.get("DB_NAME")!,
        },
        // deno-lint-ignore no-explicit-any
      ) as any;
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

export async function resetDb() {
  await db.deleteFrom("patients").execute();
  await db.deleteFrom("appointments").execute();
  await db.deleteFrom("appointment_offered_times").execute();
  await db.deleteFrom("appointment_offered_times").execute();
  await db.deleteFrom("doctors").execute();
  await db.deleteFrom("doctor_google_tokens").execute();

  await db.deleteFrom("whatsapp_messages_received").execute();
  await db.deleteFrom("whatsapp_messages_sent").execute();
}

export async function change_appointment_offered_time_status(rowId: number) {
  await db.updateTable("appointment_offered_times").set({
    patient_declined: true,
  }).where("id", "=", rowId).execute();
}

export async function createUpdateTimeTrigger(){
  for (const table of DatabaseSchema){
    await sql
    `CREATE OR REPLACE FUNCTION update_updated_at()
    RETURNS TRIGGER AS $$ 
    BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
    END;
    $$
    LANGUAGE plpgsql;
    `.execute(db)
    await sql`
    CREATE TRIGGER update_updated_at_trigger
          BEFORE UPDATE ON ${table}
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at();`.execute(db)
  } 
}

export async function dropUpdateTimeTrigger(){
  for (const table of DatabaseSchema){
    await sql
    `DROP TRIGGER IF EXIST update_updated_at_trigger
    ON ${table}`.execute(db)
  }
}

