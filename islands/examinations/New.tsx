import { JSX } from 'preact'
import { ASSESSMENTS } from '../../shared/examinations.ts'

export function NewExaminationForm({
  available_diagnostic_tests,
}: {
  available_diagnostic_tests: {
    diagnostic_test: string
  }[]
}): JSX.Element {
  return (
    <div>
      {ASSESSMENTS}
      {available_diagnostic_tests}
    </div>
  )
}
