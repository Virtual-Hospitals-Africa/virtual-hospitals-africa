import { COUNTRIES } from '../shared/countries.ts'
import { assert } from 'std/assert/assert.ts'

export default function generateUUID(): string {
  return crypto.randomUUID()
}

export function isUUID(uuid: unknown): uuid is string {
  if (typeof uuid !== 'string') {
    return false
  }
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    .test(uuid)
}

const COUNTRY_SET = new Set(COUNTRIES.map((c) => c.iso_3166_2))

function countryCodeToHex(country: string): string {
  assert(country.length === 2, `Country code must be 2 characters: ${country}`)
  const first = country.charCodeAt(0) - 64 // A=1, B=2, ..., Z=26
  const second = country.charCodeAt(1) - 64
  assert(first >= 1 && first <= 26, `Invalid first character in country code: ${country}`)
  assert(second >= 1 && second <= 26, `Invalid second character in country code: ${country}`)
  const value = first * 26 + second
  return value.toString(16).padStart(3, '0')
}

export function createPatientUUID(country: string): string {
  assert(COUNTRY_SET.has(country), `Invalid country code: ${country}`)
  const country_hex = countryCodeToHex(country)
  // Generate random UUID and extract random hex chars
  const random_uuid = crypto.randomUUID().replace(/-/g, '')
  // Positions 0-2: country code (3 chars)
  // Positions 3-11: random (9 chars)
  // Position 12: version, must be 1-8 (use from random UUID which guarantees this)
  // Positions 13-15: random (3 chars)
  // Position 16: variant, must be 8 for patient IDs
  // Positions 17-31: zeros (15 chars)
  const random_before_version = random_uuid.substring(0, 9)
  const version = random_uuid.charAt(12) // crypto.randomUUID generates valid version (4)
  const random_after_version = random_uuid.substring(13, 16)
  const hex = country_hex + random_before_version + version + random_after_version + '8' + '0'.repeat(15)
  // Format as UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}

export function createPatientEncounterUUID(patient_id: string): string {
  // Extract first 16 hex chars from patient_id (ignoring dashes)
  const patient_hex = patient_id.replace(/-/g, '').substring(0, 16)
  assert(patient_hex.length === 16, `Invalid patient_id: ${patient_id}`)
  // Generate remaining 16 chars
  const random_uuid = crypto.randomUUID().replace(/-/g, '')
  // Position 16 (first char of remaining) must be '9' for patient encounters
  const remaining = '9' + random_uuid.substring(1, 16)
  const hex = patient_hex + remaining
  // Format as UUID
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}

export function createPatientRecordUUID(patient_id: string): string {
  // Extract first 16 hex chars from patient_id (ignoring dashes)
  const patient_hex = patient_id.replace(/-/g, '').substring(0, 16)
  assert(patient_hex.length === 16, `Invalid patient_id: ${patient_id}`)
  // Generate remaining 16 chars
  const random_uuid = crypto.randomUUID().replace(/-/g, '')
  // Position 16 (first char of remaining) must be 'a' or 'b' for patient records
  const variant_options = ['a', 'b']
  const variant = variant_options[Math.floor(Math.random() * 2)]
  const remaining = variant + random_uuid.substring(1, 16)
  const hex = patient_hex + remaining
  // Format as UUID
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}
