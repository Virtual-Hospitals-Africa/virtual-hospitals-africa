// TODO: rewrite prescription-related states against new patient_prescriptions model
import { ConversationStates, PharmacistChatbotUserState, PharmacistConversationState, TrxOrDb } from '../../types.ts'
import { conversations } from '../../db/models/conversations.ts'
import { pharmacists } from '../../db/models/pharmacists.ts'
import { pharmacies } from '../../db/models/pharmacies.ts'
import { assert } from 'std/assert/assert.ts'
// import { generate } from '../../util/pdf.ts'
import { handleLicenceInput, handlePharmacyLicenceInput } from './handleLicenceInput.ts'
// import { handlePrescriptionCode } from './handlePrescriptionCode.ts'
// import {
//   activePresciptionMedication,
//   dispenseAll,
//   dispenseExit,
//   dispenseOne,
//   dispenseRestart,
//   dispenseSkip,
//   dispenseType,
//   getPrescriber,
//   handleDispense,
//   medicationDisplay,
// } from './prescriptionMedications.ts'
import { handleShareLocation } from './handleShareLocation.ts'
// import { handleAskPrescriber } from './handleAskPrescriber.ts'

async function checkOnboardingStatus(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
  if_onboarded_state: PharmacistConversationState,
): Promise<PharmacistConversationState> {
  if (pharmacistState.chatbot_user.entity_id) {
    return if_onboarded_state
  }
  await conversations.updateChatbotUser(
    trx,
    pharmacistState.chatbot_user,
    {
      data: {
        ...pharmacistState.chatbot_user.data,
        after_onboarding_state: if_onboarded_state,
      },
    },
  )
  return 'not_onboarded:enter_licence_number' as const
}

// const PRESCRIPTIONS_BASE_URL = Deno.env.get('PRESCRIPTIONS_BASE_URL') ||
//   'https://localhost:8000'
// assert(PRESCRIPTIONS_BASE_URL, 'PRESCRIPTIONS_BASE_URL should be set')

const welcome =
  'Welcome to the Pharmacist Chatbot! This is a demo to showcase the capabilities of the chatbot. Please follow the prompts to complete the demo.\n\nTo start, select the items from the following menu'

export const PHARMACIST_CONVERSATION_STATES: ConversationStates<
  PharmacistChatbotUserState
> = {
  'initial_message': {
    type: 'select',
    async prompt(trx: TrxOrDb, pharmacistState: PharmacistChatbotUserState) {
      const { entity_id } = pharmacistState.chatbot_user
      if (!entity_id) return welcome

      const pharmacist = await pharmacists.getById(trx, entity_id)
      if (!pharmacist) {
        await conversations.updateChatbotUser(
          trx,
          pharmacistState.chatbot_user,
          {
            entity_id: null,
          },
        )
        return welcome
      }

      return `Hello ${pharmacist.given_name}, what can I help you with today?`
    },
    options: [
      // TODO: rewrite prescription filling flow against new patient_prescriptions model
      // {
      //   id: 'fill_prescription',
      //   title: 'Fill Prescription',
      //   onExit(
      //     trx: TrxOrDb,
      //     pharmacistState: PharmacistChatbotUserState,
      //   ) {
      //     return checkOnboardingStatus(
      //       trx,
      //       pharmacistState,
      //       'onboarded:fill_prescription:enter_code',
      //     )
      //   },
      // },
      {
        id: 'view_inventory',
        title: 'View Inventory',
        onExit(
          trx: TrxOrDb,
          pharmacistState: PharmacistChatbotUserState,
        ) {
          return checkOnboardingStatus(
            trx,
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
      `This is the first time we've received a message from this phone number. To confirm you are a licensed pharmacist, please enter your licence number.`,
    onExit: handleLicenceInput,
  },
  'not_onboarded:reenter_licence_number': {
    type: 'string',
    prompt: `Please enter your licence number.`,
    onExit: handleLicenceInput,
  },
  'not_onboarded:incorrect_licence_number': {
    type: 'select',
    prompt: `No record found with that licence number. To continue, you'll need to reenter your licence number.`,
    options: [
      {
        id: 'reenter_licence_number',
        title: 'Try Again',
        onExit: 'not_onboarded:reenter_licence_number',
      },
      {
        id: 'main_menu',
        title: 'Main Menu',
        onExit: 'initial_message',
      },
    ],
  },
  'not_onboarded:confirm_name': {
    type: 'select',
    async prompt(trx: TrxOrDb, pharmacistState: PharmacistChatbotUserState) {
      const { licence_number } = pharmacistState.chatbot_user.data
      assert(typeof licence_number === 'string')
      const pharmacist = await pharmacists.getByLicenceNumber(
        trx,
        licence_number,
      )
      assert(
        pharmacist,
        'The chatbot should not have let the pharmacist proceed with a licence number not corresponding with an extant pharmacist',
      )
      return `We have a record for ${pharmacist.given_name} with that licence. Is this you?`
    },
    options: [
      {
        id: 'Yes',
        title: 'Yes',
        onExit: 'not_onboarded:enter_pharmacy_licence',
      },
      {
        id: 'No',
        title: 'No',
        async onExit(trx, pharmacistState) {
          await conversations.updateChatbotUser(
            trx,
            pharmacistState.chatbot_user,
            {
              data: {
                ...pharmacistState.chatbot_user.data,
                licence_number: null,
              },
            },
          )
          return 'not_onboarded:reenter_licence_number' as const
        },
      },
    ],
  },
  'not_onboarded:licence_expired': {
    type: 'select',
    prompt: 'Your license has expired. Please contact the authority to renew your license.',
    options: [
      {
        id: 'main_menu',
        title: 'Back to main menu',
        onExit: 'initial_message',
      },
    ],
  },
  'not_onboarded:enter_pharmacy_licence': {
    type: 'string',
    prompt: `Please enter your pharmacy licence number.`,
    onExit: handlePharmacyLicenceInput,
  },
  'not_onboarded:reenter_pharmacy_licence': {
    type: 'string',
    prompt: `No pharmacy record found with that licence number. To continue, you'll need to reenter your pharmacy licence number.`,
    onExit: handlePharmacyLicenceInput,
  },
  'not_onboarded:incorrect_pharmacy_licence': {
    type: 'string',
    prompt: `We don't have a record of you working at that pharmacy. Please reenter your pharmacy licence number.`,
    onExit: handlePharmacyLicenceInput,
  },
  'not_onboarded:pharmacy_licence_expired': {
    type: 'select',
    prompt: 'Your pharmacy license has expired. Please contact the authority to renew your license.',
    options: [
      {
        id: 'main_menu',
        title: 'Back to main menu',
        onExit: 'initial_message',
      },
    ],
  },
  'not_onboarded:confirm_pharmacy': {
    type: 'select',
    async prompt(trx: TrxOrDb, pharmacistState: PharmacistChatbotUserState) {
      const { pharmacy_licence_number } = pharmacistState.chatbot_user.data
      assert(typeof pharmacy_licence_number === 'string')
      const pharmacy = await pharmacies.getByLicenceNumber(
        trx,
        pharmacy_licence_number,
      )
      assert(
        pharmacy,
        'The chatbot should not have let the pharmacist proceed with a pharmacy licence number not corresponding with an extant pharmacy',
      )
      return `We have a record you working at ${pharmacy.name}. Is this correct?`
    },
    options: [
      {
        id: 'Yes',
        title: 'Yes',
        onExit: 'not_onboarded:share_location',
      },
      {
        id: 'No',
        title: 'No',
        async onExit(trx, pharmacistState) {
          await conversations.updateChatbotUser(
            trx,
            pharmacistState.chatbot_user,
            {
              data: {
                ...pharmacistState.chatbot_user.data,
                pharmacy_licence_number: null,
              },
            },
          )
          return 'not_onboarded:reenter_pharmacy_licence' as const
        },
      },
    ],
  },
  'not_onboarded:share_location': {
    type: 'get_location',
    prompt: 'For regulatory purposes, we will need to have your current location, can you share that to us?',
    onExit: handleShareLocation,
  },
  'not_onboarded:reshare_location': {
    type: 'get_location',
    prompt: "Sorry, we couldn't process that. Please click the + icon in the lower left corner to share your location and proceed",
    onExit: handleShareLocation,
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
    ],
  },
  // TODO: rewrite prescription-related states against new patient_prescriptions model
  // 'onboarded:fill_prescription:enter_code': { ... },
  // 'onboarded:fill_prescription:reenter_code': { ... },
  // 'onboarded:fill_prescription:send_pdf': { ... },
  // 'onboarded:fill_prescription:decision': { ... },
  // 'onboarded:fill_prescription:ask_prescriber': { ... },
  // 'onboarded:fill_prescription:ask_prescriber_continue': { ... },
  // 'onboarded:fill_prescription:ask_dispense_one': { ... },
  // 'onboarded:fill_prescription:ask_dispense_all': { ... },
  // 'onboarded:fill_prescription:confirm_done': { ... },
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

export function assertIsConversationState(
  state: unknown,
): asserts state is PharmacistConversationState {
  assert(
    typeof state === 'string' && state in PHARMACIST_CONVERSATION_STATES,
    `invalid conversation state ${state}`,
  )
}
