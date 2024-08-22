import { dosageDisplay } from '../../shared/medication.ts'
import omit from '../../util/omit.ts'
import { durationBetween } from '../../util/date.ts'
import { 
  getMedicationsByPrescriptionId,
  getFilledMedicationsByPrescriptionId,
 } from '../../db/models/prescriptions.ts'
import { PharmacistChatbotUserState, TrxOrDb } from '../../types.ts'
import { assert } from 'std/assert/assert.ts'
import { assertNotEquals } from 'std/assert/assert_not_equals.ts'
import * as conversations from '../../db/models/conversations.ts'
import { login_href } from '../../routes/login.tsx'

export async function medicationDescription(
  trx: TrxOrDb,
  medications: {
    name: string;
    intake_frequency: string;
    end_date: string;
    dosage: number;
    strength: number;
    strength_denominator: number;
    patient_prescription_medication_id: string;
    route: string;
    special_instructions: string | null;
    form: string;
    strength_numerator_unit: string;
    strength_denominator_unit: string;
    strength_denominator_is_units: boolean;
    start_date: string | null;
  }[]
): Promise<string[]> {
  
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

export async function dispenseType(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
) {
  const unhandled_message = pharmacistState.unhandled_message.trimmed_body!
  const { number_of_medications } = pharmacistState.chatbot_user.data
  assert(typeof number_of_medications === 'number')

  await conversations.updateChatbotUser(
    trx,
    pharmacistState.chatbot_user,
    {
      data: {
        ...omit(pharmacistState.chatbot_user.data, [
          'index_of_medications','number_of_dispensed_medications',
        ]),
        index_of_medications: 0,
        number_of_dispensed_medications: 0,
      },
    },
  )

  if (
    unhandled_message === 'dispense' || unhandled_message === 'restart_dispense'
  ) {
    if (number_of_medications === 1) {
      return 'onboarded:fill_prescription:ask_dispense_one'
    } else {
      return 'onboarded:fill_prescription:ask_dispense_all'
    }
  } else {
    return 'initial_message'
  }
}

export async function processNextMedication(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
): Promise<string> {
  const { pendingMedications, index_of_medications } =
    pharmacistState.chatbot_user.data
  assert(
    Array.isArray(pendingMedications) &&
    pendingMedications.every((item) => typeof item === 'string'),
  )
  assert(typeof index_of_medications === 'number')
  assertNotEquals(index_of_medications, pendingMedications.length);

  const medicationDescription = pendingMedications[index_of_medications]

  await conversations.updateChatbotUser(
    trx,
    pharmacistState.chatbot_user,
    {
      data: {
        ...omit(pharmacistState.chatbot_user.data, ['index_of_medications']),
        index_of_medications: index_of_medications + 1,
      },
    },
  )

  return medicationDescription
}

export function isTheLastMedication(
  pharmacistState: PharmacistChatbotUserState,
) {
  const { pendingMedications, index_of_medications } =
    pharmacistState.chatbot_user.data
  assert(
    Array.isArray(pendingMedications) &&
    pendingMedications.every((item) => typeof item === 'string'),
  )
  assert(typeof index_of_medications === 'number')
  return index_of_medications == pendingMedications.length
}

export function dispenseNextStep(
  _trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
) {
  return isTheLastMedication(pharmacistState)
  ? 'onboarded:fill_prescription:confirm_done' as const
  : 'onboarded:fill_prescription:dispense_select' as const
}

export async function getPendingMedicationsByPrescriptionId(  
  trx: TrxOrDb,
  prescription_id: string
) {
  const medications = await getMedicationsByPrescriptionId(trx, prescription_id)
  const filledMedications = await getFilledMedicationsByPrescriptionId(trx, prescription_id)
  const pendingMedications = medications.filter(medication => 
    !filledMedications.some(filledMedication => 
      filledMedication.patient_prescription_medication_id === medication.patient_prescription_medication_id
    )
  )
  return pendingMedications
}

export async function UpdateNumberOfDispensedMedications(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
  number_of_medications: number,
) {
  const number_of_dispensed_medications = Number(pharmacistState.chatbot_user.data.number_of_dispensed_medications)
  await conversations.updateChatbotUser(
    trx,
    pharmacistState.chatbot_user,
    {
      data: {
        ...omit(pharmacistState.chatbot_user.data, ['number_of_dispensed_medications']),
        number_of_dispensed_medications: number_of_dispensed_medications + number_of_medications,
      },
    },
  )
}