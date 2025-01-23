// deno-lint-ignore-file
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
