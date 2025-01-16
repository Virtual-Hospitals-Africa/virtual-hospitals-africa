import { Fragment } from 'preact'
import { Transition } from '@headlessui/react'
import { BellIcon } from '../components/library/icons/heroicons/outline.tsx'
import { RenderedNotification } from '../types.ts'
import Avatar from '../components/library/Avatar.tsx'
import { useSignal } from '@preact/signals'

export function Notifications(
  { show, notifications, dismiss }: {
    show: boolean
    notifications: RenderedNotification[]
    dismiss: (notification: RenderedNotification) => void
  },
) {
  return (
    <>
      {/* Global notification live region, render this permanently at the end of the document */}
      <div
        aria-live='assertive'
        className='pointer-events-none fixed inset-0 flex items-end px-4 pt-20 sm:items-start z-10'
      >
        <div className='flex w-full flex-col items-center space-y-4 sm:items-end'>
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
            <div className='w-full flex flex-col gap-2'>
              {notifications.map((notification) => (
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
    <div className='pointer-events-auto flex w-full max-w-md rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 float-right z-9 self-end'>
      <div className='w-0 flex-1 p-4'>
        <div className='flex items-start'>
          <Avatar
            className='w-6 h-6'
            src={notification.avatar_url}
            hide_when_empty
          />
          <div className='ml-3 w-0 flex-1'>
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
          <div className='flex h-0 flex-1'>
            <a
              type='button'
              className='flex w-full items-center justify-center rounded-none rounded-tr-lg border border-transparent px-4 py-3 text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:z-10 focus:outline-none focus:ring-2 focus:ring-indigo-500'
              href={notification.action.href}
            >
              {notification.action.title}
            </a>
          </div>
          <div className='flex h-0 flex-1'>
            <button
              type='button'
              className='flex w-full items-center justify-center rounded-none rounded-br-lg border border-transparent px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500'
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
        className='rounded-full bg-white p-1 text-indigo-700 hover:text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-900 focus:ring-offset-2 focus:ring-offset-gray-800'
        onClick={() => show.value = !show.value}
      >
        <span className='sr-only'>View notifications</span>
        <BellIcon
          className='h-6 w-6'
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
