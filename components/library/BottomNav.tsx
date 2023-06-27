import { JSX } from 'preact/jsx-runtime'
import HomeIcon from '../icons/home.tsx'
import CalendarIcon from '../icons/calendar.tsx'
import PatientsIcon from '../icons/patients.tsx'
import ProfileIcon from '../icons/profile.tsx'
import sortBy from '../../util/sortBy.ts'
import matchActiveLink from '../../util/matchActiveLink.ts'
import cls from '../../util/cls.ts'
import { LinkDef, LinkProps } from '../../types.ts'

function BottomNavLink({
  href,
  title,
  active,
  Icon,
}: LinkProps) {
  console.log(
    href,
    active,
    cls({
      'text-primary': active,
    }),
  )
  return (
    <a
      href={href}
      className={'gap-0 text-sm flex flex-col mh-full justify-between' + cls({
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

const bottomNavLinksByLength = sortBy(
  bottomNavLinks,
  (link: LinkDef) => -link.href.length,
)

export default function BottomNav({ route }: { route: string }) {
  const activeLink = matchActiveLink<LinkDef>(bottomNavLinksByLength, route)
  return (
    <footer className='absolute bottom-0 w-full flex justify-around gap-2 p-1 md:hidden'>
      {bottomNavLinks.map((link) => (
        <BottomNavLink {...link} active={link === activeLink} />
      ))}
    </footer>
  )
}
