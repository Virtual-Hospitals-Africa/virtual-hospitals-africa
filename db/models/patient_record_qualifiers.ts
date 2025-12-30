import { TrxOrDbOrQueryCreator } from '../../types.ts'
import { asText, orderByArrayPosition } from '../helpers.ts'

// TODO: qualifiers might be entered by someone other than the person who initially created the finding
function baseInnerQuery(
  trx: TrxOrDbOrQueryCreator,
) {
  return trx.selectFrom('patient_records as qualifier_records')
    .innerJoin(
      'patient_record_qualifiers',
      'patient_record_qualifiers.id',
      'qualifier_records.id',
    )
    .innerJoin(
      'snomed_inferred_canonical_name_and_category',
      'qualifier_records.snomed_concept_id',
      'snomed_inferred_canonical_name_and_category.id',
    )
    .select((eb) => [
      'qualifier_records.id as record_id',
      'snomed_inferred_canonical_name_and_category.category',
      asText(eb, 'qualifier_records.snomed_concept_id').as(
        'snomed_concept_id',
      ),
      'snomed_inferred_canonical_name_and_category.name',
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
}

function baseQueryAttribute(
  trx: TrxOrDbOrQueryCreator,
) {
  return baseInnerQuery(trx)
    .where('qualifier_records.value_snomed_concept_id', 'is not', null)
    .innerJoin(
      'snomed_inferred_canonical_name_and_category as value_snomed_concept',
      'qualifier_records.value_snomed_concept_id',
      'value_snomed_concept.id',
    )
    .select((eb) => [
      asText(eb, 'value_snomed_concept.id').as('value_snomed_concept_id'),
      'value_snomed_concept.name as value_name',
      'value_snomed_concept.category as value_category',
    ])
}

function baseQueryPrefix(
  trx: TrxOrDbOrQueryCreator,
) {
  return baseInnerQuery(trx)
    .where('qualifier_records.value_snomed_concept_id', 'is', null)
}

export const patient_record_qualifiers = {
  baseQueryPrefix,
  baseQueryAttribute,
}

// Aliased base query idea
// https://github.com/Virtual-Hospitals-Africa/virtual-hospitals-africa/blob/a94d120fc459824516c14931ea2f8b4abcf27d9b/db/models/patient_record_qualifiers.ts
// export const patient_record_qualifiers = {
//   baseQuery<Alias extends string>(
//     trx: TrxOrDbOrQueryCreator,
//     alias: Alias,
//   ) {
//     return trx.selectFrom(
//       trx.selectFrom('patient_records')
//         .innerJoin(
//           'patient_record_qualifiers',
//           'patient_record_qualifiers.id',
//           'patient_records.id',
//         )
//         .innerJoin(
//           'snomed_inferred_canonical_name_and_category',
//           'patient_records.snomed_concept_id',
//           'snomed_inferred_canonical_name_and_category.id',
//         )
//         .leftJoin(
//           'snomed_inferred_canonical_name_and_category as value_name_snomed',
//           'patient_records.value_snomed_concept_id',
//           'value_name_snomed.id',
//         )
//         .select([
//           'patient_records.id as record_id',
//           'patient_records.patient_encounter_id',
//           'snomed_inferred_canonical_name_and_category.category',
//           sql<string>`patient_records.snomed_concept_id::text`.as(
//             'snomed_concept_id',
//           ),
//           'patient_record_qualifiers.qualifies_record_id',
//           'snomed_inferred_canonical_name_and_category.name',
//           'value_name_snomed.name as value_name',
//         ])
//         .orderBy(
//           (eb) =>
//             orderByArrayPosition(
//               eb,
//               'snomed_inferred_canonical_name_and_category.category',
//               ['qualifier value'],
//             ),
//           'desc',
//         )
//         .as(alias),
//     )
//       .select([
//         `${alias}.record_id`,
//         `${alias}.snomed_concept_id`,
//         `${alias}.category`,
//         `${alias}.name`,
//         `${alias}.value_name`,
//       ])
//   },
// }
