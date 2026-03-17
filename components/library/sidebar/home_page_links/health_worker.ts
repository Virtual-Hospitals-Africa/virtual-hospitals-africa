import {
  AcademicCapIcon,
  ArchiveBoxIcon,
  ArrowRightOnRectangleIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  IdentificationIcon,
  LightBulbIcon,
  PresentationChartBarIcon,
} from '../../icons/heroicons/outline.tsx'
import { LinkDef } from '../../../../types.ts'

export const practitioner_home_page_nav_links: LinkDef[] = [
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
  {
    route: '/tutorial',
    title: 'Tutorial',
    Icon: LightBulbIcon,
  },
  { route: '/app/logout', title: 'Log Out', Icon: ArrowRightOnRectangleIcon },
]
