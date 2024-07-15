import {
  ConversationStates,
  PharmacistChatbotUserState,
  PharmacistConversationState,
  TrxOrDb,
  WhatsAppSingleSendable,
} from '../../types.ts'
// import * as pharmacists from '../../db/models/pharmacists.ts'
import * as prescriptions from '../../db/models/prescriptions.ts'
import * as conversations from '../../db/models/conversations.ts'
// import { assertEquals } from 'std/assert/assert_equals.ts'
import { assert } from 'std/assert/assert.ts'
import { sql } from 'kysely'
import { generatePDF } from '../../util/pdfUtils.ts'

const checkOnboardingStatus = (
  pharmacistState: PharmacistChatbotUserState,
  onboardedAction: PharmacistConversationState,
) => {
  return pharmacistState.entity_id
    ? onboardedAction
    : 'not_onboarded:enter_licence_number' as const
}

export const PHARMACIST_CONVERSATION_STATES: ConversationStates<
  PharmacistChatbotUserState
> = {
  'initial_message': {
    type: 'select',
    async prompt(trx: TrxOrDb, pharmacistState: PharmacistChatbotUserState) {
      if (!pharmacistState.entity_id) {
        return 'Welcome to the Pharmacist Chatbot! This is a demo to showcase the capabilities of the chatbot. Please follow the prompts to complete the demo.\n\nTo start, select the items from the following menu'
      }
      const pharmacist = await trx.selectFrom('pharmacists').selectAll().where(
        'id',
        '=',
        pharmacistState.entity_id,
      ).executeTakeFirst()

      if (!pharmacist) {
        throw new Error('pharmacist_chatbot_users has an entity_id to a nonexistent pharmacist')
      }
      return `Hello ${pharmacist.given_name}, what can I help you with today?`
    },
    options: [
      {
        id: 'fill_prescription',
        title: 'Fill Prescription',
        async onExit(
          _trx: TrxOrDb,
          pharmacistState: PharmacistChatbotUserState,
        ) {
          return checkOnboardingStatus(
            pharmacistState,
            'onboarded:fill_prescription:enter_code',
          )
        },
      },
      {
        id: 'view_inventory',
        title: 'View Inventory',
        async onExit(
          _trx: TrxOrDb,
          pharmacistState: PharmacistChatbotUserState,
        ) {
          return checkOnboardingStatus(
            pharmacistState,
            'onboarded:view_inventory',
          )
        },
      },
    ],
  },
  'not_onboarded:enter_licence_number': {
    type: 'string',
    prompt:
      `Looks like you are not onboarded, to start, enter your licence number.`,
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

      const { licence_number } = pharmacistState.chatbot_user_data
      assert(typeof licence_number === 'string')

      const pharmacist = await trx
        .selectFrom('pharmacists')
        .selectAll()
        .where(
          sql<any>`concat(given_name, ' ', family_name) ilike ${name.toLowerCase()}`
        )
        .where('licence_number', '=', licence_number)
        .executeTakeFirst()

      if (!pharmacist) {
        throw new Error('Cannot find a pharmacist with that licence and name combination')
      }

      await conversations.updateChatbotUser(
        trx,
        pharmacistState.chatbot_name,
        pharmacistState.chatbot_user_id,
        {
          entity_id: pharmacist.id
        },
      )
      // TODO Handle case where the user previously selected they want to view inventory
      return 'onboarded:fill_prescription:enter_code' as const
    },
  },
  'onboarded:view_inventory': {
    type: 'select',
    prompt: 'Coming Soon',
    options: [
      {
        id: 'main_menu',
        title: 'Back to main menu',
        onExit: 'initial_message',
      },
      { id: 'end_of_demo', title: 'End of Demo', onExit: 'end_of_demo' },
    ],
  },

  'onboarded:fill_prescription:enter_code': {
      type: 'string',
      prompt: 'Please enter your prescription code',
      async onExit(trx, pharmacistState) {
        const code = pharmacistState.unhandled_message.trimmed_body!
        const prescription = await prescriptions.getByCode(trx, code)
        if (!prescription) {
          throw new Error('No prescription with that code')
        }

        // The problem is here
        // Because updateChatbotUser has not yet finished executing, 
        // the program directly starts to check 
        // whether the data column has been successfully modified. 
        // So after the check fails, I guess this small process was killed, 
        // which shows the phenomenon of update failure.
        await conversations.updateChatbotUser(
          trx,
          pharmacistState.chatbot_name,
          pharmacistState.chatbot_user_id,
          {
            data: {
              prescription_code: code,
              prescription_id: prescription.id,
            }
          }
        )
        
        // console.log(`debug`)
        // console.log(result)
        return 'onboarded:fill_prescription:send_pdf' as const
      },
    },
    'onboarded:fill_prescription:send_pdf': {
      type: 'send_document',
      prompt: 'Here is your prescription',
      async getMessages(trx, pharmacistState) {
        // console.log('pharmacistState.chatbot_user_data', pharmacistState.chatbot_user_data)
        // const { prescription_id, prescription_code} = pharmacistState.chatbot_user_data
        // assert(typeof prescription_id === 'string')
        // assert(typeof prescription_code === 'string')

        const SELF_URL = Deno.env.get('SELF_URL')
        // const file_path = await generatePDF(`${SELF_URL}/prescriptions/${prescription_id}?code=${prescription_code}`)
        const file_path = await generatePDF(`${SELF_URL}/login`)

        const documentMessage: WhatsAppSingleSendable = {
          type: 'document',
          messageBody: 'Prescription',
          file_path,
        }

        const buttonMessage: WhatsAppSingleSendable = {
          type: 'buttons',
          messageBody: 'Click below to go back to main menu.',
          buttonText: 'Back to main menu',
          options: [{
            id: 'main_menu',
            title: 'Back to Menu',
          }],
        }
        return [documentMessage, buttonMessage]
      },
      onExit(_trx, pharmacistState): PharmacistConversationState {
        return pharmacistState.entity_id
          ? 'initial_message'
          : 'initial_message'
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
