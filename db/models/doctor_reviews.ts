import { assert } from 'std/assert/assert.ts'
import { SelectQueryBuilder, sql } from 'kysely'
import { DB, DoctorReviewStep } from '../../db.d.ts'
import {
  HealthWorkerOrganization,
  IdSelection,
  Maybe,
  RenderedDoctorReview,
  RenderedDoctorReviewRequest,
  RenderedDoctorReviewRequestOfSpecificDoctor,
  TrxOrDb,
} from '../../types.ts'
import { jsonArrayFromColumn, jsonBuildObject, jsonObjectFrom, literalString, now } from '../helpers.ts'
import roleByProfession from '../../shared/roleByProfession.ts'
import { EmployedHealthWorker } from '../../types.ts'
import { assertOr403 } from '../../util/assertOr.ts'
import { avatar_url_sql, description_sql } from './patients.ts'
import { patient_encounter_employees } from './patient_encounter_employees.ts'
import { exists } from '../../util/exists.ts'
import { base } from './_base.ts'

export const view_href_sql = sql<string>`
  concat('/app/patients/', patients.id::text)
`

export type PatientCard = {
  id: string
  name: string
  description: string | null
  avatar_url: string | null
  primary_doctor_id: string | null
  actions: {
    view: string
  }
}

function ensureDoctorId(
  trx: TrxOrDb,
  doctor_id: string,
) {
  return trx.selectFrom('employment')
    .where('id', '=', doctor_id)
    .where('profession', '=', 'doctor')
    .select('id')
}

function getCardQuery(
  trx: TrxOrDb,
): SelectQueryBuilder<DB, 'patients', PatientCard> {
  return trx.selectFrom('patients')
    .leftJoin('patient_age', 'patient_age.patient_id', 'patients.id')
    .select((eb) => [
      'patients.id',
      eb.ref('patients.name').$notNull().as('name'),
      description_sql.as('description'),
      avatar_url_sql.as('avatar_url'),
      'patients.primary_doctor_id',
      jsonBuildObject({
        view: view_href_sql,
      }).as('actions'),
    ])
}

function baseQuery(
  trx: TrxOrDb,
) {
  return trx.selectFrom('doctor_reviews')
    .innerJoin(
      'patient_encounters',
      'doctor_reviews.patient_encounter_id',
      'patient_encounters.id',
    )
    .select((eb) => [
      'doctor_reviews.id as review_id',
      'doctor_reviews.reviewer_id as employment_id',
      eb('completed_at', 'is not', null).as('completed'),
      jsonBuildObject({
        id: eb.ref('patient_encounters.id'),
        reason: eb.ref('patient_encounters.reason').$notNull(),
      }).as('encounter'),
      jsonObjectFrom(
        getCardQuery(trx).where(
          'patients.id',
          '=',
          eb.ref('doctor_reviews.patient_id'),
        ),
      ).$notNull().as('patient'),
      jsonObjectFrom(
        patient_encounter_employees.baseQuery(trx)
          .where(
            'patient_encounter_employees.id',
            '=',
            eb.ref('doctor_reviews.requested_by'),
          ),
      ).$notNull().as('requested_by'),
      jsonArrayFromColumn(
        'step',
        eb.selectFrom('doctor_review_steps')
          .whereRef(
            'doctor_review_steps.doctor_review_id',
            '=',
            'doctor_reviews.id',
          )
          .select('step'),
      ).as('steps_completed'),
    ])
}

function requests(
  trx: TrxOrDb,
): SelectQueryBuilder<
  DB,
  'doctor_review_requests' | 'patient_encounters',
  RenderedDoctorReviewRequest
> {
  return trx.selectFrom('doctor_review_requests')
    .innerJoin(
      'patient_encounters',
      'doctor_review_requests.patient_encounter_id',
      'patient_encounters.id',
    )
    .where('patient_encounters.reason', 'is not', null)
    .select((eb) => [
      'doctor_review_requests.id as review_request_id',
      jsonBuildObject({
        doctor_id: eb.ref('doctor_review_requests.doctor_id'),
        organization_id: eb.ref('doctor_review_requests.organization_id'),
      }).as('requesting'),
      jsonBuildObject({
        id: eb.ref('patient_encounters.id'),
        reason: eb.ref('patient_encounters.reason').$notNull(),
      }).as('encounter'),
      jsonObjectFrom(
        getCardQuery(trx).where(
          'patients.id',
          '=',
          eb.ref('doctor_review_requests.patient_id'),
        ),
      ).$notNull().as('patient'),
      jsonObjectFrom(
        patient_encounter_employees.baseQuery(trx)
          .where(
            'patient_encounter_employees.id',
            '=',
            eb.ref('doctor_review_requests.requested_by'),
          ),
      ).$notNull().as('requested_by'),
    ])
}

export const doctor_reviews = base({
  top_level_table: 'doctor_reviews' as const,
  baseQuery,
  formatResult: (x: RenderedDoctorReview): RenderedDoctorReview => x,
  handleSearch(
    _qb,
    _opts: { search: string | null },
  ) {
    throw new Error('not implemented')
  },
  getCardQuery,
  requests,
  ofHealthWorker(
    trx: TrxOrDb,
    health_worker_id: string | IdSelection,
  ) {
    return baseQuery(trx)
      .where(
        'doctor_reviews.reviewer_id',
        'in',
        trx.selectFrom('employment')
          .where('health_worker_id', '=', health_worker_id)
          .select('employment.id')
          .distinct(),
      )
  },
  requestById(
    trx: TrxOrDb,
    doctor_review_id: string,
  ) {
    return requests(trx)
      .where('doctor_review_requests.id', '=', doctor_review_id)
      .executeTakeFirstOrThrow()
  },
  requestsOfHealthWorker(
    trx: TrxOrDb,
    health_worker_id: string | IdSelection,
  ) {
    return requests(trx)
      .innerJoin(
        'employment',
        'doctor_review_requests.doctor_id',
        'employment.id',
      )
      .where(
        'employment.health_worker_id',
        '=',
        health_worker_id,
      )
      .select('employment.id as employment_id')
  },
  async requestMatchingEmployment(
    trx: TrxOrDb,
    patient_id: string,
    organizations_where_doctor: HealthWorkerOrganization[],
  ): Promise<RenderedDoctorReviewRequestOfSpecificDoctor | null> {
    const doctor_ids = organizations_where_doctor.map((organization) => {
      const doctor_role = exists(roleByProfession(organization, 'doctor'))
      return doctor_role.employment_id
    })

    const request = await requests(trx)
      .select('doctor_review_requests.organization_id')
      .where('doctor_review_requests.patient_id', '=', patient_id)
      .where((eb) =>
        eb.or([
          eb(
            'doctor_review_requests.organization_id',
            'in',
            organizations_where_doctor.map(
              (organization) => organization.id,
            ),
          ),
          eb(
            'doctor_review_requests.doctor_id',
            'in',
            doctor_ids,
          ),
        ])
      )
      .executeTakeFirst()

    if (!request) return null

    if (request.requesting.doctor_id) {
      return {
        ...request,
        employment_id: request.requesting.doctor_id,
      }
    }

    const matching_employment = organizations_where_doctor.find(
      (organization) => organization.id === request.organization_id,
    )
    assert(matching_employment)
    const doctor_role = roleByProfession(matching_employment, 'doctor')
    assert(doctor_role)
    return {
      ...request,
      employment_id: doctor_role.employment_id,
    }
  },
  start(
    trx: TrxOrDb,
    { review_request_id, employment_id }: {
      review_request_id: string
      employment_id: string
    },
  ) {
    return trx.insertInto('doctor_reviews')
      .columns([
        'patient_id',
        'patient_encounter_id',
        'requested_by',
        'reviewer_id',
      ])
      .expression((eb) =>
        eb.selectFrom('doctor_review_requests')
          .where('id', '=', review_request_id)
          .select([
            'patient_id',
            'patient_encounter_id',
            'requested_by',
            literalString(employment_id).as('reviewer_id'),
          ])
      )
      .returning('id')
      .executeTakeFirstOrThrow()
  },
  async addSelfAsReviewer(
    trx: TrxOrDb,
    { patient_id, health_worker }: {
      patient_id: string
      health_worker: EmployedHealthWorker
    },
  ): Promise<{
    doctor_review: RenderedDoctorReview
  }> {
    const in_progress = await doctor_reviews.ofHealthWorker(
      trx,
      health_worker.id,
    )
      .where('patient_encounters.patient_id', '=', patient_id)
      .executeTakeFirst()

    if (in_progress) {
      return { doctor_review: in_progress }
    }

    const organizations_where_doctor = health_worker.organizations.filter(
      (organization) => !!roleByProfession(organization, 'doctor'),
    )

    assertOr403(
      organizations_where_doctor.length,
      'Only doctors can review patient encounters',
    )

    const requested = await doctor_reviews.requestMatchingEmployment(
      trx,
      patient_id,
      organizations_where_doctor,
    )

    assertOr403(
      requested,
      'No review requested from you or your organization for this patient',
    )

    const review = await doctor_reviews.start(trx, {
      review_request_id: requested.review_request_id,
      employment_id: requested.employment_id,
    })

    const started_review = {
      ...requested,
      reviewer_id: requested.employment_id,
      review_id: review.id,
      steps_completed: [],
      completed: false,
    }

    return { doctor_review: started_review }
  },
  completedStep(
    trx: TrxOrDb,
    values: {
      doctor_review_id: string
      step: DoctorReviewStep
    },
  ) {
    return trx.insertInto('doctor_review_steps')
      .values(values)
      .onConflict((oc) =>
        oc.columns(['doctor_review_id', 'step']).doUpdateSet({
          updated_at: now,
        })
      )
      .execute()
  },
  async upsertRequest(
    trx: TrxOrDb,
    { id, doctor_id, ...values }: {
      id?: Maybe<string>
      patient_id: string
      patient_encounter_id: string
      requested_by: string
      organization_id?: string | null
      doctor_id?: string | null
      requester_notes?: Maybe<string>
    },
  ) {
    const to_upsert = {
      ...values,
      doctor_id: doctor_id && ensureDoctorId(trx, doctor_id),
    }

    if (id) {
      await trx.updateTable('doctor_review_requests')
        .set(to_upsert)
        .where('id', '=', id)
        .executeTakeFirstOrThrow()

      return { id }
    }

    return trx.insertInto('doctor_review_requests')
      .values(to_upsert)
      .returning('id')
      .executeTakeFirstOrThrow()
  },
  deleteRequest(trx: TrxOrDb, id: string) {
    return trx.deleteFrom('doctor_review_requests')
      .where('id', '=', id)
      .execute()
  },
  getRequest(
    trx: TrxOrDb,
    opts: {
      requested_by: string
    },
  ) {
    return trx.selectFrom('doctor_review_requests')
      .where('requested_by', '=', opts.requested_by)
      .select((eb) => [
        'id',
        'requester_notes',
        jsonObjectFrom(
          eb.selectFrom('organizations')
            .leftJoin(
              'addresses as organization_address',
              'organizations.address_id',
              'organization_address.id',
            )
            .whereRef(
              'organizations.id',
              '=',
              'doctor_review_requests.organization_id',
            )
            .select([
              'organizations.id',
              'organizations.name as name',
              'organization_address.formatted as address',
            ]),
        ).as('organization'),
        jsonObjectFrom(
          eb.selectFrom('employment')
            .innerJoin(
              'health_workers',
              'employment.health_worker_id',
              'health_workers.id',
            )
            .whereRef(
              'employment.id',
              '=',
              'doctor_review_requests.doctor_id',
            )
            .select([
              'employment.id',
              'health_workers.name',
            ]),
        ).as('doctor'),
      ])
      .executeTakeFirst()
  },
  complete(
    trx: TrxOrDb,
    opts: {
      review_id: string
    },
  ) {
    return trx.updateTable('doctor_reviews')
      .set({ completed_at: now })
      .where('id', '=', opts.review_id)
      .execute()
  },
})
