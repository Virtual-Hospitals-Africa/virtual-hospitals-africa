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
  Doctor,
  DoctorGoogleToken,
  Patient,
  SqlRow,
  WhatsappMessageReceived,
  WhatsappMessageSent,
} from '../types.ts'
import { PostgreSQLDriver } from 'kysely-deno-postgres'
import { assert } from 'std/_util/asserts.ts'

export type DatabaseSchema = {
  appointments: SqlRow<Appointment>
  appointment_offered_times: SqlRow<AppointmentOfferedTime>
  doctors: SqlRow<Doctor>
  doctor_google_tokens: SqlRow<DoctorGoogleToken>
  patients: SqlRow<Patient>
  whatsapp_messages_received: SqlRow<WhatsappMessageReceived>
  whatsapp_messages_sent: SqlRow<WhatsappMessageSent>
}

const DATABASE_URL = Deno.env.get('DATABASE_URL')
assert(DATABASE_URL)

const uri = DATABASE_URL.includes('localhost') ? DATABASE_URL : `${DATABASE_URL}?sslmode=require`

const db = new Kysely<DatabaseSchema>({
  dialect: {
    createAdapter() {
      return new PostgresAdapter()
    },
    createDriver() {
      // deno-lint-ignore no-explicit-any
      return new PostgreSQLDriver(uri as any) as any
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
