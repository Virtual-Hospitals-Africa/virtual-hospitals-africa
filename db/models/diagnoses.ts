import { sql } from 'kysely'
import { formatRecord } from '../../shared/patient_records.ts'
import { DIAGNOSIS } from '../../shared/snomed_concepts.ts'
import type { RenderedEvaluationRelativeToHealthWorker, RenderedPatientEncounter, TrxOrDbOrQueryCreator } from '../../types.ts'
import { patient_evaluations } from './patient_evaluations.ts'
import { patient_record_providers } from './patient_record_providers.ts'

export const diagnoses = {
  async get(
    trx: TrxOrDbOrQueryCreator,
    { encounter, health_worker_id }: {
      encounter: RenderedPatientEncounter
      health_worker_id: string
    },
  ): Promise<RenderedEvaluationRelativeToHealthWorker[]> {
    const diagnoses = await trx.with('ranked_diagnoses', () =>
      patient_evaluations.searchQuery(
        trx,
        {
          patient_id: encounter.patient.id,
          patient_encounter_id: encounter.patient_encounter_id,
          root_snomed_concept_id: DIAGNOSIS.id,
        },
      )
        .select(
          sql`ROW_NUMBER() OVER (PARTITION BY patient_records_aggregated.specific_snomed_concept_id ORDER BY patient_records_aggregated.created_at DESC)`
            .as('rank'),
        ))
      .selectFrom('ranked_diagnoses')
      .where('ranked_diagnoses.rank', '=', 1)
      .selectAll('ranked_diagnoses')
      .execute()

    return patient_record_providers.hydrateIntermediateRecords(trx, {
      records: diagnoses.map(formatRecord),
      health_worker_id,
      encounter,
    })
  },
}
