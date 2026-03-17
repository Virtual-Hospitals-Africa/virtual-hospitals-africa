import { SidebarNavItemText } from '../../../islands/sidebar/NavItemText.tsx'
import { LinkProps } from '../../../types.ts'
import cls from '../../../util/cls.ts'
import { hyphenate } from '../../../util/hyphenate.ts'

export function NavItem({
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
          'hover:text-gray-900 hover:bg-gray-50 group flex items-center rounded-md p-2 text-sm leading-6 capitalize',
          active ? 'text-gray-900 bg-gray-50' : 'text-gray-700',
        )}
      >
        {Icon && <Icon className='w-5' active={active} />}
        <SidebarNavItemText>{title}</SidebarNavItemText>
      </a>
    </li>
  )
}
