import { completeStep, ReviewContext, ReviewLayout } from './_middleware.tsx'
import { LoggedInHealthWorkerHandlerWithProps } from '../../../../../types.ts'
import FormButtons from '../../../../../islands/form/buttons.tsx'
import PatientPreExistingConditions from '../../../../../components/patients/intake/PreExistingConditionsForm.tsx'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import { assertOr400 } from '../../../../../util/assertOr.ts'

interface Condition {
  id: string
  name: string
  start_date: string
}

interface DiagnosisData {
  pre_existing_conditions: Condition[]
}

function assertIsDiagnoses(
  data: unknown
): asserts data is DiagnosisData {
  assertOr400(isObjectLike(data), 'Invalid form values')
  if (data.pre_existing_conditions !== undefined) {
    assertOr400(
        Array.isArray(data.pre_existing_conditions),
        'pre_existing_conditions must be an array',
    )
    for (const condition of data.pre_existing_conditions) {
        assertOr400(
        typeof condition.id === 'string',
        'Each condition must have an id of type string',
        )
    }
  }
}

export const handler: LoggedInHealthWorkerHandlerWithProps<
  unknown,
  ReviewContext['state']
> = {
  async POST(req, ctx: ReviewContext) {
    const data = await parseRequestAsserts(
      ctx.state.trx,
      req,
      assertIsDiagnoses,
    )
    console.log('data', data)

    const patient_condition_ids: string[] = []
    if (data.pre_existing_conditions && Array.isArray(data.pre_existing_conditions)) {
        for (const condition of data.pre_existing_conditions) {
          patient_condition_ids.push(condition.id);
        }
    }

    await ctx.state.trx
      .insertInto('diagnoses')
      .values({
        patient_condition_id: JSON.stringify(patient_condition_ids),
        provider_id: ctx.state.doctor_review.employment_id,
        doctor_reviews_id: ctx.state.doctor_review.review_id,
      })
      .execute()
    console.log('Diagnoses inserted successfully')

    const completing_step = completeStep(ctx)
    return completing_step
  }
}

// deno-lint-ignore require-await
export default async function DiagnosisPage(
  _req: Request,
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
