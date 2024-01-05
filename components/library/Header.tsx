import { BellIcon, XMarkIcon } from './icons/heroicons/outline.tsx'
import Avatar from './Avatar.tsx'
import { LogoWithFullText } from './Logo.tsx'
import { ComponentChildren } from 'preact'

export type HeaderProps = {
  title: string
  variant: 'home page' | 'form' | 'just logo'
  avatarUrl?: string
}

function Notification() {
  return (
    <button
      type='button'
      className='rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800'
    >
      <span className='sr-only'>View notifications</span>
      <BellIcon
        className='h-6 w-6'
        stroke-width='1.5'
        stroke='currentColor'
        aria-hidden='true'
      />
    </button>
  )
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
  { avatarUrl }: { avatarUrl: string | undefined },
) {
  return (
    <HeaderRight>
      <Notification />
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

function HeaderRightClose() {
  return (
    <HeaderRight>
      <a onClick={() => window.history.back()} className='h-6 w-6'>
        <XMarkIcon />
      </a>
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

export function Header({ title, avatarUrl, variant }: HeaderProps) {
  if (variant === 'just logo') return <HeaderWithoutNav />
  const right = variant === 'home page'
    ? <HeaderRightWithAvatar avatarUrl={avatarUrl} />
    : <HeaderRightClose />

  return (
    <HeaderBase className='bg-gray-800'>
      <HeaderLeft title={title} />
      {right}
    </HeaderBase>
  )
}
