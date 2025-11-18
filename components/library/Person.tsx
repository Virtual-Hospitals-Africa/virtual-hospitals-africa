import { ComponentChildren, JSX } from 'preact'
import Avatar from './Avatar.tsx'
import cls from '../../util/cls.ts'
import { Maybe } from '../../types.ts'
import { assert } from 'std/assert/assert.ts'
import isObjectLike from '../../util/isObjectLike.ts'
import isString from '../../util/isString.ts'

export type PersonData =
  & {
    id?: string
    href?: Maybe<string>
    avatar_url?: Maybe<string>
    description?: ComponentChildren
  }
  & (
    {
      name: string
      display_name?: Maybe<string>
    } | {
      name?: Maybe<string>
      display_name: string
    }
  )

export function assertPersonLike(
  person: unknown,
): asserts person is PersonData {
  assert(isObjectLike(person))
  assert(isString(person.name))
}

export function Person(
  { person, bold, size = 'md', no_avatar, className }: {
    person: PersonData
    bold?: boolean
    size?: 'md' | 'lg' | 'sm'
    no_avatar?: boolean
    className?: string
  },
): JSX.Element {
  const Component = person.href ? 'a' : 'div'
  return (
    <Component
      id={person.id}
      className={cls(
        'flex items-center',
        person.href && 'text-indigo-600 hover:text-indigo-900',
        className,
      )}
      href={person.href ?? undefined}
    >
      {!no_avatar && (
        <Avatar
          src={person.avatar_url}
          className={cls(
            'flex-shrink-0 rounded-full',
            size === 'md' ? 'h-8 w-8' : size === 'sm' ? 'h-6 w-6' : 'h-10 w-10',
          )}
        />
      )}
      <span
        className={cls(
          'ml-3 truncate font-medium text-md text-gray-600',
          bold && 'font-bold',
        )}
      >
      </span>
      <div className='flex flex-col'>
        <div className='person-name text-xs'>
          {person.display_name || person.name}
        </div>
        {person.description && (
          <div className='font-normal capitalize text-xs text-gray-500'>
            {person.description}
          </div>
        )}
      </div>
    </Component>
  )
}
