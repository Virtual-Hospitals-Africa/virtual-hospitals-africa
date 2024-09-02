import omit from '../../util/omit.ts'
import {
  deleteCode,
  deleteFilledMedicationsById,
  describeMedication,
  dispenseMedications,
  getMedicationsByPrescriptionId,
  getPrescriberByPrescriptionId,
} from '../../db/models/prescriptions.ts'
import { PharmacistChatbotUserState, TrxOrDb } from '../../types.ts'
import { assert } from 'std/assert/assert.ts'
import * as conversations from '../../db/models/conversations.ts'
import partition from '../../util/partition.ts'

export type PharmacistStateData = {
  prescription_code: string
  prescription_id: string
  medications: string[]
  undispensed_medications: string[]
  number_of_undispensed_medications: number
  count_dispensed_medications: number
  index_of_undispensed_medications: number
}

export async function updateMedications(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
): Promise<void> {
  const { prescription_code, prescription_id } = pharmacistState.chatbot_user
    .data as PharmacistStateData

  const medications = await getMedicationsByPrescriptionId(
    trx,
    prescription_id,
  )
  const [unfilled, filled] = partition(medications, (m) => !!m.is_filled)

  const stateData: PharmacistStateData = {
    prescription_code: prescription_code,
    prescription_id: prescription_id,
    medications: unfilled.map(describeMedication),
    undispensed_medications: filled.map(describeMedication),
    number_of_undispensed_medications: filled.length,
    count_dispensed_medications: 0,
    index_of_undispensed_medications: 0,
  }

  await conversations.updateChatbotUser(
    trx,
    pharmacistState.chatbot_user,
    {
      data: stateData,
    },
  )
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

export function currentMedication(
  _trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
): string {
  const {
    undispensed_medications,
    number_of_undispensed_medications,
    index_of_undispensed_medications,
  } = pharmacistState.chatbot_user.data as PharmacistStateData

  assert(index_of_undispensed_medications < number_of_undispensed_medications)

  const medication_description =
    undispensed_medications[index_of_undispensed_medications]

  return medication_description
}

export async function getPrescriber(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
): Promise<string> {
  const { prescription_id } = pharmacistState.chatbot_user.data
  assert(typeof prescription_id === 'string')
  const prescriber = await getPrescriberByPrescriptionId(
    trx,
    prescription_id,
  )
  assert(prescriber)
  return prescriber.name
}

function isTheLastMedication(
  pharmacistState: PharmacistChatbotUserState,
): boolean {
  const {
    number_of_undispensed_medications,
    index_of_undispensed_medications,
  } = pharmacistState.chatbot_user.data as PharmacistStateData
  return index_of_undispensed_medications === number_of_undispensed_medications
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

  const medications = await getMedicationsByPrescriptionId(
    trx,
    prescription_id,
    {
      unfilled: true,
    },
  )

  const { index_of_undispensed_medications, count_dispensed_medications } =
    pharmacistState.chatbot_user.data as PharmacistStateData

  const filled_medication_data = [{
    patient_prescription_medication_id: medications[
      index_of_undispensed_medications - count_dispensed_medications
    ].patient_prescription_medication_id,
    pharmacist_id: pharmacistState.chatbot_user.entity_id!,
  }]

  await dispenseMedications(trx, filled_medication_data)

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

  const medications = await getMedicationsByPrescriptionId(
    trx,
    prescription_id,
    {
      unfilled: true,
    },
  )
  const filled_medication_data = medications.map((medication) => ({
    patient_prescription_medication_id:
      medication.patient_prescription_medication_id,
    pharmacist_id: pharmacistState.chatbot_user.entity_id!,
  }))
  await dispenseMedications(trx, filled_medication_data)

  const is_dispensed = true
  await updateData(trx, pharmacistState, medications.length, is_dispensed)

  return 'onboarded:fill_prescription:confirm_done' as const
}

export async function dispenseRestart(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
) {
  const { prescription_id, count_dispensed_medications } = pharmacistState
    .chatbot_user.data as PharmacistStateData

  const medications = await getMedicationsByPrescriptionId(
    trx,
    prescription_id,
    {
      filled: true,
    },
  )

  await deleteFilledMedicationsById(
    trx,
    medications.slice(0, count_dispensed_medications).map((m) =>
      m.patient_prescription_medication_id
    ),
  )
  return dispenseType(trx, pharmacistState)
}

export async function dispenseExit(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
) {
  const {
    prescription_code,
    number_of_undispensed_medications,
    count_dispensed_medications,
  } = pharmacistState.chatbot_user
    .data as PharmacistStateData
  if (count_dispensed_medications === number_of_undispensed_medications) {
    await deleteCode(trx, prescription_code)
  }

  return 'initial_message' as const
}
