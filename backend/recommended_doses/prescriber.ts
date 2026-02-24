import { type Prescriber } from './shared.ts'

const KNOWN_PRESCRIBERS = new Set<Prescriber>([
  'Dentist, Dental therapist',
  'Dentist',
  'Doctor prescribed',
  'Doctor',
  'Doctor/Nurse',
  'Nurse',
  'Specialist advice',
  'Specialist consultation',
  'Specialist initiated',
  'Specialist prescribed',
  'Specialist supervision',
  'Specialist',
  'Specialist/subspecialist supervision',
  'Subspecialist initiated',
  'Subspecialist supervision',
])

export function parsePrescriber(raw: string | null): Prescriber | null {
  if (!raw) return null
  if (raw.toLowerCase() === 'n/a') return null
  const trimmed = raw as Prescriber
  if (KNOWN_PRESCRIBERS.has(trimmed)) return trimmed
  for (const known of KNOWN_PRESCRIBERS) {
    if (trimmed.toLowerCase().startsWith(known.toLowerCase())) return known
  }
  throw new Error(`could not parse ${raw}`)
}
