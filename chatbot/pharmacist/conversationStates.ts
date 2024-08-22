import {
  ConversationStates,
  Location,
  PharmacistChatbotUserState,
  PharmacistConversationState,
  TrxOrDb,
  WhatsAppSingleSendable,
} from '../../types.ts'
import * as conversations from '../../db/models/conversations.ts'
import { assert } from 'std/assert/assert.ts'
import { sql } from 'kysely'
import { generatePDF } from '../../util/pdfUtils.ts'
import { handleLicenceInput } from './handleLicenceInput.ts'
import { handlePrescriptionCode } from './handlePrescriptionCode.ts'
import omit from '../../util/omit.ts'
import {
  dispenseNextStep,
  dispenseType,
  medicationDescription,
  processNextMedication,
  isTheLastMedication,
  getPendingMedicationsByPrescriptionId,
  UpdateNumberOfDispensedMedications,
} from './prescriptionMedications.ts'
import { 
  getPrescriberByPrescriptionId, 
  dispenseMedications,
  getMedicationsByPrescriptionId,
  getFilledMedicationsByPrescriptionId,
  deleteFilledMedications,
 } from '../../db/models/prescriptions.ts'
import prescriptions from '../../routes/app/patients/[patient_id]/encounters/[encounter_id]/prescriptions.tsx'

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

        const today = new Date()
        if (pharmacist.expiry_date < today) {
          return 'not_onboarded:licence_expired' as const
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
    prompt: '',
    async getMessages(_trx, pharmacistState) {
      const { prescription_id, prescription_code } =
        pharmacistState.chatbot_user.data
      assert(typeof prescription_id === 'string')
      assert(typeof prescription_code === 'string')

      const medications = await getMedicationsByPrescriptionId(_trx, prescription_id)
      const medicationDescriptions = await medicationDescription(_trx, medications)
      const filledMedications = await getFilledMedicationsByPrescriptionId(_trx, prescription_id)
      const pendingMedications = medications.filter(medication => 
        !filledMedications.some(filledMedication => 
          filledMedication.patient_prescription_medication_id === medication.patient_prescription_medication_id
        )
      )
      const pendingMedicationsDescriptions = await medicationDescription(_trx, pendingMedications)
      
      await conversations.updateChatbotUser(
        _trx,
        pharmacistState.chatbot_user,
        {
          data: {
            ...pharmacistState.chatbot_user.data,
            medications: medicationDescriptions,
            pendingMedications: pendingMedicationsDescriptions,
            number_of_medications: pendingMedicationsDescriptions.length,
            number_of_dispensed_medications: 0, //The number of medications dispensed in this round
            index_of_medications: 0,
          },
        },
      )

      const file_path = await generatePDF(
        `${PRESCRIPTIONS_BASE_URL}/prescriptions/${prescription_id}?code=${prescription_code}`,
      )

      const documentMessage: WhatsAppSingleSendable = {
        type: 'document',
        messageBody: `Here is your prescription\n* ${medicationDescriptions.join('\n* ')}`,
        file_path,
      }

      const buttonMessage: WhatsAppSingleSendable = {
        type: 'buttons',
        messageBody: 'Click below to go back to main menu, or start dispense',
        buttonText: 'Back to main menu',
        options: [{
          id: 'main_menu',
          title: 'Back to Menu',
        }, {
          id: 'dispense',
          title: 'Dispense',
        }],
      }
      return [documentMessage, buttonMessage]
    },

    onExit: dispenseType,
  },
  'onboarded:fill_prescription:ask_dispense_one': {
    type: 'select',
    async prompt(
      trx: TrxOrDb,
      pharmacistState: PharmacistChatbotUserState,
    ) {
      return `Do you want to dispense this medication?\n* ${await processNextMedication(
        trx,
        pharmacistState,
      )}`
    },
    options: [
      {
        id: 'yes',
        title: 'Yes',
        async onExit(trx, pharmacistState) {
          const prescription_id = pharmacistState.chatbot_user.data.prescription_id
          const medications = await getPendingMedicationsByPrescriptionId(trx, prescription_id)
          const filledMedicationData = [{
            patient_prescription_medication_id: medications[0].patient_prescription_medication_id,
            pharmacist_id: pharmacistState.chatbot_user.entity_id,
            pharmacy_id: pharmacistState.chatbot_user.entity_id,//JUST FOR TEST
          }]
          await dispenseMedications(trx, filledMedicationData)

          await UpdateNumberOfDispensedMedications(trx, pharmacistState, 1)

          return 'onboarded:fill_prescription:confirm_done' as const
        },
      },
      {
        id: 'no',
        title: 'No',
        onExit: 'onboarded:fill_prescription:confirm_done',
      },
    ],
  },
  'onboarded:fill_prescription:ask_dispense_all': {
    type: 'select',
    prompt: 'Do you want to dispense all medications?',
    options: [
      {
        id: 'Yes',
        title: 'Yes',
        async onExit(trx, pharmacistState) {
          const prescription_id = pharmacistState.chatbot_user.data.prescription_id
          const medications = await getPendingMedicationsByPrescriptionId(trx, prescription_id)
          const filledMedicationData = medications.map((medication) => ({
            patient_prescription_medication_id: medication.patient_prescription_medication_id,
            pharmacist_id: pharmacistState.chatbot_user.entity_id,
            pharmacy_id: pharmacistState.chatbot_user.entity_id, // JUST FOR TEST
          }));
          await dispenseMedications(trx, filledMedicationData)
          await UpdateNumberOfDispensedMedications(trx, pharmacistState, medications.length)
          return 'onboarded:fill_prescription:confirm_done' as const
        },
      },
      {
        id: 'No',
        title: 'No',
        onExit: 'onboarded:fill_prescription:start_dispense',
      },
    ],
  },
  'onboarded:fill_prescription:start_dispense': {
    type: 'select',
    async prompt(
      trx: TrxOrDb,
      pharmacistState: PharmacistChatbotUserState,
    ) {
      return `Please confirm the items you are dispensing\n\nDo you want to dispense\n* ${await processNextMedication(
        trx,
        pharmacistState,
      )}?`
    },
    options: [{
      id: 'yes',
      title: 'Yes',
      async onExit(trx, pharmacistState) {
        const currentIndex = Number(pharmacistState.chatbot_user.data.index_of_medications) - 1
        const prescription_id = pharmacistState.chatbot_user.data.prescription_id
        const medications = await getPendingMedicationsByPrescriptionId(trx, prescription_id)
        const filledMedicationData = [{
          patient_prescription_medication_id: medications[currentIndex].patient_prescription_medication_id,
          pharmacist_id: pharmacistState.chatbot_user.entity_id,
          pharmacy_id: pharmacistState.chatbot_user.entity_id,//JUST FOR TEST
        }]
        await dispenseMedications(trx, filledMedicationData)
        await UpdateNumberOfDispensedMedications(trx, pharmacistState, 1)
        return 'onboarded:fill_prescription:dispense_select' as const
      },
    }, {
      id: 'no',
      title: 'No',
      onExit: 'onboarded:fill_prescription:dispense_select',
    }],
  },
  'onboarded:fill_prescription:dispense_select': {
    type: 'select',
    async prompt(
      trx: TrxOrDb,
      pharmacistState: PharmacistChatbotUserState,
    ) {
      return `Do you want to dispense\n* ${await processNextMedication(
        trx,
        pharmacistState,
      )}?`
    },
    options: [{
      id: 'yes',
      title: 'Yes',
      async onExit(trx, pharmacistState) {
        const prescription_id = pharmacistState.chatbot_user.data.prescription_id
        const medications = await getPendingMedicationsByPrescriptionId(trx, prescription_id)
        const filledMedicationData = [{
          patient_prescription_medication_id: medications[0].patient_prescription_medication_id,
          pharmacist_id: pharmacistState.chatbot_user.entity_id,
          pharmacy_id: pharmacistState.chatbot_user.entity_id,//JUST FOR TEST
        }]
        await dispenseMedications(trx, filledMedicationData)
        await UpdateNumberOfDispensedMedications(trx, pharmacistState, 1)

        return isTheLastMedication(pharmacistState)
        ? 'onboarded:fill_prescription:confirm_done' as const
        : 'onboarded:fill_prescription:dispense_select' as const
      },
    }, {
      id: 'no',
      title: 'No',
      onExit: dispenseNextStep,
    }],
  },
  'onboarded:fill_prescription:confirm_done': {
    type: 'select',
    async prompt(
      trx: TrxOrDb,
      pharmacistState: PharmacistChatbotUserState,
    ) {
      const { prescription_id } = pharmacistState.chatbot_user.data
      assert(typeof prescription_id === 'string')
      const prescriber = await getPrescriberByPrescriptionId(trx, prescription_id)
      assert(prescriber)
      return `Thank you for assisting "${prescriber.name}" do you want to Print or Share the Prescription Note, or restart dispense`
    },
    options: [
      {
        id: 'prescription_note',
        title: 'Prescription Note',
        onExit: 'initial_message',
      },
      {
        id: 'restart_dispense',
        title: 'Restart Dispense',
        async onExit(trx, pharmacistState) {
            const prescription_id = pharmacistState.chatbot_user.data.prescription_id
            const number_of_dispensed_medications = Number(pharmacistState.chatbot_user.data.number_of_dispensed_medications)
            const allFilledMedications = await getFilledMedicationsByPrescriptionId(trx, prescription_id)
            const filledMedicationsThisRound = allFilledMedications.slice(0, number_of_dispensed_medications);
            console.log(filledMedicationsThisRound);
            await deleteFilledMedications(trx, filledMedicationsThisRound)
          return await dispenseType(trx, pharmacistState)
        }
      },
      {
        id: 'main_menu',
        title: 'Back To Main Menu',
        onExit: 'initial_message',
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
