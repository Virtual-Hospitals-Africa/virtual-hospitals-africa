import { assertEquals } from 'std/assert/assert_equals.ts'
import { describe, it } from 'std/testing/bdd.ts'
import { practitionerHomePageNavLinks } from '../../components/library/sidebar/home_page_links/health_worker.ts'
import { matchActiveLink } from '../../util/matchActiveLink.ts'

const nav_links = practitionerHomePageNavLinks({
  health_worker_notification_count: 0,
  health_worker_notification_priority: null,
})

function activeTitle(route: string) {
  return matchActiveLink(nav_links, route)?.title
}

describe('matchActiveLink', () => {
  it('highlights Employees for the employees href and organization employees routes', () => {
    assertEquals(activeTitle('/app/employees'), 'Employees')
    assertEquals(activeTitle('/app/organizations/:organization_id/employees'), 'Employees')
    assertEquals(
      activeTitle('/app/organizations/:organization_id/employees/:health_worker_id'),
      'Employees',
    )
  })

  it('highlights Open Encounters on the waiting room', () => {
    assertEquals(
      activeTitle('/app/organizations/:organization_id/waiting_room'),
      'Open Encounters',
    )
  })

  it('highlights Inventory on inventory routes', () => {
    assertEquals(activeTitle('/app/organizations/:organization_id/inventory'), 'Inventory')
    assertEquals(activeTitle('/app/organizations/:organization_id/inventory/history'), 'Inventory')
  })

  it('highlights Organizations on the organization index and list', () => {
    assertEquals(activeTitle('/app/organizations/:organization_id'), 'Organizations')
    assertEquals(activeTitle('/app/organizations'), 'Organizations')
  })
})
