import { useSignal } from '@preact/signals'
import { NumberInput, YesNoGrid, YesNoQuestion } from '../form/Inputs.tsx'
import { LabelledListboxMulti } from '../form/Listbox.tsx'
import { Lifestyle, SubstanceUse } from '../../types.ts'
import FormSection from '../../components/library/FormSection.tsx'

const substances = [
  'Caffeine',
  'Cannabis',
  'Cocaine',
  'Heroin',
  'Crystal meth',
  'Ecstasy',
  'LSD',
  'Magic mushrooms',
  'Cough syrup',
  'Inhalants',
  'Opioid',
  'Amphetamines',
  'Benzodiazepines',
  'Codeine',
  'Diazepam',
  'Sedatives',
  'Steroids',
].map((name) => ({
  id: name,
  name,
}))

export default function SubstanceUseSection(
  { lifestyle, age_years }: { lifestyle: Lifestyle; age_years: number },
) {
  const substance_use = useSignal<SubstanceUse>(
    lifestyle.substance_use || {
      has_ever_used_substance: null,
    },
  )
  const substances_used = substance_use.value.has_ever_used_substance
    ? substance_use.value.substances_used
    : []

  return (
    <FormSection header='Substance Use Questions'>
      <YesNoGrid>
        <YesNoQuestion
          name='lifestyle.substance_use.has_ever_used_substance'
          label='Has the patient ever used substances?'
          value={substance_use.value.has_ever_used_substance}
          onChange={(value) =>
            substance_use.value = {
              has_ever_used_substance: value,
              substances_used: [],
            }}
        />
      </YesNoGrid>

      {substance_use.value.has_ever_used_substance === true && (
        <LabelledListboxMulti
          label='Which substances does the patient use?'
          name='lifestyle.substance_use.substances_used_names'
          options={substances}
          selected={substance_use.value.substances_used.length > 0
            ? substance_use.value.substances_used.map((substance) =>
              substance.name
            )
            : []}
          onChange={(selectedValues) => {
            const names: string[] = selectedValues.map((item) =>
              item
            ) as unknown as string[]
            substance_use.value = substance_use.value.has_ever_used_substance
              ? {
                ...substance_use.value,
                substances_used: names.map((name) => ({
                  name: name,
                  first_use_age: 0,
                  used_regularly_years: 0,
                  times_used_in_a_week: 0,
                  injected_substance: null,
                  annoyed_by_criticism: null,
                  attempt_to_stop: null,
                  withdrawal_symptoms: null,
                  quit_more_than_six_months: null,
                  quit_substance_use_years: 0,
                })),
              }
              : { ...substance_use.value }
          }}
        />
      )}

      {substance_use.value.has_ever_used_substance === true &&
        !!substance_use.value.substances_used.length &&
        substance_use.value.substances_used && (
        <YesNoGrid>
          {substance_use.value.substances_used.map((substance, index) => (
            <>
              <div key={substance.name}></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>

              <YesNoQuestion
                name={`lifestyle.substance_use.substances_used.${index}.injected_substance`}
                label={`Has the patient ever injected ${substance.name}?`}
                value={substance.injected_substance}
                onChange={(value) =>
                  substance_use.value = {
                    has_ever_used_substance: true,
                    substances_used: substances_used.map((other_substance) =>
                      other_substance === substance
                        ? { ...other_substance, injected_substance: value }
                        : other_substance
                    ),
                  }}
              />

              <YesNoQuestion
                name={`lifestyle.substance_use.substances_used.${index}.annoyed_by_criticism`}
                label={`Has the patient ever become annoyed by criticisms of their ${substance.name} use?`}
                value={substance.annoyed_by_criticism}
                onChange={(value) =>
                  substance_use.value = {
                    has_ever_used_substance: true,
                    substances_used: substances_used.map((other_substance) =>
                      other_substance === substance
                        ? { ...other_substance, annoyed_by_criticism: value }
                        : other_substance
                    ),
                  }}
              />

              <YesNoQuestion
                name={`lifestyle.substance_use.substances_used.${index}.attempt_to_stop`}
                label={`Has the patient ever attempted to stop ${substance.name} use?`}
                value={substance.attempt_to_stop}
                onChange={(value) =>
                  substance_use.value = {
                    has_ever_used_substance: true,
                    substances_used: substances_used.map((other_substance) =>
                      other_substance === substance
                        ? { ...other_substance, attempt_to_stop: value }
                        : other_substance
                    ),
                  }}
              />

              <YesNoQuestion
                name={`lifestyle.substance_use.substances_used.${index}.withdrawal_symptoms`}
                label={`Has the patient ever experienced withdrawal symptoms for ${substance.name}?`}
                value={substance.withdrawal_symptoms}
                onChange={(value) =>
                  substance_use.value = {
                    has_ever_used_substance: true,
                    substances_used: substances_used.map((other_substance) =>
                      other_substance === substance
                        ? { ...other_substance, withdrawal_symptoms: value }
                        : other_substance
                    ),
                  }}
              />

              <YesNoQuestion
                name={`lifestyle.substance_use.substances_used.${index}.quit_more_than_six_months`}
                label={`Has the patient ever successfully quit abusing ${substance.name} for a period ≥ 6 months?`}
                value={substance.quit_more_than_six_months}
                onChange={(value) =>
                  substance_use.value = {
                    has_ever_used_substance: true,
                    substances_used: substances_used.map((other_substance) =>
                      other_substance === substance
                        ? {
                          ...other_substance,
                          quit_more_than_six_months: value,
                        }
                        : other_substance
                    ),
                  }}
              />
            </>
          ))}
        </YesNoGrid>
      )}

      {substance_use.value.has_ever_used_substance === true &&
        !!substance_use.value.substances_used.length &&
        substance_use.value.substances_used && (
          substance_use.value.substances_used.map((
            substance,
            index: number,
          ) => (
            <>
              <div key={substance.name}></div>
              <>
                <NumberInput
                  name={`lifestyle.substance_use.substances_used.${index}.first_use_age`}
                  label={`At what age did you first use this ${substance.name}?`}
                  value={substance.first_use_age}
                  className='col-start-6'
                  min={0}
                  max={age_years}
                />

                <NumberInput
                  name={`lifestyle.substance_use.substances_used.${index}.used_regularly_years`}
                  label={`How many years have you been using ${substance.name} regularly?`}
                  value={substance.used_regularly_years}
                  className='col-start-6'
                  min={0}
                />

                <NumberInput
                  name={`lifestyle.substance_use.substances_used.${index}.times_used_in_a_week`}
                  label={`How many times do you use ${substance.name} in a week?`}
                  value={substance.times_used_in_a_week}
                  className='col-start-6'
                  min={0}
                />

                {substance_use.value.has_ever_used_substance === true &&
                  substance.quit_more_than_six_months === true && (
                  <NumberInput
                    name={`lifestyle.substance_use.substances_used.${index}.quit_substance_use_years`}
                    label={`How many cumulative years, has the patient abstained from ${substance.name} use?`}
                    value={substance.quit_substance_use_years}
                    className='col-start-6'
                    min={0}
                    max={age_years}
                  />
                )}
              </>
            </>
          ))
        )}
    </FormSection>
  )
}
