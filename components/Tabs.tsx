import matchActiveLink from '../util/matchActiveLink.ts'
import { TabDef, TabProps } from '../types.ts'
import Badge from './Badge.tsx'

export type TabsProps = {
  tabs: TabDef[]
  route: string
}

function Tab({ title, href, active, number }: TabProps) {
  return (
    <a
      key={title}
      href={href}
      className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium ${
        active
          ? 'border-indigo-500 text-indigo-600'
          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
      }`}
      aria-current={active ? 'page' : undefined}
    >
      {title}
      {number !== undefined && <Badge content={number} color='gray' />}
    </a>
  )
}

export default function Tabs({ route, tabs }: TabsProps) {
  const activeTab = matchActiveLink<TabDef>(tabs, route) || tabs[0]
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
            defaultValue={activeTab.title}
          >
            {tabs.map((tab) => <option key={tab.title}>{tab.title}</option>)}
          </select>
        </div>
        <div className='hidden sm:block'>
          <nav className='-mb-px flex space-x-8 px-5'>
            {tabs.map((tab) => <Tab {...tab} active={activeTab === tab} />)}
          </nav>
        </div>
      </div>
    </div>
  )
}
