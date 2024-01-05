import { ComponentChild } from 'preact'
import { LinkDef, LinkProps } from '../../types.ts'
import CalendarIcon from './icons/calendar.tsx'
import PatientsIcon from './icons/patients.tsx'
import LogoutIcon from './icons/logout.tsx'
import matchActiveLink from '../../util/matchActiveLink.ts'
import cls from '../../util/cls.ts'
import { LogoWithFullText } from './Logo.tsx'

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
        <Icon className='stroke-black w-5' />
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

const seeking_treatment_nav_links: LinkDef[] = [
  {
    route: '/app/patients/:patient_id/encounters/:encounter_id/vitals',
    title: 'Vitals',
    Icon: CalendarIcon,
  },
  {
    route: '/app/patients/:patient_id/encounters/:encounter_id/symptoms',
    title: 'Symptoms',
    Icon: CalendarIcon,
  },
  {
    route: '/app/patients/:patient_id/encounters/:encounter_id/risk_factors',
    title: 'risk factors',
    Icon: CalendarIcon,
  },
  {
    route: '/app/patients/:patient_id/encounters/:encounter_id/examinations',
    title: 'examinations',
    Icon: CalendarIcon,
  },
  {
    route:
      '/app/patients/:patient_id/encounters/:encounter_id/diagnostic_tests',
    title: 'diagnostic tests',
    Icon: CalendarIcon,
  },
  {
    route: '/app/patients/:patient_id/encounters/:encounter_id/diagnosis',
    title: 'diagnosis',
    Icon: CalendarIcon,
  },
  {
    route: '/app/patients/:patient_id/encounters/:encounter_id/prescription',
    title: 'prescription',
    Icon: CalendarIcon,
  },
  {
    route: '/app/patients/:patient_id/encounters/:encounter_id/orders',
    title: 'orders',
    Icon: CalendarIcon,
  },
  {
    route: '/app/patients/:patient_id/encounters/:encounter_id/clinical_notes',
    title: 'clinical notes',
    Icon: CalendarIcon,
  },
  {
    route: '/app/patients/:patient_id/encounters/:encounter_id/referral',
    title: 'referral',
    Icon: CalendarIcon,
  },
  {
    route: '/app/patients/:patient_id/encounters/:encounter_id/close_visit',
    title: 'close visit',
    Icon: CalendarIcon,
  },
]

function replaceParams(route: string, params: Record<string, string>) {
  for (const param in params) {
    const placeholder = `/:${param}`
    const paramValue = `/${params[param]}`
    route = route.replace(placeholder, paramValue)
  }
  return route
}

function GenericSidebar({ navLinks, route, params }: SidebarProps) {
  const activeLink = matchActiveLink(navLinks, route)
  return (
    <div className='hidden fixed inset-y-0 z-40 md:flex w-48 md:flex-col'>
      <div className='flex flex-auto flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-5 pb-4'>
        <a href='/app' className='flex h-20 shrink-0 items-center gap-3'>
          <LogoWithFullText variant='indigo' className='h-16' />
        </a>
        <nav className='flex flex-1 flex-col'>
          <ul role='list' className='-mx-2 space-y-1'>
            {navLinks.map((link) => (
              console.log('link', link),
                (
                  <NavItem
                    href={replaceParams(link.route, params || {})}
                    active={link === activeLink}
                    title={link.title}
                    Icon={link.Icon}
                  />
                )
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}

export function HomePageSidebar({ route }: { route: string }) {
  return (
    <GenericSidebar
      route={route}
      navLinks={home_page_nav_links}
      top={{
        href: '/app',
        child: <LogoWithFullText variant='indigo' className='h-16' />,
      }}
    />
  )
}

export function SeekingTreatmentSidebar(
  { route, params }: { route: string; params: Record<string, string> },
) {
  return (
    <GenericSidebar
      route={route}
      params={params}
      navLinks={seeking_treatment_nav_links}
      top={{
        href: replaceParams('/app/patients/:patient_id', params),
        child: <LogoWithFullText variant='indigo' className='h-16' />,
      }}
    />
  )
}
