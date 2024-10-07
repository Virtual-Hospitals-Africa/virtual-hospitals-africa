import {
  completeStep,
  EncounterContext,
  EncounterPage,
  EncounterPageChildProps,
} from './_middleware.tsx'
import { LoggedInHealthWorkerHandlerWithProps } from '../../../../../../types.ts'
import FormSection from '../../../../../../components/library/FormSection.tsx'
import DiagnosesForm from '../../../../../../islands/diagnoses/Form.tsx'

export const handler: LoggedInHealthWorkerHandlerWithProps<
  unknown,
  EncounterContext['state']
> = {
  // deno-lint-ignore require-await
  async POST(_req, ctx: EncounterContext) {
    const completing_step = completeStep(ctx)
    return completing_step
  },
}

export default EncounterPage(
  function DiagnosisPage(
    _props: EncounterPageChildProps,
  ) {
    return (
      <FormSection header='Diagnoses'>
        <DiagnosesForm diagnoses={[]} />
      </FormSection>
    )
  },
)
