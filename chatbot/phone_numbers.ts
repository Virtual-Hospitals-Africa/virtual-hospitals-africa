export const WHATSAPP_PATIENT_CHATBOT_NUMBER = '263784010987'
export const WHATSAPP_PHARMACIST_CHATBOT_NUMBER = '263712093355'

export const phoneToChatbotName = {
  [WHATSAPP_PATIENT_CHATBOT_NUMBER]: 'patient' as const,
  [WHATSAPP_PHARMACIST_CHATBOT_NUMBER]: 'pharmacist' as const,
}

export const chatbotToPhone = {
  'patient': WHATSAPP_PATIENT_CHATBOT_NUMBER,
  'pharmacist': WHATSAPP_PHARMACIST_CHATBOT_NUMBER,
}
