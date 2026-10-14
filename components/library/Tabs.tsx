import { ComponentChild } from 'preact'
import { ScrollActiveTabIntoView } from '../../islands/ScrollActiveTabIntoView.tsx'
import cls from '../../util/cls.ts'
import words from '../../util/words.ts'

const display = (tab: string) => words(tab).join(' ')

export type TabProps = {
  tab: string
  href: string
  active: boolean
  leftIcon?: ComponentChild
  rightIcon?: ComponentChild
}

export function Tab(
  { tab, href, active, leftIcon, rightIcon }: TabProps,
) {
  return (
    <a
      href={href}
      className={cls(
        'flex items-center gap-2 whitespace-nowrap border-b-2 px-1 pb-2 text-sm font-medium uppercase',
        active ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
      )}
      aria-current={active ? 'page' : undefined}
    >
      {leftIcon}
      {display(tab)}
      {rightIcon}
    </a>
  )
}

export function Tabs(
  { tabs, navClassName, scroll_active_into_view }: {
    tabs: TabProps[]
    navClassName?: string
    scroll_active_into_view?: boolean
  },
) {
  const class_name = navClassName ?? '-mb-px flex px-5 flex-wrap gap-x-8 gap-y-2'
  const links = tabs.map((props) => (
    <Tab
      key={props.tab}
      {...props}
    />
  ))
  return (
    <div className='border-b border-gray-200 pb-5 sm:pb-0 mb-4'>
      <div className='mt-3 sm:mt-4'>
        {scroll_active_into_view
          ? <ScrollActiveTabIntoView className={class_name}>{links}</ScrollActiveTabIntoView>
          : <nav className={class_name}>{links}</nav>}
      </div>
    </div>
  )
}
