import { SnomedCategory } from '../../../db.d.ts'
import { FULLY_SPECIFIED_NAME_TYPE_ID } from '../../../shared/snomed.ts'
import { define } from '../define.ts'
import { sql } from 'kysely'

export default define(
  ['snomed_inferred_canonical_name_and_category'],
  (trx) =>
    trx.insertInto('snomed_inferred_canonical_name_and_category')
      .columns([
        'id',
        'description_id',
        'language_code',
        'name',
        'category',
      ])
      .expression((qb) =>
        qb.selectFrom(
          'snomed_description',
        )
          .innerJoin(
            'snomed_concept',
            'snomed_description.concept_id',
            'snomed_concept.id',
          )
          .where(
            'snomed_description.type_id',
            '=',
            FULLY_SPECIFIED_NAME_TYPE_ID,
          )
          .where('snomed_description.active', '=', true)
          .where('snomed_concept.active', '=', true)
          .select([
            'snomed_description.concept_id as id',
            'snomed_description.id as description_id',
            'snomed_description.language_code',
            // Interpret a term that looks like
            // Family history of diabetes mellitus (situation)
            // as
            // name: "Family history of diabetes mellitus"
            // category: "situation"
            sql<string>`substring(term FROM '^(.*) \\(.*\\)$')`.as('name'),
            sql<
              SnomedCategory
            >`substring(term FROM '^.* \\((.*)\\)$')::snomed_category`.as(
              'category',
            ),
          ])
      ).execute(),
  { never_dump: true },
)
