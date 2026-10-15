/**
 * Link a health worker (doctor) to an insurance network for testing.
 *
 * This script creates test insurance network data and links it to an existing
 * health worker to enable testing of patient-doctor insurance matching features.
 *
 * PREREQUISITE: Health worker must exist in the database.
 * The script will link the specified health_worker_id to a new insurance network.
 *
 * Usage:
 *   deno task run:trusted ./scripts/dev-environment/insert_south_africa_insurance_network.ts
 *
 * What it creates:
 *   - Address record (1234 Main Road, Wynberg, Cape Town, South Africa)
 *   - Insurance network record (VHA Test Health Insurance South Africa)
 *   - Insurance network membership (links doctor to network for 11 years)
 *
 * Output:
 *   Displays insurance network ID and membership details for reference.
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

async function insertInsuranceNetwork() {
  try {
    // Check if test insurance network already exists
    const existingNetwork = await db.selectFrom('insurance_network')
      .select('id')
      .where('business_name', '=', 'VHA Test Health Insurance South Africa')
      .executeTakeFirst()

    if (existingNetwork) {
      console.warn('')
      console.warn('⚠️  WARNING: Test insurance network "VHA Test Health Insurance South Africa" already exists!')
      console.warn(`   Insurance Network ID: ${existingNetwork.id}`)
      console.warn('')
      console.warn('   To avoid duplicate data, this script will not run.')
      console.warn('   If you want to create another insurance network, edit the script to use a different business name.')
      console.warn('')
      await db.destroy()
      Deno.exit(0)
    }

    const health_worker_id = '707d7d79-1561-469d-8ecd-dd1030ed9f09' // Dr. Henry
    const address_id = generateUUID()
    const insurance_network_id = generateUUID()

    console.log('Creating insurance network test data...')

    // Insert address
    await db.insertInto('addresses')
      .values({
        id: address_id,
        formatted: '1234 Main Road, Wynberg, Cape Town, South Africa',
        route: '1234 Main Road',
        locality: 'Cape Town',
        administrative_area_level_1: 'Western Cape',
        postal_code: '7700',
        country: 'ZA',
      })
      .execute()

    console.log(`✓ Address created: ${address_id}`)

    // Insert insurance network
    await db.insertInto('insurance_network')
      .values({
        id: insurance_network_id,
        business_name: 'VHA Test Health Insurance South Africa',
        country: 'ZA',
        address_id,
        telephone: '+27 12 123 7890',
      })
      .execute()

    console.log(`✓ Insurance network created: ${insurance_network_id}`)

    // Calculate dates
    const today = new Date()
    const member_since = new Date(today)
    member_since.setFullYear(member_since.getFullYear() - 1)

    const member_until = new Date(today)
    member_until.setFullYear(member_until.getFullYear() + 10)

    // Insert insurance network membership
    await db.insertInto('insurance_network_membership')
      .values({
        id: generateUUID(),
        insurance_network_id,
        health_worker_id,
        member_since: member_since.toISOString().split('T')[0],
        member_until: member_until.toISOString().split('T')[0],
        inactive_reason: null, // null = active membership
      })
      .execute()

    console.log('✓ Insurance network membership created')

    console.log('')
    console.log('✅ Insurance network linked to doctor successfully!')
    console.log('')
    console.log('Insurance Network Details:')
    console.log(`  ID: ${insurance_network_id}`)
    console.log(`  Business Name: VHA Test Health Insurance South Africa`)
    console.log(`  Country: South Africa`)
    console.log(`  Phone: +27 12 123 7890`)
    console.log(`  Address: 1234 Main Road, Cape Town, South Africa`)
    console.log('')
    console.log('Membership Details:')
    console.log(`  Health Worker ID: ${health_worker_id}`)
    console.log(`  Member Since: ${member_since.toISOString().split('T')[0]}`)
    console.log(`  Member Until: ${member_until.toISOString().split('T')[0]}`)
    console.log(`  Status: Active (no inactivity reason)`)

    await db.destroy()
    Deno.exit(0)
  } catch (error) {
    console.error('❌ Error creating insurance network:', error)
    await db.destroy()
    Deno.exit(1)
  }
}

insertInsuranceNetwork()
