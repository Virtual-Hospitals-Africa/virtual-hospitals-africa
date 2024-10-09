import * as google from '../../../external-clients/google.ts'
import parseCsv from '../../../util/parseCsv.ts'
import capitalize from '../../../util/capitalize.ts'
import { create } from '../create.ts'
import * as organizations from '../../../db/models/organizations.ts'
import { forEach } from '../../../util/inParallel.ts'
import { TrxOrDb } from '../../../types.ts'
import { assert } from 'std/assert/assert.ts'

export default create(
  ['addresses', 'organizations'],
  async (trx) => {
    await addTestOrganizations(trx)
    await importDataFromCSV(trx)
  },
)

export async function addTestOrganizations(trx: TrxOrDb) {
  await organizations.add(trx, {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'VHA Test Clinic',
    category: 'Clinic',
    address: {
      street_number: '123',
      route: 'Main St',
      locality: 'Bristol',
      country: 'UK',
      postal_code: '23456',
    },
    location: {
      latitude: 51.4545,
      longitude: -2.5879,
    },
  })

  await organizations.add(trx, {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'VHA Test Virtual Hospital',
    category: 'Virtual Hospital',
  })
}

const duplicates_file = Deno.cwd() + '/db/resources/organization_duplicates.tsv'

const names = new Map()

// TODO: Can't get last column properly, maybe because new line character
// So need a extra column in csv file
async function importDataFromCSV(trx: TrxOrDb) {
  const file = await Deno.open(duplicates_file, {
    write: true,
    create: true,
    truncate: true,
  })
  await file.truncate()
  await file.write(new TextEncoder().encode('name,lat1,lon1,lat2,lon2\n'))

  await forEach(
    parseCsv('./db/resources/zimbabwe-health-organizations.tsv', {
      columnSeparator: '\t',
    }),
    async (row) => {
      let category = row.category?.trim()
      let inactive_reason: undefined | string = undefined

      if (category) {
        const open_paren = category.indexOf('(')
        const close_paren = category.indexOf(')')
        if (open_paren !== -1 && close_paren !== -1) {
          inactive_reason = category.slice(open_paren + 1, close_paren).trim()
          category = category.slice(0, open_paren).trim()
        }
      }

      const address = await google.getLocationAddress({
        longitude: Number(row.longitude),
        latitude: Number(row.latitude),
      })

      const category_capitalized = category && capitalize(category)
      let name = row.name!.trim()
      if (category && !name.toLowerCase().endsWith(category.toLowerCase())) {
        name += ` ${category_capitalized}`
      }

      if (name === 'ZRP') {
        const city = address.locality || address.administrative_area_level_2
        assert(city, `City not found for ZRP: ${JSON.stringify(address)}`)
        name = `ZRP ${city}`
      }

      const location = {
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
      }

      let suffix: undefined | number = undefined
      if (names.has(name)) {
        const other = names.get(name)!
        const encoder = new TextEncoder()
        const data = encoder.encode(
          `${name}\t${row.latitude}\t${row.longitude}\t${other.location.latitude}\t${other.location.longitude}\n`,
        )
        await file.write(data)
        other.count++
        suffix = other.count + 1
      } else {
        names.set(name, { address, location, count: 0 })
      }

      console.log({
        name: suffix ? `${name} (${suffix})` : name,
        address,
        inactive_reason,
        category: category_capitalized,
        location,
      })

      await organizations.add(trx, {
        name: suffix ? `${name} (${suffix})` : name,
        address,
        inactive_reason,
        category: category_capitalized,
        location,
      })
    },
  )
}
