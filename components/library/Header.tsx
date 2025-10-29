import Avatar from './Avatar.tsx'
import { LogoWithFullText } from './Logo.tsx'
import { ComponentChildren } from 'preact'
import { Maybe } from '../../types.ts'
import { NotificationsButton } from '../../islands/Notifications.tsx'
import { RenderedNotification } from '../../types.ts'
import { assert } from 'std/assert/assert.ts'
import { HEADER_HEIGHT_PX } from './HeaderHeight.ts'

export type HeaderProps = {
  title: string
  variant: 'home page' | 'form' | 'just logo'
  avatarUrl?: Maybe<string>
  notifications?: RenderedNotification[]
}

function HeaderLeft(
  { title }: { title: string },
) {
  return (
    <div className='flex items-center gap-2'>
      <h1 className="text-Netural-Colors-primary text-3xl font-bold font-['Inter'] leading-10">
        {title}
      </h1>
    </div>
  )
}

function HeaderRight({ children }: { children: ComponentChildren }) {
  return (
    <div className='absolute inset-y-0 right-0 flex items-center gap-4 pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0'>
      {children}
    </div>
  )
}

function HeaderRightWithAvatar(
  { avatarUrl, notifications }: {
    avatarUrl?: Maybe<string>
    notifications: RenderedNotification[]
  },
) {
  return (
    <HeaderRight>
      <NotificationsButton notifications={notifications} />
      <button
        type='button'
        className='flex text-sm bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800'
        id='user-menu-button'
        aria-expanded='false'
        aria-haspopup='true'
      >
        <span className='sr-only'>To user profile</span>
        <Avatar src={avatarUrl} className='w-8 h-8' />
      </button>
    </HeaderRight>
  )
}

function HeaderBase(
  { children }: { children: ComponentChildren },
) {
  return (
    <nav
      className='self-stretch inline-flex justify-start items-center gap-2.5 pl-6'
      style={{
        height: HEADER_HEIGHT_PX,
      }}
    >
      {/* <div className='relative flex items-center justify-between h-16'> */}
      <div className="justify-start text-Netural-Colors-primary text-3xl font-bold font-['Inter'] leading-10">
        {children}
      </div>
    </nav>
  )
}

function HeaderWithoutNav() {
  return (
    <HeaderBase>
      <a href='/' className='py-8'>
        <LogoWithFullText variant='indigo' className='w-60' />
      </a>
    </HeaderBase>
  )
}

export function Header(
  { title, avatarUrl, variant, notifications }: HeaderProps,
) {
  if (variant === 'just logo') return <HeaderWithoutNav />
  const right = variant === 'home page'
    ? (
      <HeaderRightWithAvatar
        avatarUrl={avatarUrl}
        notifications={(assert(notifications), notifications)}
      />
    )
    : null

  return (
    <HeaderBase>
      <HeaderLeft title={title} />
      {right}
    </HeaderBase>
  )
}
