/*
  Computed findings follow the same append-only log pattern as patient_records
  Deletions handled by referrant_finding with snomed_concept_id: 723510000 | Entered in error
  Edits would be a deletion and a new entry
*/
import { sql } from 'kysely'
import type { DB } from '../../db.d.ts'
import type { Insertable, Selectable } from 'kysely'
import { blankSelection, jsonBuildObject, success_true } from '../helpers.ts'
import generateUUID from '../../util/uuid.ts'
import { TrxOrDb } from '../../types.ts'

export type PatientComputedFinding = Selectable<DB['patient_computed_findings']>
export type NewPatientComputedFinding = Insertable<
  DB['patient_computed_findings']
>
export type PatientComputedFindingInput = Selectable<
  DB['patient_computed_findings_inputs']
>
export type NewPatientComputedFindingInput = Insertable<
  DB['patient_computed_findings_inputs']
>

function valueDisplay(
  { value, units, value_display }: {
    value: number | null
    units: string | null
    value_display: string | null
  },
): string {
  if (value_display) {
    return value_display
  }

  if (value !== null && units !== null && value_display === null) {
    switch (units) {
      case '°C':
      case '%':
        return `${value}${units}`
      default:
        return `${value} ${units}`
    }
  }

  return 'N/A'
}

export function insertComputedFinding(
  trx: TrxOrDb,
  {
    patient_id,
    patient_encounter_id,
    patient_encounter_employee_id,
    procedure_id,
    snomed_concept_id,
    value,
    units,
    value_display,
    algorithm_version,
    computation_metadata = {},
    input_measurements = [],
  }: {
    patient_id: string
    patient_encounter_id: string
    patient_encounter_employee_id: string
    procedure_id: string
    snomed_concept_id: string
    value?: number
    units?: string
    value_display?: string
    algorithm_version: string
    computation_metadata?: Record<string, unknown>
    input_measurements?: Array<{ record_id: string }>
  },
) {
  // Validate that we have either structured (value + units) OR display format
  const hasStructured = value !== undefined && units !== undefined &&
    value_display === undefined
  const hasDisplay = !hasStructured

  if (!hasStructured && !hasDisplay) {
    throw new Error('Must provide either value + units OR value_display')
  }

  if (hasStructured && hasDisplay) {
    throw new Error('Cannot provide both structured values and value_display')
  }

  if (hasStructured && (typeof value !== 'number' || isNaN(value))) {
    throw new Error(`Invalid computed value: ${value}`)
  }

  const computed_finding_id = generateUUID()

  return trx.with(
    'inserting_computed_finding_record',
    (qb) =>
      qb.insertInto('patient_records')
        .values({
          id: computed_finding_id,
          patient_id,
          patient_encounter_id,
          snomed_concept_id,
        }),
  ).with(
    'inserting_computed_finding_finding',
    (qb) =>
      qb.insertInto('patient_findings')
        .values({
          id: computed_finding_id,
          patient_encounter_employee_id,
          procedure_id,
        }),
  ).with(
    'inserting_computed_finding',
    (qb) =>
      qb.insertInto('patient_computed_findings')
        .values({
          id: computed_finding_id,
          computation_algorithm_version: algorithm_version,
          computation_metadata: JSON.stringify(computation_metadata),
          value: value ?? null,
          units: units ?? null,
          value_display: value_display ?? null,
        }),
  ).with(
    'inserting_computed_finding_inputs',
    (qb) =>
      input_measurements.length
        ? qb.insertInto('patient_computed_findings_inputs')
          .values(
            input_measurements.map((input) => ({
              computed_finding_id,
              input_measurement_id: input.record_id,
            })),
          )
        : blankSelection(qb),
  ).selectNoFrom([
    success_true,
    sql<string>`${computed_finding_id}`.as('computed_finding_id'),
  ])
    .executeTakeFirstOrThrow()
}

export async function getComputedFindingsByEncounter(
  trx: TrxOrDb,
  patient_encounter_id: string,
) {
  const results = await trx.selectFrom('patient_computed_findings as pcf')
    .innerJoin('patient_findings as pf', 'pcf.id', 'pf.id')
    .innerJoin('patient_records as pr', 'pf.id', 'pr.id')
    .select([
      'pcf.id',
      'pcf.computation_algorithm_version',
      'pcf.computation_metadata',
      'pcf.created_at',
      'pcf.value',
      'pcf.units',
      'pcf.value_display',
      sql<string>`pr.snomed_concept_id::text`.as('snomed_concept_id'),
    ])
    .where('pr.patient_encounter_id', '=', patient_encounter_id)
    .orderBy('pcf.created_at', 'desc')
    .execute()

  return results.map((result) => ({
    ...result,
    value: result.value ? Number(result.value) : null,
    value_display: valueDisplay({
      value: result.value ? Number(result.value) : null,
      units: result.units,
      value_display: result.value_display,
    }),
  }))
}

export async function getComputedFindingInputs(
  trx: TrxOrDb,
  computed_finding_id: string,
) {
  const results = await trx.selectFrom(
    'patient_computed_findings_inputs as pcfi',
  )
    .innerJoin(
      'patient_measurements as pm',
      'pcfi.input_measurement_id',
      'pm.id',
    )
    .innerJoin('patient_findings as pf', 'pm.id', 'pf.id')
    .innerJoin('patient_records as pr', 'pf.id', 'pr.id')
    .select([
      'pcfi.id',
      'pcfi.computed_finding_id',
      'pcfi.input_measurement_id',
      sql<string>`pr.snomed_concept_id::text`.as('snomed_concept_id'),
      'pm.value',
      'pm.units',
      'pr.created_at',
    ])
    .where('pcfi.computed_finding_id', '=', computed_finding_id)
    .orderBy('pr.created_at', 'desc')
    .execute()

  return results.map((result) => ({
    ...result,
    value: Number(result.value),
    value_display: valueDisplay({
      value: Number(result.value),
      units: result.units,
      value_display: null, // Input measurements don't have display values
    }),
  }))
}

export async function getComputedFindingWithInputs(
  trx: TrxOrDb,
  computed_finding_id: string,
) {
  const result = await trx.selectFrom('patient_computed_findings as pcf')
    .innerJoin('patient_findings as pf', 'pcf.id', 'pf.id')
    .innerJoin('patient_records as pr', 'pf.id', 'pr.id')
    .select([
      'pcf.id',
      'pcf.computation_algorithm_version',
      'pcf.computation_metadata',
      'pcf.created_at',
      'pcf.value',
      'pcf.units',
      'pcf.value_display',
      sql<string>`pr.snomed_concept_id::text`.as('snomed_concept_id'),
    ])
    .where('pcf.id', '=', computed_finding_id)
    .executeTakeFirst()

  if (!result) return null

  const finding = {
    ...result,
    value: result.value ? Number(result.value) : null,
    value_display: valueDisplay({
      value: result.value ? Number(result.value) : null,
      units: result.units,
      value_display: result.value_display,
    }),
  }

  const inputs = await getComputedFindingInputs(trx, computed_finding_id)

  return { finding, inputs }
}

export async function getComputedFindingWithProvider(
  trx: TrxOrDb,
  computed_finding_id: string,
) {
  const result = await trx.selectFrom('patient_computed_findings as pcf')
    .innerJoin('patient_findings as pf', 'pcf.id', 'pf.id')
    .innerJoin('patient_records as pr', 'pf.id', 'pr.id')
    .innerJoin(
      'patient_encounter_employees as pep',
      'pf.patient_encounter_employee_id',
      'pep.id',
    )
    .innerJoin('employment as e', 'pep.employment_id', 'e.id')
    .innerJoin('health_workers as hw', 'e.health_worker_id', 'hw.id')
    .innerJoin('organizations as org', 'e.organization_id', 'org.id')
    .select([
      'pcf.id',
      'pcf.computation_algorithm_version',
      'pcf.computation_metadata',
      'pcf.created_at',
      'pcf.value',
      'pcf.units',
      'pcf.value_display',
      sql<string>`pr.snomed_concept_id::text`.as('snomed_concept_id'),
      'pr.patient_id',
      'pr.patient_encounter_id',
    ])
    .select((eb) => [
      jsonBuildObject({
        name: eb.ref('hw.name'),
        profession: eb.ref('e.profession'),
        organization_name: eb.ref('org.name'),
      }).as('provider'),
    ])
    .where('pcf.id', '=', computed_finding_id)
    .executeTakeFirst()

  if (!result) return null

  const inputs = await getComputedFindingInputs(trx, computed_finding_id)

  return {
    ...result,
    value: result.value ? Number(result.value) : null,
    value_display: valueDisplay({
      value: result.value ? Number(result.value) : null,
      units: result.units,
      value_display: result.value_display,
    }),
    inputs,
  }
}
