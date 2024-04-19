import { useSignal } from '@preact/signals'
import {
  NumberInput,
  Select,
  YesNoGrid,
  YesNoQuestion,
} from '../form/Inputs.tsx'
import { LabelledListboxMulti } from '../form/Listbox.tsx'
import {
  Alcohol,
  Exercise,
  Lifestyle,
  SexualActivity,
  Smoking,
  SubstanceUse,
} from '../../types.ts'
import SelectWithOther from '../SelectWithOther.tsx'
import SectionHeader from '../../components/library/typography/SectionHeader.tsx'

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

export default function SmokingSection(
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
