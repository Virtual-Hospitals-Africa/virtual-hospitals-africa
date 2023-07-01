import Badge from './Badge.tsx'
import cls from '../../util/cls.ts'

export type TabsProps<Tab extends string> = {
  route: string
  tabs: Tab[]
  activeTab: Tab
  counts: Partial<Record<Tab, number>>
}

function Tab(
  { tab, href, active, count }: {
    tab: string
    href: string
    active: boolean
    count?: number
  },
) {
  return (
    <a
      key={tab}
      href={href}
      className={cls(
        'flex items-center gap-2 whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium uppercase',
        active
          ? 'border-indigo-500 text-indigo-600'
          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
      )}
      aria-current={active ? 'page' : undefined}
    >
      {tab}
      {count != null && <Badge content={count} color='gray' />}
    </a>
  )
}

export function Tabs<Tab extends string>(
  { route, tabs, activeTab, counts }: TabsProps<Tab>,
) {
  return (
    <div className='border-b border-gray-200 pb-5 sm:pb-0'>
      <div className='mt-3 sm:mt-4'>
        <div className='sm:hidden'>
          <label htmlFor='current-tab' className='sr-only'>
            Select a tab
          </label>
          <select
            id='current-tab'
            name='current-tab'
            className='block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
            defaultValue={activeTab}
          >
            {tabs.map((tab) => <option key={tab}>{tab}</option>)}
          </select>
        </div>
        <div className='hidden sm:block'>
          <nav className='-mb-px flex space-x-8 px-5'>
            {tabs.map((tab) => (
              <Tab
                tab={tab}
                active={tab === activeTab}
                href={`${route}?tab=${tab}`}
                count={counts[tab]}
              />
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}

export function activeTab<Tab extends string>(tabs: Tab[], url: string): Tab {
  const tabQuery = new URL(url).searchParams.get('tab')
  return tabs.find((tab) => tab === tabQuery) || tabs[0]
}
