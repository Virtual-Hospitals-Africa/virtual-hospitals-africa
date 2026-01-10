import { KEYED_TASKS, TASKS } from '../../shared/tasks.ts'
import { pMap } from '../../util/inParallel.ts'
import { patient_procedures } from './patient_procedures.ts'
import { patient_evaluations } from './patient_evaluations.ts'

import { buildExpression, satisfyingSExpression } from './s_expression.ts'
import generateUUID from '../../util/uuid.ts'
import { Priority, RenderedPatientEncounter, TaskGroup, TrxOrDb } from '../../types.ts'
import { exists } from '../../util/exists.ts'
import first from '../../util/first.ts'
import { jsonBuildObject, jsonObjectFrom, literalBoolean, literalString, success_true } from '../helpers.ts'
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
import { ExpressionBuilder } from 'kysely'
import { DB } from '../../db.d.ts'
import { parseExpression, isAtom } from '../../shared/s_expression.ts'
import { KEYED_WARNING_SIGNS, findingQueryExpression } from '../../shared/warning_signs.ts'
import { buildExpressionPredicate } from './s_expression_snomed_concepts.ts'
import { snomed_model } from './snomed.ts'
import mapEntries from '../../util/mapEntries.ts'

function getPriorityOfSnomedConcept<
  // deno-lint-ignore no-explicit-any
  EB extends ExpressionBuilder<DB, any>,
>(
  eb: EB,
  column_ref: Parameters<EB['ref']>[0],
  patient_id: string,
  trx: TrxOrDb,
) {
  const [first_sign, ...rest] = KEYED_WARNING_SIGNS

  // Build the predicate for a warning sign, including prompt_when check if present
  const buildSignPredicate = (sign: typeof first_sign) => {
    const finding_predicate = buildExpressionPredicate(
      eb,
      column_ref,
      findingQueryExpression(sign),
    )

    if (!sign.prompt_when_s_expression) {
      return finding_predicate
    }

    // TODO: probably move this idea into db/models/s_expression.ts
    // Build the prompt_when check for the patient
    // Handle 'not' expressions specially: use NOT EXISTS instead of EXISTS on the negated query
    const parsed = parseExpression(sign.prompt_when_s_expression)

    const prompt_when = isAtom(parsed, 'not')
      ? eb.not(eb.exists(buildExpression(
        trx,
        { patient_id },
        parsed.expression,
      )))
      : eb.exists(
        buildExpression(
          trx,
          { patient_id },
          parsed,
        ),
      )

    return eb.and([finding_predicate, prompt_when])
  }

  let case_builder = eb.case().when(
    buildSignPredicate(first_sign),
  )
    .then(jsonBuildObject({
      name: literalString(first_sign.sats_priority),
      warning_sign: literalString(first_sign.key),
    }))

  for (const sign of rest) {
    case_builder = case_builder
      .when(
        buildSignPredicate(sign),
      )
      .then(jsonBuildObject({
        name: literalString(sign.sats_priority),
        warning_sign: literalString(sign.key),
      }))
  }

  return case_builder.end().as('priority')
}


export const additional_tasks = {
  async insertTasksIfNotAlreadyIdentified(
    trx: TrxOrDb,
    { patient_id, patient_encounter_id, procedure_id, finding_ids }: {
      patient_id: string
      patient_encounter_id: string
      procedure_id: string
      finding_ids: string[]
    },
  ) {

    if (!finding_ids.length) return

    await trx.selectFrom('patient_records as xr')
      .where('xr.id', 'in', finding_ids)
      .select((eb) => [
        jsonBuildObject(
          mapEntries(KEYED_TASKS, task => {
            if (task.when.atom !== 'finding') {
              return literalBoolean(false)
            }
            return eb.exists(
              buildExpression(
                trx,
                { patient_id },
                task.when,
              ).where(
                'patient_records.id',
                '=',
                eb.ref('xr.id')
              ),
            )
          })
        ).as('matching_tasks')
      ])
      .execute()

    


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
