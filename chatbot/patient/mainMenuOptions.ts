import {
  ConversationStateHandlerSelectOption,
  PatientState,
} from '../../types.ts'

export default [
  {
    id: 'make_appointment',
    title: 'Make appointment',
    nextState: 'not_onboarded:make_appointment:enter_name' as const,
  },
  {
    id: 'find_nearest_facility',
    title: 'Find Nearest Clinic',
    nextState: 'find_nearest_facility:share_location' as const,
  },
] as ConversationStateHandlerSelectOption<PatientState>[]
