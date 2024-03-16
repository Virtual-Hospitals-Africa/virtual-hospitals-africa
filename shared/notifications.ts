import { EmployedHealthWorker, RenderedNotification } from '../types.ts'

export function ofEmployedHealthWorker(
  health_worker: EmployedHealthWorker,
): RenderedNotification[] {
  return health_worker.reviews.requested.map((requested_review) => ({
    type: 'doctor_review_request',
    entity_id: requested_review.review_request_id,
    avatar_url: requested_review.requested_by.avatar_url,
    title: 'Review Requested',
    description:
      `${requested_review.requested_by.name} at ${requested_review.requested_by.facility.name} has requested that you review a recent encounter with ${requested_review.patient.name}`,
    // TODO: format time
    time_display: 'Just now',
    action: {
      title: 'Review',
      href:
        `/app/patients/${requested_review.patient.id}/review/clinical_notes`,
    },
  }))
}
