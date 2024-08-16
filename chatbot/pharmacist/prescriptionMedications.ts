import { dosageDisplay } from '../../shared/medication.ts'
import omit from '../../util/omit.ts'
import { durationBetween } from '../../util/date.ts'
import { getMedicationsByPrescriptionId } from '../../db/models/prescriptions.ts'
import { PharmacistChatbotUserState, TrxOrDb } from '../../types.ts'
import { assert } from 'std/assert/assert.ts'
import * as conversations from '../../db/models/conversations.ts'

export async function medicationDescription(
  trx: TrxOrDb,
  prescription_id: string,
): Promise<string[]> {
  const medications = await getMedicationsByPrescriptionId(trx, prescription_id)
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

export function dispenseType(
  _trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
) {
  const unhandled_message = pharmacistState.unhandled_message.trimmed_body!
  const { number_of_medications } = pharmacistState.chatbot_user.data
  assert(typeof number_of_medications === 'number')

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
  const { medications, index_of_medications } =
    pharmacistState.chatbot_user.data
  assert(
    Array.isArray(medications) &&
      medications.every((item) => typeof item === 'string'),
  )
  assert(typeof index_of_medications === 'number')
  if (index_of_medications == medications.length) {
    throw new Error(
      'Medications array out of bounds',
    )
  }
  const medicationDescription = medications[index_of_medications]

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

function isTheLastMedication(
  pharmacistState: PharmacistChatbotUserState,
) {
  const { medications, index_of_medications } =
    pharmacistState.chatbot_user.data
  assert(
    Array.isArray(medications) &&
      medications.every((item) => typeof item === 'string'),
  )
  assert(typeof index_of_medications === 'number')
  return index_of_medications == medications.length
}

export function dispense_next_stag(
  _trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
) {
  if (isTheLastMedication(pharmacistState)) {
    return 'onboarded:fill_prescription:confirm_done'
  } else {
    return 'onboarded:fill_prescription:dispense_select'
  }
}

export async function getPrescriber(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
) {
  const { prescription_id } = pharmacistState.chatbot_user.data
  assert(typeof prescription_id === 'string')
  const prescriber = await trx
    .selectFrom('prescriptions')
    .innerJoin(
      'patient_encounter_providers',
      'patient_encounter_providers.id',
      'prescriptions.prescriber_id',
    )
    .innerJoin(
      'employment',
      'employment.id',
      'patient_encounter_providers.provider_id',
    )
    .innerJoin(
      'health_workers',
      'health_workers.id',
      'employment.health_worker_id',
    )
    .where('prescriptions.id', '=', prescription_id)
    .select('health_workers.name')
    .executeTakeFirst()

  return prescriber
}
