/**
 * Auto-generate a test patient for local development without filling out the registration form.
 *
 * PREREQUISITE: You must have at least one nurse registered in the database first.
 * The script will query for an existing nurse employment record to link with the patient.
 * If no nurse exists, the script will fail with a "No waiting room found" error.
 *
 * Usage:
 *   deno task run:trusted ./scripts/dev-environment/insert_south_africa_patient.ts
 *
 * What it creates:
 *   - Patient record (John Smith, DOB: 01/01/1990, South Africa, no insurance)
 *   - Patient encounter (ready for triage)
 *   - Patient workflows (triage & consultation)
 *   - Patient presence (in waiting room)
 *   - Random South African phone number (+27 XX XXX XXXX format)
 *
 * Output:
 *   Displays patient ID and encounter ID for reference in testing.
 */

import '@std/dotenv/load'
import { Pool } from 'pg'
import Cursor from 'pg-cursor'
import { Kysely, PostgresAdapter, PostgresDriver, PostgresIntrospector, PostgresQueryCompiler } from 'kysely'
import type { DB } from '../../db.d.ts'
import generateUUID from '../../util/uuid.ts'

const DATABASE_URL = Deno.env.get('DATABASE_URL')
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

function parseConnectionString(connectionString: string) {
  const regex = /^postgres:\/\/(?:(.*?)(?::(.*?))?@)?(.*):(\d+)\/(\w*)?(\?sslmode=require)?$/
  const match = connectionString.match(regex)

  if (!match) throw new Error('Invalid postgres connection string format.')

  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4], 10),
    database: match[5],
    ssl: match[6] ? { require: true, rejectUnauthorized: false } : undefined,
  }
}

const opts = parseConnectionString(DATABASE_URL)
const pool = new Pool(opts)

const db = new Kysely<DB>({
  dialect: {
    createAdapter() {
      return new PostgresAdapter()
    },
    createDriver() {
      return new PostgresDriver({
        pool,
        cursor: Cursor,
      })
    },
    createIntrospector(db: Kysely<unknown>) {
      return new PostgresIntrospector(db)
    },
    createQueryCompiler() {
      return new PostgresQueryCompiler()
    },
  },
})

function generateSAPhoneNumber(): string {
  // Generate random South African phone number: +27 XX XXX XXXX
  const areaCode = Math.floor(Math.random() * 90) + 10 // 10-99
  const middleDigits = Math.floor(Math.random() * 900) + 100 // 100-999
  const lastDigits = Math.floor(Math.random() * 9000) + 1000 // 1000-9999
  return `+27 ${areaCode} ${middleDigits} ${lastDigits}`
}

async function insertTestPatient() {
  try {
    // Check if test patient already exists
    const existingPatient = await db.selectFrom('patients')
      .select('id')
      .where('first_names', '=', 'John')
      .where('surname', '=', 'Smith')
      .where('date_of_birth', '=', new Date('1990-01-01'))
      .executeTakeFirst()

    if (existingPatient) {
      console.warn('')
      console.warn('⚠️  WARNING: Test patient "John Smith" already exists in the database!')
      console.warn(`   Patient ID: ${existingPatient.id}`)
      console.warn('')
      console.warn('   To avoid duplicate data, this script will not run.')
      console.warn('   If you want to create another test patient, edit the script to use different name/DOB.')
      console.warn('')
      await db.destroy()
      Deno.exit(0)
    }

    const patient_id = generateUUID()
    const patient_encounter_id = generateUUID()
    const organization_id = '00000000-0000-1000-8000-000000000001'
    const phone_number = generateSAPhoneNumber()

    console.log('Creating test patient...')

    // Insert patient
    await db.insertInto('patients')
      .values({
        id: patient_id,
        first_names: 'John',
        surname: 'Smith',
        name: 'John Smith',
        preferred_name: 'John',
        date_of_birth: new Date('1990-01-01'),
        sex: 'male',
        gender: 'male',
        country: 'ZA',
        phone_number,
        preferred_language_code_iso_639_2_b: 'eng',
        completed_registration: true,
      })
      .execute()

    console.log(`✓ Patient created: ${patient_id}`)

    // Insert patient encounter
    // Location is Cape Town, South Africa coordinates
    await db.insertInto('patient_encounters')
      .values({
        id: patient_encounter_id,
        patient_id,
        organization_id,
        reason: 'seeking treatment',
        location: 'POINT(-34.0522 18.9289)',
      })
      .execute()

    console.log(`✓ Encounter created: ${patient_encounter_id}`)

    // Get an existing employment record (nurse) from the organization
    const nurse = await db.selectFrom('employment')
      .select('id')
      .where('organization_id', '=', organization_id)
      .limit(1)
      .executeTakeFirst()

    // Get the waiting room for this organization
    const waitingRoom = await db.selectFrom('organization_rooms')
      .select('id')
      .where('organization_id', '=', organization_id)
      .where('name', '=', 'Waiting room')
      .limit(1)
      .executeTakeFirst()

    if (!waitingRoom) {
      throw new Error(`No waiting room found for organization ${organization_id}`)
    }

    // Insert patient registration record
    await db.insertInto('patient_registration')
      .values({
        id: generateUUID(),
        patient_id,
        organization_id,
        being_taken_by: nurse?.id || null, // Use existing nurse or null
      })
      .execute()

    console.log('✓ Patient registration record created')

    // Create patient workflows (triage and consultation)
    const triage_workflow_id = generateUUID()
    const consultation_workflow_id = generateUUID()

    await db.insertInto('patient_workflows')
      .values([
        {
          id: triage_workflow_id,
          patient_encounter_id,
          workflow: 'triage',
        },
        {
          id: consultation_workflow_id,
          patient_encounter_id,
          workflow: 'consultation',
        },
      ])
      .execute()

    console.log('✓ Patient workflows created')

    // Insert patient presence (workflow state)
    await db.insertInto('patient_presence')
      .values({
        id: patient_id,
        patient_encounter_id,
        organization_id,
        current_workflow: null,
        next_workflow: 'triage',
        organization_room_id: waitingRoom.id,
        department_name: 'Waiting room',
      })
      .execute()

    console.log('✓ Patient presence created (ready for triage)')

    console.log('')
    console.log('✅ Test patient created successfully!')
    console.log('')
    console.log('Patient Details:')
    console.log(`  ID: ${patient_id}`)
    console.log(`  Name: John Smith`)
    console.log(`  DOB: 01/01/1990`)
    console.log(`  Sex: Male`)
    console.log(`  Country: South Africa`)
    console.log(`  Phone: ${phone_number}`)
    console.log(`  Insurance: None`)
    console.log(`  Status: Ready for Triage`)
    console.log('')
    console.log(`Encounter ID: ${patient_encounter_id}`)
    console.log(`Organization ID: ${organization_id}`)

    await db.destroy()
    Deno.exit(0)
  } catch (error) {
    console.error('❌ Error creating patient:', error)
    await db.destroy()
    Deno.exit(1)
  }
}

insertTestPatient()
