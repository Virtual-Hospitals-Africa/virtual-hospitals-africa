import { pMap } from '../../util/inParallel.ts'
import { patient_evaluations } from './patient_evaluations.ts'

import { buildExpression } from './s_expression.ts'
import generateUUID from '../../util/uuid.ts'
import {
  NewRecordsToConsiderWithSatisfyingDueToIds,
  RecordValueMeasurement,
  RenderedEvaluationRelativeToHealthWorker,
  RenderedFindingRelativeToHealthWorker,
  RenderedPatientEncounter,
  RenderedTaskToBeDone,
  TaskGroup,
  TrxOrDbOrQueryCreator,
} from '../../types.ts'
import { exists } from '../../util/exists.ts'
import { literalString, success_true } from '../helpers.ts'
import { arrayIsEmpty } from '../../util/arraySize.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { promiseProps } from '../../util/promiseProps.ts'
import matching from '../../util/matching.ts'
import { groupBy } from '../../util/groupBy.ts'
import { patient_record_providers } from './patient_record_providers.ts'
import { ACTION_STATUS, DONE, DUE_TO, RELATIONSHIP, TO_BE_DONE } from '../../shared/snomed_concepts.ts'
import { assert } from 'std/assert/assert.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'
import { formatRecord, toDisplayableRecord } from '../../shared/patient_records.ts'
import { patient_findings } from './patient_findings.ts'
import {
  Lang,
  MatchingFinding,
  QueryableEvidenceNode,
  ToBeDone,
  ToBeDoneProcedureCheckFor,
  ToBeDoneProcedureLink,
  ToBeDoneProcedureMeasurements,
  ToBeDoneProcedureProcedure,
} from '../../shared/s_expression_schemas.ts'
import compactMap from '../../util/compactMap.ts'
import isString from '../../util/isString.ts'

import compact from '../../util/compact.ts'

import uniq from '../../util/uniq.ts'
import { rules } from './rules.ts'
import { getTaskById } from '../../shared/tasks.ts'
import isObjectLike from '../../util/isObjectLike.ts'
import { patient_procedures } from './patient_procedures.ts'
import { humanReadableJson } from '../../util/humanReadableJson.ts'

import sortBy from '../../util/sortBy.ts'
import { assertUnreachable } from '../../util/assertUnreachable.ts'

type TaskToInsert = {
  id: string
  description: string
  matching_finding_ids: string[]
  procedure_id: string | null
  due_to: QueryableEvidenceNode
  to_be_done: ToBeDone
}

function isLink(to_be_done: ToBeDone): to_be_done is ToBeDoneProcedureLink {
  return isObjectLike(to_be_done.value) && to_be_done.value.atom === 'link'
}

function isProcedure(to_be_done: ToBeDone): to_be_done is ToBeDoneProcedureProcedure {
  return isObjectLike(to_be_done.value) && to_be_done.value.atom === 'snomed_concept'
}

export function isCheckFor(to_be_done: ToBeDone): to_be_done is ToBeDoneProcedureCheckFor {
  return Array.isArray(to_be_done.value) && to_be_done.value[0].atom === 'finding'
}

export function isMeasurements(to_be_done: ToBeDone): to_be_done is ToBeDoneProcedureMeasurements {
  return Array.isArray(to_be_done.value) && to_be_done.value[0].atom === 'measurement'
}

export const additional_tasks = {
  async getTasksToInsertUsingPreComputedTables(
    trx: TrxOrDbOrQueryCreator,
    new_records: NewRecordsToConsiderWithSatisfyingDueToIds,
  ): Promise<string | TaskToInsert[]> {
    const applicable_rules = await rules.getApplicableBasedOnNewRecords(trx, new_records, 'task')
    if (isString(applicable_rules)) return applicable_rules

    return pMap(applicable_rules, async ({ rule_effect, ...applicable_rule }) => {
      assertEquals(rule_effect.type, 'task')
      const { to_be_done } = getTaskById(applicable_rule.id)

      const existing_procedure = await buildExpression(
        trx,
        new_records,
        to_be_done,
      ).limit(1).executeTakeFirst()

      return {
        ...applicable_rule,
        procedure_id: existing_procedure?.id || null,
        to_be_done,
      }
    }).then(compact)
  },
  async insertTasksIfNotAlreadyIdentified(
    trx: TrxOrDbOrQueryCreator,
    { patient_id, patient_encounter_id, patient_age_determination, records }: NewRecordsToConsiderWithSatisfyingDueToIds,
  ) {
    const tasks_to_insert = await additional_tasks.getTasksToInsertUsingPreComputedTables(trx, {
      patient_id,
      patient_encounter_id,
      patient_age_determination,
      records,
    })
    if (isString(tasks_to_insert)) return tasks_to_insert

    const results = await pMap(tasks_to_insert, async (task) => {
      const evaluation_id = generateUUID()
      const relations = uniq(task.matching_finding_ids).map((finding_id) => ({
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
            type: 'task' as const,
            task_id: task.id,
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

    const task_atom_order = { 'link': 0, 'procedure': 1, 'finding': 2, 'measurement': 3 }

    const evaluations_with_proto_tasks = sortBy(
      evaluations.map((evaluation) => {
        assert(evaluation.value)
        assert(evaluation.value.type === 'task')
        const task = getTaskById(evaluation.value.task_id)
        return { ...evaluation, task }
      }),
      ({ task }) => task_atom_order[task.to_be_done.atom],
      ({ task }) => task.description,
    )

    const s_expression_to_existing_findings = new Map<string, Lang['finding' | 'measurement']>()
    const s_expression_to_already_done = new Map<string, ToBeDone>()
    for (const { task } of evaluations_with_proto_tasks) {
      const value = task.to_be_done.value satisfies
        | Lang['snomed_concept']
        | Lang['link']
        | Lang['measurement'][]
        | MatchingFinding[]

      if (Array.isArray(value)) {
        // Compiler needed some extra convincing 🙃
        const finding_and_measurements: Lang['measurement'][] | MatchingFinding[] = value
        for (const finding_or_measurement of finding_and_measurements) {
          const s_expression = inverseSExpression(finding_or_measurement)
          s_expression_to_existing_findings.set(s_expression, finding_or_measurement)
        }
      } else if (value.atom === 'snomed_concept') {
        const s_expression = inverseSExpression(task.to_be_done)
        s_expression_to_already_done.set(s_expression, task.to_be_done)
      } else {
        assertEquals(value.atom, 'link')
      }
    }

    function existingFindings() {
      if (!s_expression_to_existing_findings.size) return Promise.resolve([])

      const existing_findings_query = trx.with('existing_findings', (qb) => {
        const [first, ...others] = s_expression_to_existing_findings.entries().map(([s_expression, node]) =>
          qb.selectNoFrom([
            literalString(s_expression)
              .as('s_expression'),
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
        .selectFrom('existing_findings')
        .innerJoin(
          patient_findings.baseQuery(trx, { include_negative: true }).as('join_against'),
          'join_against.id',
          'existing_findings.finding_id',
        )
        .select('existing_findings.s_expression')
        .selectAll('join_against')

      return existing_findings_query.execute()
    }

    function alreadyDone() {
      if (!s_expression_to_already_done.size) return Promise.resolve([])

      const already_done_query = trx.with('already_done', (qb) => {
        const [first, ...others] = s_expression_to_already_done.entries().map(([s_expression, node]) =>
          qb.selectNoFrom([
            literalString(s_expression)
              .as('s_expression'),
            buildExpression(
              trx,
              { patient_id, patient_encounter_id },
              node,
            )
              .orderBy('patient_records_aggregated.created_at', 'desc')
              .limit(1)
              .as('procedure_id'),
          ])
        )

        return others.reduce(
          (acc, curr) => acc.unionAll(curr),
          first,
        )
      })
        .selectFrom('already_done')
        .innerJoin(
          patient_procedures.baseQuery(trx, {}).as('join_against'),
          'join_against.id',
          'already_done.procedure_id',
        )
        .select('already_done.s_expression')
        .selectAll('join_against')

      return already_done_query.execute()
    }

    const due_to_record_ids = evaluations.flatMap((evaluation) =>
      evaluation.destination_relations.map((destination_relation) => {
        assertEquals(
          destination_relation.relation_name,
          DUE_TO.name,
        )
        return destination_relation.id
      })
    )

    const { already_done, existing_findings, due_to_findings, due_to_evaluations } = await promiseProps({
      already_done: alreadyDone().then((procedures) =>
        patient_record_providers.hydrateIntermediateRecords(trx, {
          records: procedures.map(formatRecord),
          encounter,
          health_worker_id,
        })
      ),
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
      (evaluation) => evaluation.destination_relations.map((relation) => relation.id).join(';'),
    )

    const evaluation_ids: string[] = []
    const unsorted_task_groups_with_potentially_duplicative_findings: TaskGroup[] = []

    for (const [record_ids_joined, evaluations] of task_group_map) {
      const due_to = record_ids_joined.split(';').map((record_id) =>
        exists(
          due_to_findings.find(matching({ id: record_id })) ||
            due_to_evaluations.find(matching({ id: record_id })),
        )
      )

      const tasks: RenderedTaskToBeDone[] = evaluations.flatMap((evaluation): RenderedTaskToBeDone[] => {
        evaluation_ids.push(evaluation.id)
        const { to_be_done } = evaluation.task

        if (isLink(to_be_done)) {
          return [to_be_done.value]
        }

        if (isProcedure(to_be_done)) {
          const { displays } = formatRecord(toDisplayableRecord(to_be_done))
          const s_expression = inverseSExpression(to_be_done)
          // const existing_procedure: null | RenderedProcedureRelativeToHealthWorker = already_done.find(matching({ s_expression })) || null
          const existing_record = already_done.find(matching({ s_expression })) || null
          return [{
            ...to_be_done,
            displays,
            s_expression,
            existing_record,
            description: evaluation.task.description,
          }]
        }

        if (isCheckFor(to_be_done)) {
          return compactMap(to_be_done.value, (finding) => {
            const s_expression = inverseSExpression(finding)
            const { displays } = formatRecord(toDisplayableRecord(finding))
            const existing_record: null | RenderedFindingRelativeToHealthWorker = existing_findings.find(matching({ s_expression })) || null

            return {
              ...finding,
              displays,
              s_expression,
              existing_record,
              description: evaluation.task.description,
            }
          })
        }

        if (isMeasurements(to_be_done)) {
          return compactMap(to_be_done.value, (measurement) => {
            const s_expression = inverseSExpression(measurement)
            const { displays } = formatRecord(toDisplayableRecord(measurement))

            return {
              ...measurement,
              displays,
              s_expression,
              existing_record: existingMeasurement(),
              description: evaluation.task.description,
            }

            function existingMeasurement() {
              const existing_record: null | RenderedFindingRelativeToHealthWorker = existing_findings.find(matching({ s_expression })) || null
              if (!existing_record) return null
              assert(isMeasurement(existing_record))
              return existing_record
            }
          })
        }

        throw new Error(`to_be_done unclear ${humanReadableJson(to_be_done)}`)
      })

      const completed = tasks.every((task) => task.atom === 'link' || task.existing_record)

      unsorted_task_groups_with_potentially_duplicative_findings.push({
        due_to,
        completed,
        tasks: sortBy(
          tasks,
          (task) => task.existing_record ? 1 : 0,
          (task) => task.atom === 'link' ? '' : task.description,
        ),
      })
    }

    const task_groups_complete_first_with_potentially_duplicative_findings = sortBy(
      unsorted_task_groups_with_potentially_duplicative_findings,
      (task_group) => task_group.completed ? 0 : 1,
    )

    const seen_finding_s_expressions = new Set<string>()
    const task_groups_complete_first = task_groups_complete_first_with_potentially_duplicative_findings.map((task_group) => ({
      ...task_group,
      tasks: task_group.tasks.filter((task) => {
        switch (task.atom) {
          case 'link':
          case 'procedure':
            return true
          case 'finding':
          case 'measurement': {
            if (seen_finding_s_expressions.has(task.s_expression)) {
              return false
            }
            seen_finding_s_expressions.add(task.s_expression)
            return true
          }
          default:
            return assertUnreachable(task)
        }
      }),
    }))

    // incomplete first
    return {
      evaluation_ids,
      task_groups: task_groups_complete_first.toReversed(),
    }
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
