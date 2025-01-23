// deno-lint-ignore-file

// A hack? Maybe, but the idea is to hijack all form submissions so that we can
// do a fetch request and then show an error on the current page if there is one, rather than losing the whole form.
// The logic for 200s is to replace the current page with the response text. This is more complicated than I'd like,
// but there's no way to manually get the 302 location without following the redirect and getting the whole HTML, so
// rather than fetch the page twice, we replace the current page with the response text.
addEventListener('submit', function (event) {
  var submitButton

  function onError(errorMessage) {
    submitButton.disabled = false
    console.log('errorMessage', errorMessage)

    // On ZodError's focus on the first invalid input
    // Mark the other inputs as invalid as well, which should get cleared before submission
    if (errorMessage.startsWith('{')) {
      var json = JSON.parse(errorMessage)
      if (json.name === 'ZodError') {
        json.issues.forEach(function (issue, index) {
          var path = issue.path.join('.')
          var element = document.querySelector('[name="' + path + '"]')
          if (
            getAttr(element, 'type') === 'hidden' &&
            path.endsWith('id')
          ) {
            element = document.querySelector(
              '[name="' + path.replace(/id$/, 'name') + '"]',
            )
          }
          element.setCustomValidity(issue.message)
          if (!index) {
            element.focus()
            element.reportValidity()
          }
        })
        return
      }
    }

    var event = new CustomEvent('show-error', { detail: errorMessage })
    dispatchEvent(event)
  }

  var form = event.target
  if (form.method !== 'post') return

  event.preventDefault()
  var formData = new FormData(form)

  if (event.submitter) {
    formData.append(event.submitter.name, event.submitter.value)
  }

  submitButton = form.querySelector('button[type="submit"]')
  submitButton.disabled = true

  // Copied from turbolinks
  function load(innerHTML) {
    var htmlElement = document.createElement('html')
    htmlElement.innerHTML = innerHTML
    var hijackScript = htmlElement.querySelector(
      'script[src="/hijack-form-submission-a-la-tubolinks.js"]',
    )
    if (hijackScript) {
      hijackScript.parentNode.removeChild(hijackScript)
    }
    var newHead = htmlElement.querySelector('head')
    var newBody = htmlElement.querySelector('body')
    document.documentElement.replaceChild(newHead, document.head)
    document.documentElement.replaceChild(newBody, document.body)
    document.documentElement.querySelectorAll('script').forEach(
      function (element) {
        var parentNode = element.parentNode
        if (parentNode) {
          var createdScriptElement = document.createElement('script')
          createdScriptElement.textContent = element.textContent
          createdScriptElement.async = false
          Array.prototype.forEach.call(element.attributes, function (attr) {
            createdScriptElement.setAttribute(attr.name, attr.value)
          })
          parentNode.replaceChild(createdScriptElement, element)
        }
      },
    )
  }

  // TODO: Add a loading indicator
  fetch(form.action, {
    method: 'POST',
    body: formData,
  }).then(function (response) {
    switch (response.status) {
      case 200:
        return response.text().then(function (text) {
          load(text)
          history.pushState({}, '', response.url)
        })
      case 201:
        return
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
