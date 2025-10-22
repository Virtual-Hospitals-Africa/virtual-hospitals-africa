import { ExaminationPage } from './_middleware.tsx'

export default ExaminationPage(function NoExaminationsPage(_ctx) {
  return (
    <div>
      <p>No recommended examinations based on the patient profile.</p>
      <p>Either add examinations or continue to proceed</p>
    </div>
  )
})
