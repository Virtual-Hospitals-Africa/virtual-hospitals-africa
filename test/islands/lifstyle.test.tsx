import { afterEach, beforeAll, describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import {
  cleanup,
  fireEvent,
  render,
  setup,
  waitFor,
} from '$fresh-testing-library/mod.ts'
import { assert } from 'std/assert/assert.ts'
import { LifestyleForm } from '../../islands/LifestyleForm.tsx'

describe.skip('<LifestyleForm />', () => {
  beforeAll(setup)
  afterEach(cleanup)
  it('GETS the lifestyle information of the patient', () => {
    const patient_lifestyle = {
      sexual_activity: {
        ever_been_sexually_active: false,
      },
      alcohol: {
        has_ever_drank: true,
        currently_drinks: true,
        binge_drinking: true,
        drawn_to_cut_down: true,
        annoyed_by_critics: true,
        first_drink: 27,
      },
      smoking: {
        has_ever_smoked: true,
        currently_smokes: false,
        first_smoke_age: 10,
        weekly_smokes: 5,
        number_of_products: 4,
        felt_to_cutdown: true,
        annoyed_by_critisism: false,
        guilty: false,
        forbidden_place: false,
        attempt_to_quit: true,
        quit_more_than_six_months: true,
        quit_smoking_years: 5,
      },
    }
    const { container } = render(
      <LifestyleForm
        lifestyle={patient_lifestyle}
        age_years={25}
      />,
    )

    //lifestyle.sexually_active is no/declined then no other sexual questions appear - DONE
    //If the age of the person is 5, they cannot habe been drinking for more than 5 years (Same goes for other categories)
    //If quit_for_more_than_6_months -> ask how long abstinent from alcohol - DONE
    //All of the basic conditional statement
    //try to make sure listbox works

    //Sexual Activity Section
    const lifestyle_sexually_active = container.querySelector(
      'input[name="lifestyle.sexually_active"]:checked',
    ) as HTMLInputElement
    assertEquals(lifestyle_sexually_active?.value, 'off')

    const lifestyle_sexually_active_null = container.querySelector(
      'input[name="lifestyle.sexually_active.currently_sexually_active"]',
    )
    assertEquals(lifestyle_sexually_active_null, null)

    const lifestyle_sexually_active_attraction = container.querySelector(
      'input[name="lifestyle.sexually_active.attracted_to"]',
    )
    assertEquals(lifestyle_sexually_active_attraction, null)

    //Alcohol Section
    const lifestyle_alcohol_has_ever = container.querySelector(
      'input[name="lifestyle.alcohol"]:checked',
    ) as HTMLInputElement
    assertEquals(lifestyle_alcohol_has_ever?.value, 'on')

    const lifestyle_binge_drinking = container.querySelector(
      'input[name="lifestyle.alcohol.binge_drinking"]:checked',
    ) as HTMLInputElement
    assertEquals(lifestyle_binge_drinking?.value, 'on')

    const testing_overload_age_error = container.querySelector(
      'input[name="lifestye.alcohol.first_drink"]',
    ) as HTMLInputElement
    console.log('first drink query selector output', testing_overload_age_error)

    const testing_Listbox = container.querySelector(
      'input[name="lifestyle.alcohol.alcohol_products_used"]',
    ) as HTMLInputElement
    console.log('Listbox Testing', testing_Listbox)

    //Smoking
    const smoke_start_date = container.querySelector(
      'input[name="lifestyle.patient_smokes.first_smoke_age"]',
    ) as HTMLInputElement
    assertEquals(smoke_start_date?.value, '26')

    const lifestyle_smoking_quit = container.querySelector(
      'input[name="lifestyle.patient_smokes.quit_for_more_than_six_months"]:checked',
    ) as HTMLInputElement
    assertEquals(lifestyle_smoking_quit?.value, 'on')

    const lifestyle_smoking_quit_years = container.querySelector(
      'input[name="lifestyle.patient_smokes.quit_smoking_years"]',
    ) as HTMLInputElement
    assertEquals(lifestyle_smoking_quit_years?.value, '5')

    //Check conditional statements
  })
  it('Posts the lifestyle information of the patient', () => {
    const patient_lifestyle = {
      sexual_activity: {
        ever_been_sexually_active: false,
      },
      alcohol: {
        has_ever_drank: true,
        currently_drinks: true,
        binge_drinking: true,
        drawn_to_cut_down: true,
        annoyed_by_critics: true,
        first_drink: 27,
      },
      smoking: {
        has_ever_smoked: true,
        currently_smokes: false,
        first_smoke_age: 10,
        weekly_smokes: 5,
        number_of_products: 4,
        felt_to_cutdown: true,
        annoyed_by_critisism: false,
        guilty: false,
        forbidden_place: false,
        attempt_to_quit: true,
        quit_more_than_six_months: true,
        quit_smoking_years: 5,
      },
    }
    const { container } = render(
      <LifestyleForm
        lifestyle={patient_lifestyle}
        age_years={25}
      />,
    )
  })
})
