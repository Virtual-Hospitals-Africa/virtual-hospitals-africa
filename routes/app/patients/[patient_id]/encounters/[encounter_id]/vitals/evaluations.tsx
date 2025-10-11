import { EncounterContext, EncounterPage } from './../_middleware.tsx'
import { z } from 'zod'
import * as patient_evaluations from '../../../../../../../db/models/patient_evaluations.ts'
import * as patient_clinical_context from '../../../../../../../db/models/patient_clinical_context.ts'
import * as automated_evaluation from '../../../../../../../db/models/automated_evaluation.ts'
import { getRequiredUUIDParam } from '../../../../../../../util/getParam.ts'
import { completeStep } from './../_middleware.tsx'
import { postHandler } from '../../../../../../../util/postHandler.ts'
import { snomed_concept_id } from '../../../../../../../util/validators.ts'
import { PRIORITIES } from '../../../../../../../types.ts'
import { VITALS_SNOMED_CODE } from '../../../../../../../shared/vitals.ts'
import VitalsTableRow from '../../../../../../../islands/vitals/VitalsTableRow.tsx'

const VitalsEvaluationSchema = z.object({
  findings: z.record(
    z.string().uuid(),
    z.object({
      finding_id: z.string().uuid(),
      snomed_concept_id,
      priority: z.enum(PRIORITIES).optional(),
      note: z.string().trim().optional(),
    }),
  ).optional().transform((findings) =>
    Object.entries(findings || {}).map(([_, evaluation_data]) =>
      evaluation_data
    )
  ),
})

export const handler = postHandler(
  VitalsEvaluationSchema,
  async (_req, ctx: EncounterContext, form_values) => {
    const patient_id = getRequiredUUIDParam(ctx, 'patient_id')

    await patient_evaluations.insertMany(ctx.state.trx, {
      patient_id,
      encounter_id: ctx.state.encounter.encounter_id,
      encounter_provider_id:
        ctx.state.encounter_provider.patient_encounter_provider_id,
      evaluations: form_values.findings,
    })

    return completeStep(ctx)
  },
)

export async function VitalsEvaluationsPage(ctx: EncounterContext) {
  const patient_id = getRequiredUUIDParam(ctx, 'patient_id')

  const [recent_measurements, previous_measurements] = await Promise.all([
    patient_evaluations.getMostRecentVitalsWithEvaluations(
      ctx.state.trx,
      { patient_id },
    ),
    patient_evaluations.getPreviousVitalMeasurements(
      ctx.state.trx,
      { patient_id },
    ),
  ])

  const measurements_with_evaluations = recent_measurements.map(
    (measurement) => ({
      ...measurement,
      existing_evaluation: measurement.evaluations[0]
        ? {
          evaluation_id: measurement.finding_id,
          evaluates_record_id: measurement.finding_id,
          priority: patient_evaluations.mapPriorityFromSnomedCode(
            measurement.evaluations[0].snomed_concept_id,
          ),
          note: measurement.evaluations[0].note,
          snomed_concept_id: measurement.evaluations[0].snomed_concept_id,
        }
        : undefined,
    }),
  )

  // Get patient clinical context for reference ranges
  const clinical_context = await patient_clinical_context
    .buildPatientClinicalContext(
      ctx.state.trx,
      patient_id,
    )

  // Get reference ranges for all measurements
  const measurement_snomed_codes = recent_measurements.map((m) =>
    m.snomed_concept_id
  )
  const reference_ranges = await automated_evaluation
    .getApplicableReferenceRanges(
      ctx.state.trx,
      {
        measurement_snomed_codes,
        patient_context: clinical_context,
      },
    )

  return (
    <div>
      <h3 className='text-lg font-semibold text-gray-900 mb-4'>
        Reference Range Analysis
      </h3>
      <VitalsEvaluationTable
        measurements={measurements_with_evaluations}
        referenceRanges={reference_ranges}
        previousMeasurements={previous_measurements}
      />
    </div>
  )
}

// VitalsEvaluationTable component
interface VitalsEvaluationTableProps {
  measurements: any[]
  referenceRanges: any[]
  previousMeasurements: Map<string, string>
}

function VitalsEvaluationTable({
  measurements,
  referenceRanges,
  previousMeasurements,
}: VitalsEvaluationTableProps) {
  return (
    <div className='overflow-x-auto'>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          <tr>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
              Vital Name
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
              Vital Value
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
              Previous
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
              Vital Range Visualized
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
              System Evaluation
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
              Flags
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
              Notes
            </th>
          </tr>
        </thead>
        <tbody className='bg-white divide-y divide-gray-200'>
          {getOrderedMeasurementsForDisplay(measurements).map((measurement) => {
            const range = referenceRanges.find((r) =>
              r.measurement_snomed_concept_id ===
                measurement.snomed_concept_id
            )
            const value = parseFloat(measurement.value_display)

            let systemEvaluation = 'Normal'
            if (range && !isNaN(value)) {
              if (
                (range.critical_min !== undefined &&
                  value < range.critical_min) ||
                (range.critical_max !== undefined && value > range.critical_max)
              ) {
                systemEvaluation = 'CRITICAL'
              } else if (
                value < range.normal_min || value > range.normal_max
              ) {
                systemEvaluation = 'Abnormal'
              }
            }

            const isComputed = isComputedVital(measurement.snomed_concept_id)
            const isComponentOfComputed = isComponentOfComputedVital(
              measurement.snomed_concept_id,
              measurements,
            )

            const previousDisplay = previousMeasurements.get(
              measurement.snomed_concept_id,
            )
            const previousValue = previousDisplay
              ? parseFloat(previousDisplay)
              : undefined

            return (
              <VitalsTableRow
                key={measurement.finding_id}
                measurement={measurement}
                range={range}
                previousValue={previousValue}
                previousDisplay={previousDisplay}
                systemEvaluation={systemEvaluation}
                isComputed={isComputed}
                isComponentOfComputed={isComponentOfComputed}
                vitalDisplayName={getVitalDisplayName(
                  measurement.snomed_concept_id,
                )}
              />
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// Helper function to determine if a vital is computed
function isComputedVital(snomed_concept_id: string): boolean {
  return [
    VITALS_SNOMED_CODE.body_mass_index,
    VITALS_SNOMED_CODE.mean_arterial_pressure,
    VITALS_SNOMED_CODE.blood_pressure,
  ].includes(snomed_concept_id)
}

// Helper function to determine if a vital is a component of a computed vital
function isComponentOfComputedVital(
  snomed_concept_id: string,
  all_measurements: any[],
): boolean {
  const bmi_components = [VITALS_SNOMED_CODE.height, VITALS_SNOMED_CODE.weight]
  const bp_components = [
    VITALS_SNOMED_CODE.blood_pressure_systolic,
    VITALS_SNOMED_CODE.blood_pressure_diastolic,
  ]

  // Check if this is a BMI component and BMI exists in measurements
  if (bmi_components.includes(snomed_concept_id)) {
    return all_measurements.some((m) =>
      m.snomed_concept_id === VITALS_SNOMED_CODE.body_mass_index
    )
  }

  // Check if this is a BP component and BP or MAP exists in measurements
  if (bp_components.includes(snomed_concept_id)) {
    return all_measurements.some((m) =>
      [
        VITALS_SNOMED_CODE.blood_pressure,
        VITALS_SNOMED_CODE.mean_arterial_pressure,
      ].includes(m.snomed_concept_id)
    )
  }

  return false
}

// Helper function to order measurements for display
function getOrderedMeasurementsForDisplay(measurements: any[]): any[] {
  const ordered: any[] = []
  const used_measurements = new Set<string>()

  // Define the display order with computed vitals and their components
  const display_order = [
    // BMI and its components
    {
      computed: VITALS_SNOMED_CODE.body_mass_index,
      components: [VITALS_SNOMED_CODE.height, VITALS_SNOMED_CODE.weight],
    },
    // Blood Pressure (generic) and its components
    {
      computed: VITALS_SNOMED_CODE.blood_pressure,
      components: [
        VITALS_SNOMED_CODE.blood_pressure_systolic,
        VITALS_SNOMED_CODE.blood_pressure_diastolic,
      ],
    },
    // Mean Arterial Pressure (computed from systolic/diastolic)
    {
      computed: VITALS_SNOMED_CODE.mean_arterial_pressure,
      components: [],
    },
    // Other vitals in logical order
    VITALS_SNOMED_CODE.temperature,
    VITALS_SNOMED_CODE.pulse,
    VITALS_SNOMED_CODE.respiratory_rate,
    VITALS_SNOMED_CODE.blood_oxygen_saturation,
    VITALS_SNOMED_CODE.blood_glucose,
    VITALS_SNOMED_CODE.head_circumference,
    VITALS_SNOMED_CODE.midarm_circumference,
    VITALS_SNOMED_CODE.triceps_skinfold,
  ]

  // Process computed vitals with their components
  for (const item of display_order) {
    if (typeof item === 'object') {
      // This is a computed vital with components
      const computed_measurement = measurements.find((m) =>
        m.snomed_concept_id === item.computed
      )

      if (computed_measurement) {
        ordered.push(computed_measurement)
        used_measurements.add(computed_measurement.finding_id)

        // Add components if they exist
        for (const component_code of item.components) {
          const component_measurement = measurements.find((m) =>
            m.snomed_concept_id === component_code
          )
          if (component_measurement) {
            ordered.push(component_measurement)
            used_measurements.add(component_measurement.finding_id)
          }
        }
      }
    } else {
      // This is a regular vital
      const measurement = measurements.find((m) => m.snomed_concept_id === item)
      if (measurement && !used_measurements.has(measurement.finding_id)) {
        ordered.push(measurement)
        used_measurements.add(measurement.finding_id)
      }
    }
  }

  // Add any remaining measurements that weren't in our predefined order
  for (const measurement of measurements) {
    if (!used_measurements.has(measurement.finding_id)) {
      ordered.push(measurement)
    }
  }

  return ordered
}

// Helper function to get display name for vital signs (using existing logic)
function getVitalDisplayName(snomed_concept_id: string): string {
  const vitalKey = Object.entries(VITALS_SNOMED_CODE).find(
    ([_, code]) => code === snomed_concept_id,
  )?.[0]

  if (!vitalKey) return `Measurement ${snomed_concept_id}`

  return vitalKey
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace('Bp', 'BP')
}

export default EncounterPage(VitalsEvaluationsPage)
