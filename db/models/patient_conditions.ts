import { sql } from 'kysely'
import { Maybe, PreExistingCondition, TrxOrDb } from '../../types.ts'
import { assertOr400 } from '../../util/assertOr.ts'

export type PreExistingConditionUpsert = {
  key_id: string
  start_date: string
  id?: Maybe<number>
  comorbidities?: {
    key_id: string
    start_date: Maybe<string>
    id?: Maybe<number>
  }[]
  medications?: {
    key_id: string
    dosage: string
    intake_frequency: string
    id?: Maybe<number>
  }[]
}

export async function upsertPreExisting(
  trx: TrxOrDb,
  patient_id: number,
  patientConditions: PreExistingConditionUpsert[],
): Promise<void> {
  const seenConditionKeyIds = new Set<string>()
  const seenMedicationKeyIds = new Set<string>()
  for (const condition of patientConditions) {
    assertOr400(condition.key_id, 'Condition key id must be present')
    assertOr400(condition.start_date, 'Condition start_date must be present')
    assertOr400(
      !seenConditionKeyIds.has(condition.key_id),
      'Condition key id must be unique',
    )
    seenConditionKeyIds.add(condition.key_id)
    for (const comorbidity of condition.comorbidities || []) {
      assertOr400(
        comorbidity.key_id,
        'Comorbidity key id must be present',
      )
      assertOr400(
        !seenConditionKeyIds.has(comorbidity.key_id),
        'Comorbidity key id must be unique',
      )
      seenConditionKeyIds.add(comorbidity.key_id)
    }
    for (const medication of condition.medications || []) {
      assertOr400(
        medication.key_id,
        'Medication key id must be present',
      )
      assertOr400(medication.dosage, 'Medication dosage must be present')
      assertOr400(
        medication.intake_frequency,
        'Medication intake frequency must be present',
      )
      assertOr400(
        !seenMedicationKeyIds.has(medication.key_id),
        'Medication key id must be unique',
      )
      seenMedicationKeyIds.add(medication.key_id)
    }
  }

  const databaseConditions = await getPreExistingConditions(trx, { patient_id })

  const patientConditionsToRemove: number[] = []
  const patientMedicationsToRemove: number[] = []
  for (const dbCondition of databaseConditions) {
    const matchingCondition = patientConditions.find((c) =>
      c.id === dbCondition.id
    )
    if (!matchingCondition) {
      patientConditionsToRemove.push(dbCondition.id)
      patientConditionsToRemove.push(
        ...dbCondition.comorbidities.map((c) => c.id),
      )
      continue
    }
    for (const comorbidity of dbCondition.comorbidities) {
      const matchingComorbidity = matchingCondition.comorbidities?.find((c) =>
        c.id === comorbidity.id
      )
      if (!matchingComorbidity) {
        patientConditionsToRemove.push(comorbidity.id)
      }
    }
    for (const medication of dbCondition.medications) {
      const matchingMedication = matchingCondition.medications?.find((m) =>
        m.id === medication.id
      )
      if (!matchingMedication) {
        patientMedicationsToRemove.push(medication.id)
      }
    }
  }
  if (patientConditionsToRemove.length) {
    await trx
      .deleteFrom('patient_conditions')
      .where('id', 'in', patientConditionsToRemove)
      .execute()
  }
  if (patientMedicationsToRemove.length) {
    await trx
      .deleteFrom('patient_condition_medications')
      .where('id', 'in', patientMedicationsToRemove)
      .execute()
  }

  for (const condition of patientConditions) {
    let condition_id: Maybe<number> = condition.id
    const matchingCondition = databaseConditions.find((c) =>
      c.id === condition.id
    )
    if (condition_id) {
      assertOr400(matchingCondition, 'Referenced a non-existent condition')
      if (
        matchingCondition.key_id !== condition.key_id ||
        matchingCondition.start_date !== condition.start_date
      ) {
        await trx
          .updateTable('patient_conditions')
          .set({
            condition_key_id: condition.key_id,
            start_date: condition.start_date,
          })
          .where('id', '=', condition_id)
          .executeTakeFirstOrThrow()
      }
    } else {
      console.log('for (const comorbidity of condition.comorbidities || []) {')
      for (const comorbidity of condition.comorbidities || []) {
        assertOr400(
          !comorbidity.id,
          'Cannot create a new comorbidity with an id for a parent condition without one',
        )
      }
      for (const medication of condition.medications || []) {
        assertOr400(
          !medication.id,
          'Cannot create a new medication with an id for a parent condition without one',
        )
      }
      console.log('const parentCondition = await trx', {
        patient_id,
        condition_key_id: condition.key_id,
        start_date: condition.start_date,
        comorbidity_of_condition_id: null,
      })
      const parentCondition = await trx
        .insertInto('patient_conditions')
        .values({
          patient_id,
          condition_key_id: condition.key_id,
          start_date: condition.start_date,
          comorbidity_of_condition_id: null,
        })
        .returning('id')
        .executeTakeFirstOrThrow()
      condition_id = parentCondition.id
    }
    for (const comorbidity of condition.comorbidities || []) {
      const matchingComorbidity = matchingCondition?.comorbidities.find((c) =>
        c.id === comorbidity.id
      )
      if (comorbidity.id) {
        assertOr400(matchingComorbidity, 'Referenced a non-existent condition')
        if (
          matchingComorbidity.key_id !==
            comorbidity.key_id ||
          matchingComorbidity.start_date !== comorbidity.start_date
        ) {
          console.log('await trx')
          await trx
            .updateTable('patient_conditions')
            .set({
              condition_key_id: comorbidity.key_id,
              start_date: comorbidity.start_date || condition.start_date,
            })
            .where('id', '=', comorbidity.id)
            .executeTakeFirstOrThrow()
        }
      } else {
        console.log('await trx')
        await trx
          .insertInto('patient_conditions')
          .values({
            patient_id,
            condition_key_id: comorbidity.key_id,
            start_date: comorbidity.start_date || condition.start_date,
            comorbidity_of_condition_id: condition_id,
          })
          .executeTakeFirstOrThrow()
      }
    }
    for (const medication of condition.medications || []) {
      const matchingMedication = matchingCondition?.medications.find((c) =>
        c.id === medication.id
      )
      if (medication.id) {
        assertOr400(matchingMedication, 'Referenced a non-existent medication')
        if (
          matchingMedication.key_id !==
            medication.key_id ||
          matchingMedication.dosage !== medication.dosage ||
          matchingMedication.intake_frequency !== medication.intake_frequency
        ) {
          await trx
            .updateTable('patient_condition_medications')
            .set({
              medication_key_id: medication.key_id,
              dosage: medication.dosage,
              intake_frequency: medication.intake_frequency,
            })
            .where('id', '=', medication.id)
            .executeTakeFirstOrThrow()
        }
      } else {
        await trx
          .insertInto('patient_condition_medications')
          .values({
            patient_id,
            condition_id,
            medication_key_id: medication.key_id,
            dosage: medication.dosage,
            intake_frequency: medication.intake_frequency,
          })
          .executeTakeFirstOrThrow()
      }
    }
  }
}

// Note: Pre-existing conditions are just conditions that have not ended yet
export async function getPreExistingConditions(
  trx: TrxOrDb,
  opts: {
    patient_id: number
  },
): Promise<PreExistingCondition[]> {
  const gettingPatientConditions = await trx
    .selectFrom('patient_conditions')
    .innerJoin(
      'conditions',
      'conditions.key_id',
      'patient_conditions.condition_key_id',
    )
    .where('patient_conditions.patient_id', '=', opts.patient_id)
    .where('patient_conditions.end_date', 'is', null)
    .select([
      'patient_conditions.id',
      'patient_conditions.condition_key_id as key_id',
      sql<string>`TO_CHAR(patient_conditions.start_date, 'YYYY-MM-DD')`.as(
        'start_date',
      ),
      'patient_conditions.comorbidity_of_condition_id',
      'conditions.primary_name',
    ])
    .execute()

  const gettingPatientMedications = await trx
    .selectFrom('patient_condition_medications')
    .innerJoin(
      'medications',
      'medications.key_id',
      'patient_condition_medications.medication_key_id',
    )
    .where('patient_condition_medications.patient_id', '=', opts.patient_id)
    .select([
      'patient_condition_medications.id',
      'patient_condition_medications.medication_key_id as key_id',
      'patient_condition_medications.condition_id',
      'patient_condition_medications.dosage',
      'patient_condition_medications.intake_frequency',
      'medications.generic_name',
      'medications.strength',
    ])
    .execute()

  const patientConditions = await gettingPatientConditions
  const patientMedications = await gettingPatientMedications

  return patientConditions
    .filter((condition) => !condition.comorbidity_of_condition_id)
    .map((parentCondition) => ({
      ...parentCondition,
      comorbidities: patientConditions
        .filter((comorbidity) =>
          comorbidity.comorbidity_of_condition_id === parentCondition.id
        ),
      medications: patientMedications
        .filter((m) => m.condition_id === parentCondition.id),
    }))
}
