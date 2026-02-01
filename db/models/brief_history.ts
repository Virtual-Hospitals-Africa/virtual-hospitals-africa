import { assert } from 'std/assert/assert.ts'
import { sql } from 'kysely'
import {
  Existence,
  MostRecentBriefHistoryFindings,
  NonEmptyArray,
  RenderedBriefHistoryRelativeToHealthWorker,
  RenderedPatientEncounter,
  TrxOrDb,
} from '../../types.ts'
import { temporaryTable } from '../helpers.ts'
import { IntermediateFinding, patient_findings } from './patient_findings.ts'
import { groupBy } from '../../util/groupBy.ts'
import first from '../../util/first.ts'
import { CommonCondition, CommonConditionKey, commonConditionSnomedConcept } from '../../shared/brief_history.ts'
import fromEntries from '../../util/fromEntries.ts'
import { patient_record_providers } from './patient_record_providers.ts'
import { formatRecord } from '../../shared/patient_records.ts'
import compact from '../../util/compact.ts'

type IntermediateBriefHistory = IntermediateFinding & {
  pertaining_to_key: CommonConditionKey
}

function mostRecentRecords(
  trx: TrxOrDb,
  { patient_id, conditions }: {
    patient_id: string
    conditions: CommonCondition[]
  },
): Promise<IntermediateBriefHistory[]> {
  return trx
    .with('common_conditions', () => temporaryTable(trx, conditions))
    .with(
      'patient_findings_matching_common_conditions',
      (qb) =>
        qb.selectFrom('patient_findings')
          .innerJoin(
            'patient_records',
            'patient_findings.id',
            'patient_records.id',
          )
          .innerJoin('patient_records_still_valid', 'patient_records_still_valid.id', 'patient_findings.id')
          .where('patient_records.patient_id', '=', patient_id)
          .innerJoin(
            'common_conditions',
            (join) =>
              join.on((eb) =>
                sql<boolean>`is_descendant(${eb.ref('patient_records.specific_snomed_concept_id')}, ${eb.ref('common_conditions.snomed_concept_id')}::bigint)`
              ),
          )
          .select((eb) => [
            'patient_findings.id',
            eb.ref('common_conditions.key').$castTo<CommonConditionKey>()
              .as('pertaining_to_key'),
          ]),
    )
    .with(
      'this_patient_findings',
      (qb) =>
        patient_findings.searchQuery(trx, {
          patient_id,
          include_negative: true,
        })
          .innerJoin(
            qb.selectFrom('patient_findings_matching_common_conditions')
              .selectAll('patient_findings_matching_common_conditions')
              .as('pfmcc'),
            (join) => join.onRef('patient_records_aggregated.id', '=', 'pfmcc.id'),
          )
          .select([
            'pfmcc.pertaining_to_key',
          ]),
    )
    .selectFrom('this_patient_findings')
    .selectAll('this_patient_findings')
    .orderBy('this_patient_findings.created_at', 'desc')
    .execute()
}

function mostRecentRecord<
  Finding extends ReturnType<typeof formatRecord<IntermediateBriefHistory>> & {
    existence: Existence
  },
>(
  findings_of_condition: NonEmptyArray<Finding>,
): Finding | null {
  if (findings_of_condition.length > 1) {
    assert(
      findings_of_condition[0].created_at >=
        findings_of_condition[1].created_at,
    )
  }
  const { pertaining_to_key } = first(findings_of_condition)

  const parent_snomed_concept_id = commonConditionSnomedConcept(
    pertaining_to_key,
  )?.id
  assert(parent_snomed_concept_id)

  const findings_of_condition_grouped_by_concept = groupBy(
    findings_of_condition,
    (f) => f.specific_snomed_concept_id,
  ) as Map<string, NonEmptyArray<Finding>>
  const most_recent_parent_concept_finding = first(
    findings_of_condition_grouped_by_concept.get(parent_snomed_concept_id) ||
      [],
  )

  const first_positive_finding_not_invalidated_by_a_later_negative_finding = findings_of_condition.find((finding) => {
    if (finding.existence !== 'Yes') return

    const most_recent_finding_of_concept = first(
      findings_of_condition_grouped_by_concept.get(
        finding.specific_snomed_concept_id,
      )!,
    )
    assert(most_recent_finding_of_concept)
    if (finding !== most_recent_finding_of_concept) return false

    const invalidated = most_recent_parent_concept_finding &&
      most_recent_parent_concept_finding.existence !== 'Yes' &&
      most_recent_parent_concept_finding.created_at > finding.created_at

    return !invalidated
  })

  if (first_positive_finding_not_invalidated_by_a_later_negative_finding) {
    return first_positive_finding_not_invalidated_by_a_later_negative_finding
  }

  return most_recent_parent_concept_finding ?? null
}

export const brief_history = {
  mostRecentRecords,
  async renderedMostRecentRecords(
    trx: TrxOrDb,
    { patient_id, encounter, health_worker_id, conditions }: {
      patient_id: string
      encounter: RenderedPatientEncounter
      health_worker_id: string
      conditions: CommonCondition[]
    },
  ): Promise<MostRecentBriefHistoryFindings> {
    const most_recent_findings = await mostRecentRecords(trx, {
      patient_id,
      conditions,
    }).then((findings) => findings.map(formatRecord))

    const most_recent_grouped = groupBy(
      most_recent_findings,
      'pertaining_to_key',
    )
      .values()
      .map(mostRecentRecord)
      .toArray()

    const with_providers: RenderedBriefHistoryRelativeToHealthWorker[] = await patient_record_providers.hydrateIntermediateRecords(trx, {
      encounter,
      health_worker_id,
      records: compact(most_recent_grouped),
    })

    return fromEntries(
      conditions.map(
        (condition) => [
          condition.key,
          with_providers.find((finding) => finding.pertaining_to_key === condition.key),
        ],
      ),
    )
  },
}
