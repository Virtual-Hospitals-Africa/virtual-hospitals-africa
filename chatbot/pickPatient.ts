import { UnhandledPatientMessage } from '../types.ts'

export default function pickPatient(patientMessage: UnhandledPatientMessage) {
  return {
    id: patientMessage.patient_id,
    phone_number: patientMessage.phone_number,
    name: patientMessage.name,
    gender: patientMessage.gender,
    date_of_birth: patientMessage.date_of_birth,
    national_id_number: patientMessage.national_id_number,
    conversation_state: patientMessage.conversation_state,
  }
}
