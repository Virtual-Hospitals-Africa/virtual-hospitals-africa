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
import { RenderedFindingRelativeToHealthWorker } from '../../../../../../../../types.ts'
import {
  ALL_VITAL_SNOMED_CONCEPT_IDS,
  VITAL_ASSESSMENTS_SNOMED_CONCEPT_IDS,
  VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS,
  vitalFromSnomedConceptId,
  VITALS_COMPUTED_SNOMED_CONCEPT_IDS,
} from '../../../../../../../../shared/vitals.ts'
import { patient_vitals } from '../../../../../../../../db/models/patient_vitals.ts'
import { patient_findings } from '../../../../../../../../db/models/patient_findings.ts'
import { patient_triage_level } from '../../../../../../../../db/models/patient_triage.ts'
import { hydrateIntermediateRecords } from '../../../../../../../../db/models/patient_record_providers.ts'
import assertHasProperty from '../../../../../../../../util/assertHasProperty.ts'


const TriageAssignPrioritySchema = z.object({})

export const handler = postHandler(
  TriageAssignPrioritySchema,
  // deno-lint-ignore require-await
  async (ctx: OpenEncounterWorkflowContext, _form_values) => {
    return completeAndProceedToNextStep(ctx)
  },
)

type AssignPriorityTableProps = {
  vitals: {
    current: RenderedFindingRelativeToHealthWorker
    previous: RenderedFindingRelativeToHealthWorker | null
    reference_range: ReferenceRange
  }[]
}

export async function TriageAssignPriorityPage(
  ctx: OpenEncounterWorkflowContext,
) {
  const { trx, encounter, health_worker_id } = ctx.state
  
  // const findings_with_a_triage_level: RenderedFindingRelativeToHealthWorker[] = await patient_findings.getByIds(
  //   trx,
  //   patient_triage_level.distinctIds(
  //     trx, 
  //     {
  //       patient_id: ctx.state.patient.id,
  //       patient_encounter_id: ctx.state.encounter.patient_encounter_id,
  //       s_expression: '(evaluation (evaluates (finding)))'
  //     }
  //   )
  // ).then(findings =>
  //   hydrateIntermediateRecords(trx, {
  //     records: findings,
  //     health_worker_id,
  //     encounter,
  //   })
  // )

  // findings_with_a_triage_level.forEach(finding => assertHasProperty(finding, 'priority'))

  // console.log({ findings_with_a_triage_level })

  const vitals_this_encounter = await patient_vitals
    .getMostRecent(trx, {
      health_worker_id: ctx.state.health_worker.id,
      patient_id: ctx.state.patient.id,
      patient_encounter_id: ctx.state.encounter.patient_encounter_id,
      snomed_concept_ids: ALL_VITAL_SNOMED_CONCEPT_IDS,
    })


  const previous_vitals = await patient_vitals
    .getMostRecent(trx, {
      health_worker_id: ctx.state.health_worker.id,
      patient_id: ctx.state.patient.id,
      excluding_patient_encounter_id: ctx.state.encounter.patient_encounter_id,
      snomed_concept_ids: vitals_this_encounter.map(v => v.finding_snomed_concept_id),
    })




  return (
    <TriageVitalsTable
      measurements={recent_measurements}
      reference_ranges={reference_ranges}
      previous_measurements={previous_measurements}
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
      const value = parseFloat(measurement.full_display)

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
      let { full_display } = measurement
      if (categorical_finding) {
        full_display = categorical_finding.display_label
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
        vital_name: vitalFromSnomedConceptId(
          measurement.finding_snomed_concept_id,
        ),
        vital_value: full_display,
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

export default OpenEncounterWorkflowPage(TriageAssignPriorityPage)
