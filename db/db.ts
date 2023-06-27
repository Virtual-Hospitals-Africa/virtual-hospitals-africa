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
  Employee,
  HealthWorker,
  HealthWorkerGoogleToken,
  Patient,
  SqlRow,
  WhatsAppMessageReceived,
  WhatsAppMessageSent,
} from '../types.ts'
import { PostgreSQLDriver } from 'kysely-deno-postgres'

export type DatabaseSchema = {
  appointments: SqlRow<Appointment>
  appointment_offered_times: SqlRow<AppointmentOfferedTime>
  health_workers: SqlRow<HealthWorker>
  health_worker_google_tokens: SqlRow<HealthWorkerGoogleToken>
  patients: SqlRow<Patient>
  employment: SqlRow<Employee>
  whatsapp_messages_received: SqlRow<WhatsAppMessageReceived>
  whatsapp_messages_sent: SqlRow<WhatsAppMessageSent>
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
