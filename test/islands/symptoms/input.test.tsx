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

describe('<SymptomsInput />', () => {
  beforeAll(setup)
  afterEach(cleanup)

  it('renders a new symptom as an ongoing symptom that started yesterday', () => {
    const { container } = render(
      <SymptomsInput
        today='2021-03-01'
        name='symptoms.0'
        value={{
          symptom: 'cough',
        }}
      />,
    )
    const symptom = container.querySelector(
      'input[name="symptoms.0.symptom"]',
    ) as HTMLInputElement
    assertEquals(symptom?.value, 'cough')

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
          symptom: 'cough',
          severity: 5,
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
          symptom: 'cough',
          start_date: '2021-01-27',
          end_date: '2021-02-26',
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
          symptom: 'cough',
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
