import { useEffect } from 'preact/hooks'
import { useSignal } from '@preact/signals'
import { assert } from 'std/assert/assert.ts'
import { RenderedNotification } from '../../types.ts'
import Avatar from '../../components/library/Avatar.tsx'
import { EmptyState } from '../../components/library/EmptyState.tsx'
import { BellIcon } from '../../components/library/icons/heroicons/outline.tsx'
import { NotificationActionButton } from './NotificationActionButton.tsx'
import { markNotificationsSeen } from './markNotificationsSeen.ts'

export function NotificationsList(
  { notifications, page }: {
    notifications: RenderedNotification[]
    page: number
  },
) {
  const notifications_signal = useSignal(notifications)

  useEffect(() => {
    function listener(event: Event) {
      assert(event instanceof CustomEvent)
      if (event.detail?.type !== 'new_notification') return
      if (page !== 1) return

      const notification_id = event.detail.notification_id
      if (typeof notification_id !== 'string') return
      if (
        notifications_signal.value.some((n) => n.notification_id === notification_id)
      ) {
        return
      }

      const { type: _type, ...notification } = event.detail
      notifications_signal.value = [notification, ...notifications_signal.value]
      void markNotificationsSeen(notification_id)
    }

    self.addEventListener('notification', listener)
    return () => self.removeEventListener('notification', listener)
  }, [page])

  if (!notifications_signal.value.length) {
    return (
      <EmptyState
        header='No notifications yet'
        explanation="When you have notifications, they'll show up here."
        Icon={BellIcon}
      />
    )
  }

  return (
    <ul role='list' className='divide-y divide-gray-200 bg-white shadow rounded-lg'>
      {notifications_signal.value.map((notification) => (
        <NotificationRow
          key={notification.notification_id}
          notification={notification}
        />
      ))}
    </ul>
  )
}

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
        className='inline-flex items-center justify-center shrink-0 border border-gray-300 bg-white text-indigo-600 font-semibold rounded-lg hover:border-indigo-600 hover:bg-indigo-50 h-8 px-3 text-sm whitespace-nowrap'
      >
        {notification.action.title}
      </NotificationActionButton>
    </li>
  )
}
