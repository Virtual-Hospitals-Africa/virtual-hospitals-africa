import { dosageDisplay } from '../../shared/medication.ts'
import omit from '../../util/omit.ts'
import { durationBetween } from '../../util/date.ts'
import {
  deleteCode,
  deleteFilledMedicationsById,
  dispenseMedications,
  getFilledMedicationsByPrescriptionId,
  getMedicationsByPrescriptionId,
  getPrescriberByPrescriptionId,
  MedicationsFilled,
} from '../../db/models/prescriptions.ts'
import {
  PharmacistChatbotUserState,
  PrescriptionMedication,
  TrxOrDb,
} from '../../types.ts'
import { assert } from 'std/assert/assert.ts'
import * as conversations from '../../db/models/conversations.ts'

export type PharmacistStateData = {
  prescription_code: string
  prescription_id: string
  medications: string[]
  undispensed_medications: string[]
  number_of_undispensed_medications: number
  count_dispensed_medications: number
  index_of_undispensed_medications: number
}

async function filterMedications(
  trx: TrxOrDb,
  prescription_id: string,
  medications: PrescriptionMedication[],
) {
  const filledMedications = await getFilledMedicationsByPrescriptionId(
    trx,
    prescription_id,
  )
  return medications.filter((medication) =>
    !filledMedications.some((filledMedication) =>
      filledMedication.patient_prescription_medication_id ===
        medication.patient_prescription_medication_id
    )
  )
}

async function getUndispensedMedications(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
): Promise<PrescriptionMedication[]> {
  const { prescription_id } = pharmacistState.chatbot_user
    .data as PharmacistStateData

  const medications = await getMedicationsByPrescriptionId(trx, prescription_id)
  return await filterMedications(trx, prescription_id, medications)
}

function describeMedication(
  medications: PrescriptionMedication[],
): string[] {
  return medications.map((medication) => {
    assert(typeof medication.start_date === 'string')
    assert(typeof medication.end_date === 'string')
    const duration = durationBetween(medication.start_date, medication.end_date)
      .duration + 1
    return `*${medication.name}* : ${
      dosageDisplay({
        dosage: medication.dosage / medication.strength_denominator,
        ...omit(medication, ['dosage']),
      })
    } * ${duration} = ${
      medication.dosage * duration
    } ${medication.strength_denominator_unit}`
  })
}

export async function uptateMedications(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
): Promise<void> {
  const { prescription_code, prescription_id } = pharmacistState.chatbot_user
    .data as PharmacistStateData

  const medications = await getMedicationsByPrescriptionId(
    trx,
    prescription_id,
  )
  const medication_descriptions = describeMedication(medications)
  const undispensed_medications_descriptions = describeMedication(
    await filterMedications(trx, prescription_id, medications),
  )

  const stateData: PharmacistStateData = {
    prescription_code: prescription_code,
    prescription_id: prescription_id,
    medications: medication_descriptions,
    undispensed_medications: undispensed_medications_descriptions,
    number_of_undispensed_medications:
      undispensed_medications_descriptions.length,
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
    if (number_of_undispensed_medications === 1) {
      return 'onboarded:fill_prescription:ask_dispense_one'
    } else {
      return 'onboarded:fill_prescription:ask_dispense_all'
    }
  } else {
    return 'initial_message'
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
  const medications = await getUndispensedMedications(
    trx,
    pharmacistState,
  )

  const { index_of_undispensed_medications, count_dispensed_medications } =
    pharmacistState.chatbot_user.data as PharmacistStateData

  const filled_medication_data = [{
    patient_prescription_medication_id: medications[
      index_of_undispensed_medications - count_dispensed_medications
    ].patient_prescription_medication_id,
    pharmacist_id: pharmacistState.chatbot_user.entity_id,
  } as MedicationsFilled]

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
  const medications = await getUndispensedMedications(
    trx,
    pharmacistState,
  )
  const filled_medication_data = medications.map((medication) => ({
    patient_prescription_medication_id:
      medication.patient_prescription_medication_id,
    pharmacist_id: pharmacistState.chatbot_user.entity_id,
  } as MedicationsFilled))
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
  const filled_medications_id =
    (await getFilledMedicationsByPrescriptionId(trx, prescription_id))
      .slice(0, count_dispensed_medications)
      .map((filled_id) => filled_id.patient_prescription_medication_id)

  await deleteFilledMedicationsById(trx, filled_medications_id)
  return dispenseType(trx, pharmacistState)
}

export async function dispenseExit(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
) {
  const { prescription_code } = pharmacistState.chatbot_user
    .data as PharmacistStateData
  await deleteCode(trx, prescription_code)

  return 'initial_message' as const
}
