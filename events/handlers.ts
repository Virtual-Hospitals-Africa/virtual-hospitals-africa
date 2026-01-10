import { TrxOrDb } from '../types.ts'
import { sendToHealthWorkerLoggedInChannel } from '../external-clients/slack.ts'
import { health_workers } from '../db/models/health_workers.ts'
import { employees } from '../db/models/employees.ts'
import { patient_encounters } from '../db/models/patient_encounters.ts'

import { notifications } from '../db/models/notifications.ts'
import { doctor_reviews } from '../db/models/doctor_reviews.ts'
import { messages } from '../db/models/messages.ts'
import { message_threads } from '../db/models/message_threads.ts'

import { conversations } from '../db/models/conversations.ts'
import { assert } from 'std/assert/assert.ts'
import { z } from 'zod'
import { debug } from '../util/debug.ts'
import * as whatsapp from '../external-clients/whatsapp.ts'
import { organizationOf } from '../shared/employees.ts'
import { promiseProps } from '../util/promiseProps.ts'
import { employeeDisplay } from '../util/healthWorkerDisplay.ts'
import { WORKFLOWS } from '../shared/workflow.ts'
import { additional_tasks } from '../db/models/additional_tasks.ts'

export const EVENTS = {
  HealthWorkerLogin: defineEvent(
    z.object({
      health_worker_id: z.string().uuid(),
    }),
    {
      async notifySlack(trx, payload) {
        const { health_worker_id } = payload.data
        const health_worker = await health_workers.getEmployed(trx, {
          health_worker_id,
        }).catch((_err) => null)
        assert(health_worker, 'Health worker not found')

        const message =
          `Health worker ${health_worker.name} has logged in for the first time`
        await sendToHealthWorkerLoggedInChannel(message)
      },
    },
  ),
  PatientRegistration: defineEvent(
    z.object({
      patient_id: z.string().uuid(),
    }),
    {},
  ),
  AddToWaitingRoom: defineEvent(
    z.object({
      organization_id: z.string().uuid(),
      patient_encounter_id: z.string().uuid(),
    }),
    {},
  ),
  OpenEncounterWorkflowStepCompleted: defineEvent(
    z.object({
      patient_id: z.string().uuid(),
      patient_encounter_id: z.string().uuid(),
      workflow: z.enum(WORKFLOWS),
      workflow_step: z.string(),
    }),
    {
      async insertTasksIfNotAlreadyIdentified(_trx, _payload) {
        // TODO: decide whether to do this as part of handling the request or in the background via events
        // await insertTasksIfNotAlreadyIdentified(trx, payload.data)
      },
    },
  ),
  ProcedureCompleted: defineEvent(
    z.object({
      patient_id: z.string().uuid(),
      patient_encounter_id: z.string().uuid(),
      procedure_id: z.string().uuid(),
      finding_ids: z.string().uuid().array(),
    }),
    {
      async insertTasksIfNotAlreadyIdentified(trx, payload) {
        // TODO: decide whether to do this as part of handling the request or in the background via events
        await additional_tasks.insertTasksIfNotAlreadyIdentified(
          trx,
          payload.data,
        )
      },
    },
  ),
  PatientNextOfKinSet: defineEvent(
    z.object({
      patient_id: z.string().uuid(),
    }),
    {},
  ),
  ReviewRequested: defineEvent(
    z.object({
      review_request_id: z.string().uuid(),
    }),
    {
      async notifyRequestedDoctor(trx, payload) {
        const doctor_review_request = await doctor_reviews.requestById(
          trx,
          payload.data.review_request_id,
        )
        if (!doctor_review_request.requesting.doctor_id) return

        await notifications.insert(trx, {
          action_title: 'Review',
          avatar_url: doctor_review_request.requested_by.avatar_url ||
            '/images/heroicons/24/solid/slipboard-document-list.svg',
          description: `${doctor_review_request.requested_by.name} at ${
            organizationOf(doctor_review_request.requested_by).name
          } has requested that you review a recent encounter with ${doctor_review_request.patient.name}`,
          employment_id: doctor_review_request.requesting.doctor_id,
          table_name: 'doctor_review_requests',
          row_id: payload.data.review_request_id,
          notification_type: 'doctor_review_request',
          title: 'Review Requested',
          action_href:
            `/app/patients/${doctor_review_request.patient.id}/review/clinical_notes`,
        })
      },
      async notifyDoctorsOrOrganization(trx, payload) {
        const doctor_review_request = await doctor_reviews.requestById(
          trx,
          payload.data.review_request_id,
        )

        const { organization_id } = doctor_review_request.requesting
        if (!organization_id) return

        const doctors_at_organization = await employees.findAll(
          trx,
          {
            organization_id,
            professions: ['doctor'],
          },
        )

        for (const doctor of doctors_at_organization) {
          await notifications.insert(trx, {
            action_title: 'Review',
            avatar_url: doctor_review_request.requested_by.avatar_url ||
              '/images/heroicons/24/solid/slipboard-document-list.svg',
            description: `${doctor_review_request.requested_by.name} at ${
              organizationOf(doctor_review_request.requested_by).name
            } has requested that your organization review a recent encounter with ${doctor_review_request.patient.name}`,
            employment_id: doctor.employee_id,
            table_name: 'doctor_review_requests',
            row_id: payload.data.review_request_id,
            notification_type: 'doctor_review_request',
            title: 'Review Requested',
            action_href:
              `/app/patients/${doctor_review_request.patient.id}/review/clinical_notes`,
          })
        }
      },
    },
  ),
  MessageSend: defineEvent(
    z.object({
      message_id: z.string().uuid(),
    }),
    {
      async sendPharmacistWhatsApp(trx, payload) {
        const { message, thread } = await promiseProps({
          message: messages.getById(
            trx,
            payload.data.message_id,
          ),
          thread: message_threads.findOne(trx, {
            message_id: payload.data.message_id,
          }),
        })

        const pharmacist_participants = thread.participants.filter(
          (p) => p.table_name === 'pharmacists',
        )

        if (!pharmacist_participants.length) return

        for (const pharmacist_participant of pharmacist_participants) {
          const pharmacist_chatbot_user = await trx.selectFrom(
            'pharmacist_chatbot_users',
          )
            .where('entity_id', '=', pharmacist_participant.row_id)
            .select('phone_number')
            .executeTakeFirst()
          if (!pharmacist_chatbot_user) {
            console.error(
              'How is the health worker sending to a pharmacist that is not using whatsapp?',
            )
            continue
          }

          const whatsapp_to_send = {
            type: 'string' as const,
            message_body: message.body,
          }
          const whatsapp_response = await whatsapp.sendMessage({
            chatbot_name: 'pharmacist',
            phone_number: pharmacist_chatbot_user.phone_number,
            message: whatsapp_to_send,
          })

          if ('error' in whatsapp_response) {
            console.log('whatsapp_response', JSON.stringify(whatsapp_response))
            throw new Error(whatsapp_response.error.details)
          }

          await conversations.insertMessageSent(trx, {
            chatbot_name: 'pharmacist',
            sent_by_phone_number: whatsapp.phone_numbers.pharmacist,
            sent_to_phone_number: pharmacist_chatbot_user.phone_number,
            responding_to_received_id: null,
            corresponding_message_id: message.id,
            whatsapp_id: whatsapp_response.messages[0].id,
            body: JSON.stringify(whatsapp_to_send),
          })
        }
      },
    },
  ),
  ImmediateTriage: defineEvent(
    z.object({
      patient_encounter_id: z.string().uuid(),
      requested_by_employee_id: z.string().uuid(),
    }),
    {
      async notifyHealthWorker(trx, payload) {
        console.log('ImmediateTriage notifyHealthWorker', payload)
        const { patient_encounter_id, requested_by_employee_id } = payload.data
        const patient_encounter = await patient_encounters.getById(
          trx,
          patient_encounter_id,
        )
        const requested_by_employee = await employees.getById(
          trx,
          requested_by_employee_id,
        )

        const can_perform_triage = await employees.findAll(trx, {
          organization_id: patient_encounter.organization.id,
          can_perform_workflow: 'triage',
        })

        if (!can_perform_triage.length) {
          console.warn(
            `No health workers can perform triage for organization ${patient_encounter.organization.id}`,
          )
          return
        }

        for (const employee of can_perform_triage) {
          await notifications.insert(trx, {
            title: 'Immediate Triage Requested',
            avatar_url: '/images/heroicons/24/solid/exclamation-triangle.svg',
            description: `${
              employeeDisplay(requested_by_employee).display_name
            } has requested immediate triage for a patient`,
            employment_id: employee.employee_id,
            table_name: 'patient_encounters',
            row_id: patient_encounter_id,
            notification_type: 'patient_encounter_immediate_triage',
            action_title: 'View patient case',
            action_href:
              `/app/organizations/${patient_encounter.organization.id}/patients/${patient_encounter.patient.id}/open_encounter/respond-to-immediate-triage-request`,
          })
        }
      },
    },
  ),
  TEST_WORKS_ON_SECOND_TRY: defineEvent(
    z.object({
      foo: z.string().uuid(),
    }),
    {
      // deno-lint-ignore require-await
      async workOnSecondTry(_trx, payload) {
        debug('foo bar')
        if (payload.metadata.error_count === 0) {
          throw new Error('Fails at first')
        }
      },
    },
  ),
  TEST_NEVER_WORKS: defineEvent(
    z.object({
      bar: z.string().uuid(),
    }),
    {
      neverWorks(_trx, _payload) {
        throw new Error('Never Works')
      },
    },
  ),
  DoctorReviewCompleted: defineEvent(
    z.object({
      review_id: z.string().uuid(),
    }),
    {
      async notifyOriginalRequester(trx, payload) {
        const review = await doctor_reviews.getById(trx, payload.data.review_id)
        const doctor = await employees.getById(trx, review.employment_id)

        return notifications.insert(trx, {
          action_title: 'View completed review',
          avatar_url: doctor.avatar_url ||
            '/images/heroicons/24/solid/slipboard-document-list.svg',
          description: `Doctor ${doctor.name} at ${
            organizationOf(review.requested_by).name
          } has reviewed ${review.patient.name}`,
          health_worker_id: review.requested_by.id,
          table_name: 'doctor_review_requests',
          row_id: review.review_id,
          notification_type: 'doctor_review_request',
          title: 'Review Requested',
          action_href:
            `/app/patients/${review.patient.id}/review/clinical_notes`,
        })
      },
    },
  ),
  HealthWorkerMessageSent: defineEvent(
    z.object({
      message_id: z.string().uuid(),
    }),
    {
      // deno-lint-ignore no-unused-vars require-await
      async sendToPharmacistWhatsapp(trx, payload) {
        console.log('TODO!')
      },
    },
  ),
}

export type EventType = keyof typeof EVENTS

export type EventInsert<ET extends EventType> = {
  type: ET
  data: z.infer<(typeof EVENTS)[ET]['schema']>
}

export type EventInsertRecord = {
  [K in EventType]: EventInsert<K>
}

export type EventInsertAny = EventInsertRecord[keyof EventInsertRecord]

export function isEventType(
  event_type: string,
): event_type is EventType {
  return event_type in EVENTS
}

export function defineEvent<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  listeners: Record<
    string,
    (
      trx: TrxOrDb,
      payload: {
        id: string
        data: z.infer<z.ZodObject<T>>
        metadata: { error_count: number }
      },
    ) => Promise<unknown>
  >,
) {
  return {
    schema,
    listeners,
  }
}
