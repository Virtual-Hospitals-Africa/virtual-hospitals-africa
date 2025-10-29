import { Names, NurseRegistrationDetails, TrxOrDb } from '../types.ts'
import insertTestAddress from './insertTestAddress.ts'
import randomDemographics from './randomDemographics.ts'
import randomDigits from './randomDigits.ts'
import randomPhoneNumber from './randomPhoneNumber.ts'

export async function testNurseRegistrationDetails(
  trx: TrxOrDb,
  { health_worker_id }: { health_worker_id: string },
): Promise<NurseRegistrationDetails & Names> {
  return {
    health_worker_id,
    ...randomDemographics(),
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
