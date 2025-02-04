import { TrxOrDb } from '../types.ts'

import { sendToHealthWorkerLoggedInChannel } from '../external-clients/slack.ts'
import * as health_workers from '../db/models/health_workers.ts'
import * as notifications from '../db/models/notifications.ts'
import * as organizations from '../db/models/organizations.ts'
import * as doctor_reviews from '../db/models/doctor_reviews.ts'
import * as messages from '../db/models/messages.ts'
import * as conversations from '../db/models/conversations.ts'
import { assert } from 'std/assert/assert.ts'
import { z } from 'zod'
import { debug } from '../util/debug.ts'
import * as whatsapp from '../external-clients/whatsapp.ts'

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
        })
        assert(health_worker, 'Health worker not found')

        const message =
          `Health worker ${health_worker.name} has logged in for the first time`
        await sendToHealthWorkerLoggedInChannel(message)
      },
    },
  ),
  PatientIntake: defineEvent(
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
          description:
            `${doctor_review_request.requested_by.name} at ${doctor_review_request.requested_by.organization.name} has requested that you review a recent encounter with ${doctor_review_request.patient.name}`,
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

        const doctors_at_organization = await organizations.getEmployees(
          trx,
          organization_id,
          {
            professions: ['doctor'],
          },
        )

        for (const doctor of doctors_at_organization) {
          await notifications.insert(trx, {
            action_title: 'Review',
            avatar_url: doctor_review_request.requested_by.avatar_url ||
              '/images/heroicons/24/solid/slipboard-document-list.svg',
            description:
              `${doctor_review_request.requested_by.name} at ${doctor_review_request.requested_by.organization.name} has requested that your organization review a recent encounter with ${doctor_review_request.patient.name}`,
            employment_id: doctor.professions.find((p) =>
              p.profession === 'doctor'
            )!.employee_id,
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
        const message = await messages.getByIdForSystem(
          trx,
          payload.data.message_id,
        )

        const pharmacist_participants = message.thread.participants.filter(
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
            messageBody: message.body,
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
            sent_by_phone_number: whatsapp.phoneNumbers.pharmacist,
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
      employment_id: z.string().uuid(),
      patient_id: z.string().uuid(),
      patient_name: z.string(),
      doctor_name: z.string(),
      doctor_avatar_url: z.string().nullable(),
      requested_by: z.object({
        health_worker_id: z.string().uuid(),
        profession: z.string(),
        name: z.string(),
        avatar_url: z.string().nullable(),
        organization: z.object({
          name: z.string(),
          id: z.string().uuid(),
        }),
        patient_encounter_provider_id: z.string().uuid(),
      }),
    }),
    {
      notifyOriginalRequester(_trx, _payload) {
        return notifications.insert(_trx, {
          action_title: 'View completed review',
          avatar_url: _payload.data.doctor_avatar_url ||
            '/images/heroicons/24/solid/slipboard-document-list.svg',
          description:
            `Doctor ${_payload.data.doctor_name} at ${_payload.data.requested_by.organization.name} has reviewed ${_payload.data.patient_name}`,
          health_worker_id: _payload.data.requested_by.health_worker_id,
          table_name: 'doctor_review_requests',
          row_id: _payload.data.review_id,
          notification_type: 'doctor_review_request',
          title: 'Review Requested',
          action_href:
            `/app/patients/${_payload.data.patient_id}/review/clinical_notes`,
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
