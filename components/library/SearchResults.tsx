import { JSX } from 'preact'
import { useState } from 'preact/hooks'
import { HasId } from '../../types.ts'
import Avatar from './Avatar.tsx'
import cls from '../../util/cls.ts'
import { PlusCircleIcon } from '../library/icons/heroicons/outline.tsx'

type BasicSelectProps = {
  isSelected?: boolean
  onSelect: () => void
}

type PersonSearchResultProps = BasicSelectProps & {
  person: HasId<{ name: string; avatar_url?: string }>
}

type FacilitySearchResultProps = BasicSelectProps & {
  facility: HasId<{ display_name: string; address: string }>
}

type AllergySearchResultProps = BasicSelectProps & {
  allergy: string
}

type ConditionSearchResultProps = BasicSelectProps & {
  condition: string
}

type SearchResultProps = BasicSelectProps & {
  children: JSX.Element
}

type AddButtonSearchResult = BasicSelectProps & {
  searchedValue: string
}

function SearchResult({ isSelected, onSelect, children }: SearchResultProps) {
  const [isActive, setIsActive] = useState(false)

  return (
    <li
      className={cls(
        'relative cursor-default select-none py-2 pl-3 pr-9',
        isActive ? 'text-white bg-indigo-600' : 'text-gray-900',
      )}
      role='option'
      tabIndex={-1}
      onClick={() => onSelect()}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
    >
      {children}
      {(isActive || isSelected) && (
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

export function PersonSearchResult(
  { person, isSelected, onSelect }: PersonSearchResultProps,
) {
  return (
    <SearchResult isSelected={isSelected} onSelect={onSelect}>
      <div className='flex items-center'>
        <Avatar
          src={person.avatar_url}
          className='h-6 w-6 flex-shrink-0 rounded-full'
        />
        <span className={cls('ml-3 truncate', isSelected && 'font-bold')}>
          {person.name}
        </span>
      </div>
    </SearchResult>
  )
}

export function FacilitySearchResult(
  { facility, isSelected, onSelect }: FacilitySearchResultProps,
) {
  return (
    <SearchResult isSelected={isSelected} onSelect={onSelect}>
      <div className='flex flex-col'>
        <div className={cls('truncate text-base', isSelected && 'font-bold')}>
          {facility.display_name}
        </div>
        <div className={cls('truncate text-xs', isSelected && 'font-bold')}>
          {facility.address}
        </div>
      </div>
    </SearchResult>
  )
}

export default function SearchResults({
  children,
  className,
}: {
  children: JSX.Element[] | JSX.Element
  className?: string
}) {
  return (
    <ul
      className={cls(
        'absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm',
        className,
      )}
      id='options'
      role='listbox'
    >
      {children}
    </ul>
  )
}

export function NoSearchResults() {
  return (
    <li
      className={cls(
        'relative cursor-default select-none py-2 pl-3 pr-9',
        'text-gray-900',
      )}
      role='option'
    >
      <div className='flex flex-col'>
        <div className='ml-3 text-gray-500 text-sm'>No results found</div>
      </div>
    </li>
  )
}

export function AllergySearchResult(
  { allergy, isSelected, onSelect }: AllergySearchResultProps,
) {
  return (
    <SearchResult isSelected={isSelected} onSelect={onSelect}>
      <div className='flex flex-col'>
        <div className={cls('truncate text-base', isSelected && 'font-bold')}>
          {allergy}
        </div>
      </div>
    </SearchResult>
  )
}

export function ConditionSearchResult(
  { condition, isSelected, onSelect }: ConditionSearchResultProps,
) {
  return (
    <SearchResult isSelected={isSelected} onSelect={onSelect}>
      <div className='flex flex-col'>
        <div className={cls('truncate text-base', isSelected && 'font-bold')}>
          {condition}
        </div>
      </div>
    </SearchResult>
  )
}

export function AddButtonSearchResult(
  { searchedValue, isSelected, onSelect }: AddButtonSearchResult,
) {
  return (
    <SearchResult isSelected={isSelected} onSelect={onSelect}>
      <div className='flex items-center'>
        <PlusCircleIcon className='h-6 w-6 flex-shrink-0 rounded-full' />
        <span className={cls('ml-3 truncate', isSelected && 'font-bold')}>
          Add {searchedValue}
        </span>
      </div>
    </SearchResult>
  )
}
