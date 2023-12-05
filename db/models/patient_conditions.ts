import {
  PreExistingConditions,
  TrxOrDb,
  PatientCondition,
  PatientMedication,
} from '../../types.ts'

export async function upsert(
  trx: TrxOrDb,
  _patient_id: number,
  patientconditions: PreExistingConditions
) {
  const removedConditions = patientconditions.conditions
    .filter((c) => c.removed)
    .map((c) => c.id as number)

  if (removedConditions?.length > 0) {
    await trx
      .deleteFrom('patient_conditions')
      .where('id', 'in', removedConditions!)
      .execute()
  }

  const conditions = patientconditions.conditions.filter((c) => !c.removed)
  const databaseConditions = await getPatientConditions(trx, {
    _patient_id: _patient_id,
  })

  conditions.forEach(async (condition) => {
    if (condition.id) {
      //update existing condition
      const dbCondition = databaseConditions.conditions.filter(
        (c) => c.id === condition.id
      )[0]

      if (
        dbCondition.condition_id !== condition.condition_id ||
        dbCondition.start_date !== condition.start_date ||
        dbCondition.end_date !== condition.end_date
      ) {
        trx.updateTable('patient_conditions')
          .set({
            condition_key_id: condition.condition_id,
            start_date: condition.start_date!,
            end_date: condition.end_date,
          })
          .where('id', '=', condition.id)
          .executeTakeFirstOrThrow()
      }




    } else {
      //Add new condition
      const result = await trx
        .insertInto('patient_conditions')
        .values({
          patient_id: _patient_id,
          condition_key_id: condition.condition_id,
          start_date: condition.start_date,
          end_date: condition.end_date,
          comorbidity_of_condition_id: null,
        } as PatientCondition)
        .returningAll()
        .executeTakeFirst()

      if (condition?.comorbidities?.length > 0) {
        const comorbidities = condition.comorbidities.map(
          (c) =>
            ({
              patient_id: _patient_id,
              condition_key_id: c.condition_id,
              comorbidity_of_condition_id: result!.id,
            } as PatientCondition)
        )
        trx.insertInto('patient_conditions').values(comorbidities).execute()
      }

      if (condition?.medications?.length > 0) {
        const medications = condition.medications.map(
          (c) =>
            ({
              patient_id: _patient_id,
              dosage: c.dose,
              intake_frequency: c.intake_frequency,
              patient_condition_id: result!.id,
              medication_key_id: c.medication_id,
            } as PatientMedication)
        )
        trx.insertInto('patient_medications').values(medications).execute()
      }
    }
  })
}

export async function getPatientConditions(
  trx: TrxOrDb,
  opts: {
    _patient_id: number
  }
): Promise<PreExistingConditions> {
  const _patientConditions = await trx
    .selectFrom('patient_conditions')
    .innerJoin(
      'conditions',
      'conditions.key_id',
      'patient_conditions.condition_key_id'
    )
    .where('patient_conditions.patient_id', '=', opts._patient_id)
    .select([
      'patient_conditions.id',
      'patient_conditions.condition_key_id',
      'patient_conditions.start_date',
      'patient_conditions.end_date',
      'patient_conditions.comorbidity_of_condition_id',
      'conditions.primary_name',
    ])
    .execute()

  const _patientMedications = await trx
    .selectFrom('patient_medications')
    .innerJoin(
      'medications',
      'medications.key_id',
      'patient_medications.medication_key_id'
    )
    .where('patient_medications.patient_id', '=', opts._patient_id)
    .select([
      'patient_medications.id',
      'patient_medications.medication_key_id',
      'patient_medications.patient_condition_id',
      'patient_medications.dosage',
      'patient_medications.intake_frequency',
      'medications.generic_name',
    ])
    .execute()

  const conditions = _patientConditions
    .filter((c) => !c.comorbidity_of_condition_id)
    .map((c) => ({
      display_name: c.primary_name,
      id: c.id,
      start_date: c.start_date,
      end_date: c.end_date,
      condition_id: c.condition_key_id,
      removed: false,
      comorbidities: _patientConditions
        .filter((cor) => cor.comorbidity_of_condition_id === c.id)
        .map((cor) => ({
          id: cor.id,
          display_name: cor.primary_name,
          condition_id: cor.condition_key_id,
          comorbidity_id: c.id,
          removed: false,
        })),
      medications: _patientMedications
        .filter((m) => m.patient_condition_id === c.id)
        .map((m) => ({
          id: m.id,
          display_name: m.generic_name,
          dose: m.dosage,
          intake_frequency: m.intake_frequency,
          medication_id: m.medication_key_id,
          removed: false,
        })),
    }))
  return { conditions: conditions } as PreExistingConditions
}
