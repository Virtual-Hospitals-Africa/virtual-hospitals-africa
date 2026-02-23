import { ComponentChild } from 'preact'

import { LinkDef, LinkProps } from '../../types.ts'
import * as ProgressIcons from './icons/progress.tsx'
import { matchActiveLink } from '../../util/matchActiveLink.ts'
import cls from '../../util/cls.ts'
import { LogoWithFullText } from './Logo.tsx'
import capitalize from '../../util/capitalize.ts'
import { ArchiveBoxIcon, CalendarDaysIcon, ChatBubbleLeftRightIcon, PresentationChartBarIcon } from './icons/heroicons/outline.tsx'
import { IdentificationIcon } from './icons/heroicons/outline.tsx'
import { AcademicCapIcon } from './icons/heroicons/outline.tsx'
import { ArrowRightOnRectangleIcon } from './icons/heroicons/outline.tsx'
import { ClockIcon } from './icons/heroicons/outline.tsx'
import { replaceParams } from '../../util/replaceParams.ts'
import { MedicineIcon } from './icons/Medicines.tsx'
import { PharmaciesIcon } from './icons/Pharmacies.tsx'
import { UsersIcon } from './icons/heroicons/outline.tsx'
import { HEADER_HEIGHT_PX } from './HeaderHeight.ts'
import { prettyStepName } from '../../shared/workflow.ts'
import { hyphenate } from '../../util/hyphenate.ts'

export type SidebarProps = {
  top: {
    href: string
    child: ComponentChild
  }
  bottom?: ComponentChild
  route: string
  params: Record<string, string>
  urlSearchParams: URLSearchParams
  nav_links: LinkDef[]
  tutorial?: boolean
}

function NavItem({
  href,
  title,
  active,
  Icon,
}: LinkProps) {
  return (
    <li id={`sidebar-list-item-${hyphenate(title)}`}>
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
    title: 'Open Encounters',
    Icon: ClockIcon,
  },
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
  { route: '/app/logout', title: 'Log Out', Icon: ArrowRightOnRectangleIcon },
]

const regulator_home_page_nav_links: LinkDef[] = [
  {
    route: '/regulator/:country/pharmacists',
    title: 'Pharmacists',
    Icon: UsersIcon,
  },
  {
    route: '/regulator/:country/pharmacies',
    title: 'Pharmacies',
    Icon: PharmaciesIcon,
  },
  {
    route: '/regulator/:country/medications',
    title: 'Medicines',
    Icon: MedicineIcon,
  },
  {
    route: '/regulator/logout',
    title: 'Log Out',
    Icon: ArrowRightOnRectangleIcon,
  },
]

export function GenericSidebar(
  { nav_links, route, params, urlSearchParams, top, bottom, tutorial }: SidebarProps,
) {
  const all_params = { ...params }
  urlSearchParams.forEach((value, key) => all_params[key] = value)
  const active_link = matchActiveLink(nav_links, route)
  return (
    <div className='inset-y-0 h-full w-44'>
      <div className='flex flex-col flex-auto bg-white border-r border-gray-200 overflow-visible h-full'>
        <div
          style={{
            height: HEADER_HEIGHT_PX,
            display: 'grid',
            placeItems: 'center',
            width: '100%',
          }}
        >
          <a
            href={top.href}
            className='flex items-center max-w-full gap-3 shrink-0 px-2'
          >
            {top.child}
          </a>
        </div>
        <nav className='flex flex-col flex-1 px-3'>
          <ul role='list' className='-mx-2 space-y-1'>
            {nav_links.map((link) => (
              <NavItem
                href={tutorial ? '#' : replaceParams(link.route, all_params)}
                active={link === active_link}
                title={link.title ||
                  capitalize(link.route.split('/').pop()!).replace(
                    ' And ',
                    ' & ',
                  )}
                Icon={link.Icon}
              />
            ))}
          </ul>
        </nav>
        {bottom && (
          <div className='p-2'>
            {bottom}
          </div>
        )}
      </div>
    </div>
  )
}

export const HealthWorkerDefaultTop = {
  href: '/app',
  child: <LogoWithFullText variant='indigo' className='w-full' />,
}

export const RegulatorDefaultTop = {
  href: '/regulator',
  child: <LogoWithFullText variant='indigo' className='w-full' />,
}

export type HealthWorkerHomePageSidebarProps = {
  route: string
  params: Record<string, string>
  urlSearchParams: URLSearchParams
  bottom?: ComponentChild
  tutorial?: boolean
}

export function HealthWorkerHomePageSidebar(
  { route, params, urlSearchParams, bottom, tutorial }: HealthWorkerHomePageSidebarProps,
) {
  return (
    <GenericSidebar
      route={route}
      params={params}
      urlSearchParams={urlSearchParams}
      nav_links={practitioner_home_page_nav_links}
      top={HealthWorkerDefaultTop}
      bottom={bottom}
      tutorial={tutorial}
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
      top={RegulatorDefaultTop}
    />
  )
}

type StepsSidebarProps = {
  top?: {
    href: string
    child: ComponentChild
  }
  url: URL
  route?: string | null
  params: Record<string, string>
  bottom?: ComponentChild
  nav_links: {
    step: string
    route: string
  }[]
  steps_completed: string[]
}

function defaultTop(url: URL) {
  if (url.pathname.startsWith('/app') || url.pathname.startsWith('/tutorial') || url.pathname.startsWith('/example')) {
    return HealthWorkerDefaultTop
  }
  if (url.pathname.startsWith('/regulator')) {
    return RegulatorDefaultTop
  }
  throw new Error(`Could not compute home page top for url: ${url}`)
}

export function StepsSidebar(
  { top, bottom, nav_links, steps_completed, url, route, params }: StepsSidebarProps,
) {
  return (
    <GenericSidebar
      top={top || defaultTop(url)}
      bottom={bottom}
      route={route!}
      params={params}
      urlSearchParams={url.searchParams}
      nav_links={nav_links.map((link) => ({
        ...link,
        title: prettyStepName(link.step),
        Icon: steps_completed.includes(link.step) ? ProgressIcons.Check : ProgressIcons.Dot,
      }))}
    />
  )
}
