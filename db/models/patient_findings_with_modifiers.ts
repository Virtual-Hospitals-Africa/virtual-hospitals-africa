import { formatRecord } from '../../shared/patient_records.ts'
import { TrxOrDbOrQueryCreator } from '../../types.ts'
import { jsonArrayFrom } from '../helpers.ts'
import { base } from './_base.ts'
import { patient_findings, PatientFindingsSearch } from './patient_findings.ts'
import { snomed_predefined_attributes } from './snomed_predefined_attributes.ts'
import { snomed_relevant_qualifiers } from './snomed_relevant_qualifiers.ts'

export const patient_findings_with_modifiers = base({
  top_level_table: 'patient_findings',
  baseQuery(
    trx: TrxOrDbOrQueryCreator,
    opts: PatientFindingsSearch,
  ) {
    return patient_findings.baseQuery(trx, opts)
      .select((eb) => [
        jsonArrayFrom(
          snomed_predefined_attributes.baseQuery(trx, {
            snomed_concept: eb.ref('patient_records_aggregated.specific_snomed_concept_id'),
          }),
        ).as('predefined_attributes'),
        jsonArrayFrom(
          snomed_relevant_qualifiers.baseQuery(trx, {
            snomed_concept: eb.ref('patient_records_aggregated.specific_snomed_concept_id'),
          }),
        ).as('relevant_qualifiers'),
      ])
  },
  formatResult({ relevant_qualifiers, ...row }) {
    return {
      ...formatRecord(row),
      relevant_qualifiers: snomed_relevant_qualifiers.asUniqueQualifiers(relevant_qualifiers),
    }
  },
})
