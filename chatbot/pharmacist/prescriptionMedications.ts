import { dosageDisplay } from '../../shared/medication.ts'
import omit from '../../util/omit.ts'
import { durationBetween } from '../../util/date.ts'
import {
  deleteFilledMedications,
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
import * as conversations from '../../db/models/conversations.ts'

type PharmacistStateData = {
  prescription_code: string,
  prescription_id: string,
  medications: string[],
  pendingMedications: string[],
  number_of_medications: number,
  number_of_dispensed_medications: number,
  index_of_medications: number,
}

async function getPendingMedications(
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

async function getMedications(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
): Promise<PrescriptionMedication[]> {
  const { prescription_id } =
    pharmacistState.chatbot_user.data as PharmacistStateData

  const medications = await getMedicationsByPrescriptionId(trx, prescription_id)
  return await getPendingMedications(trx, prescription_id, medications)
}

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
): Promise<string[]> {
  const { prescription_code, prescription_id } = 
    pharmacistState.chatbot_user.data as PharmacistStateData

  const medications = await getMedicationsByPrescriptionId(
    trx,
    prescription_id,
  )
  const medicationDescriptions = medicationDescription(medications)
  const pendingMedicationsDescriptions = medicationDescription(
    await getPendingMedications(trx, prescription_id, medications)
  )

  console.log(pendingMedicationsDescriptions.length)

  const stateData: PharmacistStateData = {
    prescription_code: prescription_code,
    prescription_id: prescription_id,
    medications: medicationDescriptions,
    pendingMedications: pendingMedicationsDescriptions,
    number_of_medications: pendingMedicationsDescriptions.length,
    number_of_dispensed_medications: 0, //The number of medications dispensed in this round
    index_of_medications: 0,
  }

  await conversations.updateChatbotUser(
    trx,
    pharmacistState.chatbot_user,
    {
      data: stateData,
    },
  )

  return medicationDescriptions
}

export async function dispenseType(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
) {
  const unhandled_message = pharmacistState.unhandled_message.trimmed_body!
  const { number_of_medications } = pharmacistState.chatbot_user.data as PharmacistStateData

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

export function currentMedication(
  _trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
): string {
  const { pendingMedications, number_of_medications, index_of_medications } =
    pharmacistState.chatbot_user.data as PharmacistStateData
  console.log(pharmacistState.chatbot_user.data)
  console.log(typeof pendingMedications)
  console.log(pendingMedications[0])
  // ??????????? index_of_medications = NaN
  assert(index_of_medications < number_of_medications)

  const medicationDescription = pendingMedications[index_of_medications]

  // await conversations.updateChatbotUser(
  //   trx,
  //   pharmacistState.chatbot_user,
  //   {
  //     data: {
  //       ...omit(pharmacistState.chatbot_user.data, ['index_of_medications']),
  //       index_of_medications: index_of_medications + 1,
  //     },
  //   },
  // )

  return medicationDescription
}

function isTheLastMedication(
  pharmacistState: PharmacistChatbotUserState,
): boolean {
  const { pendingMedications, index_of_medications } =
    pharmacistState.chatbot_user.data as PharmacistStateData
  return index_of_medications === pendingMedications.length
}

function dispenseNextStep(
  _trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
) {
  return isTheLastMedication(pharmacistState)
    ? 'onboarded:fill_prescription:confirm_done' as const
    : 'onboarded:fill_prescription:dispense_select' as const
}

async function increaseNumberOfDispensedMedications(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
  number: number,
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
        number_of_dispensed_medications: number_of_dispensed_medications + number,
      },
    },
  )
}

export async function dispenseOne(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
) {
  const medications = await getMedications(
    trx,
    pharmacistState,
  )

  const { index_of_medications, number_of_dispensed_medications } =
    pharmacistState.chatbot_user.data as PharmacistStateData
  const filledMedicationData = [{
    patient_prescription_medication_id:
      medications[index_of_medications].patient_prescription_medication_id,
    pharmacist_id: pharmacistState.chatbot_user.entity_id,
  } as {
    patient_prescription_medication_id: string
    pharmacist_id: string
    pharmacy_id?: string
  }]

  const numberOfDispense = 1
  await dispenseMedications(trx, filledMedicationData)

  await conversations.updateChatbotUser(
    trx,
    pharmacistState.chatbot_user,
    {
      data: {
        ...omit(pharmacistState.chatbot_user.data, [
          'number_of_dispensed_medications',
        ]),
        index_of_medications: index_of_medications + numberOfDispense,
        number_of_dispensed_medications: number_of_dispensed_medications + numberOfDispense,
      },
    },
  )

  return dispenseNextStep(trx, pharmacistState)
}

export async function dispenseSkip(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
) {
  const numberOfDispense = 1
  const { index_of_medications, number_of_dispensed_medications } =
    pharmacistState.chatbot_user.data.index_of_medications as PharmacistStateData
  
  await conversations.updateChatbotUser(
    trx,
    pharmacistState.chatbot_user,
    {
      data: {
        ...omit(pharmacistState.chatbot_user.data, [
          'number_of_dispensed_medications',
        ]),
        index_of_medications: index_of_medications + numberOfDispense,
        number_of_dispensed_medications: number_of_dispensed_medications + numberOfDispense,
      },
    },
  )

  return dispenseNextStep(trx, pharmacistState)
}

export async function dispenseAll(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
) {
  const { index_of_medications, number_of_dispensed_medications } =
    pharmacistState.chatbot_user.data.index_of_medications as PharmacistStateData

  const medications = await getMedications(
    trx,
    pharmacistState,
  )
  const filledMedicationData = medications.map((medication) => ({
    patient_prescription_medication_id:
    medication.patient_prescription_medication_id,
    pharmacist_id: pharmacistState.chatbot_user.entity_id,
  } as {
    patient_prescription_medication_id: string
    pharmacist_id: string
    pharmacy_id?: string
  }))
  await dispenseMedications(trx, filledMedicationData)
  await conversations.updateChatbotUser(
    trx,
    pharmacistState.chatbot_user,
    {
      data: {
        ...omit(pharmacistState.chatbot_user.data, [
          'number_of_dispensed_medications',
        ]),
        index_of_medications: index_of_medications + medications.length,
        number_of_dispensed_medications: number_of_dispensed_medications + medications.length,
      },
    },
  )
  return 'onboarded:fill_prescription:confirm_done' as const
}

export async function dispenseRestart(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
) {
  const prescription_id =
    pharmacistState.chatbot_user.data.prescription_id
  assert(typeof prescription_id === 'string')
  const number_of_dispensed_medications = Number(
    pharmacistState.chatbot_user.data.number_of_dispensed_medications,
  )
  const allFilledMedications =
    await getFilledMedicationsByPrescriptionId(trx, prescription_id)
  const filledMedicationsThisRound = allFilledMedications.slice(
    0,
    number_of_dispensed_medications,
  )

  await deleteFilledMedications(trx, filledMedicationsThisRound)
  return await dispenseType(trx, pharmacistState)
}