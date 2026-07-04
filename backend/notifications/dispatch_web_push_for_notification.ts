import db from '../../db/db.ts'
import { notifications } from '../../db/models/notifications.ts'
import { health_worker_web_push_subscriptions } from '../../db/models/health_worker_web_push_subscriptions.ts'
import {
  sendWebPushNotification as defaultSendWebPushNotification,
  type SendWebPushNotificationResult,
  type WebPushNotificationPayload,
  webPushSendErrorSummary,
  type WebPushSubscriptionInput,
} from '../../external-clients/web-push.ts'
import type { RenderedNotification } from '../../types.ts'

export type DispatchWebPushForNotificationInput = {
  notification_id: string
  health_worker_id: string
}

export type DispatchWebPushForNotificationDeps = {
  sendWebPushNotification: (
    input: WebPushSubscriptionInput & { payload: WebPushNotificationPayload },
  ) => Promise<SendWebPushNotificationResult>
}

const default_deps: DispatchWebPushForNotificationDeps = {
  sendWebPushNotification: defaultSendWebPushNotification,
}

// action_href is a URL to POST to, which the service worker does on
// notification click before navigating to wherever the POST redirects
function webPushActionHrefForNotification(
  action_href: string,
): string | undefined {
  if (!action_href || action_href === '#todo') return undefined
  return action_href
}

function webPushPayloadFromNotification(
  notification: RenderedNotification,
): WebPushNotificationPayload {
  const action_href = webPushActionHrefForNotification(
    notification.action.href,
  )
  return {
    title: notification.title,
    body: notification.description,
    url: '/app/notifications',
    ...(action_href && { action_href }),
    notification_id: notification.notification_id,
    notification_type: notification.notification_type,
  }
}

async function deliverWebPushToSubscription({
  subscription,
  payload,
  notification_id,
  deps,
}: {
  subscription: {
    endpoint: string
    p256dh: string
    auth: string
  }
  payload: WebPushNotificationPayload
  notification_id: string
  deps: DispatchWebPushForNotificationDeps
}) {
  try {
    const result = await deps.sendWebPushNotification({
      endpoint: subscription.endpoint,
      p256dh: subscription.p256dh,
      auth: subscription.auth,
      payload,
    })

    if (result.ok) return

    if (result.expired_subscription) {
      await health_worker_web_push_subscriptions.deleteByEndpoint(db, {
        endpoint: subscription.endpoint,
      })
      return
    }

    console.error('notifications web push delivery failed', {
      notification_id,
      endpoint: subscription.endpoint,
      error: webPushSendErrorSummary(result.error),
    })
  } catch (error) {
    console.error('notifications web push delivery threw', {
      notification_id,
      endpoint: subscription.endpoint,
      error,
    })
  }
}

export async function dispatchWebPushForNotification(
  { notification_id, health_worker_id }: DispatchWebPushForNotificationInput,
  deps: DispatchWebPushForNotificationDeps = default_deps,
): Promise<void> {
  const notification = await notifications.getByIdOptional(db, notification_id, {
    health_worker_id,
  })
  if (!notification) {
    const row = await db
      .selectFrom('health_worker_web_notifications')
      .select('health_worker_id')
      .where('id', '=', notification_id)
      .executeTakeFirst()

    if (row && row.health_worker_id !== health_worker_id) {
      console.error('notifications web push health_worker_id mismatch', {
        notification_id,
        health_worker_id,
        actual_health_worker_id: row.health_worker_id,
      })
    }
    return
  }

  const subscriptions = await health_worker_web_push_subscriptions.listByHealthWorkerId(db, {
    health_worker_id,
  })
  if (!subscriptions.length) return

  const payload = webPushPayloadFromNotification(notification)

  await Promise.allSettled(
    subscriptions.map((subscription) =>
      deliverWebPushToSubscription({
        subscription,
        payload,
        notification_id,
        deps,
      })
    ),
  )
}
