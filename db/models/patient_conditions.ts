import { sql } from 'kysely'
import {
  Maybe,
  MedicationSchedule,
  PastMedicalCondition,
  PreExistingCondition,
  PreExistingConditionWithDrugs,
  TrxOrDb,
} from '../../types.ts'
import { assertOr400 } from '../../util/assertOr.ts'
import * as drugs from './drugs.ts'
import uniq from '../../util/uniq.ts'
import { assert } from 'std/assert/assert.ts'
import {
  differenceInDays,
  durationEndDate,
  isISODateString,
} from '../../util/date.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import omit from '../../util/omit.ts'

type PatientMedicationUpsert = {
  id?: Maybe<number>
  dosage: number
  strength: number
  intake_frequency: string
  route: string
  start_date?: Maybe<string>
  end_date?: Maybe<string>
  medication_id: null | number
  manufactured_medication_id: null | number
  special_instructions?: Maybe<string>
}

export type PreExistingConditionUpsert = {
  key_id: string
  start_date: string
  id?: Maybe<number>
  comorbidities?: {
    id?: Maybe<number>
    key_id: string
    start_date?: Maybe<string>
  }[]
  medications?: PatientMedicationUpsert[]
}

export type PastMedicalConditionUpsert = {
  key_id: string
  start_date: string
  end_date: string
  id?: Maybe<number>
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

function assertPreExistingConditions(
  patient_conditions: PreExistingConditionUpsert[],
) {
  const seenConditionKeyIds = new Set<string>()
  const seenMedicationIds = new Set<number>()
  for (const condition of patient_conditions) {
    assertOr400(condition.key_id, 'Condition key id must be present')
    assertOr400(
      isISODateString(condition.start_date),
      'Condition start_date must be present',
    )
    assertOr400(
      !seenConditionKeyIds.has(condition.key_id),
      'Condition key_id must be unique',
    )
    seenConditionKeyIds.add(condition.key_id)
    for (const comorbidity of condition.comorbidities || []) {
      assertOr400(comorbidity.key_id, 'Comorbidity key_id must be present')
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
          Object.keys(
            IntakeFrequencies,
          ).join(', ')
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
}

async function removeEntitiesNoLongerPresent(
  trx: TrxOrDb,
  patient_conditions: PreExistingConditionUpsert[],
  database_conditions: PreExistingCondition[],
) {
  const conditions_to_remove: number[] = []
  const patientMedicationsToRemove: number[] = []
  for (const dbCondition of database_conditions) {
    const matching_condition = patient_conditions.find(
      (c) => c.id === dbCondition.id,
    )
    if (!matching_condition) {
      conditions_to_remove.push(dbCondition.id)
      conditions_to_remove.push(
        ...dbCondition.comorbidities.map((c) => c.id),
      )
      continue
    }
    for (const comorbidity of dbCondition.comorbidities) {
      const matchingComorbidity = matching_condition.comorbidities?.find(
        (c) => c.id === comorbidity.id,
      )
      if (!matchingComorbidity) {
        conditions_to_remove.push(comorbidity.id)
      }
    }
    for (const medication of dbCondition.medications) {
      const matchingMedication = matching_condition.medications?.find(
        (m) => m.id === medication.id,
      )
      if (!matchingMedication) {
        patientMedicationsToRemove.push(medication.id)
      }
    }
  }
  const removingConditions = conditions_to_remove.length &&
    trx
      .deleteFrom('patient_conditions')
      .where('id', 'in', conditions_to_remove)
      .execute()

  const removingMedications = patientMedicationsToRemove.length &&
    trx
      .deleteFrom('patient_condition_medications')
      .where('id', 'in', patientMedicationsToRemove)
      .execute()

  await Promise.all([removingConditions, removingMedications])
}

async function upsertPreExistingCondition(
  trx: TrxOrDb,
  patient_id: number,
  database_conditions: PreExistingCondition[],
  condition: PreExistingConditionUpsert,
) {
  let patient_condition_id: Maybe<number> = condition.id
  const matching_condition = database_conditions.find(
    (c) => c.id === condition.id,
  )
  if (patient_condition_id) {
    assertOr400(matching_condition, 'Referenced a non-existent condition')
    if (
      matching_condition.key_id !== condition.key_id ||
      matching_condition.start_date !== condition.start_date
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
    const values = {
      patient_id,
      condition_key_id: comorbidity.key_id,
      start_date: comorbidity.start_date || condition.start_date,
      comorbidity_of_condition_id: patient_condition_id,
    }
    if (comorbidity.id) {
      const matchingComorbidity = matching_condition?.comorbidities.find(
        (c) => c.id === comorbidity.id,
      )
      assert(matchingComorbidity, 'Referenced a non-existent comorbidity')
      await trx
        .updateTable('patient_conditions')
        .set(values)
        .where('id', '=', comorbidity.id)
        .executeTakeFirstOrThrow()
    } else {
      await trx
        .insertInto('patient_conditions')
        .values(values)
        .executeTakeFirstOrThrow()
    }
  }
  for (const medication of condition.medications || []) {
    const start_date = medication.start_date || condition.start_date

    const { duration, duration_unit } = medication.end_date
      ? {
        duration: differenceInDays(medication.end_date, start_date),
        duration_unit: 'days',
      }
      : { duration: 1, duration_unit: 'indefinitely' }

    const values = {
      patient_condition_id,
      medication_id:
        (!medication.manufactured_medication_id && medication.medication_id) ||
        null, // omit medication_id if manufactured_medication_id is present
      manufactured_medication_id: medication.manufactured_medication_id || null,
      strength: medication.strength,
      route: medication.route,
      schedules: sql<string[]>`
        ARRAY[
          ROW(${medication.dosage}, ${medication.intake_frequency}, ${duration}, ${duration_unit})
        ]::medication_schedule[]
      `,
      start_date,
      special_instructions: medication.special_instructions || null,
    }
    if (medication.id) {
      const matchingMedication = matching_condition?.medications.find(
        (m) => m.id === medication.id,
      )
      assertOr400(matchingMedication, 'Referenced a non-existent medication')
      await trx
        .updateTable('patient_condition_medications')
        .set(values)
        .where('id', '=', medication.id)
        .executeTakeFirstOrThrow()
    } else {
      await trx
        .insertInto('patient_condition_medications')
        .values(values)
        .executeTakeFirstOrThrow()
    }
  }
}

export async function upsertPreExisting(
  trx: TrxOrDb,
  patient_id: number,
  patient_conditions: PreExistingConditionUpsert[],
): Promise<void> {
  assertPreExistingConditions(patient_conditions)
  const database_conditions = await getPreExistingConditions(trx, {
    patient_id,
  })
  const removingEntitiesNoLongerPresent = removeEntitiesNoLongerPresent(
    trx,
    patient_conditions,
    database_conditions,
  )
  await Promise.all(
    patient_conditions.map((condition) =>
      upsertPreExistingCondition(
        trx,
        patient_id,
        database_conditions,
        condition,
      )
    ),
  )
  await removingEntitiesNoLongerPresent
}

// Note: Pre-existing conditions are just conditions that have not ended yet
export async function getPreExistingConditions(
  trx: TrxOrDb,
  opts: {
    patient_id: number
  },
): Promise<PreExistingCondition[]> {
  const gettingpatient_conditions = await trx
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
    .innerJoin('medications', (join) =>
      join.on(
        'medications.id',
        '=',
        sql`coalesce(patient_condition_medications.medication_id, manufactured_medications.medication_id)`,
      ))
    .innerJoin('drugs', 'drugs.id', 'medications.drug_id')
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
      'patient_condition_medications.route',
      'patient_condition_medications.special_instructions',
      sql<
        MedicationSchedule[]
      >`TO_JSON(patient_condition_medications.schedules)`.as('schedules'),
      'drugs.generic_name',
      sql<
        string
      >`TO_CHAR(patient_condition_medications.start_date, 'YYYY-MM-DD')`.as(
        'start_date',
      ),
    ])
    .execute()

  const patient_conditions = await gettingpatient_conditions
  const patientMedications = await gettingPatientMedications

  return patient_conditions
    .filter((condition) => !condition.comorbidity_of_condition_id)
    .map((parentCondition) => ({
      id: parentCondition.id,
      key_id: parentCondition.key_id,
      start_date: parentCondition.start_date,
      primary_name: parentCondition.primary_name,
      comorbidities: patient_conditions
        .filter(
          (comorbidity) =>
            comorbidity.comorbidity_of_condition_id === parentCondition.id,
        )
        .map((comorbidity) => ({
          id: comorbidity.id,
          key_id: comorbidity.key_id,
          start_date: comorbidity.start_date,
          primary_name: comorbidity.primary_name,
        })),
      medications: patientMedications
        .filter((m) => m.patient_condition_id === parentCondition.id)
        .map(({ schedules, ...medication }) => {
          assertEquals(schedules.length, 1)
          const [schedule] = schedules
          return {
            ...omit(medication, ['patient_condition_id']),
            intake_frequency: schedule.frequency,
            end_date: durationEndDate(medication.start_date, schedule),
            // TODO remove the Number casts
            // https://github.com/kysely-org/kysely/issues/802
            dosage: Number(schedule.dosage),
            strength: Number(medication.strength),
          }
        }),
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

export function getPastMedicalConditions(
  trx: TrxOrDb,
  opts: {
    patient_id: number
  },
): Promise<PastMedicalCondition[]> {
  return trx
    .selectFrom('patient_conditions')
    .innerJoin(
      'conditions',
      'conditions.key_id',
      'patient_conditions.condition_key_id',
    )
    .where('patient_conditions.patient_id', '=', opts.patient_id)
    .where('patient_conditions.end_date', 'is not', null)
    .select([
      'patient_conditions.id as id',
      'patient_conditions.condition_key_id as key_id',
      sql<string>`TO_CHAR(patient_conditions.start_date, 'YYYY-MM-DD')`.as(
        'start_date',
      ),
      sql<string>`TO_CHAR(patient_conditions.end_date, 'YYYY-MM-DD')`.as(
        'end_date',
      ),
      'conditions.primary_name as primary_name',
    ])
    .execute()
}

export async function upsertPastMedical(
  trx: TrxOrDb,
  patient_id: number,
  patient_conditions: PastMedicalConditionUpsert[],
): Promise<void> {
  assertPreExistingConditions(patient_conditions)
  for (const condition of patient_conditions) {
    assertOr400(
      isISODateString(condition.end_date),
      'Condition end_date must be an ISO Date',
    )
  }
  const database_conditions = await getPastMedicalConditions(trx, {
    patient_id,
  })
  const removingEntitiesNoLongerPresent = removePastConditionNoLongerPresent(
    trx,
    patient_conditions,
    database_conditions,
  )
  await Promise.all(
    patient_conditions.map((condition) =>
      upsertPastMedicalCondition(
        trx,
        patient_id,
        database_conditions,
        condition,
      )
    ),
  )
  await removingEntitiesNoLongerPresent
}

function removePastConditionNoLongerPresent(
  trx: TrxOrDb,
  patient_conditions: PastMedicalConditionUpsert[],
  database_conditions: PastMedicalCondition[],
): Promise<unknown> {
  const conditions_to_remove: number[] = []
  for (const dbCondition of database_conditions) {
    const matching_condition = patient_conditions.find(
      (c) => c.id === dbCondition.id,
    )
    if (!matching_condition) {
      conditions_to_remove.push(dbCondition.id)
      continue
    }
  }
  return conditions_to_remove.length
    ? trx
      .deleteFrom('patient_conditions')
      .where('id', 'in', conditions_to_remove)
      .execute()
    : Promise.resolve()
}

async function upsertPastMedicalCondition(
  trx: TrxOrDb,
  patient_id: number,
  database_conditions: PastMedicalCondition[],
  condition: PastMedicalConditionUpsert,
) {
  const patient_condition_id: Maybe<number> = condition.id
  const matching_condition = database_conditions.find(
    (c) => c.id === condition.id,
  )
  if (patient_condition_id) {
    assertOr400(matching_condition, 'Referenced a non-existent condition')
    if (
      matching_condition.key_id !== condition.key_id ||
      matching_condition.start_date !== condition.start_date ||
      matching_condition.end_date !== condition.end_date
    ) {
      await trx
        .updateTable('patient_conditions')
        .set({
          condition_key_id: condition.key_id,
          start_date: condition.start_date,
          end_date: condition.end_date,
        })
        .where('id', '=', patient_condition_id)
        .where('patient_id', '=', patient_id)
        .executeTakeFirstOrThrow()
    }
  } else {
    await trx
      .insertInto('patient_conditions')
      .values({
        patient_id,
        condition_key_id: condition.key_id,
        start_date: condition.start_date,
        end_date: condition.end_date,
      })
      .returning('id')
      .executeTakeFirstOrThrow()
  }
}
