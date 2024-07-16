import { sql } from 'kysely'
import {
  MajorSurgery,
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
import { isoDate, jsonArrayFrom, now } from '../helpers.ts'
import { assertAllNotNull } from '../../util/assertAll.ts'
import { IntakeFrequencies } from '../../shared/medication.ts'

type PatientMedicationUpsert = {
  id?: Maybe<string>
  dosage: number
  strength: number
  intake_frequency: string
  route: string
  start_date?: Maybe<string>
  end_date?: Maybe<string>
  medication_id: string | null
  manufactured_medication_id: string | null
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

export type MajorSurgeryUpsert = {
  id: string
  start_date: string
}

function assertPreExistingConditions(
  patient_conditions: PreExistingConditionUpsert[],
) {
  const condition_unique_indexes = new Set<string>()
  const seen_medication_ids = new Set<string>()
  for (const condition of patient_conditions) {
    assertOr400(condition.id, 'Condition id must be present')
    assertOr400(
      isISODateString(condition.start_date),
      'Condition start_date must be present',
    )
    const unique_index = `${condition.id}:${condition.start_date}`
    assertOr400(
      !condition_unique_indexes.has(unique_index),
      'Condition id and start_date must be unique',
    )
    condition_unique_indexes.add(unique_index)
    for (const comorbidity of condition.comorbidities || []) {
      assertOr400(comorbidity.id, 'Comorbidity id must be present')
      const start_date = comorbidity.start_date || condition.start_date
      const unique_index = `${comorbidity.id}:${start_date}`
      assertOr400(
        !condition_unique_indexes.has(unique_index),
        'Comorbidity id and start_date must be unique',
      )
      condition_unique_indexes.add(unique_index)
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

async function upsertPreExistingCondition(
  trx: TrxOrDb,
  patient_id: string,
  condition: PreExistingConditionUpsert,
) {
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

  const comorbidities = (condition.comorbidities || []).map((comorbidity) => ({
    patient_id,
    condition_id: comorbidity.id,
    start_date: comorbidity.start_date || condition.start_date,
    comorbidity_of_condition_id: parent_condition.id,
  }))
  const inserting_comorbidities = comorbidities.length && trx
    .insertInto('patient_conditions')
    .values(comorbidities)
    .execute()

  const medications = (condition.medications || []).map((medication) => {
    const start_date = medication.start_date || condition.start_date

    const { duration, duration_unit } = medication.end_date
      ? {
        duration: differenceInDays(medication.end_date, start_date),
        duration_unit: 'days',
      }
      : { duration: 1, duration_unit: 'indefinitely' }

    return {
      patient_condition_id: parent_condition.id,
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
  })

  const inserting_medications = medications.length && trx
    .insertInto('patient_condition_medications')
    .values(medications)
    .execute()

  await Promise.all([inserting_comorbidities, inserting_medications])
}

export async function upsertPreExisting(
  trx: TrxOrDb,
  patient_id: string,
  patient_conditions: PreExistingConditionUpsert[],
): Promise<void> {
  assertPreExistingConditions(patient_conditions)

  const getting_procedures = patient_conditions.length
    ? trx.selectFrom('conditions').where(
      'id',
      'in',
      patient_conditions.map((condition) => condition.id),
    ).where('is_procedure', '=', true).select('id').execute()
    : Promise.resolve([])

  const removing = trx.deleteFrom(
    'patient_conditions',
  )
    .where('patient_id', '=', patient_id)
    .where('end_date', 'is', null)
    .where(
      'condition_id',
      'in',
      trx.selectFrom('conditions').where('is_procedure', '=', false).select(
        'id',
      ),
    )
    .where('created_at', '<=', now)
    .execute()

  await Promise.all(
    patient_conditions.map((condition) => (
      upsertPreExistingCondition(
        trx,
        patient_id,
        condition,
      )
    )),
  )
  await removing

  const procedures = await getting_procedures
  assertOr400(
    procedures.length === 0,
    'Pre-Existing Condition cannot be a surgery or procedure',
  )
}

export type MedicationSummary = {
  id: string
  name: string
  medication_id: string
  manufactured_medication_id: Maybe<string>
  patient_condition_medication_id: string

  strength: string
  route: string
  schedules: MedicationSchedule[]
  start_date: string

  form: string
  strength_numerator_unit: string
  strength_denominator: string
  strength_denominator_unit: string
  strength_denominator_is_units: boolean

  special_instructions: string | null
}

export type PreExistingConditionSummary = {
  id: string
  patient_condition_id: string
  start_date: string
  name: string
  comorbidities: {
    id: string
    comorbidity_id: string
    start_date: string
    name: string
  }[]
  medications: MedicationSummary[]
}

export function getPreExistingConditionsReview(
  trx: TrxOrDb,
  opts: {
    patient_id: string
  },
): Promise<PreExistingConditionSummary[]> {
  return trx
    .selectFrom('patient_conditions')
    .innerJoin(
      'conditions',
      'conditions.id',
      'patient_conditions.condition_id',
    )
    .where('conditions.is_procedure', '=', false)
    .where('patient_conditions.patient_id', '=', opts.patient_id)
    .where('patient_conditions.end_date', 'is', null)
    .where('patient_conditions.comorbidity_of_condition_id', 'is', null)
    .select((eb) => [
      'conditions.id',
      'conditions.name',
      'patient_conditions.id as patient_condition_id',
      isoDate(eb.ref('patient_conditions.start_date')).as('start_date'),
      jsonArrayFrom(
        eb
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
          .whereRef(
            'patient_condition_medications.patient_condition_id',
            '=',
            'patient_conditions.id',
          )
          .select((eb_med) => [
            'drugs.id',
            'drugs.generic_name as name',
            'medications.id as medication_id',
            'medications.form',
            'medications.strength_numerator_unit',
            'medications.strength_denominator',
            'medications.strength_denominator_unit',
            'medications.strength_denominator_is_units',
            'patient_condition_medications.manufactured_medication_id',
            'patient_condition_medications.id as patient_condition_medication_id',
            'patient_condition_medications.strength',
            'patient_condition_medications.route',
            'patient_condition_medications.special_instructions',
            sql<
              MedicationSchedule[]
            >`TO_JSON(patient_condition_medications.schedules)`.as('schedules'),
            isoDate(eb_med.ref('patient_condition_medications.start_date')).as(
              'start_date',
            ),
          ]),
      ).as('medications'),
      jsonArrayFrom(
        eb
          .selectFrom('patient_conditions as comorbidities')
          .innerJoin(
            'conditions',
            'conditions.id',
            'comorbidities.condition_id',
          )
          .whereRef(
            'comorbidities.comorbidity_of_condition_id',
            '=',
            'patient_conditions.id',
          )
          .select((eb_com) => [
            'conditions.id',
            'conditions.name',
            'comorbidities.id as comorbidity_id',
            isoDate(eb_com.ref('comorbidities.start_date')).as('start_date'),
            isoDate(eb_com.ref('comorbidities.end_date')).as('end_date'),
          ]),
      )
        .as('comorbidities'),
    ])
    .execute()
}

// Note: Pre-existing conditions are just conditions that have not ended yet
export async function getPreExistingConditions(
  trx: TrxOrDb,
  opts: {
    patient_id: string
  },
): Promise<PreExistingCondition[]> {
  const getting_patient_conditions = await trx
    .selectFrom('patient_conditions')
    .innerJoin(
      'conditions',
      'conditions.id',
      'patient_conditions.condition_id',
    )
    .where('conditions.is_procedure', '=', false)
    .where('patient_conditions.patient_id', '=', opts.patient_id)
    .where('patient_conditions.end_date', 'is', null)
    .select((eb) => [
      'conditions.id',
      'conditions.name',
      'patient_conditions.id as patient_condition_id',
      isoDate(eb.ref('patient_conditions.start_date')).as('start_date'),
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
    .select((eb) => [
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
      isoDate(eb.ref('patient_condition_medications.start_date')).as(
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
  opts: { patient_id: string },
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

export async function getPastMedicalConditions(
  trx: TrxOrDb,
  opts: {
    patient_id: string
  },
): Promise<PastMedicalCondition[]> {
  const results = await trx
    .selectFrom('patient_conditions')
    .innerJoin(
      'conditions',
      'conditions.id',
      'patient_conditions.condition_id',
    )
    .where('conditions.is_procedure', '=', false)
    .where('patient_conditions.patient_id', '=', opts.patient_id)
    .where('patient_conditions.end_date', 'is not', null)
    .select((eb) => [
      'conditions.id',
      'conditions.name',
      'patient_conditions.id as patient_condition_id',
      isoDate(eb.ref('patient_conditions.start_date')).as('start_date'),
      isoDate(eb.ref('patient_conditions.end_date')).as('end_date'),
    ])
    .execute()

  assertAllNotNull(results, 'end_date')
  return results
}

export async function upsertPastMedical(
  trx: TrxOrDb,
  patient_id: string,
  patient_conditions: PastMedicalConditionUpsert[],
): Promise<void> {
  assertPreExistingConditions(patient_conditions)
  for (const condition of patient_conditions) {
    assertOr400(
      isISODateString(condition.end_date),
      'Condition end_date must be an ISO Date',
    )
  }
  const removing = trx.deleteFrom(
    'patient_conditions',
  )
    .where('patient_id', '=', patient_id)
    .where('end_date', 'is not', null)
    .where(
      'condition_id',
      'in',
      trx.selectFrom('conditions').where('is_procedure', '=', false).select(
        'id',
      ),
    )
    .where('created_at', '<=', now)
    .execute()

  const to_insert = patient_conditions.map((condition) => ({
    patient_id,
    condition_id: condition.id,
    start_date: condition.start_date,
    end_date: condition.end_date,
  }))

  to_insert.length && await trx
    .insertInto('patient_conditions')
    .values(to_insert)
    .execute()

  await removing
}

export function getMajorSurgeries(
  trx: TrxOrDb,
  opts: {
    patient_id: string
  },
): Promise<MajorSurgery[]> {
  return trx
    .selectFrom('patient_conditions')
    .innerJoin(
      'conditions',
      'conditions.id',
      'patient_conditions.condition_id',
    )
    .where('patient_conditions.patient_id', '=', opts.patient_id)
    .where('conditions.is_procedure', '=', true)
    .select((eb) => [
      'conditions.id',
      'conditions.name',
      'patient_conditions.id as patient_condition_id',
      isoDate(eb.ref('patient_conditions.start_date')).as('start_date'),
    ])
    .execute()
}

export async function upsertMajorSurgeries(
  trx: TrxOrDb,
  patient_id: string,
  major_surgeries: MajorSurgeryUpsert[],
): Promise<void> {
  assertPreExistingConditions(major_surgeries)

  const getting_non_procedures = major_surgeries.length
    ? trx.selectFrom('conditions').where(
      'id',
      'in',
      major_surgeries.map((surgery) => surgery.id),
    ).where('is_procedure', '=', false).select('id').execute()
    : Promise.resolve([])

  const removing = trx.deleteFrom(
    'patient_conditions',
  )
    .where('patient_id', '=', patient_id)
    .where(
      'condition_id',
      'in',
      trx.selectFrom('conditions').where('is_procedure', '=', true).select(
        'id',
      ),
    )
    .where('created_at', '<=', now)
    .execute()

  const to_insert = major_surgeries.map((surgery) => ({
    patient_id,
    condition_id: surgery.id,
    start_date: surgery.start_date,
  }))

  to_insert.length && await trx
    .insertInto('patient_conditions')
    .values(to_insert)
    .execute()

  await removing

  const non_procedures = await getting_non_procedures
  assertOr400(non_procedures.length === 0, 'Condition is not a major surgery')
}
