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
