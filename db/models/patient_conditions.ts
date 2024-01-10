import { sql } from 'kysely'
import {
  Maybe,
  MedicalConditionBase,
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
  id: string
  start_date: string
  comorbidities?: {
    id: string
    start_date?: Maybe<string>
  }[]
  medications?: PatientMedicationUpsert[]
}

export type PastMedicalConditionUpsert = {
  id: string
  start_date: string
  end_date: string
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
  const seen_condition_ids = new Set<string>()
  const seen_medication_ids = new Set<number>()
  for (const condition of patient_conditions) {
    assertOr400(condition.id, 'Condition id must be present')
    assertOr400(
      isISODateString(condition.start_date),
      'Condition start_date must be present',
    )
    assertOr400(
      !seen_condition_ids.has(condition.id),
      'Condition id must be unique',
    )
    seen_condition_ids.add(condition.id)
    for (const comorbidity of condition.comorbidities || []) {
      assertOr400(comorbidity.id, 'Comorbidity id must be present')
      assertOr400(
        !seen_condition_ids.has(comorbidity.id),
        'Comorbidity id must be unique',
      )
      seen_condition_ids.add(comorbidity.id)
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
          !seen_medication_ids.has(medication.medication_id),
          'Medication medication_id must be unique as medications are related to one condition at a time',
        )
        seen_medication_ids.add(medication.medication_id)
      }
    }
  }
}

async function removeEntitiesNoLongerPresent(
  trx: TrxOrDb,
  patient_conditions: PreExistingConditionUpsert[],
  database_conditions: Array<
    MedicalConditionBase & Partial<PreExistingCondition>
  >,
) {
  const conditions_to_remove: number[] = []
  const patient_medications_to_remove: number[] = []
  for (const db_condition of database_conditions) {
    const matching_condition = patient_conditions.find(
      (c) => c.id === db_condition.id,
    )
    if (!matching_condition) {
      conditions_to_remove.push(db_condition.patient_condition_id)
      conditions_to_remove.push(
        ...(db_condition.comorbidities || []).map((c) =>
          c.patient_condition_id
        ),
      )
      continue
    }
    for (const comorbidity of (db_condition.comorbidities || [])) {
      const matching_comorbidity = matching_condition.comorbidities?.find(
        (c) => c.id === comorbidity.id,
      )
      if (!matching_comorbidity) {
        conditions_to_remove.push(comorbidity.patient_condition_id)
      }
    }
    for (const medication of (db_condition.medications || [])) {
      const matching_medication = matching_condition.medications?.find(
        (m) => (
          (medication.medication_id &&
            (medication.medication_id === m.medication_id)) ||
          (medication.manufactured_medication_id &&
            (medication.manufactured_medication_id ===
              m.manufactured_medication_id))
        ),
      )
      if (!matching_medication) {
        patient_medications_to_remove.push(
          medication.patient_condition_medication_id,
        )
      }
    }
  }

  const removing_conditions = conditions_to_remove.length &&
    trx
      .deleteFrom('patient_conditions')
      .where('id', 'in', conditions_to_remove)
      .execute()

  const removing_medications = patient_medications_to_remove.length &&
    trx
      .deleteFrom('patient_condition_medications')
      .where('id', 'in', patient_medications_to_remove)
      .execute()

  await Promise.all([removing_conditions, removing_medications])
}

async function upsertPreExistingCondition(
  trx: TrxOrDb,
  patient_id: number,
  database_conditions: PreExistingCondition[],
  condition: PreExistingConditionUpsert,
) {
  const matching_condition = database_conditions.find(
    (c) => c.id === condition.id,
  )
  let patient_condition_id: number
  if (matching_condition) {
    patient_condition_id = matching_condition.patient_condition_id
    if (
      matching_condition.start_date !== condition.start_date
    ) {
      await trx
        .updateTable('patient_conditions')
        .set({ start_date: condition.start_date })
        .where('id', '=', matching_condition.patient_condition_id)
        .executeTakeFirstOrThrow()
    }
  } else {
    const parent_condition = await trx
      .insertInto('patient_conditions')
      .values({
        patient_id,
        condition_id: condition.id,
        start_date: condition.start_date,
        comorbidity_of_condition_id: null,
      })
      .returning('id')
      .executeTakeFirstOrThrow()
    patient_condition_id = parent_condition.id
  }
  for (const comorbidity of condition.comorbidities || []) {
    const values = {
      patient_id,
      condition_id: comorbidity.id,
      start_date: comorbidity.start_date || condition.start_date,
      comorbidity_of_condition_id: patient_condition_id,
    }
    const matching_comorbidity = matching_condition?.comorbidities.find(
      (c) => c.id === comorbidity.id,
    )
    if (matching_comorbidity) {
      await trx
        .updateTable('patient_conditions')
        .set(values)
        .where('id', '=', matching_comorbidity.patient_condition_id)
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
    const matching_medication = matching_condition?.medications.find(
      (m) => (
        (medication.medication_id &&
          (medication.medication_id === m.medication_id)) ||
        (medication.manufactured_medication_id &&
          (medication.manufactured_medication_id ===
            m.manufactured_medication_id))
      ),
    )
    if (matching_medication) {
      await trx
        .updateTable('patient_condition_medications')
        .set(values)
        .where('id', '=', matching_medication.patient_condition_medication_id)
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
  const removing_entities_no_longer_present = removeEntitiesNoLongerPresent(
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
  await removing_entities_no_longer_present
}

// Note: Pre-existing conditions are just conditions that have not ended yet
export async function getPreExistingConditions(
  trx: TrxOrDb,
  opts: {
    patient_id: number
  },
): Promise<PreExistingCondition[]> {
  const getting_patient_conditions = await trx
    .selectFrom('patient_conditions')
    .innerJoin(
      'conditions',
      'conditions.id',
      'patient_conditions.condition_id',
    )
    .where('patient_conditions.patient_id', '=', opts.patient_id)
    .where('patient_conditions.end_date', 'is', null)
    .select([
      'conditions.id',
      'conditions.name',
      'patient_conditions.id as patient_condition_id',
      sql<string>`TO_CHAR(patient_conditions.start_date, 'YYYY-MM-DD')`.as(
        'start_date',
      ),
      'patient_conditions.comorbidity_of_condition_id',
    ])
    .execute()

  const getting_patient_medications = await trx
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
      'drugs.id',
      'medications.id as medication_id',
      'patient_condition_medications.manufactured_medication_id',
      'patient_condition_medications.id as patient_condition_medication_id',
      'patient_condition_medications.patient_condition_id',
      'patient_condition_medications.strength',
      'patient_condition_medications.route',
      'patient_condition_medications.special_instructions',
      sql<
        MedicationSchedule[]
      >`TO_JSON(patient_condition_medications.schedules)`.as('schedules'),
      'drugs.generic_name as name',
      sql<
        string
      >`TO_CHAR(patient_condition_medications.start_date, 'YYYY-MM-DD')`.as(
        'start_date',
      ),
    ])
    .execute()

  const patient_conditions = await getting_patient_conditions
  const patient_medications = await getting_patient_medications

  return patient_conditions
    .filter((condition) => !condition.comorbidity_of_condition_id)
    .map((parent_condition) => ({
      id: parent_condition.id,
      patient_condition_id: parent_condition.patient_condition_id,
      start_date: parent_condition.start_date,
      name: parent_condition.name,
      comorbidities: patient_conditions
        .filter(
          (comorbidity) =>
            comorbidity.comorbidity_of_condition_id ===
              parent_condition.patient_condition_id,
        )
        .map((comorbidity) => ({
          id: comorbidity.id,
          patient_condition_id: comorbidity.patient_condition_id,
          start_date: comorbidity.start_date,
          name: comorbidity.name,
        })),
      medications: patient_medications
        .filter((m) =>
          m.patient_condition_id === parent_condition.patient_condition_id
        )
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
      c.medications.map((medication) => medication.id)
    ),
  )
  const matchingDrugs = drug_ids.length
    ? await drugs.search(trx, { ids: drug_ids })
    : []

  return preExistingConditions.map((c) => ({
    ...c,
    medications: c.medications.map((m) => {
      const drug = matchingDrugs.find((d) => d.id === m.id)
      assert(drug, `Could not find drug with id ${m.id}`)
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
      'conditions.id',
      'patient_conditions.condition_id',
    )
    .where('patient_conditions.patient_id', '=', opts.patient_id)
    .where('patient_conditions.end_date', 'is not', null)
    .select([
      'conditions.id',
      'conditions.name',
      'patient_conditions.id as patient_condition_id',
      sql<string>`TO_CHAR(patient_conditions.start_date, 'YYYY-MM-DD')`.as(
        'start_date',
      ),
      sql<string>`TO_CHAR(patient_conditions.end_date, 'YYYY-MM-DD')`.as(
        'end_date',
      ),
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
  const removing_entities_no_longer_present = removeEntitiesNoLongerPresent(
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
  await removing_entities_no_longer_present
}

function upsertPastMedicalCondition(
  trx: TrxOrDb,
  patient_id: number,
  database_conditions: PastMedicalCondition[],
  condition: PastMedicalConditionUpsert,
) {
  const matching_condition = database_conditions.find(
    (c) => c.id === condition.id,
  )
  if (!matching_condition) {
    return trx
      .insertInto('patient_conditions')
      .values({
        patient_id,
        condition_id: condition.id,
        start_date: condition.start_date,
        end_date: condition.end_date,
      })
      .returning('id')
      .executeTakeFirstOrThrow()
  }
  if (
    matching_condition.start_date !== condition.start_date ||
    matching_condition.end_date !== condition.end_date
  ) {
    return trx
      .updateTable('patient_conditions')
      .set({
        start_date: condition.start_date,
        end_date: condition.end_date,
      })
      .where('id', '=', matching_condition.patient_condition_id)
      .where('patient_id', '=', patient_id)
      .executeTakeFirstOrThrow()
  }
}
