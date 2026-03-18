export const TRIAGE_ROUTE_PATIENT_NEXT_STEPS = [
  'await_consultation' as const,
  'hand_over' as const,
  'stabilize_patient' as const,
  'come_back_later' as const,
]

export type TriageRoutePatientNextStep = typeof TRIAGE_ROUTE_PATIENT_NEXT_STEPS[number]
