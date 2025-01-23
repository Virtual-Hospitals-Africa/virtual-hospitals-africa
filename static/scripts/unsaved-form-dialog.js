// deno-lint-ignore-file
// TODO: turn this back on? It's not working with hash changes and is just kind of overbearing during development

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
