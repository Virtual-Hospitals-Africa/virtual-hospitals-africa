
export type School =
  | {
    status: 'never attended'
  }
  | {
    status: 'in school'
    current: CurrentSchool
  }
  | {
    status: 'stopped school'
    past: PastSchool
  }
  | {
    status: 'adult in school'
    education_level: string
  }
  | {
    status: 'adult stopped school'
    education_level: string
    reason: string
    desire_to_return: Existence
  }

export type CurrentSchool = {
  grade: string
  grades_dropping_reason: string | null
  happy: Existence | null
  inappropriate_reason: string | null
}

export type PastSchool = {
  stopped_last_grade: string
  stopped_reason: string
}

export type Job = {
  happy: Existence
  descendants_employed: Existence
  require_assistance: Existence
  profession: string
  work_satisfaction: string
}

export type Occupation = {
  school: School
  sport?: Existence
  job?: Job | null
}

export type PatientOccupation = {
  patient_id: string
  occupation: Occupation
}

export type Question = {
  name?: string
  label: string
  value?: boolean
}

export type Lifestyle = {
  sexual_activity: SexualActivity | null
  alcohol: Alcohol | null
  smoking: Smoking | null
  exercise: Exercise | null
  diet: Diet | null
  substance_use: SubstanceUse | null
} //fix type names

export type SexualActivity =
  | {
    ever_been_sexually_active: 'No' | 'Unknown' | null
  }
  | {
    ever_been_sexually_active: 'Yes'
    currently_sexually_active?: Maybe<Existence>
    first_encounter?: Maybe<number>
    current_sexual_partners?: Maybe<number>
    attracted_to?: Maybe<string>
    has_traded_sex_for_favors?: Maybe<Existence>
    had_sex_after_drugs?: Maybe<Existence>
    recently_treated_for_stis?: Maybe<Existence>
    recently_hiv_tested?: Maybe<Existence>
    know_partner_hiv_status?: Maybe<Existence>
    partner_hiv_status?: Maybe<Existence>
  }

export type Alcohol =
  | {
    has_ever_drank: 'No' | 'Unknown' | null
  }
  | {
    has_ever_drank: 'Yes'
    currently_drinks?: Existence | null
    binge_drinking?: Existence | null
    drawn_to_cut_down?: Existence | null
    annoyed_by_critics?: Existence | null
    eye_opener?: Existence | null
    guilty?: Existence | null
    missed_work?: Existence | null
    criticized?: Existence | null
    arrested?: Existence | null
    attempted_to_stop?: Existence | null
    withdrawal?: Existence | null
    quit_for_six_or_more_months?: Existence | null
    abstinence_length_months?: number | null
    first_drink?: number | null
    years_drinking?: number | null
    number_drinks_per_sitting?: number | null
    alcohol_products_used?: string[] | null
  }

export type Smoking =
  | {
    has_ever_smoked: 'No' | 'Unknown' | null
  }
  | {
    has_ever_smoked: 'Yes'
    currently_smokes?: Maybe<Existence>
    first_smoke_age?: number
    weekly_smokes?: number | null
    number_of_products?: number | null
    felt_to_cutdown?: Existence | null
    annoyed_by_criticism?: Existence | null
    guilty?: Existence | null
    forbidden_place?: Existence | null
    attempt_to_quit?: Existence | null
    quit_more_than_six_months?: Existence | null
    quit_smoking_years?: number | null
    tobacco_products_used?: string[] | null
  }

export type SubstanceUse =
  | {
    has_ever_used_substance: 'No' | 'Unknown' | null
  }
  | {
    has_ever_used_substance: 'Yes'
    substances_used: {
      name: string
      injected_substance: Existence | null
      annoyed_by_criticism: Existence | null
      attempt_to_stop: Existence | null
      withdrawal_symptoms: Existence | null
      quit_more_than_six_months: Existence | null
      quit_substance_use_years: number | null
      first_use_age: number | null
      used_regularly_years: number | null
      times_used_in_a_week: number | null
    }[]
  }

export type Exercise =
  | {
    currently_exercises: 'No' | 'Unknown' | null
  }
  | {
    currently_exercises: 'Yes'
    physical_activities: {
      name: string
      frequency: string
    }[]
    sports: {
      name: string
      frequency: string
    }[]
    types_of_exercises?: string[]
    physical_injuries_or_disability: {
      disabilities: string[]
      musculoskeletal_injuries: string[]
    }
    limitations: {
      limits: string[]
      structural_conditions: string[]
      medical_conditions: string[]
    }
  }

export type Diet = {
  meals_per_day: number
  typical_foods_eaten: Meal[]
  eating_takeout_fast_food_frequency: string
  eating_home_cooked_frequency: string
  patient_skips_meals: boolean
  patient_travels_often: boolean
  reasons_for_eating_other_than_hunger: string[]
  fats_used_in_cooking: string[]
  staple_foods: string[]
  non_meats: FoodFrequency[]
  drinks: FoodFrequency[]
  meats: FoodFrequency[]
  junk_foods: FoodFrequency[]
  past_special_diets: string[]
  supplements_taken: string[]
  eats_five_portions_of_fruits_vegetables_daily: boolean
  eats_four_varieties_of_fruit_weekly: boolean
  eats_four_varieties_of_vegetables_weekly: boolean
  chooses_low_fat_products: boolean
  chooses_baked_steamed_grilled_rather_than_fried: boolean
  chooses_lean_cuts_or_removes_visible_fat: boolean
  eats_oily_fish: boolean
  bases_meals_around_starchy_foods: boolean
  regularly_chooses_wholemeal_bread: boolean
  regularly_eats_wholegrain_cereals_without_added_sugar: boolean
  regularly_eats_pulses: boolean
  regularly_eats_snacks_throughout_day: boolean
  regularly_adds_sugar_to_drinks: boolean
  regularly_adds_salt_during_or_after_cooking: boolean
  regularly_drinks_sweet_fizzy_drinks: boolean
  drinks_plenty_of_fluids_regularly_throughout_day: boolean
  skips_meals_more_than_once_a_week: boolean
}

export type FoodFrequency = {
  name: string
  frequency: DietFrequency
}

export type Meal = {
  meal: string
  time: string
  foods_eaten: string
}

export type PatientLifestyle = {
  patient_id: string
  lifestyle: Lifestyle
}

export type Allergy = {
  id: string
  snomed_concept_id: string
  name: string
}