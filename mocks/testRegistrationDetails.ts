import { NurseRegistrationDetails, TrxOrDb } from '../types.ts'
import randomNationalId from './randomNationalId.ts'
import randomDigits from './randomDigits.ts'
import randomPhoneNumber from './randomPhoneNumber.ts'
import insertTestAddress from './insertTestAddress.ts'

export default async function testRegistrationDetails(
  trx: TrxOrDb,
  { health_worker_id }: { health_worker_id: string },
): Promise<NurseRegistrationDetails> {
  return {
    health_worker_id,
    gender: 'male',
    date_of_birth: '1979-12-12',
    national_id_number: randomNationalId('ZA'),
    date_of_first_practice: '1999-11-11',
    ncz_registration_number: 'GN' + randomDigits(6),
    mobile_number: randomPhoneNumber(),
    national_id_media_id: undefined,
    ncz_registration_card_media_id: undefined,
    face_picture_media_id: undefined,
    nurse_practicing_cert_media_id: undefined,
    approved_by: null,
    address_id: (await insertTestAddress(trx)).id,
  }
}
