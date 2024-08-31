import { completeStep, ReviewContext, ReviewLayout } from './_middleware.tsx'
import {
  Diagnosis,
  LoggedInHealthWorkerHandlerWithProps,
} from '../../../../../types.ts'
import FormButtons from '../../../../../islands/form/buttons.tsx'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import { assertOr400 } from '../../../../../util/assertOr.ts'
import { getRequiredUUIDParam } from '../../../../../util/getParam.ts'
import * as diagnoses from '../../../../../db/models/diagnoses.ts'
import FormSection from '../../../../../components/library/FormSection.tsx'
import DiagnosesForm from '../../../../../islands/diagnoses/Form.tsx'

type DiagnosisData = {
  diagnoses: Diagnosis[]
}

function assertIsDiagnoses(
  data: unknown,
): asserts data is DiagnosisData {
  assertOr400(isObjectLike(data), 'Invalid form values')
  if (data.diagnoses !== undefined) {
    assertOr400(
      Array.isArray(data.diagnoses),
      'diagnoses must be an array',
    )
    for (const diagnosis of data.diagnoses) {
      assertOr400(
        typeof diagnosis.id === 'string',
        'Each diagnosis must have an id of type string',
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
    const diagnosesData = data.diagnoses || []

    const patient_id = getRequiredUUIDParam(ctx, 'patient_id')
    const provider_id = ctx.state.doctor_review.employment_id
    const doctor_reviews_id = ctx.state.doctor_review.review_id
    console.log('diagnosesData::', diagnosesData)

    const diagnosesDataFormatted = diagnosesData.map((diagnosis) => ({
      condition_id: diagnosis.id,
      start_date: diagnosis.start_date,
    }))
    console.log('diagnosesDataFormatted::', diagnosesDataFormatted)

    /*
    // @Alice @Qiyuan
    data currently looks like this. Please modify the frontend so that the field name is `diagnoses` instead of `diagnoses`
    remove allergies as a form field from the frontend
    remove medications and comoorbidity as form fields from the frontend
    diagnoses: [
      { name: "Hyperosmolality", id: "c_8801", start_date: "2020-04-04" }
    ]
    */
    // Insert the patient conditions here,
    // Then insert the diagnoses pointing to those
    // Move all of this into model functions
    if (diagnosesDataFormatted.length === 0) {
      await diagnoses.deleteDiagnoses(
        ctx.state.trx,
        {
          patient_id,
          doctor_reviews_id,
        },
      )
    } else {
      await diagnoses.upsert(
        ctx.state.trx,
        {
          patient_id,
          diagnoses: diagnosesDataFormatted,
          provider_id,
          doctor_reviews_id,
        },
      )
    }

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
  const patient_diagnoses = await diagnoses.getFromActiveReview(trx, {
    patient_id,
  })

  return (
    <ReviewLayout ctx={ctx}>
      <FormSection header='Diagnoses'>
        <DiagnosesForm diagnoses={patient_diagnoses} />
      </FormSection>
      <FormButtons />
    </ReviewLayout>
  )
}
