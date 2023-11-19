import { useEffect } from 'preact/hooks'

export default function unsavedChangesWarning() {
  useEffect(() => {
    const modified_inputs = new Set<HTMLElement>()
    const defaultValue = ''

    // store original values
    function onBeforeInput(event: Event) {
      const target = event.target as HTMLInputElement

      if (!(defaultValue in target || defaultValue in target.dataset)) {
        target.dataset[defaultValue] = ('' + target.value).trim()
      }
    }

    // store modified values
    function onInput(event: Event) {
      const target = event.target as HTMLInputElement

      let original
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
    function onSubmit(event: Event) {
      modified_inputs.clear()
    }

    // warn before exiting if any inputs are modified
    function onBeforeUnload(event: Event) {
      if (modified_inputs.size) {
        event.preventDefault();
      }
    }

    addEventListener('beforeinput', onBeforeInput)
    addEventListener('input', onInput)
    addEventListener('submit', onSubmit)
    addEventListener('beforeunload', onBeforeUnload)

    return () => {
      removeEventListener('beforeinput', onBeforeInput)
      removeEventListener('input', onInput)
      removeEventListener('submit', onSubmit)
      removeEventListener('beforeunload', onBeforeUnload)
    }
  }, [])
}
