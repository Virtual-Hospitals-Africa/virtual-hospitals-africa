import { hasDemographicInfo } from '../../db/models/patients.ts'
import {
  ConversationStateHandlerSelectOption,
  PatientState,
} from '../../types.ts'

export default [
  {
    id: 'make_appointment',
    title: 'Make Appointment',
    nextState(patientState) {
      return hasDemographicInfo(patientState)
        ? 'onboarded:make_appointment:enter_appointment_reason' as const
        : 'not_onboarded:make_appointment:enter_name' as const
    },
  },
  {
    id: 'find_nearest_facility',
    title: 'Nearest Facility',
    nextState: 'find_nearest_facility:share_location' as const,
  },
] as ConversationStateHandlerSelectOption<PatientState>[]
