import { LoggedInHealthWorkerContext, RenderedNotification } from '../../types.ts'
import { HealthWorkerHomePage } from './_middleware.tsx'
import { notifications } from '../../db/models/notifications.ts'
import Pagination from '../../components/library/Pagination.tsx'
import Avatar from '../../components/library/Avatar.tsx'
import { EmptyState } from '../../components/library/EmptyState.tsx'
import { BellIcon } from '../../components/library/icons/heroicons/outline.tsx'
import { vapid_public_key } from '../../external-clients/web-push-config.ts'
import { EnableWebPushNotifications } from '../../islands/notifications/EnableWebPushNotifications.tsx'
import { MarkPageNotificationsSeen } from '../../islands/notifications/MarkPageNotificationsSeen.tsx'
import { NotificationActionButton } from '../../islands/notifications/NotificationActionButton.tsx'

const ROWS_PER_PAGE = 25

export default HealthWorkerHomePage(
  'Notifications',
  async function NotificationsPage(ctx: LoggedInHealthWorkerContext) {
    const page_param = parseInt(ctx.url.searchParams.get('page') || '1', 10)
    const page = Number.isFinite(page_param) && page_param >= 1 ? page_param : 1

    const { results, has_next_page } = await notifications.search(
      ctx.state.trx,
      {
        health_worker_id: ctx.state.health_worker.id,
        recent_first: true,
      },
      { page, rows_per_page: ROWS_PER_PAGE },
    )

    if (results.length === 0 && page === 1) {
      return (
        <div className='flex flex-col gap-4'>
          <EnableWebPushNotifications vapid_public_key={vapid_public_key} />
          <EmptyState
            header='No notifications yet'
            explanation="When you have notifications, they'll show up here."
            Icon={BellIcon}
          />
        </div>
      )
    }

    const notification_ids = results.map((notification) => notification.notification_id)

    return (
      <form method='get' className='flex flex-col gap-4'>
        <EnableWebPushNotifications vapid_public_key={vapid_public_key} />
        {notification_ids.length > 0 && <MarkPageNotificationsSeen notification_ids={notification_ids} />}
        <ul role='list' className='divide-y divide-gray-200 bg-white shadow rounded-lg'>
          {results.map((notification) => (
            <NotificationRow
              key={notification.notification_id}
              notification={notification}
            />
          ))}
        </ul>
        <Pagination page={page} has_next_page={has_next_page} />
      </form>
    )
  },
)

function NotificationRow(
  { notification }: { notification: RenderedNotification },
) {
  return (
    <li className='flex items-start gap-4 p-4'>
      <Avatar src={notification.avatar_url} size='lg' hide_when_empty />
      <div className='min-w-0 flex-1'>
        <p className='text-sm font-medium text-gray-900'>{notification.title}</p>
        <p className='mt-1 text-sm text-gray-500'>{notification.description}</p>
        <p className='mt-1 text-xs text-gray-400'>{notification.time_display}</p>
      </div>
      <NotificationActionButton
        notification_id={notification.notification_id}
        href={notification.action.href}
        className='text-sm font-medium text-indigo-600 hover:text-indigo-500 whitespace-nowrap'
      >
        {notification.action.title}
      </NotificationActionButton>
    </li>
  )
}
