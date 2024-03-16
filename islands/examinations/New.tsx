import { JSX } from 'preact'
import { ASSESSMENTS, DIAGNOSTIC_TESTS } from '../../shared/examinations.ts'
import { LabelledListboxMulti } from '../form/Listbox.tsx'
import { Examination } from '../../shared/examinations.ts'
import partition from '../../util/partition.ts'

export function NewExaminationForm({
  recommended_examinations,
  selected_examinations,
  available_diagnostic_tests,
}: {
  recommended_examinations: Examination[]
  selected_examinations: Examination[]
  available_diagnostic_tests: {
    diagnostic_test: string
  }[]
}): JSX.Element {
  const [diagnostics_available, diagnostics_requiring_order] = partition(
    DIAGNOSTIC_TESTS,
    (test) =>
      available_diagnostic_tests.some(({ diagnostic_test }) =>
        diagnostic_test === test
      ),
  )

  const selected_assessments = ASSESSMENTS.filter((assessment) =>
    selected_examinations.includes(assessment)
  )
  const selected_diagnostics = DIAGNOSTIC_TESTS.filter((test) =>
    selected_examinations.includes(test) && diagnostics_available.includes(test)
  )
  const selected_orders = DIAGNOSTIC_TESTS.filter((test) =>
    selected_examinations.includes(test) &&
    diagnostics_requiring_order.includes(test)
  )

  return (
    <div className='flex flex-col gap-2'>
      <LabelledListboxMulti
        label='Assessments'
        name='assessments'
        selected={selected_assessments}
        options={ASSESSMENTS.map((name) => ({
          id: name,
          name,
          disabled: recommended_examinations.includes(name),
        }))}
      />
      {!!diagnostics_available.length && (
        <LabelledListboxMulti
          label='Diagnostic Tests Available at this Facility'
          name='diagnostic_tests_at_facility'
          selected={selected_diagnostics}
          options={diagnostics_available.map((name) => ({
            id: name,
            name,
            disabled: recommended_examinations.includes(name),
          }))}
        />
      )}
      {!!diagnostics_requiring_order.length && (
        <LabelledListboxMulti
          label='Diagnostic Tests to Order'
          name='diagnostic_test_orders'
          selected={selected_orders}
          options={diagnostics_requiring_order.map((name) => ({
            id: name,
            name,
            disabled: recommended_examinations.includes(name),
          }))}
        />
      )}
    </div>
  )
}
