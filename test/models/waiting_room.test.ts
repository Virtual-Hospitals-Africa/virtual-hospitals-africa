import { sql } from 'kysely'
import { describe, it } from 'std/testing/bdd.ts'
import * as health_workers from '../../db/models/health_workers.ts'
import * as patient_encounters from '../../db/models/patient_encounters.ts'
import * as doctor_reviews from '../../db/models/doctor_reviews.ts'
import * as waiting_room from '../../db/models/waiting_room.ts'
import * as patients from '../../db/models/patients.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { itUsesTrxAnd, withTestFacility } from '../web/utilities.ts'
import { addTestHealthWorker } from '../web/utilities.ts'
import { removeFromWaitingRoomAndAddSelfAsProvider } from '../../db/models/patient_encounters.ts'

describe(
  'db/models/waiting_room.ts',
  { sanitizeResources: false },
  () => {
    describe('get', () => {
      itUsesTrxAnd(
        'orders the waiting room by when people first arrived',
        (trx) =>
          withTestFacility(trx, async (facility_id) => {
            const patient1 = await patients.upsert(trx, {
              name: 'Test Patient 1',
            })
            const patient2 = await patients.upsert(trx, {
              name: 'Test Patient 2',
            })

            await patient_encounters.upsert(trx, facility_id, {
              patient_id: patient1.id,
              reason: 'seeking treatment',
            })

            await patient_encounters.upsert(trx, facility_id, {
              patient_id: patient2.id,
              reason: 'seeking treatment',
            })

            const waiting_room_results = await waiting_room.get(trx, {
              facility_id,
            })
            assertEquals(waiting_room_results.length, 2)
            const waiting_room_1 = waiting_room_results.find((r) =>
              r.patient.id === patient1.id
            )
            const waiting_room_2 = waiting_room_results.find((r) =>
              r.patient.id === patient2.id
            )
            assertEquals(waiting_room_1!, {
              appointment: null,
              patient: {
                avatar_url: null,
                id: patient1.id,
                name: 'Test Patient 1',
                description: null,
              },
              in_waiting_room: true,
              arrived_ago_display: 'Just now',
              status: 'Awaiting Intake',
              actions: {
                view: null,
                intake: `/app/patients/${patient1.id}/intake/personal`,
                review: null,
              },
              providers: [],
              reviewers: [],
              reason: 'seeking treatment',
              is_emergency: false,
            })
            assertEquals(waiting_room_2!, {
              appointment: null,
              patient: {
                avatar_url: null,
                id: patient2.id,
                name: 'Test Patient 2',
                description: null,
              },
              in_waiting_room: true,
              arrived_ago_display: 'Just now',
              status: 'Awaiting Intake',
              actions: {
                view: null,
                intake: `/app/patients/${patient2.id}/intake/personal`,
                review: null,
              },
              providers: [],
              reviewers: [],
              reason: 'seeking treatment',
              is_emergency: false,
            })
          }),
      )

      itUsesTrxAnd(
        'shows what step of the intake process the patient is awaiting',
        (trx) =>
          withTestFacility(trx, async (facility_id) => {
            const patient = await patients.upsert(trx, {
              name: 'Test Patient 1',
            })

            await patient_encounters.upsert(trx, facility_id, {
              patient_id: patient.id,
              reason: 'seeking treatment',
            })

            await patients.upsertIntake(trx, {
              id: patient.id,
              intake_step_just_completed: 'personal',
            })
            await patients.upsertIntake(trx, {
              id: patient.id,
              intake_step_just_completed: 'address',
            })

            const waiting_room_results = await waiting_room.get(trx, {
              facility_id,
            })

            assertEquals(waiting_room_results, [{
              appointment: null,
              patient: {
                avatar_url: null,
                id: patient.id,
                name: 'Test Patient 1',
                description: null,
              },
              in_waiting_room: true,
              arrived_ago_display: 'Just now',
              status: 'Awaiting Intake (conditions)',
              actions: {
                view: null,
                intake: `/app/patients/${patient.id}/intake/conditions`,
                review: null,
              },
              providers: [],
              reviewers: [],
              reason: 'seeking treatment',
              is_emergency: false,
            }])
          }),
      )

      itUsesTrxAnd(
        'shows what step of the intake process the patient is in',
        (trx) =>
          withTestFacility(trx, async (facility_id) => {
            const patient = await patients.upsert(trx, {
              name: 'Test Patient 1',
            })

            await patient_encounters.upsert(trx, facility_id, {
              patient_id: patient.id,
              reason: 'seeking treatment',
            })

            const nurse = await addTestHealthWorker(trx, {
              facility_id,
              scenario: 'approved-nurse',
            })

            const nurse_health_worker = await health_workers.getEmployed(trx, {
              health_worker_id: nurse.id,
            })

            await removeFromWaitingRoomAndAddSelfAsProvider(trx, {
              patient_id: patient.id,
              health_worker: nurse_health_worker,
              encounter_id: 'open',
            })

            await patients.upsertIntake(trx, {
              id: patient.id,
              intake_step_just_completed: 'personal',
            })
            await patients.upsertIntake(trx, {
              id: patient.id,
              intake_step_just_completed: 'address',
            })

            const waiting_room_results = await waiting_room.get(trx, {
              facility_id,
            })

            assertEquals(waiting_room_results, [{
              appointment: null,
              patient: {
                avatar_url: null,
                id: patient.id,
                name: 'Test Patient 1',
                description: null,
              },
              in_waiting_room: false,
              arrived_ago_display: 'Just now',
              status: 'In Intake (conditions)',
              actions: {
                view: null,
                intake: `/app/patients/${patient.id}/intake/conditions`,
                review: null,
              },
              providers: [{
                name: nurse.name,
                profession: 'nurse',
                href: `/app/facilities/${facility_id}/employees/${nurse.id}`,
                seen: true,
                health_worker_id: nurse.id,
                employee_id: nurse.employee_id!,
              }],
              reviewers: [],
              reason: 'seeking treatment',
              is_emergency: false,
            }])
          }),
      )

      itUsesTrxAnd(
        'orders emergencies at the top, even if they arrived later',
        (trx) =>
          withTestFacility(trx, async (facility_id) => {
            const patient1 = await patients.upsert(trx, {
              name: 'Test Patient 1',
            })
            const patient2 = await patients.upsert(trx, {
              name: 'Test Patient 2',
            })

            await patient_encounters.upsert(trx, facility_id, {
              patient_id: patient1.id,
              reason: 'emergency',
            })

            const seeking_treatment = await trx.insertInto('patient_encounters')
              .values({
                patient_id: patient2.id,
                reason: 'seeking treatment',
                created_at: sql`NOW() - INTERVAL '1 hour'`,
              }).returning('id').executeTakeFirstOrThrow()

            await trx.insertInto('waiting_room').values({
              facility_id,
              patient_encounter_id: seeking_treatment.id,
            }).execute()

            assertEquals(await waiting_room.get(trx, { facility_id }), [
              {
                appointment: null,
                patient: {
                  avatar_url: null,
                  id: patient1.id,
                  name: 'Test Patient 1',
                  description: null,
                },
                in_waiting_room: true,
                arrived_ago_display: 'Just now',
                status: 'Awaiting Intake',
                actions: {
                  view: null,
                  intake: `/app/patients/${patient1.id}/intake/personal`,
                  review: null,
                },
                providers: [],
                reviewers: [],
                reason: 'emergency',
                is_emergency: true,
              },
              {
                appointment: null,
                patient: {
                  avatar_url: null,
                  id: patient2.id,
                  name: 'Test Patient 2',
                  description: null,
                },
                in_waiting_room: true,
                arrived_ago_display: '60 minutes ago',
                status: 'Awaiting Intake',
                actions: {
                  view: null,
                  intake: `/app/patients/${patient2.id}/intake/personal`,
                  review: null,
                },
                providers: [],
                reviewers: [],
                reason: 'seeking treatment',
                is_emergency: false,
              },
            ])
          }),
      )

      itUsesTrxAnd(
        'shows review requests for patients in the waiting room',
        (trx) =>
          withTestFacility(trx, { kind: 'virtual' }, async (facility_id) => {
            const patient = await patients.upsert(trx, {
              name: 'Test Patient 1',
            })
            await patient_encounters.upsert(trx, 1, {
              patient_id: patient.id,
              reason: 'maternity',
            })
            const nurse = await addTestHealthWorker(trx, {
              facility_id: 1,
              scenario: 'approved-nurse',
            })

            const nurse_health_worker = await health_workers.getEmployed(trx, {
              health_worker_id: nurse.id,
            })

            const { encounter, encounter_provider } =
              await removeFromWaitingRoomAndAddSelfAsProvider(trx, {
                patient_id: patient.id,
                health_worker: nurse_health_worker,
                encounter_id: 'open',
              })

            await doctor_reviews.upsertRequest(trx, {
              patient_id: patient.id,
              encounter_id: encounter.encounter_id,
              requested_by: encounter_provider.patient_encounter_provider_id,
              facility_id,
            })

            await doctor_reviews.finalizeRequest(trx, {
              requested_by: encounter_provider.patient_encounter_provider_id,
            })

            assertEquals(await waiting_room.get(trx, { facility_id }), [
              {
                appointment: null,
                patient: {
                  avatar_url: null,
                  id: patient.id,
                  name: 'Test Patient 1',
                  description: null,
                },
                in_waiting_room: false,
                arrived_ago_display: 'Just now',
                status: 'Awaiting Review',
                actions: {
                  view: null,
                  intake: null,
                  review: `/app/patients/${patient.id}/review/clinical_notes`,
                },
                providers: [{
                  name: nurse.name,
                  profession: 'nurse',
                  href: `/app/facilities/1/employees/${nurse.id}`,
                  seen: true,
                  health_worker_id: nurse.id,
                  employee_id: nurse.employee_id!,
                }],
                reviewers: [],
                reason: 'maternity',
                is_emergency: false,
              },
            ])
          }),
      )
    })
    describe('arrivedAgoDisplay', () => {
      it('returns "Just now" for a patient who arrived less than 1 minute ago', () => {
        assertEquals(
          waiting_room.arrivedAgoDisplay('00:00:02.0'),
          'Just now',
        )
      }),
        it('returns "5 minutes ago" for a patient who arrived 5 minutes ago', () => {
          assertEquals(
            waiting_room.arrivedAgoDisplay('00:05:02.0'),
            '5 minutes ago',
          )
        }),
        it('returns "2 hours ago" for a patient who arrived 2 hours ago', () => {
          assertEquals(
            waiting_room.arrivedAgoDisplay('02:05:02.0'),
            '2 hours ago',
          )
        }),
        it('returns "1 day ago" for a patient who arrived 1 day ago', () => {
          assertEquals(
            waiting_room.arrivedAgoDisplay('1 day 02:05:02.0'),
            '1 day ago',
          )
        }),
        it('returns "2 days ago" for a patient who arrived 2 days ago', () => {
          assertEquals(
            waiting_room.arrivedAgoDisplay('2 days 02:05:02.0'),
            '2 days ago',
          )
        })
    })
  },
)
