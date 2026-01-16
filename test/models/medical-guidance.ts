import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { afterAll } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { SYMPTOMS_TABLE_OF_CONTENTS } from '../../shared/pack-adult.ts'
import { snomed_model } from '../../db/models/snomed.ts'
import { logReadableJson } from '../../util/humanReadableJson.ts'

describeParallel('db/models/medical-guidance.ts', () => {
  afterAll(() => db.destroy())
  itParallel('can exclude identically named concepts if searching ', async () => {
    const symptoms = SYMPTOMS_TABLE_OF_CONTENTS.map((s) => s[0])

    snomed_model.verbose = true
    const results = await snomed_model.search(db, {
      search: 'collapse',
      categories: [
        'disorder' as const,
        'finding' as const,
        'morphologic abnormality' as const,
      ],
      preferred_category: 'finding',
    })

    console.log(results)

    // const x: any[] = []
    // for (const symptom of symptoms) {
    //   const { results } = await snomed_model.search(db, {
    //     search: symptom,
    //     categories: [
    //       'disorder' as const,
    //       'finding' as const,
    //       'morphologic abnormality' as const,
    //     ],
    //   })

    //   x.push({ symptom, results })
    // }

    // logReadableJson(x, '/Users/willweiss/Desktop/uiop.json')
  })
})
