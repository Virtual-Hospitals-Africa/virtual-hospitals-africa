import {
  ConversationStates,
  PharmacistChatbotUserState,
  PharmacistConversationState,
  TrxOrDb,
  WhatsAppSingleSendable,
} from '../../types.ts'
import * as conversations from '../../db/models/conversations.ts'
import * as pharmacists from '../../db/models/pharmacists.ts'
import * as pharmacies from '../../db/models/pharmacies.ts'
import * as prescription_medications from '../../db/models/prescription_medications.ts'
import { assert } from 'std/assert/assert.ts'
import { generatePDF } from '../../util/pdfUtils.ts'
import {
  handleLicenceInput,
  handlePharmacyLicenceInput,
} from './handleLicenceInput.ts'
import { handlePrescriptionCode } from './handlePrescriptionCode.ts'
import {
  activePresciptionMedication,
  dispenseAll,
  dispenseExit,
  dispenseOne,
  dispenseRestart,
  dispenseSkip,
  dispenseType,
  getPrescriber,
  handleDispense,
  medicationDisplay,
} from './prescriptionMedications.ts'
import { handleShareLocation } from './handleShareLocation.ts'
import { handleAskPrescriber } from './handleAskPrescriber.ts'

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

const PRESCRIPTIONS_BASE_URL = Deno.env.get('PRESCRIPTIONS_BASE_URL') ||
  'https://localhost:8000'
assert(PRESCRIPTIONS_BASE_URL, 'PRESCRIPTIONS_BASE_URL should be set')

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
      {
        id: 'fill_prescription',
        title: 'Fill Prescription',
        onExit(
          trx: TrxOrDb,
          pharmacistState: PharmacistChatbotUserState,
        ) {
          return checkOnboardingStatus(
            trx,
            pharmacistState,
            'onboarded:fill_prescription:enter_code',
          )
        },
      },
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
    prompt:
      `No record found with that licence number. To continue, you'll need to reenter your licence number.`,
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
        id: 'yes',
        title: 'Yes',
        onExit: 'not_onboarded:enter_pharmacy_licence',
      },
      {
        id: 'no',
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
    prompt:
      'Your license has expired. Please contact the authority to renew your license.',
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
    prompt:
      `No pharmacy record found with that licence number. To continue, you'll need to reenter your pharmacy licence number.`,
    onExit: handlePharmacyLicenceInput,
  },
  'not_onboarded:incorrect_pharmacy_licence': {
    type: 'string',
    prompt:
      `We don't have a record of you working at that pharmacy. Please reenter your pharmacy licence number.`,
    onExit: handlePharmacyLicenceInput,
  },
  'not_onboarded:pharmacy_licence_expired': {
    type: 'select',
    prompt:
      'Your pharmacy license has expired. Please contact the authority to renew your license.',
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
        id: 'yes',
        title: 'Yes',
        onExit: 'not_onboarded:share_location',
      },
      {
        id: 'no',
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
    prompt:
      'For regulatory purposes, we will need to have your current location, can you share that to us?',
    onExit: handleShareLocation,
  },
  'not_onboarded:reshare_location': {
    type: 'get_location',
    prompt:
      "Sorry, we couldn't process that. Please click the + icon in the lower left corner to share your location and proceed",
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
  'onboarded:fill_prescription:enter_code': {
    type: 'string',
    prompt: 'Please enter your prescription code',
    onExit: handlePrescriptionCode,
  },
  'onboarded:fill_prescription:reenter_code': {
    type: 'select',
    prompt: 'The code you entered is invalid. Please check and try again.',
    options: [
      {
        id: 'retry',
        title: 'Retry',
        onExit: 'onboarded:fill_prescription:enter_code',
      },
      {
        id: 'main_menu',
        title: 'Back to main menu',
        onExit: 'initial_message',
      },
    ],
  },
  'onboarded:fill_prescription:send_pdf': {
    type: 'send_document',
    prompt: '',
    async getMessages(trx, pharmacistState) {
      const { prescription_id, prescription_code } =
        pharmacistState.chatbot_user.data
      assert(typeof prescription_id === 'string')
      assert(typeof prescription_code === 'string')

      const file_path = await generatePDF(
        `${PRESCRIPTIONS_BASE_URL}/prescriptions/${prescription_id}?code=${prescription_code}`,
      )

      const unfilled_medications = await prescription_medications
        .getByPrescriptionId(
          trx,
          prescription_id,
          { unfilled: true },
        )

      assert(unfilled_medications.length > 0)

      const documentMessage: WhatsAppSingleSendable = {
        type: 'document',
        messageBody:
          `Here is the patient's prescription including the following medications:\n* ${
            unfilled_medications.map((m) => m.drug_generic_name).join('\n* ')
          }`,
        file_path,
      }

      const buttonMessage: WhatsAppSingleSendable = {
        type: 'buttons',
        messageBody: 'Click below to continue dispensing medications',
        buttonText: 'Back to main menu',
        options: [{
          id: 'dispense',
          title: 'Dispense',
        }, {
          id: 'ask_prescriber',
          title: 'Ask Prescriber',
        }, {
          id: 'main_menu',
          title: 'Back to Menu',
        }],
      }
      return [documentMessage, buttonMessage]
    },

    onExit: dispenseType,
  },
  'onboarded:fill_prescription:decision': {
    type: 'select',
    prompt: 'Click below to continue dispensing medications',
    options: [{
      id: 'dispense',
      title: 'Dispense',
      onExit: handleDispense,
    }, {
      id: 'ask_prescriber',
      title: 'Ask Prescriber',
      onExit: 'onboarded:fill_prescription:ask_prescriber',
    }, {
      id: 'main_menu',
      title: 'Back to Menu',
      onExit: 'initial_message',
    }],
  },
  'onboarded:fill_prescription:ask_prescriber': {
    type: 'string',
    prompt:
      'Chat with the prescriber here. When finished type you may type done or click the dispense button.',
    onExit: handleAskPrescriber,
  },
  'onboarded:fill_prescription:ask_prescriber_continue': {
    type: 'string',
    prompt:
      "Your message has been sent to the prescriber. You'll receive a message here when they reply.",
    onExit: handleAskPrescriber,
  },
  'onboarded:fill_prescription:ask_dispense_one': {
    type: 'select',
    async prompt(
      trx: TrxOrDb,
      pharmacistState: PharmacistChatbotUserState,
    ) {
      const medication = await activePresciptionMedication(
        trx,
        pharmacistState,
      )

      return `Are you dispensing this medication?\n\n${
        medicationDisplay(medication)
      }`
    },
    options: [
      {
        id: 'yes',
        title: 'Yes',
        onExit: dispenseOne,
      },
      {
        id: 'no',
        title: 'No',
        onExit: dispenseSkip,
      },
    ],
  },
  'onboarded:fill_prescription:ask_dispense_all': {
    type: 'select',
    prompt: 'Do you want to dispense all undispensed medications?',
    options: [
      {
        id: 'Yes',
        title: 'Yes',
        onExit: dispenseAll,
      },
      {
        id: 'No',
        title: 'No',
        async onExit(trx, pharmacistState) {
          const unfilled_medications = await prescription_medications
            .getByPrescriptionId(
              trx,
              pharmacistState.chatbot_user.data.prescription_id as string,
              {
                unfilled: true,
              },
            )

          await conversations.updateChatbotUser(
            trx,
            pharmacistState.chatbot_user,
            {
              data: {
                ...pharmacistState.chatbot_user.data,
                prescription_medication_id:
                  unfilled_medications[0].prescription_medication_id,
              },
            },
          )

          return 'onboarded:fill_prescription:ask_dispense_one' as const
        },
      },
    ],
  },
  'onboarded:fill_prescription:confirm_done': {
    type: 'select',
    async prompt(
      trx: TrxOrDb,
      pharmacistState: PharmacistChatbotUserState,
    ) {
      return `Thank you for assisting "${await getPrescriber(
        trx,
        pharmacistState,
      )}" do you want to Print or Share the Prescription Note, or restart dispense`
    },
    options: [
      {
        id: 'restart_dispense',
        title: 'Restart Dispense',
        onExit: dispenseRestart,
      },
      {
        id: 'main_menu',
        title: 'Back To Main Menu',
        onExit: dispenseExit,
      },
    ],
  },
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
