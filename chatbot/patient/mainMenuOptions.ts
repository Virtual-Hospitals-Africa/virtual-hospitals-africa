import * as patients from '../../db/models/patients.ts'
import {
  ConversationStateHandlerSelectOption,
  PatientChatbotUserState,
} from '../../types.ts'

export default [
  {
    id: 'make_appointment',
    title: 'Make Appointment',
    async onExit(trx, userState) {
      const patient = await patients.getByID(trx, { id: userState.entity_id })
      return patients.hasDemographicInfo(patient)
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
