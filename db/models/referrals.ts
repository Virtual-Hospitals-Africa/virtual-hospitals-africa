import { Maybe, TrxOrDbOrQueryCreator } from '../../types.ts'
import { base, identity } from './_base.ts'
import { insertOneQuery, patient_procedures } from './patient_procedures.ts'
import { health_workers } from './health_workers.ts'
import { PROCEDURE, REFERRAL_TO_PERSON } from '../../shared/snomed_concepts.ts'
import { parseExpressionExpectingAtom } from '../../shared/s_expression.ts'
import { jsonArrayFrom, jsonBuildObject, jsonObjectFrom, literalString, success_true } from '../helpers.ts'
import generateUUID from '../../util/uuid.ts'
import { assertOr400 } from '../../util/assertOr.ts'

type Terms = {
  patient_id?: Maybe<string>
  patient_encounter_id?: Maybe<string>
  employment_id?: Maybe<string>
  originator_health_worker_id?: Maybe<string>
  notified_health_worker_id?: Maybe<string>
  originator_or_notified_health_worker_id?: Maybe<string>
}

export const referrals = base({
  top_level_table: 'patient_procedures',
  baseQuery(trx, terms: Terms) {
    return patient_procedures.baseQuery(trx, {
      patient_id: terms.patient_id ?? undefined,
      patient_encounter_id: terms.patient_encounter_id ?? undefined,
      specific_snomed_concept_id: REFERRAL_TO_PERSON.id,
    })
      // The referral's chart review workflow is inserted in the same statement as
      // the referral procedure and shares its id, and the notifications point at
      // the workflow.
      .innerJoin(
        'patient_workflows as chart_review_workflows',
        'chart_review_workflows.id',
        'patient_records_aggregated.id',
      )
      .$if(
        !!terms.employment_id,
        (qb) => qb.where('patient_procedures.employment_id', '=', terms.employment_id!),
      )
      .$if(
        !!terms.originator_health_worker_id,
        (qb) =>
          qb.where(
            'patient_procedures.employment_id',
            'in',
            trx.selectFrom('employment')
              .where('employment.health_worker_id', '=', terms.originator_health_worker_id!)
              .select('employment.id'),
          ),
      )
      .$if(
        !!terms.notified_health_worker_id,
        (qb) =>
          qb.where((eb) =>
            eb.exists(
              eb.selectFrom('health_worker_web_notifications')
                .whereRef('health_worker_web_notifications.row_id', '=', 'chart_review_workflows.id')
                .where('health_worker_web_notifications.table_name', '=', 'patient_workflows')
                .where('health_worker_web_notifications.health_worker_id', '=', terms.notified_health_worker_id!)
                .select('health_worker_web_notifications.id'),
            )
          ),
      )
      // Auth layer: only the referral's originator or its notified recipients may view it
      .$if(
        !!terms.originator_or_notified_health_worker_id,
        (qb) =>
          qb.where((eb) =>
            eb.or([
              eb(
                'patient_procedures.employment_id',
                'in',
                eb.selectFrom('employment')
                  .where('employment.health_worker_id', '=', terms.originator_or_notified_health_worker_id!)
                  .select('employment.id'),
              ),
              eb.exists(
                eb.selectFrom('health_worker_web_notifications')
                  .whereRef('health_worker_web_notifications.row_id', '=', 'chart_review_workflows.id')
                  .where('health_worker_web_notifications.table_name', '=', 'patient_workflows')
                  .where('health_worker_web_notifications.health_worker_id', '=', terms.originator_or_notified_health_worker_id!)
                  .select('health_worker_web_notifications.id'),
              ),
            ])
          ),
      )
      .select((eb) => [
        jsonArrayFrom(
          eb.selectFrom(
            eb.selectFrom('health_worker_web_notifications as referral_notifications')
              .whereRef('referral_notifications.row_id', '=', 'chart_review_workflows.id')
              .where('referral_notifications.table_name', '=', 'patient_workflows')
              .select((eb_notification) => {
                const chartReviewStarted = () =>
                  eb_notification.selectFrom('patient_workflows_started as chart_review_started')
                    .innerJoin(
                      'patient_encounter_employees as chart_review_employees',
                      'chart_review_employees.id',
                      'chart_review_started.patient_encounter_employee_id',
                    )
                    .innerJoin(
                      'employment as chart_review_employment',
                      'chart_review_employment.id',
                      'chart_review_employees.employment_id',
                    )
                    .whereRef(
                      'chart_review_started.patient_workflow_id',
                      '=',
                      'chart_review_workflows.id',
                    )
                    .whereRef(
                      'chart_review_employment.health_worker_id',
                      '=',
                      'referral_notifications.health_worker_id',
                    )

                return [
                  'referral_notifications.created_at as notified_at',
                  'referral_notifications.seen_at',
                  jsonObjectFrom(
                    health_workers.baseQuery(trx, {})
                      .where(
                        'health_workers.id',
                        '=',
                        eb_notification.ref('referral_notifications.health_worker_id'),
                      ),
                  ).$notNull().as('health_worker'),
                  chartReviewStarted()
                    .select('chart_review_started.created_at')
                    .orderBy('chart_review_started.created_at', 'asc')
                    .limit(1)
                    .as('review_started_at'),
                  chartReviewStarted()
                    .innerJoin(
                      'patient_workflows_completed as chart_review_completed',
                      'chart_review_completed.id',
                      'chart_review_started.id',
                    )
                    .select('chart_review_completed.created_at')
                    .orderBy('chart_review_completed.created_at', 'asc')
                    .limit(1)
                    .as('review_completed_at'),
                ]
              })
              .as('recipient_notifications'),
          )
            .orderBy('recipient_notifications.notified_at', 'asc')
            .select((eb_recipient) => [
              'recipient_notifications.health_worker',
              jsonBuildObject({
                state: eb_recipient.case()
                  .when('recipient_notifications.review_completed_at', 'is not', null)
                  .then(literalString('reverted' as const))
                  .when('recipient_notifications.review_started_at', 'is not', null)
                  .then(literalString('reviewing' as const))
                  .when('recipient_notifications.seen_at', 'is not', null)
                  .then(literalString('seen' as const))
                  .else(literalString('not_seen' as const))
                  .end(),
                as_of: eb_recipient.fn.coalesce(
                  'recipient_notifications.review_completed_at',
                  'recipient_notifications.review_started_at',
                  'recipient_notifications.seen_at',
                  'recipient_notifications.notified_at',
                ),
              }).as('referral_state'),
            ]),
        ).as('recipients'),
      ])
  },
  formatResult: identity,
  insert(
    trx: TrxOrDbOrQueryCreator,
    {
      patient_id,
      patient_encounter_id,
      organization_id,
      employment_id,
      originator_health_worker_id,
      originator_avatar_url,
      health_worker_ids_to_be_notified,
    }: {
      patient_id: string
      patient_encounter_id: string
      organization_id: string
      employment_id: string
      originator_health_worker_id: string
      originator_avatar_url: string
      health_worker_ids_to_be_notified: string[]
    },
  ) {
    assertOr400(
      health_worker_ids_to_be_notified.length,
      'Must specify at least one colleague to refer the case to',
    )

    const procedure_id = generateUUID()

    return insertOneQuery(trx, {
      patient_id,
      patient_encounter_id,
      employment_id,
      procedure_id,
      procedure: parseExpressionExpectingAtom(
        `(procedure ${PROCEDURE.s_expression} ${REFERRAL_TO_PERSON.s_expression})`,
        'procedure',
      ),
    })
      .with(
        'inserting_chart_review_workflow',
        (qb) =>
          qb.insertInto('patient_workflows')
            .values({
              id: procedure_id,
              patient_encounter_id,
              workflow: 'chart_review',
            }),
      )
      .with(
        'inserting_notifications',
        (qb) =>
          qb.insertInto('health_worker_web_notifications')
            .values(health_worker_ids_to_be_notified.map((health_worker_id) => ({
              health_worker_id,
              originator_health_worker_id,
              patient_encounter_id,
              table_name: 'patient_workflows',
              row_id: procedure_id,
              notification_type: 'case_referral',
              title: 'Chart review',
              description: 'A case was referred to you to review',
              action_title: 'Review Chart',
              action_href: `/app/organizations/${organization_id}/patients/${patient_id}/open_encounter/start-workflow/chart_review`,
              avatar_url: originator_avatar_url,
            }))),
      )
      .selectNoFrom([
        success_true,
        literalString(procedure_id).as('referral_id'),
      ])
      .executeTakeFirstOrThrow()
  },
})
