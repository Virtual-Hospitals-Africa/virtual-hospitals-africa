import { useSignal } from '@preact/signals'
import {
  NumberInput,
  Select,
  YesNoGrid,
  YesNoQuestion,
} from './form/Inputs.tsx'
import { LabelledListboxMulti } from './form/Listbox.tsx'
import { Alcohol, Lifestyle, SexualActivity, Smoking } from '../types.ts'
import FormRow from './form/Row.tsx'
import SelectWithOther from './SelectWithOther.tsx'
import PatientAddressForm from '../components/patients/intake/AddressForm.tsx'

import { assert } from 'std/assert/assert.ts'
import SectionHeader from '../components/library/typography/SectionHeader.tsx'

const tobacco_products = [
  'Flavored cigarettes',
  'Cigarettes',
  'Cigars',
  'Twist tobacco',
  'Chewed tobacco',
  'Tobacco edibles',
  'Snuff',
  'Pipe tobacco',
  'Vape/heated tobacco',
  'Nicotine only products',
  'Nicotine replacement products',
].map((name) => ({
  id: name,
  name,
}))

const alcohol_products = [
  'Traditional brew',
  'Opaque beer',
  'Bottled beer (ciders/lagers)',
  'Wine/ fermented fruit drinks',
  'Pure spirits/liquors (gin, brandy, vodka, whiskey)',
  'Illegal/illicit drinks',
].map((name) => ({
  id: name,
  name,
}))

const attraction_question = ['Male', 'Female', 'LGBTQIA']

function SexualActivitySection(
  { lifestyle, age_years }: { lifestyle: Lifestyle; age_years: number },
) {
  const sexual_activity = useSignal<SexualActivity>(
    lifestyle.sexual_activity || {
      ever_been_sexually_active: null,
    },
  )

  return (
    <section className='mb-7'>
      <SectionHeader className='mb-3'>Sexual Activity Questions</SectionHeader>
      <YesNoGrid>
        <YesNoQuestion
          name='lifestyle.sexual_activity.ever_been_sexually_active'
          label='Has the patient ever been sexually active?'
          value={sexual_activity.value.ever_been_sexually_active}
          onChange={(value) => {
            sexual_activity.value = { ever_been_sexually_active: value }
          }}
        />

        {sexual_activity.value.ever_been_sexually_active === true && (
          <>
            <YesNoQuestion
              name='lifestyle.sexual_activity.currently_sexually_active'
              label='Is the patient currently sexually active?'
              value={sexual_activity.value.currently_sexually_active}
              onChange={(value) => {
                sexual_activity.value = {
                  ...sexual_activity.value,
                  ever_been_sexually_active: true,
                  currently_sexually_active: value,
                }
              }}
            />
            <YesNoQuestion
              name='lifestyle.sexual_activity.has_traded_sex_for_favors'
              label='Has the patient traded sex for money/goods/favors?'
              value={sexual_activity.value.has_traded_sex_for_favors}
              onChange={(value) => {
                sexual_activity.value = {
                  ...sexual_activity.value,
                  ever_been_sexually_active: true,
                  has_traded_sex_for_favors: value,
                }
              }}
            />
            <YesNoQuestion
              name='lifestyle.sexual_activity.had_sex_after_drugs'
              label='Has the patient had sex after drug/substance use?'
              value={sexual_activity.value.had_sex_after_drugs}
              onChange={(value) =>
                sexual_activity.value = {
                  ...sexual_activity.value,
                  ever_been_sexually_active: true,
                  had_sex_after_drugs: value,
                }}
            />
            <YesNoQuestion
              name='lifestyle.sexual_activity.recently_treated_for_stis'
              label='Has the patient been treated recently for STIs?'
              value={sexual_activity.value.recently_treated_for_stis}
              onChange={(value) =>
                sexual_activity.value = {
                  ...sexual_activity.value,
                  ever_been_sexually_active: true,
                  recently_treated_for_stis: value,
                }}
            />
            <YesNoQuestion
              name='lifestyle.sexual_activity.recently_hiv_tested'
              label='Has the patient been tested recently for HIV?'
              value={sexual_activity.value.recently_hiv_tested}
              onChange={(value) =>
                sexual_activity.value = {
                  ...sexual_activity.value,
                  ever_been_sexually_active: true,
                  recently_hiv_tested: value,
                }}
            />
            <YesNoQuestion
              name='lifestyle.sexual_activity.know_partner_hiv_status'
              label="Does the patient know their partner's HIV status?"
              value={sexual_activity.value.know_partner_hiv_status}
              onChange={(value) =>
                sexual_activity.value = {
                  ...sexual_activity.value,
                  ever_been_sexually_active: true,
                  know_partner_hiv_status: value,
                }}
            />
            {sexual_activity.value.know_partner_hiv_status == true && (
              <YesNoQuestion
                name='lifestyle.sexual_activity.partner_hiv_status'
                label="What is the patient's partner's HIV status?"
                value={sexual_activity.value.partner_hiv_status}
                onChange={(value) =>
                  sexual_activity.value = {
                    ...sexual_activity.value,
                    ever_been_sexually_active: true,
                    partner_hiv_status: value,
                  }}
              />
            )}
            {/* Handle this question in another ticket */}
            {
              /* <YesNoQuestion
            name='lifestyle.sexually_active.want_hiv_test_today'
            label='Does the patient want to be tested for HIV today?'
            value={sexual_activity.value.want_hiv_test_today}
            //Capture but dont send to back end
            /> */
            }
          </>
        )}
      </YesNoGrid>
      {sexual_activity.value.ever_been_sexually_active === true && (
        <>
          <NumberInput
            name={'lifestyle.sexual_activity.first_encounter'}
            label={"At what age was the patient's first sexual encounter?"}
            value={sexual_activity.value.first_encounter}
            className='col-start-6'
            min={0}
            max={age_years}
          />
          <NumberInput
            name={'lifestyle.sexual_activity.current_sexual_partners'}
            label={'How many sexual partners does the patient have currently?'}
            value={sexual_activity.value.current_sexual_partners}
            className='col-start-6'
            min={0}
          />
          <Select
            label='To which sex is the patient attracted to?'
            name='lifestyle.sexual_activity.attracted_to'
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
    </section>
  )
}

function AlcoholSection(
  { lifestyle, age_years }: { lifestyle: Lifestyle; age_years: number },
) {
  const alcohol = useSignal<Alcohol>(
    lifestyle.alcohol || {
      has_ever_drank: null,
    },
  )

  return (
    <section className='mb-7'>
      <SectionHeader className='mb-3'>Alcohol Questions</SectionHeader>
      <YesNoGrid>
        <YesNoQuestion
          name='lifestyle.alcohol.has_ever_drank'
          label='Has the patient ever drank alcohol?'
          value={alcohol.value.has_ever_drank}
          onChange={(value) => alcohol.value = { has_ever_drank: value }}
        />

        {alcohol.value.has_ever_drank === true && (
          <>
            <YesNoQuestion
              name='lifestyle.alcohol.currently_drinks'
              label='Does the patient currently drink alcohol?'
              value={alcohol.value.currently_drinks}
              onChange={(value) => {
                alcohol.value = {
                  ...alcohol.value,
                  has_ever_drank: true,
                  currently_drinks: value,
                }
              }}
            />
            <YesNoQuestion
              name='lifestyle.alcohol.binge_drinking'
              label='Has the patient ever participated in binge drinking?'
              value={alcohol.value.binge_drinking}
              onChange={(value) =>
                alcohol.value = {
                  ...alcohol.value,
                  has_ever_drank: true,
                  binge_drinking: value,
                }}
            />
            <YesNoQuestion
              name='lifestyle.alcohol.drawn_to_cut_down'
              label='Has the patient ever felt that they should cut down on their drinking?'
              value={alcohol.value.drawn_to_cut_down}
              onChange={(value) =>
                alcohol.value = {
                  ...alcohol.value,
                  has_ever_drank: true,
                  drawn_to_cut_down: value,
                }}
            />
            <YesNoQuestion
              name='lifestyle.alcohol.annoyed_by_critics'
              label='Has the patient ever been annoyed by criticisms of their drinking?'
              value={alcohol.value.annoyed_by_critics}
              onChange={(value) =>
                alcohol.value = {
                  ...alcohol.value,
                  has_ever_drank: true,
                  annoyed_by_critics: value,
                }}
            />
            <YesNoQuestion
              name='lifestyle.alcohol.eye_opener'
              label='Has the patient ever had a morning eye opener to get rid of a hangover?'
              value={alcohol.value.eye_opener}
              onChange={(value) =>
                alcohol.value = {
                  ...alcohol.value,
                  has_ever_drank: true,
                  eye_opener: value,
                }}
            />
            <YesNoQuestion
              name='lifestyle.alcohol.guilty'
              label='Has the patient ever felt guilty about drinking?'
              value={alcohol.value.guilty}
              onChange={(value) =>
                alcohol.value = {
                  ...alcohol.value,
                  has_ever_drank: true,
                  guilty: value,
                }}
            />
            <YesNoQuestion
              name='lifestyle.alcohol.missed_work'
              label='Has the patient ever missed work because of their drinking?'
              value={alcohol.value.missed_work}
              onChange={(value) =>
                alcohol.value = {
                  ...alcohol.value,
                  has_ever_drank: true,
                  missed_work: value,
                }}
            />
            <YesNoQuestion
              name='lifestyle.alcohol.criticized'
              label='Has the patient ever been criticized by their supervisor or work colleagues about their drinking?'
              value={alcohol.value.criticized}
              onChange={(value) =>
                alcohol.value = {
                  ...alcohol.value,
                  has_ever_drank: true,
                  criticized: value,
                }}
            />
            <YesNoQuestion
              name='lifestyle.alcohol.arrested'
              label='Has the patient ever been arrested for drunk driving or any offence under the influence?'
              value={alcohol.value.arrested}
              onChange={(value) =>
                alcohol.value = {
                  ...alcohol.value,
                  has_ever_drank: true,
                  arrested: value,
                }}
            />
            <YesNoQuestion
              name='lifestyle.alcohol.attempted_to_stop'
              label='Has the patient ever attempted to stop drinking?'
              value={alcohol.value.attempted_to_stop}
              onChange={(value) =>
                alcohol.value = {
                  ...alcohol.value,
                  has_ever_drank: true,
                  attempted_to_stop: value,
                }}
            />
            <YesNoQuestion
              name='lifestyle.alcohol.withdrawal'
              label='Has the patient ever experienced withdrawal symptoms?'
              value={alcohol.value.withdrawal}
              onChange={(value) =>
                alcohol.value = {
                  ...alcohol.value,
                  has_ever_drank: true,
                  withdrawal: value,
                }}
            />
            <YesNoQuestion
              name='lifestyle.alcohol.quit_for_six_or_more_months'
              label='Has the patient ever successfully quit drinking for a period ≥ 6 months?'
              value={alcohol.value.quit_for_six_or_more_months}
              onChange={(value) =>
                alcohol.value = {
                  ...alcohol.value,
                  has_ever_drank: true,
                  quit_for_six_or_more_months: value,
                }}
            />
          </>
        )}
      </YesNoGrid>
      {alcohol.value.has_ever_drank &&
        alcohol.value.quit_for_six_or_more_months && (
        <NumberInput
          name={`lifestyle.alcohol.abstinence_length_months`}
          label={'How many months has the patient practiced abstinence from alcohol?'}
          value={alcohol.value.abstinence_length_months}
          className='col-start-6'
          min={0}
          max={age_years * 12}
        />
      )}
      {alcohol.value.has_ever_drank && (
        <>
          <NumberInput
            name={'lifestyle.alcohol.first_drink'}
            label={'At what age was the patient’s first drink?'}
            value={alcohol.value.first_drink}
            className='col-start-6'
            min={0}
            max={age_years}
          />
          <NumberInput
            name={'lifestyle.alcohol.years_drinking'}
            label={'For how many years has the patient been drinking alcohol?'}
            value={alcohol.value.years_drinking}
            className='col-start-6'
            min={0}
            max={age_years}
          />
          <NumberInput
            name={'lifestyle.alcohol.number_drinks_per_sitting'}
            label={'How many drinks when you do drink on average?'}
            value={alcohol.value.number_drinks_per_sitting}
            className='col-start-6'
            min={0}
          />
        </>
      )}

      {alcohol.value.has_ever_drank === true &&
        alcohol.value.currently_drinks === true && (
        <LabelledListboxMulti
          label='Which alcoholic drinks, does the patient take?'
          name='lifestyle.alcohol.alcohol_products_used'
          options={alcohol_products}
          selected={alcohol.value.alcohol_products_used || []}
        />
      )}
    </section>
  )
}

function SmokingSection(
  { lifestyle, age_years }: { lifestyle: Lifestyle; age_years: number },
) {
  const smoking = useSignal<Smoking>(
    lifestyle.smoking || {
      has_ever_smoked: null,
    },
  )

  return (
    <section className='mb-7'>
      <SectionHeader className='mb-3'>Smoking Questions</SectionHeader>
      <YesNoGrid>
        <YesNoQuestion
          name='lifestyle.smoking.has_ever_smoked'
          label='Has the patient ever smoked?'
          value={smoking.value.has_ever_smoked}
          onChange={(value) => smoking.value = { has_ever_smoked: value }}
        />

        {smoking.value.has_ever_smoked === true && (
          <>
            <YesNoQuestion
              name='lifestyle.smoking.currently_smokes'
              label='Does the patient currently smoke?'
              value={smoking.value.currently_smokes}
              onChange={(value) =>
                smoking.value = {
                  ...smoking.value,
                  has_ever_smoked: true,
                  currently_smokes: value,
                }}
            />
            <YesNoQuestion
              name='lifestyle.smoking.felt_to_cutdown'
              label='Has the patient ever felt that they should cut down on their smoking?'
              value={smoking.value.felt_to_cutdown}
              onChange={(value) =>
                smoking.value = {
                  ...smoking.value,
                  has_ever_smoked: true,
                  felt_to_cutdown: value,
                }}
            />
            <YesNoQuestion
              name='lifestyle.smoking.annoyed_by_criticism'
              label='Has the patient ever become annoyed by criticisms of their smoking?'
              value={smoking.value.annoyed_by_criticism}
              onChange={(value) =>
                smoking.value = {
                  ...smoking.value,
                  has_ever_smoked: true,
                  annoyed_by_criticism: value,
                }}
            />
            <YesNoQuestion
              name='lifestyle.smoking.guilty'
              label='Has the patient ever felt guilty about smoking? '
              value={smoking.value.guilty}
              onChange={(value) =>
                smoking.value = {
                  ...smoking.value,
                  has_ever_smoked: true,
                  guilty: value,
                }}
            />
            <YesNoQuestion
              name='lifestyle.smoking.forbidden_place'
              label='Has the patient ever smoked in forbidden places?'
              value={smoking.value.forbidden_place}
              onChange={(value) =>
                smoking.value = {
                  ...smoking.value,
                  has_ever_smoked: true,
                  forbidden_place: value,
                }}
            />
            <YesNoQuestion
              name='lifestyle.smoking.attempt_to_quit'
              label='Has the patient ever attempted to quit smoking?'
              value={smoking.value.attempt_to_quit}
              onChange={(value) =>
                smoking.value = {
                  ...smoking.value,
                  has_ever_smoked: true,
                  attempt_to_quit: value,
                }}
            />

            <YesNoQuestion
              name='lifestyle.smoking.quit_more_than_six_months'
              label='Has the patient ever successfully quit smoking for ≥ 6 months?'
              value={smoking.value.quit_more_than_six_months}
              onChange={(value) =>
                smoking.value = {
                  ...smoking.value,
                  has_ever_smoked: true,
                  quit_more_than_six_months: value,
                }}
            />
          </>
        )}
      </YesNoGrid>

      {smoking.value.has_ever_smoked === true &&
        smoking.value.quit_more_than_six_months === true && (
        <NumberInput
          name={'lifestyle.smoking.quit_smoking_years'}
          label={'How many cumulative years has the patient quit smoking?'}
          value={smoking.value.quit_smoking_years}
          className='col-start-6'
          min={0}
          max={age_years}
        />
      )}

      {smoking.value.has_ever_smoked && (
        <>
          <NumberInput
            name={'lifestyle.smoking.first_smoke_age'}
            label={"At what age was the patient's first smoke?"}
            value={smoking.value.first_smoke_age}
            className='col-start-6'
            min={0}
            max={age_years}
          />

          <NumberInput
            name={'lifestyle.smoking.weekly_smokes'}
            label={'How often do you smoke per week?'}
            value={smoking.value.weekly_smokes}
            className='col-start-6'
            min={0}
          />

          <NumberInput
            name={'lifestyle.smoking.number_of_products'}
            label={'When smoking, how many cigarettes or other tobacco products do you smoke?'}
            value={smoking.value.number_of_products}
            className='col-start-6'
            min={0}
          />
        </>
      )}

      {smoking.value.has_ever_smoked === true &&
        smoking.value.currently_smokes === true && (
        <LabelledListboxMulti
          label='Which tobacco products does the patient use?'
          name='lifestyle.smoking.tobacco_products_used'
          options={tobacco_products}
          selected={smoking.value.tobacco_products_used || []}
        />
      )}
    </section>
  )
}

export function LifestyleForm({
  lifestyle = {
    sexual_activity: null,
    alcohol: null,
    smoking: null,
  },
  age_years,
}: {
  lifestyle?: Lifestyle
  age_years: number
}) {
  return (
    <>
      <SexualActivitySection
        lifestyle={lifestyle}
        age_years={age_years}
      />

      <AlcoholSection
        lifestyle={lifestyle}
        age_years={age_years}
      />
      <SmokingSection
        lifestyle={lifestyle}
        age_years={age_years}
      />
    </>
  )
}
