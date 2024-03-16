import { JSX } from 'preact'
import { ASSESSMENTS, DIAGNOSTIC_TESTS } from '../../shared/examinations.ts'
// import { LabelledListbox } from '../form/Listbox.tsx'

export function NewExaminationForm({
  available_diagnostic_tests,
}: {
  available_diagnostic_tests: {
    diagnostic_test: string
  }[]
}): JSX.Element {
  return (
    <>
      // {ASSESSMENTS}
      // {available_diagnostic_tests}
    </>
  )

  // return <LabelledListbox />
}
