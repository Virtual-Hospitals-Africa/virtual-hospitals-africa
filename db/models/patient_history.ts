import type { RenderedPatientHistory, RenderedPatientOpenEncounter, TrxOrDbOrQueryCreator } from '../../types.ts'
import { promiseProps } from '../../util/promiseProps.ts'
import { patient_findings } from './patient_findings.ts'
import { patient_prescriptions } from './patient_prescriptions.ts'
import { patient_records_any_top_level } from './patient_records_any_top_level.ts'
import { snomed_concept_finding_like } from './snomed_concept_finding_like.ts'
import { patient_record_providers } from './patient_record_providers.ts'
import { SearchResult } from './_base.ts'
import {
  FAMILY_HISTORY_WITH_EXPLICIT_CONTEXT,
  HEALTH_RELATED_BEHAVIOR_FINDING,
  HISTORY_OF_DRUG_THERAPY,
  HISTORY_OF_SURGERY,
} from '../../shared/snomed_concepts.ts'

export const patient_history = {
  get(
    trx: TrxOrDbOrQueryCreator,
    { patient_id, health_worker_id, encounter }: {
      patient_id: string
      health_worker_id: string
      encounter?: RenderedPatientOpenEncounter
    },
  ): Promise<RenderedPatientHistory> {
    // Attaches the provider (health worker) to each intermediate record. The
    // batching in hydrateIntermediateRecords means calling this per-field still
    // results in a single lookup of the referenced employees.
    function hydrateFindings(records: SearchResult<typeof patient_findings>[]) {
      return patient_record_providers.hydrateIntermediateRecords(trx, {
        records,
        encounter,
        health_worker_id,
      })
    }

    // Findings anywhere in the patient's history whose specific concept is a
    // descendant of `anchor_snomed_concept_id`.
    function findingsUnder(anchor_snomed_concept_id: string) {
      return patient_findings.findAll(trx, {
        patient_id,
        specific_snomed_concept_id: trx
          .selectFrom('snomed_concept_active_descendants_realized')
          .where(
            'snomed_concept_active_descendants_realized.ancestor_id',
            '=',
            anchor_snomed_concept_id,
          )
          .select(
            'snomed_concept_active_descendants_realized.descendant_id as id',
          ),
      }).then(hydrateFindings)
    }

    // Pre-existing conditions: any finding that is a descendant of chronic disease.
    function preExistingConditions() {
      return patient_records_any_top_level.findAll(trx, {
        patient_id,
        specific_snomed_concept_id: snomed_concept_finding_like.distinctIds(
          trx,
          { chronic: true },
        ),
      }).then((records) => hydrateFindings(records as SearchResult<typeof patient_findings>[]))
    }

    // Medications the patient reports taking (history findings) plus medications
    // we've prescribed (rendered as procedures) — see RenderedMedicationHistoryItem.
    async function medications() {
      const [reported, prescribed] = await Promise.all([
        findingsUnder(HISTORY_OF_DRUG_THERAPY.id),
        patient_prescriptions.findAll(trx, { patient_id }).then((records) =>
          patient_record_providers.hydrateIntermediateRecords(trx, {
            records,
            encounter,
            health_worker_id,
          })
        ),
      ])
      return [...reported, ...prescribed]
    }

    return promiseProps({
      allergies: patient_findings.findAll(trx, {
        patient_id,
        s_expression: '(allergy)',
      }).then(hydrateFindings),
      pre_existing_conditions: preExistingConditions(),
      family_history: findingsUnder(FAMILY_HISTORY_WITH_EXPLICIT_CONTEXT.id),
      major_surgeries: findingsUnder(HISTORY_OF_SURGERY.id),
      medications: medications(),
      lifestyle: findingsUnder(HEALTH_RELATED_BEHAVIOR_FINDING.id),
    })
  },
}
