import { AgeDetermination } from '../types.ts'

export default function randomDateOfBirth(age_determination: AgeDetermination = 'adult') {
  const now = new Date()

  const year_bounds = yearBounds()

  // Generate random age within range (in years, as a decimal)
  const age_years = year_bounds.min + Math.random() * (year_bounds.max - year_bounds.min)

  // Calculate date of birth by subtracting age from current date
  const milliseconds_per_year = 365.25 * 24 * 60 * 60 * 1000
  const date_of_birth = new Date(now.getTime() - age_years * milliseconds_per_year)

  return date_of_birth.toISOString().slice(0, 10)

  function yearBounds() {
    switch (age_determination) {
      case 'adult':
        return { min: 12, max: 80 }
      case 'older child':
        return { min: 3, max: 11.99 }
      case 'younger child':
        return { min: 0.01, max: 2.99 }
    }
  }
}
