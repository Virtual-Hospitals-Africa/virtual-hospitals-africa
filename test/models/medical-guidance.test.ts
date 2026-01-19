// import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
// import { afterAll } from 'std/testing/bdd.ts'
// import db from '../../db/db.ts'

// import { snomed_model } from '../../db/models/snomed.ts'
// import { logReadableJson } from '../../util/humanReadableJson.ts'
// import { ADULT_PAC_SYMPTOMS_TABLE_OF_CONTENTS_TO_SNOMED } from '../../shared/adult_pac_table_of_contents_to_snomed.ts'

// import entries from '../../util/entries.ts'
// import { ADULT_PAC_SYMPTOMS_TABLE_OF_CONTENTS_BY_FINDING_SITE_TO_SNOMED } from '../../shared/adult_pac_table_of_contents_to_snomed.ts'

// describeParallel('db/models/medical-guidance.ts', () => {
//   afterAll(() => db.destroy())

//   itParallel.skip('x', async () => {
//     const finding_sites_to_search: string[] = []
//     for (const [key, value] of entries(ADULT_PAC_SYMPTOMS_TABLE_OF_CONTENTS_TO_SNOMED)) {
//       if (value === 'site') {
//         finding_sites_to_search.push(
//           key.replace(' symptoms', ''),
//         )
//       }
//     }
//     const foo = {}

//     for (const finding_site of finding_sites_to_search) {
//       const { results } = await snomed_model.search(db, {
//         search: finding_site,
//         categories: [
//           'body structure' as const,
//         ],
//       })

//       foo[finding_site] = results
//     }

//     // const y = combineAll(ADULT_PAC_SYMPTOMS_TABLE_OF_CONTENTS_TO_SNOMED)
//     logReadableJson(foo, '/Users/willweiss/Desktop/mmm.json')
//   })

//   itParallel.skip('y', () => {
//     const foo = {}

//     for (const finding_site in ADULT_PAC_SYMPTOMS_TABLE_OF_CONTENTS_BY_FINDING_SITE_TO_SNOMED) {
//       foo[finding_site] = ADULT_PAC_SYMPTOMS_TABLE_OF_CONTENTS_BY_FINDING_SITE_TO_SNOMED[finding_site][0]
//     }

//     logReadableJson(foo, '/Users/willweiss/Desktop/nnn.json')
//   })

//   itParallel('z', () => {
//     for (const finding_site in ADULT_PAC_SYMPTOMS_TABLE_OF_CONTENTS_BY_FINDING_SITE_TO_SNOMED) {
//       const { finding_site_s_expression, ...rest } = ADULT_PAC_SYMPTOMS_TABLE_OF_CONTENTS_BY_FINDING_SITE_TO_SNOMED[finding_site]

//       ADULT_PAC_SYMPTOMS_TABLE_OF_CONTENTS_TO_SNOMED[finding_site] = [{
//         'type': 'by_finding_site',
//         'clinical_finding_s_expression': `(clinical_finding ${finding_site_s_expression})`,
//         ...rest,
//       }]
//     }

//     logReadableJson(ADULT_PAC_SYMPTOMS_TABLE_OF_CONTENTS_TO_SNOMED, '/Users/willweiss/Desktop/poo.json')
//   })
// })
