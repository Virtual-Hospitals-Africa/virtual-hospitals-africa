import { Priority, RenderedVitalMeasurement } from '../../types.ts'
import VitalInputWithEvaluation from './VitalInputWithEvaluation.tsx'

export function VitalsEvaluationsForm({
  measurements,
}: {
  measurements: (RenderedVitalMeasurement & {
    finding_type: 'manual' | 'computed'
    evaluation?: {
      evaluation_id: string
      evaluates_record_id: string
      priority?: Priority
      note: string | null
      snomed_concept_id: string
    }
  })[]
}) {
  const manual_measurements = measurements.filter(
    (m) => m.finding_type === 'manual',
  )
  const computed_measurements = measurements.filter(
    (m) => m.finding_type === 'computed',
  )

  return (
    <div className='flex flex-col max-h-screen overflow-y-auto'>
      <div className='flex-shrink-0 mb-4'>
        <h2 className='text-lg font-semibold text-gray-900'>
          Clinical Evaluation
        </h2>
        <p className='text-sm text-gray-600 mt-1'>
          Review all measurements and add clinical notes or priority flags as
          needed.
        </p>
      </div>

      <div className='flex-1 overflow-y-auto'>
        <div className='flex flex-col space-y-4'>
          {computed_measurements.length > 0 && (
            <div className='space-y-4'>
              {computed_measurements.map((measurement) => (
                <VitalInputWithEvaluation
                  key={measurement.record_id}
                  measurement={measurement}
                  computed
                  existingEvaluation={measurement.evaluation}
                />
              ))}
            </div>
          )}
          {manual_measurements.length > 0 && (
            <div className='space-y-4'>
              {manual_measurements.map((measurement) => (
                <VitalInputWithEvaluation
                  key={measurement.record_id}
                  measurement={measurement}
                  computed={false}
                  existingEvaluation={measurement.evaluation}
                />
              ))}
            </div>
          )}

          {measurements.length === 0 && (
            <div className='text-center py-8'>
              <p className='text-gray-500'>
                No vital signs have been recorded for this encounter.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
