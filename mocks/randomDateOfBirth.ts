import { AgeDetermination } from '../types.ts'

export default function randomDateOfBirth(age_determination?: AgeDetermination) {
  const now = new Date()

  if (!age_determination) {
    // Default behavior: random date between 1950 and 2005
    const start = new Date(1950, 0, 1)
    const end = new Date(2005, 0, 1)
    const date = new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime()),
    )
    return date.toISOString().slice(0, 10)
  }

  let minYears: number
  let maxYears: number

  switch (age_determination) {
    case 'adult':
      // >= 12 years old
      minYears = 12
      maxYears = 80 // reasonable upper bound
      break
    case 'older child':
      // >= 3 and < 12 years old
      minYears = 3
      maxYears = 11.99
      break
    case 'younger child':
      // < 3 years old
      minYears = 0.01
      maxYears = 2.99
      break
  }

  // Generate random age within range (in years, as a decimal)
  const ageYears = minYears + Math.random() * (maxYears - minYears)

  // Calculate date of birth by subtracting age from current date
  const millisecondsPerYear = 365.25 * 24 * 60 * 60 * 1000
  const dateOfBirth = new Date(now.getTime() - ageYears * millisecondsPerYear)

  return dateOfBirth.toISOString().slice(0, 10)
}
