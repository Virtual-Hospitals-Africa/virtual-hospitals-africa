import { completeStep, ReviewContext, ReviewLayout } from './_middleware.tsx'
import {
  Diagnosis,
  LoggedInHealthWorkerHandlerWithProps,
} from '../../../../../types.ts'
import FormButtons from '../../../../../islands/form/buttons.tsx'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import { assertOr400 } from '../../../../../util/assertOr.ts'
import * as diagnoses from '../../../../../db/models/diagnoses.ts'
import * as patient_symptoms from '../../../../../db/models/patient_symptoms.ts'
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

    const patient_diagnoses = (data.diagnoses || []).map((d) => ({
      condition_id: d.id,
      start_date: d.start_date,
    }))

    await diagnoses.upsertForReview(
      ctx.state.trx,
      {
        review: ctx.state.doctor_review,
        diagnoses: patient_diagnoses,
      },
    )

    const completing_step = completeStep(ctx)
    return completing_step
  },
}

export default async function DiagnosisPage(
  _req: Request,
  ctx: ReviewContext,
) {
  const { trx, doctor_review: { review_id } } = ctx.state
  const patient_diagnoses = await diagnoses.getFromReview(trx, { review_id })

  const symptoms = await patient_symptoms.getEncounter(trx, {
    encounter_id: ctx.state.doctor_review.encounter.id,
    patient_id: ctx.state.doctor_review.patient.id,
  })
  const symptom_start_dates = symptoms.map((s) => s.start_date)
  const earliest_date = symptom_start_dates.reduce((earliest, current) => {
    return current < earliest ? current : earliest
  })

  return (
    <ReviewLayout ctx={ctx}>
      <FormSection header='Diagnoses'>
        <DiagnosesForm
          diagnoses={patient_diagnoses}
          earliestSymptomDate={earliest_date}
        />
      </FormSection>
      <FormButtons />
    </ReviewLayout>
  )
}
