import {
  completeAndProceedToNextStep,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import * as automated_evaluation from '../../../../../../../../db/models/automated_evaluation.ts'
import * as sats_triage_scoring from '../../../../../../../../db/models/sats_triage_scoring.ts'
import { postHandler } from '../../../../../../../../util/postHandler.ts'
import { getPriorityFromTEWSScore } from '../../../../../../../../shared/triage_sats.ts'
import { ReferenceRangeIndicator } from '../../../../../../../../components/vitals/SimpleReferenceRangeIndicator.tsx'
import Table, {
  TableColumn,
} from '../../../../../../../../components/library/Table.tsx'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'
import { JSX } from 'preact/jsx-runtime'
import entries from '../../../../../../../../util/entries.ts'
import isKeyOf from '../../../../../../../../util/isKeyOf.ts'
import { ReferenceRange } from '../../../../../../../../db/models/automated_evaluation.ts'
import { RenderedFindingRelativeToHealthWorker, RenderedVitalMeasurement } from '../../../../../../../../types.ts'
import {
ALL_VITAL_SNOMED_CONCEPT_IDS,
  VITAL_ASSESSMENTS_SNOMED_CONCEPT_IDS,
  VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS,
  vitalFromSnomedConceptId,
  VITALS_COMPUTED_SNOMED_CONCEPT_IDS,
} from '../../../../../../../../shared/vitals.ts'
import { patient_vitals } from '../../../../../../../../db/models/patient_vitals.ts'

// Synthetic finding created for categorical assessments not in recent_measurements
type CategoricalAssessmentFinding = {
  record_id: string
  snomed_canonical_name: string
  snomed_concept_id: string
  value_display: string
}

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
  const recent_measurements = await patient_vitals
    .getMostRecent(ctx.state.trx, {
        health_worker_id: ctx.state.health_worker.id,
        patient_id: ctx.state.patient.id,
        snomed_concept_ids: ALL_VITAL_SNOMED_CONCEPT_IDS,
    })

  const measurement_snomed_codes = recent_measurements.map((m) =>
    m.snomed_concept_id
  )

  const height_measurement = ctx.state.patient.most_recent_height_cm_measurement

  // Fetch data in parallel for optimal performance
  const { previous_measurements, reference_ranges, tews_result } =
    await promiseProps({
      // TODO get this working again
      previous_measurements: Promise.resolve(new Map()),
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
          patient_id: ctx.state.patient.id,
          patient_encounter_id: ctx.state.encounter.patient_encounter_id,
          age_days: ctx.state.patient.age_days ?? null,
          height_cm: height_measurement ? parseFloat(height_measurement) : null,
        },
      ),
    })

  const category_map: Record<
    string,
    { snomed_concept_id: string; name: string }
  > = {
    consciousness: {
      snomed_concept_id: VITAL_ASSESSMENTS_SNOMED_CONCEPT_IDS.consciousness,
      name: 'Consciousness',
    },
    mobility: {
      snomed_concept_id:
        VITAL_ASSESSMENTS_SNOMED_CONCEPT_IDS.mobility_assessment,
      name: 'Mobility',
    },
    trauma: {
      snomed_concept_id: VITAL_ASSESSMENTS_SNOMED_CONCEPT_IDS.trauma_presence,
      name: 'Trauma',
    },
  }

  return (
    <TriageVitalsTable
      measurements={recent_measurements}
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
  measurements: RenderedFindingRelativeToHealthWorker[]
  reference_ranges: readonly ReferenceRange[]
  previous_measurements: Map<string, string>
  tews: sats_triage_scoring.TEWSScore
}

// Helper to map SNOMED codes to categorical assessment categories
function getCategoryFromSnomedCode(snomedCode: string): string | null {
  if (snomedCode === VITAL_ASSESSMENTS_SNOMED_CONCEPT_IDS.consciousness) {
    return 'consciousness'
  }
  if (snomedCode === VITAL_ASSESSMENTS_SNOMED_CONCEPT_IDS.mobility_assessment) {
    return 'mobility'
  }
  if (snomedCode === VITAL_ASSESSMENTS_SNOMED_CONCEPT_IDS.trauma_presence) {
    return 'trauma'
  }
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
      const is_component_of_computed = isComponentOfComputedVital(
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

      const previous_display = previous_measurements.get(
        measurement.snomed_concept_id,
      )

      const previous_value = previous_display
        ? parseFloat(previous_display)
        : undefined

      // Get individual TEWS score for this measurement
      let tews_score: number | null = null
      for (
        const [vital, snomed_concept_id] of entries(
          VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS,
        )
      ) {
        if (measurement.snomed_concept_id === snomed_concept_id) {
          if (isKeyOf(vital, tews.components)) {
            tews_score = tews.components[vital]
          }
          break
        }
      }

      // Build vital range visualized component
      let vital_range_visualized: JSX.Element
      if (categorical_finding) {
        vital_range_visualized = <span />
      } else if (range && !isNaN(value)) {
        vital_range_visualized = (
          <ReferenceRangeIndicator
            value={value}
            previous_value={previous_value}
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
        id: measurement.record_id,
        vital_name: vitalFromSnomedConceptId(measurement.finding_snomed_concept_id),
        vital_value: value_display,
        previous: previous_display || '-',
        vital_range_visualized,
        tews_score: tews_score !== null ? tews_score.toString() : '',
        is_computed: is_computed,
        is_component_of_computed: is_component_of_computed,
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
    VITALS_COMPUTED_SNOMED_CONCEPT_IDS.body_mass_index,
    VITALS_COMPUTED_SNOMED_CONCEPT_IDS.mean_arterial_pressure,
    VITALS_COMPUTED_SNOMED_CONCEPT_IDS.blood_pressure,
  ].includes(snomed_concept_id)
}

// Helper function to determine if a vital is a component of a computed vital
function isComponentOfComputedVital(
  snomed_concept_id: string,
  all_measurements: RenderedFindingRelativeToHealthWorker[],
): boolean {
  const bmi_components = [
    VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS.height,
    VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS.weight,
  ]
  const bp_components = [
    VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS.blood_pressure_systolic,
    VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS.blood_pressure_diastolic,
  ]

  // Check if this is a BMI component and BMI exists in measurements
  if (bmi_components.includes(snomed_concept_id)) {
    return all_measurements.some(
      (m) =>
        m.snomed_concept_id ===
          VITALS_COMPUTED_SNOMED_CONCEPT_IDS.body_mass_index,
    )
  }

  // Check if this is a BP component and BP or MAP exists in measurements
  if (bp_components.includes(snomed_concept_id)) {
    return all_measurements.some((m) =>
      [
        VITALS_COMPUTED_SNOMED_CONCEPT_IDS.blood_pressure,
        VITALS_COMPUTED_SNOMED_CONCEPT_IDS.mean_arterial_pressure,
      ].includes(m.snomed_concept_id)
    )
  }

  return false
}

// Helper function to order measurements for display
function getOrderedMeasurementsForDisplay(
  measurements: RenderedFindingRelativeToHealthWorker[],
): RenderedFindingRelativeToHealthWorker[] {
  const ordered: RenderedFindingRelativeToHealthWorker[] = []
  const used_measurements = new Set<string>()

  const display_order = [
    VITAL_ASSESSMENTS_SNOMED_CONCEPT_IDS.consciousness,
    VITAL_ASSESSMENTS_SNOMED_CONCEPT_IDS.mobility_assessment,
    VITAL_ASSESSMENTS_SNOMED_CONCEPT_IDS.trauma_presence,
    {
      computed: VITALS_COMPUTED_SNOMED_CONCEPT_IDS.body_mass_index,
      components: [
        VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS.height,
        VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS.weight,
      ],
    },
    {
      computed: VITALS_COMPUTED_SNOMED_CONCEPT_IDS.blood_pressure,
      components: [
        VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS.blood_pressure_systolic,
        VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS.blood_pressure_diastolic,
      ],
    },
    {
      computed: VITALS_COMPUTED_SNOMED_CONCEPT_IDS.mean_arterial_pressure,
      components: [],
    },
    VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS.temperature,
    VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS.heart_rate,
    VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS.respiratory_rate,
    VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS.blood_oxygen_saturation,
    VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS.blood_glucose,
    // VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS.head_circumference,
    VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS.midarm_circumference,
    VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS.triceps_skinfold,
  ]

  for (const item of display_order) {
    if (typeof item === 'object') {
      const computed_measurement = measurements.find(
        (m) => m.finding_snomed_concept_id === item.computed,
      )

      if (computed_measurement) {
        ordered.push(computed_measurement)
        used_measurements.add(computed_measurement.record_id)

        for (const component_code of item.components) {
          const component_measurement = measurements.find(
            (m) => m.finding_snomed_concept_id === component_code,
          )
          if (component_measurement) {
            ordered.push(component_measurement)
            used_measurements.add(component_measurement.record_id)
          }
        }
      }
    } else {
      const measurement = measurements.find(
        (m) => m.finding_snomed_concept_id === item,
      )
      if (measurement && !used_measurements.has(measurement.record_id)) {
        ordered.push(measurement)
        used_measurements.add(measurement.record_id)
      }
    }
  }

  for (const measurement of measurements) {
    if (!used_measurements.has(measurement.record_id)) {
      ordered.push(measurement)
    }
  }

  return ordered
}

export default OpenEncounterWorkflowPage(TriageAssignPriorityPage)
