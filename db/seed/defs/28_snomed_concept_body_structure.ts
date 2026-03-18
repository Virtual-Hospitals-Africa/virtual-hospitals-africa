import { sql } from 'kysely'
import { define } from '../define.ts'

export default define(
  ['snomed_concept_body_structure'],
  async (trx) => {
    await sql`
      INSERT INTO snomed_concept_body_structure (id, term)
      SELECT sd.concept_id as id, sd.term
      FROM snomed_description sd
      JOIN snomed_inferred_canonical_name_and_category c ON c.id = sd.concept_id
      WHERE c.category = ('body structure')
    `.execute(trx)
  },
)
