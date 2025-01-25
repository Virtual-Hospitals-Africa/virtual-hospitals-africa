import { sql } from 'kysely'
import { describe, it } from 'std/testing/bdd.ts'
import * as health_workers from '../../db/models/health_workers.ts'
import * as patient_encounters from '../../db/models/patient_encounters.ts'
import * as doctor_reviews from '../../db/models/doctor_reviews.ts'
import * as waiting_room from '../../db/models/waiting_room.ts'
import * as organizations from '../../db/models/organizations.ts'
import * as patients from '../../db/models/patients.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import {
  itUsesTrxAnd,
  withTestOrganization,
  withTestOrganizations,
} from '../web/utilities.ts'
import { addTestHealthWorker } from '../web/utilities.ts'
import { removeFromWaitingRoomAndAddSelfAsProvider } from '../../db/models/patient_encounters.ts'
import { timeAgoDisplay } from '../../util/timeAgoDisplay.ts'
import { literalLocation } from '../../db/helpers.ts'

describe(
  'db/models/waiting_room.ts',
  { sanitizeResources: false },
  () => {
    describe('get', () => {
      itUsesTrxAnd(
        'orders the waiting room by when people first arrived',
        (trx) =>
          withTestOrganization(trx, async (organization_id) => {
            const patient1 = await patients.insert(trx, {
              name: 'Test Patient 1',
            })
            const patient2 = await patients.insert(trx, {
              name: 'Test Patient 2',
            })

            await patient_encounters.insert(trx, organization_id, {
              patient_id: patient1.id,
              reason: 'seeking treatment',
            })

            await patient_encounters.insert(trx, organization_id, {
              patient_id: patient2.id,
              reason: 'seeking treatment',
            })

            const { id: health_worker_id } = await addTestHealthWorker(trx, {
              scenario: 'nurse',
            })
            const health_worker = await health_workers.getEmployed(trx, {
              health_worker_id,
            })

            const waiting_room_results = await waiting_room.get(trx, {
              organization_id,
              health_worker,
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
                intake:
                  `/app/organizations/${organization_id}/patients/intake?patient_id=${patient1.id}`,
                review: null,
                awaiting_review: null,
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
                intake:
                  `/app/organizations/${organization_id}/patients/intake?patient_id=${patient2.id}`,
                review: null,
                awaiting_review: null,
              },
              providers: [],
              reviewers: [],
              reason: 'seeking treatment',
              is_emergency: false,
            })
          }),
      )

      itUsesTrxAnd(
        'orders emergencies at the top, even if they arrived later',
        (trx) =>
          withTestOrganization(trx, async (organization_id) => {
            const patient1 = await patients.insert(trx, {
              name: 'Test Patient 1',
            })
            const patient2 = await patients.insert(trx, {
              name: 'Test Patient 2',
            })

            await patient_encounters.insert(trx, organization_id, {
              patient_id: patient1.id,
              reason: 'emergency',
            })

            const seeking_treatment = await trx.insertInto('patient_encounters')
              .values({
                patient_id: patient2.id,
                reason: 'seeking treatment',
                created_at: sql`NOW() - INTERVAL '1 hour'`,
                location: literalLocation({ latitude: 5, longitude: 6 }),
              }).returning('id').executeTakeFirstOrThrow()

            await trx.insertInto('waiting_room').values({
              organization_id,
              patient_encounter_id: seeking_treatment.id,
            }).execute()

            const { id: health_worker_id } = await addTestHealthWorker(trx, {
              scenario: 'nurse',
            })
            const health_worker = await health_workers.getEmployed(trx, {
              health_worker_id,
            })

            const waiting_room_results = await waiting_room.get(trx, {
              organization_id,
              health_worker,
            })

            assertEquals(
              waiting_room_results,
              [
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
                    intake:
                      `/app/organizations/${organization_id}/patients/intake?patient_id=${patient1.id}`,
                    review: null,
                    awaiting_review: null,
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
                    intake:
                      `/app/organizations/${organization_id}/patients/intake?patient_id=${patient2.id}`,
                    review: null,
                    awaiting_review: null,
                  },
                  providers: [],
                  reviewers: [],
                  reason: 'seeking treatment',
                  is_emergency: false,
                },
              ],
            )
          }),
      )

      itUsesTrxAnd(
        'shows awaiting review when a review is requested of organization for both the requesting nurse and doctors of the requested organization',
        (trx) =>
          withTestOrganizations(
            trx,
            [{ kind: 'physical' }, { kind: 'virtual' }],
            async ([clinic_organization_id, virtual_organization_id]) => {
              const patient = await patients.insert(trx, {
                name: 'Test Patient 1',
              })
              await patient_encounters.insert(
                trx,
                clinic_organization_id,
                {
                  patient_id: patient.id,
                  reason: 'maternity',
                },
              )
              const nurse = await addTestHealthWorker(trx, {
                organization_id: clinic_organization_id,
                scenario: 'approved-nurse',
              })

              const nurse_health_worker = await health_workers.getEmployed(
                trx,
                {
                  health_worker_id: nurse.id,
                },
              )

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
                organization_id: virtual_organization_id,
              })

              const doctor = await addTestHealthWorker(trx, {
                organization_id: virtual_organization_id,
                scenario: 'doctor',
              })

              const doctor_health_worker = await health_workers.getEmployed(
                trx,
                {
                  health_worker_id: doctor.id,
                },
              )

              const nurse_waiting_room_results = await waiting_room.get(trx, {
                organization_id: clinic_organization_id,
                health_worker: nurse_health_worker,
              })

              assertEquals(
                nurse_waiting_room_results,
                [
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
                      review: null,
                      awaiting_review: {
                        text: 'Awaiting Review',
                        disabled: true,
                      },
                    },
                    providers: [{
                      name: nurse.name,
                      profession: 'nurse',
                      href:
                        `/app/organizations/${clinic_organization_id}/employees/${nurse.id}`,
                      avatar_url: nurse.avatar_url,
                      seen: true,
                      health_worker_id: nurse.id,
                      employee_id: nurse.employee_id!,
                    }],
                    reviewers: [],
                    reason: 'maternity',
                    is_emergency: false,
                  },
                ],
              )

              const doctor_waiting_room_results = await waiting_room.get(trx, {
                organization_id: clinic_organization_id,
                health_worker: doctor_health_worker,
              })

              assertEquals(
                doctor_waiting_room_results,
                [
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
                      review:
                        `/app/patients/${patient.id}/review/clinical_notes`,
                      awaiting_review: null,
                    },
                    providers: [{
                      name: nurse.name,
                      profession: 'nurse',
                      href:
                        `/app/organizations/${clinic_organization_id}/employees/${nurse.id}`,
                      avatar_url: nurse.avatar_url,
                      seen: true,
                      health_worker_id: nurse.id,
                      employee_id: nurse.employee_id!,
                    }],
                    reviewers: [],
                    reason: 'maternity',
                    is_emergency: false,
                  },
                ],
              )
            },
          ),
      )

      itUsesTrxAnd(
        'shows review action for doctor who were requested to review patient',
        (trx) =>
          withTestOrganizations(
            trx,
            [{ kind: 'physical' }, { kind: 'virtual' }],
            async ([clinic_organization_id, virtual_organization_id]) => {
              const patient = await patients.insert(trx, {
                name: 'Test Patient 1',
              })
              await patient_encounters.insert(
                trx,
                clinic_organization_id,
                {
                  patient_id: patient.id,
                  reason: 'maternity',
                },
              )
              const nurse = await addTestHealthWorker(trx, {
                organization_id: clinic_organization_id,
                scenario: 'approved-nurse',
              })

              const nurse_health_worker = await health_workers.getEmployed(
                trx,
                {
                  health_worker_id: nurse.id,
                },
              )

              const { encounter, encounter_provider } =
                await removeFromWaitingRoomAndAddSelfAsProvider(trx, {
                  patient_id: patient.id,
                  health_worker: nurse_health_worker,
                  encounter_id: 'open',
                })

              const doctor = await addTestHealthWorker(trx, {
                organization_id: virtual_organization_id,
                scenario: 'doctor',
              })

              const doctor_health_worker = await health_workers.getEmployed(
                trx,
                {
                  health_worker_id: doctor.id,
                },
              )

              const review_request = await doctor_reviews.upsertRequest(trx, {
                patient_id: patient.id,
                encounter_id: encounter.encounter_id,
                requested_by: encounter_provider.patient_encounter_provider_id,
                doctor_id: doctor.employee_id!,
              })

              const nurse_waiting_room_results = await waiting_room.get(trx, {
                organization_id: clinic_organization_id,
                health_worker: nurse_health_worker,
              })

              assertEquals(
                nurse_waiting_room_results,
                [
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
                      review: null,
                      awaiting_review: {
                        text: 'Awaiting Review',
                        disabled: true,
                      },
                    },
                    providers: [{
                      name: nurse.name,
                      profession: 'nurse',
                      href:
                        `/app/organizations/${clinic_organization_id}/employees/${nurse.id}`,
                      avatar_url: nurse.avatar_url,
                      seen: true,
                      health_worker_id: nurse.id,
                      employee_id: nurse.employee_id!,
                    }],
                    reviewers: [{
                      name: doctor.name,
                      profession: 'doctor',
                      href:
                        `/app/organizations/${virtual_organization_id}/employees/${doctor.id}`,
                      avatar_url: doctor.avatar_url,
                      seen: false,
                      health_worker_id: doctor.id,
                      employee_id: doctor.employee_id!,
                      organization_id: virtual_organization_id,
                    }],
                    reason: 'maternity',
                    is_emergency: false,
                  },
                ],
              )

              const doctor_waiting_room_results = await waiting_room.get(trx, {
                organization_id: virtual_organization_id,
                health_worker: doctor_health_worker,
              })

              assertEquals(
                doctor_waiting_room_results,
                [],
                'Requests of a specific doctor show up in their notifications',
              )

              const doctor_after_review_request = await health_workers
                .getEmployed(
                  trx,
                  { health_worker_id: doctor.id },
                )

              const clinic = await organizations.getById(
                trx,
                clinic_organization_id,
              )

              assertEquals(doctor_after_review_request.reviews, {
                requested: [
                  {
                    employment_id: doctor.employee_id!,
                    encounter: {
                      id: encounter.encounter_id,
                      reason: 'maternity',
                    },
                    patient: {
                      avatar_url: null,
                      description: null,
                      id: patient.id,
                      name: 'Test Patient 1',
                      primary_doctor_id: null,
                      actions: {
                        view: `/app/patients/${patient.id}`,
                      },
                    },
                    requested_by: {
                      avatar_url: nurse.avatar_url,
                      name: nurse.name,
                      organization: {
                        id: clinic_organization_id,
                        name: clinic.name,
                      },
                      patient_encounter_provider_id:
                        doctor_after_review_request.reviews.requested[0]
                          .requested_by.patient_encounter_provider_id,
                      profession: 'nurse',
                      health_worker_id: nurse.id,
                    },
                    requesting: {
                      doctor_id: doctor.employee_id!,
                      organization_id: null,
                    },
                    review_request_id: review_request.id,
                  },
                ],
                in_progress: [],
              })
            },
          ),
      )

      itUsesTrxAnd(
        'shows a doctor as having seen the patient once the review has started',
        (trx) =>
          withTestOrganizations(
            trx,
            [{ kind: 'physical' }, { kind: 'virtual' }],
            async ([clinic_organization_id, virtual_organization_id]) => {
              const patient = await patients.insert(trx, {
                name: 'Test Patient 1',
              })
              await patient_encounters.insert(
                trx,
                clinic_organization_id,
                {
                  patient_id: patient.id,
                  reason: 'maternity',
                },
              )
              const nurse = await addTestHealthWorker(trx, {
                organization_id: clinic_organization_id,
                scenario: 'approved-nurse',
              })

              const nurse_health_worker = await health_workers.getEmployed(
                trx,
                {
                  health_worker_id: nurse.id,
                },
              )

              const { encounter, encounter_provider } =
                await removeFromWaitingRoomAndAddSelfAsProvider(trx, {
                  patient_id: patient.id,
                  health_worker: nurse_health_worker,
                  encounter_id: 'open',
                })

              const doctor = await addTestHealthWorker(trx, {
                organization_id: virtual_organization_id,
                scenario: 'doctor',
              })

              const doctor_health_worker = await health_workers.getEmployed(
                trx,
                {
                  health_worker_id: doctor.id,
                },
              )

              await doctor_reviews.upsertRequest(trx, {
                patient_id: patient.id,
                encounter_id: encounter.encounter_id,
                requested_by: encounter_provider.patient_encounter_provider_id,
                doctor_id: doctor.employee_id!,
              })

              await doctor_reviews.addSelfAsReviewer(trx, {
                patient_id: patient.id,
                health_worker: await health_workers.getEmployed(trx, {
                  health_worker_id: doctor.id,
                }),
              })

              const nurse_waiting_room_results = await waiting_room.get(trx, {
                organization_id: clinic_organization_id,
                health_worker: nurse_health_worker,
              })

              assertEquals(
                nurse_waiting_room_results,
                [
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
                    status: 'In Review (Clinical Notes)',
                    actions: {
                      view: null,
                      intake: null,
                      review: null,
                      awaiting_review: {
                        text: 'Review in Progress',
                        disabled: true,
                      },
                    },
                    providers: [{
                      name: nurse.name,
                      profession: 'nurse',
                      href:
                        `/app/organizations/${clinic_organization_id}/employees/${nurse.id}`,
                      avatar_url: nurse.avatar_url,
                      seen: true,
                      health_worker_id: nurse.id,
                      employee_id: nurse.employee_id!,
                    }],
                    reviewers: [{
                      name: doctor.name,
                      profession: 'doctor',
                      href:
                        `/app/organizations/${virtual_organization_id}/employees/${doctor.id}`,
                      avatar_url: doctor.avatar_url,
                      seen: true,
                      health_worker_id: doctor.id,
                      employee_id: doctor.employee_id!,
                      organization_id: virtual_organization_id,
                    }],
                    reason: 'maternity',
                    is_emergency: false,
                  },
                ],
              )

              const doctor_waiting_room_results = await waiting_room.get(trx, {
                organization_id: clinic_organization_id,
                health_worker: doctor_health_worker,
              })

              assertEquals(
                doctor_waiting_room_results,
                [
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
                    status: 'In Review (Clinical Notes)',
                    actions: {
                      view: null,
                      intake: null,
                      review:
                        `/app/patients/${patient.id}/review/clinical_notes`,
                      awaiting_review: null,
                    },
                    providers: [{
                      name: nurse.name,
                      profession: 'nurse',
                      href:
                        `/app/organizations/${clinic_organization_id}/employees/${nurse.id}`,
                      avatar_url: nurse.avatar_url,
                      seen: true,
                      health_worker_id: nurse.id,
                      employee_id: nurse.employee_id!,
                    }],
                    reviewers: [{
                      name: doctor.name,
                      profession: 'doctor',
                      href:
                        `/app/organizations/${virtual_organization_id}/employees/${doctor.id}`,
                      avatar_url: doctor.avatar_url,
                      seen: true,
                      health_worker_id: doctor.id,
                      employee_id: doctor.employee_id!,
                      organization_id: virtual_organization_id,
                    }],
                    reason: 'maternity',
                    is_emergency: false,
                  },
                ],
              )
            },
          ),
      )
    })
    describe('arrivedAgoDisplay', () => {
      it('returns "Just now" for a patient who arrived less than 1 minute ago', () => {
        assertEquals(
          timeAgoDisplay('00:00:02.0'),
          'Just now',
        )
      }),
        it('returns "5 minutes ago" for a patient who arrived 5 minutes ago', () => {
          assertEquals(
            timeAgoDisplay('00:05:02.0'),
            '5 minutes ago',
          )
        }),
        it('returns "2 hours ago" for a patient who arrived 2 hours ago', () => {
          assertEquals(
            timeAgoDisplay('02:05:02.0'),
            '2 hours ago',
          )
        }),
        it('returns "1 day ago" for a patient who arrived 1 day ago', () => {
          assertEquals(
            timeAgoDisplay('1 day 02:05:02.0'),
            '1 day ago',
          )
        }),
        it('returns "2 days ago" for a patient who arrived 2 days ago', () => {
          assertEquals(
            timeAgoDisplay('2 days 02:05:02.0'),
            '2 days ago',
          )
        })
    })
  },
)
