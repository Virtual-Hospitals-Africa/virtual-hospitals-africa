import { Kysely } from 'kysely'
import parseJSON from '../../util/parseJSON.ts'
import * as inParallel from '../../util/inParallel.ts'
import { createSeedMigration } from '../seedMigration.ts'
import { assert } from 'std/assert/assert.ts'

export default createSeedMigration(
  ['diagnostic_tests', 'devices', 'device_capabilities'],
  seedDataFromJSON,
)

// deno-lint-ignore no-explicit-any
async function seedDataFromJSON(db: Kysely<any>) {
  const tests: { name: string }[] = await parseJSON(
    './db/resources/diagnostic_tests.json',
  )
  const devices: {
    name: string
    manufacturer: string
    capabilities: { name: string }[]
  }[] = await parseJSON('./db/resources/devices.json')

  await db
    .insertInto('diagnostic_tests')
    .values(tests)
    .returningAll()
    .execute()

  await inParallel.forEach(devices, async (device) => {
    const { id } = await db.insertInto('devices')
      .values({
        name: device.name,
        manufacturer: device.manufacturer,
      })
      .returning('id')
      .executeTakeFirstOrThrow()

    const capabilities = device.capabilities.map((c) => c.name)
    if (!capabilities.length) return
    const device_capabilities = capabilities.map((name) => (
      assert(
        tests.some((test) => test.name === name),
        `No diagnostic test named ${name}`,
      ), {
        device_id: id,
        diagnostic_test: name,
      }
    ))
    await db.insertInto('device_capabilities')
      .values(device_capabilities)
      .execute()
  })
}
