import { QueryCreator, sql } from 'kysely'
import { TrxOrDb } from '../../types.ts'
import { orderByArrayPosition } from '../helpers.ts'
import { DB } from '../../db.d.ts'

export const patient_record_qualifiers = {
  baseQuery<Alias extends string>(
    trx: TrxOrDb | QueryCreator<DB>,
    alias: Alias,
  ) {
    return trx.selectFrom(
      trx.selectFrom('patient_records')
        .innerJoin(
          'patient_record_qualifiers',
          'patient_record_qualifiers.id',
          'patient_records.id',
        )
        .innerJoin(
          'snomed_inferred_canonical_name_and_category',
          'patient_records.snomed_concept_id',
          'snomed_inferred_canonical_name_and_category.id',
        )
        .leftJoin(
          'snomed_inferred_canonical_name_and_category as attribute_value_snomed',
          'patient_records.value_snomed_concept_id',
          'attribute_value_snomed.id',
        )
        .select([
          'patient_records.id as record_id',
          'patient_records.patient_encounter_id',
          sql<string>`patient_records.snomed_concept_id::text`.as(
            'snomed_concept_id',
          ),
          'patient_record_qualifiers.qualifies_record_id',
          'snomed_inferred_canonical_name_and_category.name',
          'attribute_value_snomed.name as attribute_value',
        ])
        .orderBy(
          (eb) =>
            orderByArrayPosition(
              eb,
              'snomed_inferred_canonical_name_and_category.category',
              ['qualifier value'],
            ),
          'desc',
        )
        .as(alias),
    )
      .select([
        `${alias}.record_id`,
        `${alias}.snomed_concept_id`,
        `${alias}.name`,
        `${alias}.attribute_value`,
      ])
  },
}
