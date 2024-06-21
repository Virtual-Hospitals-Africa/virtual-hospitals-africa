import {
  ConversationStates,
  PharmacistChatbotUserState,
  TrxOrDb,
} from '../../types.ts'
import * as pharmacists from '../../db/models/pharmacists.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'

const introMessage =
  `Welcome to the Pharmacist Chatbot! This is a demo to showcase the capabilities of the chatbot. Please follow the prompts to complete the demo.\n\nTo start, enter your registration number.`

export const PHARMACIST_CONVERSATION_STATES: ConversationStates<
  PharmacistChatbotUserState
> = {
  'initial_message': {
    type: 'string',
    prompt() {
      return introMessage
    },
    async onExit(trx: TrxOrDb, pharmacistState: PharmacistChatbotUserState) {
      await pharmacists.update(trx, pharmacistState.entity_id, {
        registration_number: pharmacistState.unhandled_message.trimmed_body,
      })
      return 'not_onboarded:enter_id' as const
    },
  },

  'not_onboarded:enter_id': {
    type: 'string',
    prompt: 'To confirm your identity, please provide your ID number',
    async onExit(trx: TrxOrDb, pharmacistState: PharmacistChatbotUserState) {
      await pharmacists.update(trx, pharmacistState.entity_id, {
        id_number: pharmacistState.unhandled_message.trimmed_body,
      })
      return 'not_onboarded:create_pin'
    },
  },
  'not_onboarded:create_pin': {
    type: 'string',
    prompt: 'To secure your account, please create a 4-digit pin',
    async onExit(trx: TrxOrDb, pharmacistState: PharmacistChatbotUserState) {
      await pharmacists.update(trx, pharmacistState.entity_id, {
        pin: pharmacistState.unhandled_message.trimmed_body,
      })
      return 'not_onboarded:confirm_pin'
    },
  },
  'not_onboarded:confirm_pin': {
    type: 'string',
    prompt: 'Please confirm your pin.',
    // nextState: 'not_onboarded:enter_establishment',
    async onExit(trx: TrxOrDb, pharmacistState: PharmacistChatbotUserState) {
      const currentPin = await trx
        .selectFrom('pharmacists')
        .select('pin')
        .where('id', '=', pharmacistState.entity_id)
        .executeTakeFirstOrThrow()

      assertEquals(
        pharmacistState.unhandled_message.trimmed_body,
        currentPin.pin,
        'Pins do not match',
      )
      return 'not_onboarded:confirm_details'
    },
  },
  'not_onboarded:confirm_details': {
    type: 'string',
    async prompt(trx: TrxOrDb, pharmacistState: PharmacistChatbotUserState) {
      const pharmacist = await trx.selectFrom('pharmacists').selectAll().where(
        'id',
        '=',
        pharmacistState.entity_id,
      ).executeTakeFirstOrThrow()
      return `Please confirm the following details:\n\nName: ${pharmacist.name}\nID Number: ${pharmacist.id_number}\nRegistration Number: ${pharmacist.registration_number}`
    },
    async onExit(trx: TrxOrDb, pharmacistState: PharmacistChatbotUserState) {
      const currentPin = await trx
        .selectFrom('pharmacists')
        .select('pin')
        .where('id', '=', pharmacistState.entity_id)
        .executeTakeFirstOrThrow()

      assertEquals(
        pharmacistState.unhandled_message.trimmed_body,
        currentPin.pin,
        'Pins do not match',
      )
      return 'other_end_of_demo'
    },
  },

  // 'not_onboarded:enter_establishment': {
  //   type: 'string',
  //   prompt: 'Please provide your establishment license number',
  //   nextState: 'onboarded:enter_order_number',
  // },
  // 'onboarded:enter_order_number': {
  //   type: 'string',
  //   async onEnter(
  //     trx: TrxOrDb,
  //     pharmacistState: PharmacistChatbotUserState,
  //   ): Promise<PharmacistChatbotUserState> {
  //     assert(pharmacistState.organization_id, 'Organization ID should be set')
  //     const organization = await organizations.get(trx, {
  //       ids: [pharmacistState.organization_id],
  //     })
  //     return {
  //       ...pharmacistState,
  //       organization: organization[0],
  //     }
  //   },
  //   prompt(pharmacistState: PharmacistChatbotUserState): string {
  //     assert(pharmacistState.organization, 'Organization should not be null')
  //     return `You are serving patients from ${pharmacistState.organization.name} Please enter the patient's order number`
  //   },
  //   nextState: 'onboarded:get_order_details',
  // },
  // 'onboarded:get_order_details': {
  //   type: 'string',
  //   prompt: 'To implement',
  //   nextState: 'other_end_of_demo',
  // },
  'other_end_of_demo': {
    type: 'end_of_demo',
    prompt: 'This is the end of the demo. Thank you for participating!',
    async onExit() {
      return 'other_end_of_demo'
    },
  },
}
