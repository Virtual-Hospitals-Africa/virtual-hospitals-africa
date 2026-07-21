import { Tabs } from '../library/Tabs.tsx'

const TABS = ['overview', 'employees', 'inventory'] as const

const tab_routes: Record<typeof TABS[number], string> = {
  overview: '',
  employees: '/employees',
  inventory: '/inventory',
}

export default function OrganizationTabs({ organization_id, active_tab }: { organization_id: string; active_tab: string }) {
  const base = `/app/organizations/${organization_id}`
  return (
    <Tabs
      tabs={TABS.map((tab) => ({
        tab,
        href: `${base}${tab_routes[tab]}`,
        active: tab === active_tab,
      }))}
    />
  )
}
