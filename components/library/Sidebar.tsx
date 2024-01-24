import { ComponentChild } from 'preact'
import { LinkDef, LinkProps } from '../../types.ts'
import CalendarIcon from './icons/calendar.tsx'
import PatientsIcon from './icons/patients.tsx'
import LogoutIcon from './icons/logout.tsx'
import matchActiveLink from '../../util/matchActiveLink.ts'
import cls from '../../util/cls.ts'
import { LogoWithFullText } from './Logo.tsx'
import capitalize from '../../util/capitalize.ts'

export type SidebarProps = {
  top: {
    href: string
    child: ComponentChild
  }
  route: string
  params?: Record<string, string>
  navLinks: LinkDef[]
}

function NavItem({
  href,
  title,
  active,
  Icon,
}: LinkProps) {
  return (
    <li>
      <a
        href={href}
        className={cls(
          'hover:text-gray-900 hover:bg-gray-50 group flex gap-x-3 items-center rounded-md p-2 text-sm leading-6 capitalize',
          active ? 'text-gray-900 bg-gray-50' : 'text-gray-700',
        )}
      >
        {Icon && <Icon className='w-5' active={active} />}
        {title}
      </a>
    </li>
  )
}

const home_page_nav_links: LinkDef[] = [
  { route: '/app/patients', title: 'My Patients', Icon: PatientsIcon },
  { route: '/app/employees', title: 'Employees', Icon: PatientsIcon },
  { route: '/app/calendar', title: 'Calendar', Icon: CalendarIcon },
  { route: '/app/dispensary', title: 'Dispensary', Icon: PatientsIcon },
  { route: '/logout', title: 'Log Out', Icon: LogoutIcon },
]

export function replaceParams(route: string, params: Record<string, string>) {
  for (const param in params) {
    const placeholder = `/:${param}`
    const paramValue = `/${params[param]}`
    route = route.replace(placeholder, paramValue)
  }
  return route
}

export function GenericSidebar({ navLinks, route, params, top }: SidebarProps) {
  const activeLink = matchActiveLink(navLinks, route)
  return (
    <div className='hidden fixed inset-y-0 z-40 md:flex w-48 md:flex-col'>
      <div className='flex flex-auto flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-5 pb-4'>
        <a href={top.href} className='flex h-20 shrink-0 items-center gap-3'>
          {top.child}
        </a>
        <nav className='flex flex-1 flex-col'>
          <ul role='list' className='-mx-2 space-y-1'>
            {navLinks.map((link) => (
              <NavItem
                href={replaceParams(link.route, params || {})}
                active={link === activeLink}
                title={link.title ||
                  capitalize(link.route.split('/').pop()!)}
                Icon={link.Icon}
              />
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}

export const DefaultTop = {
  href: '/app',
  child: <LogoWithFullText variant='indigo' className='h-16' />,
}

export function HomePageSidebar({ route }: { route: string }) {
  return (
    <GenericSidebar
      route={route}
      navLinks={home_page_nav_links}
      top={DefaultTop}
    />
  )
}
