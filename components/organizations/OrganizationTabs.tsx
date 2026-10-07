import { Tabs } from '../library/Tabs.tsx'

const TABS = ['open_encounters', 'employees', 'inventory', 'information'] as const

const tab_routes: Record<typeof TABS[number], string> = {
  open_encounters: '/waiting_room',
  employees: '/employees',
  inventory: '/inventory',
  information: '',
}

export default function OrganizationTabs({ organization_id, active_tab }: { organization_id: string; active_tab: string }) {
  const base = `/app/organizations/${organization_id}`
  return (
    <Tabs
      navClassName='-mb-px flex flex-nowrap overflow-x-auto gap-x-8 gap-y-2 px-5 sm:flex-wrap sm:overflow-visible'
      scroll_active_into_view
      tabs={TABS.map((tab) => ({
        tab,
        href: `${base}${tab_routes[tab]}`,
        active: tab === active_tab,
      }))}
    />
  )
}
