import { completeStep, ReviewContext, ReviewLayout } from './_middleware.tsx'
import { LoggedInHealthWorkerHandlerWithProps } from '../../../../../types.ts'
import FormButtons from '../../../../../islands/form/buttons.tsx'
import DiagnosesConditions from '../../../../../components/patients/review/ConditionsForm.tsx'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import { assertOr400 } from '../../../../../util/assertOr.ts'
import { getRequiredUUIDParam } from '../../../../../util/getParam.ts'
import * as patient_conditions from '../../../../../db/models/patient_conditions.ts'

type Condition = {
  id: string
  name: string
  start_date: string
}

type DiagnosisData = {
  pre_existing_conditions: Condition[]
}

function assertIsDiagnoses(
  data: unknown,
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
    console.log('data::', data)
    const diagnoses = data.pre_existing_conditions || []

    const patient_id = getRequiredUUIDParam(ctx, 'patient_id')
    const provider_id = ctx.state.doctor_review.employment_id
    const doctor_reviews_id = ctx.state.doctor_review.review_id
    console.log('diagnoses::', diagnoses)

    /*
    // @Alice @Qiyuan
    data currently looks like this. Please modify the frontend so that the field name is `diagnoses` instead of `pre_existing_conditions`
    remove allergies as a form field from the frontend
    remove medications and comoorbidity as form fields from the frontend
    pre_existing_conditions: [
      { name: "Hyperosmolality", id: "c_8801", start_date: "2020-04-04" }
    ]
    */
    // Insert the patient conditions here,
    // Then insert the diagnoses pointing to those
    // Move all of this into model functions

    await patient_conditions.upsertDiagnoses(
      ctx.state.trx,
      patient_id,
      diagnoses,
      provider_id,
      doctor_reviews_id,
    )

    const completing_step = completeStep(ctx)
    return completing_step
  },
}

export default async function DiagnosisPage(
  _req: Request,
  ctx: ReviewContext,
) {
  console.log('params', ctx.params)
  console.log('state', ctx.state)
  /*
    @Alice @Qiyuan
    Load any diagnoses from this review and pass them to the PatientPreExistingConditions component
  */
  const patient_id = getRequiredUUIDParam(ctx, 'patient_id')
  const { trx } = ctx.state
  const getting_pre_existing_conditions = patient_conditions
    .getPreExistingConditionsWithDrugs(
      trx,
      { patient_id },
    )

  return (
    <ReviewLayout ctx={ctx}>
      <DiagnosesConditions
        diagnoses={await getting_pre_existing_conditions}
      />
      <FormButtons />
    </ReviewLayout>
  )
}
