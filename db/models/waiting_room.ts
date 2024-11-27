import { sql } from 'kysely'
import { assert } from 'std/assert/assert.ts'
import {
  EmployedHealthWorker,
  RenderedWaitingRoom,
  TrxOrDb,
  WaitingRoom,
} from '../../types.ts'
import * as patients from './patients.ts'
import { jsonArrayFrom, jsonBuildObject } from '../helpers.ts'
import { DOCTOR_REVIEW_STEPS } from '../../shared/review.ts'
import { hasName } from '../../util/haveNames.ts'
import capitalize from '../../util/capitalize.ts'
import sortBy from '../../util/sortBy.ts'

export function add(
  trx: TrxOrDb,
  opts: WaitingRoom,
) {
  return trx
    .insertInto('waiting_room')
    .values(opts)
    .returning('id')
    .executeTakeFirstOrThrow()
}

export function remove(
  trx: TrxOrDb,
  { id }: { id: string },
) {
  return trx
    .deleteFrom('waiting_room')
    .where('id', '=', id)
    .execute()
}

export function arrivedAgoDisplay(wait_time: string) {
  const day_regex = /(^\d+ days?)/

  const day_match = wait_time.match(day_regex)

  if (day_match) {
    return `${day_match[1]} ago`
  }
  const [hours, minutes] = wait_time.split(':').map(Number)

  if (!hours && !minutes) {
    return 'Just now'
  }
  if (hours > 1) {
    return `${hours} hours ago`
  }
  if (hours === 0 && minutes === 1) {
    return '1 minute ago'
  }
  return `${(60 * hours) + minutes} minutes ago`
}

// A slight misnomer, this function returns the patients in the waiting room
// and the patients who are actively being seen by a provider at the organization.
export async function get(
  trx: TrxOrDb,
  { organization_id, health_worker }: {
    organization_id: string
    health_worker: EmployedHealthWorker
  },
): Promise<RenderedWaitingRoom[]> {
  const organization_waiting_room = trx
    .selectFrom('waiting_room')
    .where('waiting_room.organization_id', '=', organization_id)
    .select('patient_encounter_id')

  const seeing_organization_providers = trx
    .selectFrom('patient_encounter_providers')
    .innerJoin(
      'employment',
      'patient_encounter_providers.provider_id',
      'employment.id',
    )
    .where('employment.organization_id', '=', organization_id)
    .select('patient_encounter_providers.patient_encounter_id')

  const review_requested_of_organization = trx
    .selectFrom('doctor_review_requests')
    .where('doctor_review_requests.organization_id', '=', organization_id)
    .select('encounter_id as patient_encounter_id')

  const actively_being_reviewed_by_organization_doctor = trx
    .selectFrom('doctor_reviews')
    .innerJoin('employment', 'doctor_reviews.reviewer_id', 'employment.id')
    .where('employment.organization_id', '=', organization_id)
    .where('doctor_reviews.completed_at', 'is', null)
    .select('doctor_reviews.encounter_id as patient_encounter_id')

  const encounters_to_show = organization_waiting_room
    .union(seeing_organization_providers)
    .union(review_requested_of_organization)
    .union(actively_being_reviewed_by_organization_doctor)
    .distinct()

  const query = trx
    .selectFrom('patient_encounters')
    .leftJoin(
      'waiting_room',
      (join) =>
        join
          .onRef(
            'waiting_room.patient_encounter_id',
            '=',
            'patient_encounters.id',
          )
          .on('waiting_room.organization_id', '=', organization_id),
    )
    .innerJoin('patients', 'patients.id', 'patient_encounters.patient_id')
    .leftJoin(
      'appointments',
      'appointments.id',
      'patient_encounters.appointment_id',
    )
    .leftJoin(
      'doctor_reviews',
      'doctor_reviews.encounter_id',
      'patient_encounters.id',
    )
    .leftJoin(
      'doctor_review_requests',
      'doctor_review_requests.encounter_id',
      'patient_encounters.id',
    )
    .select((eb) => [
      jsonBuildObject({
        id: eb.ref('patients.id'),
        name: eb.ref('patients.name'),
        avatar_url: patients.avatar_url_sql,
        description: sql<
          string | null
        >`patients.gender || ', ' || to_char(date_of_birth, 'DD/MM/YYYY')`,
      }).as('patient'),
      'patient_encounters.reason',
      eb('patient_encounters.reason', '=', 'emergency').as('is_emergency'),
      'appointments.id as appointment_id',
      'appointments.start as appointment_start',
      'doctor_review_requests.organization_id as requesting_organization_id',
      'completed_intake',

      sql<string>`(current_timestamp - patient_encounters.created_at)::interval`
        .as('wait_time'),
      eb('waiting_room.id', 'is not', null).as('in_waiting_room'),

      eb.selectFrom('intake')
        .leftJoin(
          'patient_intake',
          (join) =>
            join
              .onRef('patient_intake.intake_step', '=', 'intake.step')
              .onRef('patient_intake.patient_id', '=', 'patients.id'),
        )
        .where('patient_intake.id', 'is', null)
        .orderBy('intake.order', 'asc')
        .select('step')
        .limit(1)
        .as('awaiting_intake_step'),

      eb.selectFrom('intake')
        .innerJoin(
          'patient_intake',
          (join) =>
            join
              .onRef('patient_intake.intake_step', '=', 'intake.step')
              .onRef('patient_intake.patient_id', '=', 'patients.id'),
        )
        .orderBy('intake.order', 'desc')
        .select('step')
        .limit(1)
        .as('last_completed_intake_step'),

      eb.selectFrom('encounter')
        .leftJoin(
          'patient_encounter_steps',
          (join) =>
            join
              .onRef(
                'patient_encounter_steps.encounter_step',
                '=',
                'encounter.step',
              )
              .onRef(
                'patient_encounter_steps.patient_encounter_id',
                '=',
                'patient_encounters.id',
              ),
        )
        .where('patient_encounter_steps.id', 'is', null)
        .orderBy('encounter.order', 'asc')
        .select('step')
        .limit(1)
        .as('awaiting_encounter_step'),

      eb.selectFrom('encounter')
        .innerJoin(
          'patient_encounter_steps',
          (join) =>
            join
              .onRef(
                'patient_encounter_steps.encounter_step',
                '=',
                'encounter.step',
              )
              .onRef(
                'patient_encounter_steps.patient_encounter_id',
                '=',
                'patient_encounters.id',
              ),
        )
        .orderBy('encounter.order', 'desc')
        .select('step')
        .limit(1)
        .as('last_completed_encounter_step'),

      jsonArrayFrom(
        eb.selectFrom('doctor_review')
          .leftJoin(
            'doctor_review_steps',
            (join) =>
              join
                .onRef(
                  'doctor_review_steps.step',
                  '=',
                  'doctor_review.step',
                )
                .onRef(
                  'doctor_review_steps.doctor_review_id',
                  '=',
                  'doctor_reviews.id',
                ),
          )
          .orderBy('doctor_review.order', 'asc')
          .where((eb) =>
            eb.or([
              eb('doctor_reviews.id', 'is not', null),
              eb('doctor_review_requests.id', 'is not', null),
            ])
          )
          .select((eb) => [
            'doctor_review.step',
            eb('doctor_review_steps.step', 'is not', null).as('completed'),
          ]),
      ).as('review_steps'),

      eb('doctor_review_requests.id', 'is not', null).as('awaiting_review'),
      eb('doctor_reviews.id', 'is not', null).as('in_review'),

      jsonArrayFrom(
        eb.selectFrom('appointment_providers')
          .innerJoin(
            'employment',
            'employment.id',
            'appointment_providers.provider_id',
          )
          .innerJoin(
            'health_workers',
            'health_workers.id',
            'employment.health_worker_id',
          )
          .whereRef(
            'appointment_providers.appointment_id',
            '=',
            'appointments.id',
          )
          .select([
            'health_workers.id as health_worker_id',
            'employment.id as provider_id',
            'health_workers.name',
            'health_workers.avatar_url',
          ]),
      ).as('appointment_providers'),

      jsonArrayFrom(
        eb.selectFrom('patient_encounter_providers')
          .innerJoin(
            'employment',
            'patient_encounter_providers.provider_id',
            'employment.id',
          )
          .innerJoin(
            'health_workers',
            'health_workers.id',
            'employment.health_worker_id',
          )
          .whereRef(
            'patient_encounter_providers.patient_encounter_id',
            '=',
            'patient_encounters.id',
          )
          .select((eb_providers) => [
            'employment.health_worker_id',
            'employment.id as employee_id',
            'health_workers.name',
            'health_workers.avatar_url',
            'employment.profession',
            eb_providers('patient_encounter_providers.seen_at', 'is not', null)
              .as('seen'),
            sql<
              string
            >`concat('/app/organizations/', employment.organization_id::text, '/employees/', health_workers.id::text)`
              .as('href'),
          ]),
      ).as('providers'),

      jsonArrayFrom(
        eb.selectFrom(
          'employment',
        )
          .innerJoin(
            'health_workers',
            'health_workers.id',
            'employment.health_worker_id',
          )
          .where((eb2) =>
            eb2.or([
              eb2(
                'employment.id',
                '=',
                eb2.ref('doctor_reviews.reviewer_id'),
              ),
              eb2(
                'employment.id',
                '=',
                eb2.ref('doctor_review_requests.doctor_id'),
              ),
            ])
          )
          .select((eb2) => [
            'employment.health_worker_id',
            'employment.organization_id',
            'employment.id as employee_id',
            'health_workers.name',
            'employment.profession',
            'health_workers.avatar_url',
            eb2.and([
              eb2('doctor_reviews.reviewer_id', 'is not', null),
              eb2(
                'employment.id',
                '=',
                eb2.ref('doctor_reviews.reviewer_id'),
              ),
            ])
              .as('seen'),
            sql<
              string
            >`concat('/app/organizations/', employment.organization_id::text, '/employees/', health_workers.id::text)`
              .as('href'),
          ]),
      ).as('reviewers'),
    ])
    .where('patient_encounters.id', 'in', encounters_to_show)
    .where((eb) =>
      eb.or([
        eb('patient_encounters.closed_at', 'is', null),
        eb('doctor_reviews.id', 'is not', null),
        eb('doctor_review_requests.id', 'is not', null),
      ])
    )
    .orderBy(['is_emergency desc', 'patient_encounters.created_at asc'])

  const organizations_where_doctor = health_worker.employment.filter((e) =>
    e.roles.doctor?.registration_completed
  )

  const patients_in_waiting_room = await query.execute()

  const waiting_room_unsorted = patients_in_waiting_room.map(
    (
      {
        patient,
        appointment_id,
        appointment_start,
        appointment_providers,
        wait_time,
        completed_intake,
        in_waiting_room,
        awaiting_intake_step,
        last_completed_intake_step,
        awaiting_encounter_step,
        last_completed_encounter_step,
        awaiting_review,
        in_review,
        review_steps,
        requesting_organization_id,
        reviewers,
        ...rest
      },
    ) => {
      assert(hasName(patient), 'Patient must have a name')

      let appointment: RenderedWaitingRoom['appointment'] = null
      if (appointment_id) {
        assert(appointment_start, 'Appointment must have a start time')
        assert(
          appointment_providers?.length,
          'Appointment must have at least one health worker',
        )
        appointment = {
          id: appointment_id,
          start: appointment_start,
          providers: appointment_providers,
        }
      }
      const awaiting_review_step = review_steps.find(
        (step) => !step.completed,
      )?.step

      // TODO: clean this up?
      let status: string
      if (awaiting_review) {
        status = 'Awaiting Review'
      } else if (in_review) {
        status = 'In Review'
        if (awaiting_review_step) {
          status += ` (${capitalize(awaiting_review_step)})`
        }
      } else if (completed_intake) {
        if (in_waiting_room) {
          if (last_completed_encounter_step) {
            assert(awaiting_encounter_step)
            status = `Awaiting Consultation (${
              capitalize(awaiting_encounter_step)
            })`
          } else {
            status = 'Awaiting Consultation'
          }
        } else {
          assert(awaiting_encounter_step)
          status = `In Consultation (${capitalize(awaiting_encounter_step)})`
        }
      } else {
        if (in_waiting_room) {
          if (last_completed_intake_step) {
            assert(awaiting_intake_step)
            status = `Awaiting Intake (${capitalize(awaiting_intake_step)})`
          } else {
            status = 'Awaiting Intake'
          }
        } else {
          assert(awaiting_intake_step)
          status = `In Intake (${capitalize(awaiting_intake_step)})`
        }
      }
      assert(status)

      const can_review =
        reviewers.some((r) => r.health_worker_id === health_worker.id) || (
          !!requesting_organization_id &&
          organizations_where_doctor.some((e) =>
            e.organization.id === requesting_organization_id
          )
        )

      const action = awaiting_review || in_review
        ? 'review'
        : completed_intake
        ? 'view'
        : 'intake'

      return {
        ...rest,
        patient,
        status,
        in_waiting_room,
        appointment,
        reviewers,
        arrived_ago_display: arrivedAgoDisplay(wait_time),
        actions: {
          view: action === 'view' ? `/app/patients/${patient.id}` : null,
          intake: action === 'intake'
            ? `/app/patients/${patient.id}/intake`
            : null,
          review: action === 'review' && can_review
            ? `/app/patients/${patient.id}/review/${
              awaiting_review_step || DOCTOR_REVIEW_STEPS[0]
            }`
            : null,
          awaiting_review: action === 'review' && !can_review
            ? {
              text: 'Awaiting Review',
              disabled: true,
            }
            : null,
        },
      }
    },
  )

  return sortBy(
    waiting_room_unsorted,
    (row) => row.status.startsWith('Awaiting') ? 0 : 1,
  )
}
