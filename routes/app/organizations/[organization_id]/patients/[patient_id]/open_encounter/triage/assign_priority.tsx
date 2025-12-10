// deno-lint-ignore-file no-explicit-any
import {
  completeAndProceedToNextStep,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import * as patient_evaluations from '../../../../../../../../db/models/patient_evaluations.ts'
import * as automated_evaluation from '../../../../../../../../db/models/automated_evaluation.ts'
import * as sats_triage_scoring from '../../../../../../../../db/models/sats_triage_scoring.ts'
import { getRequiredUUIDParam } from '../../../../../../../../util/getParam.ts'
import { postHandler } from '../../../../../../../../util/postHandler.ts'
import { VITALS_SNOMED_CODE } from '../../../../../../../../shared/vitals.ts'
import { getPriorityFromTEWSScore } from '../../../../../../../../shared/triage_sats.ts'
import { ReferenceRangeIndicator } from '../../../../../../../../components/vitals/SimpleReferenceRangeIndicator.tsx'
import Table, {
  TableColumn,
} from '../../../../../../../../components/library/Table.tsx'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'
import { JSX } from 'preact/jsx-runtime'

const TriageAssignPrioritySchema = z.object({})

export const handler = postHandler(
  TriageAssignPrioritySchema,
  // deno-lint-ignore require-await
  async (ctx: OpenEncounterWorkflowContext, _form_values) => {
    return completeAndProceedToNextStep(ctx)
  },
)

export async function TriageAssignPriorityPage(
  ctx: OpenEncounterWorkflowContext,
) {
  const patient_id = getRequiredUUIDParam(ctx, 'patient_id')

  const recent_measurements = await patient_evaluations
    .getMostRecentVitalsWithEvaluations(ctx.state.trx, {
      patient_id,
    })

  const measurement_snomed_codes = recent_measurements.map((m) =>
    m.snomed_concept_id
  )

  const height_measurement = recent_measurements.find(
    (m) => m.snomed_concept_id === VITALS_SNOMED_CODE.height,
  )
  const height_cm = height_measurement
    ? parseFloat(height_measurement.value_display)
    : null

  // Fetch data in parallel for optimal performance
  const { previous_measurements, reference_ranges, tews_result } =
    await promiseProps({
      previous_measurements: patient_evaluations.getPreviousVitalMeasurements(
        ctx.state.trx,
        {
          patient_id,
        },
      ),
      reference_ranges: automated_evaluation.getApplicableReferenceRanges(
        ctx.state.trx,
        {
          measurement_snomed_codes,
          patient_context: {
            age_days: ctx.state.patient.age_days ?? 0,
            gender: ctx.state.patient.gender,
          },
        },
      ),
      tews_result: sats_triage_scoring.calculateTEWSFromDatabase(
        ctx.state.trx,
        {
          patient_id,
          patient_encounter_id: ctx.state.encounter.patient_encounter_id,
          age_days: ctx.state.patient.age_days ?? null,
          height_cm,
        },
      ),
    })

  const all_findings_for_table: any[] = [...recent_measurements]

  const category_map: Record<string, { code: string; name: string }> = {
    consciousness: {
      code: VITALS_SNOMED_CODE.avpu_consciousness,
      name: 'Consciousness (AVPU)',
    },
    mobility: {
      code: VITALS_SNOMED_CODE.mobility_assessment,
      name: 'Mobility',
    },
    trauma: { code: VITALS_SNOMED_CODE.trauma_presence, name: 'Trauma' },
  }

  if (tews_result && tews_result.categorical_findings) {
    tews_result.categorical_findings.forEach((finding) => {
      const assessment_info = category_map[finding.category]
      // Ensure we have info for the category and that it's not already in the measurements list
      if (
        assessment_info &&
        !all_findings_for_table.some(
          (m) => m.snomed_concept_id === assessment_info.code,
        )
      ) {
        all_findings_for_table.push({
          finding_id: assessment_info.code, // Use a stable ID
          snomed_canonical_name: assessment_info.name,
          snomed_concept_id: assessment_info.code,
          value_display: finding.display_label,
        })
      }
    })
  }

  return (
    <TriageVitalsTable
      measurements={all_findings_for_table}
      reference_ranges={reference_ranges}
      previous_measurements={previous_measurements}
      tews={tews_result}
    />
  )
}

// Row type for triage vitals table
type VitalRow = {
  id: string
  vital_name: string
  vital_value: string
  previous: string
  vital_range_visualized: JSX.Element
  tews_score: string
  is_computed: boolean
  is_component_of_computed: boolean
  is_total_row?: boolean
  tews_total_score?: number
  priority_bg_color?: string
}

interface TriageVitalsTableProps {
  measurements: {
    is_computed: any
    is_component_of_computed: any
    vital_value: any
    previous: any
    vital_range_visualized: any
    tews_score: number | null
  }[]
  reference_ranges: readonly any[]
  previous_measurements: Map<string, string>
  tews: sats_triage_scoring.TEWSScore
}

// Helper to map SNOMED codes to categorical assessment categories
function getCategoryFromSnomedCode(snomedCode: string): string | null {
  if (snomedCode === VITALS_SNOMED_CODE.avpu_consciousness) {
    return 'consciousness'
  }
  if (snomedCode === VITALS_SNOMED_CODE.mobility_assessment) return 'mobility'
  if (snomedCode === VITALS_SNOMED_CODE.trauma_presence) return 'trauma'
  return null
}

function TriageVitalsTable({
  measurements,
  reference_ranges,
  previous_measurements,
  tews,
}: TriageVitalsTableProps) {
  const priority = getPriorityFromTEWSScore(tews.total_score)

  const rows: VitalRow[] = getOrderedMeasurementsForDisplay(measurements).map(
    (measurement) => {
      const range = reference_ranges.find(
        (r) =>
          r.measurement_snomed_concept_id === measurement.snomed_concept_id,
      )
      const value = parseFloat(measurement.value_display)

      const is_computed = isComputedVital(measurement.snomed_concept_id)
      const is_computed_of_computed = isComponentOfComputedVital(
        measurement.snomed_concept_id,
        measurements,
      )

      // Check if this is a categorical finding
      const categorical_finding = tews.categorical_findings.find(
        (f) =>
          f.category ===
            getCategoryFromSnomedCode(measurement.snomed_concept_id),
      )

      // Get display value - use categorical finding label if available
      let { value_display } = measurement
      if (categorical_finding) {
        value_display = categorical_finding.display_label
      }

      const previousDisplay = previous_measurements.get(
        measurement.snomed_concept_id,
      )

      const previousValue = previousDisplay
        ? parseFloat(previousDisplay)
        : undefined

      // Get individual TEWS score for this measurement
      let tews_score: number | null = null
      if (measurement.snomed_concept_id === VITALS_SNOMED_CODE.heart_rate) {
        tews_score = tews.components.heart_rate
      } else if (
        measurement.snomed_concept_id === VITALS_SNOMED_CODE.respiratory_rate
      ) {
        tews_score = tews.components.respiratory_rate
      } else if (
        measurement.snomed_concept_id ===
          VITALS_SNOMED_CODE.blood_pressure_systolic
      ) {
        tews_score = tews.components.systolic_bp
      } else if (
        measurement.snomed_concept_id === VITALS_SNOMED_CODE.temperature
      ) {
        tews_score = tews.components.temperature
      } else if (
        measurement.snomed_concept_id === VITALS_SNOMED_CODE.avpu_consciousness
      ) {
        tews_score = tews.components.consciousness
      } else if (
        measurement.snomed_concept_id === VITALS_SNOMED_CODE.mobility_assessment
      ) {
        tews_score = tews.components.mobility
      } else if (
        measurement.snomed_concept_id === VITALS_SNOMED_CODE.trauma_presence
      ) {
        tews_score = tews.components.trauma
      }

      // Build vital range visualized component
      let vital_range_visualized: JSX.Element
      if (categorical_finding) {
        vital_range_visualized = <span />
      } else if (range && !isNaN(value)) {
        vital_range_visualized = (
          <ReferenceRangeIndicator
            value={value}
            previousValue={previousValue}
            normal_min={range.normal_min}
            normal_max={range.normal_max}
            critical_min={range.critical_min}
            critical_max={range.critical_max}
            units={range.units}
          />
        )
      } else {
        vital_range_visualized = <span />
      }

      return {
        id: measurement.finding_id,
        vital_name: measurement.snomed_canonical_name,
        vital_value: value_display,
        previous: previousDisplay || '-',
        vital_range_visualized,
        tews_score: tews_score !== null ? tews_score.toString() : '',
        is_computed: is_computed,
        is_component_of_computed: is_computed_of_computed,
      }
    },
  )

  const columns: TableColumn<VitalRow>[] = [
    {
      label: 'Vital Name',
      type: 'content',
      data: (row) => (
        <div
          className={`whitespace-nowrap text-sm text-gray-900 ${
            row.is_computed ? 'font-bold' : 'font-normal'
          } ${row.is_component_of_computed ? 'pl-4' : ''}`}
        >
          {row.vital_name}
        </div>
      ),
    },
    {
      label: 'Vital Value',
      type: 'content',
      data: (row) => (
        <div className='whitespace-nowrap text-sm text-gray-900'>
          {row.vital_value}
        </div>
      ),
    },
    {
      label: 'Previous',
      type: 'content',
      data: (row) => (
        <div className='whitespace-nowrap text-sm text-gray-500'>
          {row.previous}
        </div>
      ),
    },
    {
      label: 'Vital Range Visualized',
      type: 'content',
      data: (row) => row.vital_range_visualized,
    },
    {
      label: 'TEWS',
      type: 'content',
      data: (row) => (
        <div className='whitespace-nowrap text-sm font-semibold text-gray-900 text-center'>
          {row.tews_score}
        </div>
      ),
    },
  ]

  return (
    <div className='relative'>
      <Table
        columns={columns}
        rows={rows}
        EmptyState={() => <div>No measurements available</div>}
      />
      <div
        className={`${priority.colors.bg} pt-7 pb-4 px-3 flex justify-between items-center -mt-4 -mx-[1px] -z-10 relative sm:rounded-b-lg`}
      >
        <div className='flex-1 text-center'>
          <span
            className={`text-xl ${priority.colors.text} font-bold uppercase`}
          >
            {priority.label}
          </span>
        </div>
        <div className='text-center'>
          <span className={`text-lg font-bold ${priority.colors.text}`}>
            Total: {tews.total_score}
          </span>
        </div>
      </div>
    </div>
  )
}

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
    return all_measurements.some(
      (m) => m.snomed_concept_id === VITALS_SNOMED_CODE.body_mass_index,
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

  const display_order = [
    VITALS_SNOMED_CODE.avpu_consciousness,
    VITALS_SNOMED_CODE.mobility_assessment,
    VITALS_SNOMED_CODE.trauma_presence,
    {
      computed: VITALS_SNOMED_CODE.body_mass_index,
      components: [VITALS_SNOMED_CODE.height, VITALS_SNOMED_CODE.weight],
    },
    {
      computed: VITALS_SNOMED_CODE.blood_pressure,
      components: [
        VITALS_SNOMED_CODE.blood_pressure_systolic,
        VITALS_SNOMED_CODE.blood_pressure_diastolic,
      ],
    },
    {
      computed: VITALS_SNOMED_CODE.mean_arterial_pressure,
      components: [],
    },
    VITALS_SNOMED_CODE.temperature,
    VITALS_SNOMED_CODE.heart_rate,
    VITALS_SNOMED_CODE.respiratory_rate,
    VITALS_SNOMED_CODE.blood_oxygen_saturation,
    VITALS_SNOMED_CODE.blood_glucose,
    // VITALS_SNOMED_CODE.head_circumference,
    VITALS_SNOMED_CODE.midarm_circumference,
    VITALS_SNOMED_CODE.triceps_skinfold,
  ]

  for (const item of display_order) {
    if (typeof item === 'object') {
      const computed_measurement = measurements.find(
        (m) => m.snomed_concept_id === item.computed,
      )

      if (computed_measurement) {
        ordered.push(computed_measurement)
        used_measurements.add(computed_measurement.finding_id)

        for (const component_code of item.components) {
          const component_measurement = measurements.find(
            (m) => m.snomed_concept_id === component_code,
          )
          if (component_measurement) {
            ordered.push(component_measurement)
            used_measurements.add(component_measurement.finding_id)
          }
        }
      }
    } else {
      const measurement = measurements.find(
        (m) => m.snomed_concept_id === item,
      )
      if (measurement && !used_measurements.has(measurement.finding_id)) {
        ordered.push(measurement)
        used_measurements.add(measurement.finding_id)
      }
    }
  }

  for (const measurement of measurements) {
    if (!used_measurements.has(measurement.finding_id)) {
      ordered.push(measurement)
    }
  }

  return ordered
}

export default OpenEncounterWorkflowPage(TriageAssignPriorityPage)
