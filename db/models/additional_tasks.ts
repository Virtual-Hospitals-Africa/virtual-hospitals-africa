import { TASKS } from '../../shared/tasks.ts'
import { pMap } from '../../util/inParallel.ts'
import { patient_procedures } from './patient_procedures.ts'
import { patient_evaluations } from './patient_evaluations.ts'

import { buildExpression } from './s_expression.ts'
import generateUUID from '../../util/uuid.ts'
import {
  AgeDetermination,
  RenderedEvaluationRelativeToHealthWorker,
  RenderedPatientEncounter,
  RenderedProcedureRelativeToHealthWorker,
  RenderedTask,
  RenderedTaskProcedureValue,
  TaskGroup,
  TrxOrDb,
} from '../../types.ts'
import { exists } from '../../util/exists.ts'
import { jsonArrayFromColumn, literalString, success_true } from '../helpers.ts'
import { arrayIsEmpty } from '../../util/arraySize.ts'
import assertLength from '../../util/assertLength.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { promiseProps } from '../../util/promiseProps.ts'
import matching from '../../util/matching.ts'
import { groupBy } from '../../util/groupBy.ts'
import { patient_record_providers } from './patient_record_providers.ts'

import { ACTION_STATUS, DUE_TO, EVALUATION_ACTION, RELATIONSHIP, TO_BE_DONE } from '../../shared/snomed_concepts.ts'
import zip from '../../util/zip.ts'

import { assert } from 'std/assert/assert.ts'
import sortBy from '../../util/sortBy.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'
import { asNormalFormSExpression } from '../../shared/patient_records.ts'
import { patient_findings } from './patient_findings.ts'

export const additional_tasks = {
  async insertTasksIfNotAlreadyIdentified(
    trx: TrxOrDb,
    { patient_id, patient_encounter_id, patient_age_determination, /*procedure_id, */ findings }: {
      patient_id: string
      patient_encounter_id: string
      // procedure_id: string
      patient_age_determination: AgeDetermination | null
      findings: {
        id: string
        existence: 'Yes' | 'No'
      }[]
    },
  ) {
    if (!patient_age_determination) return

    // TODO, maybe handle negative findings? There could be tasks that call for them
    const positive_finding_ids = findings
      .filter((f) => f.existence === 'Yes')
      .map((f) => f.id)
    if (!positive_finding_ids.length) return

    const to_consider = TASKS.filter(
      (task) => task.ages.includes(patient_age_determination),
    )

    if (!to_consider.length) return

    const [first_task, ...other_tasks] = to_consider.map(
      ({ description, due_to, procedure }) =>
        trx.selectNoFrom([
          literalString(description).as('description'),
          jsonArrayFromColumn(
            'id',
            buildExpression(
              trx,
              { patient_id },
              due_to,
            ).where(
              'patient_records_aggregated.id',
              'in',
              positive_finding_ids,
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

    const all_t = await all_tasks_query.execute()

    const task_results = zip(
      all_t,
      to_consider,
    )

    await pMap(task_results, async ([task_result, task]) => {
      assertEquals(task_result.description, task.description)

      if (arrayIsEmpty(task_result.matching_finding_ids)) {
        return null
      }
      // TODO: the procedure was already identified, so probably nothing to do here
      // Technically we could add the finding as Due to
      if (task_result.procedure_id) {
        return null
      }

      const procedure = await patient_procedures
        .insertOneNested(
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
          evaluation: `(evaluation ${EVALUATION_ACTION.s_expression} ${ACTION_STATUS.s_expression} ${TO_BE_DONE.s_expression})`,
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
      s_expression: `(evaluation ${EVALUATION_ACTION.s_expression} ${ACTION_STATUS.s_expression} ${TO_BE_DONE.s_expression})`,
    })

    if (arrayIsEmpty(evaluations)) {
      return []
    }

    const procedure_ids = evaluations.map((e) => {
      assert(e.evaluates_record_id)
      return e.evaluates_record_id
    })

    const due_to_record_ids = evaluations.map((evaluation) => {
      assertLength(evaluation.destination_relations, 1)
      assertEquals(
        evaluation.destination_relations[0].relation_name,
        DUE_TO.name,
      )
      return evaluation.destination_relations[0].id
    })

    const { procedures, due_to_findings, due_to_evaluations } = await promiseProps({
      procedures: patient_procedures.getByIds(trx, procedure_ids).then((procedures) =>
        patient_record_providers.hydrateIntermediateRecords(trx, {
          records: procedures,
          encounter,
          health_worker_id,
        })
      ),
      due_to_findings: patient_findings.getByIds(trx, due_to_record_ids).then((findings) =>
        patient_record_providers.hydrateIntermediateRecords(trx, {
          records: findings,
          encounter,
          health_worker_id,
        })
      ),
      due_to_evaluations: patient_evaluations.getByIds(trx, due_to_record_ids).then((evaluations) =>
        patient_record_providers.hydrateIntermediateRecords(trx, {
          records: evaluations,
          encounter,
          health_worker_id,
        })
      ) satisfies Promise<RenderedEvaluationRelativeToHealthWorker[]>,
    })

    const task_group_map = groupBy(
      evaluations,
      (evaluation) => evaluation.destination_relations[0].id,
    )

    return task_group_map.entries().map(([record_id, evaluations]): TaskGroup => {
      const due_to = exists(
        due_to_findings.find(matching({ id: record_id })) ||
          due_to_evaluations.find(matching({ id: record_id })),
      )
      const tasks_unsorted: RenderedTask[] = evaluations.map((evaluation) => {
        const procedure = exists(
          procedures.find(
            matching({ id: evaluation.evaluates_record_id }),
          ),
        )
        assert(isCheckForProcedure(procedure))

        // TODO consider completed and also go grab past findings which may indeed be done
        return {
          procedure,
          completed: false,
        }
      })

      // TODO: also compare findings in case there are 2 ways of getting to the same procedure
      const tasks = sortBy(
        tasks_unsorted,
        (task) => TASKS.findIndex((task_def) => inverseSExpression(task_def.procedure) === asNormalFormSExpression(task.procedure)),
      )
      return { due_to: [due_to], tasks }
    }).toArray()
  },
}

function isCheckForProcedure(procedure: RenderedProcedureRelativeToHealthWorker): procedure is RenderedProcedureRelativeToHealthWorker & {
  value: RenderedTaskProcedureValue
} {
  return !procedure.value || procedure.value.type === 's_expression' || procedure.value.type === 'link'
}
