import { LinkProps, LinkDef } from '../types.ts'

import HomeIcon from './icons/home.tsx'
import CalendarIcon from './icons/calendar.tsx'
import PatientsIcon from './icons/patients.tsx'
import ProfileIcon from './icons/profile.tsx'
import LogoutIcon from './icons/logout.tsx'
import matchActiveLink from '../util/matchActiveLink.ts'

export type SidebarProps = {
  route: string
  navLinks?: LinkDef[]
}

function NavItem({
  href,
  title,
  active,
  Icon,
}: LinkProps) {
  return (
    <li>
      <a href={href} className={`hover:text-gray-900 hover:bg-gray-50 group flex gap-x-3 items-center rounded-md p-2 text-sm leading-6 ${active ? 'text-gray-900 bg-gray-50' : 'text-gray-700'}`}>
        <Icon className={`stroke-black w-5`} />
        {title}
      </a>
    </li>
  )
}

const navLinks: LinkDef[] = [
  { href: '/app', title: 'Dashboard', Icon: HomeIcon },
  { href: '/app/patients', title: 'My Patients', Icon: PatientsIcon },
  { href: '/app/dispensary', title: 'Dispensary', Icon: PatientsIcon },
  { href: '/app/schedule', title: 'Schedule', Icon: CalendarIcon },
  { href: '/app/profile', title: 'My Profile', Icon: ProfileIcon },
  { href: '/logout', title: 'Log Out', Icon: LogoutIcon },
]


export function Sidebar(props: SidebarProps) {
  const activeLink = matchActiveLink<LinkDef>(navLinks, props.route)
  return (
    <div className='hidden fixed inset-y-0 z-50 md:flex w-72 md:flex-col'>
      <div className='flex flex-auto flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-5 pb-4'>
        <div className='flex h-16 shrink-0 items-center gap-3'>
          <img className='h-8 w-auto' src='https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600' alt='Your Company' />
          <h6 class="text-xl">VHA</h6>
        </div>
        <nav className='flex flex-1 flex-col'>
          <ul role='list' className='-mx-2 space-y-1'>
            {navLinks.map((link) => <NavItem {...link} active={link === activeLink} />)}
          </ul>
        </nav>
      </div>
    </div>
  )
}
