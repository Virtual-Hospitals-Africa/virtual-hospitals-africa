// import { TrxOrDb } from '../../../../types.ts'
// import { insertRecommendedDoses } from './insert.ts'
// import { performEMLLookups } from './lookup.ts'
// import { parseEMLData } from './south_africa.ts'

// export async function addRecommendedDoseSeedDataFromJSON(trx: TrxOrDb) {
//   console.log('Parsing South Africa EML data...')
//   const { parsed, failed } = parseEMLData()
//   console.log(`  Parsed ${parsed.length} recommended doses (${failed.length} failed)`)

//   console.log('Performing SNOMED lookups...')
//   const resolved = await performEMLLookups(trx, parsed)
//   console.log(`  Resolved ${resolved.length} recommended doses`)

//   return insertRecommendedDoses(trx, resolved)
// }
