import { useSignal } from '@preact/signals'
import { NumberInput, YesNoGrid, YesNoQuestion } from '../form/Inputs.tsx'
import { LabelledListboxMulti } from '../form/Listbox.tsx'
import { Alcohol, Lifestyle } from '../../types.ts'
import FormSection from '../../components/library/FormSection.tsx'

const alcohol_products = [
  'Traditional brew',
  'Opaque beer',
  'Bottled beer (ciders/lagers)',
  'Wine/fermented fruit drinks',
  'Pure spirits/liquors (gin, brandy, vodka, whiskey)',
  'Illegal/illicit drinks',
].map((name) => ({
  id: name,
  name,
}))

export default function AlcoholSection(
  { lifestyle, age_years }: { lifestyle: Lifestyle; age_years: number },
) {
  const alcohol = useSignal<Alcohol>(
    lifestyle.alcohol || {
      has_ever_drank: null,
    },
  )

  return (
    <FormSection header='Alcohol Questions'>
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
          label='How many months has the patient practiced abstinence from alcohol?'
          value={alcohol.value.abstinence_length_months}
          className='col-start-6'
          min={0}
          max={age_years * 12}
        />
      )}
      {alcohol.value.has_ever_drank && (
        <>
          <NumberInput
            name='lifestyle.alcohol.first_drink'
            label='At what age was the patient’s first drink?'
            value={alcohol.value.first_drink}
            className='col-start-6'
            min={0}
            max={age_years}
          />
          <NumberInput
            name='lifestyle.alcohol.years_drinking'
            label='For how many years has the patient been drinking alcohol?'
            value={alcohol.value.years_drinking}
            className='col-start-6'
            min={0}
            max={age_years}
          />
          <NumberInput
            name='lifestyle.alcohol.number_drinks_per_sitting'
            label='How many drinks when you do drink on average?'
            value={alcohol.value.number_drinks_per_sitting}
            className='col-start-6'
            min={0}
          />
        </>
      )}

      {alcohol.value.has_ever_drank === true &&
        alcohol.value.currently_drinks === true && (
        <LabelledListboxMulti
          label='Which alcoholic drinks does the patient take?'
          name='lifestyle.alcohol.alcohol_products_used'
          options={alcohol_products}
          selected={alcohol.value.alcohol_products_used || []}
        />
      )}
    </FormSection>
  )
}
