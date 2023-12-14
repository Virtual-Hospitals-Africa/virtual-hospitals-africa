import { sql } from 'kysely'
import {
  Maybe,
  PreExistingCondition,
  PreExistingConditionWithDrugs,
  TrxOrDb,
} from '../../types.ts'
import { assertOr400 } from '../../util/assertOr.ts'
import * as drugs from './drugs.ts'
import uniq from '../../util/uniq.ts'
import { assert } from 'std/assert/assert.ts'

type PatientMedicationUpsert =
  & {
    id?: Maybe<number>
    dosage: number
    strength: number
    intake_frequency: string
    start_date?: Maybe<string>
    end_date?: Maybe<string>
  }
  & (
    | { medication_id: number; manufactured_medication_id: null }
    | { medication_id: null; manufactured_medication_id: number }
  )

export type PreExistingConditionUpsert = {
  key_id: string
  start_date: string
  id?: Maybe<number>
  comorbidities?: {
    id?: Maybe<number>
    key_id: string
    start_date: Maybe<string>
  }[]
  medications?: PatientMedicationUpsert[]
}

export const Dosages: [string, number][] = [
  ['¼', 0.25],
  ['½', 0.5],
  ['1', 1],
  ['2', 2],
  ['3', 3],
  ['4', 4],
  ['5', 5],
  ['6', 6],
  ['7', 7],
  ['8', 8],
  ['9', 9],
  ['10', 10],
]

export const IntakeFrequencies = {
  ac: 'before meals',
  am: 'morning',
  bd: '2 times daily',
  nocte: 'every night',
  od: 'once a day',
  pm: 'afternoon or evening',
  q15: 'every 15 minutes',
  q30: 'every 30 minutes',
  q1h: 'every hour',
  q2h: 'every 2 hours',
  q4h: 'every 4 hours',
  q6h: 'every 6 hours',
  q8h: 'every 8 hours',
  qd: 'every day',
  qid: '4 times a day',
  qod: 'alternate days',
  qs: 'sufficient enough quantity',
  mane: 'morning',
  qmane: 'every morning',
  qn: 'every night',
  stat: 'immediately, now',
  tds: '3 times a day',
  q24h: 'every 24 hours',
  q30h: 'every 30 hours',
  q48h: 'every 48 hours',
  q72h: 'every 72 hours',
  hs: 'at bedtime  ',
  qhs: 'daily at bedtime',
  qw: 'once a week',
  bw: 'twice a week',
  tw: 'three times a week',
  qm: 'once a month',
  bm: 'twice a month',
  tm: 'three times a month',
  prn: 'when necessary',
}

export async function upsertPreExisting(
  trx: TrxOrDb,
  patient_id: number,
  patientConditions: PreExistingConditionUpsert[],
): Promise<void> {
  const seenConditionKeyIds = new Set<string>()
  const seenMedicationIds = new Set<number>()
  for (const condition of patientConditions) {
    assertOr400(condition.key_id, 'Condition key id must be present')
    assertOr400(condition.start_date, 'Condition start_date must be present')
    assertOr400(
      !seenConditionKeyIds.has(condition.key_id),
      'Condition key_id must be unique',
    )
    seenConditionKeyIds.add(condition.key_id)
    for (const comorbidity of condition.comorbidities || []) {
      assertOr400(
        comorbidity.key_id,
        'Comorbidity key_id must be present',
      )
      assertOr400(
        !seenConditionKeyIds.has(comorbidity.key_id),
        'Comorbidity key_id must be unique',
      )
      seenConditionKeyIds.add(comorbidity.key_id)
    }
    for (const medication of condition.medications || []) {
      assertOr400(
        medication.medication_id || medication.manufactured_medication_id,
        'Medication medication_id or manufactured_medication_id must be present',
      )
      assertOr400(medication.dosage, 'Medication dosage must be present')
      assertOr400(
        medication.intake_frequency,
        'Medication intake frequency must be present',
      )
      assertOr400(
        medication.intake_frequency in IntakeFrequencies,
        `Medication intake frequency must be one of ${
          Object.keys(IntakeFrequencies).join(', ')
        }`,
      )
      if (medication.medication_id) {
        assertOr400(
          !seenMedicationIds.has(medication.medication_id),
          'Medication medication_id must be unique as medications are related to one condition at a time',
        )
        seenMedicationIds.add(medication.medication_id)
      }
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
    let patient_condition_id: Maybe<number> = condition.id
    const matchingCondition = databaseConditions.find((c) =>
      c.id === condition.id
    )
    if (patient_condition_id) {
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
          .where('id', '=', patient_condition_id)
          .executeTakeFirstOrThrow()
      }
    } else {
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
      patient_condition_id = parentCondition.id
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
        await trx
          .insertInto('patient_conditions')
          .values({
            patient_id,
            condition_key_id: comorbidity.key_id,
            start_date: comorbidity.start_date || condition.start_date,
            comorbidity_of_condition_id: patient_condition_id,
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
        await trx
          .updateTable('patient_condition_medications')
          .set({
            medication_id: (medication.manufactured_medication_id
              ? null
              : medication.medication_id) || null,
            manufactured_medication_id: medication.manufactured_medication_id ||
              null,
            dosage: medication.dosage,
            intake_frequency: medication.intake_frequency,
            start_date: medication.start_date || condition.start_date,
            end_date: medication.end_date,
          })
          .where('id', '=', medication.id)
          .executeTakeFirstOrThrow()
      } else {
        await trx
          .insertInto('patient_condition_medications')
          .values({
            patient_condition_id,
            medication_id: (medication.manufactured_medication_id
              ? null
              : medication.medication_id) || null,
            manufactured_medication_id: medication.manufactured_medication_id ||
              null,
            dosage: medication.dosage,
            strength: medication.strength,
            intake_frequency: medication.intake_frequency,
            start_date: medication.start_date || condition.start_date,
            end_date: medication.end_date,
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
    .leftJoin(
      'manufactured_medications',
      'manufactured_medications.id',
      'patient_condition_medications.manufactured_medication_id',
    )
    .innerJoin(
      'medications',
      (join) =>
        join.on(
          'medications.id',
          '=',
          sql`coalesce(patient_condition_medications.medication_id, manufactured_medications.medication_id)`,
        ),
    )
    .innerJoin(
      'drugs',
      'drugs.id',
      'medications.drug_id',
    )
    .innerJoin(
      'patient_conditions',
      'patient_conditions.id',
      'patient_condition_medications.patient_condition_id',
    )
    .where('patient_conditions.patient_id', '=', opts.patient_id)
    .select([
      'patient_condition_medications.id',
      'medications.drug_id',
      'medications.id as medication_id',
      'patient_condition_medications.manufactured_medication_id',
      'patient_condition_medications.patient_condition_id',
      'patient_condition_medications.strength',
      'patient_condition_medications.dosage',
      'patient_condition_medications.intake_frequency',
      'drugs.generic_name',
      sql<
        string
      >`TO_CHAR(patient_condition_medications.start_date, 'YYYY-MM-DD')`.as(
        'start_date',
      ),
      sql<
        string | null
      >`TO_CHAR(patient_condition_medications.end_date, 'YYYY-MM-DD')`.as(
        'end_date',
      ),
    ])
    .execute()

  const patientConditions = await gettingPatientConditions
  const patientMedications = await gettingPatientMedications

  return patientConditions
    .filter((condition) => !condition.comorbidity_of_condition_id)
    .map((parentCondition) => ({
      id: parentCondition.id,
      key_id: parentCondition.key_id,
      start_date: parentCondition.start_date,
      primary_name: parentCondition.primary_name,
      comorbidities: patientConditions
        .filter((comorbidity) =>
          comorbidity.comorbidity_of_condition_id === parentCondition.id
        ).map((comorbidity) => ({
          id: comorbidity.id,
          key_id: comorbidity.key_id,
          start_date: comorbidity.start_date,
          primary_name: comorbidity.primary_name,
        })),
      medications: patientMedications
        .filter((m) => m.patient_condition_id === parentCondition.id)
        .map((m) => ({
          id: m.id,
          medication_id: m.medication_id,
          manufactured_medication_id: m.manufactured_medication_id,
          drug_id: m.drug_id,
          // TODO remove the Number cast
          // https://github.com/kysely-org/kysely/issues/802
          dosage: Number(m.dosage),
          intake_frequency: m.intake_frequency,
          generic_name: m.generic_name,
          // TODO remove the Number cast
          // https://github.com/kysely-org/kysely/issues/802
          strength: Number(m.strength),
          start_date: m.start_date,
          end_date: m.end_date,
        })),
    }))
}

export async function getPreExistingConditionsWithDrugs(
  trx: TrxOrDb,
  opts: { patient_id: number },
): Promise<PreExistingConditionWithDrugs[]> {
  const preExistingConditions = await getPreExistingConditions(trx, opts)
  const drug_ids = uniq(
    preExistingConditions.flatMap((c) =>
      c.medications.map((medication) => medication.drug_id)
    ),
  )
  const matchingDrugs = drug_ids.length
    ? await drugs.search(trx, { ids: drug_ids })
    : []

  return preExistingConditions.map((c) => ({
    ...c,
    medications: c.medications.map((m) => {
      const drug = matchingDrugs.find((d) => d.drug_id === m.drug_id)
      assert(drug, `Could not find drug with id ${m.drug_id}`)
      return { ...m, drug }
    }),
  }))
}
