import { pMap } from '../../util/inParallel.ts'

import { buildExpression } from './s_expression.ts'
import generateUUID from '../../util/uuid.ts'
import { Priority, TrxOrDb } from '../../types.ts'
import { debugLog, jsonBuildObject, jsonObjectFrom, literalString, success_true } from '../helpers.ts'
import { DUE_TO, RELATIONSHIP } from '../../shared/snomed_concepts.ts'
import { assert } from 'std/assert/assert.ts'
import { SYSTEM_PRIORITY_DETERMINATIONS } from '../../shared/system_priority_determinations.ts'
import { patient_triage } from './patient_triage.ts'
import { patients } from './patients.ts'
import compactMap from '../../util/compactMap.ts'
import { patientAgeDetermination } from '../../shared/patient_age_determination.ts'
import { completedPersonal } from '../../shared/patient_registration.ts'
import { sql } from 'kysely'
import compact from '../../util/compact.ts'

export const system_priority_determinations = {
  async insertSystemPriorityDeterminationsIfNotAlreadyIdentified(
    trx: TrxOrDb,
    { patient_id, patient_encounter_id, /*procedure_id, */ findings }: {
      patient_id: string
      patient_encounter_id: string
      procedure_id: string
      findings: {
        id: string
        existence: 'Yes' | 'No'
      }[]
    },
  ) {
    console.log('mmmkkkkkkkk', findings)
    // TODO, maybe handle negative findings? There could be system_priority_determinations that call for them
    const positive_finding_ids = findings
      .filter((f) => f.existence === 'Yes')
      .map((f) => f.id)
    if (!positive_finding_ids.length) return

    console.log('bbbbbbb')
    const patient = await patients.getById(trx, patient_id)
    console.log('ccccccc', patient)
    assert(completedPersonal(patient), `Could not determine system priorities for patient id ${patient_id} because we do not have their personal information`)
    console.log('dddddd', patient)
    const age_determination = patientAgeDetermination(patient)

    const to_consider = compactMap(
      SYSTEM_PRIORITY_DETERMINATIONS,
      (determination) => determination.age_determinations.includes(age_determination) && determination.system_priority_determination,
    )

    console.log('fff', to_consider)

    // The new finding could match either the primary or other findings
    // If so, we want to check for whether the system determination applies (all other findings match)

    // Find

    // TODO: this for sure isn't handling the distinction between patient encounters correctly
    const [first_system_priority_determination, ...other_system_priority_determinations] = to_consider.map(
      ({ description, when_primary_finding, priority, when_other_findings_also_present: [other1, other2, other3] }) =>
        trx.selectNoFrom([
          literalString(description).as('description'),
          literalString(priority).as('now_priority'),
          jsonObjectFrom(
            buildExpression(
              trx,
              { patient_id },
              when_primary_finding,
            )
              .leftJoin('patient_evaluations', 'patient_evaluations.evaluates_record_id', 'patient_records.id')
              .leftJoin('patient_records as eval_records', 'eval_records.id', 'patient_evaluations.id')
              .leftJoin('patient_triage_level', 'patient_triage_level.id', 'patient_evaluations.id')
              .leftJoin('snomed_inferred_canonical_name_and_category as sptl', 'sptl.id', 'eval_records.value_snomed_concept_id')
              .where((eb) =>
                eb.or([
                  eb('patient_records.id', 'in', positive_finding_ids),
                  eb.and([
                    eb('sptl.name', 'is not', null),
                    eb('sptl.name', '!=', priority),
                  ]),
                ])
              )
              .select((eb) => [
                eb.ref('sptl.name').$castTo<Priority | null>().as('priority'),
              ]),
          ).as('primary_finding'),
          !other1
            ? jsonBuildObject({
              id: sql<null | string>`null`,
              vacuous: sql<boolean>`true`,
            }).as('other1_finding')
            : jsonObjectFrom(
              buildExpression(
                trx,
                { patient_id },
                other1,
              ).select([
                sql<boolean>`false`.as('vacuous'),
              ]),
            ).as('other1_finding'),
          !other2
            ? jsonBuildObject({
              id: sql<null | string>`null`,
              vacuous: sql<boolean>`true`,
            }).as('other2_finding')
            : jsonObjectFrom(
              buildExpression(
                trx,
                { patient_id },
                other2,
              ).select([
                sql<boolean>`false`.as('vacuous'),
              ]),
            ).as('other2_finding'),
          !other3
            ? jsonBuildObject({
              id: sql<null | string>`null`,
              vacuous: sql<boolean>`true`,
            }).as('other3_finding')
            : jsonObjectFrom(
              buildExpression(
                trx,
                { patient_id },
                other3,
              ).select([
                sql<boolean>`false`.as('vacuous'),
              ]),
            ).as('other3_finding'),
        ]),
    )

    const all_system_priority_determinations_query = other_system_priority_determinations.reduce(
      (acc, curr) => acc.unionAll(curr),
      first_system_priority_determination,
    )

    console.log('gaaamiop', all_system_priority_determinations_query)
    debugLog(all_system_priority_determinations_query)

    const all_sys = await trx.selectFrom(all_system_priority_determinations_query.as('all_possible_system_priority_determinations'))
      .selectAll('all_possible_system_priority_determinations')
      .where('all_possible_system_priority_determinations.primary_finding', 'is not', null)
      .where('all_possible_system_priority_determinations.other1_finding', 'is not', null)
      .where('all_possible_system_priority_determinations.other2_finding', 'is not', null)
      .where('all_possible_system_priority_determinations.other3_finding', 'is not', null)
      .execute()

    return pMap(all_sys, async ({ now_priority, primary_finding, other1_finding, other2_finding, other3_finding }) => {
      if (!primary_finding) {
        return 'No primary finding'
      }
      if (!other1_finding) {
        return 'Not matching other finding 1'
      }
      if (!other2_finding) {
        return 'Not matching other finding 2'
      }
      if (!other3_finding) {
        return 'Not matching other finding 3'
      }
      if (primary_finding.priority === now_priority) {
        return 'Primary finding already has correct priority'
      }

      const triage_level = await patient_triage
        .insertLevel(
          trx,
          {
            patient_id,
            patient_encounter_id,
            by_system: true,
            evaluates_record_id: primary_finding.id,
            triage_level: now_priority,
          },
        )

      const relations = compact([other1_finding.id, other2_finding.id, other3_finding.id]).map((finding_id) => ({
        id: generateUUID(),
        source_id: triage_level.id,
        destination_id: finding_id,
      }))

      if (!relations.length) {
        return
      }

      await trx.with(
        'inserting_relation_patient_records',
        (qb) =>
          qb.insertInto('patient_records').values(relations.map(({ id }) => ({
            id,
            patient_id,
            patient_encounter_id,
            root_snomed_concept_id: RELATIONSHIP.id,
            specific_snomed_concept_id: DUE_TO.id,
          }))),
      ).with(
        'inserting_relations',
        (qb) => qb.insertInto('patient_record_relations').values(relations),
      ).selectNoFrom([
        success_true,
      ]).executeTakeFirstOrThrow()
    })
  },
}
