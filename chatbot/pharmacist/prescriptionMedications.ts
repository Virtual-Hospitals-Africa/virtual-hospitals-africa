import omit from '../../util/omit.ts'
import * as prescriptions from '../../db/models/prescriptions.ts'
import * as prescription_medications from '../../db/models/prescription_medications.ts'
import { PharmacistChatbotUserState, TrxOrDb } from '../../types.ts'
import { assert } from 'std/assert/assert.ts'
import * as conversations from '../../db/models/conversations.ts'
import partition from '../../util/partition.ts'

export type PharmacistStateData = {
  prescription_id: string
  prescription_code: string
  focus_prescription_medication_id?: string
  // medications: string[]
  // undispensed_medications: string[]
  // number_of_undispensed_medications: number
  // count_dispensed_medications: number
  // index_of_undispensed_medications: number
}

export async function currentMedication(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
) {
  const { prescription_id, focus_prescription_medication_id } = pharmacistState
    .chatbot_user.data as PharmacistStateData
  assert(focus_prescription_medication_id)
  return focus_prescription_medication_id
}

export async function dispenseType(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
) {
  const unhandled_message = pharmacistState.unhandled_message.trimmed_body!
  const { number_of_undispensed_medications } = pharmacistState.chatbot_user
    .data as PharmacistStateData

  await conversations.updateChatbotUser(
    trx,
    pharmacistState.chatbot_user,
    {
      data: {
        ...omit(pharmacistState.chatbot_user.data, [
          'count_dispensed_medications',
          'index_of_undispensed_medications',
        ]),
        count_dispensed_medications: 0,
        index_of_undispensed_medications: 0,
      },
    },
  )

  if (
    unhandled_message === 'dispense' || unhandled_message === 'restart_dispense'
  ) {
    assert(
      number_of_undispensed_medications > 0,
      'The number of medications in the prescription must be greater than 0.',
    )
    if (number_of_undispensed_medications === 1) {
      return 'onboarded:fill_prescription:ask_dispense_one' as const
    } else {
      return 'onboarded:fill_prescription:ask_dispense_all' as const
    }
  } else {
    return 'initial_message' as const
  }
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

async function updateData(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
  number_of_dispense: number,
  is_dispensed: boolean,
) {
  const { count_dispensed_medications, index_of_undispensed_medications } =
    pharmacistState.chatbot_user.data as PharmacistStateData

  await conversations.updateChatbotUser(
    trx,
    pharmacistState.chatbot_user,
    {
      data: {
        ...omit(pharmacistState.chatbot_user.data, [
          'count_dispensed_medications',
          'index_of_undispensed_medications',
        ]),
        count_dispensed_medications: count_dispensed_medications +
          (is_dispensed ? number_of_dispense : 0),
        index_of_undispensed_medications: index_of_undispensed_medications +
          number_of_dispense,
      },
    },
  )
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
  const { prescription_id } = pharmacistState.chatbot_user
    .data as PharmacistStateData

  const medications = await prescription_medications.getByPrescriptionId(
    trx,
    prescription_id,
    {
      unfilled: true,
    },
  )

  const { index_of_undispensed_medications, count_dispensed_medications } =
    pharmacistState.chatbot_user.data as PharmacistStateData

  const filled_medication_data = [{
    prescription_medication_id: medications[
      index_of_undispensed_medications - count_dispensed_medications
    ].prescription_medication_id,
    pharmacist_id: pharmacistState.chatbot_user.entity_id!,
    pharmacy_id: null,
  }]

  await prescription_medications.fill(trx, filled_medication_data)

  const number_of_dispense = 1
  const is_dispensed = true
  await updateData(trx, pharmacistState, number_of_dispense, is_dispensed)

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
  await updateData(trx, pharmacistState, medications.length, is_dispensed)

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
