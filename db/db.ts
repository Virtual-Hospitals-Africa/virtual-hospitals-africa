import 'dotenv'
import { assert } from 'std/testing/asserts.ts'
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
  Facility,
  HealthWorker,
  HealthWorkerGoogleToken,
  Patient,
  ReturnedSqlRow,
  SqlRow,
  WhatsAppMessageReceived,
  WhatsAppMessageSent,
  health_worker_invitees,
  Invitation
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
  facilities: SqlRow<Facility>
  patient_nearest_facilities: {
    patient_id: number
    nearest_facilities: ReturnedSqlRow<Facility>[]
  }
  health_worker_invitees: SqlRow<health_worker_invitees>
  invites: SqlRow<Invitation>
}

const DATABASE_URL = Deno.env.get('DATABASE_URL')
assert(DATABASE_URL)
// deno-lint-ignore no-explicit-any
const uri: any = DATABASE_URL.includes('localhost')
  ? DATABASE_URL
  : `${DATABASE_URL}?sslmode=require`

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
