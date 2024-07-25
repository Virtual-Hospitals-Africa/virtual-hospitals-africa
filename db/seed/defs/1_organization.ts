// import * as google from '../../../external-clients/google.ts'
import parseCsv from '../../../util/parseCsv.ts'
import capitalize from '../../../util/capitalize.ts'
import { create } from '../create.ts'
import * as organizations from '../../../db/models/organizations.ts'
import { forEach } from '../../../util/inParallel.ts'
import { Kysely } from 'kysely'
import { DB } from '../../../db.d.ts'

export default create(
  ['Organization', 'Address', 'Location'],
  async (db) => {
    await addTestOrganizations(db)
    await importDataFromCSV(db)
  },
)

export async function addTestOrganizations(db: Kysely<DB>) {
  await organizations.add(db, {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'VHA Test Clinic',
    address: '120 Main St, Bristol, UK, 23456',
    category: 'Clinic',
    latitude: 51.4545,
    longitude: -2.5879,
  })

  await organizations.add(db, {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'VHA Test Virtual Hospital',
    category: 'Virtual Hospital',
  })
}

// TODO: Can't get last column properly, maybe because new line character
// So need a extra column in csv file
async function importDataFromCSV(db: Kysely<DB>) {
  await forEach(
    parseCsv('./db/resources/zimbabwe-health-organizations.csv'),
    async (row) => {
      const address = row.address ?? undefined
      const category = row.category
        ? capitalize(row.category.trim())
        : undefined

      // if (!address && !Deno.env.get('SKIP_GOOGLE_MAPS')) {
      //   address = await google.getLocationAddress({
      //     longitude: Number(row.longitude),
      //     latitude: Number(row.latitude),
      //   })
      // }

      const category_capitalized = category && capitalize(category)
      const name = category_capitalized
        ? (row.name + ' ' + category_capitalized)
        : row.name

      await organizations.add(db, {
        name: name!,
        address,
        category: category_capitalized,
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
      })
    },
  )
}
