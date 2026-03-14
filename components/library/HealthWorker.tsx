import { Person } from './Person.tsx'

export function HealthWorker(
  person: {
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
    </div>
  )
}
