import { assert } from 'std/assert/assert.ts'
import type { Priority } from '../../../shared/priorities.ts'
import type { LinkDef, RenderedEmployee } from '../../../types.ts'
import { PhoneIcon } from '../icons/heroicons/outline.tsx'
import { practitionerHomePageNavLinks } from '../sidebar/home_page_links/health_worker.ts'
import { replaceParams } from '../../../util/replaceParams.ts'
import cls from '../../../util/cls.ts'

const MOBILE_FOOTER_ITEMS = [
  { source_title: 'Patients', label: 'Patients' },
  {
    source_title: 'Organizations',
    label: 'Facility',
    route: '/app/organizations/:organization_id',
  },
  { source_title: 'Messaging', label: 'Messages' },
  { source_title: 'Calendar', label: 'Calendar' },
] as const

function linkByTitle(nav_links: LinkDef[], title: string) {
  const link = nav_links.find((item) => item.title === title)
  assert(link, `Missing nav link ${title}`)
  const Icon = link.Icon
  assert(Icon, `Missing icon for ${title}`)
  return { route: link.route, Icon }
}

function linkIsActive(link_route: string, current_route: string) {
  return current_route === link_route || current_route.startsWith(`${link_route}/`)
}

export function MobileHomepageFooter({
  route,
  params,
  url_search_params,
  employee,
  tutorial,
  health_worker_notification_count,
  health_worker_notification_priority,
}: {
  route: string
  params: Record<string, string>
  url_search_params: URLSearchParams
  employee: RenderedEmployee
  tutorial?: boolean
  health_worker_notification_count: number
  health_worker_notification_priority: Priority | null
}) {
  const nav_links = practitionerHomePageNavLinks({
    health_worker_notification_count,
    health_worker_notification_priority,
  })
  const all_params = { ...params }
  url_search_params.forEach((value, key) => {
    all_params[key] = value
  })

  return (
    <nav className='md:hidden shrink-0 border-t-[1.5px] border-gray-300 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_10px_rgba(30,27,24,0.06)]'>
      <ul className='flex h-[60px] items-end justify-between px-6 pb-1'>
        {MOBILE_FOOTER_ITEMS.map((item) => {
          const link = linkByTitle(nav_links, item.source_title)
          const item_route = 'route' in item ? item.route : link.route
          const active = linkIsActive(item_route, route)
          const { Icon } = link
          return (
            <li key={item.label}>
              <a
                href={tutorial ? '#' : replaceParams(item_route, all_params)}
                aria-current={active ? 'page' : undefined}
                className={cls(
                  "flex flex-col items-center gap-1 font-['Inter'] text-[10px] leading-3",
                  active ? 'font-semibold text-indigo-700' : 'font-normal text-gray-600',
                )}
              >
                <Icon className='size-6!' active={active} />
                {item.label}
              </a>
            </li>
          )
        })}
        <li>
          <form
            method='POST'
            action={tutorial ? undefined : `/app/organizations/${employee.organization_id}/patients/start-emergency-escalation`}
          >
            <button
              type={tutorial ? 'button' : 'submit'}
              className="flex flex-col items-center gap-1 font-['Inter'] text-[10px] font-normal leading-3 text-red-600"
            >
              <PhoneIcon className='size-6!' />
              Emergency
            </button>
          </form>
        </li>
      </ul>
    </nav>
  )
}
