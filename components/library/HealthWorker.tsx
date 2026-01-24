import { Person } from './Person.tsx'
import Menu from '../../islands/Menu.tsx'
import { EllipsisVerticalIcon } from './icons/heroicons/solid.tsx'

export function HealthWorker(
  { menu_items, ...person }: {
    display_name: string
    avatar_url: string | null
    description: string
    menu_items?: Array<{ label: string; href: string }>
  },
) {
  return (
    <div className='flex items-start bg-indigo-50 rounded-2xl px-1 py-2 border border-indigo-100 relative'>
      <div className='grow min-w-0'>
        <Person
          person={person}
          size='sm'
          className='bg-transparent border-0 p-0! [&_.person-name]:font-semibold! [&_.person-name]:whitespace-nowrap! [&_.person-name]:leading-5 [&>span]:ml-1! rounded-lg border-blue-200'
        />
      </div>
      {menu_items && menu_items.length > 0 && (
        <Menu
          options={menu_items}
          icon={<EllipsisVerticalIcon className='stroke-indigo-700 fill-indigo-700 cursor-pointer' />}
          className='absolute shrink-0 top-1 right-1'
          optionsClassName='absolute bottom-2.5 left-2'
        />
      )}
    </div>
  )
}
