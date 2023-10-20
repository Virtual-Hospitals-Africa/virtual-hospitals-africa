import HomeIcon from './icons/home.tsx'
import CalendarIcon from './icons/calendar.tsx'
import PatientsIcon from './icons/patients.tsx'
import ProfileIcon from './icons/profile.tsx'
import matchActiveLink from '../../util/matchActiveLink.ts'
import cls from '../../util/cls.ts'
import { LinkDef, LinkProps } from '../../types.ts'

function BottomNavLink({
  href,
  title,
  active,
  Icon,
}: LinkProps) {
  return (
    <a
      href={href}
      className={cls('gap-0 text-sm flex flex-col mh-full justify-between', {
        'text-primary': active,
      })}
    >
      <span className='grow flex justify-center'>
        <Icon />
      </span>
      <span>
        {title}
      </span>
    </a>
  )
}

const bottomNavLinks: LinkDef[] = [
  { href: '/app', title: 'Home', Icon: HomeIcon },
  { href: '/app/calendar', title: 'Calendar', Icon: CalendarIcon },
  { href: '/app/patients', title: 'My Patients', Icon: PatientsIcon },
  { href: '/app/profile', title: 'My Profile', Icon: ProfileIcon },
]

const matchingButtonNavLink = matchActiveLink(bottomNavLinks)

export default function BottomNav({ route }: { route: string }) {
  const activeLink = matchingButtonNavLink(route)
  return (
    <footer className='fixed bottom-0 w-full flex justify-around gap-2 p-1 md:hidden bg-white border-t border-gray-200 h-14'>
      {bottomNavLinks.map((link) => (
        <BottomNavLink {...link} active={link === activeLink} />
      ))}
    </footer>
  )
}
