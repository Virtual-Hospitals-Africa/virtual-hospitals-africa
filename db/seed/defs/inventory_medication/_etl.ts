import { TrxOrDb } from '../../../../types.ts'
import { insertMedications } from './insert.ts'
import { performLookups } from './lookup.ts'
import { seedDataFromJSONSouthAfrica } from './south_africa.ts'
import { seedDataFromJSONZimbabwe } from './zimbabwe.ts'

export async function addMedicationSeedDataFromJSON(trx: TrxOrDb) {
  console.log('Parsing Zimbabwe medications...')
  const zw_medications = await seedDataFromJSONZimbabwe()
  console.log(`  Parsed ${zw_medications.length} Zimbabwe medications`)

  console.log('Parsing South Africa medications...')
  const za_medications = await seedDataFromJSONSouthAfrica()
  console.log(`  Parsed ${za_medications.length} South Africa medications`)

  const medications = [...zw_medications, ...za_medications]

  return insertMedications(
    trx,
    await performLookups(trx, medications, {
      write_failure_files: true,
    }),
  )
}
