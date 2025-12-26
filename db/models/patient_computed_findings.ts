// /*
//   Computed findings follow the same append-only log pattern as patient_records
//   Deletions handled by referent_finding with snomed_concept_id: 723510000 | Entered in error
//   Edits would be a deletion and a new entry
// */
// import { sql } from 'kysely'
// import type { DB } from '../../db.d.ts'
// import type { Insertable, Selectable } from 'kysely'
// import { blankSelection, success_true } from '../helpers.ts'
// import generateUUID from '../../util/uuid.ts'
// import { Measurement, TrxOrDb } from '../../types.ts'
// import {
//   BMI_DECIMAL_PLACES,
//   CM_TO_METERS,
//   computeBMI,
//   computeMeanArterialPressure,
//   formatBloodPressureDisplay,
//   VITAL_COMPUTED_UNITS,
//   VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS,
//   VITALS_COMPUTED_SNOMED_CONCEPT_IDS,
// } from '../../shared/vitals.ts'

// export type PatientComputedFinding = Selectable<DB['patient_computed_findings']>
// export type NewPatientComputedFinding = Insertable<
//   DB['patient_computed_findings']
// >
// export type PatientComputedFindingInput = Selectable<
//   DB['patient_computed_findings_inputs']
// >
// export type NewPatientComputedFindingInput = Insertable<
//   DB['patient_computed_findings_inputs']
// >

// function valueDisplay(
//   { value, units, value_display }: {
//     value: number | null
//     units: string | null
//     value_display: string | null
//   },
// ): string {
//   if (value_display) {
//     return value_display
//   }

//   if (value !== null && units !== null && value_display === null) {
//     switch (units) {
//       case '°C':
//       case '%':
//         return `${value}${units}`
//       default:
//         return `${value} ${units}`
//     }
//   }

//   return 'N/A'
// }

// export function insertComputedFinding(
//   trx: TrxOrDb,
//   {
//     patient_id,
//     patient_encounter_id,
//     patient_encounter_employee_id,
//     procedure_id,
//     snomed_concept_id,
//     value,
//     units,
//     value_display,
//     algorithm_version,
//     computation_metadata = {},
//     input_measurements = [],
//   }: {
//     patient_id: string
//     patient_encounter_id: string
//     patient_encounter_employee_id: string
//     procedure_id: string
//     snomed_concept_id: string
//     value?: number
//     units?: string
//     value_display?: string
//     algorithm_version: string
//     computation_metadata?: Record<string, unknown>
//     input_measurements?: Array<{ record_id: string }>
//   },
// ) {
//   const has_structured = value !== undefined && units !== undefined &&
//     value_display === undefined
//   const has_display = !has_structured

//   if (!has_structured && !has_display) {
//     throw new Error('Must provide either value + units OR value_display')
//   }

//   if (has_structured && has_display) {
//     throw new Error('Cannot provide both structured values and value_display')
//   }

//   if (has_structured && (typeof value !== 'number' || isNaN(value))) {
//     throw new Error(`Invalid computed value: ${value}`)
//   }

//   const computed_finding_id = generateUUID()

//   return trx.with(
//     'inserting_computed_finding_record',
//     (qb) =>
//       qb.insertInto('patient_records')
//         .values({
//           id: computed_finding_id,
//           patient_id,
//           patient_encounter_id,
//           snomed_concept_id,
//         }),
//   ).with(
//     'inserting_computed_finding_finding',
//     (qb) =>
//       qb.insertInto('patient_findings')
//         .values({
//           id: computed_finding_id,
//           patient_encounter_employee_id,
//           procedure_id,
//         }),
//   ).with(
//     'inserting_computed_finding',
//     (qb) =>
//       qb.insertInto('patient_computed_findings')
//         .values({
//           id: computed_finding_id,
//           computation_algorithm_version: algorithm_version,
//           computation_metadata: JSON.stringify(computation_metadata),
//           value: value ?? null,
//           units: units ?? null,
//           value_display: value_display ?? null,
//         }),
//   ).with(
//     'inserting_computed_finding_inputs',
//     (qb) =>
//       input_measurements.length
//         ? qb.insertInto('patient_computed_findings_inputs')
//           .values(
//             input_measurements.map((input) => ({
//               computed_finding_id,
//               input_measurement_id: input.record_id,
//             })),
//           )
//         : blankSelection(qb),
//   ).selectNoFrom([
//     success_true,
//     sql<string>`${computed_finding_id}`.as('computed_finding_id'),
//   ])
//     .executeTakeFirstOrThrow()
// }

// export async function getComputedFindingsByEncounter(
//   trx: TrxOrDb,
//   patient_encounter_id: string,
// ) {
//   const results = await trx.selectFrom('patient_computed_findings as pcf')
//     .innerJoin('patient_findings as pf', 'pcf.id', 'pf.id')
//     .innerJoin('patient_records as pr', 'pf.id', 'pr.id')
//     .select([
//       'pcf.id',
//       'pcf.computation_algorithm_version',
//       'pcf.computation_metadata',
//       'pcf.created_at',
//       'pcf.value',
//       'pcf.units',
//       'pcf.value_display',
//       sql<string>`pr.snomed_concept_id::text`.as('snomed_concept_id'),
//     ])
//     .where('pr.patient_encounter_id', '=', patient_encounter_id)
//     .orderBy('pcf.created_at', 'desc')
//     .execute()

//   return results.map((result) => ({
//     ...result,
//     value: result.value ? Number(result.value) : null,
//     value_display: valueDisplay({
//       value: result.value ? Number(result.value) : null,
//       units: result.units,
//       value_display: result.value_display,
//     }),
//   }))
// }

// export async function getComputedFindingInputs(
//   trx: TrxOrDb,
//   computed_finding_id: string,
// ) {
//   const results = await trx.selectFrom(
//     'patient_computed_findings_inputs as pcfi',
//   )
//     .innerJoin(
//       'patient_measurements as pm',
//       'pcfi.input_measurement_id',
//       'pm.id',
//     )
//     .innerJoin('patient_findings as pf', 'pm.id', 'pf.id')
//     .innerJoin('patient_records as pr', 'pf.id', 'pr.id')
//     .select([
//       'pcfi.id',
//       'pcfi.computed_finding_id',
//       'pcfi.input_measurement_id',
//       sql<string>`pr.snomed_concept_id::text`.as('snomed_concept_id'),
//       'pm.value',
//       'pm.units',
//       'pr.created_at',
//     ])
//     .where('pcfi.computed_finding_id', '=', computed_finding_id)
//     .orderBy('pr.created_at', 'desc')
//     .execute()

//   return results.map((result) => ({
//     ...result,
//     value: Number(result.value),
//     value_display: valueDisplay({
//       value: Number(result.value),
//       units: result.units,
//       value_display: null, // Input measurements don't have display values
//     }),
//   }))
// }

// export async function getComputedFindingWithInputs(
//   trx: TrxOrDb,
//   computed_finding_id: string,
// ) {
//   const result = await trx.selectFrom('patient_computed_findings as pcf')
//     .innerJoin('patient_findings as pf', 'pcf.id', 'pf.id')
//     .innerJoin('patient_records as pr', 'pf.id', 'pr.id')
//     .select([
//       'pcf.id',
//       'pcf.computation_algorithm_version',
//       'pcf.computation_metadata',
//       'pcf.created_at',
//       'pcf.value',
//       'pcf.units',
//       'pcf.value_display',
//       sql<string>`pr.snomed_concept_id::text`.as('snomed_concept_id'),
//     ])
//     .where('pcf.id', '=', computed_finding_id)
//     .executeTakeFirst()

//   if (!result) return null

//   const finding = {
//     ...result,
//     value: result.value ? Number(result.value) : null,
//     value_display: valueDisplay({
//       value: result.value ? Number(result.value) : null,
//       units: result.units,
//       value_display: result.value_display,
//     }),
//   }

//   const inputs = await getComputedFindingInputs(trx, computed_finding_id)

//   return { finding, inputs }
// }

// export async function getComputedFindingWithProvider(
//   trx: TrxOrDb,
//   computed_finding_id: string,
// ) {
//   const result = await trx.selectFrom('patient_computed_findings as pcf')
//     .innerJoin('patient_findings as pf', 'pcf.id', 'pf.id')
//     .innerJoin('patient_records as pr', 'pf.id', 'pr.id')
//     .select([
//       'pcf.id',
//       'pcf.computation_algorithm_version',
//       'pcf.computation_metadata',
//       'pcf.created_at',
//       'pcf.value',
//       'pcf.units',
//       'pcf.value_display',
//       sql<string>`pr.snomed_concept_id::text`.as('snomed_concept_id'),
//       'pr.patient_id',
//       'pr.patient_encounter_id',
//     ])
//     .where('pcf.id', '=', computed_finding_id)
//     .executeTakeFirst()

//   if (!result) return null

//   const inputs = await getComputedFindingInputs(trx, computed_finding_id)

//   return {
//     ...result,
//     value: result.value ? Number(result.value) : null,
//     value_display: valueDisplay({
//       value: result.value ? Number(result.value) : null,
//       units: result.units,
//       value_display: result.value_display,
//     }),
//     inputs,
//   }
// }

// export async function computeAndInsertDerivedMeasurements(
//   trx: TrxOrDb,
//   {
//     patient_id,
//     patient_encounter_id,
//     patient_encounter_employee_id,
//     source_measurements,
//     source_procedure_id,
//   }: {
//     patient_id: string
//     patient_encounter_id: string
//     patient_encounter_employee_id: string
//     source_measurements: Measurement[]
//     source_procedure_id: string
//   },
// ): Promise<
//   {
//     success: true
//     computed_findings: string[]
//     computed_measurements: Measurement[]
//   }
// > {
//   const measurements = new Map(
//     source_measurements.map((m) => [m.snomed_concept_id, m]),
//   )

//   const computed_findings: string[] = []
//   const computed_measurements: Measurement[] = []

//   if (source_measurements.length === 0) {
//     return { success: true as const, computed_findings, computed_measurements }
//   }

//   const height_measurement = measurements.get(
//     VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS.height,
//   )
//   const weight_measurement = measurements.get(
//     VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS.weight,
//   )

//   if (
//     height_measurement &&
//     weight_measurement &&
//     height_measurement.value &&
//     weight_measurement.value &&
//     height_measurement.value > 0 &&
//     weight_measurement.value > 0
//   ) {
//     const bmi = computeBMI(height_measurement.value, weight_measurement.value)
//     const height_m = height_measurement.value / CM_TO_METERS
//     const bmi_value = Math.round(bmi * 10 ** BMI_DECIMAL_PLACES) /
//       10 ** BMI_DECIMAL_PLACES

//     const body_mass_index_result = await insertComputedFinding(trx, {
//       patient_id,
//       patient_encounter_id,
//       patient_encounter_employee_id,
//       procedure_id: source_procedure_id,
//       snomed_concept_id: VITALS_COMPUTED_SNOMED_CONCEPT_IDS.body_mass_index,
//       value: bmi_value,
//       units: VITAL_COMPUTED_UNITS.body_mass_index,
//       algorithm_version: 'BMI_v1.0',
//       computation_metadata: {
//         formula: 'weight_kg / (height_m^2)',
//         height_m,
//         weight_kg: weight_measurement.value,
//       },
//       input_measurements: [
//         { record_id: height_measurement.record_id },
//         { record_id: weight_measurement.record_id },
//       ],
//     })
//     computed_findings.push(body_mass_index_result.computed_finding_id)
//     computed_measurements.push({
//       record_id: body_mass_index_result.computed_finding_id,
//       snomed_concept_id: VITALS_COMPUTED_SNOMED_CONCEPT_IDS.body_mass_index,
//       value: bmi_value,
//       units: VITAL_COMPUTED_UNITS.body_mass_index,
//     })
//   }

//   const systolic_measurement = measurements.get(
//     VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS.blood_pressure_systolic,
//   )
//   const diastolic_measurement = measurements.get(
//     VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS.blood_pressure_diastolic,
//   )

//   if (
//     systolic_measurement &&
//     diastolic_measurement &&
//     systolic_measurement.value &&
//     diastolic_measurement.value &&
//     systolic_measurement.value > 0 &&
//     diastolic_measurement.value > 0
//   ) {
//     const map = computeMeanArterialPressure(
//       systolic_measurement.value,
//       diastolic_measurement.value,
//     )
//     const map_value = Math.round(map)

//     const map_result = await insertComputedFinding(
//       trx,
//       {
//         patient_id,
//         patient_encounter_id,
//         patient_encounter_employee_id,
//         procedure_id: source_procedure_id,
//         snomed_concept_id:
//           VITALS_COMPUTED_SNOMED_CONCEPT_IDS.mean_arterial_pressure,
//         value: map_value,
//         units: VITAL_COMPUTED_UNITS.mean_arterial_pressure,
//         algorithm_version: 'MAP_v1.0',
//         computation_metadata: {
//           formula: 'diastolic + (systolic - diastolic) / 3',
//           systolic_mmhg: systolic_measurement.value,
//           diastolic_mmhg: diastolic_measurement.value,
//         },
//         input_measurements: [
//           {
//             record_id: systolic_measurement.record_id,
//           },
//           {
//             record_id: diastolic_measurement.record_id,
//           },
//         ],
//       },
//     )
//     computed_findings.push(map_result.computed_finding_id)
//     computed_measurements.push({
//       record_id: map_result.computed_finding_id,
//       snomed_concept_id:
//         VITALS_COMPUTED_SNOMED_CONCEPT_IDS.mean_arterial_pressure,
//       value: map_value,
//       units: VITAL_COMPUTED_UNITS.mean_arterial_pressure,
//     })
//   }

//   if (
//     systolic_measurement &&
//     diastolic_measurement &&
//     systolic_measurement.value &&
//     diastolic_measurement.value &&
//     systolic_measurement.value > 0 &&
//     diastolic_measurement.value > 0
//   ) {
//     const bp_display = formatBloodPressureDisplay(
//       systolic_measurement.value,
//       diastolic_measurement.value,
//     )

//     const bp_result = await insertComputedFinding(
//       trx,
//       {
//         patient_id,
//         patient_encounter_id,
//         patient_encounter_employee_id,
//         procedure_id: source_procedure_id,
//         snomed_concept_id: VITALS_COMPUTED_SNOMED_CONCEPT_IDS.blood_pressure,
//         value_display: bp_display,
//         algorithm_version: 'BP_v1.0',
//         computation_metadata: {
//           format: 'systolic/diastolic mmHg',
//           systolic_mmhg: systolic_measurement.value,
//           diastolic_mmhg: diastolic_measurement.value,
//         },
//         input_measurements: [
//           {
//             record_id: systolic_measurement.record_id,
//           },
//           {
//             record_id: diastolic_measurement.record_id,
//           },
//         ],
//       },
//     )
//     computed_findings.push(bp_result.computed_finding_id)
//   }

//   return { success: true as const, computed_findings, computed_measurements }
// }
