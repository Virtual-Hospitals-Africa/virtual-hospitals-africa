import { TASKS } from '../../shared/tasks.ts'
import { pMap } from '../../util/inParallel.ts'
import { patient_evaluations } from './patient_evaluations.ts'

import { buildExpression } from './s_expression.ts'
import generateUUID from '../../util/uuid.ts'
import {
  AgeDetermination,
  RecordValueMeasurement,
  RenderedEvaluationRelativeToHealthWorker,
  RenderedFindingRelativeToHealthWorker,
  RenderedPatientEncounter,
  RenderedTask,
  TaskGroup,
  TrxOrDbOrQueryCreator,
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

import { ACTION_STATUS, DONE, DUE_TO, RELATIONSHIP, TO_BE_DONE } from '../../shared/snomed_concepts.ts'
import zip from '../../util/zip.ts'

import { assert } from 'std/assert/assert.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'
import { formatRecord, toDisplayableRecord } from '../../shared/patient_records.ts'
import { patient_findings } from './patient_findings.ts'
import { parseWithSchema } from '../../shared/s_expression.ts'
import { FindingRecencyComparison, investigation, Lang } from '../../shared/s_expression_schemas.ts'
import isObjectLike from '../../util/isObjectLike.ts'
import compactMap from '../../util/compactMap.ts'
import isString from '../../util/isString.ts'

type NewRecordsToConsider = {
  patient_id: string
  patient_encounter_id: string
  // procedure_id: string
  patient_age_determination: AgeDetermination | null
  records: {
    id: string
    existence: 'Yes' | 'No' | 'Unknown'
  }[]
}

export const additional_tasks = {
  async getTasksToInsert(
    trx: TrxOrDbOrQueryCreator,
    { patient_id, patient_encounter_id, patient_age_determination, /*procedure_id, */ records: findings }: NewRecordsToConsider,
  ) {
    if (!patient_age_determination) return 'Skipped: patient age determination is unknown'

    // TODO, maybe handle negative findings? There could be tasks that call for them
    const positive_record_ids = findings
      .filter((f) => f.existence === 'Yes')
      .map((f) => f.id)
    if (!positive_record_ids.length) return 'Skipped: no positive findings to check'

    const to_consider = TASKS.filter(
      (task) => task.ages.includes(patient_age_determination),
    )

    if (!to_consider.length) return 'Skipped: no tasks apply to this age group'

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
              positive_record_ids,
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

    // debugLog(all_tasks_query)

    const all_t = await all_tasks_query.execute()

    return compactMap(
      zip(
        all_t,
        to_consider,
      ),
      ([task_result, task]) => {
        assertEquals(task_result.description, task.description)

        if (arrayIsEmpty(task_result.matching_finding_ids)) {
          return null
        }
        // TODO: the procedure was already identified, so probably nothing to do here
        // Technically we could add the finding as Due to
        if (task_result.procedure_id) {
          return null
        }
        return { ...task, ...task_result }
      },
    )
  },
  async insertTasksIfNotAlreadyIdentified(
    trx: TrxOrDbOrQueryCreator,
    { patient_id, patient_encounter_id, patient_age_determination, records }: NewRecordsToConsider,
  ) {
    const tasks_to_insert = await additional_tasks.getTasksToInsert(trx, { patient_id, patient_encounter_id, patient_age_determination, records })
    if (isString(tasks_to_insert)) return tasks_to_insert

    const results = await pMap(tasks_to_insert, async (task) => {
      const evaluation_id = generateUUID()
      const relations = task.matching_finding_ids.map((finding_id) => ({
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
          evaluation: `(evaluation ${ACTION_STATUS.s_expression} ${TO_BE_DONE.s_expression})`,
          value: {
            type: 's_expression' as const,
            s_expression: inverseSExpression(task.procedure),
          },
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

      return task.description
    })

    const inserted = results.filter((r) => r != null)
    return inserted.length ? `Inserted ${inserted.length} task(s): ${inserted.join(', ')}` : 'No new tasks to insert'
  },
  async getTasksGroups(
    trx: TrxOrDbOrQueryCreator,
    { health_worker_id, encounter }: {
      health_worker_id: string
      encounter: RenderedPatientEncounter
    },
  ): Promise<{
    evaluation_ids: string[]
    task_groups: TaskGroup[]
  }> {
    const { patient, patient_encounter_id } = encounter
    const patient_id = patient.id

    const evaluations = await patient_evaluations.findAll(trx, {
      patient_id,
      patient_encounter_id,
      s_expression: `(evaluation ${ACTION_STATUS.s_expression} ${TO_BE_DONE.s_expression})`,
    })

    if (arrayIsEmpty(evaluations)) {
      return { evaluation_ids: [], task_groups: [] }
    }

    const evaluations_with_proto_tasks = evaluations.map((evaluation) => {
      assert(evaluation.value)
      assert(evaluation.value.type === 's_expression')
      const procedure = parseWithSchema(evaluation.value.s_expression, investigation)
      const tasks: Array<Lang['link' | 'finding' | 'measurement'] | FindingRecencyComparison> = isObjectLike(procedure.value)
        ? [procedure.value]
        : procedure.value
      return { ...evaluation, tasks }
    })

    const all_finding_s_expressions = new Map(
      compactMap(evaluations_with_proto_tasks.flatMap((e) => e.tasks), (task) => {
        if (task.atom === 'finding' || task.atom === 'measurement') {
          return [inverseSExpression(task), task]
        }
      }),
    )

    function existingFindings() {
      if (!all_finding_s_expressions.size) return Promise.resolve([])

      const existing_findings_query = trx.with('all_findings', (qb) => {
        const [first, ...others] = all_finding_s_expressions.entries().map(([finding_s_expression, node]) =>
          qb.selectNoFrom([
            literalString(finding_s_expression).as('finding_s_expression'),
            buildExpression(
              trx,
              { patient_id, patient_encounter_id },
              node,
            )
              .orderBy('patient_records_aggregated.created_at', 'desc')
              .limit(1)
              .as('finding_id'),
          ])
        )

        return others.reduce(
          (acc, curr) => acc.unionAll(curr),
          first,
        )
      })
        .selectFrom('all_findings')
        .innerJoin(
          patient_findings.baseQuery(trx, { include_negative: true }).as('join_against'),
          'join_against.id',
          'all_findings.finding_id',
        )
        .select('all_findings.finding_s_expression')
        .selectAll('join_against')

      return existing_findings_query.execute()
    }

    const due_to_record_ids = evaluations.map((evaluation) => {
      assertLength(evaluation.destination_relations, 1)
      assertEquals(
        evaluation.destination_relations[0].relation_name,
        DUE_TO.name,
      )
      return evaluation.destination_relations[0].id
    })

    const { /* procedures,*/ existing_findings, due_to_findings, due_to_evaluations } = await promiseProps({
      // procedures: patient_procedures.getByIds(trx, procedure_ids).then((procedures) =>
      //   patient_record_providers.hydrateIntermediateRecords(trx, {
      //     records: procedures,
      //     encounter,
      //     health_worker_id,
      //   })
      // ),
      existing_findings: existingFindings().then((findings) =>
        patient_record_providers.hydrateIntermediateRecords(trx, {
          records: findings.map(formatRecord),
          encounter,
          health_worker_id,
        })
      ),
      due_to_findings: patient_findings.getByIds(trx, due_to_record_ids, { include_invalid: true }).then((findings) =>
        patient_record_providers.hydrateIntermediateRecords(trx, {
          records: findings,
          encounter,
          health_worker_id,
        })
      ),
      due_to_evaluations: patient_evaluations.getByIds(trx, due_to_record_ids, { include_invalid: true }).then((evaluations) =>
        patient_record_providers.hydrateIntermediateRecords(trx, {
          records: evaluations,
          encounter,
          health_worker_id,
        })
      ) satisfies Promise<RenderedEvaluationRelativeToHealthWorker[]>,
    })

    const task_group_map = groupBy(
      evaluations_with_proto_tasks,
      (evaluation) => evaluation.destination_relations[0].id,
    )

    const evaluation_ids: string[] = []
    const task_groups: TaskGroup[] = []
    const seen_finding_s_expressions = new Set<string>()

    for (const [record_id, evaluations] of task_group_map) {
      const due_to = exists(
        due_to_findings.find(matching({ id: record_id })) ||
          due_to_evaluations.find(matching({ id: record_id })),
      )

      const tasks: RenderedTask[] = compactMap(
        evaluations.flatMap((evaluation) => {
          evaluation_ids.push(evaluation.id)
          return evaluation.tasks
        }),
        (task): RenderedTask | undefined => {
          if (task.atom === 'link') {
            return task
          }

          const finding_s_expression = inverseSExpression(task)

          if (seen_finding_s_expressions.has(finding_s_expression)) {
            return undefined
          }
          seen_finding_s_expressions.add(finding_s_expression)

          const { displays } = formatRecord(toDisplayableRecord(task))
          const existing_finding: null | RenderedFindingRelativeToHealthWorker = existing_findings.find(matching({ finding_s_expression })) || null

          if (task.atom === 'finding') {
            return {
              ...task,
              s_expression: finding_s_expression,
              displays,
              existing_finding,
            }
          }

          assert(task.atom === 'measurement')
          if (!existing_finding) {
            return {
              ...task,
              s_expression: finding_s_expression,
              displays,
              existing_measurement: null,
            }
          }

          assert(isMeasurement(existing_finding))

          return {
            ...task,
            s_expression: finding_s_expression,
            displays,
            existing_measurement: existing_finding,
          }
        },
      )

      task_groups.push({ due_to: [due_to], tasks })
    }

    return { evaluation_ids, task_groups }
  },
  async procedureCompletedTasks(
    trx: TrxOrDbOrQueryCreator,
    { procedure_id, evaluation_ids, patient_id, patient_encounter_id }: {
      procedure_id: string
      evaluation_ids: string[]
      patient_id: string
      patient_encounter_id: string
    },
  ) {
    if (!evaluation_ids.length) return

    const relations = evaluation_ids.map((evaluation_id) => ({
      id: generateUUID(),
      source_id: procedure_id,
      destination_id: evaluation_id,
    }))

    await trx.with(
      'inserting_relation_patient_records',
      (qb) =>
        qb.insertInto('patient_records').values(relations.map(({ id }) => ({
          id,
          patient_id,
          patient_encounter_id,
          root_snomed_concept_id: ACTION_STATUS.id,
          specific_snomed_concept_id: DONE.id,
        }))),
    ).with(
      'inserting_relations',
      (qb) => qb.insertInto('patient_record_relations').values(relations),
    ).selectNoFrom([
      success_true,
    ]).executeTakeFirstOrThrow()
  },
}

function isMeasurement(finding: RenderedFindingRelativeToHealthWorker): finding is RenderedFindingRelativeToHealthWorker & { value: RecordValueMeasurement } {
  return finding.value?.type === 'measurement'
}
