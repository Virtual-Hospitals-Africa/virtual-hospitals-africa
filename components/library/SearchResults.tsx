import { JSX } from 'preact'
import { useState } from 'preact/hooks'
import { HasId } from '../../types.ts'
import Avatar from './Avatar.tsx'
import cls from '../../util/cls.ts'

type PersonSearchResultProps = {
  person: HasId<{ name: string; avatar_url?: string }>
  isSelected: boolean
  onSelect: () => void
}

export function PersonSearchResult(
  { person, isSelected, onSelect }: PersonSearchResultProps,
) {
  const [isActive, setIsActive] = useState(false)

  return (
    <li
      className={cls(
        'relative cursor-default select-none py-2 pl-3 pr-9',
        isActive ? 'text-white bg-indigo-600' : 'text-gray-900',
      )}
      role='option'
      tabIndex={-1}
      onClick={() => {
        console.log('WEKLWELKEW')
        onSelect()
      }}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
    >
      <div className='flex items-center'>
        <Avatar
          src={person.avatar_url}
          className='h-6 w-6 flex-shrink-0 rounded-full'
        />
        <span className={cls('ml-3 truncate', isSelected && 'font-bold')}>
          {person.name}
        </span>
      </div>
      {isActive && (
        <span
          className={cls(
            'absolute inset-y-0 right-0 flex items-center pr-4',
            isActive ? 'text-white' : 'text-indigo-600',
          )}
        >
          <svg
            className='h-5 w-5'
            viewBox='0 0 20 20'
            fill='currentColor'
            aria-hidden='true'
          >
            <path
              fill-rule='evenodd'
              d='M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z'
              clip-rule='evenodd'
            />
          </svg>
        </span>
      )}
    </li>
  )
}

export default function SearchResults({
  children,
}: {
  children: JSX.Element[]
}) {
  return (
    <ul
      className='absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm'
      // className='absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm'
      id='options'
      role='listbox'
    >
      {children}
    </ul>
  )
}
