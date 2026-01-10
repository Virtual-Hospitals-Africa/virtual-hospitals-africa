import { TASKS } from '../../shared/tasks.ts'
import { pMap } from '../../util/inParallel.ts'
import { patient_procedures } from './patient_procedures.ts'
import { patient_evaluations } from './patient_evaluations.ts'

import { buildExpression } from './s_expression.ts'
import generateUUID from '../../util/uuid.ts'
import {
  RenderedPatientEncounter,
  TaskGroup,
  TrxOrDb,
} from '../../types.ts'
import { exists } from '../../util/exists.ts'
import {
  jsonArrayFromColumn,
  literalString,
  success_true,
} from '../helpers.ts'
import { arrayIsEmpty } from '../../util/arraySize.ts'
import assertLength from '../../util/assertLength.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { promiseProps } from '../../util/promiseProps.ts'
import matching from '../../util/matching.ts'
import { groupBy } from '../../util/groupBy.ts'
import { patient_record_providers } from './patient_record_providers.ts'
import { patient_vitals } from './patient_vitals.ts'
import {
  ACTION_STATUS,
  DUE_TO,
  EVALUATION_ACTION,
  RELATIONSHIP,
  TO_BE_DONE,
} from '../../shared/snomed_concepts.ts'
import zip from '../../util/zip.ts'
import { assertNotEquals } from 'std/assert/assert_not_equals.ts'
import { assert } from 'std/assert/assert.ts'


export const additional_tasks = {
  async insertTasksIfNotAlreadyIdentified(
    trx: TrxOrDb,
    { patient_id, patient_encounter_id, /*procedure_id, */ finding_ids }: {
      patient_id: string
      patient_encounter_id: string
      procedure_id: string
      finding_ids: string[]
    },
  ) {
    if (!finding_ids.length) return

    const [first_task, ...other_tasks] = TASKS.map(
      ({ description, when, procedure }) =>
        trx.selectNoFrom([
          literalString(description).as('description'),
          jsonArrayFromColumn(
            'id',
            buildExpression(
              trx,
              { patient_id },
              when,
            ).where(
              'patient_records.id',
              'in',
              finding_ids,
            ),
          ).as('matching_finding_ids'),
          buildExpression(
            trx,
            { patient_id, patient_encounter_id },
            procedure,
          ).limit(1).as('procedure_id'),
        ]),
    )

    const all_tasks_query = other_tasks.reduce(
      (acc, curr) => acc.unionAll(curr),
      first_task,
    )

    const task_results = zip(
      await all_tasks_query.execute(),
      TASKS,
    )

    await pMap(task_results, async ([task_result, task]) => {
      assertEquals(task_result.description, task.description)
      assertNotEquals(task.when.atom, 'any') // TODO support these
      assertNotEquals(task.when.atom, 'all')

      if (arrayIsEmpty(task_result.matching_finding_ids)) {
        return null
      }
      // TODO: the procedure was already identified, so probably nothing to do here
      // Technically we could add the finding as Due to
      if (task_result.procedure_id) {
        return null
      }

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

      assert(procedure.inserted_new)

      const evaluation_id = generateUUID()
      const relations = task_result.matching_finding_ids.map((finding_id) => ({
        id: generateUUID(),
        source_id: evaluation_id,
        destination_id: finding_id,
      }))

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
  async getTasksGroups(
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
        patient_record_providers.hydrateIntermediateRecords(trx, {
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
        const due_to = exists(
          findings.find(matching({ record_id: finding_id })),
        )
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
  },
}
