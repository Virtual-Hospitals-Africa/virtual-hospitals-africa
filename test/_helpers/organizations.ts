import { TrxOrDb } from '../../types.ts'
import { assert } from 'std/assert/assert.ts'
import range from '../../util/range.ts'
import generateUUID from '../../util/uuid.ts'
import { OrganizationInsert } from '../../db/models/organizations.ts'
import compact from '../../util/compact.ts'
import { Department } from '../../shared/departments.ts'
import * as organizations from '../../db/models/organizations.ts'

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

export function testOrganizationDepartments(
  category: string,
): Department[] {
  return category === 'Clinic'
    ? [
      'primary care' as const,
      'maternity' as const,
      'immunizations' as const,
      'chronic diseases' as const,
      'reception' as const,
      'waiting room' as const,
      'triage' as const,
      'administration' as const,
      'pharmacy' as const,
    ]
    : [
      'primary care' as const,
      'oncology' as const,
      'burns' as const,
      'reception' as const,
      'waiting room' as const,
      'triage' as const,
      'administration' as const,
      'pharmacy' as const,
      'remote care' as const,
    ]
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
    assert(opts.count > 0),
      range(opts.count).map((_) => ({ category: opts.category }))
  )

  const creating: OrganizationInsert[] = to_create.map((
    { category = 'Clinic' },
  ) => ({
    category,
    name: `Test ${generateUUID()} ${category}`,
    country: 'US',
    departments: testOrganizationDepartments(category),
    address: {
      street: '123 Test St',
      locality: 'Test City',
      country: 'US',
      postal_code: '12345',
    },
    location: { latitude: 0, longitude: 0 },
  }))

  const organizations_added = await Promise.all(
    creating.map((org) => organizations.add(trx, org)),
  )
  const organization_ids = organizations_added.map((organization) =>
    organization.id
  )
  const address_ids = compact(
    organizations_added.map((organization) => organization.address_id),
  )
  try {
    await callback(organization_ids)
  } finally {
    await trx.deleteFrom('organizations')
      .where('id', 'in', organization_ids)
      .execute()
    if (address_ids.length) {
      await trx.deleteFrom('addresses')
        .where('id', 'in', address_ids)
        .execute()
    }
  }
}
