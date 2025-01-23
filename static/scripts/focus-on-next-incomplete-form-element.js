// deno-lint-ignore-file

function getAttr(el, attr) {
  var item = el.attributes.getNamedItem(attr)
  return item && item.value
}

function findNode(nodes, callback) {
  for (var i = 0; i < nodes.length; i++) {
    // console.log('node', nodes[i])
    if (callback(nodes[i])) {
      return nodes[i]
    }
    var found = findNode(nodes[i].childNodes, callback)
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
      var found = findNode(mutation.addedNodes, (node) => {
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
  var formElements = Array.from(e.target.form.elements)
  var currentIndex = formElements.indexOf(e.target)
  var nextElement = formElements.slice(currentIndex + 1).find(function (el) {
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
  focusOnNextFormElement({
    target: e.detail,
  })
})
