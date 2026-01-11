import { SelectWithOptions } from '../../islands/form/inputs/select_with_options.tsx'
import { Maybe, RenderedFindingRelativeToHealthWorker, VitalAssessmentFormInputDefition } from '../../types.ts'
import VitalsInputRow from './InputRow.tsx'

export default function DatabaseDrivenCategoricalInput(
  { assessment, most_recent_patient_finding, organization_id }: {
    assessment: VitalAssessmentFormInputDefition
    most_recent_patient_finding: Maybe<RenderedFindingRelativeToHealthWorker>
    organization_id: string
  },
) {
  const name = `assessments.${assessment.vital}`

  return (
    <VitalsInputRow
      name={name}
      required={assessment.required}
      most_recent_patient_finding={most_recent_patient_finding}
      label={assessment.vital}
      organization_id={organization_id}
      input_width='w-60'
      input={
        <>
          <SelectWithOptions
            id={name}
            name={`${name}.s_expression`}
            label={null}
            required={assessment.required}
            options={assessment.options.map((
              { label, s_expression },
            ) => ({
              label,
              value: s_expression,
            }))}
            blank_option='Select...'
          />
        </>
      }
    />
  )
}
