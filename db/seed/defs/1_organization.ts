// import * as google from '../../../external-clients/google.ts'
import parseCsv from '../../../util/parseCsv.ts'
import capitalize from '../../../util/capitalize.ts'
import { create } from '../create.ts'
import * as medplum from '../../../external-clients/medplum/client.ts'
// import uuid from '../../../util/uuid.ts'
import { forEach } from '../../../util/inParallel.ts'
import { Kysely } from 'kysely'

export default create(
  ['Organization', 'Location'],
  async (db) => {
    await addTestOrganizations(db)
    await importDataFromCSV(db)
  },
)

type OrganizationsData = {
  id?: string
  name: string
  latitude?: number
  longitude?: number
  address?: string
  category?: string
}

function interpretAddress(address: string) {
  const parts = address.split(', ')
  return {
    line: parts.slice(0, parts.length - 3),
    city: parts[parts.length - 3],
    state: parts[parts.length - 2],
    postalCode: parts[parts.length - 1],
  }
}

const categoryMap = {
  'Rural Health Centre': 'PC',
  'Clinic': 'PC',
  'Hospital': 'HOSP',
  'District Hospital': 'HOSP',
  'Military Hospital': 'MHSP',
}

const codeMap = {
  'PC': 'Primary care clinic',
  'HOSP': 'Hospital',
  'MHSP': 'Military Hospital',
}

async function createOrganization(
  db: Kysely<any>,
  { id, name, category, address, latitude, longitude }: OrganizationsData,
) {
  if (!category) {
    console.warn(`Skipping, no category found for organization: ${name}`)
    return
  }

  let status = 'active'
  const category_match = category.match(/(.*)(\(.*\))/)
  if (category_match) {
    category = category_match[1].trim()
    status = 'inactive'
  }

  const type = [{
    coding: [{
      system: 'http://terminology.hl7.org/CodeSystem/organization-type',
      code: 'prov',
      display: 'Healthcare Provider',
    }],
  }, {
    coding: [{
      system: 'virtualhospitalsafrica.org/codes/organization-category',
      code: category,
      display: category,
    }],
  }]

  const interpretedAddress = address && interpretAddress(address)
  const createdOrganization = await medplum.createResource('Organization', {
    name,
    type,
    active: true,
    address: interpretedAddress && [interpretedAddress],
  })

  // Hacky, but we want to explicitly set the ids of the test organizations and you can't do it
  // via the createResource call
  if (id) {
    const updated = await db.updateTable('Organization')
      .set({ id })
      .where('id', '=', createdOrganization.id)
      .execute()

    console.log('updated', updated)
    createdOrganization.id = id
  }

  if (address && !Number.isNaN(latitude) && !Number.isNaN(longitude)) {
    const code = category && categoryMap[category as keyof typeof categoryMap]
    if (!code && category) {
      console.error(`No code found for category: ${category}`)
    }
    const display = code && codeMap[code as keyof typeof codeMap]
    const coding = [{
      code,
      display,
      system: 'http://terminology.hl7.org/CodeSystem/v3-RoleCode',
    }]

    await medplum.createResource('Location', {
      status,
      name,
      type: [{ coding }],
      address: {
        use: 'work',
        type: 'both',
        ...interpretedAddress,
      },
      physicalType: {
        coding: [
          {
            system:
              'http://terminology.hl7.org/CodeSystem/location-physical-type',
            code: 'bu',
            display: 'Building',
          },
        ],
      },
      position: { longitude, latitude },
      managingOrganization: {
        reference: `Organization/${createdOrganization.id}`,
        display: name,
      },
    })
  }
}

export async function addTestOrganizations(db: Kysely<any>) {
  await createOrganization(db, {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'VHA Test Clinic',
    address: '120 Main St, Bristol, UK, 23456',
    category: 'Clinic',
    latitude: 51.4545,
    longitude: -2.5879,
  })

  await createOrganization(db, {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'VHA Test Virtual Hospital',
    category: 'Virtual Hospital',
  })
}

// TODO: Can't get last column properly, maybe because new line character
// So need a extra column in csv file
async function importDataFromCSV(db: Kysely<any>) {
  await forEach(
    parseCsv('./db/resources/zimbabwe-health-organizations.csv'),
    async (row) => {
      console.log('row', row)
      const address = (!row.address || row.address) === 'UNKNOWN'
        ? undefined
        : row.address
      const category = (!row.category || row.category === 'UNKNOWN')
        ? undefined
        : capitalize(row.category.trim())
      // if (address === 'UNKNOWN' && !Deno.env.get('SKIP_GOOGLE_MAPS')) {
      //   address = await google.getLocationAddress({
      //     longitude: Number(row.longitude),
      //     latitude: Number(row.latitude),
      //   })
      // }

      const category_capitalized = category && capitalize(category)
      const name = category_capitalized
        ? (row.name + ' ' + category_capitalized)
        : row.name

      await createOrganization(db, {
        name,
        address,
        category: category_capitalized,
        latitude: parseInt(row.latitude),
        longitude: parseInt(row.longitude),
      })
    },
  )
}
