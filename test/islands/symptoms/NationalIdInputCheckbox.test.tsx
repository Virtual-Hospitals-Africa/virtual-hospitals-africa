import { afterEach, beforeAll, describe, it } from 'std/testing/bdd.ts'
import {
  cleanup,
  fireEvent,
  render,
  setup,
} from '$fresh-testing-library/mod.ts'
import NationalIdInputCheckbox from '../../../islands/NationalIdInputCheckbox.tsx'
import { signal } from '@preact/signals'
import { assertEquals } from 'std/assert/assert_equals.ts'

describe('<NationalIdInputCheckbox />', () => {
  beforeAll(setup)
  afterEach(cleanup)

  it('renders a checkbox, set checked based on signal', () => {
    const no_national_id = signal<boolean>(false)
    const { container } = render(
      <NationalIdInputCheckbox
        no_national_id={no_national_id}
      />,
    )
    const component = container.querySelector(
      'input[name="no_national_id"]',
    ) as HTMLInputElement
    assertEquals(component.checked, false)
  })

  it('renders a checkbox, and updates signal when checked', () => {
    const no_national_id = signal<boolean>(false)
    const { container } = render(
      <NationalIdInputCheckbox
        no_national_id={no_national_id}
      />,
    )
    const component = container.querySelector(
      'input[name="no_national_id"]',
    ) as HTMLInputElement
    assertEquals(component.checked, false)
    fireEvent.click(component)
    assertEquals(no_national_id.value, true)
    assertEquals(component.checked, true)
  })
})
