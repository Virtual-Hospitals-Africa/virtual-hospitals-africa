import { initials } from '../../util/initials.ts'
import Avatar from './Avatar.tsx'

type AvatarGroupProps = {
  people: {
    name: string
    avatar_url?: string
  }[]
  plus_count?: number
}

export default function AvatarGroup({ people, plus_count }: AvatarGroupProps) {
  return (
    <div className='flex -space-x-1 overflow-hidden'>
      {people.map((person) => (
        <Avatar
          initials={initials(person.name)}
          src={person.avatar_url}
          className='inline-block size-6 rounded-full ring-2 ring-white'
        />
      ))}
      {plus_count != null && plus_count > 0 && (
        <Avatar
          initials={'+' + plus_count}
          className='inline-block size-6 rounded-full ring-2 ring-white'
        />
      )}
    </div>
  )
}
