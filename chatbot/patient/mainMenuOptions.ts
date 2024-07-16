import {
  ConversationStateHandlerSelectOption,
  PatientChatbotUserState,
} from '../../types.ts'

export default [
  {
    id: 'make_appointment',
    title: 'Make Appointment',
    onExit(_trx, patientState) {
      return patientState.chatbot_user.entity_id
        ? 'onboarded:make_appointment:enter_appointment_reason' as const
        : 'not_onboarded:make_appointment:enter_name' as const
    },
  },
  {
    id: 'find_nearest_organization',
    title: 'Nearest Organization',
    onExit: 'find_nearest_organization:share_location' as const,
  },
] as ConversationStateHandlerSelectOption<PatientChatbotUserState>[]
