// deno-lint-ignore-file
addEventListener('push', (event) => {
  var title = 'New VHA notification'
  var body = 'You have a new notification.'
  var url = '/app/notifications'
  var action_href
  var notification_id

  if (event.data) {
    var payload
    try {
      payload = event.data.json()
    } catch (_e) {
      body = event.data.text()
      payload = null
    }

    if (payload) {
      if (payload.title) title = payload.title
      if (payload.body) body = payload.body
      if (payload.url) url = payload.url
      if (payload.action_href) action_href = payload.action_href
      if (payload.notification_id) notification_id = payload.notification_id
    }
  }

  var data = { url }
  if (action_href) data.action_href = action_href
  if (notification_id) data.notification_id = notification_id

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      data,
    }),
  )
})

addEventListener('notificationclick', (event) => {
  event.notification.close()

  var data = event.notification.data || {}

  event.waitUntil((async () => {
    var url = data.url || '/app/notifications'

    // action_href is a URL to POST to; navigate to wherever it redirects
    if (data.action_href) {
      try {
        var response = await fetch(data.action_href, {
          method: 'POST',
          credentials: 'include',
          redirect: 'follow',
        })
        if (response.redirected) url = response.url
      } catch (_e) {
        // fall through to navigating to the notifications page
      }
    }

    var window_clients = await clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    })

    if (window_clients.length) {
      var client = window_clients[0]

      if ('navigate' in client) {
        await client.navigate(url)
      }

      return client.focus()
    }

    return clients.openWindow(url)
  })())
})
