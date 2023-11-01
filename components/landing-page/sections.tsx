import { JSX } from 'preact'
import capitalize from '../../util/capitalize.ts'
import {
  GlobeEuropeAfricaIcon,
  IdentificationIcon,
  PresentationChartBarIcon,
  UserCircleIcon,
  UsersIcon,
} from '../library/icons/heroicons/outline.tsx'

const icons = {
  'health-workers': <IdentificationIcon />,
  'patients': <UserCircleIcon />,
  'research': <PresentationChartBarIcon />,
  'partners': <GlobeEuropeAfricaIcon />,
  'team': <UsersIcon />,
}

const sections = Object.keys(icons).reduce(
  (sections, name) => ({
    ...sections,
    [name]: {
      icon: icons[name as keyof typeof icons],
      displayName: capitalize(name, { splitHyphen: true }),
      title: `${name}-title`,
      href: `#${name}`,
    },
  }),
  {} as Record<keyof typeof icons, {
    icon: JSX.Element
    displayName: string
    title: string
    href: string
  }>,
)

export default sections
