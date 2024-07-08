import {
  ConversationStates,
  PharmacistChatbotUserState,
  TrxOrDb,
} from '../../types.ts'
// import * as pharmacists from '../../db/models/pharmacists.ts'
import * as conversations from '../../db/models/conversations.ts'
// import { assertEquals } from 'std/assert/assert_equals.ts'
import { assert } from 'std/assert/assert.ts'

export const PHARMACIST_CONVERSATION_STATES: ConversationStates<
  PharmacistChatbotUserState
> = {
  'initial_message': {
    type: 'string',
    prompt:
      `Welcome to the Pharmacist Chatbot! This is a demo to showcase the capabilities of the chatbot. Please follow the prompts to complete the demo.\n\nTo start, enter your licence number.`,
    async onExit(trx: TrxOrDb, pharmacistState: PharmacistChatbotUserState) {
      const licence_number = pharmacistState.unhandled_message.trimmed_body
      assert(licence_number, 'Licence number should not be empty')
      await conversations.updateChatbotUser(
        trx,
        pharmacistState.chatbot_name,
        pharmacistState.chatbot_user_id,
        {
          data: {
            ...pharmacistState.chatbot_user_data,
            licence_number,
          },
        },
      )
      return 'not_onboarded:enter_name' as const
    },
  },
  'not_onboarded:enter_name': {
    type: 'string',
    prompt: 'What is your name?',
    async onExit(trx: TrxOrDb, pharmacistState: PharmacistChatbotUserState) {
      const name = pharmacistState.unhandled_message.trimmed_body
      assert(name, 'Name should not be empty')
      await conversations.updateChatbotUser(
        trx,
        pharmacistState.chatbot_name,
        pharmacistState.chatbot_user_id,
        {
          data: {
            ...pharmacistState.chatbot_user_data,
            name,
          },
        },
      )
      return 'not_onboarded:confirm_details' as const
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
      return `Please confirm the following details:\n\nName: ${pharmacist.given_name} ${pharmacist.family_name}\nLicense Number: ${pharmacist.licence_number}`
    },
    // deno-lint-ignore require-await
    async onExit(_trx: TrxOrDb, _pharmacistState: PharmacistChatbotUserState) {
      throw new Error('Not implemented')
      // return 'onboarded:pharmacist_main_menu' as const
    },
  },
  'onboarded:pharmacist_main_menu': {
    type: 'select',
    async prompt(trx: TrxOrDb, pharmacistState: PharmacistChatbotUserState) {
      const pharmacist = await trx.selectFrom('pharmacists').selectAll().where(
        'id',
        '=',
        pharmacistState.entity_id,
      ).executeTakeFirstOrThrow()
      return `Hi ${pharmacist.given_name}`
    },
    options: [
      {
        id: 'fill_prescription',
        title: 'Fill Prescription',
        onExit: 'onboarded:fill_prescription:enter_prescription_number',
      },
      {
        id: 'view_inventory',
        title: 'View Inventory',
        onExit: 'onboarded:view_inventory',
      },
    ],
  },
  'onboarded:fill_prescription:enter_prescription_number': {
    type: 'string',
    prompt: 'Please enter the prescription number',
    onExit(_trx: TrxOrDb, pharmacistState: PharmacistChatbotUserState) {
      //get the prescription number and cross check with our database
      const prescriptionNumber = pharmacistState.unhandled_message.trimmed_body
      console.log(prescriptionNumber)
      return 'end_of_demo' as const
    },
  },
  'onboarded:view_inventory': {
    type: 'select',
    prompt: 'Coming Soon',
    options: [
      {
        id: 'main_menu',
        title: 'Back to main menu',
        onExit: 'onboarded:pharmacist_main_menu',
      },
      { id: 'end_of_demo', title: 'End of Demo', onExit: 'end_of_demo' },
    ],
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
  //   nextState: 'end_of_demo',
  // },
  'end_of_demo': {
    type: 'select',
    prompt: 'This is the end of the demo. Thank you for participating!',
    options: [
      {
        id: 'main_menu',
        title: 'Main Menu',
        onExit: 'initial_message',
      },
    ],
  },
  'error': {
    type: 'select',
    prompt: 'An error occurred. Please try again.',
    options: [
      {
        id: 'main_menu',
        title: 'Main Menu',
        onExit: 'initial_message',
      },
    ],
  },
}

// Hi
