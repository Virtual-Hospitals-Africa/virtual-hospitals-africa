import { ComponentChild } from 'preact'
import { FreshContext } from '$fresh/server.ts'
import { LinkDef, LinkProps } from '../../types.ts'
import CalendarIcon from './icons/calendar.tsx'
import PatientsIcon from './icons/patients.tsx'
import LogoutIcon from './icons/logout.tsx'
import matchActiveLink from '../../util/matchActiveLink.ts'
import cls from '../../util/cls.ts'
import { LogoWithFullText } from './Logo.tsx'
import capitalize from '../../util/capitalize.ts'
import { CheckCircleIcon } from './icons/heroicons/outline.tsx'

export type SidebarProps = {
  top: {
    href: string
    child: ComponentChild
  }
  route: string
  params: Record<string, string>
  urlSearchParams: URLSearchParams
  nav_links: LinkDef[]
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
  {
    route: '/app/facilities/:facility_id/inventory',
    title: 'Inventory',
    Icon: PatientsIcon,
  },
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

export function GenericSidebar(
  { nav_links, route, params, urlSearchParams, top }: SidebarProps,
) {
  const allParams = { ...params }
  urlSearchParams.forEach((value, key) => allParams[key] = value)
  const activeLink = matchActiveLink(nav_links, route)
  return (
    <div className='hidden fixed inset-y-0 z-40 md:flex w-48 md:flex-col'>
      <div className='flex flex-auto flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-5 pb-4'>
        <a href={top.href} className='flex h-20 shrink-0 items-center gap-3'>
          {top.child}
        </a>
        <nav className='flex flex-1 flex-col'>
          <ul role='list' className='-mx-2 space-y-1'>
            {nav_links.map((link) => (
              <NavItem
                href={replaceParams(link.route, allParams)}
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

export function HomePageSidebar(
  { route, params, urlSearchParams }: {
    route: string
    params: Record<string, string>
    urlSearchParams: URLSearchParams
  },
) {
  return (
    <GenericSidebar
      route={route}
      params={params}
      urlSearchParams={urlSearchParams}
      nav_links={home_page_nav_links}
      top={DefaultTop}
    />
  )
}

// TODO: use active?
function Check({ className }: { active: boolean; className?: string }) {
  return (
    <span
      className={cls(
        'relative flex flex-shrink-0 items-center justify-center',
        className as string,
      )}
    >
      <CheckCircleIcon
        className='text-indigo-600 group-hover:text-indigo-800'
        aria-hidden='true'
      />
    </span>
  )
}

function Dot({ active }: { active: boolean }) {
  if (active) {
    return (
      <span
        className='relative flex h-5 w-5 flex-shrink-0 items-center justify-center'
        aria-hidden='true'
      >
        <span className='absolute h-4 w-4 rounded-full bg-indigo-200' />
        <span className='relative block h-2 w-2 rounded-full bg-indigo-600' />
      </span>
    )
  }
  return (
    <div
      className='relative flex h-5 w-5 flex-shrink-0 items-center justify-center'
      aria-hidden='true'
    >
      <div className='h-2 w-2 rounded-full bg-gray-300 group-hover:bg-gray-400' />
    </div>
  )
}

type StepsSidebarProps = {
  top?: {
    href: string
    child: ComponentChild
  }
  ctx: FreshContext
  nav_links: {
    step: string
    route: string
  }[]
  steps_completed: string[]
}

export function StepsSidebar(
  { top, ctx, nav_links, steps_completed }: StepsSidebarProps,
) {
  return (
    <GenericSidebar
      top={top || DefaultTop}
      route={ctx.route}
      params={ctx.params}
      urlSearchParams={ctx.url.searchParams}
      nav_links={nav_links.map((link) => ({
        ...link,
        Icon: steps_completed.includes(link.step) ? Check : Dot,
      }))}
    />
  )
}
