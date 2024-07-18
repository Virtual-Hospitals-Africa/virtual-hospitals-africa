import { ComponentChild } from 'preact'
import { FreshContext } from '$fresh/server.ts'
import { LinkDef, LinkProps } from '../../types.ts'
import * as ProgressIcons from './icons/progress.tsx'
import { matchActiveLink } from '../../util/matchActiveLink.ts'
import cls from '../../util/cls.ts'
import { LogoWithFullText } from './Logo.tsx'
import capitalize from '../../util/capitalize.ts'
import {
  ArchiveBoxIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  PresentationChartBarIcon,
} from './icons/heroicons/outline.tsx'
import { IdentificationIcon } from './icons/heroicons/outline.tsx'
import { AcademicCapIcon } from './icons/heroicons/outline.tsx'
import { ArrowRightOnRectangleIcon } from './icons/heroicons/outline.tsx'
import { ClockIcon } from './icons/heroicons/outline.tsx'
import { UserGroupIcon } from './icons/heroicons/outline.tsx'
import { replaceParams } from '../../util/replaceParams.ts'

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

const practitioner_home_page_nav_links: LinkDef[] = [
  {
    route: '/app/organizations/:organization_id/waiting_room',
    title: 'Waiting Room',
    Icon: ClockIcon,
  },
  { route: '/app/patients', title: 'My Patients', Icon: UserGroupIcon },
  { route: '/app/employees', title: 'Employees', Icon: IdentificationIcon },
  { route: '/app/calendar', title: 'Calendar', Icon: CalendarDaysIcon },
  {
    route: '/app/messaging',
    title: 'Messaging',
    Icon: ChatBubbleLeftRightIcon,
  },
  {
    route: '/app/organizations/:organization_id/inventory',
    title: 'Inventory',
    Icon: ArchiveBoxIcon,
  },
  {
    route: '/app/analysis',
    title: 'Analysis',
    Icon: PresentationChartBarIcon,
  },
  {
    route: '/app/medical_literature',
    title: 'Medical Literature',
    Icon: AcademicCapIcon,
  },
  { route: '/logout', title: 'Log Out', Icon: ArrowRightOnRectangleIcon },
]

const regulator_home_page_nav_links: LinkDef[] = [
  {
    route: '/regulator/pharmacists',
    title: 'Pharmacists',
    Icon: ClockIcon,
  },
  { route: '/regulator/pharmacies', title: 'Pharmacies', Icon: UserGroupIcon },
  {
    route: '/regulator/medicines',
    title: 'Medicines',
    Icon: IdentificationIcon,
  },
  { route: '/logout', title: 'Log Out', Icon: ArrowRightOnRectangleIcon },
]

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

export function PractitionerHomePageSidebar(
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
      nav_links={practitioner_home_page_nav_links}
      top={DefaultTop}
    />
  )
}

export function RegulatorHomePageSidebar(
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
      nav_links={regulator_home_page_nav_links}
      top={DefaultTop}
    />
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
        Icon: steps_completed.includes(link.step)
          ? ProgressIcons.Check
          : ProgressIcons.Dot,
      }))}
    />
  )
}
