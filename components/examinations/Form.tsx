import { JSX } from 'preact'
import { RenderedPatientExamination } from '../../types.ts'
import { HEAD_TO_TOE_ASSESSMENTS_BY_EXAMINATION_NAME } from '../../shared/examinations.ts'
import { ExaminationCategory } from './Category.tsx'
import { assert } from 'std/assert/assert.ts'

export function PatientExaminationForm({
  patient_examination,
}: {
  patient_examination: RenderedPatientExamination
}): JSX.Element {
  const assessment = HEAD_TO_TOE_ASSESSMENTS_BY_EXAMINATION_NAME.get(
    patient_examination.examination_name,
  )
  if (!assessment) {
    return <p>TODO Imlement form for {patient_examination.examination_name}</p>
  }
  assert(
    assessment,
    `No head to toe assessment for ${patient_examination.examination_name}`,
  )
  return (
    <div className='flex content-between p-4'>
      <div className='sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6'>
        {assessment.categories.map((
          { category, subcategories, checklist },
        ) => (
          <ExaminationCategory
            key={category}
            patient_examination_href={patient_examination.href}
            category={category}
            subcategories={subcategories}
            checklist={checklist}
            findings={patient_examination.findings}
          />
        ))}
      </div>
    </div>
  )
}
