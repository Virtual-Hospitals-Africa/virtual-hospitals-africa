import { ApplicationServer, importVapidKeys, PushMessageError } from '@negrel/webpush'
import { vapid_public_key, vapid_server_config } from './web-push-config.ts'
import isObjectLike from '../util/isObjectLike.ts'

export type WebPushNotificationPayload = {
  title: string
  body: string
  url?: string
  // URL the service worker POSTs to when the notification is clicked
  action_href?: string
  notification_id?: string
  notification_type?: string
}

export type WebPushSubscriptionInput = {
  endpoint: string
  p256dh: string
  auth: string
}

export function webPushSubscriptionFromRow({
  endpoint,
  p256dh,
  auth,
}: WebPushSubscriptionInput) {
  return {
    endpoint,
    keys: {
      p256dh,
      auth,
    },
  }
}

const EXPIRED_WEB_PUSH_STATUS_CODES = new Set([404, 410])

function webPushStatusCode(error: unknown): number | undefined {
  if (error instanceof PushMessageError) return error.response.status
  if (isObjectLike(error) && 'statusCode' in error) {
    const { statusCode } = error
    if (typeof statusCode === 'number') return statusCode
  }
  return undefined
}

export function isExpiredWebPushSubscriptionError(error: unknown): boolean {
  const status = webPushStatusCode(error)
  return status !== undefined && EXPIRED_WEB_PUSH_STATUS_CODES.has(status)
}

export function webPushSendErrorSummary(error: unknown): string {
  if (!isObjectLike(error)) return String(error)

  const summary: Record<string, unknown> = {}
  if ('name' in error && typeof error.name === 'string') summary.name = error.name
  if ('message' in error && typeof error.message === 'string') summary.message = error.message
  if ('statusCode' in error && typeof error.statusCode === 'number') summary.statusCode = error.statusCode
  if ('body' in error) summary.body = error.body
  if ('headers' in error) summary.headers = error.headers

  return Object.keys(summary).length ? JSON.stringify(summary) : String(error)
}

export type SendWebPushNotificationResult =
  | { ok: true }
  | { ok: false; error: unknown; expired_subscription: boolean }

// @negrel/webpush wants VAPID keys as a CryptoKeyPair imported from JWK, but our
// env vars hold the keys as base64url-encoded raw bytes (RFC 8292 format): the
// public key is the 65-byte uncompressed P-256 point, the private key the 32-byte
// scalar. Convert to JWK so importVapidKeys can build the CryptoKeyPair.
function base64UrlToBytes(value: string): Uint8Array {
  const padding = '='.repeat((4 - (value.length % 4)) % 4)
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

let application_server_promise: Promise<ApplicationServer> | undefined

function getApplicationServer(): Promise<ApplicationServer> {
  if (!application_server_promise) {
    application_server_promise = (async () => {
      const public_bytes = base64UrlToBytes(vapid_public_key) // 0x04 || x(32) || y(32)
      const x = bytesToBase64Url(public_bytes.slice(1, 33))
      const y = bytesToBase64Url(public_bytes.slice(33, 65))
      const vapid_keys = await importVapidKeys({
        publicKey: { kty: 'EC', crv: 'P-256', x, y, ext: true },
        privateKey: {
          kty: 'EC',
          crv: 'P-256',
          x,
          y,
          d: vapid_server_config.private_key,
          ext: true,
        },
      })
      return ApplicationServer.new({
        contactInformation: vapid_server_config.subject,
        vapidKeys: vapid_keys,
      })
    })().catch((error) => {
      // Don't cache a failed init; let the next send retry.
      application_server_promise = undefined
      throw error
    })
  }
  return application_server_promise
}

export async function sendWebPushNotification({
  endpoint,
  p256dh,
  auth,
  payload,
}: WebPushSubscriptionInput & { payload: WebPushNotificationPayload }): Promise<SendWebPushNotificationResult> {
  try {
    const app_server = await getApplicationServer()
    const subscriber = app_server.subscribe(webPushSubscriptionFromRow({ endpoint, p256dh, auth }))
    await subscriber.pushTextMessage(JSON.stringify(payload), { ttl: 60 })
    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error,
      expired_subscription: isExpiredWebPushSubscriptionError(error),
    }
  }
}
