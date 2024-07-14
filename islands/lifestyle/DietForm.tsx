import { Lifestyle, Meal } from '../../types.ts'
import {
  NumberInput,
  Select,
  SelectWithOptions,
  TextInput,
} from '.././form/Inputs.tsx'
import { useSignal } from '@preact/signals'
import { LabelledListboxMulti } from '.././form/Listbox.tsx'
import {
  DIET_FREQUENCIES,
  DRINKS,
  EATING_REASONS,
  FATS,
  JUNK_FOOD,
  MEAL_TYPES,
  MEATS,
  NON_MEATS,
  SPECIAL_DIETS,
  STAPLE_FOODS,
  SUPPLEMENTS,
} from '../../shared/diet.ts'
import { CheckboxGridItem } from '../form/Inputs.tsx'
import { AddRow, RemoveRow } from '../AddRemove.tsx'
import FormRow from '../form/Row.tsx'
import FormSection from '../../components/library/FormSection.tsx'

export default function DietSection(
  { lifestyle }: { lifestyle?: Lifestyle },
) {
  const staple_foods = useSignal<string[]>(
    lifestyle?.diet?.staple_foods || [],
  )

  const drinks = useSignal<{ name: string; frequency: string }[]>(
    lifestyle?.diet?.drinks ? (lifestyle.diet.drinks || []) : [],
  )

  const non_meats = useSignal<{ name: string; frequency: string }[]>(
    lifestyle?.diet?.non_meats ? (lifestyle.diet.non_meats || []) : [],
  )
  const meats = useSignal<{ name: string; frequency: string }[]>(
    lifestyle?.diet?.meats ? (lifestyle.diet.meats || []) : [],
  )
  const junk_foods = useSignal<{ name: string; frequency: string }[]>(
    lifestyle?.diet?.junk_foods ? (lifestyle.diet.junk_foods || []) : [],
  )

  const meals = useSignal<Meal[]>(
    lifestyle?.diet?.typical_foods_eaten
      ? (lifestyle.diet.typical_foods_eaten || [])
      : [],
  )

  function addMeal() {
    meals.value = [
      ...meals.value,
      { meal: '', time: '00:00', foods_eaten: '' },
    ]
  }

  const removeMeal = (index: number) => {
    const temp = [...meals.value]
    temp.splice(index, 1)
    meals.value = temp
  }

  return (
    <FormSection header='Diet Questions'>
      <NumberInput
        name={'lifestyle.diet.meals_per_day'}
        label='How many meals does the patient eat per day?'
        value={lifestyle?.diet?.meals_per_day}
        min={0}
      />

      <div>
        When and what does the patient usually eat over the course of a typical
        day?
      </div>
      {meals.value.map((meal, index) => (
        <RemoveRow
          onClick={() => {
            removeMeal(index)
          }}
        >
          <FormRow>
            <SelectWithOptions
              label='Select meal'
              name={`lifestyle.diet.typical_foods_eaten.${index}`}
              options={MEAL_TYPES}
              value={meals.value[index].meal}
            />
            <TextInput
              name={`lifestyle.diet.typical_foods_eaten_content.${index}`}
              label='Content of meal'
              value={meals.value[index].foods_eaten}
            />
            <input
              type='time'
              name={`lifestyle.diet.typical_foods_eaten_time.${index}`}
              label='Time of meal'
              value={meals.value[index].time}
            />
          </FormRow>
        </RemoveRow>
      ))}
      <AddRow
        text='Add meal or snack'
        onClick={addMeal}
      />

      <Select
        name='lifestyle.diet.eating_takeout_fast_food_frequency'
        label='How often does the patient eat takeout, restaurant meals, or fast food?'
      >
        {DIET_FREQUENCIES.map((freq) => <option value={freq}>{freq}</option>)}
      </Select>

      <Select
        name='lifestyle.diet.eating_home_cooked_frequency'
        label='How often does the patient eat home cooked meals?'
      >
        {DIET_FREQUENCIES.map((freq) => <option value={freq}>{freq}</option>)}
      </Select>

      <LabelledListboxMulti
        name='lifestyle.diet.reasons_for_eating_other_than_hunger'
        label='Does the patient ever eat for reasons other than hunger?'
        options={EATING_REASONS}
        selected={lifestyle?.diet?.reasons_for_eating_other_than_hunger || []}
      />

      <LabelledListboxMulti
        name='lifestyle.diet.staple_foods'
        label='Which foods does the patient eat almost on a daily basis or as staple foods?'
        options={STAPLE_FOODS}
        selected={staple_foods.value}
        onChange={(selected) => staple_foods.value = selected}
      />

      <LabelledListboxMulti
        name='lifestyle.diet.drinks'
        label='How often does the patient have any of the following drinks?'
        options={DRINKS}
        selected={drinks.value.map(({ name }) => name)}
        onChange={(selected) => {
          drinks.value = selected.map((name) => {
            const matching_drink = drinks.value.find((drink) =>
              drink.name === name
            )
            return matching_drink || {
              name: name,
              frequency: DIET_FREQUENCIES[0],
            }
          })
        }}
      />
      {drinks.value.map((drink, index) => (
        <SelectWithOptions
          label={drink.name}
          name={`lifestyle.diet.drink_frequencies.${index}`}
          value={drink.frequency}
          options={DIET_FREQUENCIES}
        />
      ))}

      <LabelledListboxMulti
        name='lifestyle.diet.non_meats'
        label='How often does the patient eat any of the following foods?'
        options={NON_MEATS}
        selected={non_meats.value.map(({ name }) => name)}
        onChange={(selected) => {
          non_meats.value = selected.map((name) => {
            const matching_non_meat = non_meats.value.find((non_meat) =>
              non_meat.name === name
            )
            return matching_non_meat || {
              name: name,
              frequency: DIET_FREQUENCIES[0],
            }
          })
        }}
      />
      {non_meats.value.map((non_meat, index) => (
        <SelectWithOptions
          label={non_meat.name}
          name={`lifestyle.diet.non_meat_frequencies.${index}`}
          value={non_meat.frequency}
          options={DIET_FREQUENCIES}
        />
      ))}

      <LabelledListboxMulti
        name='lifestyle.diet.meats'
        label='How often does the patient eat the following meats?'
        options={MEATS}
        selected={meats.value.map(({ name }) => name)}
        onChange={(selected) => {
          meats.value = selected.map((name) => {
            const matching_meat = meats.value.find((meat) => meat.name === name)
            return matching_meat || {
              name: name,
              frequency: DIET_FREQUENCIES[0],
            }
          })
        }}
      />
      {meats.value.map((meat, index) => (
        <SelectWithOptions
          label={meat.name}
          name={`lifestyle.diet.meat_frequencies.${index}`}
          value={meat.frequency}
          options={DIET_FREQUENCIES}
        />
      ))}

      <LabelledListboxMulti
        name='lifestyle.diet.junk_foods'
        label='How often does the patient eat any of the following foods?'
        options={JUNK_FOOD}
        selected={junk_foods.value.map(({ name }) => name)}
        onChange={(selected) => {
          junk_foods.value = selected.map((name) => {
            const matching_junk_food = junk_foods.value.find((junk_food) =>
              junk_food.name === name
            )
            return matching_junk_food || {
              name: name,
              frequency: DIET_FREQUENCIES[0],
            }
          })
        }}
      />
      {junk_foods.value.map((junk_food, index) => (
        <SelectWithOptions
          name={`lifestyle.diet.junk_food_frequencies.${index}`}
          label={junk_food.name}
          value={junk_food.frequency}
          options={DIET_FREQUENCIES}
        />
      ))}

      <LabelledListboxMulti
        name='lifestyle.diet.fats_used_in_cooking'
        label='Which fats does the patient usually add during cooking?'
        options={FATS}
        selected={lifestyle?.diet?.fats_used_in_cooking || []}
      />

      <LabelledListboxMulti
        name='lifestyle.diet.past_special_diets'
        label='Has the patient been on any special diets?'
        options={SPECIAL_DIETS}
        selected={lifestyle?.diet?.past_special_diets || []}
      />

      <LabelledListboxMulti
        name='lifestyle.diet.supplements_taken'
        label='Does the patient take any supplements?'
        options={SUPPLEMENTS}
        selected={lifestyle?.diet?.supplements_taken || []}
      />

      <CheckboxGridItem
        name='lifestyle.diet.patient_skips_meals'
        label='Does the patient skip meals?'
        checked={lifestyle?.diet?.patient_skips_meals}
      />

      <CheckboxGridItem
        name='lifestyle.diet.patient_travels_often'
        label='Does the patient travel often?'
        checked={lifestyle?.diet?.patient_travels_often}
      />

      <div>Does the patient have the following eating habits:</div>
      <CheckboxGridItem
        name='lifestyle.diet.eats_five_portions_of_fruits_vegetables_daily'
        label='Five portions/handfuls of fruits and vegetables every day?'
        checked={lifestyle?.diet?.eats_five_portions_of_fruits_vegetables_daily}
      />

      <CheckboxGridItem
        name='lifestyle.diet.eats_four_varieties_of_fruit_weekly'
        label='Four different varieties of fruit every week?'
        checked={lifestyle?.diet?.eats_four_varieties_of_fruit_weekly}
      />

      <CheckboxGridItem
        name='lifestyle.diet.eats_four_varieties_of_vegetables_weekly'
        label='Four different varieties of vegetables every week?'
        checked={lifestyle?.diet?.eats_four_varieties_of_vegetables_weekly}
      />

      <CheckboxGridItem
        name='lifestyle.diet.chooses_low_fat_products'
        label='Choose low-fat products when available?'
        checked={lifestyle?.diet?.chooses_low_fat_products}
      />

      <CheckboxGridItem
        name='lifestyle.diet.chooses_baked_steamed_grilled_rather_than_fried'
        label='Choose baked/steamed or grilled food rather than fried when available?'
        checked={lifestyle?.diet
          ?.chooses_baked_steamed_grilled_rather_than_fried}
      />

      <CheckboxGridItem
        name='lifestyle.diet.chooses_lean_cuts_or_removes_visible_fat'
        label='Opt for lean cuts or remove visible fat?'
        checked={lifestyle?.diet?.chooses_lean_cuts_or_removes_visible_fat}
      />

      <CheckboxGridItem
        name='lifestyle.diet.eats_oily_fish'
        label='Eat oily types of fish?'
        checked={lifestyle?.diet?.eats_oily_fish}
      />

      <CheckboxGridItem
        name='lifestyle.diet.bases_meals_around_starchy_foods'
        label='Base main meals around starchy foods?'
        checked={lifestyle?.diet?.bases_meals_around_starchy_foods}
      />

      <CheckboxGridItem
        name='lifestyle.diet.regularly_chooses_wholemeal_bread'
        label='Regularly choose wholemeal bread/rolls when available?'
        checked={lifestyle?.diet?.regularly_chooses_wholemeal_bread}
      />

      <CheckboxGridItem
        name='lifestyle.diet.regularly_eats_wholegrain_cereals_without_added_sugar'
        label='Regularly eat wholegrain cereals with no added sugar?'
        checked={lifestyle?.diet
          ?.regularly_eats_wholegrain_cereals_without_added_sugar}
      />

      <CheckboxGridItem
        name='lifestyle.diet.regularly_eats_pulses'
        label='Regularly eat pulses/beans/lentils?'
        checked={lifestyle?.diet?.regularly_eats_pulses}
      />

      <CheckboxGridItem
        name='lifestyle.diet.regularly_eats_snacks_throughout_day'
        label='Regularly eat sweet or savoury snacks at any time of the day?'
        checked={lifestyle?.diet?.regularly_eats_snacks_throughout_day}
      />

      <CheckboxGridItem
        name='lifestyle.diet.regularly_adds_sugar_to_drinks'
        label='Regularly add sugar to their drinks?'
        checked={lifestyle?.diet?.regularly_adds_sugar_to_drinks}
      />

      <CheckboxGridItem
        name='lifestyle.diet.regularly_adds_salt_during_or_after_cooking'
        label='Regularly add salt during or after cooking?'
        checked={lifestyle?.diet?.regularly_adds_salt_during_or_after_cooking}
      />

      <CheckboxGridItem
        name='lifestyle.diet.regularly_drinks_sweet_fizzy_drinks'
        label='Regularly drink sweet fizzy drinks?'
        checked={lifestyle?.diet?.regularly_drinks_sweet_fizzy_drinks}
      />

      <CheckboxGridItem
        name='lifestyle.diet.drinks_plenty_of_fluids_regularly_throughout_day'
        label='Drink plenty of fluids at regular intervals during the day?'
        checked={lifestyle?.diet
          ?.drinks_plenty_of_fluids_regularly_throughout_day}
      />

      <CheckboxGridItem
        name='lifestyle.diet.skips_meals_more_than_once_a_week'
        label='Skip meals more than once a week?'
        checked={lifestyle?.diet?.skips_meals_more_than_once_a_week}
      />
    </FormSection>
  )
}
