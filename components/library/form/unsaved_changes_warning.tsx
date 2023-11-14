import { useEffect } from 'preact/hooks'

export default function unsavedChangesWarning() {
  useEffect(() => {
    const modified_inputs = new Set<HTMLElement>()
    const defaultValue = ''

    // store original values
    addEventListener('beforeinput', (event) => {
      const target = event.target as HTMLInputElement

      if (!(defaultValue in target || defaultValue in target.dataset)) {
        target.dataset[defaultValue] = ('' + target.value).trim()
      }
    })

    // store modified values
    addEventListener('input', (event) => {
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
    })

    // clear modified inputs on form submission
    addEventListener('submit', () => {
      modified_inputs.clear()
    })

    // warn before exiting if any inputs are modified
    addEventListener('beforeunload', (event) => {
      if (modified_inputs.size) {
        const message = 'Changes made may not be saved.'
        event.returnValue = message
      }
    })
  }, [])
}
