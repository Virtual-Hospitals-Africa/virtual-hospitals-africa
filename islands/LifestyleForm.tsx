import { useSignal } from '@preact/signals'
import { useState } from 'preact/hooks'
import {
  NumberInput,
  Select,
  YesNoGrid,
  YesNoQuestion,
} from '../components/library/form/Inputs.tsx'
import { Lifestyle, SexualActivity } from '../types.ts'
import FormRow from '../components/library/form/Row.tsx'
import SelectWithOther from './SelectWithOther.tsx'
import PatientAddressForm from '../components/patients/intake/AddressForm.tsx'

import { Listbox } from '@headlessui/react'
import { assert } from 'std/assert/assert.ts'

const tobacco_products = [
  { id: 1, name: 'Flavored cigarettes' },
  { id: 2, name: 'Cigarettes' },
  { id: 3, name: 'Cigars' },
  { id: 4, name: 'Twist tobacco' },
  { id: 5, name: 'Chewed tobacco' },
  { id: 6, name: 'Tobacco edibles' },
  { id: 7, name: 'Snuff' },
  { id: 8, name: 'Pipe tobacco' },
  { id: 9, name: 'Vape/heated tobacco' },
  { id: 10, name: 'Nicotine only products' },
  { id: 11, name: 'Nicotine replacement products' },
]

const alcohol_products = [
  { id: 1, name: 'Traditional brew' },
  { id: 2, name: 'Opaque beer' },
  { id: 3, name: 'Bottled beer (ciders/lagers)' },
  { id: 4, name: 'Wine/ fermented fruit drinks' },
  { id: 5, name: 'Pure spirits/liquors (gin, brandy, vodka, whiskey)' },
  { id: 6, name: 'Illegal/illicit drinks' },
]

const attraction_question = ['Male', 'Female', 'LGBTQIA']

function SexualActivitySection(
  { lifestyle, age }: { lifestyle: Lifestyle; age: number },
) {
  const sexual_activity = useSignal<SexualActivity>(
    lifestyle.sexual_activity || {
      ever_been_sexually_active: false,
    },
  )

  return (
    <section>
      <h2>Sexual Activity</h2>
      <YesNoGrid>
        <YesNoQuestion
          name='lifestyle.sexually_active'
          label='Has the patient ever been sexually active?'
          value={sexual_activity.value.ever_been_sexually_active}
          onChange={(value) =>
            sexual_activity.value = { ever_been_sexually_active: !!value }}
        />
      </YesNoGrid>
      {console.log('Sex variable:', sexual_activity)}
      {sexual_activity.value.ever_been_sexually_active === true && (
        <>
          <NumberInput
            name={'lifestyle.sexually_active'}
            label={"At what age was the patient's first sexual encounter?"}
            value={sexual_activity.value.first_encounter}
            className='col-start-6'
            min={0}
            max={age}
          />
          <NumberInput
            name={'lifestyle.sexually_active'}
            label={'How many sexual partners does the patient have currently?'}
            value={sexual_activity.value.current_sexual_partners}
            className='col-start-6'
            min={0}
          />
          <Select
            label='To which sex is the patient attracted to?'
            name='lifestyle.sexually_active'
          >
            {attraction_question.map((option) => (
              <option
                value={option}
                // selected={}
              >
                {option}
              </option>
            ))}
          </Select>
        </>
      )}
      {sexual_activity.value.ever_been_sexually_active === true && (
        <YesNoGrid>
          <YesNoQuestion
            name='lifestyle.sexually_active.currently_sexually_active'
            label='Is the patient currently sexually active?'
            value={sexual_activity.value.currently_sexually_active}
          />
          <YesNoQuestion
            name='lifestyle.sexually_active.has_traded_sex_for_favors'
            label='Has the patient traded sex for money/goods/favors?'
            value={sexual_activity.value.has_traded_sex_for_favors}
          />
          <YesNoQuestion
            name='lifestyle.sexually_active.had_sex_after_drugs'
            label='Has the patient had sex after drug/substance use?'
            value={sexual_activity.value.had_sex_after_drugs}
          />
          <YesNoQuestion
            name='lifestyle.sexually_active.recently_treated_for_stis'
            label='Has the patient been treated recently for STIs?'
            value={sexual_activity.value.recently_treated_for_stis}
          />
          <YesNoQuestion
            name='lifestyle.sexually_active.recently_hiv_tested'
            label='Has the patient been tested recently for HIV?'
            value={sexual_activity.value.recently_hiv_tested}
          />
          <YesNoQuestion
            name='lifestyle.sexually_active.know_partner_hiv_status'
            label="Does the patient know their partner's HIV status?"
            value={sexual_activity.value.know_partner_hiv_status}
          />
          {/* Handle this question in another ticket */}
          {
            /* <YesNoQuestion
            name='lifestyle.sexually_active.want_hiv_test_today'
            label='Does the patient want to be tested for HIV today?'
            value={sexual_activity.value.want_hiv_test_today}
            //Capture but dont send to back end
          /> */
          }
        </YesNoGrid>
      )}
    </section>
  )
}

export function LifestyleForm({
  lifestyle = {
    sexual_activity: null, //same grammar for each ex) drinking, smoking, sexual_activity
    alcohol: null,
    smoking: null,
  },
  age,
}: {
  lifestyle?: Lifestyle
  age: number
}) {
  return (
    <>
      <SexualActivitySection
        lifestyle={lifestyle}
        age={age}
      />
    </>
  )
}
