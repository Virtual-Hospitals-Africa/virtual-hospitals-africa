import { completeStep, ReviewContext, ReviewLayout } from './_middleware.tsx'
import { LoggedInHealthWorkerHandlerWithProps } from '../../../../../types.ts'
import FormButtons from '../../../../../islands/form/buttons.tsx'
import PatientPreExistingConditions from '../../../../../components/patients/intake/PreExistingConditionsForm.tsx'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'

// deno-lint-ignore no-explicit-any
function assertIsDiagnoses(_arg: unknown): arg is any {
}

export const handler: LoggedInHealthWorkerHandlerWithProps<
  unknown,
  ReviewContext['state']
> = {
  // deno-lint-ignore require-await
  async POST(req, ctx: ReviewContext) {
    const data = await parseRequestAsserts(
      ctx.state.trx,
      req,
      assertIsDiagnoses,
    )
    console.log('data', data)
    const completing_step = completeStep(ctx)
    return completing_step
  },
}

// deno-lint-ignore require-await
export default async function DiagnosisPage(
  req: Request,
  ctx: ReviewContext,
) {
  console.log('params', ctx.params)
  console.log('state', ctx.state)

  return (
    <ReviewLayout ctx={ctx}>
      <PatientPreExistingConditions
        allergies={[]}
        patient_allergies={[]}
        pre_existing_conditions={[]}
      />

      <FormButtons />
    </ReviewLayout>
  )
}
