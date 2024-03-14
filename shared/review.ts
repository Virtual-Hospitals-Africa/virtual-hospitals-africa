import { DoctorReviewStep } from '../db.d.ts'

export const DOCTOR_REVIEW_STEPS: DoctorReviewStep[] = [
  'clinical_notes',
  'diagnosis',
  'prescriptions',
  'orders',
  'referral',
  'revert',
]

export function isDoctorReviewStep(value: unknown): value is DoctorReviewStep {
  return DOCTOR_REVIEW_STEPS.includes(value as DoctorReviewStep)
}
