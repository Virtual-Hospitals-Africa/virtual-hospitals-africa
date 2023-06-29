import { TabDef, TabProps } from '../../types.ts'
import Badge from './Badge.tsx'
import cls from '../../util/cls.ts'

export type TabsProps = {
  route: string
  tabs: TabDef[]
  activeTab: TabDef
}

function Tab(
  { name, href, active, count }: TabDef & { href: string; active: boolean },
) {
  return (
    <a
      key={name}
      href={href}
      className={cls(
        'flex items-center gap-2 whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium uppercase',
        active
          ? 'border-indigo-500 text-indigo-600'
          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
      )}
      aria-current={active ? 'page' : undefined}
    >
      {name}
      {count != null && <Badge content={count} color='gray' />}
    </a>
  )
}

export default function Tabs({ route, tabs, activeTab }: TabsProps) {
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
            defaultValue={activeTab.name}
          >
            {tabs.map((tab) => <option key={tab.name}>{tab.name}</option>)}
          </select>
        </div>
        <div className='hidden sm:block'>
          <nav className='-mb-px flex space-x-8 px-5'>
            {tabs.map((tab) => (
              <Tab
                {...tab}
                active={tab === activeTab}
                href={`${route}?tab=${tab.name}`}
              />
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}
