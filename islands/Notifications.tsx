import { Transition } from '@headlessui/react'
import { BellIcon } from '../components/library/icons/heroicons/outline.tsx'
import { RenderedNotification } from '../types.ts'
import Avatar from '../components/library/Avatar.tsx'
import { useSignal } from '@preact/signals'
import { useEffect } from 'preact/hooks'
import { assert } from 'std/assert/assert.ts'
import { Fragment } from 'preact'

/* NOTIFICATIONS SUBSCRIPTION */

export function Notifications(
  { show, notifications, dismiss }: {
    show: boolean
    notifications: RenderedNotification[]
    dismiss: (notification: RenderedNotification) => void
  },
) {
  const notifications_signal = useSignal(notifications)

  useEffect(() => {
    function listener(event: Event) {
      console.log('notification event', event)
      assert(event instanceof CustomEvent)
      notifications_signal.value = [event.detail, ...notifications_signal.value]
    }
    self.addEventListener('notification', listener)
    return () => self.removeEventListener('notification', listener)
  }, [notifications_signal.value])

  return (
    <>
      {/* Global notification live region, render this permanently at the end of the document */}
      <div
        aria-live='assertive'
        className='fixed inset-0 z-10 flex items-end px-4 pt-20 pointer-events-none sm:items-start'
      >
        <div className='flex flex-col items-center w-full space-y-4 sm:items-end'>
          {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
          <Transition
            show={show}
            as={Fragment}
            enter='transform ease-out duration-300 transition'
            enterFrom='translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2'
            enterTo='translate-y-0 opacity-100 sm:translate-x-0'
            leave='transition ease-in duration-100'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='flex flex-col w-full gap-2'>
              {notifications_signal.value.map((notification) => (
                <Notification
                  notification={notification}
                  dismiss={() => dismiss(notification)}
                  key={notification.notification_id}
                />
              ))}
            </div>
          </Transition>
        </div>
      </div>
    </>
  )
}

export function Notification(
  { notification, dismiss }: {
    notification: RenderedNotification
    dismiss: () => void
  },
) {
  return (
    <div className='flex self-end float-right w-full max-w-md bg-white rounded-lg shadow-lg pointer-events-auto ring-1 ring-black ring-opacity-5 z-9'>
      <div className='flex-1 w-0 p-4'>
        <div className='flex items-start'>
          <Avatar
            className='w-6 h-6'
            src={notification.avatar_url}
            hide_when_empty
          />
          <div className='flex-1 w-0 ml-3'>
            <p className='text-sm font-medium text-gray-900'>
              {notification.title}
            </p>
            <p className='mt-1 text-sm text-gray-500'>
              {notification.description}
            </p>
          </div>
        </div>
      </div>
      <div className='flex border-l border-gray-200'>
        <div className='flex flex-col divide-y divide-gray-200'>
          <div className='flex flex-1 h-0'>
            <a
              type='button'
              className='flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-indigo-600 border border-transparent rounded-none rounded-tr-lg hover:text-indigo-500 focus:z-10 focus:outline-none focus:ring-2 focus:ring-indigo-500'
              href={notification.action.href}
            >
              {notification.action.title}
            </a>
          </div>
          <div className='flex flex-1 h-0'>
            <button
              type='button'
              className='flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-gray-700 border border-transparent rounded-none rounded-br-lg hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500'
              onClick={dismiss}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function NotificationsButton(
  props: { notifications: RenderedNotification[] },
) {
  const show = useSignal(false)
  const notifications = useSignal(props.notifications)

  function dismiss(notification: RenderedNotification) {
    notifications.value = notifications.value.filter((n) => n !== notification)

    // TODO: error handling?
    fetch(`/api/notifications/${notification.notification_id}/dismiss`, {
      method: 'POST',
    })
  }

  return (
    <div className='relative'>
      <button
        type='button'
        className='p-1 text-indigo-700 bg-white rounded-full hover:text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-900 focus:ring-offset-2 focus:ring-offset-gray-800'
        onClick={() => show.value = !show.value}
      >
        <span className='sr-only'>View notifications</span>
        <BellIcon
          className='w-6 h-6'
          stroke-width='1.5'
          stroke='currentColor'
          aria-hidden='true'
        />
      </button>
      {notifications.value.length > 0 && (
        <span className='absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-green-600 rounded-full'>
          {notifications.value.length}
        </span>
      )}
      <Notifications
        show={show.value}
        notifications={notifications.value}
        dismiss={dismiss}
      />
    </div>
  )
}
