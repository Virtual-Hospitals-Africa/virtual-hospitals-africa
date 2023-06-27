import BellIcon from './icons/bell.tsx'
import ArrowLeftIcon from './icons/arrow-left.tsx'

export type HeaderProps = {
  title: string
  imageUrl?: string
  isShowNav?: boolean
}

function Avatar({ imageUrl }: { imageUrl: string }) {
  return (
    <button
      type='button'
      className='flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800'
      id='user-menu-button'
      aria-expanded='false'
      aria-haspopup='true'
    >
      <span className='sr-only'>To user profile</span>
      <img
        className='h-8 w-8 rounded-full'
        src={imageUrl}
        alt='user avatar'
      />
    </button>
  )
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
  { isShowNav, title }: { isShowNav: boolean; title: string },
) {
  return (
    <div className='flex items-center gap-2'>
      {isShowNav && (
        <a
          className='back'
          onClick={() => window.history.back()}
        >
          <ArrowLeftIcon
            className='back-arrow w-4 h-4 fill-white'
            stroke-width='1'
            stroke='currentColor'
          />
        </a>
      )}
      <h6 className='text-xl'>{title}</h6>
    </div>
  )
}

function HeaderRight({ imageUrl }: { imageUrl: string | undefined }) {
  return (
    <div className='absolute inset-y-0 right-0 flex gap-4 items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0'>
      <Notification />
      {imageUrl && <Avatar imageUrl={imageUrl} />}
    </div>
  )
}

export function Header({ title, imageUrl, isShowNav = true }: HeaderProps) {
  return (
    <nav className='bg-gray-800'>
      <div className='max-w-7xl w-full px-5'>
        <div className='relative flex h-16 items-center justify-between'>
          <HeaderLeft isShowNav={isShowNav} title={title} />
          <HeaderRight imageUrl={imageUrl} />
        </div>
      </div>
    </nav>
  )
}
