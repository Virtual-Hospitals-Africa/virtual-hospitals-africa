import { LoggedInHealthWorkerContext } from '../../types.ts'
import { HealthWorkerHomePage } from './_middleware.tsx'
import { notifications } from '../../db/models/notifications.ts'
import Pagination from '../../components/library/Pagination.tsx'
import { vapid_public_key } from '../../external-clients/web-push-config.ts'
import { EnableWebPushNotifications } from '../../islands/notifications/EnableWebPushNotifications.tsx'
import { MarkPageNotificationsSeen } from '../../islands/notifications/MarkPageNotificationsSeen.tsx'
import { NotificationsList } from '../../islands/notifications/NotificationsList.tsx'

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

    const notification_ids = results.map((notification) => notification.notification_id)
    const show_pagination = results.length > 0 || page > 1

    return (
      <form method='get' className='flex flex-col gap-4'>
        <EnableWebPushNotifications vapid_public_key={vapid_public_key} />
        {notification_ids.length > 0 && <MarkPageNotificationsSeen notification_ids={notification_ids} />}
        <NotificationsList notifications={results} page={page} />
        {show_pagination && <Pagination page={page} has_next_page={has_next_page} />}
      </form>
    )
  },
)
