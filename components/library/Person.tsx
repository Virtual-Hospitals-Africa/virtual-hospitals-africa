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
  { person, bold, size = 'md', no_avatar }: {
    person: PersonData
    bold?: boolean
    size?: 'md' | 'lg'
    no_avatar?: boolean
  },
): JSX.Element {
  console.log(person.avatar_url)
  const Component = person.href ? 'a' : 'div'
  return (
    <Component
      id={person.id}
      className={cls(
        'flex items-center',
        person.href && 'text-indigo-600 hover:text-indigo-900',
      )}
      href={person.href ?? undefined}
    >
      {!no_avatar && (
        <Avatar
          src={person.avatar_url}
          className={cls(
            'flex-shrink-0 rounded-full',
            size === 'lg' ? 'h-10 w-10' : 'h-10 w-10',
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
      <div className='flex flex-col gap-0'>
        <div>{person.display_name || person.name}</div>
        {person.description && (
          <div className='text-sm font-normal text-gray-500 capitalize'>
            {person.description}
          </div>
        )}
      </div>
    </Component>
  )
}
