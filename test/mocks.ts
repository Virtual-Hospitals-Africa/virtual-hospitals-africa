import { NurseRegistrationDetails, TrxOrDb } from '../types.ts'
import generateUUID from '../util/uuid.ts'
// import sample from '../util/sample.ts'
// import * as address from '../db/models/address.ts'

export const testHealthWorker = () => {
  const expires_at = new Date()
  expires_at.setHours(expires_at.getHours() + 1)
  return {
    name: `Test Health Worker ${generateUUID()}`,
    email: generateUUID() + '@example.com',
    avatar_url: generateUUID() + '.com',
    access_token: 'access.' + generateUUID(),
    refresh_token: 'refresh.' + generateUUID(),
    expires_in: 3599,
    expires_at,
  }
}

export const testRegulator = () => {
  return {
    name: `Test Regulator ${generateUUID()}`,
    email: generateUUID() + '@example.com',
    avatar_url: generateUUID() + '.com',
  }
}

export const testPharmacist = () => ({
  licence_number: 'P01-0805-2024',
  prefix: 'Mrs' as const,
  given_name: `A Test Given Name ${generateUUID()}`,
  family_name: `A Test Family Name ${generateUUID()}`,
  address: 'Test Address',
  town: 'Test Town',
  expiry_date: '2030-01-01',
  pharmacist_type: 'Pharmacist' as const,
})

export const testCalendars = () => ({
  gcal_appointments_calendar_id: generateUUID() +
    '@appointments.calendar.google.com',
  gcal_availability_calendar_id: generateUUID() +
    '@availability.calendar.google.com',
})

export function randomDigit() {
  return Math.floor(Math.random() * 10)
}

export function randomDigits(length: number) {
  return Array.from({ length }, randomDigit).join('')
}

export function randomPhoneNumber() {
  return '263' + randomDigits(9)
}

export function randomLetter() {
  return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]
}

export function randomNationalId() {
  return `${randomDigits(2)}-${randomDigits(7)} ${randomLetter()} ${
    randomDigits(2)
  }`
}

// deno-lint-ignore require-await
export const testRegistrationDetails = async (
  _trx: TrxOrDb,
  { health_worker_id }: { health_worker_id: string },
): Promise<NurseRegistrationDetails> => ({
  health_worker_id,
  gender: 'male',
  birthDate: '1979-12-12',
  national_id_number: randomNationalId(),
  date_of_first_practice: '1999-11-11',
  ncz_registration_number: 'GN' + randomDigits(6),
  mobile_number: randomPhoneNumber(),
  national_id_media_id: undefined,
  ncz_registration_card_media_id: undefined,
  face_picture_media_id: undefined,
  nurse_practicing_cert_media_id: undefined,
  approved_by: null,
  // address_id: (await insertTestAddress(trx)).id,
})

// export async function createTestAddress(trx: TrxOrDb): Promise<Address> {
//   const fullCountryInfo = await address.getCountryAddressTree(trx)
//   const country = sample(fullCountryInfo)
//   const province = sample(country.provinces)
//   const district = sample(province.districts)
//   const ward = sample(district.wards)
//   const suburb = ward.suburbs.length ? sample(ward.suburbs) : null
//   const street = Math.random().toString(36).substring(7) + ' Main Street'
//   return {
//     street,
//     suburb_id: suburb?.id || null,
//     ward_id: ward.id,
//     district_id: district.id,
//     province_id: province.id,
//     country_id: country.id,
//   }
// }

// export async function insertTestAddress(
//   trx: TrxOrDb,
// ) {
//   return address.upsert(trx, await createTestAddress(trx))
// }
