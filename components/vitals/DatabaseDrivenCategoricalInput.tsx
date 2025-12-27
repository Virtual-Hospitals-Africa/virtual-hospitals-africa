import {
  Maybe,
  RenderedFindingRelativeToHealthWorker,
  VitalAssessmentFormInputDefition,
} from '../../types.ts'
import capitalize from '../../util/capitalize.ts'
import { Label } from '../../components/library/Label.tsx'
import { SelectWithOptions } from '../../islands/form/inputs/select_with_options.tsx'
import { LabelSpan } from '../../islands/form/inputs/labelled.tsx'
import { MostRecentFinding } from '../library/MostRecentFinding.tsx'

export default function DatabaseDrivenCategoricalInput({
  assessment,
  most_recent_patient_finding,
  organization_id,
}: {
  assessment: VitalAssessmentFormInputDefition
  most_recent_patient_finding: Maybe<RenderedFindingRelativeToHealthWorker>
  organization_id: string
}) {
  const name = `assessments.${assessment.vital}`

  const options = assessment.options.map(({ label, snomed_concept_id }) => ({
    label,
    value: snomed_concept_id,
  }))

  return (
    <div className='flex justify-between w-full'>
      <div className='flex flex-col'>
        <Label htmlFor={name}>
          <LabelSpan
            required={assessment.required}
            label={capitalize(assessment.vital)}
          />
        </Label>
        <MostRecentFinding
          finding={most_recent_patient_finding}
          organization_id={organization_id}
        />
      </div>
      <div className='min-w-60 max-w-60 flex items-center'>
        <SelectWithOptions
          id={name}
          name={`${name}.value_snomed_concept_id`}
          label={null}
          required={assessment.required}
          options={options}
          blank_option='Select...'
        />
      </div>
    </div>
  )
}
