import { assert } from 'std/assert/assert.ts'
import { sql } from 'kysely'
import {
  IntermediateFindingRecord,
  MostRecentBriefHistoryFindings,
  RenderedFindingRelativeToHealthWorker,
  RenderedPatientEncounter,
  TrxOrDb,
} from '../../types.ts'
import * as patient_encounters from './patient_encounters.ts'
import { temporaryTable } from '../helpers.ts'
import * as patient_findings from './patient_findings.ts'
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

// .with(
//   'common_condition_descendants',
//   (qb) =>
//     qb.selectFrom('common_conditions')
//       .crossJoinLateral((eb) =>
//         sql<{ descendant_id: string; ancestor_ids: string[] }>`
//           active_descendant_snomed_concepts(${
//           eb.ref('common_conditions.snomed_concept_id')
//         }::bigint)
//         `.as('descendants')
//       )
//       .select([
//         'descendants.descendant_id',
//         'common_conditions.key',
//         'common_conditions.label',
//         'common_conditions.snomed_concept_id',
//       ]),
// )
export function mostRecentFindings(
  trx: TrxOrDb,
  { patient_id }: { patient_id: string },
): Promise<IntermediateFindingRecord<CommonConditionKey>[]> {
  return trx
    .with('common_conditions', () => temporaryTable(trx, COMMON_CONDITIONS))
    .with('patient_records_having_anything_to_do_with_common_conditions', qb =>
      qb.selectFrom('patient_records')
        .where('patient_id', '=', patient_id)
        .innerJoin(
          'common_conditions',
          join => join.on(eb =>
            sql<boolean>`is_descendant(${eb.ref('patient_records.snomed_concept_id')}, ${eb.ref('common_conditions.snomed_concept_id')})`
          )
        )
        .where(
          'patient_records.id',
          'not in',
          nowInvalidRecords(trx, { patient_id }),
        )
        .select(eb => [
          'patient_records.id',
          eb.ref('common_conditions.key').$castTo<CommonConditionKey>()
            .as('pertaining_to_key'),
        ])
    )
    .with('this_patient_findings', qb =>
      patient_findings.baseQuery(trx)
        .where('patient_records.patient_id', '=', patient_id)
        .select([
          'patient_records_having_anything_to_do_with_common_conditions'
        ])
    )
    .selectFrom('this_patient_findings')
    .selectAll('this_patient_findings')
    // .select((eb) => [
    //   eb.ref('common_condition_descendants.key').$castTo<CommonConditionKey>()
    //     .as('pertaining_to_key'),
    // ])
    .orderBy('this_patient_findings.created_at', 'desc')
    .execute()
}

function mostRecentFinding(
  findings_of_condition: IntermediateFindingRecord[],
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
      if (!finding.existence) return false

      const most_recent_finding_of_concept = first(
        findings_of_condition_grouped_by_concept.get(
          finding.snomed_concept_id,
        )!,
      )
      assert(most_recent_finding_of_concept)
      if (finding !== most_recent_finding_of_concept) return false

      const invalidated = most_recent_parent_concept_finding &&
        !most_recent_parent_concept_finding.existence &&
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
        existence: finding.value_name === 'No'
          ? 'no'
          : finding.value_name === 'Unknown'
            ? 'unknown'
            : 'yes',
        provider: {
          is_me: matching_employee.id === health_worker_id,
          ...matching_employee,
        },
        qualifiers: qualifiers.map(
          (
            {
              patient_encounter_employee_id:
                qualifier_patient_encounter_employee_id,
              ...qualifier
            },
          ) => {
            const qualifier_matching_encounter = encounter_id_to_encounter.get(
              qualifier.patient_encounter_id,
            )
            assert(
              qualifier_matching_encounter,
              `Qualifier matching encounter not found ${qualifier.patient_encounter_id} ${qualifier.record_id}`,
            )
            const qualifier_matching_employee = qualifier_matching_encounter
              .all_employees_seen.find((
                employee,
              ) =>
                employee.patient_encounter_employee_id ===
                  qualifier_patient_encounter_employee_id
              )
            assert(
              qualifier_matching_employee,
              `Qualifier matching employee not found ${qualifier_patient_encounter_employee_id} ${qualifier.record_id}`,
            )

            return {
              ...qualifier,
              provider: {
                is_me: qualifier_matching_employee.id ===
                  health_worker_id,
                ...qualifier_matching_employee,
              },
            }
          },
        ),
      } satisfies RenderedFindingRelativeToHealthWorker
    },
  )
}
