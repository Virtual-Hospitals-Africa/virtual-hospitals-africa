import { Address, NurseRegistrationDetails, ReturnedSqlRow } from '../types.ts'
import generateUUID from '../util/uuid.ts'
import db from '../db/db.ts'
import * as address from '../db/models/address.ts'

export const testHealthWorker = () => {
  const expires_at = new Date()
  expires_at.setHours(expires_at.getHours() + 1)
  return {
    name: 'Test Health Worker',
    email: generateUUID() + '@example.com',
    avatar_url: generateUUID() + '.com',
    gcal_appointments_calendar_id: generateUUID() +
      '@appointments.calendar.google.com',
    gcal_availability_calendar_id: generateUUID() +
      '@availability.calendar.google.com',
    access_token: 'access.' + generateUUID(),
    refresh_token: 'refresh.' + generateUUID(),
    expires_in: 3599,
    expires_at,
  }
}

export function randomDigit() {
  return Math.floor(Math.random() * 10)
}

export function randomLetter() {
  return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]
}

export function randomNationalId() {
  return `${randomDigit()}${randomDigit()}-${randomDigit()}${randomDigit()}${randomDigit()}${randomDigit()}${randomDigit()}${randomDigit()}${randomDigit()} ${randomLetter()} ${randomDigit()}${randomDigit()}`
}

export const testRegistrationDetails = (
  { health_worker_id }: { health_worker_id: number },
): NurseRegistrationDetails => ({
  health_worker_id,
  gender: 'male',
  date_of_birth: '1979-12-12',
  national_id_number: randomNationalId(),
  date_of_first_practice: '1999-11-11',
  ncz_registration_number: 'GN123456',
  mobile_number: '1111',
  national_id_media_id: undefined,
  ncz_registration_card_media_id: undefined,
  face_picture_media_id: undefined,
  nurse_practicing_cert_media_id: undefined,
  approved_by: undefined,
  address_id: undefined,
})

export function testAddress(): Promise<ReturnedSqlRow<Address>> {
  return address.upsert(db, {
    street: '111 Ave Park',
    suburb_id: 4,
    ward_id: 1,
    district_id: 1,
    province_id: 1,
    country_id: 1,
  })
}
