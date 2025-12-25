import { ComponentChild } from 'preact'
import { Context } from 'fresh'
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
import { replaceParams } from '../../util/replaceParams.ts'
import { MedicineIcon } from './icons/Medicines.tsx'
import { PharmaciesIcon } from './icons/Pharmacies.tsx'
import { UsersIcon } from './icons/heroicons/outline.tsx'
import { HEADER_HEIGHT_PX } from './HeaderHeight.ts'
import { prettyStepName } from '../../shared/workflow.ts'

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
    route: '/regulator/:country/medicines',
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
  { nav_links, route, params, urlSearchParams, top, bottom }: SidebarProps,
) {
  const all_params = { ...params }
  urlSearchParams.forEach((value, key) => all_params[key] = value)
  const active_link = matchActiveLink(nav_links, route)
  return (
    <div className='fixed inset-y-0 z-40 hidden w-48 md:flex md:flex-col'>
      <div className='flex flex-col flex-auto bg-white border-r border-gray-200 gap-y-5 overflow-visible'>
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
            className='flex items-center h-20 max-w-full gap-3 shrink-0 '
          >
            {top.child}
          </a>
        </div>
        <nav className='flex flex-col flex-1 px-5'>
          <ul role='list' className='-mx-2 space-y-1'>
            {nav_links.map((link) => (
              <NavItem
                href={replaceParams(link.route, all_params)}
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
  child: <LogoWithFullText variant='indigo' className='h-16' />,
}

export const RegulatorDefaultTop = {
  href: '/regulator',
  child: <LogoWithFullText variant='indigo' className='h-16' />,
}

export function HealthWorkerHomePageSidebar(
  { route, params, urlSearchParams, bottom }: {
    route: string
    params: Record<string, string>
    urlSearchParams: URLSearchParams
    bottom?: ComponentChild
  },
) {
  return (
    <GenericSidebar
      route={route}
      params={params}
      urlSearchParams={urlSearchParams}
      nav_links={practitioner_home_page_nav_links}
      top={HealthWorkerDefaultTop}
      bottom={bottom}
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
  // deno-lint-ignore no-explicit-any
  ctx: Context<any>
  bottom?: ComponentChild
  nav_links: {
    step: string
    route: string
  }[]
  steps_completed: string[]
}

// deno-lint-ignore no-explicit-any
function defaultTop(ctx: Context<any>) {
  if (ctx.url.pathname.startsWith('/app')) {
    return HealthWorkerDefaultTop
  }
  if (ctx.url.pathname.startsWith('/regulator')) {
    return RegulatorDefaultTop
  }
  throw new Error(`Could not compute home page top for url: ${ctx.url}`)
}

export function StepsSidebar(
  { top, bottom, ctx, nav_links, steps_completed }: StepsSidebarProps,
) {
  return (
    <GenericSidebar
      top={top || defaultTop(ctx)}
      bottom={bottom}
      route={ctx.route!}
      params={ctx.params}
      urlSearchParams={ctx.url.searchParams}
      nav_links={nav_links.map((link) => ({
        ...link,
        title: prettyStepName(link.step),
        Icon: steps_completed.includes(link.step)
          ? ProgressIcons.Check
          : ProgressIcons.Dot,
      }))}
    />
  )
}
