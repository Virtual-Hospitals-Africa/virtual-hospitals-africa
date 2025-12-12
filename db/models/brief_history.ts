import { assert } from 'std/assert/assert.ts'
import { sql } from 'kysely'
import {
  Existence,
  IntermediateFindingRecord,
  MostRecentBriefHistoryFindings,
  RenderedFindingRelativeToHealthWorker,
  RenderedPatientEncounter,
  TrxOrDb,
} from '../../types.ts'
import * as patient_encounters from './patient_encounters.ts'
import { temporaryTable } from '../helpers.ts'
import { patient_findings } from './patient_findings.ts'
import uniq from '../../util/uniq.ts'
import { groupBy, groupByUniq } from '../../util/groupBy.ts'
import first from '../../util/first.ts'
import mapEntries from '../../util/mapEntries.ts'
import {
  COMMON_CONDITION_KEYS,
  COMMON_CONDITIONS,
  CommonConditionKey,
  commonConditionSnomedConceptId,
} from '../../shared/brief_history.ts'
import fromEntries from '../../util/fromEntries.ts'
import partition from '../../util/partition.ts'
import { nowInvalidRecords } from './patient_records.ts'
import assertOneOf from '../../util/assertOneOf.ts'

export function mostRecentFindings(
  trx: TrxOrDb,
  { patient_id }: { patient_id: string },
): Promise<IntermediateFindingRecord<CommonConditionKey>[]> {
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

function findingExistence(finding: IntermediateFindingRecord): Existence {
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
  findings_of_condition: IntermediateFindingRecord[],
  pertaining_to_key: CommonConditionKey,
) {
  const findings_of_condition_with_existence = findings_of_condition.map(
    (finding) => ({
      ...finding,
      existence: findingExistence(finding),
    }),
  )

  if (findings_of_condition_with_existence.length > 1) {
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
    findings_of_condition_with_existence,
    'snomed_concept_id',
  )
  const most_recent_parent_concept_finding = first(
    findings_of_condition_grouped_by_concept.get(parent_snomed_concept_id) ||
      [],
  )

  console.log({ findings_of_condition })

  const first_positive_finding_not_invalidated_by_a_later_negative_finding =
    findings_of_condition_with_existence.find((finding) => {
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
    findings_of_condition_with_existence[0]
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

  const most_recent_findings_by_common_condition_key = mapEntries(
    groupBy(most_recent_findings, 'pertaining_to_key'),
    mostRecentFinding,
  )

  const encounter_ids = uniq(
    Object.values(most_recent_findings_by_common_condition_key).flatMap((
      finding,
    ) => [
      finding.patient_encounter_id,
      ...finding.qualifiers.map((qualifier) => qualifier.patient_encounter_id),
    ]),
  )
  const other_encounter_ids = encounter_ids.filter((encounter_id) =>
    encounter_id !== encounter.patient_encounter_id
  )

  const other_encounters: RenderedPatientEncounter[] =
    other_encounter_ids.length
      ? await patient_encounters.getByIds(trx, other_encounter_ids)
      : []

  const encounters = [encounter, ...other_encounters]
  const encounter_id_to_encounter = groupByUniq(
    encounters,
    'patient_encounter_id',
  )

  const most_recent_all_conditions_raw = fromEntries(
    COMMON_CONDITION_KEYS.map(
      (condition) => [
        condition,
        most_recent_findings_by_common_condition_key[condition],
      ],
    ),
  )

  return mapEntries(
    most_recent_all_conditions_raw,
    (most_recent_finding) => {
      if (!most_recent_finding) return null

      const { qualifiers, patient_encounter_employee_id, ...finding } =
        most_recent_finding

      const matching_encounter = encounter_id_to_encounter.get(
        finding.patient_encounter_id,
      )
      assert(
        matching_encounter,
        `Matching encounter not found ${finding.patient_encounter_id} ${finding.record_id}`,
      )

      const matching_employee = matching_encounter.all_employees_seen.find((
        employee,
      ) =>
        employee.patient_encounter_employee_id ===
          patient_encounter_employee_id
      )
      assert(
        matching_employee,
        `Matching employee not found ${patient_encounter_employee_id} ${finding.record_id}`,
      )

      const [attribute_qualifiers, prefix_qualifiers] = partition(
        qualifiers,
        (q) => !!q.attribute_value,
      )

      let value_display = finding.name
      prefix_qualifiers.forEach((prefix_qualifier) => {
        assert(!prefix_qualifier.attribute_value)
        value_display = `${prefix_qualifier.name} ${value_display}`
      })
      attribute_qualifiers.forEach((attribute_qualifier) => {
        assert(attribute_qualifier.attribute_value)
        value_display +=
          ` ${attribute_qualifier.name} ${attribute_qualifier.attribute_value}`
      })
      if (finding.value_name) {
        value_display += `: ${finding.value_name}`
      }

      return {
        ...finding,
        value_display,
        provider: {
          is_me: matching_employee.id === health_worker_id,
          ...matching_employee,
        },
        qualifiers,
      } satisfies RenderedFindingRelativeToHealthWorker
    },
  )
}
