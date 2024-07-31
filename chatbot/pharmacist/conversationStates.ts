import {
  ConversationStates,
  Location,
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
import { handleLicenceInput } from './handleLicenceInput.ts'
import { handlePrescriptionCode } from './handlePrescriptionCode.ts'

const checkOnboardingStatus = (
  pharmacistState: PharmacistChatbotUserState,
  onboardedAction: PharmacistConversationState,
) => {
  return pharmacistState.chatbot_user.entity_id
    ? onboardedAction
    : 'not_onboarded:enter_licence_number' as const
}

const PRESCRIPTIONS_BASE_URL = Deno.env.get('PRESCRIPTIONS_BASE_URL') ||
  'https://localhost:8000'
assert(PRESCRIPTIONS_BASE_URL, 'PRESCRIPTIONS_BASE_URL should be set')

export const PHARMACIST_CONVERSATION_STATES: ConversationStates<
  PharmacistChatbotUserState
> = {
  'initial_message': {
    type: 'select',
    async prompt(trx: TrxOrDb, pharmacistState: PharmacistChatbotUserState) {
      if (!pharmacistState.chatbot_user.entity_id) {
        return 'Welcome to the Pharmacist Chatbot! This is a demo to showcase the capabilities of the chatbot. Please follow the prompts to complete the demo.\n\nTo start, select the items from the following menu'
      }
      const pharmacist = await trx.selectFrom('pharmacists').selectAll().where(
        'id',
        '=',
        pharmacistState.chatbot_user.entity_id,
      ).executeTakeFirst()

      if (!pharmacist) {
        throw new Error(
          'pharmacist_chatbot_users has an entity_id to a nonexistent pharmacist',
        )
      }
      return `Hello ${pharmacist.given_name}, what can I help you with today?`
    },
    options: [
      {
        id: 'fill_prescription',
        title: 'Fill Prescription',
        onExit(
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
        onExit(
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
    onExit: handleLicenceInput,
  },
  'not_onboarded:reenter_licence_number': {
    type: 'string',
    prompt:
      `No record found. To continue, you'll need to reenter your licence number.`,
    onExit: handleLicenceInput,
  },
  'not_onboarded:enter_name': {
    type: 'string',
    prompt: 'What is your name?',
    async onExit(trx: TrxOrDb, pharmacistState: PharmacistChatbotUserState) {
      try {
        const name = pharmacistState.unhandled_message.trimmed_body
        assert(name, 'Name should not be empty')

        const { licence_number } = pharmacistState.chatbot_user.data
        assert(typeof licence_number === 'string')

        const pharmacist = await trx
          .selectFrom('pharmacists')
          .selectAll()
          .where(
            sql<
              // deno-lint-ignore no-explicit-any
              any
            >`concat(given_name, ' ', family_name) ilike ${name.toLowerCase()}`,
          )
          .where('licence_number', '=', licence_number)
          .executeTakeFirst()

        if (!pharmacist) {
          throw new Error(
            'Cannot find a pharmacist with that licence and name combination',
          )
        }

        await conversations.updateChatbotUser(
          trx,
          pharmacistState.chatbot_user,
          {
            entity_id: pharmacist.id,
          },
        )
        // TODO Handle case where the user previously selected they want to view inventory
        return 'not_onboarded:share_location' as const
      } catch (err) {
        console.log(err)
        return 'not_onboarded:reenter_licence_number' as const
      }
    },
  },
  'not_onboarded:share_location': {
    type: 'get_location',
    prompt:
      'For regulatory purpose, we will need to have your current location, can you share that to us?',
    async onExit(trx: TrxOrDb, pharmacistState: PharmacistChatbotUserState) {
      assert(pharmacistState.chatbot_user.entity_id)
      assert(pharmacistState.unhandled_message.trimmed_body)
      const locationMessage: Location = JSON.parse(
        pharmacistState.unhandled_message.trimmed_body,
      )
      const currentLocation: Location = {
        longitude: locationMessage.longitude,
        latitude: locationMessage.latitude,
      }

      //try to save it as data first and see if it works
      await conversations.updateChatbotUser(
        trx,
        pharmacistState.chatbot_user,
        {
          data: {
            ...pharmacistState.chatbot_user.data,
            currentLocation,
          },
        },
      )
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
    onExit: handlePrescriptionCode,
  },
  'onboarded:fill_prescription:reenter_code': {
    type: 'string',
    prompt: 'Please enter your prescription code',
    onExit: handlePrescriptionCode,
  },
  'onboarded:fill_prescription:send_pdf': {
    type: 'send_document',
    prompt: 'Here is your prescription',
    async getMessages(_trx, pharmacistState) {
      const { prescription_id, prescription_code } =
        pharmacistState.chatbot_user.data
      assert(typeof prescription_id === 'string')
      assert(typeof prescription_code === 'string')

      const file_path = await generatePDF(
        `${PRESCRIPTIONS_BASE_URL}/prescriptions/${prescription_id}?code=${prescription_code}`,
      )

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
      // deletePDF(file_path)
      return [documentMessage, buttonMessage]
    },
    onExit(_trx, pharmacistState): PharmacistConversationState {
      return pharmacistState.chatbot_user.entity_id
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
