import { JSX } from 'preact'
import { ASSESSMENTS, DIAGNOSTIC_TESTS } from '../../shared/examinations.ts'
import { LabelledListbox } from '../form/Listbox.tsx'
import Badge from '../../components/library/Badge.tsx'
import { Examination } from '../../shared/examinations.ts'

export function NewExaminationForm({
  selected_examinations,
  available_diagnostic_tests,
}: {
  selected_examinations: Examination[]
  available_diagnostic_tests: {
    diagnostic_test: string
  }[]
}): JSX.Element {
  const assessment_options = ASSESSMENTS.map((assessment) => ({
    id: assessment,
    name: assessment,
  }))

  const diagnostic_test_options = DIAGNOSTIC_TESTS.map((test) => {
    const is_available = available_diagnostic_tests.some((
      { diagnostic_test },
    ) => diagnostic_test === test)
    return {
      id: test,
      name: test,
      display: (
        <div className='flex justify-between'>
          <span>{test}</span>
          {is_available || <Badge content='Place Order' color='yellow' />}
        </div>
      ),
    }
  })

  return (
    <LabelledListbox
      name='examinations'
      label='Examinations to add'
      selected={selected_examinations}
      options={[
        ...assessment_options,
        ...diagnostic_test_options,
      ]}
    />
  )
}
