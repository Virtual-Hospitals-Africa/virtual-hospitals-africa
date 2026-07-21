import {
  AcademicCapIcon,
  ArchiveBoxIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  IdentificationIcon,
  LightBulbIcon,
  PresentationChartBarIcon,
  Squares2x2Icon,
  UserGroupIcon,
} from '../../icons/heroicons/outline.tsx'
import type { Priority } from '../../../../shared/priorities.ts'
import { LinkDef } from '../../../../types.ts'

export function practitionerHomePageNavLinks({
  health_worker_notification_count,
  health_worker_notification_priority,
}: {
  health_worker_notification_count: number
  health_worker_notification_priority: Priority | null
}): LinkDef[] {
  return [
    {
      route: '/app/organizations/:organization_id/dashboard',
      title: 'Dashboard',
      Icon: Squares2x2Icon,
    },
    {
      route: '/app/organizations/:organization_id/waiting_room',
      title: 'Open Encounters',
      Icon: ClockIcon,
    },
    { route: '/app/employees', title: 'Employees', Icon: IdentificationIcon },
    { route: '/app/health_workers', title: 'Health Workers', Icon: UserGroupIcon },
    { route: '/app/organizations', title: 'Organizations', Icon: BuildingOffice2Icon },
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
    {
      route: '/app/notifications',
      title: 'Notifications',
      Icon: BellIcon,
      count: health_worker_notification_count,
      notification_priority: health_worker_notification_priority,
    },
    { route: '/app/logout', title: 'Log Out', Icon: ArrowRightOnRectangleIcon },
  ]
}
