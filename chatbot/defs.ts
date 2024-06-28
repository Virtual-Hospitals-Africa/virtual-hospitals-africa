import { default as patient_conversation_states } from './patient/conversationStates.ts'
import { PHARMACIST_CONVERSATION_STATES } from './pharmacist/conversationStates.ts'
import {
  WHATSAPP_PATIENT_CHATBOT_NUMBER,
  WHATSAPP_PHARMACIST_CHATBOT_NUMBER,
} from './phone_numbers.ts'

export const patient = {
  chatbot_name: 'patient',
  phone_number: WHATSAPP_PATIENT_CHATBOT_NUMBER,
  conversation_states: patient_conversation_states,
}

export const pharmacist = {
  chatbot_name: 'pharmacist',
  phone_number: WHATSAPP_PHARMACIST_CHATBOT_NUMBER,
  conversation_states: PHARMACIST_CONVERSATION_STATES,
}
