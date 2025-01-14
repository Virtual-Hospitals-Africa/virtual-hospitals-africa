import * as diagnoses from '../../../../../db/models/diagnoses.ts'
import * as prescriptions from '../../../../../db/models/prescriptions.ts'
import { completeStep, ReviewContext, ReviewLayout } from './_middleware.tsx'
import { LoggedInHealthWorkerHandlerWithProps } from '../../../../../types.ts'
import FormButtons from '../../../../../islands/form/buttons.tsx'
import { promiseProps } from '../../../../../util/promiseProps.ts'
import { assertAllUniqueBy } from '../../../../../util/assertAllUniqueBy.ts'
import PrescriptionsForm from '../../../../../islands/prescriptions/Form.tsx'
import { parseRequest } from '../../../../../util/parseForm.ts'
import { assert } from 'std/assert/assert.ts'
import redirect from '../../../../../util/redirect.ts'
import { z } from 'zod'

const PrescriptionsSchema = z.object({
  prescriptions: z.record(
    z.object({
      patient_condition_id: z.string().uuid(),
      route: z.string(),
      strength: z.number(),
      special_instructions: z.string().optional(),
      schedules: z.object({
        dosage: z.number(),
        frequency: z.enum([
          'ac',
          'am',
          'bd',
          'nocte',
          'od',
          'pm',
          'q15',
          'q30',
          'q1h',
          'q2h',
          'q4h',
          'q6h',
          'q8h',
          'qd',
          'qid',
          'qod',
          'qs',
          'mane',
          'qmane',
          'qn',
          'stat',
          'tds',
          'q24h',
          'q30h',
          'q48h',
          'q72h',
          'hs',
          'qhs',
          'qw',
          'bw',
          'tw',
          'qm',
          'bm',
          'tm',
          'prn',
        ]),
        duration: z.number(),
        duration_unit: z.enum([
          'days',
          'weeks',
          'months',
          'years',
        ]),
      }).array(),
    }),
  ).default({}),
})

async function addPrescription(
  ctx: ReviewContext,
  form_values: z.infer<typeof PrescriptionsSchema>,
) {
  const prescribing = Object.entries(form_values.prescriptions).map(
    (
      [
        medication_id,
        medication,
      ],
    ) => ({
      medication_id,
      ...medication,
    }),
  )

  if (!prescribing.length) return

  const { id } = await prescriptions.upsert(ctx.state.trx, {
    doctor_review_id: ctx.state.doctor_review.review_id,
    prescriber_id: ctx.state.doctor_review.employment_id,
    patient_id: ctx.state.doctor_review.patient.id,
    prescribing,
  })

  const prescription = await prescriptions.getById(
    ctx.state.trx,
    id,
  )
  assert(prescription)
  return encodeURIComponent(
    `A prescription was made with code ${prescription.alphanumeric_code}`,
  )
}

export const handler: LoggedInHealthWorkerHandlerWithProps<
  unknown,
  ReviewContext['state']
> = {
  async POST(req, ctx: ReviewContext) {
    const form_values = await parseRequest(
      ctx.state.trx,
      req,
      PrescriptionsSchema.parse,
    )

    const { completed_step, prescription_success_message } = await promiseProps(
      {
        completed_step: await completeStep(ctx),
        prescription_success_message: addPrescription(ctx, form_values),
      },
    )

    if (!prescription_success_message) {
      return completed_step
    }

    const Location = completed_step.headers.get('Location')
    assert(Location)
    return redirect(`${Location}?success=${prescription_success_message}`)
  },
}

export default async function PrescriptionsPage(
  _req: Request,
  ctx: ReviewContext,
) {
  const { trx, doctor_review: { review_id } } = ctx.state
  const { patient_diagnoses, patient_prescription } = await promiseProps({
    patient_diagnoses: diagnoses.getFromReview(trx, {
      review_id,
      employment_id: ctx.state.doctor_review.employment_id,
      encounter_id: ctx.state.doctor_review.encounter.id,
    }),
    patient_prescription: prescriptions.getFromReview(trx, { review_id }),
  })

  const medications = patient_prescription?.medications || []

  assertAllUniqueBy(medications, 'medication_id')

  return (
    <ReviewLayout ctx={ctx}>
      <PrescriptionsForm
        medications={medications}
        diagnoses={patient_diagnoses.approved_by_self}
      />
      <FormButtons />
    </ReviewLayout>
  )
}
