import * as prescriptions from '../../db/models/prescriptions.ts'
import * as prescription_medications from '../../db/models/prescription_medications.ts'
import {
  PharmacistChatbotUserState,
  PrescriptionMedication,
  TrxOrDb,
} from '../../types.ts'
import { assert } from 'std/assert/assert.ts'
import * as conversations from '../../db/models/conversations.ts'
import omit from '../../util/omit.ts'
import { scheduleDisplay, strengthDisplay } from '../../shared/medication.ts'

export type PharmacistStateData = {
  prescription_id: string
  prescription_code: string
  prescription_medication_id?: string
  skipped_prescription_medication_ids?: string[]
}

export function activePresciptionMedicationId(
  pharmacistState: PharmacistChatbotUserState,
) {
  const { prescription_medication_id } = pharmacistState
    .chatbot_user.data as PharmacistStateData
  assert(
    prescription_medication_id,
    'Prescription medication ID is required at this stage of the chatbot',
  )
  return prescription_medication_id
}

export function activePresciptionMedication(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
) {
  return prescription_medications.getById(
    trx,
    activePresciptionMedicationId(pharmacistState),
  )
}

export async function handleDispense(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
) {
  const { prescription_id } = pharmacistState.chatbot_user
    .data as PharmacistStateData

  const unfilled_medications = await prescription_medications
    .getByPrescriptionId(
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
        prescription_medication_id:
          unfilled_medications[0].prescription_medication_id,
      },
    },
  )

  return 'onboarded:fill_prescription:ask_dispense_one' as const
}

export function dispenseType(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
) {
  const unhandled_message = pharmacistState.unhandled_message.trimmed_body!

  if (unhandled_message === 'ask_prescriber') {
    return 'onboarded:fill_prescription:ask_prescriber' as const
  }
  if (
    unhandled_message !== 'dispense' &&
    unhandled_message !== 'restart_dispense'
  ) {
    return 'initial_message' as const
  }

  return handleDispense(trx, pharmacistState)
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

async function dispenseNextStep(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
) {
  const { prescription_id, skipped_prescription_medication_ids = [] } =
    pharmacistState.chatbot_user.data as PharmacistStateData

  const unfilled_medications = await prescription_medications
    .getByPrescriptionId(
      trx,
      prescription_id,
      {
        unfilled: true,
      },
    )

  const ask_about = unfilled_medications.find(
    (m) =>
      !skipped_prescription_medication_ids.includes(
        m.prescription_medication_id,
      ),
  )

  if (!ask_about) {
    return 'onboarded:fill_prescription:confirm_done' as const
  }

  await conversations.updateChatbotUser(
    trx,
    pharmacistState.chatbot_user,
    {
      data: {
        ...pharmacistState.chatbot_user.data,
        prescription_medication_id: ask_about.prescription_medication_id,
      },
    },
  )

  return 'onboarded:fill_prescription:ask_dispense_one' as const
}

export async function dispenseSkip(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
) {
  const skipped_prescription_medication_ids =
    (pharmacistState.chatbot_user.data as PharmacistStateData)
      .skipped_prescription_medication_ids || []

  await conversations.updateChatbotUser(
    trx,
    pharmacistState.chatbot_user,
    {
      data: {
        ...pharmacistState.chatbot_user.data,
        skipped_prescription_medication_ids: [
          ...skipped_prescription_medication_ids,
          activePresciptionMedicationId(pharmacistState),
        ],
      },
    },
  )

  return dispenseNextStep(trx, pharmacistState)
}

export async function dispenseOne(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
) {
  const prescription_medication_id = activePresciptionMedicationId(
    pharmacistState,
  )

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

  await conversations.updateChatbotUser(
    trx,
    pharmacistState.chatbot_user,
    {
      data: omit(pharmacistState.chatbot_user.data, [
        'prescription_id',
        'prescription_code',
        'prescription_medication_id',
        'skipped_prescription_medication_ids',
      ]),
    },
  )

  return 'initial_message' as const
}

export function medicationDisplay(
  medication: PrescriptionMedication,
) {
  // Format the main medication description
  const strength = strengthDisplay(medication)
  const medicationDescription =
    `${medication.drug_generic_name} ${medication.form} (${strength})`

  // Format each schedule
  const scheduleDescriptions = medication.schedules.map((schedule) => {
    return `- ${scheduleDisplay(schedule, medication)}`
  })

  // Combine everything into the final output
  return `${medicationDescription}\n${scheduleDescriptions.join('\n')}`
}
