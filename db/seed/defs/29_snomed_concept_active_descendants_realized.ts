import { sql } from 'kysely'
import { define } from '../define.ts'
import { forEach } from '../../../util/inParallel.ts'

export default define(
  ['snomed_concept_active_descendants_realized'],
  async (trx) => {
    const concepts = trx.selectFrom('snomed_concept')
      .where('snomed_concept.active', '=', true)
      .select('id')
      .stream()

    let i = 0
    const total = 528509
    await forEach(concepts, async (concept) => {
      i++
      if (i % 100 === 0 || i === 1 || i === total) {
        console.log(`  Populating ${i}/${total}"`)
      }
      await sql`
        INSERT INTO snomed_concept_active_descendants_realized (ancestor_id, descendant_id)
        SELECT ${concept.id} AS ancestor_id, ad.id AS descendant_id
        FROM active_descendants(${concept.id}) ad
      `.execute(trx)
    })
  },
)
