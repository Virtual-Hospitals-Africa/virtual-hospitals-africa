import { TrxOrDb } from '../../types.ts'
import generateUUID from '../../util/uuid.ts'
import { Department } from '../../shared/departments.ts'
import { organizations } from '../../db/models/organizations.ts'
import { formatAddress } from '../../shared/addresses.ts'

export const TEST_ORGANIZATION_UUIDS = {
  ZA: {
    clinic: '00000000-0000-1000-8000-000000000001',
    hospital: '00000000-0000-1000-8000-000000000002',
  },
}

export function testOrganizationRoomNames(department: Department): string[] {
  switch (department) {
    case 'Primary care':
      return ['Primary care room 101', 'Primary care room 102']
    case 'Maternity':
      return ['Maternity room 1']
    case 'Immunizations':
      return ['Immunizations room 1']
    case 'Chronic diseases':
      return ['Chronic diseases room 1']
    case 'Reception':
      return ['Reception']
    case 'Oncology':
      return ['Oncology room 1']
    case 'Burns':
      return ['Burns room 1']
    case 'Remote care':
      return ['Remote care room 1']
    case 'Waiting room':
      return ['Waiting room']
    case 'Triage':
      return ['Triage room 1', 'Triage room 2']
    case 'Administration':
      return ['Administration']
    case 'Pharmacy':
      return ['Pharmacy']
    case 'Emergency':
      return ['Resuscitation area']
    default:
      throw new Error(`Unrecognized department ${department}`)
  }
}

export function testOrganizationDepartments(
  category: string,
): Department[] {
  return category === 'Clinic'
    ? [
      'Primary care' as const,
      'Maternity' as const,
      'Immunizations' as const,
      'Chronic diseases' as const,
      'Reception' as const,
      'Waiting room' as const,
      'Triage' as const,
      'Administration' as const,
      'Pharmacy' as const,
      'Emergency' as const,
    ]
    : [
      'Primary care' as const,
      'Oncology' as const,
      'Burns' as const,
      'Reception' as const,
      'Waiting room' as const,
      'Triage' as const,
      'Administration' as const,
      'Pharmacy' as const,
      'Remote care' as const,
      'Emergency' as const,
    ]
}

export function createTestOrganization(
  trx: TrxOrDb,
  { id, category = 'Clinic' }: {
    id?: string
    category?: 'Clinic' | 'Hospital'
  } = {},
) {
  const organization = {
    id,
    category,
    name: `Test ${generateUUID()} ${category}`,
    country: 'ZA',
    departments: testOrganizationDepartments(category).map((name) => ({
      name,
      room_names: testOrganizationRoomNames(name),
    })),
    address: formatAddress({
      street: '123 Test St',
      locality: 'Test City',
      country: 'ZA',
      postal_code: '12345',
    }),
    location: { latitude: 0, longitude: 0 },
  }

  return organizations.add(trx, organization)
}
