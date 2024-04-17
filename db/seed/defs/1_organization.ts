// import * as google from '../../../external-clients/google.ts'
import parseCsv from '../../../util/parseCsv.ts'
import capitalize from '../../../util/capitalize.ts'
import { create } from '../create.ts'
import * as medplum from '../../../external-clients/medplum/client.ts'
// import uuid from '../../../util/uuid.ts'
import { forEach } from '../../../util/inParallel.ts'

export default create(
  ['Organization'],
  async () => {
    await addTestOrganizations()
    await importDataFromCSV()
  },
)

type OrganizationData = {
  name: string
  // location: string
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

function createOrganization({ name, category, address }: OrganizationData) {
  const type = [{
    coding: [{
      system: 'http://terminology.hl7.org/CodeSystem/organization-type',
      code: 'prov',
      display: 'Healthcare Provider',
    }],
  }]
  // TODO: Make an VHA organization category code system
  if (category) {
    type.push({
      coding: [{
        system: 'virtualhospitalsafrica.org/codes/organization-category',
        code: category,
        display: category,
      }],
    })
  }
  return medplum.createResource('Organization', {
    name,
    type,
    active: true,
    address: address && [
      {
        use: 'work',
        type: 'both',
        ...interpretAddress(address),
      },
    ],
  })
}

export async function addTestOrganizations() {
  await createOrganization({
    name: 'VHA Test Clinic',
    // location: sql`ST_SetSRID(ST_MakePoint(2.25, 51), 4326)`,
    address: '120 Main St, Bristol, UK, 23456',
    category: 'Clinic',
  })
  await createOrganization({
    name: 'VHA Test Virtual Hospital',
    category: 'Virtual Hospital',
  })
}

// TODO: Can't get last column properly, maybe because new line character
// So need a extra column in csv file
async function importDataFromCSV() {
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

      await createOrganization({
        name,
        address,
        category: category_capitalized,
      })
    },
  )
}
