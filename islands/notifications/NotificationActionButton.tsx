import { ComponentChildren } from 'preact'
import { markNotificationsSeen } from './markNotificationsSeen.ts'

// Notification action hrefs are URLs to POST to. On click, POST then
// navigate to wherever the response redirects.
export function NotificationActionButton({
  notification_id,
  href,
  children,
  className,
}: {
  notification_id: string
  href: string
  children: ComponentChildren
  className?: string
}) {
  async function activate() {
    void markNotificationsSeen(notification_id, { keepalive: true })
    const response = await fetch(href, {
      method: 'POST',
      redirect: 'follow',
    })
    self.location.assign(
      response.redirected ? response.url : '/app/notifications',
    )
  }

  return (
    <button type='button' className={className} onClick={activate}>
      {children}
    </button>
  )
}
