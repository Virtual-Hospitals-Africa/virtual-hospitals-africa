import { matchActiveLink } from '../../../util/matchActiveLink.ts'
import capitalize from '../../../util/capitalize.ts'
import {} from '../icons/heroicons/outline.tsx'
import {} from '../icons/heroicons/outline.tsx'
import {} from '../icons/heroicons/outline.tsx'
import {} from '../icons/heroicons/outline.tsx'
import { replaceParams } from '../../../util/replaceParams.ts'
import SidebarToggleButton from '../../../islands/sidebar/ToggleButton.tsx'
import { NavItem } from './NavItem.tsx'
import { SidebarProps } from '../../../types.ts'

export function GenericSidebar(
  { nav_links, route, params, urlSearchParams, top, bottom, tutorial }: SidebarProps,
) {
  const all_params = { ...params }
  urlSearchParams.forEach((value, key) => all_params[key] = value)
  const active_link = matchActiveLink(nav_links, route)
  return (
    <div className='inset-y-0 h-full max-w-44'>
      <div className='relative flex flex-col flex-auto bg-white border-r border-gray-200 overflow-visible h-full'>
        <SidebarToggleButton />
        {top}
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
