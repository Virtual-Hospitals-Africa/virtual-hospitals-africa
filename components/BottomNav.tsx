import HomeIcon from './icons/home.tsx'
import CalendarIcon from './icons/calendar.tsx'
import PatientsIcon from './icons/patients.tsx'
import ProfileIcon from './icons/profile.tsx'
import sortBy from '../util/sortBy.ts'
import cls from '../util/cls.ts'
import { JSX } from 'preact/jsx-runtime'

type LinkProps = {
  href: string
  title: string
  active: boolean
  Icon: (props: JSX.SVGAttributes<SVGSVGElement>) => JSX.Element
}

type LinkDef = Omit<LinkProps, 'active'>

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
  const activeLink = bottomNavLinksByLength.find((link: LinkDef) =>
    route.startsWith(link.href)
  )

  return (
    <footer className='absolute bottom-0 w-full flex justify-around gap-2 p-1'>
      {bottomNavLinks.map((link) => (
        <BottomNavLink {...link} active={link === activeLink} />
      ))}
    </footer>
  )
}
