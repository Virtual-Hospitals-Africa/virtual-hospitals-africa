import { SelectQueryBuilder } from 'kysely'
import {
  DB,
  DoctorReviewStep,
  Employment,
  // EncounterReason,
  HealthWorkers,
  Organization,
} from '../../db.d.ts'
import {
  HealthWorkerEmployment,
  Maybe,
  RenderedDoctorReview,
  RenderedDoctorReviewRequest,
  RenderedDoctorReviewRequestOfSpecificDoctor,
  TrxOrDb,
} from '../../types.ts'
import {
  jsonArrayFromColumn,
  jsonBuildObject,
  jsonObjectFrom,
  literalString,
  now,
} from '../helpers.ts'
import { getCardQuery } from './patients.ts'
import { assert } from 'std/assert/assert.ts'
import { EmployedHealthWorker } from '../../types.ts'
import { assertOr403 } from '../../util/assertOr.ts'

export function ofHealthWorker(
  trx: TrxOrDb,
  health_worker_id: string,
) {
  return trx.selectFrom('doctor_reviews')
    .innerJoin('employment', 'doctor_reviews.reviewer_id', 'employment.id')
    .innerJoin(
      'patient_encounter_providers',
      'doctor_reviews.requested_by',
      'patient_encounter_providers.id',
    )
    .innerJoin(
      'patient_encounters',
      'doctor_reviews.encounter_id',
      'patient_encounters.id',
    )
    .innerJoin(
      'employment as requested_by_employee',
      'patient_encounter_providers.provider_id',
      'requested_by_employee.id',
    )
    .innerJoin(
      'Organization',
      'requested_by_employee.organization_id',
      'Organization.id',
    )
    .innerJoin(
      'health_workers as requested_by_health_worker',
      'requested_by_employee.health_worker_id',
      'requested_by_health_worker.id',
    )
    .where('employment.health_worker_id', '=', health_worker_id)
    .select((eb) => [
      'doctor_reviews.id as review_id',
      'employment.id as employment_id',
      eb('completed_at', 'is not', null).as('completed'),
      jsonBuildObject({
        id: eb.ref('patient_encounters.id'),
        reason: eb.ref('patient_encounters.reason'),
      }).as('encounter'),
      jsonObjectFrom(
        getCardQuery(trx).where(
          'patients.id',
          '=',
          eb.ref('doctor_reviews.patient_id'),
        ),
      ).$notNull().as('patient'),
      jsonBuildObject({
        name: eb.ref('requested_by_health_worker.name'),
        avatar_url: eb.ref('requested_by_health_worker.avatar_url'),
        profession: eb.ref('requested_by_employee.profession').$castTo<
          'doctor' | 'nurse'
        >(),
        patient_encounter_provider_id: eb.ref('patient_encounter_providers.id'),
        organization: jsonBuildObject({
          id: eb.ref('Organization.id'),
          name: eb.ref('Organization.canonicalName'),
        }),
      }).as('requested_by'),
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

export function requests(
  trx: TrxOrDb,
): SelectQueryBuilder<
  DB & {
    requested_by_employee: Employment
  } & {
    requested_by_organization: Organization
  } & {
    requested_by_health_worker: HealthWorkers
  },
  | 'doctor_review_requests'
  | 'patient_encounter_providers'
  | 'patient_encounters'
  | 'requested_by_employee'
  | 'requested_by_organization'
  | 'requested_by_health_worker',
  RenderedDoctorReviewRequest
> {
  return trx.selectFrom('doctor_review_requests')
    .innerJoin(
      'patient_encounter_providers',
      'doctor_review_requests.requested_by',
      'patient_encounter_providers.id',
    )
    .innerJoin(
      'patient_encounters',
      'doctor_review_requests.encounter_id',
      'patient_encounters.id',
    )
    .innerJoin(
      'employment as requested_by_employee',
      'patient_encounter_providers.provider_id',
      'requested_by_employee.id',
    )
    .innerJoin(
      'Organization as requested_by_organization',
      'requested_by_employee.organization_id',
      'requested_by_organization.id',
    )
    .innerJoin(
      'health_workers as requested_by_health_worker',
      'requested_by_employee.health_worker_id',
      'requested_by_health_worker.id',
    )
    .select((eb) => [
      'doctor_review_requests.id as review_request_id',
      jsonBuildObject({
        id: eb.ref('patient_encounters.id'),
        reason: eb.ref('patient_encounters.reason'),
      }).as('encounter'),
      jsonObjectFrom(
        getCardQuery(trx).where(
          'patients.id',
          '=',
          eb.ref('doctor_review_requests.patient_id'),
        ),
      ).$notNull().as('patient'),
      jsonBuildObject({
        name: eb.ref('requested_by_health_worker.name'),
        avatar_url: eb.ref('requested_by_health_worker.avatar_url'),
        profession: eb.ref('requested_by_employee.profession').$castTo<
          'doctor' | 'nurse'
        >(),
        patient_encounter_provider_id: eb.ref('patient_encounter_providers.id'),
        organization: jsonBuildObject({
          id: eb.ref('requested_by_organization.id'),
          name: eb.ref('requested_by_organization.canonicalName'),
        }),
      }).as('requested_by'),
    ])
    .where('doctor_review_requests.pending', '=', false)
}

export function requestsOfHealthWorker(
  trx: TrxOrDb,
  health_worker_id: string,
) {
  return requests(trx)
    .innerJoin(
      'employment',
      'doctor_review_requests.requesting_doctor_id',
      'employment.id',
    )
    .where(
      'employment.health_worker_id',
      '=',
      health_worker_id,
    )
    .select('employment.id as employment_id')
}

export async function requestMatchingEmployment(
  trx: TrxOrDb,
  patient_id: string,
  organizations_where_doctor: HealthWorkerEmployment[],
): Promise<RenderedDoctorReviewRequestOfSpecificDoctor | null> {
  const request = await requests(trx)
    .select('doctor_review_requests.organization_id')
    .where('doctor_review_requests.patient_id', '=', patient_id)
    .where(
      'doctor_review_requests.organization_id',
      'in',
      organizations_where_doctor.map(
        (employment) => employment.organization.id,
      ),
    )
    .executeTakeFirst()

  if (!request) return null

  const matching_employment = organizations_where_doctor.find(
    (employment) => employment.organization.id === request.organization_id,
  )
  assert(matching_employment)
  assert(matching_employment.roles.doctor)
  return {
    ...request,
    employment_id: matching_employment.roles.doctor.employment_id,
  }
}

export async function start(
  trx: TrxOrDb,
  { review_request_id, employment_id }: {
    review_request_id: string
    employment_id: string
  },
) {
  const starting_review = trx.insertInto('doctor_reviews')
    .columns(['patient_id', 'encounter_id', 'requested_by', 'reviewer_id'])
    .expression((eb) =>
      eb.selectFrom('doctor_review_requests')
        .where('id', '=', review_request_id)
        .select([
          'patient_id',
          'encounter_id',
          'requested_by',
          literalString(employment_id).as('reviewer_id'),
        ])
    )
    .returning('id')
    .executeTakeFirstOrThrow()

  await trx.deleteFrom('doctor_review_requests')
    .where('id', '=', review_request_id)
    .execute()

  return starting_review
}

export async function addSelfAsReviewer(
  trx: TrxOrDb,
  { patient_id, health_worker }: {
    patient_id: string
    health_worker: EmployedHealthWorker
  },
): Promise<{
  doctor_review: RenderedDoctorReview
}> {
  const in_progress = health_worker.reviews.in_progress.find((review) =>
    review.patient.id === patient_id
  )
  if (in_progress) {
    return { doctor_review: in_progress }
  }

  const organizations_where_doctor = health_worker.employment.filter(
    (employment) => !!employment.roles.doctor,
  )
  assertOr403(
    organizations_where_doctor.length,
    'Only doctors can review patient encounters',
  )

  const requested =
    health_worker.reviews.requested.find((review) =>
      review.patient.id === patient_id
    ) ||
    await requestMatchingEmployment(
      trx,
      patient_id,
      organizations_where_doctor,
    )

  assertOr403(
    requested,
    'No review requested from you or your organization for this patient',
  )

  const review = await start(trx, {
    review_request_id: requested.review_request_id,
    employment_id: requested.employment_id,
  })

  const started_review = {
    ...requested,
    review_id: review.id,
    steps_completed: [],
    completed: false,
  }
  health_worker.reviews.in_progress.push(started_review)
  health_worker.reviews.requested = health_worker.reviews.requested.filter(
    (review) => review !== requested,
  )

  return { doctor_review: started_review }
}

export function completedStep(
  trx: TrxOrDb,
  values: {
    doctor_review_id: string
    step: DoctorReviewStep
  },
) {
  return trx.insertInto('doctor_review_steps')
    .values(values)
    .onConflict((oc) =>
      oc.doUpdateSet({
        updated_at: now,
      })
    )
    .execute()
}

export async function upsertRequest(
  trx: TrxOrDb,
  { id, requesting_doctor_id, ...values }: {
    id?: Maybe<string>
    patient_id: string
    encounter_id: string
    requested_by: string
    organization_id?: string | null
    requesting_doctor_id?: string | null
    requester_notes?: Maybe<string>
  },
) {
  const to_upsert = {
    ...values,
    requesting_doctor_id: requesting_doctor_id && (
      trx.selectFrom('employment')
        .where('id', '=', requesting_doctor_id)
        .where('profession', '=', 'doctor')
        .select('id')
    ),
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
}

export function deleteRequest(trx: TrxOrDb, id: string) {
  return trx.deleteFrom('doctor_review_requests')
    .where('id', '=', id)
    .execute()
}

export function finalizeRequest(
  trx: TrxOrDb,
  opts: {
    patient_encounter_id: string
    requested_by: string
  },
) {
  return trx.updateTable('doctor_review_requests')
    .set('pending', false)
    .where('encounter_id', '=', opts.patient_encounter_id)
    .where('requested_by', '=', opts.requested_by)
    .executeTakeFirst()
}

export function getRequest(
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
        eb.selectFrom('Organization')
          .leftJoin(
            'Address as OrganizationAddress',
            'Organization.id',
            'OrganizationAddress.resourceId',
          )
          .whereRef(
            'Organization.id',
            '=',
            'doctor_review_requests.organization_id',
          )
          .select([
            'Organization.id',
            'Organization.canonicalName as name',
            'OrganizationAddress.address',
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
            'doctor_review_requests.requesting_doctor_id',
          )
          .select([
            'employment.id',
            'health_workers.name',
          ]),
      ).as('doctor'),
    ])
    .executeTakeFirst()
}
