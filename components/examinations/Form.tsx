import { JSX } from 'preact'
import { GENERAL_ASSESSMENTS_BY_IDENTIFIER } from '../../shared/general_assessments.ts'
import { ExaminationCategory } from './Category.tsx'
import { HiddenInput } from '../library/HiddenInput.tsx'
import {
  RenderedPatientExamination,
  RenderedPatientExaminationFinding,
} from '../../types.ts'

export function PatientExaminationForm({
  patient_examination,
  findings,
}: {
  patient_examination: RenderedPatientExamination
  findings: RenderedPatientExaminationFinding[]
}): JSX.Element {
  const assessment = GENERAL_ASSESSMENTS_BY_IDENTIFIER.get(
    patient_examination.examination_identifier,
  )
  if (!assessment) {
    return (
      <p>
        TODO Implement form for {patient_examination.examination_identifier}
      </p>
    )
  }
  return (
    <div className='flex content-between p-4'>
      <div className='sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6'>
        <HiddenInput
          name='patient_examination_id'
          value={patient_examination.patient_examination_id}
        />
        {assessment.categories.map((
          { category, subcategories, checklist },
        ) => (
          <ExaminationCategory
            key={category}
            patient_examination_href={patient_examination.href}
            category={category}
            subcategories={subcategories}
            checklist={checklist}
            findings={findings}
          />
        ))}
      </div>
    </div>
  )
}
