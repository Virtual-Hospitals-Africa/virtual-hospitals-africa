import { dosageDisplay } from '../../shared/medication.ts'
import omit from '../../util/omit.ts'
import { durationBetween } from '../../util/date.ts'
import {
  dispenseMedications,
  getFilledMedicationsByPrescriptionId,
  getMedicationsByPrescriptionId,
} from '../../db/models/prescriptions.ts'
import {
  PharmacistChatbotUserState,
  PrescriptionMedication,
  TrxOrDb,
} from '../../types.ts'
import { assert } from 'std/assert/assert.ts'
import { assertNotEquals } from 'std/assert/assert_not_equals.ts'
import * as conversations from '../../db/models/conversations.ts'
// import { login_href } from '../../routes/login.tsx'

function medicationDescription(
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

export async function getAndUptateMedications(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
  prescription_id: string,
): Promise<string[]> {
  const medications = await getMedicationsByPrescriptionId(
    trx,
    prescription_id,
  )
  const medicationDescriptions = medicationDescription(medications)
  const filledMedications = await getFilledMedicationsByPrescriptionId(
    trx,
    prescription_id,
  )
  const pendingMedications = medications.filter((medication) =>
    !filledMedications.some((filledMedication) =>
      filledMedication.patient_prescription_medication_id ===
        medication.patient_prescription_medication_id
    )
  )
  const pendingMedicationsDescriptions = medicationDescription(
    pendingMedications,
  )

  await conversations.updateChatbotUser(
    trx,
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

  return medicationDescriptions
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
          'index_of_medications',
          'number_of_dispensed_medications',
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
  assertNotEquals(index_of_medications, pendingMedications.length)

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
  prescription_id: string,
): Promise<PrescriptionMedication[]> {
  const medications = await getMedicationsByPrescriptionId(trx, prescription_id)
  const filledMedications = await getFilledMedicationsByPrescriptionId(
    trx,
    prescription_id,
  )
  const pendingMedications = medications.filter((medication) =>
    !filledMedications.some((filledMedication) =>
      filledMedication.patient_prescription_medication_id ===
        medication.patient_prescription_medication_id
    )
  )
  return pendingMedications
}

export async function updateNumberOfDispensedMedications(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
  number_of_medications: number,
) {
  const number_of_dispensed_medications = Number(
    pharmacistState.chatbot_user.data.number_of_dispensed_medications,
  )
  await conversations.updateChatbotUser(
    trx,
    pharmacistState.chatbot_user,
    {
      data: {
        ...omit(pharmacistState.chatbot_user.data, [
          'number_of_dispensed_medications',
        ]),
        number_of_dispensed_medications: number_of_dispensed_medications +
          number_of_medications,
      },
    },
  )
}

export async function dispenseOne(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
) {
  const currentIndex =
    Number(pharmacistState.chatbot_user.data.index_of_medications) - 1
  const prescription_id = pharmacistState.chatbot_user.data.prescription_id
  assert(typeof prescription_id === 'string')
  const medications = await getPendingMedicationsByPrescriptionId(
    trx,
    prescription_id,
  )
  const filledMedicationData = [{
    patient_prescription_medication_id:
      medications[currentIndex].patient_prescription_medication_id,
    pharmacist_id: pharmacistState.chatbot_user.entity_id,
    pharmacy_id: pharmacistState.chatbot_user.entity_id, //JUST FOR TEST
  } as {
    patient_prescription_medication_id: string
    pharmacist_id: string
    pharmacy_id: string
  }]
  await dispenseMedications(trx, filledMedicationData)
  await updateNumberOfDispensedMedications(trx, pharmacistState, 1)

  return dispenseNextStep(trx, pharmacistState)
}
