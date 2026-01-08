import { TASKS } from '../../shared/tasks.ts'
import { pMap } from '../../util/inParallel.ts'
import { patient_procedures } from './patient_procedures.ts'
import { patient_evaluations } from './patient_evaluations.ts'

import { satisfyingSExpression } from './s_expression.ts'
import generateUUID from '../../util/uuid.ts'
import { RenderedPatientEncounter, TaskGroup, TrxOrDb } from '../../types.ts'
import { exists } from '../../util/exists.ts'
import first from '../../util/first.ts'
import { success_true } from '../helpers.ts'
import { arrayIsEmpty } from '../../util/arraySize.ts'
import assertLength from '../../util/assertLength.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { promiseProps } from '../../util/promiseProps.ts'
import matching from '../../util/matching.ts'
import { groupBy } from '../../util/groupBy.ts'
import { hydrateIntermediateRecords } from './patient_record_providers.ts'
import { patient_vitals } from './patient_vitals.ts'
import {
  ACTION_STATUS,
  DUE_TO,
  EVALUATION_ACTION,
  RELATIONSHIP,
  TO_BE_DONE,
} from '../../shared/snomed_concepts.ts'

export async function insertTasksIfNotAlreadyIdentified(
  trx: TrxOrDb,
  { patient_id, patient_encounter_id }: {
    patient_id: string
    patient_encounter_id: string
  },
) {
  await pMap(TASKS, async (task) => {
    const records_for_which_task_should_be_done = await satisfyingSExpression(
      trx,
      {
        patient_id,
        patient_encounter_id,
        s_expression: task.when,
      },
    )

    if (!records_for_which_task_should_be_done.satisfies) {
      return null
    }

    const first_record = exists(
      first(records_for_which_task_should_be_done.record_ids),
    )

    const procedure = await patient_procedures
      .insertOneIfNotAlreadyExistsForThisEncounter(
        trx,
        {
          patient_id,
          patient_encounter_id,
          by_system: true,
          procedure: task.procedure,
        },
      )

    if (procedure.inserted_new) {
      const evaluation_id = generateUUID()
      const relation_id = generateUUID()

      await patient_evaluations.insertOneNestedQuery(
        trx,
        {
          evaluation_id,
          patient_id,
          patient_encounter_id,
          by_system: true,
          evaluates_record_id: procedure.procedure_id,
          evaluation:
            `(evaluation ${EVALUATION_ACTION.id} ${ACTION_STATUS.id} ${TO_BE_DONE.id})`,
        },
      ).with(
        'inserting_relation_patient_records',
        (qb) =>
          qb.insertInto('patient_records').values({
            patient_id,
            patient_encounter_id,
            id: relation_id,
            root_snomed_concept_id: RELATIONSHIP.id,
            specific_snomed_concept_id: DUE_TO.id,
          }),
      ).with(
        'inserting_relations',
        (qb) =>
          qb.insertInto('patient_record_relations').values({
            id: relation_id,
            source_id: evaluation_id,
            destination_id: first_record,
          }),
      ).selectNoFrom([
        success_true,
      ]).executeTakeFirstOrThrow()
    }
  })
}

export async function getTasksGroups(
  trx: TrxOrDb,
  { health_worker_id, encounter }: {
    health_worker_id: string
    encounter: RenderedPatientEncounter
  },
): Promise<TaskGroup[]> {
  const patient_id = encounter.patient.id
  const evaluations = await patient_evaluations.findAll(trx, {
    patient_id,
    patient_encounter_id: encounter.patient_encounter_id,
    s_expression:
      `(evaluation ${EVALUATION_ACTION.id} ${ACTION_STATUS.id} ${TO_BE_DONE.id})`,
  })

  if (arrayIsEmpty(evaluations)) {
    return []
  }

  const procedure_ids = evaluations.map((e) => e.evaluates_record_id)

  const finding_ids = evaluations.map((evaluation) => {
    assertLength(evaluation.destination_relations, 1)
    assertEquals(
      evaluation.destination_relations[0].specific_snomed_concept_id,
      DUE_TO.id,
    )
    return evaluation.destination_relations[0].destination_id
  })

  const { procedures, findings } = await promiseProps({
    procedures: patient_procedures.getByIds(trx, procedure_ids),
    findings: patient_vitals.getByIds(trx, finding_ids).then((findings) =>
      hydrateIntermediateRecords(trx, {
        records: findings,
        encounter,
        health_worker_id,
      })
    ),
  })

  const task_group_map = groupBy(
    evaluations,
    (evaluation) => evaluation.destination_relations[0].destination_id,
  )

  return Array.from(
    task_group_map.entries().map(([finding_id, evaluations]): TaskGroup => {
      const due_to = exists(findings.find(matching({ record_id: finding_id })))
      const tasks = evaluations.map((evaluation) => {
        const procedure = exists(
          procedures.find(
            matching({ record_id: evaluation.evaluates_record_id }),
          ),
        )
        return {
          procedure,
          completed: false,
        }
      })
      return { due_to: [due_to], tasks }
    }),
  )
}
