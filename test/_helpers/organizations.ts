import { TrxOrDb } from '../../types.ts'
import { assert } from 'std/assert/assert.ts'
import range from '../../util/range.ts'
import generateUUID from '../../util/uuid.ts'
import { OrganizationInsert } from '../../db/models/organizations.ts'
import { Department } from '../../shared/departments.ts'
import { organizations } from '../../db/models/organizations.ts'
import { formatAddress } from '../../shared/addresses.ts'

export const TEST_ORGANIZATION_UUIDS = {
  ZA: {
    clinic: '00000000-0000-1000-8000-000000000001',
    hospital: '00000000-0000-1000-8000-000000000002',
  },
}

export function withTestOrganization(
  trx: TrxOrDb,
  opts: (organization_id: string) => Promise<void>,
  callback?: undefined,
): Promise<void>

export function withTestOrganization(
  trx: TrxOrDb,
  opts: { category: 'Clinic' | 'Hospital' },
  callback: (organization_id: string) => Promise<void>,
): Promise<void>

export function withTestOrganization(
  trx: TrxOrDb,
  opts:
    | { category: 'Clinic' | 'Hospital' }
    | ((organization_id: string) => Promise<void>),
  callback?: (organization_id: string) => Promise<void>,
) {
  let category: 'Clinic' | 'Hospital' = 'Clinic'
  if (typeof opts === 'function') {
    callback = opts
  } else {
    category = opts.category
  }
  return withTestOrganizations(
    trx,
    { category, count: 1 },
    async ([organization_id]) => {
      await callback!(organization_id)
    },
  )
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

export async function withTestOrganizations(
  trx: TrxOrDb,
  opts:
    | { category?: 'Clinic' | 'Hospital'; count: number }
    | {
      category?: 'Clinic' | 'Hospital'
    }[],
  callback: (organization_ids: string[]) => Promise<void>,
) {
  const to_create = Array.isArray(opts) ? opts : (
    assert(opts.count > 0), range(opts.count).map((_) => ({ category: opts.category }))
  )

  const creating: OrganizationInsert[] = to_create.map((
    { category = 'Clinic' },
  ) => ({
    category,
    name: `Test ${generateUUID()} ${category}`,
    country: 'US',
    departments: testOrganizationDepartments(category).map((name) => ({
      name,
      room_names: testOrganizationRoomNames(name),
    })),
    address: formatAddress({
      street: '123 Test St',
      locality: 'Test City',
      country: 'US',
      postal_code: '12345',
    }),
    location: { latitude: 0, longitude: 0 },
  }))

  const organizations_added = await Promise.all(
    creating.map((org) => organizations.add(trx, org)),
  )
  const organization_ids = organizations_added.map((organization) => organization.id)
  // const address_ids = compact(
  //   organizations_added.map((organization) => organization.address_id),
  // )
  await callback(organization_ids)
  // try {

  // } finally {
  //   await trx.deleteFrom('organizations')
  //     .where('id', 'in', organization_ids)
  //     .execute()
  //   if (address_ids.length) {
  //     await trx.deleteFrom('addresses')
  //       .where('id', 'in', address_ids)
  //       .execute()
  //   }
  // }
}
