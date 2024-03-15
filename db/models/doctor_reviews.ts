import { SelectQueryBuilder } from 'kysely'
import {
  DB,
  DoctorReviewStep,
  Employment,
  Facilities,
  HealthWorkers,
} from '../../db.d.ts'
import {
  Maybe,
  RenderedDoctorReview,
  RenderedDoctorReviewRequest,
  TrxOrDb,
} from '../../types.ts'
import {
  jsonArrayFromColumn,
  jsonBuildObject,
  jsonObjectFrom,
} from '../helpers.ts'
import { getCardQuery } from './patients.ts'

export function ofHealthWorker(
  trx: TrxOrDb,
  health_worker_id: number,
): SelectQueryBuilder<DB, 'doctor_reviews', RenderedDoctorReview> {
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
      'facilities as requested_by_facility',
      'requested_by_employee.facility_id',
      'requested_by_facility.id',
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
        facility: jsonBuildObject({
          id: eb.ref('requested_by_facility.id'),
          name: eb.ref('requested_by_facility.name'),
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
    requested_by_facility: Facilities
  } & {
    requested_by_health_worker: HealthWorkers
  },
  | 'doctor_review_requests'
  | 'employment'
  | 'patient_encounter_providers'
  | 'patient_encounters'
  | 'requested_by_employee'
  | 'requested_by_facility'
  | 'requested_by_health_worker',
  RenderedDoctorReviewRequest
> {
  return trx.selectFrom('doctor_review_requests')
    .innerJoin(
      'employment',
      'doctor_review_requests.requesting_doctor_id',
      'employment.id',
    )
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
      'facilities as requested_by_facility',
      'requested_by_employee.facility_id',
      'requested_by_facility.id',
    )
    .innerJoin(
      'health_workers as requested_by_health_worker',
      'requested_by_employee.health_worker_id',
      'requested_by_health_worker.id',
    )
    .select((eb) => [
      'doctor_review_requests.id as review_request_id',
      'employment.id as employment_id',
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
        facility: jsonBuildObject({
          id: eb.ref('requested_by_facility.id'),
          name: eb.ref('requested_by_facility.name'),
        }),
      }).as('requested_by'),
    ])
    .where('doctor_review_requests.pending', '=', false)
}

export function start(
  trx: TrxOrDb,
  { review_request_id, employment_id }: {
    review_request_id: number
    employment_id: number
  },
) {
  return trx.insertInto('doctor_reviews')
    .columns(['patient_id', 'encounter_id', 'requested_by', 'reviewer_id'])
    .expression((eb) =>
      eb.selectFrom('doctor_review_requests')
        .where('id', '=', review_request_id)
        .select([
          'patient_id',
          'encounter_id',
          'requested_by',
          eb.lit(employment_id).as('reviewer_id'),
        ])
    )
    .returning('id')
    .executeTakeFirstOrThrow()
}

// TODO: check that if you redo a step the updated_at is updated
export function completedStep(
  trx: TrxOrDb,
  values: {
    doctor_review_id: number
    step: DoctorReviewStep
  },
) {
  return trx.insertInto('doctor_review_steps')
    .values(values)
    .onConflict((oc) => oc.doNothing())
    .execute()
}

export function makeRequest(
  trx: TrxOrDb,
  { requesting_doctor_id, ...values }: {
    patient_id: number
    encounter_id: number
    requested_by: number
    facility_id: number | null
    requesting_doctor_id: number | null
    requester_notes?: Maybe<string>
  },
) {
  return trx.insertInto('doctor_review_requests')
    .values({
      ...values,
      // ensures that requesting_doctor_id is a doctor
      requesting_doctor_id: requesting_doctor_id && (
        trx.selectFrom('employment')
          .where('id', '=', requesting_doctor_id)
          .where('profession', '=', 'doctor')
          .select('id')
      ),
    })
    .returning('id')
    .executeTakeFirstOrThrow()
}

export function finalizeRequest(
  trx: TrxOrDb,
  opts: {
    requested_by: number
  },
) {
  return trx.updateTable('doctor_review_requests')
    .set('pending', false)
    .where('requested_by', '=', opts.requested_by)
    .executeTakeFirst()
}

export function getRequest(
  trx: TrxOrDb,
  opts: {
    requested_by: number
  },
): Promise<
  {
    facility: null | {
      id: number
      name: string
      address: string | null
    }
    doctor: null | {
      id: number
      name: string
    }
    requester_notes: null | string
  } | undefined
> {
  return trx.selectFrom('doctor_review_requests')
    .where('requested_by', '=', opts.requested_by)
    .select((eb) => [
      'requester_notes',
      jsonObjectFrom(
        eb.selectFrom('facilities')
          .whereRef('facilities.id', '=', 'doctor_review_requests.facility_id')
          .select([
            'id',
            'name',
            'address',
          ]),
      ).as('facility'),
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
