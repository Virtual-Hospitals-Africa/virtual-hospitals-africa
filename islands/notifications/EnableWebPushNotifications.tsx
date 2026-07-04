import { useSignal } from '@preact/signals'
import { useEffect } from 'preact/hooks'
import { Button } from '../../components/library/Button.tsx'
import { applicationServerKeysMatch, urlBase64ToUint8Array } from '../../backend/notifications/application_server_key.ts'
import { showAlertMessage } from '../alert/AlertListener.tsx'

function browserSupportsWebPush() {
  return 'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
}

async function persistPushSubscription(subscription: PushSubscription) {
  const subscription_json = subscription.toJSON()
  const save_response = await fetch('/app/web-push-subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: subscription_json.endpoint,
      keys: subscription_json.keys,
    }),
  })
  return save_response.ok
}

async function ensurePushSubscription(
  service_worker: ServiceWorkerRegistration,
  vapid_public_key: string,
) {
  const application_server_key = urlBase64ToUint8Array(vapid_public_key)
  const subscription = await service_worker.pushManager.getSubscription()

  if (
    subscription &&
    applicationServerKeysMatch(
      subscription.options.applicationServerKey,
      vapid_public_key,
    )
  ) {
    return subscription
  }

  if (subscription) {
    await subscription.unsubscribe()
  }

  return await service_worker.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: application_server_key,
  })
}

export function EnableWebPushNotifications(
  { vapid_public_key }: { vapid_public_key: string },
) {
  const enabled = useSignal(false)
  const loading = useSignal(false)

  useEffect(() => {
    async function restoreSubscriptionState() {
      try {
        if (!browserSupportsWebPush()) return
        if (Notification.permission !== 'granted') return

        const service_worker = await navigator.serviceWorker.getRegistration()
        if (!service_worker) return

        const subscription = await service_worker.pushManager.getSubscription()
        if (
          !subscription ||
          !applicationServerKeysMatch(
            subscription.options.applicationServerKey,
            vapid_public_key,
          )
        ) {
          return
        }

        if (await persistPushSubscription(subscription)) {
          enabled.value = true
        } else {
          console.error('Could not persist existing push subscription during mount reconciliation')
        }
      } catch (error) {
        console.error(error)
      }
    }

    restoreSubscriptionState()
  }, [vapid_public_key])

  async function enableWebPush() {
    if (loading.value || enabled.value) return
    loading.value = true

    try {
      if (!browserSupportsWebPush()) {
        showAlertMessage({
          level: 'error',
          message: 'Push notifications are not supported in this browser.',
        })
        return
      }

      const service_worker = await navigator.serviceWorker.register('/service-worker.js')

      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        showAlertMessage({
          level: 'warning',
          message: 'Notification permission was not granted. Enable notifications in your browser settings to receive push alerts.',
        })
        return
      }

      const subscription = await ensurePushSubscription(service_worker, vapid_public_key)

      if (!(await persistPushSubscription(subscription))) {
        showAlertMessage({
          level: 'error',
          message: 'Could not save your push notification subscription. Please try again.',
        })
        return
      }

      enabled.value = true
      showAlertMessage({
        level: 'success',
        message: 'Push notifications enabled. You will receive alerts when you are away from this page.',
      })
    } catch (error) {
      console.error(error)
      showAlertMessage({
        level: 'error',
        message: 'Could not enable push notifications. Please try again.',
      })
    } finally {
      loading.value = false
    }
  }

  const button_label = loading.value ? 'Enabling…' : enabled.value ? 'Push notifications enabled' : 'Enable push notifications'

  return (
    <div className='rounded-lg border border-gray-200 bg-white p-4 shadow'>
      <p className='text-sm text-gray-600'>
        Receive alerts on this device when you are not actively using the app.
      </p>
      <Button
        type='button'
        variant='secondary'
        className='mt-3'
        disabled={loading.value || enabled.value}
        onClick={enableWebPush}
      >
        {button_label}
      </Button>
    </div>
  )
}
