import { JSX } from 'preact'
import Avatar from './Avatar.tsx'
import cls from '../../util/cls.ts'
import type { InsuranceNetworkSearchOption } from '../../types.ts'

export function InsuranceNetwork(
  { insurance, bold, size = 'md', no_avatar, className }: {
    insurance: InsuranceNetworkSearchOption
    bold?: boolean
    size?: 'md' | 'lg' | 'sm'
    no_avatar?: boolean
    className?: string
  },
): JSX.Element {
  return (
    <div
      className={cls(
        'flex items-center',
        className,
      )}
    >
      {!no_avatar && (
        <Avatar
          src={insurance.avatar_media_id}
          size={size}
          className='mr-1'
        />
      )}
      <div className={cls('flex flex-col', bold && 'font-bold')}>
        <div className='insurance-name text-xs'>
          {insurance.business_name}
        </div>
      </div>
    </div>
  )
}
