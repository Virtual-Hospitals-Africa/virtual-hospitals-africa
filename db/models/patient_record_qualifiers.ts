import { TrxOrDbOrQueryCreator } from '../../types.ts'
import { nonGroupedBaseQuery } from './patient_records_base.ts'

export const patient_record_qualifiers = {
  baseQuery<Alias extends string>(trx: TrxOrDbOrQueryCreator, alias: Alias) {
    return trx.selectFrom(
      trx.selectFrom(
        nonGroupedBaseQuery(trx)
          .as('qualifier_records'),
      )
        .innerJoin(
          'patient_record_qualifiers',
          'patient_record_qualifiers.id',
          'qualifier_records.id',
        )
        .selectAll('qualifier_records')
        .select([
          'patient_record_qualifiers.qualifies_record_id',
        ])
        .orderBy(
          'qualifier_records.created_at',
          'desc',
        )
        .as(alias),
    ).select([
      `${alias}.id`,
      `${alias}.created_at`,
      `${alias}.patient_encounter_id`,
      `${alias}.root_snomed_concept_id`,
      `${alias}.root_snomed_concept_name`,
      `${alias}.root_snomed_concept_category`,
      `${alias}.specific_snomed_concept_id`,
      `${alias}.specific_snomed_concept_name`,
      `${alias}.specific_snomed_concept_category`,
      `${alias}.value`,
    ])
  },
}
