import { PatientState, TrxOrDb } from '../../types.ts'
import * as patients from '../../db/models/patients.ts'
import pick from '../../util/pick.ts'

export const pickPatient = pick([
  'id',
  'phone_number',
  'name',
  'gender',
  'national_id_number',
  'conversation_state',
  'location',
])

export const updatePatientState = (trx: TrxOrDb, patientState: PatientState) =>
  patients.upsert(trx, pickPatient(patientState))
