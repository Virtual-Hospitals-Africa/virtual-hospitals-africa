import { assert } from 'std/assert/assert.ts'
import { sql } from 'kysely'
import {
  Existence,
  MostRecentBriefHistoryFindings,
  RenderedPatientEncounter,
  TrxOrDb,
} from '../../types.ts'
import { temporaryTable } from '../helpers.ts'
import { IntermediateFinding, patient_findings } from './patient_findings.ts'
import { groupBy } from '../../util/groupBy.ts'
import first from '../../util/first.ts'
import mapEntries from '../../util/mapEntries.ts'
import {
  COMMON_CONDITION_KEYS,
  COMMON_CONDITIONS,
  CommonConditionKey,
  commonConditionSnomedConceptId,
} from '../../shared/brief_history.ts'
import fromEntries from '../../util/fromEntries.ts'
import { nowInvalidRecords } from './patient_records.ts'
import assertOneOf from '../../util/assertOneOf.ts'
import { buildValueDisplay } from '../../shared/patient_records.ts'
import { hydrateIntermediateRecords } from './patient_record_providers.ts'

type IntermediateBriefHistory = IntermediateFinding & {
  pertaining_to_key: CommonConditionKey
}

export function mostRecentFindings(
  trx: TrxOrDb,
  { patient_id }: { patient_id: string },
): Promise<IntermediateBriefHistory[]> {
  return trx
    .with('common_conditions', () => temporaryTable(trx, COMMON_CONDITIONS))
    .with(
      'patient_records_having_anything_to_do_with_common_conditions',
      (qb) =>
        qb.selectFrom('patient_records')
          .where('patient_id', '=', patient_id)
          .innerJoin(
            'common_conditions',
            (join) =>
              join.on((eb) =>
                sql<boolean>`is_descendant(${
                  eb.ref('patient_records.snomed_concept_id')
                }, ${eb.ref('common_conditions.snomed_concept_id')}::bigint)`
              ),
          )
          .where(
            'patient_records.id',
            'not in',
            nowInvalidRecords(trx, { patient_id }),
          )
          .select((eb) => [
            'patient_records.id',
            eb.ref('common_conditions.key').$castTo<CommonConditionKey>()
              .as('pertaining_to_key'),
          ]),
    )
    .with('this_patient_findings', (qb) =>
      patient_findings.baseQuery(trx)
        .where('patient_records.patient_id', '=', patient_id)
        .innerJoin(
          qb.selectFrom(
            'patient_records_having_anything_to_do_with_common_conditions',
          )
            .selectAll(
              'patient_records_having_anything_to_do_with_common_conditions',
            )
            .as('prcc'),
          (join) =>
            join.on((eb) =>
              eb.or([
                eb('patient_records.id', '=', eb.ref('prcc.id')),
                eb(
                  'patient_records.id',
                  'in',
                  eb.selectFrom('patient_record_qualifiers')
                    .whereRef('patient_record_qualifiers.id', '=', 'prcc.id')
                    .select('qualifies_record_id')
                    .distinct(),
                ),
              ])
            ),
        )
        .select([
          'prcc.pertaining_to_key',
        ]))
    .selectFrom('this_patient_findings')
    .selectAll('this_patient_findings')
    .orderBy('this_patient_findings.created_at', 'desc')
    .execute()
}

function findingExistence(finding: IntermediateBriefHistory): Existence {
  assertOneOf(
    finding.name,
    ['Status' as const, 'Clinical finding' as const],
    "Revisit this function when considering how other types of findings interplay with what's shown for brief history",
  )

  if (finding.name !== 'Status') {
    return 'Yes'
  }

  assert(finding.value_name)
  assertOneOf(finding.value_name, [
    'Yes' as const,
    'No' as const,
    'Unknown' as const,
  ])
  return finding.value_name
}

function mostRecentFinding(
  findings_of_condition: Array<
    IntermediateBriefHistory & { existence: Existence }
  >,
  pertaining_to_key: CommonConditionKey,
) {
  if (findings_of_condition.length > 1) {
    assert(
      findings_of_condition[0].created_at >=
        findings_of_condition[1].created_at,
    )
  }

  const parent_snomed_concept_id = commonConditionSnomedConceptId(
    pertaining_to_key,
  )
  assert(parent_snomed_concept_id)

  const findings_of_condition_grouped_by_concept = groupBy(
    findings_of_condition,
    'snomed_concept_id',
  )
  const most_recent_parent_concept_finding = first(
    findings_of_condition_grouped_by_concept.get(parent_snomed_concept_id) ||
      [],
  )

  const first_positive_finding_not_invalidated_by_a_later_negative_finding =
    findings_of_condition.find((finding) => {
      if (finding.existence !== 'Yes') return

      const most_recent_finding_of_concept = first(
        findings_of_condition_grouped_by_concept.get(
          finding.snomed_concept_id,
        )!,
      )
      assert(most_recent_finding_of_concept)
      if (finding !== most_recent_finding_of_concept) return false

      const invalidated = most_recent_parent_concept_finding &&
        most_recent_parent_concept_finding.existence !== 'Yes' &&
        most_recent_parent_concept_finding.created_at > finding.created_at

      return !invalidated
    })

  return first_positive_finding_not_invalidated_by_a_later_negative_finding ||
    findings_of_condition[0]
}

export async function renderedMostRecentFindings(
  trx: TrxOrDb,
  { patient_id, encounter, health_worker_id }: {
    patient_id: string
    encounter: RenderedPatientEncounter
    health_worker_id: string
  },
): Promise<MostRecentBriefHistoryFindings> {
  const most_recent_findings = await mostRecentFindings(trx, { patient_id })

  const most_recent_findings_with_existence = most_recent_findings.map(
    (finding) => ({
      ...finding,
      existence: findingExistence(finding),
    }),
  )

  const most_recent_findings_by_common_condition_key = mapEntries(
    groupBy(most_recent_findings_with_existence, 'pertaining_to_key'),
    mostRecentFinding,
  )

  const with_providers = await hydrateIntermediateRecords(trx, {
    records: Object.values(most_recent_findings_by_common_condition_key),
    health_worker_id,
    encounter,
  })

  const with_value_display = with_providers.map((finding) => ({
    ...finding,
    value_display: buildValueDisplay(finding),
  }))

  return fromEntries(
    COMMON_CONDITION_KEYS.map(
      (condition) => [
        condition,
        with_value_display.find((finding) =>
          finding.pertaining_to_key === condition
        ) ?? null,
      ],
    ),
  )
}
