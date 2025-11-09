// import { assert } from 'std/assert/assert.ts'
import { ComponentChildren } from 'preact'
import { LogoWithFullText } from './Logo.tsx'
import { Maybe } from '../../types.ts'
import { RenderedNotification } from '../../types.ts'
import { HEADER_HEIGHT_PX } from './HeaderHeight.ts'
// import Avatar from './Avatar.tsx'
// import { NotificationsButton } from '../../islands/Notifications.tsx'

export type HeaderProps = {
  title: string
  variant: 'home page' | 'form' | 'just logo'
  avatar_url?: Maybe<string>
  notifications?: RenderedNotification[]
}

function HeaderLeft(
  { title }: { title: string },
) {
  return (
    <h1 className="text-Netural-Colors-primary text-3xl font-bold font-['Inter'] leading-10">
      {title}
    </h1>
  )
}

function HeaderBase(
  { children }: { children: ComponentChildren },
) {
  return (
    <nav
      className="self-stretch justify-between items-center gap-2.5 pl-6 text-Netural-Colors-primary text-3xl font-bold font-['Inter'] leading-10 flex flex-row w-full grow"
      style={{
        height: HEADER_HEIGHT_PX,
        maxHeight: HEADER_HEIGHT_PX,
      }}
    >
      {children}
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
  { title, variant /*, notifications, avatar_url */ }: HeaderProps,
) {
  if (variant === 'just logo') return <HeaderWithoutNav />
  const right = null
  // const right = variant === 'home page'
  //   ? (
  //     <HeaderRightWithAvatar
  //       avatar_url={avatar_url}
  //       notifications={(assert(notifications), notifications)}
  //     />
  //   )
  //   : null

  return (
    <HeaderBase>
      <HeaderLeft title={title} />
      {right}
    </HeaderBase>
  )
}

// function HeaderRight({ children }: { children: ComponentChildren }) {
//   return (
//     <div className='absolute inset-y-0 right-0 flex items-center gap-4 pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0'>
//       {children}
//     </div>
//   )
// }

// function HeaderRightWithAvatar(
//   { avatar_url, notifications }: {
//     avatar_url?: Maybe<string>
//     notifications: RenderedNotification[]
//   },
// ) {
//   return (
//     <HeaderRight>
//       <NotificationsButton notifications={notifications} />
//       <button
//         type='button'
//         className='flex text-sm bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800'
//         id='user-menu-button'
//         aria-expanded='false'
//         aria-haspopup='true'
//       >
//         <span className='sr-only'>To user profile</span>
//         <Avatar src={avatar_url} className='w-8 h-8' />
//       </button>
//     </HeaderRight>
//   )
// }
