import { useSignal } from '@preact/signals'
import {
  NumberInput,
  Select,
  YesNoGrid,
  YesNoQuestion,
} from '../form/Inputs.tsx'
import { Lifestyle, SexualActivity } from '../../types.ts'
import FormSection from '../../components/library/FormSection.tsx'

const attraction_question = ['Male', 'Female', 'Other', 'Unknown']

export default function SexualActivitySection(
  { lifestyle, age_years }: { lifestyle: Lifestyle; age_years: number },
) {
  const sexual_activity = useSignal<SexualActivity>(
    lifestyle.sexual_activity || {
      ever_been_sexually_active: null,
    },
  )

  return (
    <FormSection header='Sexual Activity Questions'>
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
            name='lifestyle.sexual_activity.first_encounter'
            label="At what age was the patient's first sexual encounter?"
            value={sexual_activity.value.first_encounter}
            className='col-start-6'
            min={0}
            max={age_years}
          />
          <NumberInput
            name='lifestyle.sexual_activity.current_sexual_partners'
            label='How many sexual partners does the patient have currently?'
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
              >
                {option}
              </option>
            ))}
          </Select>
        </>
      )}
    </FormSection>
  )
}
