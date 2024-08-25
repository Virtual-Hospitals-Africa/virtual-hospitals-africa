import { completeStep, ReviewContext, ReviewLayout } from './_middleware.tsx'
import { LoggedInHealthWorkerHandlerWithProps } from '../../../../../types.ts'
import FormButtons from '../../../../../islands/form/buttons.tsx'
import PatientPreExistingConditions from '../../../../../components/patients/intake/PreExistingConditionsForm.tsx'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'

interface DiagnosisData {
  patient_condition_id: string
  provider_id: string
  doctor_reviews_id: string
}

// deno-lint-ignore no-explicit-any
function assertIsDiagnoses(_arg: unknown): _arg is any {
  const data = _arg as DiagnosisData
  return (
    typeof data.patient_condition_id === 'string' &&
    typeof data.provider_id === 'string' &&
    typeof data.doctor_reviews_id === 'string'
  )
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

    const provider = await ctx.state.trx
      .selectFrom('patient_encounter_providers')
      .select('provider_id')
      .where(
        'id',
        '=',
        ctx.state.doctor_review.requested_by.patient_encounter_provider_id,
      )
      .executeTakeFirst()

    if (!provider) {
      throw new Error('Provider not found')
    }

    const patient_condition = await ctx.state.trx
      .selectFrom('patient_conditions')
      .select('id')
      .where('patient_id', '=', ctx.state.doctor_review.patient.id)
      .executeTakeFirst()

    if (!patient_condition) {
      throw new Error('patient_condition not found')
    }

    await ctx.state.trx
      .insertInto('diagnosis')
      .values({
        patient_condition_id: patient_condition.id,
        provider_id: provider.provider_id,
        doctor_reviews_id: ctx.state.doctor_review.review_id,
      })
      .execute()
    console.log('Diagnosis inserted successfully')

    const completing_step = completeStep(ctx)
    return completing_step
  },
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
