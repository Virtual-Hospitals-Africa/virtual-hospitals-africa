import { PatientProfilePage } from './_middleware.tsx'

export default PatientProfilePage(
  'Review',
  function ReviewPage(_req, _ctx) {
    return <h1>Hello from review</h1>
  },
)
