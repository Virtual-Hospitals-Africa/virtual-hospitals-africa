import { ArrowLeftIcon, BellIcon } from './icons/heroicons/outline.tsx'
import Avatar from './Avatar.tsx'
import { LogoWithFullText, LogoWithInitials } from './Logo.tsx'
import { ComponentChildren } from 'preact'

export type HeaderProps = {
  title: string
  variant: 'standard' | 'form' | 'just-logo'
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
  { showBackButton, title }: { showBackButton: boolean; title: string },
) {
  return (
    <div className='flex items-center gap-2'>
      <LogoWithFullText variant='indigo' />
      {showBackButton && (
        <a
          className='back'
          onClick={() => window.history.back()}
        >
          <ArrowLeftIcon
            className='back-arrow w-4 h-4 fill-white md:hide'
            stroke-width='1'
            stroke='currentColor'
          />
        </a>
      )}
      <h6 className='text-xl text-white'>{title}</h6>
    </div>
  )
}

function HeaderRight({ avatarUrl }: { avatarUrl: string | undefined }) {
  return (
    <div className='absolute inset-y-0 right-0 flex gap-4 items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0'>
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
    </div>
  )
}

function HeaderBase(
  { className, children }: { className?: string; children: ComponentChildren },
) {
  return (
    <nav className={className}>
      <div className='max-w-7xl w-full px-5 py-7'>
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
  if (variant === 'just-logo') return <HeaderWithoutNav />

  return (
    <HeaderBase className='bg-gray-800'>
      <HeaderLeft
        showBackButton={variant === 'form'}
        title={title}
      />
      <HeaderRight avatarUrl={avatarUrl} />
    </HeaderBase>
  )
}
