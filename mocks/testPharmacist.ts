import generateUUID from '../util/uuid.ts'

export default function testPharmacist() {
  return {
    licence_number: 'P01-0805-2024',
    prefix: 'Mrs' as const,
    first_names: `A Test Given Name ${generateUUID()}`,
    surname: `A Test Family Name ${generateUUID()}`,
    address: 'Test Address',
    town: 'Test Town',
    expiry_date: '2030-01-01',
    pharmacist_type: 'Pharmacist' as const,
    country: 'ZW',
  }
}
