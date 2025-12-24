import { Maybe, MostRecentVitalMeasurement } from '../../types.ts'
import capitalize from '../../util/capitalize.ts'
import { Label } from '../../components/library/Label.tsx'
import { LocalTime } from '../../islands/LocalTime.tsx'
import { SelectWithOptions } from '../../islands/form/inputs/select_with_options.tsx'
import { AssessmentForForm } from '../../db/models/patient_categorical_findings.ts'

export default function DatabaseDrivenCategoricalInput({
  assessment,
  most_recent_patient_finding,
}: {
  assessment: AssessmentForForm
  most_recent_patient_finding: Maybe<MostRecentVitalMeasurement>
}) {
  const name = `assessments.${assessment.vital}`

  const options = assessment.options.map((opt) => ({
    value: opt.option_snomed_concept_id,
    label: opt.display_label,
  }))

  return (
    <div className='flex justify-between w-full'>
      <div className='flex flex-col'>
        <Label label={capitalize(assessment.vital)} htmlFor={name} />
        {most_recent_patient_finding && (
          <div className='flex text-gray-500'>
            <a href='#' className='text-blue-500'>
              {most_recent_patient_finding.value_display}
            </a>
            &nbsp;
            <LocalTime
              timestamp={most_recent_patient_finding.created_at}
              expected_time_range='past'
            />
          </div>
        )}
      </div>
      <div className='min-w-60 max-w-60 flex items-center'>
        <SelectWithOptions
          id={name}
          name={`${name}.value_snomed_concept_id`}
          label={null}
          required={assessment.required_for_triage}
          options={options}
          blank_option='Select...'
        />
      </div>
    </div>
  )
}
