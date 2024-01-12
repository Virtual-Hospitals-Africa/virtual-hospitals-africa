import Badge from './Badge.tsx'
import cls from '../../util/cls.ts'
import words from '../../util/words.ts'

export type TabsProps<Tab extends string> = {
  route: string
  tabs: Array<Tab | [Tab, string]>
  activeTab: Tab
  counts: Partial<Record<Tab, number>>
}

const display = (tab: string) => words(tab).join(' ')

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
      {display(tab)}
      {count ? <Badge content={count} color='gray' /> : null}
    </a>
  )
}

export function Tabs<Tab extends string>(
  { route, tabs, activeTab, counts }: TabsProps<Tab>,
) {
  const use_tabs = tabs.map((tab) =>
    Array.isArray(tab)
      ? { tab: tab[0], href: tab[1] }
      : { tab, href: `${route}?tab=${tab}` }
  )

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
            {use_tabs.map(({ tab }) => <option key={tab}>{display(tab)}
            </option>)}
          </select>
        </div>
        <div className='hidden sm:block'>
          <nav className='-mb-px flex space-x-8 px-5'>
            {use_tabs.map(({ tab, href }) => (
              <Tab
                tab={tab}
                active={tab === activeTab}
                href={href}
                count={counts[tab]}
              />
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}

export function activeTab<Tab extends string>(
  tabs: Array<Tab | [Tab, string]>,
  url: string,
): Tab {
  const tabQuery = new URL(url).searchParams.get('tab')
  for (const tab of tabs) {
    if (Array.isArray(tab)) {
      if (tab[0] === tabQuery) {
        return tab[0]
      }
    } else if (tab === tabQuery) {
      return tab
    }
  }
  const first = tabs[0]
  if (Array.isArray(first)) {
    return first[0]
  }
  return first
}
