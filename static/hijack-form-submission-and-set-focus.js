// deno-lint-ignore-file

function getAttr(el, attr) {
  var item = el.attributes.getNamedItem(attr)
  return item && item.value
}

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

// Set focus on an element by its id or name
function setFocus(focus) {
  var focusableElement = document.getElementById(focus) ||
    document.querySelector(
      'input[name="' + focus + '"], select[name="' + focus +
        '"], textarea[name="' + focus + '"]',
    )

  if (focusableElement) {
    focusableElement.focus()
  }
}

function hashFocus() {
  if (!location.hash) return

  var params = new URLSearchParams(location.hash.replace('#', '?'))

  var focus = params.get('focus')
  if (!focus) return

  setFocus(focus)
}

// Set focus on the first input or select element in the form when
// navigating to a subsection with hash
addEventListener('navigate', hashFocus)

hashFocus()

function findNode(nodes, callback) {
  for (var i = 0; i < nodes.length; i++) {
    // console.log('node', nodes[i])
    if (callback(nodes[i])) {
      return nodes[i]
    }
    const found = findNode(nodes[i].childNodes, callback)
    // console.log('found', found)
    if (found) {
      return found
    }
  }
}

// Focus on any form elements that were newly created as a result of a click
var observer = new MutationObserver(function (mutations) {
  for (var i = 0; i < mutations.length; i++) {
    var mutation = mutations[i]
    if (mutation.type === 'childList') {
      const found = findNode(mutation.addedNodes, (node) => {
        var hasFormElementTag = node.tagName === 'INPUT' ||
          node.tagName === 'SELECT' ||
          node.tagName === 'TEXTAREA' || node.tagName === 'BUTTON'

        return hasFormElementTag &&
          !getAttr(node, 'disabled') &&
          !getAttr(node, 'readonly') &&
          !getAttr(node, 'hidden')
      })
      if (found) {
        found.focus()
        return
      }
    }
  }
})

addEventListener('click', function () {
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })
}, { capture: true })

function focusOnNextFormElement(
  e,
) {
  // debugger
  const formElements = Array.from(e.target.form.elements)
  const currentIndex = formElements.indexOf(e.target)
  const nextElement = formElements.slice(currentIndex + 1).find(function (el) {
    return getAttr(el, 'name') && !getAttr(el, 'disabled') &&
      (getAttr(el, 'type') !== 'hidden')
  })

  if (nextElement) {
    setTimeout(function () {
      nextElement.focus()
    }, 100)
  }
}

addEventListener('input', function (e) {
  // console.log('input', e)
  var is_input = e.target.tagName === 'INPUT'
  if (!is_input) {
    return
  }
  var is_text = (getAttr(e.target, 'type') || 'text') === 'text'
  var pattern = getAttr(e.target, 'pattern')

  var input_matches_pattern = is_text && pattern &&
    new RegExp(pattern).test(e.target.value)

  if (input_matches_pattern) {
    return focusOnNextFormElement(e)
  }
})

// If the user types 01/01, and then types "2", we don't interpret
// this as a year. We check for the user not being done typing the year
// by checking if the year is less than 1800.
addEventListener('change', function (e) {
  var is_date = e.target.tagName === 'INPUT' &&
    getAttr(e.target, 'type') === 'date'

  if (is_date) {
    if (e.target.defaultValue) {
      return
    }
    var date = e.target.value
    var [year] = date.split('-')
    if (parseInt(year) < 1800) {
      return
    }
  }

  focusOnNextFormElement(e)
})

addEventListener('select', function (e) {
  var is_select = e.target.tagName === 'SELECT'
  if (!is_select) return
  focusOnNextFormElement(e)
})

addEventListener('search-select', function (e) {
  console.log('search-select', e)
  focusOnNextFormElement({
    target: e.detail,
  })
})

/* TODO: turn this back on? It's not working with hash changes and is just kind of overbearing during development

// Disable form submission if any inputs are modified
var modified_inputs = new Set()
var defaultValue = ''

// store original values
function onBeforeInput(event) {
  var target = event.target

  if (!(defaultValue in target || defaultValue in target.dataset)) {
    target.dataset[defaultValue] = ('' + target.value).trim()
  }
}

// TODO: handle select elements?
// store modified values
function onInput(event) {
  var target = event.target

  var original
  if (defaultValue in target) {
    original = target[defaultValue]
  } else {
    original = target.dataset[defaultValue]
  }
  if (original !== ('' + target.value).trim()) {
    if (!modified_inputs.has(target)) {
      modified_inputs.add(target)
    }
  } else if (modified_inputs.has(target)) {
    modified_inputs.delete(target)
  }
}

// clear modified inputs on form submission
function onSubmit() {
  modified_inputs.clear()
}

// warn before exiting if any inputs are modified
function onBeforeUnload(event) {
  if (modified_inputs.size) {
    event.preventDefault()
  }
}

addEventListener('beforeinput', onBeforeInput)
addEventListener('input', onInput)
addEventListener('submit', onSubmit)
addEventListener('beforeunload', onBeforeUnload)

*/
