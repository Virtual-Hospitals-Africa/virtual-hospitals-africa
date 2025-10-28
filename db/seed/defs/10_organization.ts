import { parseTsvTyped } from '../../../util/parseCsv.ts'
import capitalize from '../../../util/capitalize.ts'
import { define } from '../define.ts'
import * as organizations from '../../models/organizations.ts'
import { forEach } from '../../../util/inParallel.ts'
import { TrxOrDb } from '../../../types.ts'
import { assert } from 'std/assert/assert.ts'
import z from 'zod'
import { decimal } from '../../../util/validators.ts'
import { TO_COUNTRY_ISO_3601_2 } from '../../models/addresses.ts'
import { getLocationAddress } from '../../../external-clients/google-maps.ts'

export default define(
  ['addresses', 'organizations', 'organization_departments'],
  async (trx) => {
    await addTestOrganizations(trx)
    await importDataFromCSV(trx)
  },
)

export async function addTestOrganizations(trx: TrxOrDb) {
  await organizations.add(trx, {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'VHA Test Clinic South Africa',
    category: 'Clinic',
    is_test: true,
    ownership: 'Govt.',
    country: 'ZA',
    address: {
      street_number: '123',
      route: 'Main St',
      locality: 'Polokwane',
      country: 'South Africa',
      postal_code: '23456',
    },
    location: {
      latitude: -19.4554096,
      longitude: 29.7739353,
    },
    most_common_language_code: 'nso',
  })

  await organizations.add(trx, {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'VHA Test Regional Medical Center South Africa',
    category: 'Regional Medical Center',
    is_test: true,
    ownership: 'Govt.',
    country: 'ZA',
    address: {
      street_number: '12356',
      route: 'Main St',
      locality: 'Polokwane',
      country: 'South Africa',
      postal_code: '23456',
    },
    location: {
      latitude: -19.4555096,
      longitude: 29.7738353,
    },
    most_common_language_code: 'nso',
  })
  await organizations.add(trx, {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'VHA Test Clinic Zimbabwe',
    category: 'Clinic',
    is_test: true,
    ownership: 'Govt.',
    country: 'ZW',
    address: {
      street_number: '123',
      route: 'Main St',
      locality: 'Gweru',
      country: 'Zimbabwe',
      postal_code: '23456',
    },
    location: {
      latitude: -19.4554096,
      longitude: 29.7739353,
    },
  })

  await organizations.add(trx, {
    id: '00000000-0000-0000-0000-000000000004',
    name: 'VHA Test Regional Medical Center Zimbabwe',
    category: 'Regional Medical Center',
    is_test: true,
    ownership: 'Govt.',
    country: 'ZW',
    address: {
      street_number: '12356',
      route: 'Main St',
      locality: 'Gweru',
      country: 'Zimbabwe',
      postal_code: '23456',
    },
    location: {
      latitude: -19.4555096,
      longitude: 29.7738353,
    },
  })
}

const GET_ADDRESSES_FROM_GOOGLE_MAPS_FOR_COUNTRIES = new Set<string>(['ZA'])

const duplicates_file = Deno.cwd() + '/db/resources/organization_duplicates.tsv'

const names = new Map()

async function importDataFromCSV(trx: TrxOrDb) {
  const file = await Deno.open(duplicates_file, {
    write: true,
    create: true,
    truncate: true,
  })
  await file.truncate()
  await file.write(new TextEncoder().encode('name,lat1,lon1,lat2,lon2\n'))

  await forEach(
    parseTsvTyped(
      './db/resources/sub-saharan_health_facilities.tsv',
      z.object({
        Country: z.string(),
        Admin1: z.string(),
        Facility_n: z.string(),
        Facility_t: z.string(),
        Ownership: z.string().nullable(),
        Lat: decimal,
        Long: decimal,
        LL_source: z.string().nullable(),
      }),
    ),
    async (row) => {
      let category = row.Facility_t?.trim()
      let inactive_reason: undefined | string = undefined

      if (category) {
        const open_paren = category.indexOf('(')
        const close_paren = category.indexOf(')')
        if (open_paren !== -1 && close_paren !== -1) {
          inactive_reason = category.slice(open_paren + 1, close_paren).trim()
          category = category.slice(0, open_paren).trim()
        }
      }

      // Map Zanzibar to Tanzania as it's a semi-autonomous region, not a country
      const lookup_country = row.Country === 'Zanzibar'
        ? 'Tanzania'
        : row.Country
      const country = TO_COUNTRY_ISO_3601_2.get(lookup_country)

      assert(country, `No country found for ${row.Country}`)

      const location = {
        latitude: Number(row.Lat),
        longitude: Number(row.Long),
      }

      const get_google_maps_address =
        GET_ADDRESSES_FROM_GOOGLE_MAPS_FOR_COUNTRIES.has(country)

      console.log({ country, get_google_maps_address })
      const address = get_google_maps_address
        ? await getLocationAddress(location)
        : undefined

      const category_capitalized = category && capitalize(category)
      let name = row.Facility_n!.trim()
      if (category && !name.toLowerCase().endsWith(category.toLowerCase())) {
        name += ` ${category_capitalized}`
      }

      let suffix: undefined | number = undefined
      if (names.has(name)) {
        const other = names.get(name)!
        const encoder = new TextEncoder()
        const data = encoder.encode(
          `${name}\t${row.Lat}\t${row.Long}\t${other.location.latitude}\t${other.location.longitude}\n`,
        )
        await file.write(data)
        other.count++
        suffix = other.count + 1
      } else {
        names.set(name, { address, location, count: 0 })
      }

      await organizations.add(trx, {
        name: suffix ? `${name} (${suffix})` : name,
        address,
        inactive_reason,
        category: category_capitalized,
        country,
        ownership: row.Ownership,
        location,
      })
    },
  )
}
