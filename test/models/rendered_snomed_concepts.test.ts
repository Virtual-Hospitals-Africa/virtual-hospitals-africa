import { describe, it } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { rendered_snomed_concepts } from '../../db/models/rendered_snomed_concepts.ts'
import { logReadableJson } from '../../util/humanReadableJson.ts'
import pick from '../../util/pick.ts'

describe('db/models/rendered_snomed_concepts.ts', () => {
  it('x', async () => {
    const x = await rendered_snomed_concepts.findAll(db, {
      category: 'administration method',
    })

    logReadableJson(x.map(pick(['id', 'name'])))
  })
})
