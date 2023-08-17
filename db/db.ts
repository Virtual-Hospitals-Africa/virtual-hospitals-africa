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
  AppointmentHealthWorkerAttendee,
  AppointmentMedia,
  Country,
  Districts,
  Employee,
  Facility,
  HealthWorker,
  HealthWorkerGoogleToken,
  HealthWorkerInvitee,
  NurseRegistrationDetails,
  Patient,
  PatientAppointmentOfferedTime,
  PatientAppointmentRequest,
  PatientAppointmentRequestMedia,
  PatientMedia,
  Provinces,
  ReturnedSqlRow,
  Specialities,
  SqlRow,
  Suburbs,
  Wards,
  WhatsAppMessageReceived,
  WhatsAppMessageSent,
} from '../types.ts'
import { PostgreSQLDriver } from 'kysely-deno-postgres'

export type DatabaseSchema = {
  appointments: SqlRow<Appointment>
  patient_appointment_offered_times: SqlRow<PatientAppointmentOfferedTime>
  patient_appointment_requests: SqlRow<PatientAppointmentRequest>
  appointment_health_worker_attendees: SqlRow<AppointmentHealthWorkerAttendee>
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
  health_worker_invitees: SqlRow<HealthWorkerInvitee>
  media: SqlRow<PatientMedia>
  nurse_registration_details: SqlRow<NurseRegistrationDetails>
  nurse_specialities: SqlRow<Specialities>
  appointment_media: SqlRow<AppointmentMedia>
  patient_appointment_request_media: SqlRow<PatientAppointmentRequestMedia>
  countries: SqlRow<Country>
  provinces: SqlRow<Provinces>
  districts: SqlRow<Districts>
  wards: SqlRow<Wards>
  suburbs: SqlRow<Suburbs>
}

const DATABASE_URL = Deno.env.get('DATABASE_URL') ||
  Deno.env.get('HEROKU_POSTGRESQL_MAUVE_URL')
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
