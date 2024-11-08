import Avatar from './Avatar.tsx'
import { LogoWithFullText } from './Logo.tsx'
import { ComponentChildren } from 'preact'
import { Maybe } from '../../types.ts'
import { NotificationsButton } from '../../islands/Notifications.tsx'
import { RenderedNotification } from '../../types.ts'
import { assert } from 'std/assert/assert.ts'

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
      <h1 className='text-xl text-white'>{title}</h1>
    </div>
  )
}

function HeaderRight({ children }: { children: ComponentChildren }) {
  return (
    <div className='absolute inset-y-0 right-0 flex gap-4 items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0'>
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
        className='flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800'
        id='user-menu-button'
        aria-expanded='false'
        aria-haspopup='true'
      >
        <span className='sr-only'>To user profile</span>
        <Avatar src={avatarUrl} className='h-8 w-8' />
      </button>
    </HeaderRight>
  )
}

function HeaderBase(
  { className, children }: { className?: string; children: ComponentChildren },
) {
  return (
    <nav className={className}>
      <div className='w-full p-5'>
        <div className='relative flex h-16 items-center justify-between'>
          {children}
        </div>
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
    <HeaderBase className='bg-indigo-900 font-ubuntu'>
      <HeaderLeft title={title} />
      {right}
    </HeaderBase>
  )
}
