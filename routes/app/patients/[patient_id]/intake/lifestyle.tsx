import { LoggedInHealthWorkerHandler } from '../../../../../types.ts'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import Buttons from '../../../../../islands/form/buttons.tsx'
import { assertOr400 } from '../../../../../util/assertOr.ts'
import {
  assertAgeYearsKnown,
  IntakeContext,
  IntakeLayout,
  upsertPatientAndRedirect,
} from './_middleware.tsx'
import * as patient_lifestyle from '../../../../../db/models/patient_lifestyle.ts'
import { assert } from 'std/assert/assert.ts'
import { LifestyleForm } from '../../../../../islands/LifestyleForm.tsx'
import zip from '../../../../../util/zip.ts'

// deno-lint-ignore no-explicit-any
type LifestyleFormValues = Record<string, any> // TODO @debruler type this

function assertIsLifestyle(
  patient: unknown,
): asserts patient is LifestyleFormValues {
  assertOr400(isObjectLike(patient))
  assertOr400(isObjectLike(patient.lifestyle))
  if (isObjectLike(patient.lifestyle.exercise)) {
    if (patient.lifestyle.exercise.currently_exercises) {
      assertOr400(Array.isArray(patient.lifestyle.exercise.physical_activities))
      assertOr400(
        Array.isArray(patient.lifestyle.exercise.physical_activity_frequencies),
      )
      const physical_activities = Array.from(
        zip(
          patient.lifestyle.exercise.physical_activities,
          patient.lifestyle.exercise.physical_activity_frequencies,
        ),
      ).map(([name, frequency]) => ({ name, frequency }))

      patient.lifestyle.exercise.physical_activities = physical_activities
      delete patient.lifestyle.exercise.physical_activity_frequencies
    }
    if (patient.lifestyle.exercise.currently_exercises) {
      assertOr400(Array.isArray(patient.lifestyle.exercise.sports))
      assertOr400(Array.isArray(patient.lifestyle.exercise.sport_frequencies))
      const sports = Array.from(
        zip(
          patient.lifestyle.exercise.sports,
          patient.lifestyle.exercise.sport_frequencies,
        ),
      ).map(([name, frequency]) => ({ name, frequency }))

      patient.lifestyle.exercise.sports = sports
      delete patient.lifestyle.exercise.sport_frequencies
    }
  }

  if (isObjectLike(patient.lifestyle.diet)) {
    if (patient.lifestyle.diet.drinks) {
      assertOr400(Array.isArray(patient.lifestyle.diet.drinks))
      assertOr400(Array.isArray(patient.lifestyle.diet.drink_frequencies))
      const drinks = Array.from(
        zip(
          patient.lifestyle.diet.drinks,
          patient.lifestyle.diet.drink_frequencies,
        ),
      ).map(([name, frequency]) => ({ name, frequency }))
      patient.lifestyle.diet.drinks = drinks
      delete patient.lifestyle.diet.drink_frequencies
    }

    if (patient.lifestyle.diet.non_meats) {
      assertOr400(Array.isArray(patient.lifestyle.diet.non_meats))
      assertOr400(Array.isArray(patient.lifestyle.diet.non_meat_frequencies))
      const non_meats = Array.from(
        zip(
          patient.lifestyle.diet.non_meats,
          patient.lifestyle.diet.non_meat_frequencies,
        ),
      ).map(([name, frequency]) => ({ name, frequency }))
      patient.lifestyle.diet.non_meats = non_meats
      delete patient.lifestyle.diet.non_meat_frequencies
    }

    if (patient.lifestyle.diet.meats) {
      assertOr400(Array.isArray(patient.lifestyle.diet.meats))
      assertOr400(Array.isArray(patient.lifestyle.diet.meat_frequencies))
      const meats = Array.from(
        zip(
          patient.lifestyle.diet.meats,
          patient.lifestyle.diet.meat_frequencies,
        ),
      ).map(([name, frequency]) => ({ name, frequency }))
      patient.lifestyle.diet.meats = meats
      delete patient.lifestyle.diet.meat_frequencies
    }

    if (patient.lifestyle.diet.junk_foods) {
      assertOr400(Array.isArray(patient.lifestyle.diet.junk_foods))
      assertOr400(Array.isArray(patient.lifestyle.diet.junk_food_frequencies))
      const junk_foods = Array.from(
        zip(
          patient.lifestyle.diet.junk_foods,
          patient.lifestyle.diet.junk_food_frequencies,
        ),
      ).map(([name, frequency]) => ({ name, frequency }))
      patient.lifestyle.diet.junk_foods = junk_foods
      delete patient.lifestyle.diet.junk_food_frequencies
    }

    if (patient.lifestyle.diet.typical_foods_eaten) {
      assertOr400(Array.isArray(patient.lifestyle.diet.typical_foods_eaten))
      assertOr400(
        Array.isArray(patient.lifestyle.diet.typical_foods_eaten_content),
      )
      assertOr400(
        Array.isArray(patient.lifestyle.diet.typical_foods_eaten_time),
      )
      const meal_and_content = Array.from(
        zip(
          patient.lifestyle.diet.typical_foods_eaten,
          patient.lifestyle.diet.typical_foods_eaten_content,
        ),
      ).map(([meal, foods_eaten]) => ({ meal, foods_eaten }))

      const typical_foods_eaten = Array.from(
        zip(
          meal_and_content,
          patient.lifestyle.diet.typical_foods_eaten_time,
        ),
      ).map(([meal_and_content, time]) => ({
        meal: meal_and_content.meal,
        foods_eaten: meal_and_content.foods_eaten,
        time: time,
      }))
      patient.lifestyle.diet.typical_foods_eaten = typical_foods_eaten
      delete patient.lifestyle.diet.typical_foods_eaten_content
      delete patient.lifestyle.diet.typical_foods_eaten_time
    }
  }

  if (!patient.lifestyle.substance_use) return

  assertOr400(isObjectLike(patient.lifestyle.substance_use))
  if (patient.lifestyle.substance_use?.has_ever_used_substance) {
    assertOr400(
      Array.isArray(patient.lifestyle.substance_use.substances_used_names),
    )
    assertOr400(Array.isArray(patient.lifestyle.substance_use.substances_used))
    const substance_use_data = Array.from(zip(
      patient.lifestyle.substance_use.substances_used_names,
      patient.lifestyle.substance_use.substances_used,
    )).map(([name, substance]) => ({ name, ...substance }))

    patient.lifestyle.substance_use.substances_used = substance_use_data
    delete patient.lifestyle.substance_use.substances_used_names
  }
}

export const handler: LoggedInHealthWorkerHandler<IntakeContext> = {
  async POST(req, ctx) {
    const patient = await parseRequestAsserts(
      ctx.state.trx,
      req,
      assertIsLifestyle,
    )

    return upsertPatientAndRedirect(ctx, { ...patient })
  },
}

export default async function LifestylePage(
  _req: Request,
  ctx: IntakeContext,
) {
  assert(!ctx.state.is_review)
  const { patient, trx } = ctx.state
  const patient_id = patient.id

  const age_years = assertAgeYearsKnown(ctx)

  return (
    <IntakeLayout ctx={ctx}>
      {/* call to database for lifestyle patient information */}
      <LifestyleForm
        age_years={age_years}
        lifestyle={await patient_lifestyle.get(trx, { patient_id })}
      />
      <hr className='my-2' />
      <Buttons submitText='Next Step' />
    </IntakeLayout>
  )
}
