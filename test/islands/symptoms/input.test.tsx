// deno-lint-ignore-file no-explicit-any
import { afterEach, beforeAll, describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import {
  cleanup,
  fireEvent,
  render,
  setup,
  waitFor,
} from '$fresh-testing-library/mod.ts'
import SymptomsInput from '../../../islands/symptoms/Input.tsx'
import { assert } from 'std/assert/assert.ts'

function inputWithLabel(container: Element, label: string): HTMLInputElement {
  const input = Array.prototype.find.call(
    container.getElementsByTagName('label'),
    (item) => item.textContent === label,
  )?.getElementsByTagName('input')[0]
  assert(input)
  return input
}

/* TODO: revisit these, currently getting
error: ReferenceError: requestAnimationFrame is not defined
    at Object.__ (https://esm.sh/v135/@headlessui/react@1.7.17/X-YS9jbGllbnQtb25seTpwcmVhY3QvY29tcGF0LHJlYWN0LWRvbTpwcmVhY3QvY29tcGF0LHJlYWN0OnByZWFjdC9jb21wYXQKZS8q/denonext/react.mjs:2:6756)
    at E (https://esm.sh/stable/preact@10.19.2/denonext/hooks.js:2:3344)
    at Array.forEach (<anonymous>)
    at r.__r (https://esm.sh/stable/preact@10.19.2/denonext/hooks.js:2:2429)
    at i.__r (https://esm.sh/stable/preact@10.19.2/denonext/compat.js:2:7485)
    at https://esm.sh/v135/@preact/signals@1.2.1/X-ZS8q/denonext/signals.mjs:2:1325
    at B (https://esm.sh/stable/preact@10.19.2/denonext/preact.mjs:2:6313)
    at Object.A [as o] (https://esm.sh/stable/preact@10.19.2/denonext/preact.mjs:2:1476)
    at m (https://esm.sh/stable/preact@10.19.2/denonext/test-utils.js:2:744)
    at c (https://esm.sh/stable/preact@10.19.2/denonext/test-utils.js:2:573)
*/
describe.skip('<SymptomsInput />', () => {
  beforeAll(setup)
  afterEach(cleanup)

  it.only('renders a new symptom as an ongoing symptom that started yesterday', () => {
    const { container } = render(
      <SymptomsInput
        today='2021-03-01'
        name='symptoms.0'
        value={undefined}
        remove={() => {
          throw new Error('remove should not be called')
        }}
      />,
    )
    const ongoing = inputWithLabel(container, 'Ongoing')

    assertEquals(ongoing.previousSibling?.textContent, 'Ongoing')
    assertEquals(ongoing.checked, true)

    const start_date = container.querySelector(
      'input[name="symptoms.0.start_date"]',
    ) as HTMLInputElement
    assertEquals(start_date?.value, '2021-02-28')

    const end_date = container.querySelector(
      'input[name="symptoms.0.end_date"]',
    )
    assertEquals(end_date, null)
  })

  it('renders with severity', () => {
    const { container } = render(
      <SymptomsInput
        today='2021-03-01'
        name='symptoms.0'
        value={{
          description: 'cough',
          name: 'cough',
          severity: 5,
        } as any}
        remove={() => {
          throw new Error('remove should not be called')
        }}
      />,
    )
    const severity = container.querySelector(
      'select[name="symptoms.0.severity"] option:checked',
    ) as HTMLOptionElement
    assertEquals(severity?.value, '5')
  })

  it('renders an end date if present along with an approximate duration', () => {
    const { container } = render(
      <SymptomsInput
        today='2021-03-01'
        name='symptoms.0'
        value={{
          description: 'cough',
          name: 'cough',
          start_date: '2021-01-27',
          end_date: '2021-02-26',
        } as any}
        remove={() => {
          throw new Error('remove should not be called')
        }}
      />,
    )

    const ongoing = inputWithLabel(container, 'Ongoing')
    assertEquals(ongoing.checked, false)

    const end_date = container.querySelector(
      'input[name="symptoms.0.end_date"]',
    ) as HTMLInputElement
    assertEquals(end_date?.value, '2021-02-26')

    const start_date = container.querySelector(
      'input[name="symptoms.0.start_date"]',
    ) as HTMLInputElement
    assertEquals(start_date?.value, '2021-01-27')

    const duration = inputWithLabel(container, 'Duration')
    assertEquals(duration?.value, '4')

    const duration_units = duration.parentElement?.nextElementSibling
      ?.querySelector('select')
    assertEquals(duration_units?.value, 'weeks')
  })

  it('adjusts the onset when the duration is set for an ongoing symptom', async () => {
    const { container } = render(
      <SymptomsInput
        today='2021-03-01'
        name='symptoms.0'
        value={{
          description: 'cough',
          name: 'cough',
        } as any}
        remove={() => {
          throw new Error('remove should not be called')
        }}
      />,
    )

    const ongoing = inputWithLabel(container, 'Ongoing')
    assertEquals(ongoing.checked, true)

    const duration = inputWithLabel(container, 'Duration')
    const duration_units = duration.parentElement?.nextElementSibling
      ?.querySelector('select')!

    assert(duration_units)

    fireEvent.input(duration, { target: { value: '4' } })

    await waitFor(() => {
      const start_date = container.querySelector(
        'input[name="symptoms.0.start_date"]',
      ) as HTMLInputElement
      assertEquals(start_date?.value, '2021-02-25')
    })
  })
})
