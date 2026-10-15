import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { afterAll, before } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { assert } from 'std/assert/assert.ts'
import db from '../../../../db/db.ts'
import { addTestEmployeeWithSession } from '../../../_helpers/employees.ts'
import { createTestOrganization } from '../../../_helpers/organizations.ts'
import waitUntilTestServerUp from '../../../_helpers/waitUntilTestServerUp.ts'

async function setup() {
  const { id } = await createTestOrganization(db)
  const organization = await db
    .selectFrom('organizations')
    .where('id', '=', id)
    .select(['id', 'name'])
    .executeTakeFirstOrThrow()
  const mock = await addTestEmployeeWithSession(db, {
    role: 'nurse',
    organization_id: organization.id,
  })
  return { organization, mock, org_path: `/app/organizations/${organization.id}` }
}

describeParallel('/app/organizations/[organization_id]', () => {
  before(waitUntilTestServerUp)
  afterAll(() => db.destroy())

  itParallel('redirects to /info', async () => {
    const { mock, org_path } = await setup()
    const response = await mock.fetch(org_path, { redirect: 'manual' })
    assertEquals(response.status, 302)
    assertEquals(response.headers.get('location'), `${org_path}/info`)
    await response.body?.cancel()
  })

  itParallel('renders the organization name with the info tab active', async () => {
    const { organization, mock, org_path } = await setup()
    const $ = await mock.fetchCheerio(`${org_path}/info`)
    assert($('h1').text().includes(organization.name))
    const active = $('a.uppercase[aria-current="page"]')
    assertEquals(active.length, 1)
    assertEquals(active.attr('href'), `${org_path}/info`)
  })

  itParallel('highlights the tab of the sibling pages', async () => {
    const { organization, mock, org_path } = await setup()
    for (const tab of ['waiting_room', 'employees', 'inventory']) {
      const $ = await mock.fetchCheerio(`${org_path}/${tab}`)
      assert($('h1').text().includes(organization.name), tab)
      // Pages may have tabs of their own (e.g. inventory), so match on the organization tab's exact href
      const active = $(`a.uppercase[aria-current="page"][href="${org_path}/${tab}"]`)
      assertEquals(active.length, 1, tab)
    }
  })
})
