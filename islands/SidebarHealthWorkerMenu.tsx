import { EllipsisVerticalIcon } from '../components/library/icons/heroicons/mini.tsx'
import { Person } from '../components/library/Person.tsx'
import cls from '../util/cls.ts'
import Menu from './Menu.tsx'
import { useSidebarCollapsed } from './SidebarToggleButton.tsx'

export function SidebarHealthWorkerMenu(
  { menu_items, ...person }: {
    display_name: string
    avatar_url: string | null
    description: string
    menu_items?: Array<{ label: string; href: string }>
  },
) {
  const sidebar_collapsed = useSidebarCollapsed()

  return (
    <div
      className={cls(
        'flex items-start bg-indigo-50 rounded-2xl border border-indigo-100 transition-all relative',
        sidebar_collapsed.value ? 'px-0 py-1' : 'px-1 py-2',
      )}
    >
      <div className={cls('transition-all grow min-w-0', sidebar_collapsed.value && 'w-0 opacity-0')}>
        <Person
          person={person}
          size='sm'
          className='bg-transparent border-0 p-0! [&_.person-name]:font-semibold! [&_.person-name]:whitespace-nowrap! [&_.person-name]:leading-5 [&>span]:ml-1! rounded-lg border-blue-200'
        />
      </div>
      {menu_items && (
        <Menu
          options={menu_items}
          icon={<EllipsisVerticalIcon className='stroke-indigo-700 fill-indigo-700 cursor-pointer' />}
          className={cls('absolute shrink-0', sidebar_collapsed.value ? 'top-3 right-1.25' : 'top-1 right-1')}
          optionsClassName='absolute bottom-2.5 left-2'
        />
      )}
    </div>
  )
}
