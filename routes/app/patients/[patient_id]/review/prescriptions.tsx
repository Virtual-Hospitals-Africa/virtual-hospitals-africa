import * as diagnoses from '../../../../../db/models/diagnoses.ts'
import * as prescriptions from '../../../../../db/models/prescriptions.ts'
import { completeStep, ReviewContext, ReviewLayout } from './_middleware.tsx'
import {
  LoggedInHealthWorkerHandlerWithProps,
  MedicationSchedule,
} from '../../../../../types.ts'
import FormButtons from '../../../../../islands/form/buttons.tsx'
import { promiseProps } from '../../../../../util/promiseProps.ts'
import { assertAllUniqueBy } from '../../../../../util/assertAllUniqueBy.ts'
import PrescriptionsForm from '../../../../../islands/prescriptions/Form.tsx'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import { assertOr400 } from '../../../../../util/assertOr.ts'
import { isUUID } from '../../../../../util/uuid.ts'
import { isIntakeFrequency } from '../../../../../shared/medication.ts'
import { assert } from 'std/assert/assert.ts'
import redirect from '../../../../../util/redirect.ts'

type PrescriptionsFormValues = {
  prescriptions: {
    [medication_id: string]: {
      patient_condition_id: string
      route: string
      strength: number
      special_instructions?: string
      schedules: MedicationSchedule[]
    }
  }
}

function assertIsPrescriptions(
  value: unknown,
): asserts value is PrescriptionsFormValues {
  assertOr400(isObjectLike(value))
  assertOr400(isObjectLike(value.prescriptions))
  for (
    const [medication_id, prescription] of Object.entries(
      value.prescriptions,
    )
  ) {
    assertOr400(isUUID(medication_id))
    assertOr400(isObjectLike(prescription))
    assertOr400(typeof prescription.patient_condition_id === 'string')
    assertOr400(isUUID(prescription.patient_condition_id))
    assertOr400(typeof prescription.strength === 'number')
    assertOr400(Array.isArray(prescription.schedules))
    assertOr400(prescription.schedules.length > 0)
    for (const schedule of prescription.schedules) {
      assertOr400(isObjectLike(schedule))
      assertOr400(typeof schedule.dosage === 'number')
      assertOr400(typeof schedule.frequency === 'string')
      assertOr400(isIntakeFrequency(schedule.frequency))
      assertOr400(typeof schedule.duration === 'number')
      assertOr400(schedule.duration > 0)
      assertOr400(
        schedule.duration_unit === 'days' ||
          schedule.duration_unit === 'weeks' ||
          schedule.duration_unit === 'months' ||
          schedule.duration_unit === 'years',
      )
    }
  }
}

export const handler: LoggedInHealthWorkerHandlerWithProps<
  unknown,
  ReviewContext['state']
> = {
  async POST(req, ctx: ReviewContext) {
    const form_values = await parseRequestAsserts(
      ctx.state.trx,
      req,
      assertIsPrescriptions,
    )

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
    prescription.alphanumeric_code
    const completed_step = await completeStep(ctx)

    if (!prescribing.length) {
      return completed_step
    }

    const Location = completed_step.headers.get('Location')
    assert(Location)
    const success = encodeURIComponent(
      `A prescription was made with code ${prescription.alphanumeric_code}`,
    )
    return redirect(`${Location}?success=${success}`)
  },
}

export default async function PrescriptionsPage(
  _req: Request,
  ctx: ReviewContext,
) {
  console.log('ctx', ctx)
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
        diagnoses={patient_diagnoses.self}
      />
      <FormButtons />
    </ReviewLayout>
  )
}
