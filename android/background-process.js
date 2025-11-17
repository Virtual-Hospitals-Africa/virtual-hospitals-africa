Notification.requestPermission().then(function (result) {
  if (result !== 'granted') {
    return console.log('Permissions not granted', result)
  }

  var wsUri = 'wss://' + self.location.host + '/app/notifications-websocket'
  var websocket = new WebSocket(wsUri)

  websocket.onopen = function () {
    console.log('websocket open')
  }

  websocket.onclose = function () {
    console.log('websocket close')
  }

  websocket.onmessage = function (e) {
    var notification_data = JSON.parse(e.data)
    /*
    {
        "created_at": notification_data.created_at,
        "updated_at": notification_data.updated_at,
        "health_worker_id": nurse.health_worker.id,
        "notification_type": "patient_encounter_immediate_triage",
        "title": "Immediate Triage Requested",
        "description": `${employeeDisplay(receptionist_employee).display_name} has requested immediate triage for a patient`,
        "avatar_url": "/images/heroicons/24/solid/exclamation-triangle.svg",
        "seen_at": null,
        "notification_id": notification_data.notification_id,
        "time_display": "Just now",
        "action": {
          "title": "View patient case",
          "href": `/app/organizations/${organization.id}/patients/${patient_id}/open_encounter/respond-to-immediate-triage-request`
        }
      }
    */
    var notification = new Notification(notification_data.title, {
      body: notification_data.description,
      icon: notification_data.avatar_url,
      timestamp: notification_data.created_at,
    })
    notification.onclick = function () {
      window.location.href = notification_data.action.href
    }
  }

  websocket.onerror = function (e) {
    console.error(e)
  }
})
