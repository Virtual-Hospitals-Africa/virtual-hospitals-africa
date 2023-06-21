import 'dotenv'
import {
  Kysely,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
} from 'kysely'
import {
  Appointment,
  AppointmentOfferedTime,
  HealthWorker,
  HealthWorkerGoogleToken,
  Patient,
  SqlRow,
  WhatsappMessageReceived,
  WhatsappMessageSent,
} from '../types.ts'
import { PostgreSQLDriver } from 'kysely-deno-postgres'

export type DatabaseSchema = {
  appointments: SqlRow<Appointment>
  appointment_offered_times: SqlRow<AppointmentOfferedTime>
  health_workers: SqlRow<HealthWorker>
  health_worker_google_tokens: SqlRow<HealthWorkerGoogleToken>
  patients: SqlRow<Patient>
  whatsapp_messages_received: SqlRow<WhatsappMessageReceived>
  whatsapp_messages_sent: SqlRow<WhatsappMessageSent>
}

// deno-lint-ignore no-explicit-any
const uri = Deno.env.get('DATABASE_URL') + '?sslmode=require' as any

const db = new Kysely<DatabaseSchema>({
  dialect: {
    createAdapter() {
      return new PostgresAdapter()
    },
    createDriver() {
      return new PostgreSQLDriver(
        uri || {
          hostname: Deno.env.get('DB_HOST')!,
          password: Deno.env.get('DB_PASS')!,
          user: Deno.env.get('DB_USER')!,
          database: Deno.env.get('DB_NAME')!,
        },
        // deno-lint-ignore no-explicit-any
      ) as any
    },
    createIntrospector(db: Kysely<unknown>) {
      return new PostgresIntrospector(db)
    },
    createQueryCompiler() {
      return new PostgresQueryCompiler()
    },
  },
})

export default db
