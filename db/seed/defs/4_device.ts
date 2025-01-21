import { TrxOrDb } from '../../../types.ts'
import parseJSON from '../../../util/parseJSON.ts'
import { assert } from 'std/assert/assert.ts'
import { create } from '../create.ts'
import * as inParallel from '../../../util/inParallel.ts'

export default create(
  ['devices', 'device_capabilities'],
  seedDataFromJSON,
)

async function seedDataFromJSON(trx: TrxOrDb) {
  const tests = await trx
    .selectFrom('examinations')
    .where('encounter_step', '=', 'diagnostic_tests')
    .select('identifier')
    .execute()

  const devices: {
    name: string
    manufacturer: string
    capabilities: { name: string }[]
  }[] = await parseJSON('./db/resources/devices.json')

  await inParallel.forEach(devices, async (device) => {
    const { id } = await trx.insertInto('devices')
      .values({
        name: device.name,
        manufacturer: device.manufacturer,
      })
      .returning('id')
      .executeTakeFirstOrThrow()

    const capabilities = device.capabilities.map((c) => c.name)
    if (!capabilities.length) return
    const device_capabilities = capabilities.map((
      diagnostic_test_identifier,
    ) => (
      assert(
        tests.some((test) => test.identifier === diagnostic_test_identifier),
        `No diagnostic test named ${diagnostic_test_identifier}`,
      ), {
        device_id: id,
        diagnostic_test: diagnostic_test_identifier,
      }
    ))
    await trx.insertInto('device_capabilities')
      .values(device_capabilities)
      .execute()
  })
}
