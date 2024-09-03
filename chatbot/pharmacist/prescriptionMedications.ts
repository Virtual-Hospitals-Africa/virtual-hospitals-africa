import * as prescriptions from '../../db/models/prescriptions.ts'
import * as prescription_medications from '../../db/models/prescription_medications.ts'
import { PharmacistChatbotUserState, TrxOrDb } from '../../types.ts'
import { assert } from 'std/assert/assert.ts'
import * as conversations from '../../db/models/conversations.ts'

export type PharmacistStateData = {
  prescription_id: string
  prescription_code: string
  prescription_medication_id?: string
}

export function activePresciptionMedicationId(
  pharmacistState: PharmacistChatbotUserState,
) {
  const { prescription_medication_id } = pharmacistState
    .chatbot_user.data as PharmacistStateData
  assert(prescription_medication_id, 'Prescription medication ID is required at this stage of the chatbot')
  return prescription_medication_id
}

export async function dispenseType(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
) {
  const unhandled_message = pharmacistState.unhandled_message.trimmed_body!

  if (unhandled_message !== 'dispense' && unhandled_message !== 'restart_dispense') {
    return 'initial_message' as const
  }

  const { prescription_id } = pharmacistState.chatbot_user.data as PharmacistStateData

  const unfilled_medications = await prescription_medications.getByPrescriptionId(
    trx,
    prescription_id,
    {
      unfilled: true,
    },
  )

  assert(
    unfilled_medications.length > 0,
    'The number of medications in the prescription must be greater than 0.',
  )
  if (unfilled_medications.length > 1) {
    return 'onboarded:fill_prescription:ask_dispense_all' as const
  }

  await conversations.updateChatbotUser(
    trx,
    pharmacistState.chatbot_user,
    {
      data: {
        ...pharmacistState.chatbot_user.data,
        prescription_medication_id: unfilled_medications[0].prescription_medication_id,
      },
    },
  )

  return 'onboarded:fill_prescription:ask_dispense_one' as const
}

export async function getPrescriber(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
): Promise<string> {
  const { prescription_id } = pharmacistState.chatbot_user.data
  assert(typeof prescription_id === 'string')
  const prescription = await prescriptions.getById(
    trx,
    prescription_id,
  )

  return prescription!.prescriber_name
}

function dispenseNextStep(
  _trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
) {
  return isTheLastMedication(pharmacistState)
    ? 'onboarded:fill_prescription:confirm_done' as const
    : 'onboarded:fill_prescription:dispense_select' as const
}

export async function dispenseSkip(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
) {
  const number_of_dispense = 1
  const is_dispensed = false
  await updateData(trx, pharmacistState, number_of_dispense, is_dispensed)

  return dispenseNextStep(trx, pharmacistState)
}

export async function dispenseOne(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
) {
  const { prescription_id, prescription_medication_id } = pharmacistState.chatbot_user
    .data as PharmacistStateData

  assert(prescription_medication_id)

  await prescription_medications.fill(trx, [{
    prescription_medication_id,
    pharmacist_id: pharmacistState.chatbot_user.entity_id!,
    pharmacy_id: null,
  }])

  return dispenseNextStep(trx, pharmacistState)
}

export async function dispenseAll(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
) {
  const { prescription_id } = pharmacistState.chatbot_user
    .data as PharmacistStateData

  const medications = await prescription_medications.getByPrescriptionId(
    trx,
    prescription_id,
    {
      unfilled: true,
    },
  )
  const filled_medication_data = medications.map((medication) => ({
    prescription_medication_id: medication.prescription_medication_id,
    pharmacist_id: pharmacistState.chatbot_user.entity_id!,
    pharmacy_id: null,
  }))
  await prescription_medications.fill(trx, filled_medication_data)

  const is_dispensed = true
  // await updateData(trx, pharmacistState, medications.length, is_dispensed)

  return 'onboarded:fill_prescription:confirm_done' as const
}

export async function dispenseRestart(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
) {
  const { prescription_id } = pharmacistState.chatbot_user
    .data as PharmacistStateData
  await prescription_medications.undoFill(
    trx,
    { prescription_id },
  )
  return dispenseType(trx, pharmacistState)
}

export async function dispenseExit(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
) {
  const { prescription_id, prescription_code } = pharmacistState.chatbot_user
    .data as PharmacistStateData
  const medications = await prescription_medications.getByPrescriptionId(
    trx,
    prescription_id,
  )
  if (medications.every((m) => m.filled_at)) {
    await prescriptions.deleteCode(trx, prescription_code)
  }

  return 'initial_message' as const
}
