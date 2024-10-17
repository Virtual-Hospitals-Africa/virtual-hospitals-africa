// deno-lint-ignore-file

// A hack? Maybe, but the idea is to hijack all form submissions so that we can
// do a fetch request and then show an error on the current page if there is one, rather than losing the whole form.
// The logic for 200s is to replace the current page with the response text. This is more complicated than I'd like,
// but there's no way to manually get the 302 location without following the redirect and getting the whole HTML, so
// rather than fetch the page twice, we replace the current page with the response text.
addEventListener('submit', function (event) {
  var submitButton

  function onError(errorMessage) {
    var event = new CustomEvent('show-error', { detail: errorMessage })
    dispatchEvent(event)
    submitButton.disabled = false
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
      'script[src="/hijack-form-submission-and-set-focus.js"]',
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
          const createdScriptElement = document.createElement('script')
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

// Set focus on the first input or select element in the form when
// navigating to a subsection with hash
window.navigation.addEventListener('navigate', function (event) {
  let sectionID
  if (location.hash) {
    sectionID = location.hash.split('=')[1]
  }

  const focusableElement = document.querySelector(
    `input[name^="${sectionID}"], select[name^="${sectionID}"]`,
  )
  if (focusableElement) {
    focusableElement.focus()
  } else {
    const firstFocusableElement = document.querySelector('input, select')
    if (firstFocusableElement) {
      firstFocusableElement.focus()
    }
  }
})
