// deno-lint-ignore-file

window.addEventListener('submit', function (event) {
  var submitButton

  function onError(errorMessage) {
    var event = new CustomEvent('request-error', { detail: errorMessage })
    window.dispatchEvent(event)
    submitButton.disabled = false
  }

  var form = event.target
  if (form.method !== 'post') return

  event.preventDefault()
  var formData = new FormData(form)

  submitButton = form.querySelector('button[type="submit"]')
  submitButton.disabled = true

  // TODO: Add a loading indicator

  fetch(form.action, {
    method: 'POST',
    body: formData,
  }).then(function (response) {
    switch (response.status) {
      case 200:
        return response.text().then(function (text) {
          window.document.body.innerHTML = text
          history.pushState({}, '', response.url)
        })
      case 400:
        return response.text().then(onError)
      case 401:
        return response.text().then(function (text) {
          return onError(text ? 'Unauthorized: ' + text : 'Unauthorized')
        })
      case 403:
        return response.text().then(function (text) {
          return onError(text ? 'Forbidden: ' + text : 'Forbidden')
        })
      case 500:
        return response.text().then(function (text) {
          return onError('Internal Server Error: ' + text)
        })
      default:
        return onError('Unexpected response status: ' + response.status)
    }
  }, function (error) {
    console.error(error)
    return onError('Offline: ' + error.message || error)
  })
})
